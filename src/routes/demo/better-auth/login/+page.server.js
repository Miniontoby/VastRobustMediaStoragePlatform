import { fail, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { APIError } from 'better-auth/api';

export const load = async (event) => {
	if (event.locals.user) {
		return redirect(302, '/demo/better-auth');
	}
	return await event.parent();
};

export const actions = {
	signInEmail: async (event) => {
		if (!auth)
			return fail(503, { message: 'Service Unavailable' });

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
				return fail(400, { message: error.message || 'Signin failed' });
			}
			return fail(500, { message: 'Unexpected error' });
		}

		return redirect(302, '/demo/better-auth');
	},
	signUpEmail: async (event) => {
		if (!auth)
			return fail(503, { message: 'Service Unavailable' });
		const isFirst = (await auth.api.listUsers()).total === 0;

		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		const name = formData.get('name')?.toString() ?? '';

		try {
			await auth.api.signUpEmail({
				body: {
					email,
					password,
					name,
					callbackURL: '/auth/verification-success',
					// @ts-ignore
					role: isFirst ? 'admin' : 'user', // Give the first user admin rights
				}
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Registration failed' });
			}
			return fail(500, { message: 'Unexpected error' });
		}

		return redirect(302, '/demo/better-auth');
	},
	resetPassword: async (event) => {
		if (!auth)
			return fail(503, { message: 'Service Unavailable' });

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
				return fail(400, { message: error.message || 'Registration failed' });
			}
			return fail(500, { message: 'Unexpected error' });
		}

		return redirect(302, '/demo/better-auth');
	},
};
