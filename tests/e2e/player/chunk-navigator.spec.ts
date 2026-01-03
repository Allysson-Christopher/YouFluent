import { test, expect } from '@playwright/test'

/**
 * ChunkNavigator E2E Tests
 *
 * Tests the ChunkNavigator component with real YouTube integration.
 * Verifies chunk rendering, highlighting, and navigation.
 */
test.describe('ChunkNavigator', () => {
  // Use a known video for testing
  const TEST_VIDEO_ID = 'dQw4w9WgXcQ'

  test.beforeEach(async ({ page }) => {
    // Navigate to the test page with the video player
    await page.goto(`/test/player?videoId=${TEST_VIDEO_ID}`)
  })

  test('displays chunks when page loads', async ({ page }) => {
    // Wait for chunk navigator to appear
    await expect(page.getByTestId('chunk-navigator')).toBeVisible({ timeout: 10000 })

    // Verify first chunk exists
    await expect(page.getByTestId('chunk-0')).toBeVisible()
  })

  test('displays all mock chunks', async ({ page }) => {
    // Wait for chunks to appear
    await expect(page.getByTestId('chunk-navigator')).toBeVisible({ timeout: 10000 })

    // Verify all 5 mock chunks exist
    await expect(page.getByTestId('chunk-0')).toBeVisible()
    await expect(page.getByTestId('chunk-1')).toBeVisible()
    await expect(page.getByTestId('chunk-2')).toBeVisible()
    await expect(page.getByTestId('chunk-3')).toBeVisible()
    await expect(page.getByTestId('chunk-4')).toBeVisible()
  })

  test('displays chunk count in header', async ({ page }) => {
    // Wait for chunk navigator
    await expect(page.getByTestId('chunk-navigator')).toBeVisible({ timeout: 10000 })

    // Verify header shows correct count
    await expect(page.getByText('Chunks (5)')).toBeVisible()
  })

  test('displays formatted timestamps', async ({ page }) => {
    // Wait for chunk navigator
    await expect(page.getByTestId('chunk-navigator')).toBeVisible({ timeout: 10000 })

    // First chunk should show 0:00 - 0:30
    await expect(page.getByText('0:00 - 0:30')).toBeVisible()

    // Second chunk should show 0:30 - 1:00
    await expect(page.getByText('0:30 - 1:00')).toBeVisible()
  })

  test('displays chunk text preview', async ({ page }) => {
    // Wait for chunk navigator
    await expect(page.getByTestId('chunk-navigator')).toBeVisible({ timeout: 10000 })

    // Verify chunk text is displayed
    await expect(page.getByText(/Introduction to the topic/)).toBeVisible()
  })

  test('navigates to chunk on click', async ({ page }) => {
    // Wait for chunks
    await expect(page.getByTestId('chunk-navigator')).toBeVisible({ timeout: 10000 })

    // Click on third chunk
    await page.getByTestId('chunk-2').click()

    // Wait a moment for state update
    await page.waitForTimeout(500)

    // Verify third chunk gets highlighted (has bg-primary class)
    await expect(page.getByTestId('chunk-2')).toHaveClass(/bg-primary/)
  })

  test('chunk buttons are clickable', async ({ page }) => {
    // Wait for chunks
    await expect(page.getByTestId('chunk-navigator')).toBeVisible({ timeout: 10000 })

    // Verify chunks are buttons and clickable
    const firstChunk = page.getByTestId('chunk-0')
    await expect(firstChunk).toBeEnabled()

    // Click should not throw
    await firstChunk.click()
  })

  test('chunk navigator has proper layout', async ({ page }) => {
    // Wait for chunk navigator
    await expect(page.getByTestId('chunk-navigator')).toBeVisible({ timeout: 10000 })

    // Verify the navigator container exists with proper layout
    const navigator = page.getByTestId('chunk-navigator')
    await expect(navigator).toBeVisible()

    // Verify header exists
    await expect(page.getByText(/Chunks \(\d+\)/)).toBeVisible()
  })

  test('chunk index displays correctly', async ({ page }) => {
    // Wait for chunks
    await expect(page.getByTestId('chunk-navigator')).toBeVisible({ timeout: 10000 })

    // Verify chunk indices are displayed (e.g., "1/5", "2/5")
    await expect(page.getByText('1/5')).toBeVisible()
    await expect(page.getByText('3/5')).toBeVisible()
    await expect(page.getByText('5/5')).toBeVisible()
  })
})
