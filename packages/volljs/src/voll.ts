import type { Server } from "bun";
import { join } from "path";
import { readdir } from "node:fs/promises";
import type { VollOptions, HttpMethod, RouteHandlers, QueryParser } from "./types";
import type { VollRequest } from "./types/http";
import { VollResponse } from "./http/response";
import { matchRoute } from "./utils/match-route";
import { buildRoutePath } from "./utils/build-route";
import { createConfigValidator } from "./validators/config";
import { BAD_REQUEST } from "./types/stats-code";
import { MiddlewareFunction } from "./types/config";
import fastQueryString from "fast-querystring"
import qs from "qs";
import { CookieManager } from "./http/cookie-manager";

export class Voll {
    private routesDir: string = "routes";
    private routes: RouteHandlers = {};
    private routeParams: Map<string, Set<string>> = new Map();
    private showRoutes: boolean = false;
    private parseJson: boolean = true;
    private server: Server | undefined;
    private isRoutesLoaded: boolean = false;
    private queryParser: QueryParser = "fast-querystring";
    private cookieSecret: string = "voll-secret-key";
    private cookieManager: CookieManager = new CookieManager()
    constructor(options?: VollOptions) {
        this.routesDir = options?.routesDir || this.routesDir;
        this.showRoutes = options?.showRoutes || false;
        this.parseJson = options?.parseJson || this.parseJson;
        this.queryParser = options?.queryParser ?? this.queryParser;
        this.cookieSecret = options?.cookieSecret || this.cookieSecret;
        if (this.cookieManager) {
            this.cookieManager.setCookieSecret(options?.cookieSecret || this.cookieSecret)
        }
    }

    private parseQuery(searchParams: string, queryParser?: QueryParser): Record<string, any> {
        if (!queryParser) return {};

        if (typeof queryParser === 'function') {
            return queryParser(searchParams);
        }

        if (queryParser === 'fast-querystring') {
            return fastQueryString.parse(searchParams);
        }

        if (queryParser === 'qs') {
            return qs.parse(searchParams);
        }

        return {};
    }
    private extractParams(route: string): string[] {
        const params: string[] = [];
        const matches = route.match(/\[(\w+)\]/g);
        if (matches) {
            matches.forEach((match) => {
                params.push(match.slice(1, -1));
            });
        }
        return params;
    }

    private validateParams(currentPath: string, params: string[]) {
        const parentPath = currentPath.split("/").slice(0, -1).join("/");
        if (parentPath && this.routeParams.has(parentPath)) {
            const parentParams = this.routeParams.get(parentPath)!;
            params.forEach((param) => {
                if (parentParams.has(param)) {
                    console.warn(
                        `Warning: Parameter "${param}" in route "${currentPath}" conflicts with parent route "${parentPath}"`
                    );
                }
            });
        }
    }

    private async loadRoutes(currentPath: string = "") {
        try {
            this.isRoutesLoaded = false
            const files = await readdir(join(this.routesDir, currentPath), {
                withFileTypes: true,
            });

            for (const file of files) {
                if (file.isDirectory()) {
                    const dirPath = join(currentPath, file.name).split("\\").join("/");
                    const dirParams = this.extractParams(file.name);
                    if (dirParams.length > 0) {
                        this.routeParams.set(dirPath, new Set(dirParams));
                        this.validateParams(dirPath, dirParams);
                    }
                    await this.loadRoutes(dirPath);
                    continue;
                }

                if (
                    ![".ts", ".tsx", ".js", ".jsx"].some((ext) => file.name.endsWith(ext))
                ) {
                    continue;
                }

                const routePath = buildRoutePath(currentPath, file.name);
                const fileParams = this.extractParams(file.name);
                if (fileParams.length > 0) {
                    this.routeParams.set(routePath, new Set(fileParams));
                    this.validateParams(routePath, fileParams);
                }

                const module = await import(
                    join(process.cwd(), this.routesDir, currentPath, file.name)
                );

                this.routes[routePath] = {};

                const methods: HttpMethod[] = [
                    "GET",
                    "POST",
                    "PUT",
                    "DELETE",
                    "PATCH",
                    "OPTIONS",
                    "HEAD",
                    "default",
                ];
                methods.forEach((method) => {
                    if (module[method]) {
                        this.routes[routePath][method] = module[method];
                    }
                });

                if (module.default) {
                    this.routes[routePath]["default"] = module.default;
                }
                if (module.config) {
                    this.routes[routePath]["config"] = module.config;
                }
            }
        } catch (error) {
            console.error("Error loading routes:", error);
        } finally {
            this.isRoutesLoaded = true
        }
    }
    private displayRoutes() {
        console.log("\n🚀 Available Routes:");
        console.log("==================");
        Object.entries(this.routes).forEach(([path, handlers]) => {
            Object.keys(handlers).forEach((method) => {
                if (method === 'config') return;
                const colors: { [key: string]: string } = {
                    'GET': '\x1b[32m',
                    'POST': '\x1b[33m',
                    'PUT': '\x1b[34m',
                    'DELETE': '\x1b[31m',
                    'PATCH': '\x1b[35m',
                    'OPTIONS': '\x1b[36m',
                    'HEAD': '\x1b[37m',
                    'default': '\x1b[32m'
                };
                const color = colors[method] || '\x1b[32m';
                const displayMethod = method === 'default' ? 'GET' : method;
                console.log(`  ${color}[${displayMethod}] ${path}\x1b[0m`);
            });
        });
        console.log("\n==================\n");
    }

