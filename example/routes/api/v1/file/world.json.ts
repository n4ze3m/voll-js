import type { VollRequest, VollResponse , VollConfig } from "volljs"
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
    }
}

export function GET(request: VollRequest, response: VollResponse) {
    return response.json({
        ok: true,
        query: request.query       
    })
}