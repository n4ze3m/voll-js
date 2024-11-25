import { describe, expect, it } from 'bun:test'
import { VollResponse } from '../src/http/response'
import { StatusCode } from '../src/types/stats-code'

describe('VollResponse', () => {
    it('initializes with default values', () => {
        const response = new VollResponse()
        expect(response.ok).toBe(true)
        expect(response.status).toBe(200)
        expect(response.statusText).toBe('OK')
        expect(response.redirected).toBe(false)
        expect(response.bodyUsed).toBe(false)
    })

    it('disables X-Powered-By header', () => {
        const response = new VollResponse()
        response.disablePoweredBy()
        const result = response.json({ test: true })
        expect(result.headers.get('X-Powered-By')).toBeNull()
    })

    it('sets custom status code', () => {
        const response = new VollResponse()
        response.statusCode(StatusCode.CREATED)
        const result = response.json({ test: true })
        expect(result.status).toBe(201)
    })

    it('sets custom header', () => {
        const response = new VollResponse()
        response.setHeader('X-Custom-Header', 'test-value')
        const result = response.json({ test: true })
        expect(result.headers.get('X-Custom-Header')).toBe('test-value')
    })

    it('sends JSON response with correct content type', () => {
        const response = new VollResponse()
        const data = { message: 'test' }
        const result = response.sendJson(data)
        expect(result.headers.get('Content-Type')).toBe('application/json')
        expect(result.headers.get('X-Powered-By')).toBe('Voll')
    })

    it('sends plain text response', () => {
        const response = new VollResponse()
        const result = response.send('Hello World')
        expect(result.headers.get('Content-Type')).toBe('text/plain')
    })

    it('sends SOAP response with correct content type', () => {
        const response = new VollResponse()
        const result = response.sendSoap('<soap>test</soap>')
        expect(result.headers.get('Content-Type')).toBe('application/soap+xml')
    })

    it('sends status only response', () => {
        const response = new VollResponse()
        const result = response.sendStatus(204)
        expect(result.status).toBe(204)
        expect(result.headers.get('X-Powered-By')).toBe('Voll')
    })

    it('clones response correctly', async () => {
        const response = new VollResponse()
        response.json({ test: true })
        const cloned = response.clone()
        const originalData = await response.getResponse().json()
        const clonedData = await cloned.json()
        expect(clonedData).toEqual(originalData)
    })

    it('handles array buffer response', async () => {
        const response = new VollResponse()
        const data = new Uint8Array([1, 2, 3])
        response.send(String.fromCharCode.apply(null, data))
        const buffer = await response.arrayBuffer()
        expect(buffer).toBeDefined()
    })
})