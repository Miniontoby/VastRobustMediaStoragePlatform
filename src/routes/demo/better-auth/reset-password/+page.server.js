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
	default: async (event) => {
		if (!auth)
			return fail(503, { message: 'Service Unavailable' });

		const formData = await event.request.formData();
		const newPassword = formData.get('newPassword')?.toString() || undefined;
		const token = new URLSearchParams(event.url.search).get('token') || undefined;

		if (!newPassword)
			return fail(400, { message: 'Password is missing' });

		try {
			await auth.api.resetPassword({
				body: {
					newPassword,
					token,
				}
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Reset failed' });
			}
			return fail(500, { message: 'Unexpected error' });
		}

		return redirect(302, '/demo/better-auth');
	}
};
