import { describe, expect, it, beforeEach, afterAll } from "bun:test";
import { Voll } from "../src/voll";

describe("Request Cookie Test", () => {
    let app: Voll;
    beforeEach(async () => {
        app = new Voll({
            routesDir: "./test/routes",
            cookieSecret: 'foo bar baz'
        });
    });

    afterAll(() => {
        app.stop()
    })

    it('should return a JSON cookie', async () => {
        const response = await app.handle(
            new Request("http://localhost/cookie/c-set")
        );
        expect(response.status).toBe(200);

        const getCookieResponse = await app.handle(
            new Request("http://localhost/cookie/c-get", {
                headers: {
                    cookie: response.headers.get('set-cookie') || ''
                }
            })
        );

        const data = await getCookieResponse.json();
        expect(data).toEqual({ user: { name: "Peter Griffin" } });
    })

    it('should return a signed JSON cookie', async () => {
        const response = await app.handle(
            new Request("http://localhost/cookie/c-set?signed=true")
        );
        expect(response.status).toBe(200);

        const getCookieResponse = await app.handle(
            new Request("http://localhost/cookie/c-get", {
                headers: {
                    cookie: response.headers.get('set-cookie') || ''
                }
            })
        );

        const data = await getCookieResponse.json();
        expect(data).toEqual({ user: { name: "Peter Griffin" } });
    })

})