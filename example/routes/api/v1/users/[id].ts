import type { VollRequest } from "volljs"

export default function(request: VollRequest) {
    const userId = request.params.id
    return new Response(`User ID: ${userId}`)
}