// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { TaskDetailPage } from './TaskDetailPage'

const navigateMock = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, ...props }: { children: ReactNode; to: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useNavigate: () => navigateMock,
}))

function renderWithQueryClient(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  )
}

describe('TaskDetailPage (integration)', () => {
  const taskId = '11111111-1111-4111-8111-111111111111'
  const baseTask = {
    id: taskId,
    title: 'Original Title',
    description: 'Original description',
    status: 'todo',
    created_at: '2026-11-12T10:00:00Z',
    updated_at: '2026-11-12T10:00:00Z',
  }

  beforeEach(() => {
    navigateMock.mockReset()
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('loads, updates, and deletes a task', async () => {
    let currentTask = { ...baseTask }

    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url === `/api/tasks/${taskId}` && (!init?.method || init.method === 'GET')) {
        return new Response(JSON.stringify(currentTask), { status: 200 })
      }
      if (url === `/api/tasks/${taskId}` && init?.method === 'PATCH') {
        const body = JSON.parse(String(init.body))
        currentTask = { ...currentTask, ...body }
        return new Response(JSON.stringify(currentTask), { status: 200 })
      }
      if (url === `/api/tasks/${taskId}` && init?.method === 'DELETE') {
        return new Response(null, { status: 204 })
      }
      return new Response(null, { status: 404 })
    })
    vi.stubGlobal('fetch', fetchMock)

    renderWithQueryClient(<TaskDetailPage taskId={taskId} />)

    expect(await screen.findByText('Original Title')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Updated Title' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save Task' }))

    await waitFor(() => {
      const patchCall = fetchMock.mock.calls.find(
        (call) => (call[1] as RequestInit | undefined)?.method === 'PATCH',
      )
      expect(patchCall).toBeDefined()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Delete Task' }))
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith({ to: '/' })
    })
  })

  it('renders not-found state when API returns 404', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            error: { code: 'not_found', message: 'Task not found', details: null },
          }),
          { status: 404 },
        ),
      ),
    )

    renderWithQueryClient(<TaskDetailPage taskId={taskId} />)
    expect(await screen.findByText('Task not found')).toBeInTheDocument()
  })
})

