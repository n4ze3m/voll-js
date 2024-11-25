import type {
    VollRequest,
    VollResponse,
    VollConfig
} from "../../../../../../../../packages/volljs/src"

export const config: VollConfig = {
    POST: {
        schema: {
            body: {
                type: "object",
                required: ["data"],
                properties: {
                    data: {
                        type: "object",
                        properties: {
                            name: {
                                type: "string"
                            },
                            age: {
                                type: "number"
                            }
                        },
                        required: ["name", "age"]
                    },
                },
                additionalProperties: false
            }
        }
    }
}


export function GET(request: VollRequest, response: VollResponse) {
    const userId = request.params.id
    const authorName = request.params.name
    return response.statusCode(200).sendJson({
        message: `Author post ID: ${userId} ${authorName}`
    })
}

export function POST(request: VollRequest, response: VollResponse) {
    const {
        data
    } = request.body
    return response.json({
        message: "Volllll",
        data
    })
}