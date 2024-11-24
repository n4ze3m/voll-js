export function matchRoute(
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