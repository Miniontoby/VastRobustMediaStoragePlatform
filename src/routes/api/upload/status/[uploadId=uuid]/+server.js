import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { upload } from '$lib/server/db/video.schema';
import { eq } from 'drizzle-orm';

/**
 * @swagger
 * /api/upload/status/{uploadId}:
 *   get:
 *     summary: Returns the current status of an upload session.
 *     tags:
 *       - Uploads
 *     parameters:
 *       - in: path
 *         name: uploadId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Found upload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [uploadId, status, filename, totalChunks, receivedChunks, missingChunks]
 *               properties:
 *                 uploadId:
 *                   description: Upload ID
 *                   type: string
 *                   format: uuid
 *                 status:
 *                   description: Status
 *                   type: string
 *                   enum: ["pending", "uploading", "finalizing", "processing", "error"]
 *                 filename:
 *                   description: Filename
 *                   type: string
 *                 totalChunks:
 *                   description: Total Chunks
 *                   type: number
 *                 receivedChunks:
 *                   description: Received Chunks
 *                   type: array
 *                   items:
 *                     type: number
 *                 missingChunks:
 *                   description: Missing Chunks
 *                   type: array
 *                   items:
 *                     type: number
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Unknown upload ID
 * @type {import('./$types').RequestHandler}
 */
export const GET = async ({ params, locals }) => {
	if (!db) return json({ error: 'Unexpected error' }, { status: 500 });

	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const userId = locals.user.id;

	const { uploadId } = params;

	const [session] = await db.select().from(upload).where(eq(upload.id, uploadId)).limit(1);

	if (!session || session.userId !== userId)
		return json({ error: 'Unknown uploadId' }, { status: 404 });

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
