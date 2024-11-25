import { Blob } from "buffer";
import { VollResponse as IVollResponse } from "../types/http";
import { StatusCode } from "@/types/stats-code";

export class VollResponse implements IVollResponse {
    private response: Response;
    private poweredBy: boolean = true;
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

    private addPoweredByHeader(
        headers: Record<string, string>
    ): Record<string, string> {
        if (this.poweredBy) {
            return { ...headers, "X-Powered-By": "Voll" };
        }
        return headers;
    }

    statusCode(code: StatusCode | number): this {
        this.response = new Response(null, {
            status: code,
            headers: this.response.headers,
        });
        return this;
    }

    sendJson(data: any): Response {
        this.response = new Response(JSON.stringify(data), {
            headers: this.addPoweredByHeader({ "Content-Type": "application/json" }),
            status: this.response.status,
        });
        return this.response;
    }


    json(data: any): Response {
        this.response = new Response(JSON.stringify(data), {
            headers: this.addPoweredByHeader({ "Content-Type": "application/json" }),
            status: this.response.status,
        });
        return this.response;
    }

    send(data: string): Response {
        this.response =  new Response(data, {
            headers: this.addPoweredByHeader({ "Content-Type": "text/plain" }),
            status: this.response.status,
        });
        return this.response
    }

    sendSoap(data: string): Response {
        this.response =  new Response(data, {
            headers: this.addPoweredByHeader({
                "Content-Type": "application/soap+xml",
            }),
            status: this.response.status,
        });

        return this.response
    }

    sendStatus(code: number): Response {
        this.response =  new Response(null, {
            headers: this.addPoweredByHeader({}),
            status: code,
        });

        return this.response
    }

    getResponse(): Response {
        console.log(this.response)
        return this.response
    }
}
