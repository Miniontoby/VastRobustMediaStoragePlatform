import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { video, publicLink } from '$lib/server/db/video.schema';
import { eq } from 'drizzle-orm';
import path from 'path';
import { readFile } from 'fs/promises';
import { json } from '@sveltejs/kit';
import { resolve } from '$app/paths';

const UPLOAD_DIR = env.UPLOAD_DIR ?? '/tmp/uploads';

/**
 * @type {import('./$types').RequestHandler}
 */
export const GET = async ({ params, locals, url }) => {
	if (!db) return json({ error: 'Unexpected error' }, { status: 500 });

	const { videoId } = params;

	// Check auth — either owner or valid public link
	const [row] = await db.select().from(video).where(eq(video.id, videoId)).limit(1);
	if (!row) return json({ error: 'Not found' }, { status: 404 });

	const isOwner = locals.user?.id === row.userId;
	if (!isOwner) {
		const token = url.searchParams.get('token');
		if (!token) return json({ error: 'Unauthorized' }, { status: 401 });

		const [link] = await db.select().from(publicLink).where(eq(publicLink.URL, token)).limit(1);
		if (!link || link.videoId !== videoId) return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const manifestPath = path.join(UPLOAD_DIR, 'hls', videoId, 'index.m3u8');

	try {
		const content = await readFile(manifestPath, 'utf-8');

		// Rewrite segment URLs to go through our API, preserving token if present
		const token = url.searchParams.get('token');
		const rewritten = content.replace(/^(seg\d+\.ts)$/gm, (_, seg) => {
			const segUrl = resolve('/api/video/[videoId]/[segment]', { videoId, segment: seg }) + (token ? `?token=${token}` : '');
			return segUrl;
		});

		return new Response(rewritten, {
			headers: {
				'Content-Type': 'application/vnd.apple.mpegurl',
				'Cache-Control': 'no-cache',
			},
		});
	} catch {
		return json({ error: 'Manifest not found' }, { status: 404 });
	}
};