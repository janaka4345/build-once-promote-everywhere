import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'

import type { Task, TaskStatus } from '#/api'
import { getApiUrl } from '#/api/client'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Label } from '#/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'

import { CreateTaskForm } from './CreateTaskForm'
import { useTasksQuery } from './hooks'

type StatusFilter = 'all' | TaskStatus

type Product = {
  id: number
  title: string
}

function TaskRow({ task }: { task: Task }) {
  return (
    <li className="flex items-baseline justify-between gap-4 border-b border-border py-3 last:border-b-0">
      <Link
        to="/tasks/$taskId"
        params={{ taskId: task.id }}
        className="font-medium text-foreground underline-offset-4 hover:underline"
      >
        {task.title}
      </Link>
      <span className="shrink-0 text-sm text-muted-foreground">
        {task.status}
      </span>
    </li>
  )
}

function filterTasksByStatus(
  tasks: Task[],
  statusFilter: StatusFilter,
): Task[] {
  if (statusFilter === 'all') {
    return tasks
  }
  return tasks.filter((task) => task.status === statusFilter)
}

export function TaskListPage() {
  const tasksQuery = useTasksQuery()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [product, setProduct] = useState<Product | null>(null)

  useEffect(() => {
    let active = true
    fetch(getApiUrl('/api/products/1'))
      .then((res) => {
        if (!res.ok) throw new Error(`Product request failed: ${res.status}`)
        return res.json() as Promise<Product>
      })
      .then((data) => {
        if (active) setProduct(data)
      })
      .catch(() => {
        // Ignore optional featured product failures so task list stays usable.
      })
    return () => {
      active = false
    }
  }, [])

  const visibleTasks = tasksQuery.data
    ? filterTasksByStatus(tasksQuery.data, statusFilter)
    : undefined

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 bg-background px-6 py-10 text-foreground">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Tasks</h1>
        <p className="text-muted-foreground">
          Create a Task and see the full list, newest first.
        </p>
      </header>

      {product ? (
        <section className="rounded-xl border border-border bg-card px-4 py-3 text-card-foreground">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Featured product
          </h2>
          <p className="text-base font-medium">
            {product.id}: {product.title}
          </p>
        </section>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Create Task</CardTitle>
          <CardDescription>
            Title is required. Task Description and Task Status are optional.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateTaskForm />
        </CardContent>
      </Card>

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-xl font-semibold">All Tasks</h2>
          <div className="flex w-full flex-col gap-2 sm:w-48">
            <Label htmlFor="task-status-filter">Filter by Task Status</Label>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as StatusFilter)}
            >
              <SelectTrigger id="task-status-filter" className="w-full">
                <SelectValue placeholder="All Task Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">all</SelectItem>
                <SelectItem value="todo">todo</SelectItem>
                <SelectItem value="doing">doing</SelectItem>
                <SelectItem value="done">done</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {tasksQuery.isPending ? (
          <p className="text-sm text-muted-foreground">Loading Tasks…</p>
        ) : null}
        {tasksQuery.isError ? (
          <p className="text-sm text-destructive">
            {tasksQuery.error instanceof Error
              ? tasksQuery.error.message
              : 'Failed to load Tasks'}
          </p>
        ) : null}
        {tasksQuery.data && visibleTasks ? (
          tasksQuery.data.length === 0 ? (
            <p className="text-sm text-muted-foreground">No Tasks yet.</p>
          ) : visibleTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No Tasks with this Task Status.
            </p>
          ) : (
            <ul className="rounded-xl border border-border bg-card px-4 text-card-foreground">
              {visibleTasks.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </ul>
          )
        ) : null}
      </section>
    </main>
  )
}
