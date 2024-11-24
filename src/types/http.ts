
export interface VollRequest extends Request {
    params: Record<string, string>;
    query: Record<string, string>;
    body: any;
}

export interface VollResponse extends Omit<Response, 'json'> {
    statusCode(code: number): this;
    sendJson(data: any): Response;
    send(data: string): Response;
    sendStatus(code: number): Response;
    json(data: any): Response;
}
