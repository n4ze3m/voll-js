import type { VollRequest, VollResponse } from "volljs"

export default function GET(request: VollRequest, response: VollResponse) {
    const params = request.params

    return response.json({
        params
    })
}