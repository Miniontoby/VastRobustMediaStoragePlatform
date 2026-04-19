import { json } from '@sveltejs/kit';
import { randomUUID } from 'crypto';
import { createReadStream, existsSync } from 'fs';
import path from 'path';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { video, publicLink } from '$lib/server/db/video.schema';
import { eq } from 'drizzle-orm';
import { stat } from 'fs/promises';

const UPLOAD_DIR = env.UPLOAD_DIR ?? '/tmp/uploads';

export const GET = async({ request, params }) => {
	if (!db) return json({ error: 'Unexpected error' }, { status: 500 });

	const { videoId } = params;

	if (!videoId) {
		return json({ error: 'Missing videoId' }, { status: 400 });
	}

	const [session] = await db.select().from(publicLink).where(eq(publicLink.videoId, videoId)).limit(1);
	if (!session) {
		return json({ error: 'File does not exist' }, { status: 404 });
	}

	const filePath = path.join(UPLOAD_DIR, session.videoId + ".mp4");
	if (!existsSync(filePath)) {
		return json({ error: 'File is missing, re-init required' }, { status: 400 });
	}

	const fstat = await stat(filePath);
	const total = fstat.size;

	const range = request.headers.get('range');
	if (range) { // && range !== "bytes=0-") {
		const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
		const start = parseInt(startStr, 10);
		let end = endStr ? parseInt(endStr, 10) : total - 1;
		if (isNaN(end)) end = total - 1;
		const chunkSize = end - start + 1;

		// @ts-ignore
		return new Response(createReadStream(filePath, { start, end }), {
			status: 206,
			headers: {
				'Content-Type': 'video/mp4',
				'Content-Range': `bytes ${start}-${end}/${total}`,
				'Accept-Range': 'bytes',
				'Content-Length': String(chunkSize),
				'Cache-Control': 'no-store',
				'Content-Disposition': 'inline',
			}
		})
	}

	// @ts-ignore
	return new Response(createReadStream(filePath), {
		headers: {
			'Content-Type': 'video/mp4',
			'Content-Length': String(total),
			'Accept-Range': 'bytes',
			'Cache-Control': 'no-store',
			'Content-Disposition': 'inline',
		}
	})
}

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
		return json({ error: 'Already has a public link', ...session }, { status: 400 });
	}

	const linkId = randomUUID();

	const data = await db.insert(publicLink).values({
		id: linkId,
		videoId,
		URL: linkId,
	});

	return json({ data, linkId }, { status: 201 });
};
