import { test, expect } from '@playwright/test'

test.describe('Lesson Flow', () => {
  // Note: These tests require mocking external APIs (YouTube, OpenAI)
  // In real implementation, use MSW or test doubles

  test.skip('should generate lesson from YouTube URL', async ({ page }) => {
    await page.goto('/')

    // Enter URL
    await page.fill('[data-testid="url-input"]', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')

    // Select difficulty
    await page.click('[data-testid="difficulty-select"]')
    await page.click('text=Medium')

    // Submit
    await page.click('[data-testid="submit-button"]')

    // Should navigate to lesson page
    await expect(page).toHaveURL(/\/lesson\/dQw4w9WgXcQ/)

    // Should show loading or video player
    // Note: Actual rendering depends on API response time
    await expect(
      page.locator('[data-testid="video-player-container"]').or(page.locator('.animate-pulse'))
    ).toBeVisible({ timeout: 30000 })
  })

  test.skip('should display lesson components when loaded', async ({ page }) => {
    // Navigate directly to lesson page (with mocked data)
    await page.goto('/lesson/dQw4w9WgXcQ?difficulty=easy')

    // Wait for lesson to load
    await expect(page.locator('[data-testid="lesson-card"]')).toBeVisible({ timeout: 30000 })

    // Should show exercises
    await expect(page.locator('[data-testid="exercise-panel"]').or(page.locator('[data-testid="exercise-question"]'))).toBeVisible()

    // Should show vocabulary
    await expect(page.locator('[data-testid="vocabulary-list"]').or(page.locator('[data-testid="vocab-0"]'))).toBeVisible()
  })

  test('should show error page for invalid video ID', async ({ page }) => {
    // Navigate to lesson with invalid video ID
    await page.goto('/lesson/invalid123')

    // Should show 404 or error
    await expect(
      page.locator('text=not found').or(page.locator('text=Failed'))
    ).toBeVisible({ timeout: 10000 })
  })
})
