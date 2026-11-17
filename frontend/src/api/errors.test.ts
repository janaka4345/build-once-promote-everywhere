import { describe, expect, it } from 'vitest'
import { ApiError, apiErrorFromResponse, isNotFoundError } from './errors'

describe('api errors', () => {
  it('parses standard backend error envelope', () => {
    const err = apiErrorFromResponse(422, {
      error: {
        code: 'validation_error',
        message: 'Request validation failed',
        details: [{ field: 'title', message: 'Field required' }],
      },
    })

    expect(err).toBeInstanceOf(ApiError)
    expect(err.status).toBe(422)
    expect(err.code).toBe('validation_error')
    expect(err.message).toBe('Request validation failed')
    expect(err.details).toEqual([{ field: 'title', message: 'Field required' }])
  })

  it('falls back to internal_error on unexpected error body', () => {
    const err = apiErrorFromResponse(500, 'Internal Server Error')
    expect(err.status).toBe(500)
    expect(err.code).toBe('internal_error')
    expect(err.message).toBe('Unexpected error response')
    expect(err.details).toBeNull()
  })

  it('identifies not found errors by code or 404 status', () => {
    expect(
      isNotFoundError(
        new ApiError({
          status: 404,
          code: 'not_found',
          message: 'Task not found',
          details: null,
        }),
      ),
    ).toBe(true)

    expect(
      isNotFoundError(
        new ApiError({
          status: 400,
          code: 'validation_error',
          message: 'Bad request',
          details: null,
        }),
      ),
    ).toBe(false)
  })
})

