import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadConfig } from './config'

describe('loadConfig (browser environment)', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      location: { origin: 'http://localhost:3000' },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('loads valid config from /config.json', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ appEnv: 'staging' }),
      }),
    )

    const config = await loadConfig()
    expect(config).toEqual({ appEnv: 'staging' })
  })

  it('throws when /config.json is missing appEnv', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ appEnv: '' }),
      }),
    )

    await expect(loadConfig()).rejects.toThrow('/config.json is missing appEnv')
  })

  it('throws when fetching /config.json fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      }),
    )

    await expect(loadConfig()).rejects.toThrow('Failed to load /config.json: 404')
  })
})

describe('loadConfig (server SSR environment)', () => {
  const originalEnv = process.env.APP_ENV

  beforeEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    process.env.APP_ENV = originalEnv
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('reads APP_ENV directly from process.env on server', async () => {
    process.env.APP_ENV = 'production'
    const config = await loadConfig()
    expect(config).toEqual({ appEnv: 'production' })
  })

  it('throws on server when APP_ENV is missing', async () => {
    delete process.env.APP_ENV
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Connection refused')))
    await expect(loadConfig()).rejects.toThrow('/config.json is missing appEnv')
  })
})
