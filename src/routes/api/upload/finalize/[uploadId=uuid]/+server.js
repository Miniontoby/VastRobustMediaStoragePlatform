import { json } from '@sveltejs/kit';
import { createWriteStream } from 'fs';
import { readFile, unlink, rmdir } from 'fs/promises';
import path from 'path';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { upload, video } from '$lib/server/db/video.schema';
import { eq } from 'drizzle-orm';

const UPLOAD_DIR = env.UPLOAD_DIR ?? '/tmp/uploads';

/**
 * Finalizes an upload by concatenating all chunks into the final file.
 * @type {import('./$types').RequestHandler}
 * @swagger
 * /api/upload/finalize/{uploadId}:
 *   post:
 *     summary: Finalize a video file upload
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
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 done:
 *                   description: Done?
 *                   type: boolean
 *                 filename:
 *                   description: Filename
 *                   type: string
 *                 uploadId:
 *                   description: Upload ID
 *                   type: string
 *       400:
 *         description: Not all chunks received
 *       403:
 *         description: Not logged in
 *       404:
 *         description: Unknown upload ID
 *       500:
 *         description: Finalization error
 */
export const POST = async ({ params, locals }) => {
	if (!db) return json({ error: 'Unexpected error' }, { status: 500 });

	if (!locals.user) return json({ error: 'Not logged in' }, { status: 403 });

	const userId = locals.user.id;

	const { uploadId } = params;

	const [session] = await db.select().from(upload).where(eq(upload.id, uploadId)).limit(1);

	if (!session || session.userId !== userId) {
		return json({ error: 'Unknown uploadId' }, { status: 404 });
	}

	const receivedChunks = /** @type {number[]} */ JSON.parse(String(session.receivedChunks));
	if (receivedChunks.length !== session.totalChunks) {
		return json({
			error: 'Not all chunks received',
			missing: Array.from({ length: session.totalChunks }, (_, i) => i).filter(i => !receivedChunks.includes(i)),
		}, { status: 400 });
	}

	await db.update(upload).set({ status: 'finalizing' }).where(eq(upload.id, uploadId));

	// filename will use the uuid plus .mp4 to make sure no path traversal can happen
	const filename = uploadId + '.mp4'; // session.filename;

	const uploadPath = path.join(UPLOAD_DIR, uploadId);
	const finalPath = path.join(UPLOAD_DIR, filename);
	const writeStream = createWriteStream(finalPath);

	try {
		for (let i = 0; i < session.totalChunks; i++) {
			const chunkPath = path.join(uploadPath, `${i}.part`);
			const chunkData = await readFile(chunkPath);
			/**
			 * @type {Promise<void>}
			 */
			const write = new Promise((resolve, reject) => {
				writeStream.write(chunkData, err => err ? reject(err) : resolve());
			});
			await write;
			await unlink(chunkPath);
		}

		writeStream.end();
		await rmdir(uploadPath);

		await db.update(upload).set({ status: 'done' }).where(eq(upload.id, uploadId));
		// TODO:  remove upload from upload table and add file to the videos table of the user

		await db.insert(video).values({
			id: uploadId,
			userId,
			filename,
			fileSize: session.fileSize,
		});

		return json({ done: true, filename, uploadId });
	} catch (err) {
		writeStream.destroy();
		await db.update(upload).set({ status: 'error' }).where(eq(upload.id, uploadId));
		return json({ error: 'Finalization failed', internal_error: err }, { status: 500 });
	}
};
