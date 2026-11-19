// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { TaskListPage } from './TaskListPage'

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    params,
    ...props
  }: {
    children: ReactNode
    to: string
    params?: { taskId?: string }
  }) => (
    <a href={params?.taskId ? `/tasks/${params.taskId}` : to} {...props}>
      {children}
    </a>
  ),
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

describe('TaskListPage (integration)', () => {
  const initialTasks = [
    {
      id: '11111111-1111-4111-8111-111111111111',
      title: 'Existing Todo Task',
      description: 'First item',
      status: 'todo',
      created_at: '2026-11-12T10:00:00Z',
      updated_at: '2026-11-12T10:00:00Z',
    },
    {
      id: '22222222-2222-4222-8222-222222222222',
      title: 'Existing Done Task',
      description: null,
      status: 'done',
      created_at: '2026-11-12T09:00:00Z',
      updated_at: '2026-11-12T09:00:00Z',
    },
  ]

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('loads tasks and creates a new task via the form', async () => {
    let tasks = [...initialTasks]
    const createdTask = {
      id: '33333333-3333-4333-8333-333333333333',
      title: 'New Integration Task',
      description: 'Created from test',
      status: 'todo',
      created_at: '2026-11-12T11:00:00Z',
      updated_at: '2026-11-12T11:00:00Z',
    }

    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url === '/api/tasks' && (!init?.method || init.method === 'GET')) {
        return new Response(JSON.stringify(tasks), { status: 200 })
      }
      if (url === '/api/tasks' && init?.method === 'POST') {
        tasks = [createdTask, ...tasks]
        return new Response(JSON.stringify(createdTask), { status: 201 })
      }
      return new Response(null, { status: 404 })
    })
    vi.stubGlobal('fetch', fetchMock)

    renderWithQueryClient(<TaskListPage />)

    expect(await screen.findByText('Existing Todo Task')).toBeInTheDocument()
    expect(screen.getByText('Existing Done Task')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'New Integration Task' },
    })
    fireEvent.change(screen.getByLabelText('Task Description'), {
      target: { value: 'Created from test' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Create Task' }))

    expect(await screen.findByText('New Integration Task')).toBeInTheDocument()
    expect(screen.getByLabelText('Title')).toHaveValue('')
  })

  it('shows validation error and skips API call when title is blank', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify([]), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    renderWithQueryClient(<TaskListPage />)
    await screen.findByText('No Tasks yet.')

    fireEvent.click(screen.getByRole('button', { name: 'Create Task' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Title')).toHaveAttribute('aria-invalid', 'true')
    })
    const postCalls = fetchMock.mock.calls.filter(
      (call) => (call[1] as RequestInit | undefined)?.method === 'POST',
    )
    expect(postCalls).toHaveLength(0)
  })

  it('fetches and displays the featured product via /api/products/1', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url === '/api/tasks') {
        return new Response(JSON.stringify([]), { status: 200 })
      }
      if (url === '/api/products/1') {
        return new Response(JSON.stringify({ id: 1, title: 'Phone' }), {
          status: 200,
        })
      }
      return new Response(null, { status: 404 })
    })
    vi.stubGlobal('fetch', fetchMock)

    renderWithQueryClient(<TaskListPage />)

    expect(await screen.findByText('Featured product')).toBeInTheDocument()
    expect(screen.getByText('1: Phone')).toBeInTheDocument()
  })
})

