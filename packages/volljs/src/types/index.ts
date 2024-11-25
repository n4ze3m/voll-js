import type { VollRequest, VollResponse } from "./http";
import {  VollConfig } from "./config";

export interface VollOptions {
    routesDir?: string
    showRoutes?: boolean
    parseJson?: boolean
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD' | 'default'

export type RouteHandler = (req: VollRequest, res: VollResponse) => Response | Promise<Response>;

export type RouteHandlers = {
    [path: string]: {
        [method in HttpMethod]?: RouteHandler;
    } & {
        config?: VollConfig;
    }
};
