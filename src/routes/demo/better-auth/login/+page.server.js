import { fail, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { APIError } from 'better-auth/api';
import { user } from '$lib/server/db/auth.schema.js';
import { db } from '$lib/server/db/index.js';
import { eq } from 'drizzle-orm';

export const load = async (event) => {
	if (event.locals.user) {
		return redirect(302, '/demo/better-auth');
	}
	return await event.parent();
};

export const actions = {
	signInEmail: async (event) => {
		if (!auth)
			return fail(503, { message: 'Service Unavailable', success: false });

		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';

		try {
			await auth.api.signInEmail({
				body: {
					email,
					password,
					callbackURL: '/auth/verification-success'
				}
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Signin failed', success: false });
			}
			return fail(500, { message: 'Unexpected error', success: false });
		}

		return redirect(302, '/demo/better-auth');
	},
	signUpEmail: async (event) => {
		if (!auth || !db)
			return fail(503, { message: 'Service Unavailable' });

		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		const name = formData.get('name')?.toString() ?? '';

		try {
			const u = await auth.api.signUpEmail({
				body: {
					email,
					password,
					name,
					callbackURL: '/auth/verification-success',
				}
			});

			const list = await db.select().from(user).limit(1);
			if (list.length === 0)
				await db.update(user).set({ role: 'admin' }).where(eq(user.id, u.user.id));
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Registration failed', success: false });
			}
			return fail(500, { message: 'Unexpected error', success: false });
		}

		return fail(200, { message: 'Check your email', success: true });
	},
	resetPassword: async (event) => {
		if (!auth)
			return fail(503, { message: 'Service Unavailable', success: false });

		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';

		try {
			await auth.api.requestPasswordReset({
				body: {
					email,
					redirectTo: '/demo/better-auth/reset-password',
				}
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Registration failed', success: false });
			}
			return fail(500, { message: 'Unexpected error', success: false });
		}

		return redirect(302, '/demo/better-auth');
	},
};
