import { fail, redirect } from '@sveltejs/kit';


import { auth } from '$lib/server/auth';

export const load = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/demo/better-auth/login');
	}
	return { ...(await event.parent()), user: event.locals.user };
};

export const actions = {
	signOut: async (event) => {
		if (!auth) return fail(500, { message: 'Unexpected error' });

		await auth.api.signOut({
			headers: event.request.headers
		});
		return redirect(302, '/demo/better-auth/login');
	}
};
