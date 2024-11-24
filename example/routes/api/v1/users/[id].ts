//@ts-nocheck
export default function(request: Request) {
    const userId = request.params.id
    return new Response(`User ID: ${userId}`)
}