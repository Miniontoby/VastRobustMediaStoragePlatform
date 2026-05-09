import { resolve } from '$app/paths';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { video, publicLink, videoAccess } from '$lib/server/db/video.schema';
import { error, redirect } from '@sveltejs/kit';
import { and, eq, exists, or } from 'drizzle-orm';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals, params, parent }) {
	if (!db || !auth)
		return error(503, 'Service Unavailable');

	if (!locals.user)
		return redirect(303, resolve('/demo/better-auth/login'));

	const userId = locals.user.id;
	const permissionsResponse = await auth.api.userHasPermission({
		body: {
			userId,
			permissions: {
				file: ['watch'],
			}
		},
	});
	if (!permissionsResponse.success)
		return error(403, 'Forbidden');

	const data = await parent();
	const [videoRow] = await db.select().from(video)
		.where(
			and(
				eq(video.id, params.id),
				or(
					eq(video.userId, userId), // Is the uploader
					exists( // has specific access
						db.select()
						.from(videoAccess)
						.where(
							and(
								eq(videoAccess.videoId, video.id),
								eq(videoAccess.userId, userId)
							)
						)
					)
				),
			)
		)
		.leftJoin(publicLink, eq(video.id, publicLink.videoId));
	if (!videoRow) return error(404);

	return {
		...data,
		videoRow,
		isOwner: videoRow.video.userId === userId
	};
}
