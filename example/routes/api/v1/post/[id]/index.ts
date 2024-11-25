import type { VollConfig, VollRequest, VollResponse } from "volljs"

export const config: VollConfig = {
    schema: {
        params: {
            type: "object",
            required: ["id"],
            properties: {
                id: {
                    type: "string",
                    format: "uuid"
                }
            }
        }
    }
}

export default function (request: VollRequest, response: VollResponse) {
    const userId = request.params.id

    return response.json({
        id: userId
    })
}