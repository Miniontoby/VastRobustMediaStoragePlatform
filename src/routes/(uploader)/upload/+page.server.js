import { redirect } from '@sveltejs/kit';

export const load = (event) => {
	if (!event.locals.user) {
		return redirect(302, '/demo/better-auth/login');
	}
	return { user: event.locals.user };
};
