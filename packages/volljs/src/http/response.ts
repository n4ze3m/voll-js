import { Blob } from "buffer";
import { VollResponse as IVollResponse } from "../types/http";
import { StatusCode } from "@/types/stats-code";

export class VollResponse implements IVollResponse {
    private response: Response;
    private poweredBy: boolean = true;
    private customHeaders: Record<string, string> = {};
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

    constructor() {
        this.response = new Response();
    }

    disablePoweredBy(): this {
        this.poweredBy = false;
        return this;
    }

    private addHeaders(
        headers: Record<string, string>
    ): Record<string, string> {
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
        return this.response
    }

    sendSoap(data: string): Response {
        this.response = new Response(data, {
            headers: this.addHeaders({
                "Content-Type": "application/soap+xml",
            }),
            status: this.response.status,
        });

        return this.response
    }

    sendStatus(code: number): Response {
        this.response = new Response(null, {
            headers: this.addHeaders({}),
            status: code,
        });

        return this.response
    }

    getResponse(): Response {
        return this.response
    }

    setHeader(name: string, value: string): this {
        this.customHeaders[name] = value;
        this.response = new Response(this.response.body, {
            headers: this.addHeaders({}),
            status: this.response.status
        });
        return this;
    }
}