import { errorEnvelopeSchema } from './schemas'

export type ApiErrorDetail = {
  field: string
  message: string
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details: ApiErrorDetail[] | null

  constructor(args: {
    status: number
    code: string
    message: string
    details: ApiErrorDetail[] | null
  }) {
    super(args.message)
    this.name = 'ApiError'
    this.status = args.status
    this.code = args.code
    this.details = args.details
  }
}

export function isNotFoundError(error: unknown): error is ApiError {
  return (
    error instanceof ApiError &&
    (error.code === 'not_found' || error.status === 404)
  )
}

export function apiErrorFromResponse(
  status: number,
  body: unknown,
): ApiError {
  const parsed = errorEnvelopeSchema.safeParse(body)
  if (parsed.success) {
    return new ApiError({
      status,
      code: parsed.data.error.code,
      message: parsed.data.error.message,
      details: parsed.data.error.details,
    })
  }
  return new ApiError({
    status,
    code: 'internal_error',
    message: 'Unexpected error response',
    details: null,
  })
}
