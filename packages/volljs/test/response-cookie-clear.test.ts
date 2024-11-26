import { describe, expect, it, beforeEach, afterAll } from "bun:test";
import { Voll } from "../src/voll";

describe("Response Cookie Clear Test", () => {
    let app: Voll;
    beforeEach(async () => {
        app = new Voll({
            routesDir: "./test/routes",
            cookieSecret: 'foo bar baz'
        });
    });

    afterAll(() => {
        app?.stop()
    })


    it('should set a cookie passed expiry', async () => {
        const response = await app.handle(
            new Request("http://localhost/cookie/clear?passedExpiry=true")
        );
        expect(response.status).toBe(200);
        expect(response.headers.get('set-cookie')).toBeDefined();
        const cookie = response.headers.get('set-cookie')
        expect(cookie).toBe('sid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT')
    })


    it('should set the given params', async () => {
        const response = await app.handle(
            new Request("http://localhost/cookie/clear?pathParams=true")
        );
        expect(response.status).toBe(200);
        expect(response.headers.get('set-cookie')).toBeDefined();
        const cookie = response.headers.get('set-cookie')
        expect(cookie).toBe('sid=; Path=/admin; Expires=Thu, 01 Jan 1970 00:00:00 GMT')
    })


    it('should ignore maxAge', async () => {
        const response = await app.handle(
            new Request("http://localhost/cookie/clear?maxAge=true")
        );
        expect(response.status).toBe(200);
        expect(response.headers.get('set-cookie')).toBeDefined();
        const cookie = response.headers.get('set-cookie')
        expect(cookie).toBe('sid=; Path=/admin; Expires=Thu, 01 Jan 1970 00:00:00 GMT')
    })


    it('should ignore user supplied expires param', async () => {
        const response = await app.handle(
            new Request("http://localhost/cookie/clear?expiryDate=true")
        );
        expect(response.status).toBe(200);
        expect(response.headers.get('set-cookie')).toBeDefined();
        const cookie = response.headers.get('set-cookie')
        expect(cookie).toBe('sid=; Path=/admin; Expires=Thu, 01 Jan 1970 00:00:00 GMT')
    })
})