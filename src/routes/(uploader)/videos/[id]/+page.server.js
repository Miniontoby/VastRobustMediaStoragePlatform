import { db } from '$lib/server/db';
import { video, publicLink } from '$lib/server/db/video.schema';
import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals, params, parent }) {
	if (!db) return {};

	const data = await parent();
	const [videoRow] = await db.select().from(video)
		.where(and(eq(video.userId, locals.user.id), eq(video.id, params.id)))
		.leftJoin(publicLink, eq(video.id, publicLink.videoId));
	if (!videoRow) return error(404);

	return {
		...data,
		video: videoRow
	};
}
