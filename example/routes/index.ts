import type { VollRequest } from "volljs"

export default function(request: VollRequest, res) {
    return new Response('Hello, World!')
}
