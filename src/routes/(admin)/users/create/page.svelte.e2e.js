import { expect, test } from '@playwright/test';

test('users create should redirect when not logged in', async ({ page }) => {
	await page.goto('/users/create');
	await expect(page).toHaveURL(/\/login/);
});
