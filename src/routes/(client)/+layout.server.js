import { error, redirect } from '@sveltejs/kit';
import { resolveRoute } from '$app/paths';

export async function load({ parent, locals }) {
	const data = await parent();
	if (!locals.user)
		return redirect(303, resolveRoute('/demo/better-auth/login'));
	// TODO add roles
	// if (!locals.user.role === 'client')
	//	error(403, 'You need to be client to view this page!');
	return { ...data, user: locals.user };
};
