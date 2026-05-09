import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ parent, locals }) {
	const data = await parent();
	if (!locals.user)
		return redirect(303, resolve('/demo/better-auth/login'));
	return { ...data, user: locals.user };
};
