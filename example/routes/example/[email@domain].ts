import type {VollRequest, VollResponse} from "volljs"


export const GET = async (req: VollRequest, res: VollResponse) => {
    return res.json({
        params: req.params,
    })
}