import { expect, test } from '@playwright/test';

test('user should redirect when not logged in', async ({ page }) => {
	await page.goto('/users/1');
	await expect(page).toHaveURL(/\/login/);
});
