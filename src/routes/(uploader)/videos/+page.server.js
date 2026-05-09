import { resolve } from '$app/paths';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { video, publicLink, videoAccess } from '$lib/server/db/video.schema';
import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

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
			permissions: { video: ['list'] }
		},
	});
	if (!permissionsResponse.success)
		return error(403, 'Forbidden');

	const data = await parent();
	const videos = await db.select().from(video)
		.where(eq(video.userId, userId))
		.leftJoin(publicLink, eq(video.id, publicLink.videoId));
	const sharedVideos = await db.select().from(videoAccess)
		.where(eq(videoAccess.userId, userId))
		.rightJoin(video, eq(video.id, videoAccess.videoId));

	return {
		...data,
		videos,
		sharedVideos
	};
}
