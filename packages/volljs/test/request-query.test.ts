import { describe, expect, it, beforeEach, afterAll } from "bun:test";
import { Voll } from "../src/voll";

describe("Request Query Testing", () => {
    let app: Voll;
    let appQs: Voll;

    beforeEach(async () => {
        app = new Voll({
            routesDir: "./test/routes",
        });

        appQs = new Voll({
            routesDir: "./test/routes",
            queryParser: "qs",
        });
    });

    afterAll(() => {
        app.stop();
        appQs.stop();
    });

    it('should parse arrays in query string', async () => {
        const response = await appQs.handle(
            new Request("http://localhost/query?colors[]=red&colors[]=blue")
        );
        expect(response.status).toBe(200);
        const res = await response.json();
        expect(res).toEqual({ colors: ['red', 'blue'] });
    });

    it('should parse nested objects with multiple levels', async () => {
        const response = await appQs.handle(
            new Request("http://localhost/query?user[profile][name]=john&user[profile][age]=25")
        );
        expect(response.status).toBe(200);
        const res = await response.json();
        expect(res).toEqual({
            user: {
                profile: {
                    name: 'john',
                    age: '25'
                }
            }
        });
    });

    describe('when query string contains special characters', () => {
        it('should handle encoded spaces', async () => {
            const response = await app.handle(
                new Request("http://localhost/query?message=hello%20world")
            );
            expect(response.status).toBe(200);
            const res = await response.json();
            expect(res).toEqual({ message: 'hello world' });
        });

        it('should handle multiple parameters with same name', async () => {
            const response = await app.handle(
                new Request("http://localhost/query?tag=bun&tag=typescript")
            );
            expect(response.status).toBe(200);
            const res = await response.json();
            expect(res).toEqual({ tag: ['bun', 'typescript'] });
        });
    });

    it('should use custom parser function that returns uppercase values', async () => {
        const customApp = new Voll({
            routesDir: "./test/routes",
            queryParser: (query: string) => {
                const params = new URLSearchParams(query);
                const result: Record<string, string> = {};
                params.forEach((value, key) => {
                    result[key] = value.toUpperCase();
                });
                return result;
            }
        });

        const response = await customApp.handle(
            new Request("http://localhost/query?name=john&role=developer")
        );
        expect(response.status).toBe(200);
        const res = await response.json();
        expect(res).toEqual({ name: 'JOHN', role: 'DEVELOPER' });
    });

    it('should use custom parser that counts parameters', async () => {
        const customApp = new Voll({
            routesDir: "./test/routes",
            queryParser: (query: string) => ({
                paramCount: query.split('&').length,
                rawQuery: query
            })
        });

        const response = await customApp.handle(
            new Request("http://localhost/query?a=1&b=2&c=3")
        );
        expect(response.status).toBe(200);
        const res = await response.json();
        expect(res).toEqual({
            paramCount: 3,
            rawQuery: 'a=1&b=2&c=3'
        });
    });

    it('should handle empty query string in custom parser', async () => {
        const customApp = new Voll({
            routesDir: "./test/routes",
            queryParser: (query: string) => ({
                isEmpty: query.length === 0,
                queryLength: query.length
            })
        });

        const response = await customApp.handle(
            new Request("http://localhost/query")
        );
        expect(response.status).toBe(200);
        const res = await response.json();
        expect(res).toEqual({
            isEmpty: true,
            queryLength: 0
        });
    });
});

