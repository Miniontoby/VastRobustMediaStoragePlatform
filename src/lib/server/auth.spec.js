import { describe, it, expect, beforeAll } from 'vitest';
import { auth } from './auth';

describe('authentication tests', () => {
	if (!auth) return;
	
	/** @type {import('better-auth/plugins').TestHelpers} */
    let test;

    beforeAll(async () => {
		if (!auth) return;
        const ctx = await auth.$context;
        test = ctx.test;
    });

    it('should return user data for authenticated request', async () => {
		if (!auth) return;

        // Setup
        const user = test.createUser({ email: 'test@example.com' });
        await test.saveUser(user);

        // Get authenticated headers
        const headers = await test.getAuthHeaders({ userId: user.id });

        // Test authenticated request
        const session = await auth.api.getSession({ headers });
        expect(session?.user.id).toBe(user.id);

        // Cleanup
        await test.deleteUser(user.id);
    });

    it('should have admin account support', async () => {
		if (!auth) return;

        // Setup
        const user = test.createUser({ email: 'admin@example.com', role: 'admin' });
        await test.saveUser(user);

        // Get authenticated headers
        const headers = await test.getAuthHeaders({ userId: user.id });

        // Test authenticated request
        const session = await auth.api.getSession({ headers });
        expect(session?.user.id).toBe(user.id);
		// @ts-expect-error role is not documentated
		expect(session?.user.role).toBe('admin');

        // Cleanup
        await test.deleteUser(user.id);
    });

    it('should have uploader account support', async () => {
		if (!auth) return;

        // Setup
        const user = test.createUser({ email: 'uploader@example.com', role: 'uploader' });
        await test.saveUser(user);

        // Get authenticated headers
        const headers = await test.getAuthHeaders({ userId: user.id });

        // Test authenticated request
        const session = await auth.api.getSession({ headers });
        expect(session?.user.id).toBe(user.id);
		// @ts-expect-error role is not documentated
		expect(session?.user.role).toBe('uploader');

        // Cleanup
        await test.deleteUser(user.id);
    });

    it('should have user account support', async () => {
		if (!auth) return;

        // Setup
        const user = test.createUser({ email: 'user@example.com', role: 'user' });
        await test.saveUser(user);

        // Get authenticated headers
        const headers = await test.getAuthHeaders({ userId: user.id });

        // Test authenticated request
        const session = await auth.api.getSession({ headers });
        expect(session?.user.id).toBe(user.id);
		// @ts-expect-error role is not documentated
		expect(session?.user.role).toBe('user');

        // Cleanup
        await test.deleteUser(user.id);
    });
}, 60e3);