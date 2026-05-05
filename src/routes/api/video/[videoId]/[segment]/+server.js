import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { video, publicLink } from '$lib/server/db/video.schema';
import { eq } from 'drizzle-orm';
import path from 'path';
import { createReadStream } from 'fs';
import { json } from '@sveltejs/kit';

const UPLOAD_DIR = env.UPLOAD_DIR ?? '/tmp/uploads';

/**
 * @type {import('./$types').RequestHandler}
 */
export const GET = async ({ params, locals, url }) => {
	if (!db) return json({ error: 'Unexpected error' }, { status: 500 });

	const { videoId, segment } = params;

	// Validate segment filename to prevent path traversal
	if (!/^seg\d+\.ts$/.test(segment)) return json({ error: 'Invalid segment' }, { status: 400 });

	const [row] = await db.select().from(video).where(eq(video.id, videoId)).limit(1);
	if (!row) return json({ error: 'Not found' }, { status: 404 });

	const isOwner = locals.user?.id === row.userId;
	if (!isOwner) {
		const token = url.searchParams.get('token');
		if (!token) return json({ error: 'Unauthorized' }, { status: 401 });

		const [link] = await db.select().from(publicLink).where(eq(publicLink.URL, token)).limit(1);
		if (!link || link.videoId !== videoId) return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const segmentPath = path.join(UPLOAD_DIR, 'hls', videoId, segment);

	const stream = createReadStream(segmentPath);
	stream.on('error', () => {});

	// @ts-ignore Argument of type 'ReadStream' is not assignable to parameter of type 'BodyInit | null | undefined'.
	return new Response(stream, {
		headers: {
			'Content-Type': 'video/mp2t',
			'Cache-Control': 'private, max-age=3600',
		},
	});
};