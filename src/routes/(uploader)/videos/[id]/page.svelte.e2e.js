import { expect, test } from '@playwright/test';

test('video should redirect when not logged in', async ({ page }) => {
	await page.goto('/videos/1');
	await expect(page).toHaveURL(/\/login/);
});
