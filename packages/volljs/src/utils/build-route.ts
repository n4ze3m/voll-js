export function buildRoutePath(currentPath: string, file: string): string {
    let route = file.replace(/\.(ts|tsx|js|jsx)$/, "");

    if (route === "index") {
        return currentPath
            ? `/${currentPath.replace(/^\/+/, '')}`
                .replace(/\[\.\.\.([^\]]+)\]/g, "$1*")
                .replace(/\[([^\]]+)\]/g, ":$1")
            : "/";
    }

    currentPath = currentPath
        .replace(/^\/+/, '')  
        .replace(/\[\.\.\.([^\]]+)\]/g, "$1*")
        .replace(/\[([^\]]+)\]/g, ":$1");
    route = route
        .replace(/\[\.\.\.([^\]]+)\]/g, "$1*")
        .replace(/\[([^\]]+)\]/g, ":$1");

    const finalPath = currentPath
        ? `/${currentPath}/${route}`
        : `/${route}`;

    return finalPath
        .split('\\').join('/')
        .replace(/\/+/g, '/');
}
