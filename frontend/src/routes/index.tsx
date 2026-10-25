import { createFileRoute } from '@tanstack/react-router'

import { TaskListPage } from '#/features/tasks/TaskListPage'

export const Route = createFileRoute('/')({ component: TaskListPage })
