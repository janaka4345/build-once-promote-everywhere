import { describe, expect, it } from 'vitest'
import { taskCreateSchema, taskSchema, taskUpdateSchema } from './schemas'

describe('task schemas', () => {
  it('trims title and normalizes blank description to null on create', () => {
    const parsed = taskCreateSchema.parse({
      title: '  Write unit tests  ',
      description: '   ',
    })
    expect(parsed).toEqual({
      title: 'Write unit tests',
      description: null,
    })
  })

  it('rejects empty title and unknown fields on create', () => {
    expect(() => taskCreateSchema.parse({ title: '   ' })).toThrow()
    expect(() =>
      taskCreateSchema.parse({ title: 'Valid', extra: true }),
    ).toThrow()
  })

  it('allows partial updates and normalizes blank description to null', () => {
    const parsed = taskUpdateSchema.parse({
      status: 'doing',
      description: '   ',
    })
    expect(parsed).toEqual({
      status: 'doing',
      description: null,
    })
  })

  it('validates task response payload', () => {
    const valid = taskSchema.parse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Test task',
      description: null,
      status: 'todo',
      created_at: '2026-11-12T12:00:00Z',
      updated_at: '2026-11-12T12:00:00Z',
    })
    expect(valid.status).toBe('todo')

    expect(() =>
      taskSchema.parse({
        id: 'not-a-uuid',
        title: 'Test task',
        description: null,
        status: 'invalid',
        created_at: '2026-11-12T12:00:00Z',
        updated_at: '2026-11-12T12:00:00Z',
      }),
    ).toThrow()
  })
})

