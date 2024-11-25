import type { VollRequest, VollResponse , VollConfig } from "volljs"


export function GET(request: VollRequest, response: VollResponse) {
    return response.json({
        ok: true
    })
}