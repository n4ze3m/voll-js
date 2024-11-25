import { describe, expect, it, beforeEach, afterAll } from 'bun:test'
import { Voll } from '../src/voll'

describe('Voll', () => {
    let app: Voll

    beforeEach(() => {
        app = new Voll({
            routesDir: './test/routes',
            showRoutes: false
        })
    })

    afterAll(() => {
        app.stop()
    })

    describe('Instance Creation', () => {
        it('creates instance with default options', () => {
            const instance = new Voll()
            expect(instance).toBeInstanceOf(Voll)
        })

        it('creates instance with custom options', () => {
            const instance = new Voll({
                routesDir: './test/custom-routes',
                showRoutes: true,
                parseJson: false
            })
            expect(instance).toBeInstanceOf(Voll)
        })
    })

    describe('Server Operations', () => {
        it('starts server with port number', async () => {
            await app.listen(3000)
            expect(app).toBeDefined()
        })

    })

})
