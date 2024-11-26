import { describe, expect, it, beforeEach, afterAll } from "bun:test";
import { Voll } from "../src/voll";

describe("Route Schema Testing", () => {
    let app: Voll;

    beforeEach(async () => {
        app = new Voll({
            routesDir: "./test/routes",
            showRoutes: true,
        });
    });

    afterAll(() => {
        app?.stop();
    });

    it("should return 200 when input is valid", async () => {
        const response = await app.handle(
            new Request("http://localhost/api/error-schema?year=2024")
        );
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(typeof data.year).toBe("number");
        expect(data.year).toBe(2024);
    });

    it("should return 400 for invalid query parameter type", async () => {
        const response = await app.handle(
            new Request("http://localhost/api/error-schema?year=invalid")
        );
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.errors).toBeDefined();
    });

    it("should return 400 for out of range year", async () => {
        const response = await app.handle(
            new Request("http://localhost/api/error-schema?year=2500")
        );
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.errors).toBeDefined();
    });

    it("should return 400 for missing required year parameter", async () => {
        const response = await app.handle(
            new Request("http://localhost/api/error-schema")
        );
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.errors).toBeDefined();
    });
});