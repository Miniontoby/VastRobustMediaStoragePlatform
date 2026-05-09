import { createReadStream } from 'fs';
import path from 'path';
import { env } from '$env/dynamic/private';
import checkVideoPermissions from '$lib/server/check-video-permissions';

const UPLOAD_DIR = env.UPLOAD_DIR ?? '/tmp/uploads';

/**
 * @type {import('./$types').RequestHandler}
 */
export const GET = async ({ params, locals, url }) => {
	const userId = locals.user?.id;

	const { videoId, segment } = params;

	const result = await checkVideoPermissions(userId, videoId, url.searchParams.get('token'));
	if (result.response) return result.response;

	const row = result.row;

	const segmentPath = path.join(UPLOAD_DIR, 'hls', row.id, segment);

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