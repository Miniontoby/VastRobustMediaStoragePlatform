import { db } from '$lib/server/db';
import { video, publicLink } from '$lib/server/db/video.schema';
import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, parent }) {
	if (!db) return {};

	const data = await parent();
	const [videoRow] = await db.select().from(publicLink)
		.where(and(eq(publicLink.URL, params.publicLink)))
		.leftJoin(video, eq(publicLink.videoId, video.id));
	if (!videoRow) return error(404);

	return {
		...data,
		videoRow
	};
}
