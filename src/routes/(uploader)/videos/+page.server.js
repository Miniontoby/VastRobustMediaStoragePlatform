import { db } from '$lib/server/db';
import { video, publicLink } from '$lib/server/db/video.schema';
import { eq } from 'drizzle-orm';

/** @type {import('./$types').PageServerLoad} */
export async function load({ parent, locals }) {
	if (!db) return {};

	const data = await parent();
	const videos = await db.select().from(video)
		.where(eq(video.userId, locals.user.id))
		.leftJoin(publicLink, eq(video.id, publicLink.videoId));

	return {
		...data,
		videos
	};
}
