import { Type, TSchema } from '@sinclair/typebox'

/**
 * Common error response schema
 */
export const ErrorResponseSchema = Type.Object({
    error: Type.String({ description: 'Error message' }),
    message: Type.Optional(
        Type.String({ description: 'Additional error details' })
    ),
})

/**
 * Common success response wrapper
 */
export const SuccessResponseSchema = (dataSchema: TSchema) =>
    Type.Object({
        success: Type.Boolean({ description: 'Operation success status' }),
        data: dataSchema,
        timestamp: Type.String({
            format: 'date-time',
            description: 'Response timestamp',
        }),
    })

/**
 * Common pagination schema
 */
export const PaginationSchema = Type.Object({
    page: Type.Number({ minimum: 1, description: 'Current page number' }),
    limit: Type.Number({
        minimum: 1,
        maximum: 100,
        description: 'Items per page',
    }),
    total: Type.Number({ description: 'Total number of items' }),
    totalPages: Type.Number({ description: 'Total number of pages' }),
})
