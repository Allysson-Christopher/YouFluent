import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should render home page with form', async ({ page }) => {
    await page.goto('/')

    // Check title
    await expect(page.locator('h1')).toContainText('Learn English with YouTube')

    // Check form elements
    await expect(page.locator('[data-testid="url-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="difficulty-select"]')).toBeVisible()
    await expect(page.locator('[data-testid="submit-button"]')).toBeVisible()
  })

  test('should have difficulty selector with options', async ({ page }) => {
    await page.goto('/')

    // Open select
    await page.click('[data-testid="difficulty-select"]')

    // Check options
    await expect(page.locator('text=Easy')).toBeVisible()
    await expect(page.locator('text=Medium')).toBeVisible()
    await expect(page.locator('text=Hard')).toBeVisible()
  })

  test('should show error for invalid URL', async ({ page }) => {
    await page.goto('/')

    // Enter invalid URL
    await page.fill('[data-testid="url-input"]', 'not-a-youtube-url')
    await page.click('[data-testid="submit-button"]')

    // Check error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText('valid YouTube URL')
  })

  test('should accept valid YouTube URLs', async ({ page }) => {
    await page.goto('/')

    // Enter valid URL
    await page.fill('[data-testid="url-input"]', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')

    // Button should be enabled
    await expect(page.locator('[data-testid="submit-button"]')).toBeEnabled()
  })

  test('should navigate to lesson page on valid URL submit', async ({ page }) => {
    await page.goto('/')

    // Enter valid URL
    await page.fill('[data-testid="url-input"]', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')

    // Select difficulty
    await page.click('[data-testid="difficulty-select"]')
    await page.click('text=Easy')

    // Submit
    await page.click('[data-testid="submit-button"]')

    // Should navigate to lesson page
    await expect(page).toHaveURL(/\/lesson\/dQw4w9WgXcQ\?difficulty=easy/)
  })
})
