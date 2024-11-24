import type { Serve, Server } from "bun";
import { join } from "path";
import { readdir } from "node:fs/promises";
import type {
    VollOptions,
    HttpMethod,
    RouteHandlers,
} from "./types";
import type { VollRequest } from "./types/http";
import { VollResponse } from "./http/response";

export class Voll {
    private routesDir: string = "routes";
    private routes: RouteHandlers = {};
    private routeParams: Map<string, Set<string>> = new Map();
    private showRoutes: boolean = false;
    private parseJson: boolean = true;

    constructor(options?: VollOptions) {
        this.routesDir = options?.routesDir || this.routesDir;
        this.showRoutes = options?.showRoutes || false;
        this.parseJson = options?.parseJson || this.parseJson;
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
            const files = await readdir(join(this.routesDir, currentPath), {
                withFileTypes: true,
            });

            for (const file of files) {
                if (file.isDirectory()) {
                    const dirPath = join(currentPath, file.name).split('\\').join('/');
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

                const routePath = this.buildRoutePath(currentPath, file.name);
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
            }
        } catch (error) {
            console.error("Error loading routes:", error);
        }
    }

    private buildRoutePath(currentPath: string, file: string): string {
        let route = file.replace(/\.(ts|tsx|js|jsx)$/, "");

        if (route === "index") {
            return currentPath
                ? `/${currentPath}`.replace(/\[(\w+)\]/g, ":$1")
                : "/";
        }

        currentPath = currentPath.replace(/\[(\w+)\]/g, ":$1");
        route = route.replace(/\[(\w+)\]/g, ":$1");

        const finalPath = currentPath
            ? `/${currentPath}/${route}`
            : `/${route}`;

        return finalPath
            .split('\\').join('/')
            .replace(/\/+/g, '/');
    }



    private displayRoutes() {
        console.log('\n🚀 Available Routes:');
        console.log('==================');
        Object.entries(this.routes).forEach(([path, handlers]) => {
            console.log(`\n📍 ${path}`);
            Object.keys(handlers).forEach((method) => {
                const color = method === 'default' ? '\x1b[90m' : '\x1b[36m';
                console.log(`  ${color}${method}\x1b[0m`);
            });
        });
        console.log('\n==================\n');
    }


    listen = async (port: number) => {
        if (typeof Bun === "undefined") {
            throw new Error("Voll is only available in Bun");
        }

        await this.loadRoutes();

        if (this.showRoutes) {
            this.displayRoutes();
        }


        Bun.serve({
            port,
            fetch: async (request: Request) => {
                const url = new URL(request.url);
                const pathname = url.pathname;
                const method = request.method as HttpMethod;
                let body = undefined;
                if (this.parseJson && request.body) {
                    const contentType = request.headers.get('content-type');
                    if (contentType?.includes('application/json')) {
                        try {
                            body = await request.json();
                        } catch (e) {
                            return new Response('Invalid JSON', { status: 400 });
                        }
                    }
                }
                for (const route in this.routes) {
                    const params = this.matchRoute(pathname, route);
                    if (params) {
                        const routeHandlers = this.routes[route];
                        const handler = routeHandlers[method] || routeHandlers["default"];
                        if (handler) {
                            const vollRequest = {
                                ...request,
                                params,
                                query: Object.fromEntries(url.searchParams),
                                body: body,
                            } as VollRequest;

                            try {
                                const vollResponse = new VollResponse();
                                return handler(vollRequest, vollResponse);
                            } catch (error) {
                                console.error('[Voll] Internal Server Error:', error);
                                return new Response("Internal Server Error", { status: 500 });
                            }
                        }

                        return new Response("Method Not Allowed", { status: 405 });
                    }
                }

                return new Response("Not Found", { status: 404 });
            }

        });
    };

    private matchRoute(
        pathname: string,
        route: string
    ): Record<string, string> | null {
        const pathnameSegments = pathname.split("/");
        const routeSegments = route.split("/");

        if (pathnameSegments.length !== routeSegments.length) {
            return null;
        }

        const params: Record<string, string> = {};

        for (let i = 0; i < routeSegments.length; i++) {
            const routeSegment = routeSegments[i];
            const pathnameSegment = pathnameSegments[i];

            if (routeSegment.startsWith(":")) {
                params[routeSegment.slice(1)] = pathnameSegment;
            } else if (routeSegment !== pathnameSegment) {
                return null;
            }
        }

        return params;
    }
}
