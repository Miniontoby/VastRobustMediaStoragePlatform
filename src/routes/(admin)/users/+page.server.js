import { resolve } from '$app/paths';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/auth.schema';
import { error, redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ parent, locals }) {
	if (!db || !auth)
		return error(503, 'Service Unavailable');

	if (!locals.user)
		return redirect(303, resolve('/demo/better-auth/login'));

	const userId = locals.user.id;
	const permissionsResponse = await auth.api.userHasPermission({
		body: {
			userId,
			permissions: { user: ['list'] }
		},
	});
	if (!permissionsResponse.success)
		return error(403, 'Forbidden');

	const data = await parent();
	const users = await db.select({
		id: user.id,
		name: user.name,
		email: user.email,
		emailVerified: user.emailVerified,
		createdAt: user.createdAt,
		role: user.role,
		banned: user.banned,
		banReason: user.banReason,
		banExpires: user.banExpires,
	}).from(user);

	return {
		...data,
		users
	};
}
