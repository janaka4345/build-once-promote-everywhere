import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'

import { isNotFoundError } from '#/api'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'

import { EditTaskForm } from './EditTaskForm'
import { useDeleteTaskMutation, useTaskQuery } from './hooks'

export function TaskDetailPage({ taskId }: { taskId: string }) {
  const navigate = useNavigate()
  const taskQuery = useTaskQuery(taskId)
  const deleteTask = useDeleteTaskMutation(taskId)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function onDelete() {
    setDeleteError(null)
    try {
      await deleteTask.mutateAsync()
      await navigate({ to: '/' })
    } catch (error) {
      if (isNotFoundError(error)) {
        await navigate({ to: '/' })
        return
      }
      setDeleteError('Could not delete Task')
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 bg-background px-6 py-10 text-foreground">
      <header className="flex flex-col gap-2">
        <p className="text-sm">
          <Link to="/" className="text-muted-foreground underline-offset-4 hover:underline">
            ← All Tasks
          </Link>
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Edit Task</h1>
        <p className="text-muted-foreground">
          Update title, Task Description, and Task Status.
        </p>
      </header>

      {taskQuery.isPending ? (
        <p className="text-sm text-muted-foreground">Loading Task…</p>
      ) : null}

      {taskQuery.isError ? <TaskLoadError error={taskQuery.error} /> : null}

      {taskQuery.data ? (
        <Card>
          <CardHeader>
            <CardTitle>{taskQuery.data.title}</CardTitle>
            <CardDescription>
              Clear Task Description to remove it. Task Status can move freely
              among todo, doing, and done.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <EditTaskForm task={taskQuery.data} />
            <div className="flex flex-col gap-2 border-t border-border pt-6">
              <Button
                type="button"
                variant="outline"
                disabled={deleteTask.isPending}
                onClick={onDelete}
              >
                {deleteTask.isPending ? 'Deleting…' : 'Delete Task'}
              </Button>
              {deleteError ? (
                <p className="text-sm text-destructive">{deleteError}</p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </main>
  )
}

function TaskLoadError({ error }: { error: unknown }) {
  if (isNotFoundError(error)) {
    return (
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-card px-4 py-6 text-card-foreground">
        <p className="font-medium">Task not found</p>
        <p className="text-sm text-muted-foreground">
          This Task does not exist or was removed.
        </p>
      </div>
    )
  }

  return (
    <p className="text-sm text-destructive">Could not load Task</p>
  )
}
