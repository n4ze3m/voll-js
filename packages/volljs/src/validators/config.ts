import Ajv, { ErrorObject } from 'ajv'
import type { RouteSchema } from '../types/config'

interface ValidationError {
    field: string
    message: string
}

interface ValidationResult<T> {
    valid: boolean
    errors: ValidationError[]
    data: T | null
}

export function createConfigValidator(routeSchema: RouteSchema) {
    const ajv = new Ajv({
        allErrors: true,
        verbose: true,
        strict: true,
        coerceTypes: true,
        removeAdditional: 'all' 
    })

    const formatError = (error: ErrorObject): ValidationError => ({
        field: error.instancePath || 'root',
        message: error.message || 'Validation failed',
    })

    const compileSchema = <T>(schema: any, type: string) => {
        try {
            const validate = ajv.compile<T>(schema)
            return (data: unknown): ValidationResult<T> => {
                const clonedData = JSON.parse(JSON.stringify(data))
                const valid = validate(clonedData)
                const errors = validate.errors?.map(formatError) || []
                return { 
                    valid, 
                    errors,
                    data: valid ? (clonedData as T) : null 
                }
            }
        } catch (error) {
            throw new Error(`Schema compilation failed for ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    const validators = {
        body: routeSchema.body ? compileSchema(routeSchema.body, 'request body') : null,
        // query: routeSchema.query ? compileSchema(routeSchema.query, 'query parameters') : null,
        // params: routeSchema.params ? compileSchema(routeSchema.params, 'route parameters') : null
    }

    return validators
}
