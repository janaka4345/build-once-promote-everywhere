import { useEffect, useState, type FormEvent } from 'react'

import {
  ApiError,
  isNotFoundError,
  taskUpdateSchema,
  type Task,
  type TaskStatus,
} from '#/api'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Textarea } from '#/components/ui/textarea'

import { useUpdateTaskMutation } from './hooks'

type FormErrors = {
  title?: string
  description?: string
  status?: string
  form?: string
}

export function EditTaskForm({ task }: { task: Task }) {
  const updateTask = useUpdateTaskMutation(task.id)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description ?? '')
  const [status, setStatus] = useState<TaskStatus>(task.status)
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    setTitle(task.title)
    setDescription(task.description ?? '')
    setStatus(task.status)
    setErrors({})
  }, [task])

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrors({})

    const parsed = taskUpdateSchema.safeParse({
      title,
      description: description.length === 0 ? null : description,
      status,
    })

    if (!parsed.success) {
      const next: FormErrors = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]
        if (field === 'title' || field === 'description' || field === 'status') {
          next[field] = issue.message
        }
      }
      setErrors(next)
      return
    }

    try {
      await updateTask.mutateAsync(parsed.data)
    } catch (error) {
      if (isNotFoundError(error)) {
        setErrors({ form: 'Task not found' })
        return
      }
      if (error instanceof ApiError) {
        const next: FormErrors = {
          form:
            error.code === 'validation_error'
              ? error.message
              : 'Could not update Task',
        }
        for (const detail of error.details ?? []) {
          if (
            detail.field === 'title' ||
            detail.field === 'description' ||
            detail.field === 'status'
          ) {
            next[detail.field] = detail.message
          }
        }
        setErrors(next)
        return
      }
      setErrors({ form: 'Could not update Task' })
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="edit-task-title">Title</Label>
        <Input
          id="edit-task-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          aria-invalid={Boolean(errors.title)}
        />
        {errors.title ? (
          <p className="text-sm text-destructive">{errors.title}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="edit-task-description">Task Description</Label>
        <Textarea
          id="edit-task-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={4}
          aria-invalid={Boolean(errors.description)}
        />
        {errors.description ? (
          <p className="text-sm text-destructive">{errors.description}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="edit-task-status">Task Status</Label>
        <Select
          value={status}
          onValueChange={(value) => setStatus(value as TaskStatus)}
        >
          <SelectTrigger id="edit-task-status" className="w-full">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todo">todo</SelectItem>
            <SelectItem value="doing">doing</SelectItem>
            <SelectItem value="done">done</SelectItem>
          </SelectContent>
        </Select>
        {errors.status ? (
          <p className="text-sm text-destructive">{errors.status}</p>
        ) : null}
      </div>

      {errors.form ? (
        <p className="text-sm text-destructive">{errors.form}</p>
      ) : null}

      <Button type="submit" disabled={updateTask.isPending}>
        {updateTask.isPending ? 'Saving…' : 'Save Task'}
      </Button>
    </form>
  )
}
