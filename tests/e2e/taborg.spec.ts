import { test, expect } from '@playwright/test';

test.describe('TabOrg Extension', () => {
  test.beforeEach(async ({ page }) => {
    // Load the extension
    await page.goto('chrome://extensions');
    await page.click('button[aria-label="Load unpacked"]');
    // Note: In a real test environment, you'd need to handle file selection
  });

  test('should open popup and show tabs', async ({ page }) => {
    // Click extension icon
    await page.click('[data-testid="extension-icon"]');
    
    // Wait for popup to load
    await page.waitForSelector('[data-testid="tabs-overview"]');
    
    // Check if tabs are displayed
    const tabs = await page.$$('[data-testid="tab-item"]');
    expect(tabs.length).toBeGreaterThan(0);
  });

  test('should suggest tab groups', async ({ page }) => {
    // Click extension icon
    await page.click('[data-testid="extension-icon"]');
    
    // Click AI Suggest button
    await page.click('[data-testid="ai-suggest-button"]');
    
    // Wait for suggestions
    await page.waitForSelector('[data-testid="suggestion-group"]');
    
    // Check if suggestions are displayed
    const suggestions = await page.$$('[data-testid="suggestion-group"]');
    expect(suggestions.length).toBeGreaterThan(0);
  });

  test('should create manual group', async ({ page }) => {
    // Click extension icon
    await page.click('[data-testid="extension-icon"]');
    
    // Enter keyword
    await page.fill('[data-testid="manual-group-input"]', 'github');
    
    // Wait for matching tabs
    await page.waitForSelector('[data-testid="matching-tab"]');
    
    // Click create group button
    await page.click('[data-testid="create-group-button"]');
    
    // Check if group was created
    await page.waitForSelector('[data-testid="group-created-message"]');
  });

  test('should show admin page', async ({ page }) => {
    // Navigate to admin page
    await page.goto('chrome-extension://[extension-id]/admin.html');
    
    // Check if metrics are displayed
    await page.waitForSelector('[data-testid="total-groups"]');
    await page.waitForSelector('[data-testid="total-actions"]');
    
    // Check if active groups are displayed
    await page.waitForSelector('[data-testid="active-groups"]');
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Click extension icon
    await page.click('[data-testid="extension-icon"]');
    
    // Trigger an error (e.g., by disconnecting from internet)
    // This would need to be handled differently in a real test environment
    
    // Check if error modal is displayed
    await page.waitForSelector('[data-testid="error-modal"]');
    
    // Check error message
    const errorMessage = await page.textContent('[data-testid="error-message"]');
    expect(errorMessage).toBeTruthy();
  });
}); 