import type { VollRequest, VollResponse } from "volljs"

export function GET(request: VollRequest, response: VollResponse) {
    return response.json({
        ok: true
    })
}