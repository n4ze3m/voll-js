import type {
    VollRequest,
    VollResponse
} from "../../../../../../../../src/index"
export function GET(request: VollRequest, response: VollResponse) {
    const userId = request.params.id
    const authorName = request.params.name
    return response.statusCode(200).sendJson({
        message: `Author post ID: ${userId} ${authorName}`
    })
}

export function POST(request: VollRequest, response: VollResponse) {
    const {
        data
    } = request.body
    return response.json({
        message: "Volllll",
        data
    })
}