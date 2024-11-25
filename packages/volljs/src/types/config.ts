import { HttpMethod } from ".";
import type { VollRequest, VollResponse } from "./http";
import { JSONSchemaType, } from "ajv"

export type SimpleSchema = JSONSchemaType<any> | Record<string, any>;

export interface RouteSchema {
    body?: JSONSchemaType<any> | Record<string, any>;
}

export type MiddlewareFunction = (
    req: VollRequest,
    res: VollResponse,
    next: () => Promise<void>
) => Promise<void>;

export interface RouteOptions {
    schema?: RouteSchema;
    middleware?: MiddlewareFunction[];
}

export type MethodOptions = {
    [key in HttpMethod]?: RouteOptions;
};

export type VollConfig = RouteOptions | MethodOptions;