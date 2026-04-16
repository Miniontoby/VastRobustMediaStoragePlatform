import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { upload } from '$lib/server/db/video.schema';
import { eq } from 'drizzle-orm';

/**
 * Returns the current status of an upload session.
 * @type {import('./$types').RequestHandler}
 */
export const GET = async ({ params, locals }) => {
	if (!db) return json({ error: 'Unexpected error' }, { status: 500 });

	if (!locals.user) return json({ error: 'Not logged in' }, { status: 400 });

	const userId = locals.user.id;

	const { uploadId } = params;

	const [session] = await db.select().from(upload).where(eq(upload.id, uploadId)).limit(1);

	if (!session || session.userId !== userId) {
		return json({ error: 'Unknown uploadId' }, { status: 404 });
	}

	const receivedChunks = /** @type {number[]} */ JSON.parse(String(session.receivedChunks));
	const missingChunks = Array.from(
		{ length: session.totalChunks },
		(_, i) => i
	).filter(i => !receivedChunks.includes(i));

	return json({
		uploadId,
		status: session.status,
		filename: session.filename,
		totalChunks: session.totalChunks,
		receivedChunks,
		missingChunks,
	});
};
