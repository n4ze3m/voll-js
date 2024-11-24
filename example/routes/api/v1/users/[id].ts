import type { VollRequest } from "../../../../../src"

export default function(request: VollRequest) {
    const userId = request.params.id
    return new Response(`User ID: ${userId}`)
}