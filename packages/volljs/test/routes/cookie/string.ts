import type { VollRequest, VollResponse, VollConfig } from "../../../src";

export const GET = async (req: VollRequest, res: VollResponse) => {
    const multiple = req?.query?.multiple;
    const options = req?.query?.options;
    const invalid = req?.query?.invalid
    const partitioned = req?.query?.partitioned
    const maxAge = req?.query?.maxAge;
    const maxAgeNull = req?.query?.maxAgeNull;
    const priority = req?.query?.priority;
    try {
        if (options) {
            res.cookie("name", "Peter Griffin", {
                httpOnly: true,
                secure: true,
            });
            return res.send("");
        }

        if (invalid) {
            res.cookie('name', 'Peter Griffin', { expires: new Date(NaN) })
            return res.send("")
        }

        if (partitioned) {
            res.cookie('name', 'Peter Griffin', { partitioned: true })
            return res.send("")
        }

        if (maxAge) {
            res.cookie('name', 'Peter Griffin', { maxAge: 1000 })
            return res.send("")
        }

        if (maxAgeNull) {
            //@ts-ignore
            res.cookie('name', 'Peter Griffin', { maxAge: null })
            return res.send("")
        }

        if (priority) {
            //@ts-ignore
            res.cookie('name', 'Peter Griffin', { priority: priority })
            return res.send("")
        }

        res.cookie("name", "Peter Griffin");
        if (multiple) {
            res.cookie("age", 47);
            res.cookie("job", "Brewery shipping clerk");
        }

        return res.send("");
    } catch (e) {
        return res.statusCode(500).send(e?.message)
    }
};

export const config: VollConfig = {
    schema: {
        query: {
            type: "object",
            properties: {
                multiple: {
                    type: "boolean",
                    default: false,
                },
                options: {
                    type: "boolean",
                    default: false,
                },
                invalid: {
                    type: "boolean",
                    default: false,
                },
                partitioned: {
                    type: "boolean",
                    default: false,
                },
                maxAge: {
                    type: "boolean",
                    default: false,
                },
                maxAgeNull: {
                    type: "boolean",
                    default: false,
                },
                maxAgeError: {
                    type: "boolean",
                    default: false,
                },
                priority: {
                    type: "string"
                }
            },
        },
    },
};
