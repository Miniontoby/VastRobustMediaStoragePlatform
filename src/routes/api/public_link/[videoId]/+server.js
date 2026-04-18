import { json } from '@sveltejs/kit';
import { randomUUID } from 'crypto';
import { db } from '$lib/server/db';
import { video, publicLink } from '$lib/server/db/video.schema';
import { eq } from 'drizzle-orm';

/**
 * Initializes an upload session.
 * Must be called before any chunk uploads.
 * @type {import('./$types').RequestHandler}
 */
export const POST = async ({ params, locals }) => {
	if (!db) return json({ error: 'Unexpected error' }, { status: 500 });

	if (!locals.user) return json({ error: 'Not logged in' }, { status: 400 });

	const userId = locals.user.id;

	const { videoId } = params;

	if (!videoId) {
		return json({ error: 'Missing videoId' }, { status: 400 });
	}

	const [videoSession] = await db.select().from(video).where(eq(video.id, videoId)).limit(1);

	if (!videoSession || videoSession.userId !== userId) {
		return json({ error: 'Unknown videoId' }, { status: 404 });
	}

	const [session] = await db.select().from(publicLink).where(eq(publicLink.videoId, videoId)).limit(1);
	if (session) {
		return json({ error: 'Already has a public link' }, { status: 400 });
	}

	const linkId = randomUUID();

	await db.insert(publicLink).values({
		id: linkId,
		videoId,
		URL: linkId,
	});

	return json({ linkId }, { status: 201 });
};