    handle = async (request: Request, server?: Server) => {

        if (!this.isRoutesLoaded) {
            await this.loadRoutes();
        }

        const url = new URL(request.url);
        const pathname = url.pathname;
        const method = request.method as HttpMethod;
        let body = undefined;

        if (this.parseJson && request.body) {
            const contentType = request.headers.get("content-type");
            if (contentType?.includes("application/json")) {
                try {
                    body = await request.json();
                } catch (e) {
                    return new Response("Invalid JSON", { status: 400 });
                }
            }
        }

        const ip = server ? server.requestIP(request) : null;
        const cookies = this.cookieManager.parseCookies(
            request.headers.get('cookie') || ''
        );

        for (const route in this.routes) {
            let params = matchRoute(pathname, route);
            if (params) {
                const routeHandlers = this.routes[route];
                const handler = routeHandlers[method] || (method === "GET" ? routeHandlers["default"] : undefined);
                const handlerConfig = routeHandlers["config"];
                if (handler) {
                    let query = this.parseQuery(url.searchParams.toString(), this.queryParser);
                    if (handlerConfig) {
                        const schema =
                            //@ts-expect-error Please why :(
                            handlerConfig[method]?.schema || handlerConfig?.schema;
                        if (schema) {
                            const validator = createConfigValidator(schema);
                            if (schema?.queryParser) {
                                query = this.parseQuery(url.searchParams.toString(), schema.queryParser);
                            }
                            if (body && validator?.body) {
                                const result = validator.body?.(body);
                                if (!result.valid) {
                                    return new VollResponse()
                                        .statusCode(BAD_REQUEST)
                                        .sendJson({
                                            errors: result.errors,
                                            success: false,
                                        });
                                } else {
                                    body = result.data;
                                }
                            }

                            if (params && validator?.params) {
                                const result = validator.params?.(params);
                                if (!result.valid) {
                                    return new VollResponse()
                                        .statusCode(BAD_REQUEST)
                                        .sendJson({
                                            errors: result.errors,
                                            success: false,
                                        });
                                } else {
                                    params = result.data as any;
                                }
                            }

                            if (query && validator?.query) {
                                const result = validator.query?.(query);
                                if (!result.valid) {
                                    return new VollResponse()
                                        .statusCode(BAD_REQUEST)
                                        .sendJson({
                                            errors: result.errors,
                                            success: false,
                                        });
                                } else {
                                    query = result.data as any;
                                }
                            }
                        }
                    }
                    // get headers 
                    const vollRequest = {
                        ...request,
                        params,
                        query: query,
                        body: body,
                        ip: ip,
                        headers: request.headers as unknown as Record<string, string>,
                        cookies: cookies,
                    } as VollRequest;

                    const vollResponse = new VollResponse();
                    vollResponse.setCookieSecret(this.cookieSecret);
                    const executeMiddleware = async () => {
                        if (handlerConfig) {
                            const middlewareList: MiddlewareFunction[] =
                                //@ts-expect-error handlerConfig typing
                                handlerConfig[method]?.middleware || handlerConfig.middleware || [];
                            for (let i = 0; i < middlewareList.length; i++) {
                                const middleware = middlewareList[i];
                                let nextCalled = false;
                                await middleware(vollRequest, vollResponse, async () => {
                                    nextCalled = true;
                                });
                                if (!nextCalled) {
                                    const response = vollResponse.getResponse();
                                    if (response) {
                                        return response
                                    }
                                    console.warn("[Voll] Middleware stopped execution. No `next()` was called.");
                                    return new Response();
                                }
                            }
                        }
                        return handler(vollRequest, vollResponse);
                    };
                    try {
                        return await executeMiddleware();
                    } catch (error) {
                        console.error("[Voll] Internal Server Error:", error);
                        return new Response("Internal Server Error", { status: 500 });
                    }
                }
                return new Response("Method Not Allowed", { status: 405 });
            }
        }
        return new Response("Not Found", { status: 404 });
    }
    listen = async (options: number | Partial<Server>, callback?: (server: Server) => void) => {
        if (typeof Bun === "undefined") {
            throw new Error("Voll is only available in Bun");
        }

        await this.loadRoutes();

        if (this.showRoutes) {
            this.displayRoutes();
        }

        let optionsObj: Partial<Server> = {};
        if (typeof options === "number") {
            optionsObj = { port: Number(options) };
        } else {
            optionsObj = options;
        }

        this.server = Bun.serve({
            ...optionsObj,
            fetch: (request: Request, server: Server) => this.handle(request, server)
        });

        if (callback) {
            callback(this.server);
        } else {
            console.log(`[🚀 Voll Listening on ${this.server.hostname}:${this.server.port}] ✨`);
        }
    }

    stop() {
        try {
            this.server?.stop();
            this.routes = {};
            this.routeParams.clear();
            this.server?.stop();
            if (global?.gc) {
                global.gc();
            }
            console.log(`[💀 Voll Stopped] ✨`);
            process.exit(0);
        } catch (e) {
            console.error(e);
        }
    }
}