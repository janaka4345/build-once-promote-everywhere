import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'
import { loadConfig } from '../config'
import { getApiUrl } from '../api/client'
import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  loader: async () => {
    const config = await loadConfig()
    let backendEnv = 'unknown'
    try {
      const res = await fetch(getApiUrl('/api/env'))
      if (res.ok) {
        const data = await res.json()
        backendEnv = data.app_env || 'unknown'
      }
    } catch {
      backendEnv = 'unavailable'
    }
    return { config, backendEnv }
  },
  errorComponent: ({ error }) => (
    <html lang="en">
      <head>
        <title>Configuration Error</title>
      </head>
      <body className="p-8 font-sans bg-background text-foreground">
        <div className="max-w-md mx-auto p-6 border border-destructive rounded-lg bg-destructive/10 text-destructive">
          <h1 className="text-xl font-bold mb-2">Startup Configuration Error</h1>
          <p>{error instanceof Error ? error.message : String(error)}</p>
        </div>
      </body>
    </html>
  ),
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Task Tracker',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const data = Route.useLoaderData()

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="border-b border-border bg-muted/40 px-6 py-2 text-sm flex justify-between items-center">
          <span className="font-semibold text-foreground">Task Tracker</span>
          <div className="flex gap-4 font-mono text-xs">
            <span>
              Frontend env:{' '}
              <strong className="text-foreground">
                {data?.config?.appEnv ?? 'loading...'}
              </strong>
            </span>
            <span>
              Backend env:{' '}
              <strong className="text-foreground">
                {data?.backendEnv ?? 'loading...'}
              </strong>
            </span>
          </div>
        </div>
        {children}
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
