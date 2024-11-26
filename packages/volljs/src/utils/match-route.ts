export function matchRoute(
    pathname: string,
    route: string
): Record<string, string | string[]> | null {
    const pathnameSegments = pathname.split("/");
    const routeSegments = route.split("/");

    const lastRouteSegment = routeSegments[routeSegments.length - 1];
    if (lastRouteSegment.endsWith("*")) {
        const baseSegments = routeSegments.slice(0, -1);
        if (pathnameSegments.length < baseSegments.length) {
            return null;
        }

        const params: Record<string, string | string[]> = {};

        for (let i = 0; i < baseSegments.length; i++) {
            const routeSegment = baseSegments[i];
            const pathnameSegment = pathnameSegments[i];

            if (routeSegment.startsWith(":")) {
                params[routeSegment.slice(1)] = pathnameSegment;
            } else if (routeSegment !== pathnameSegment) {
                return null;
            }
        }

        const catchAllParam = lastRouteSegment.slice(0, -1);
        const remainingSegments = pathnameSegments.slice(baseSegments.length);
        if (remainingSegments.length === 0) {
            return null;
        }
        params[catchAllParam] = remainingSegments;

        return params;
    }

    if (pathnameSegments.length !== routeSegments.length) {
        return null;
    }

    const params: Record<string, string> = {};

    for (let i = 0; i < routeSegments.length; i++) {
        const routeSegment = routeSegments[i];
        const pathnameSegment = pathnameSegments[i];

        if (routeSegment.includes(":")) {
            const paramParts = routeSegment.split(/[-.]/);
            const valueParts = pathnameSegment.split(/[-.]/);
            
            if (paramParts.length !== valueParts.length) {
                return null;
            }

            for (let j = 0; j < paramParts.length; j++) {
                if (paramParts[j].startsWith(":")) {
                    params[paramParts[j].slice(1)] = valueParts[j];
                } else if (paramParts[j] !== valueParts[j]) {
                    return null;
                }
            }
        } else if (routeSegment !== pathnameSegment) {
            return null;
        }
    }

    return params;
}
