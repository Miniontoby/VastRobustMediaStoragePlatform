import { expect, test } from '@playwright/test';

test('users should redirect when not logged in', async ({ page }) => {
	await page.goto('/users');
	await expect(page).toHaveURL(/\/login/);
});
