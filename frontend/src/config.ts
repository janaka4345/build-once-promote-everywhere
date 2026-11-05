export type AppConfig = {
  appEnv: string
}

export async function loadConfig(): Promise<AppConfig> {
  // If running in browser (client-side):
  if (typeof window !== 'undefined') {
    const res = await fetch('/config.json', { cache: 'no-store' })
    if (!res.ok) {
      throw new Error(`Failed to load /config.json: ${res.status}`)
    }
    const config: Partial<AppConfig> = await res.json()
    if (typeof config.appEnv !== 'string' || config.appEnv === '') {
      throw new Error('/config.json is missing appEnv')
    }
    return { appEnv: config.appEnv }
  }

  // If running on server during SSR (Node.js runtime):
  // 1. Directly read APP_ENV from server process environment
  const serverEnv = process.env.APP_ENV?.trim()
  if (serverEnv) {
    return { appEnv: serverEnv }
  }

  // 2. Fallback to loopback fetch using absolute URL if server has base
  try {
    const port = process.env.PORT || '3000'
    const res = await fetch(new URL('/config.json', `http://localhost:${port}`), {
      cache: 'no-store',
    })
    if (res.ok) {
      const config: Partial<AppConfig> = await res.json()
      if (typeof config.appEnv === 'string' && config.appEnv !== '') {
        return { appEnv: config.appEnv }
      }
    }
  } catch {
    // Loopback failed
  }

  throw new Error('/config.json is missing appEnv')
}
