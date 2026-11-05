import { ApiError, apiErrorFromResponse } from './errors'

export function getApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const apiPath = normalizedPath.startsWith('/api') ? normalizedPath : `/api${normalizedPath}`

  // On the server during SSR (Node.js runtime), fetch requires an absolute URL
  if (typeof window === 'undefined') {
    const backendOrigin = process.env.BACKEND_URL || 'http://localhost:8000'
    return `${backendOrigin.replace(/\/$/, '')}${apiPath}`
  }

  // In the browser, use relative same-origin URL
  return apiPath
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit | undefined,
  parseSuccess: (data: unknown) => T,
): Promise<T> {
  const url = getApiUrl(path)
  const response = await fetch(url, {
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
