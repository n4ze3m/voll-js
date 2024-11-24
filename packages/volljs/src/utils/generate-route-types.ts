import { readdir } from "node:fs/promises";
import { join } from "path";
import { writeFile } from "fs/promises";

export async function generateRouteTypes(routesDir: string) {
    const typeContent = `
// This file is auto-generated. DO NOT EDIT IT MANUALLY OR YOU WILL GET FIRED!
import type { VollRequest, VollResponse } from "../../src";
declare module ".../../src" {
    interface VollRequest {
        params: RouteParams[keyof RouteParams]
    }
}

export type RouteParams = {
    ${await generateRouteTypeMap(routesDir)}
};
`;
    await writeFile("routetree.gen.ts", typeContent);
}

async function generateRouteTypeMap(routesDir: string, currentPath: string = ""): Promise<string> {
    const files = await readdir(join(routesDir, currentPath), { withFileTypes: true });
    const types: string[] = [];

    for (const file of files) {
        const fullPath = join(currentPath, file.name).split('\\').join('/');

        if (file.isDirectory()) {
            types.push(await generateRouteTypeMap(routesDir, fullPath));
            continue;
        }

        if (![".ts", ".tsx", ".js", ".jsx"].some(ext => file.name.endsWith(ext))) continue;

        const routePath = fullPath.replace(/\.(ts|tsx|js|jsx)$/, '');
        const params = extractParamTypes(routePath);
        if (Object.keys(params).length) {
            types.push(`"${routePath}": { ${params} }`);
        }
    }

    return types.join('\n');
}

function extractParamTypes(path: string): string {
    const params: string[] = [];
    const matches = path.match(/\[\.\.\.(\w+)\]|\[(\w+)\]/g);

    if (matches) {
        matches.forEach(match => {
            if (match.startsWith("[...")) {
                const param = match.slice(4, -1);
                params.push(`${param}: string[]`);
            } else {
                const param = match.slice(1, -1);
                params.push(`${param}: string`);
            }
        });
    }

    return params.join(', ');

}