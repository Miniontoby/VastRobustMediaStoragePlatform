import { error, fail, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { APIError } from 'better-auth/api';
import { resolve } from '$app/paths';

export const load = async ({ locals, parent }) => {
	if (!auth)
		return error(503, 'Service Unavailable');

	if (!locals.user)
		return redirect(303, resolve('/demo/better-auth/login'));

	const userId = locals.user.id;
	const permissionsResponse = await auth.api.userHasPermission({
		body: {
			userId,
			permissions: { user: ['create'] }
		},
	});
	if (!permissionsResponse.success)
		return error(403, 'Forbidden');

	return await parent();
};

export const actions = {
	default: async (event) => {
		if (!auth)
			return fail(503, { message: 'Service Unavailable' });

		if (!event.locals.user)
			return redirect(303, resolve('/demo/better-auth/login'));

		const userId = event.locals.user.id;
		const permissionsResponse = await auth.api.userHasPermission({
			body: {
				userId,
				permissions: { user: ['create'] }
			},
		});
		if (!permissionsResponse.success)
			return fail(403, { message: 'Forbidden' });

		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		const name = formData.get('name')?.toString() ?? '';
		const role = formData.get('role')?.toString();

		if (!role || (role !== 'user' && role !== 'admin' && role !== 'uploader'))
			return fail(400, { message: 'Incorrect role' });

		try {
			await auth.api.createUser({
				body: {
					email,
					password,
					name,
					role
				}
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Registration failed' });
			}
			return fail(500, { message: 'Unexpected error' });
		}

		return redirect(302, resolve('/(admin)/users'));
	},
};
