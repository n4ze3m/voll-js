import { Blob } from "buffer";
import { VollResponse as IVollResponse } from "../types/http";
import { StatusCode } from "@/types/stats-code";
import {
    parse as parseCookies,
    serialize as serializeCookie,
    SerializeOptions,
} from "cookie";
import { millisecondsToSeconds } from "@/utils/ms-to-sec";
import { sign, unsign } from 'cookie-signature';
import { VollSerializeOptions } from "@/types/cookie";

export class VollResponse implements IVollResponse {
    private response: Response;
    private poweredBy: boolean = true;
    private customHeaders: Record<string, string> = {};
    private cookieSecret: string = "voll-secret-key";
    private cookies: Map<string, { value: string; options?: SerializeOptions }> =
        new Map();
    body: any;
    headers: any;
    ok: boolean = true;
    status: number = 200;
    statusText: string = "OK";
    type: any = "default";
    url: string = "";
    redirected: boolean = false;
    bodyUsed: boolean = false;
    trailer: Promise<Headers> = Promise.resolve(
        new Headers() as unknown as Headers
    );

    constructor() {
        this.response = new Response();
    }
    clone(): Response {
        return this.response.clone();
    }
    arrayBuffer(): Promise<ArrayBuffer> {
        return this.response.arrayBuffer();
    }
    blob(): Promise<Blob> {
        return this.response.blob();
    }
    formData(): Promise<FormData> {
        return this.response.formData();
    }

    text(): Promise<string> {
        return this.response.text();
    }

    signedCookie(name: string, value: string | number | object, options?: SerializeOptions): this {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        const jsonValue = typeof value !== 'string' ? `j:${stringValue}` : stringValue;
        const signedValue = 's:' + sign(jsonValue, this.cookieSecret);
        return this.cookie(name, signedValue, options);
    }

    cookie(
        name: string,
        value: string | number | object,
        options?: VollSerializeOptions
    ): this {
        let stringValue =
            typeof value === "string" ? value : JSON.stringify(value);

        if (options?.signed) {
            const jsonValue = typeof value !== 'string' ? `j:${stringValue}` : stringValue;
            stringValue = 's:' + sign(jsonValue, this.cookieSecret);
            options.signed = undefined;
        }

        const cookieOptions = { path: "/", ...options };
        /**
         * Convert maxAge from milliseconds to seconds and handle special case for 1 second
         * If maxAge is present in cookieOptions, convert it from milliseconds to seconds
         * If maxAge equals 1 second, set an explicit expires date 1 second in the future
         */
        if (cookieOptions.maxAge) {
            cookieOptions.maxAge = millisecondsToSeconds(cookieOptions.maxAge);
            if (cookieOptions.maxAge === 1) {
                cookieOptions.expires = new Date(Date.now() + 1000);
            }
        }
        this.cookies.set(name, { value: stringValue, options: cookieOptions });
        const cookieHeaders = Array.from(this.cookies.entries()).map(
            ([cookieName, cookieData]) => {
                return serializeCookie(
                    cookieName,
                    cookieData.value,
                    cookieData.options
                );
            }
        );
        this.customHeaders["Set-Cookie"] = cookieHeaders.join(",");
        return this;
    }

    setCookieSecret(secret: string): this {
        this.cookieSecret = secret;
        return this;
    }
    clearCookie(name: string, options?: VollSerializeOptions): this {
        return this.cookie(name, "", { ...options, expires: new Date(0) });
    }

    disablePoweredBy(): this {
        this.poweredBy = false;
        return this;
    }
    private addHeaders(headers: Record<string, string>): Record<string, string> {
        const allHeaders = { ...headers, ...this.customHeaders };
        if (this.poweredBy) {
            return { ...allHeaders, "X-Powered-By": "Voll" };
        }
        return allHeaders;
    }

    statusCode(code: StatusCode | number): this {
        this.response = new Response(null, {
            status: code,
            headers: this.addHeaders({}),
        });
        return this;
    }

    sendJson(data: any): Response {
        this.response = new Response(JSON.stringify(data), {
            headers: this.addHeaders({ "Content-Type": "application/json" }),
            status: this.response.status,
        });
        return this.response;
    }

    json(data: any): Response {
        this.response = new Response(JSON.stringify(data), {
            headers: this.addHeaders({ "Content-Type": "application/json" }),
            status: this.response.status,
        });
        return this.response;
    }

    send(data: string): Response {
        this.response = new Response(data, {
            headers: this.addHeaders({ "Content-Type": "text/plain" }),
            status: this.response.status,
        });
        return this.response;
    }

    sendSoap(data: string): Response {
        this.response = new Response(data, {
            headers: this.addHeaders({
                "Content-Type": "application/soap+xml",
            }),
            status: this.response.status,
        });

        return this.response;
    }

    sendStatus(code: number): Response {
        this.response = new Response(null, {
            headers: this.addHeaders({}),
            status: code,
        });

        return this.response;
    }

    getResponse(): Response {
        return this.response;
    }

    setHeader(name: string, value: string): this {
        this.customHeaders[name] = value;
        this.response = new Response(this.response.body, {
            headers: this.addHeaders({}),
            status: this.response.status,
        });
        return this;
    }
}
