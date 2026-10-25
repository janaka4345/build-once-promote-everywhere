import { z } from 'zod'

export const taskStatusSchema = z.enum(['todo', 'doing', 'done'])
export type TaskStatus = z.infer<typeof taskStatusSchema>

export const taskSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  status: taskStatusSchema,
  created_at: z.string(),
  updated_at: z.string(),
})
export type Task = z.infer<typeof taskSchema>

export const taskListSchema = z.array(taskSchema)

const titleSchema = z.string().trim().min(1).max(200)

const descriptionSchema = z.preprocess((value) => {
  if (value === undefined || value === null) {
    return null
  }
  if (typeof value !== 'string') {
    return value
  }
  const trimmed = value.trim()
  return trimmed.length === 0 ? null : trimmed
}, z.string().max(5000).nullable())

export const taskCreateSchema = z
  .object({
    title: titleSchema,
    description: descriptionSchema.optional(),
    status: taskStatusSchema.optional(),
  })
  .strict()

export type TaskCreateInput = z.input<typeof taskCreateSchema>
export type TaskCreate = z.output<typeof taskCreateSchema>

export const taskUpdateSchema = z
  .object({
    title: titleSchema.optional(),
    description: descriptionSchema.optional(),
    status: taskStatusSchema.optional(),
  })
  .strict()

export type TaskUpdateInput = z.input<typeof taskUpdateSchema>
export type TaskUpdate = z.output<typeof taskUpdateSchema>

export const errorDetailSchema = z.object({
  field: z.string(),
  message: z.string(),
})

export const errorEnvelopeSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.array(errorDetailSchema).nullable(),
  }),
})
