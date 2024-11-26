import type { VollRequest, VollResponse, } from "../../../src"

export const GET = async (req: VollRequest, res: VollResponse) => {
    res.cookie('user', { name: 'peter-griffin' })
    return res.send("")
}