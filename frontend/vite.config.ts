import { defineConfig, type Connect, type Plugin } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

function readAppEnv(fallback?: string): string {
  const env = process.env.APP_ENV?.trim()
  if (!env) {
    if (fallback) return fallback
    throw new Error('APP_ENV must be set, for example APP_ENV=staging')
  }
  return env
}

function serveConfig(middlewares: Connect.Server, appEnv: string) {
  middlewares.use('/config.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Cache-Control', 'no-store')
    res.end(JSON.stringify({ appEnv }))
  })
}

function runtimeConfig(): Plugin {
  return {
    name: 'runtime-config',
    configureServer(server) {
      serveConfig(server.middlewares, readAppEnv('development'))
    },
    configurePreviewServer(server) {
      serveConfig(server.middlewares, readAppEnv())
    },
  }
}

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
  preview: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
  plugins: [
    runtimeConfig(),
    devtools(),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
})

export default config
