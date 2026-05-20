import { expect, test } from '@playwright/test';

test('userinfo page should redirect when not logged in', async ({ page }) => {
	await page.goto('/demo/better-auth');
	await expect(page).toHaveURL(/\/login/);
});
