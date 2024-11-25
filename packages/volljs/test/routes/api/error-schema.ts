import { VollRequest, VollResponse, VollConfig } from "../../../src/index"


export const config: VollConfig = {
    GET: {
        schema: {
            query: {
                required: ["year"],
                type: "object",
                properties: {
                    year: {
                        type: "integer",
                        minimum: 1900,
                        maximum: 2100
                    }
                }
            }
        }
    },

    POST: {
        schema: {
            body: {
                required: ["id"],
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        format: "uuid"
                    }
                }
            }
        }
    }
}

export const GET = async (req: VollRequest, res: VollResponse) => {
    const { year } = req.query
    return res.json({
        year
    })
}


export const POST = async (req: VollRequest, res: VollResponse) => {
    const { id } = req.body
    return res.json({
        id
    })
}