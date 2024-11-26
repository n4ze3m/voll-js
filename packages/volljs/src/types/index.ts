import type { VollRequest, VollResponse } from "./http";
import { VollConfig } from "./config";


export type QueryParserFunction = (query: string) => Record<string, any>;

export type QueryParser = 'fast-querystring' | 'qs' | QueryParserFunction | false

export interface VollOptions {
    routesDir?: string
    showRoutes?: boolean
    parseJson?: boolean
    queryParser?: QueryParser;
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
