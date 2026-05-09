import { json } from '@sveltejs/kit';
import { readFile } from 'fs/promises';
import { resolve } from '$app/paths';
import path from 'path';
import { env } from '$env/dynamic/private';
import checkVideoPermissions from '$lib/server/check-video-permissions';

const UPLOAD_DIR = env.UPLOAD_DIR ?? '/tmp/uploads';

/**
 * @type {import('./$types').RequestHandler}
 */
export const GET = async ({ params, locals, url }) => {
	const userId = locals.user?.id;

	const { videoId } = params;

	const result = await checkVideoPermissions(userId, videoId, url.searchParams.get('token'));
	if (result.response) return result.response;

	const row = result.row;

	const manifestPath = path.join(UPLOAD_DIR, 'hls', row.id, 'index.m3u8');

	try {
		const content = await readFile(manifestPath, 'utf-8');

		// Rewrite segment URLs to go through our API, preserving token if present
		const token = url.searchParams.get('token');
		const rewritten = content.replace(/^(seg\d+\.ts)$/gm, (_, seg) => {
			const segUrl = resolve('/api/video/[videoId]/[segment=segment]', { videoId: row.id, segment: seg }) + (token ? `?token=${token}` : '');
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