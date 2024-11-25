import { SocketAddress } from "bun";
import { StatusCode } from "./stats-code";

/**
 * Extended Request interface with Voll.js specific properties
 */
export interface VollRequest extends Omit<Request, 'headers'> {
    /** URL parameters extracted from route pattern */
    params: Record<string, string>;
    /** Query string parameters parsed from URL */
    query: Record<string, string>;
    /** Request body data */
    body: any;
    /** Remote IP address of the client */
    ip?:  SocketAddress | null;
    
    headers: Record<string, string>;
}

/**
 * Extended Response interface with Voll.js helper methods
 */
export interface VollResponse extends Omit<Response, 'json'> {
    /**
     * Sets the HTTP status code for the response
     * @param code - HTTP status code
     */
    statusCode(code: StatusCode | number): this;

    /**
     * Sends a JSON response with proper content-type headers
     * @param data - Data to be serialized as JSON
     */
    sendJson(data: any): Response;

    /**
     * Sends a plain text response
     * @param data - String data to send
     */
    send(data: string): Response;

    /**
     * Sends a response with only a status code
     * @param code - HTTP status code
     */
    sendStatus(code: number): Response;

    /**
     * Sends a JSON response (alias for sendJson)
     * @param data - Data to be serialized as JSON
     */
    json(data: any): Response;
}

/**
 * Middleware next function type
 * Used to call the next middleware in chain
 */
export type VollNextFunction = () => Promise<void>;
