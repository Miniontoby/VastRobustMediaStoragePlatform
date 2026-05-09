import { resolve } from '$app/paths';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { error, redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals, parent }) {
	if (!db || !auth)
		return error(503, 'Service Unavailable');

	if (!locals.user)
		return redirect(303, resolve('/demo/better-auth/login'));

	const userId = locals.user.id;
	const permissionsResponse = await auth.api.userHasPermission({
		body: {
			userId,
			permissions: {
				video: ['upload']
			}
		},
	});
	if (!permissionsResponse.success)
		return error(403, 'Forbidden');

	return await parent();
}
