import { expect, test } from '@playwright/test';

test('login page should exist when not logged in', async ({ page }) => {
	await page.goto('/demo/better-auth/login');
	await expect(page.locator('h1')).toBeVisible();
	await expect(page.locator('h1')).toHaveText('Login');
});
