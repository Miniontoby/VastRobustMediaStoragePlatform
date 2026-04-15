import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { upload } from '$lib/server/db/video.schema';
import { eq } from 'drizzle-orm';

/**
 * Returns the current status of an upload session.
 * @type {import('./$types').RequestHandler}
 */
export const GET = async ({ params }) => {
	// TODO: get authenticated user from better-auth, reject if not authed

	const { uploadId } = params;

	const [session] = await db.select().from(upload).where(eq(upload.id, uploadId)).limit(1);

	if (!session) {
		return json({ error: 'Unknown uploadId' }, { status: 404 });
	}

	// TODO: verify session.userId === userId once auth is implemented

	const receivedChunks = /** @type {number[]} */ (session.receivedChunks);
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