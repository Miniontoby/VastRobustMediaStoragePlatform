import { db } from '$lib/server/db';
import { video } from '$lib/server/db/video.schema';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, parent, locals }) {
	if (!db) return {};

	const data = await parent();
	const videoFile = await db.select().from(video).where(eq(video.id, Number(params.id))).limit(1);

	return {
		...data,
		video: videoFile
	};
}
