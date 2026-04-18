import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';

export async function load({ parent, locals }) {
	const data = await parent();
	if (!locals.user)
		return redirect(303, resolve('/demo/better-auth/login'));
	// TODO add roles
	// if (!locals.user.role === 'uploader')
	//	error(403, 'You need to be uploader to view this page!');
	return { ...data, user: locals.user };
};
