import type { VollRequest, VollResponse, VollConfig } from "volljs"
export const config: VollConfig = {
    schema: {
        query: {
            type: "object",
            required: ["pageNo"],
            properties: {
                pageNo: {
                    type: "number",
                },
                pageSize: {
                    type: "number",
                    default: 10
                },
            }
        }
    },
    middleware: [
        async (request, response, next) => {
            console.log(request, response);
            console.log("Middleware 1");
            await next();
        },
        async (request, response, next) => {
            console.log("Middleware 2");
            const random = Math.random();
            // if random is greater than 0.5
            if (random > 0.5) {
                return response.statusCode(400).sendJson({
                    message: "Weird"
                })
            }
            await next();
        },
    ]
}

export function GET(request: VollRequest, response: VollResponse) {
    return response.json({
        ok: true,
        query: request.query
    })
}