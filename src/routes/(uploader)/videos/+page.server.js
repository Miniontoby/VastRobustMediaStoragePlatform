import { db } from '$lib/server/db';
import { video } from '$lib/server/db/video.schema';

/** @type {import('./$types').PageServerLoad} */
export async function load({ parent, locals }) {
	if (!db) return {};

	const data = await parent();
	const videos = await db.select().from(video).where(eq(video.userId, locals.user.id));

	return {
		...data,
		videos
	};
}
