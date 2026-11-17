import { expect, test } from '@playwright/test'

test('task create, edit, and delete E2E flow', async ({ page }) => {
  const uniqueTitle = `E2E Task ${Date.now()}`
  const updatedTitle = `${uniqueTitle} Updated`

  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Tasks' })).toBeVisible()

  await page.getByLabel('Title').fill(uniqueTitle)
  await page.getByLabel('Task Description').fill('Created by Playwright E2E')
  await page.getByRole('button', { name: 'Create Task' }).click()

  const taskLink = page.getByRole('link', { name: uniqueTitle })
  await expect(taskLink).toBeVisible()

  await taskLink.click()
  await expect(page.getByRole('heading', { name: 'Edit Task' })).toBeVisible()

  const titleInput = page.getByLabel('Title')
  await titleInput.fill(updatedTitle)
  await page.getByRole('button', { name: 'Save Task' }).click()

  await expect(page.getByRole('heading', { name: updatedTitle })).toBeVisible()

  await page.getByRole('button', { name: 'Delete Task' }).click()
  await expect(page).toHaveURL('/')
  await expect(page.getByRole('link', { name: updatedTitle })).toHaveCount(0)
})

