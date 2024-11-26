import type { VollRequest, VollResponse, VollConfig } from "../../../src";

export const GET = async (req: VollRequest, res: VollResponse) => {
    const signed = req.query.signed as unknown as boolean
    const pathname = req.params.type
    try {

        if (pathname === "get") {
            return res.json(req.cookies)
        } else {
            res.cookie("user", {
                name: "Peter Griffin"
            }, {
                signed
            })
            return res.send("")
        }
    } catch (e: any) {
        return res.statusCode(500).send(e?.message)
    }
};

export const config: VollConfig = {
    schema: {
        query: {
            type: "object",
            properties: {
                signed: {
                    type: "boolean",
                    default: false
                }
            },
        },
    },
};
