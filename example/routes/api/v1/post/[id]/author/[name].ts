//@ts-nocheck
export default function(request: Request) {
    const userId = request.params.id
    const authorName = request.params.name
    return new Response(`Author post ID: ${userId} ${authorName}`)
}