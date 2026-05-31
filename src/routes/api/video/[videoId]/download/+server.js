import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { publicLink } from '$lib/server/db/video.schema';
import { eq } from 'drizzle-orm';
import path from 'path';
import { createReadStream } from 'fs';
import { json } from '@sveltejs/kit';
import checkVideoPermissions from '$lib/server/check-video-permissions';

const UPLOAD_DIR = env.UPLOAD_DIR ?? '/tmp/uploads';

/**
 * @type {import('./$types').RequestHandler}
 */
export const GET = async ({ params, locals, url }) => {
	if (!db)
		return json({ error: 'Service Unavailable' }, { status: 503 });

	const userId = locals.user?.id;

	const { videoId } = params;

	const result = await checkVideoPermissions(userId, videoId, url.searchParams.get('token'));
	if (result.response) return result.response;

	const row = result.row;

	const isOwner = userId === row.userId;

	if (!isOwner) {
		const [link] = await db.select().from(publicLink).where(eq(publicLink.videoId, row.id)).limit(1);
		if (!link?.downloadingEnabled) return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const filePath = path.join(UPLOAD_DIR, `${row.id}.mp4`);

	// @ts-expect-error
	return new Response(createReadStream(filePath), {
		headers: {
			'Content-Type': 'video/mp4',
			'Content-Disposition': `attachment; filename="${row.filename}"`,
		},
	});
};