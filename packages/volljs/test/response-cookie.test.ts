import { describe, expect, it, beforeEach, afterAll } from "bun:test";
import { Voll } from "../src/voll";

describe("Response Cookie Test", () => {
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

    it('should generate a JSON cookie', async () => {
        const response = await app.handle(
            new Request("http://localhost/cookie/json")
        );
        expect(response.status).toBe(200);
        expect(response.headers.get('set-cookie')).toBeDefined();
        const cookie = response.headers.get('set-cookie')
        expect(cookie).toBe('user=%7B%22name%22%3A%22peter-griffin%22%7D; Path=/')
    })


    it('should set a cookie', async () => {
        const response = await app.handle(
            new Request("http://localhost/cookie/string")
        );
        expect(response.status).toBe(200);
        expect(response.headers.get('set-cookie')).toBeDefined();
        const cookie = response.headers.get('set-cookie')
        expect(cookie).toBe('name=Peter%20Griffin; Path=/')
    })

    it('should allow multiple calls', async () => {
        const response = await app.handle(
            new Request("http://localhost/cookie/string?multiple=true")
        );
        expect(response.status).toBe(200);
        expect(response.headers.get('set-cookie')).toBeDefined();
        const cookie = response.headers.get('set-cookie')
        expect(cookie).toBe("name=Peter%20Griffin; Path=/,age=47; Path=/,job=Brewery%20shipping%20clerk; Path=/")
    })


    it('should set params', async () => {
        const response = await app.handle(
            new Request("http://localhost/cookie/string?options=true")
        );
        expect(response.status).toBe(200);
        expect(response.headers.get('set-cookie')).toBeDefined();
        const cookie = response.headers.get('set-cookie')
        expect(cookie).toBe("name=Peter%20Griffin; Path=/; HttpOnly; Secure")
    })


    it('should throw on invalid date', async () => {
        const response = await app.handle(
            new Request("http://localhost/cookie/string?invalid=true")
        );
        expect(response.status).toBe(500);
        expect(await response.text()).toMatch(/option expires is invalid/)
    })

    it('should set partitioned', async () => {
        const response = await app.handle(
            new Request("http://localhost/cookie/string?partitioned=true")
        );
        expect(response.status).toBe(200);
        const cookie = response.headers.get('set-cookie')
        expect(cookie).toBe("name=Peter%20Griffin; Path=/; Partitioned")
    })


    it('should set relative expires', async () => {
        const response = await app.handle(
            new Request("http://localhost/cookie/string?maxAge=true")
        );
        expect(response.status).toBe(200);
        const cookie = response.headers.get('set-cookie')
        expect(cookie).toMatch(/name=Peter%20Griffin; Max-Age=1; Path=\/; Expires=/)
        expect(cookie).toMatch(/Max-Age=1/)
    })

    it('should set low priority', async () => {
        const response = await app.handle(
            new Request("http://localhost/cookie/string?priority=low")
        );
        expect(response.status).toBe(200);
        const cookie = response.headers.get('set-cookie')
        expect(cookie).toMatch(/Priority=Low/)
    })

    it('should set medium priority', async () => {
        const response = await app.handle(
            new Request("http://localhost/cookie/string?priority=medium")
        );
        expect(response.status).toBe(200);
        const cookie = response.headers.get('set-cookie')
        expect(cookie).toMatch(/Priority=Medium/)
    })

    it('should set high priority', async () => {
        const response = await app.handle(
            new Request("http://localhost/cookie/string?priority=high")
        );
        expect(response.status).toBe(200);
        const cookie = response.headers.get('set-cookie')
        expect(cookie).toMatch(/Priority=High/)
    })

    it('should throw with invalid priority', async () => {
        const response = await app.handle(
            new Request("http://localhost/cookie/string?priority=foo")
        );
        expect(response.status).toBe(500);
        expect(await response.text()).toMatch(/option priority is invalid/)
    })

    it('should generate a signed JSON cookie', async () => {
        const response = await app.handle(
            new Request("http://localhost/cookie/string?jSigned=true")
        );
        expect(response.status).toBe(200);
        const cookie = response.headers.get('set-cookie')
        expect(cookie).toBe('user=s%3Aj%3A%7B%22name%22%3A%22Peter%20Griffin%22%7D.XdjwahglLERZjWTsExhpchNg3xA8fFlc6CskkbRpltY; Path=/')
    })

    it('should set a signed cookie', async () => {
        const response = await app.handle(
            new Request("http://localhost/cookie/string?sSigned=true")
        );
        expect(response.status).toBe(200);
        const cookie = response.headers.get('set-cookie')
        expect(cookie).toBe('name=s%3APeter%20Griffin.vX9dPUrnK%2Fy9xomXHWuB%2FkpEc3Z1WRvXDY5YAiSmiO4; Path=/')
    })
})