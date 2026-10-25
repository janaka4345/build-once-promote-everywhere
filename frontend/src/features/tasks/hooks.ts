import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createTask,
  deleteTask,
  getTask,
  isNotFoundError,
  listTasks,
  updateTask,
  type TaskCreateInput,
  type TaskUpdateInput,
} from '#/api'
import { taskKeys } from './queryKeys'

export function useTasksQuery() {
  return useQuery({
    queryKey: taskKeys.all,
    queryFn: listTasks,
  })
}

export function useTaskQuery(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => getTask(id),
  })
}

export function useCreateTaskMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: TaskCreateInput) => createTask(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: taskKeys.all })
    },
  })
}

export function useUpdateTaskMutation(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: TaskUpdateInput) => updateTask(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: taskKeys.all })
    },
  })
}

export function useDeleteTaskMutation(id: string) {
  const queryClient = useQueryClient()

  async function dropDeletedTaskQueries() {
    queryClient.removeQueries({ queryKey: taskKeys.detail(id) })
    await queryClient.invalidateQueries({ queryKey: taskKeys.all })
  }

  return useMutation({
    mutationFn: () => deleteTask(id),
    onSuccess: dropDeletedTaskQueries,
    onError: async (error) => {
      if (isNotFoundError(error)) {
        await dropDeletedTaskQueries()
      }
    },
  })
}
