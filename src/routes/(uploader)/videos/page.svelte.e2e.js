import { expect, test } from '@playwright/test';

test('videos should redirect when not logged in', async ({ page }) => {
	await page.goto('/videos');
	await expect(page).toHaveURL(/\/login/);
});
