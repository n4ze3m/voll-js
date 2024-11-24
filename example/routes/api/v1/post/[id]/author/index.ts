//@ts-nocheck
export default function(request: Request) {
    const userId = request.params.id
    return new Response(`Author post ID: ${userId}`)
}