import { env } from '#/env'

import { ApiError, apiErrorFromResponse } from './errors'

const baseUrl = () => env.VITE_API_URL.replace(/\/$/, '')

export async function apiFetch<T>(
  path: string,
  init: RequestInit | undefined,
  parseSuccess: (data: unknown) => T,
): Promise<T> {
  const response = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  })

  const text = await response.text()
  let body: unknown = undefined
  if (text) {
    try {
      body = JSON.parse(text) as unknown
    } catch {
      body = text
    }
  }

  if (!response.ok) {
    throw apiErrorFromResponse(response.status, body)
  }

  try {
    return parseSuccess(body)
  } catch (error) {
    throw new ApiError({
      status: response.status,
      code: 'internal_error',
      message:
        error instanceof Error
          ? error.message
          : 'Failed to parse success response',
      details: null,
    })
  }
}
