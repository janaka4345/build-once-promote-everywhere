import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { apiFetch, getApiUrl } from './client'

describe('api client (browser)', () => {
  beforeEach(() => {
    vi.stubGlobal('window', { location: { origin: 'http://localhost:3000' } })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('normalizes paths to same-origin relative /api prefix in browser', () => {
    expect(getApiUrl('tasks')).toBe('/api/tasks')
    expect(getApiUrl('/tasks')).toBe('/api/tasks')
    expect(getApiUrl('/api/tasks')).toBe('/api/tasks')
    expect(getApiUrl('/api/env')).toBe('/api/env')
  })

  it('fetches relative URL with correct headers', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ message: 'ok' }),
    })
    vi.stubGlobal('fetch', mockFetch)

    const result = await apiFetch('/tasks', undefined, (data) => data)
    expect(result).toEqual({ message: 'ok' })
    expect(mockFetch).toHaveBeenCalledWith('/api/tasks', {
      headers: {
        Accept: 'application/json',
      },
    })
  })
})

describe('api client (server SSR)', () => {
  it('resolves absolute URL on server', () => {
    expect(getApiUrl('/tasks')).toBe('http://localhost:8000/api/tasks')
  })
})
