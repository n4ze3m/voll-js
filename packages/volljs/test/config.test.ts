import { describe, expect, it } from 'bun:test'
import { createConfigValidator } from '../src/validators/config'

describe('createConfigValidator', () => {
    it('creates validators for all schema types', () => {
        const schema = {
            body: { type: 'object', properties: { name: { type: 'string' } } },
            query: { type: 'object', properties: { page: { type: 'number' } } },
            params: { type: 'object', properties: { id: { type: 'string' } } },
            headers: { type: 'object', properties: { 'content-type': { type: 'string' } } }
        }

        const validators = createConfigValidator(schema)

        expect(validators.body).toBeDefined()
        expect(validators.query).toBeDefined()
        expect(validators.params).toBeDefined()
        expect(validators.headers).toBeDefined()
    })

    it('returns null for undefined schema parts', () => {
        const schema = {
            body: { type: 'object', properties: { name: { type: 'string' } } }
        }

        const validators = createConfigValidator(schema)

        expect(validators.body).toBeDefined()
        expect(validators.query).toBeNull()
        expect(validators.params).toBeNull()
        expect(validators.headers).toBeNull()
    })

    it('validates body data correctly', () => {
        const schema = {
            body: {
                type: 'object',
                properties: { name: { type: 'string' } },
                required: ['name']
            }
        }

        const validators = createConfigValidator(schema)
        const result = validators.body!({ name: 'test' })

        expect(result.valid).toBe(true)
        expect(result.errors).toHaveLength(0)
        expect(result.data).toEqual({ name: 'test' })
    })

    it('returns validation errors for invalid data', () => {
        const schema = {
            body: {
                type: 'object',
                properties: { age: { type: 'number' } },
                required: ['age']
            }
        }

        const validators = createConfigValidator(schema)
        const result = validators.body!({ age: 'invalid' })

        expect(result.valid).toBe(false)
        expect(result.errors.length).toBeGreaterThan(0)
        expect(result.data).toBeNull()
    })

    it('handles array validation', () => {
        const schema = {
            body: {
                type: 'object',
                properties: {
                    items: {
                        type: 'array',
                        items: { type: 'string' }
                    }
                }
            }
        }

        const validators = createConfigValidator(schema)
        const result = validators.body!({ items: ['a', 'b', 'c'] })

        expect(result.valid).toBe(true)
        expect(result.data).toEqual({ items: ['a', 'b', 'c'] })
    })

    it('throws error for invalid schema', () => {
        const schema = {
            body: {
                type: 'invalid'
            }
        }

        expect(() => createConfigValidator(schema)).toThrow()
    })

    it('coerces types when possible', () => {
        const schema = {
            query: {
                type: 'object',
                properties: {
                    count: { type: 'number' }
                }
            }
        }

        const validators = createConfigValidator(schema)
        const result = validators.query!({ count: '123' })

        expect(result.valid).toBe(true)
        expect(result.data).toEqual({ count: 123 })
    })

    it('validates uuid format correctly', () => {
        const schema = {
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' }
                },
                required: ['id']
            }
        }

        const validators = createConfigValidator(schema)
        const validResult = validators.params!({ id: '123e4567-e89b-12d3-a456-426614174000' })
        const invalidResult = validators.params!({ id: 'not-a-uuid' })

        expect(validResult.valid).toBe(true)
        expect(validResult.data).toEqual({ id: '123e4567-e89b-12d3-a456-426614174000' })
        expect(invalidResult.valid).toBe(false)
        expect(invalidResult.errors.length).toBeGreaterThan(0)
    })
})