import { test, expect } from '@playwright/test'

/**
 * VideoPlayer E2E Tests
 *
 * Tests the VideoPlayer component with real YouTube integration.
 * Uses a known short video for testing.
 */
test.describe('VideoPlayer', () => {
  // Use a short, known video for testing
  // This is a public domain test video
  const TEST_VIDEO_ID = 'dQw4w9WgXcQ'

  test.beforeEach(async ({ page }) => {
    // Navigate to the test page with the video player
    await page.goto(`/test/player?videoId=${TEST_VIDEO_ID}`)
  })

  test('should render video player container', async ({ page }) => {
    // Verify the container is visible
    const container = page.locator('[data-testid="video-player-container"]')
    await expect(container).toBeVisible()
  })

  test('should render youtube player element', async ({ page }) => {
    // Verify the player element exists
    const playerElement = page.locator('[data-testid="youtube-player"]')
    await expect(playerElement).toBeVisible()
  })

  test('should load YouTube iframe', async ({ page }) => {
    // Wait for YouTube iframe to be injected by the API
    // This may take a few seconds as the script needs to load
    const iframe = page.locator(`#youtube-player-${TEST_VIDEO_ID} iframe`)
    await expect(iframe).toBeVisible({ timeout: 15000 })
  })

  test('should have correct iframe attributes', async ({ page }) => {
    // Wait for iframe to load
    const iframe = page.locator(`#youtube-player-${TEST_VIDEO_ID} iframe`)
    await expect(iframe).toBeVisible({ timeout: 15000 })

    // YouTube embeds have specific attributes
    await expect(iframe).toHaveAttribute('src', /youtube\.com/)
  })

  test('should show error message when no videoId provided', async ({ page }) => {
    // Navigate without videoId
    await page.goto('/test/player')

    // Should show error message
    const errorMessage = page.locator('text=Missing videoId parameter')
    await expect(errorMessage).toBeVisible()
  })

  test('should display video ID in test page', async ({ page }) => {
    // Verify the video ID is displayed
    const videoIdText = page.locator(`text=${TEST_VIDEO_ID}`)
    await expect(videoIdText).toBeVisible()
  })
})
