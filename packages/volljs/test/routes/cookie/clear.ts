import type { VollRequest, VollResponse, VollConfig } from "../../../src";

export const GET = async (req: VollRequest, res: VollResponse) => {
    const passedExpiry = req?.query?.passedExpiry;
    const pathParams = req?.query?.pathParams
    const maxAge = req?.query?.maxAge
    const expiryDate =req?.query?.expiryDate
    try {

        if (passedExpiry) {
            res.clearCookie('sid')
            return res.send("")
        }

        if (pathParams) {
            res.clearCookie('sid', { path: '/admin' })
            return res.send("")
        }

        if(maxAge) {
            res.clearCookie('sid', { path: '/admin', maxAge: 1000 })
            return res.send("")
        }

        if(expiryDate) {
            res.clearCookie('sid', { path: '/admin', expires: new Date() })
            return res.send("")
        }

        return res.send("");
    } catch (e: any) {
        return res.statusCode(500).send(e?.message)
    }
};

export const config: VollConfig = {
    schema: {
        query: {
            type: "object",
            properties: {
                passedExpiry: {
                    type: "boolean",
                    default: false,
                },

                pathParams: {
                    type: "boolean",
                    default: false
                },
                maxAge:{ 
                    type: "boolean",
                    default: false
                },

                expiryDate: {
                    type: "boolean",
                    default: false
                }
            },
        },
    },
};
