import { expect, test } from '@playwright/test';

test('upload should redirect when not logged in', async ({ page }) => {
	await page.goto('/upload');
	await expect(page).toHaveURL(/\/login/);
});
