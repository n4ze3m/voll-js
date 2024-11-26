import type { VollRequest, VollResponse } from "../../src"

export const GET = async (req: VollRequest, res: VollResponse) => {
    const query = req.query
    return res.json(query)
}
