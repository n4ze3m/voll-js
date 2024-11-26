import { VollRequest, VollResponse, VollConfig } from "../../src"

export const GET = async (req: VollRequest, res: VollResponse) => {
    const query = req.query
    return res.json(query)
}


export const config: VollConfig = {
    schema: {
        queryParser: (query) => {
            return {
                length: query.length,
            }
        }
    }
}