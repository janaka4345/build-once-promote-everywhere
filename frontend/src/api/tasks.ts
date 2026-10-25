import { apiFetch } from './client'
import {
  taskCreateSchema,
  taskListSchema,
  taskSchema,
  taskUpdateSchema,
  type Task,
  type TaskCreateInput,
  type TaskUpdateInput,
} from './schemas'

export async function listTasks(): Promise<Task[]> {
  return apiFetch('/tasks', { method: 'GET' }, (data) =>
    taskListSchema.parse(data),
  )
}

export async function getTask(id: string): Promise<Task> {
  return apiFetch(`/tasks/${id}`, { method: 'GET' }, (data) =>
    taskSchema.parse(data),
  )
}

export async function createTask(input: TaskCreateInput): Promise<Task> {
  const body = taskCreateSchema.parse(input)
  return apiFetch(
    '/tasks',
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
    (data) => taskSchema.parse(data),
  )
}

export async function updateTask(
  id: string,
  input: TaskUpdateInput,
): Promise<Task> {
  const body = taskUpdateSchema.parse(input)
  return apiFetch(
    `/tasks/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    },
    (data) => taskSchema.parse(data),
  )
}

export async function deleteTask(id: string): Promise<void> {
  return apiFetch(`/tasks/${id}`, { method: 'DELETE' }, (data) => {
    if (data !== undefined) {
      throw new Error('Expected empty body on DELETE')
    }
  })
}
