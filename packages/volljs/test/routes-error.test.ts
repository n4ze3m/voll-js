import { describe, expect, it, beforeEach, afterAll } from "bun:test";
import { Voll } from "../src/voll";

describe("Route Error Testing", () => {
    let app: Voll;

    beforeEach(async () => {
        app = new Voll({
            routesDir: "./test/routes",
            showRoutes: true,
        });
    });

    afterAll(() => {
        app.stop();
    });

    it("should return 404 for non-existent route", async () => {
        const response = await app.handle(
            new Request("http://localhost/non-existent")
        );
        expect(response.status).toBe(404);
    });

    it("should return 405 for PUT request - method not allowed", async () => {
        const response = await app.handle(
            new Request("http://localhost/api/error-schema", {
                method: "PUT"
            })
        );
        expect(response.status).toBe(405);
    });
});
