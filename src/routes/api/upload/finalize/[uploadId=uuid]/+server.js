import { json } from '@sveltejs/kit';
import { createWriteStream } from 'fs';
import { readFile, unlink, rmdir } from 'fs/promises';
import path from 'path';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { upload, video } from '$lib/server/db/video.schema';
import { processHLS } from '$lib/server/hls';
import { eq } from 'drizzle-orm';

const UPLOAD_DIR = env.UPLOAD_DIR ?? '/tmp/uploads';

// Track active SSE clients per uploadId
/** @type {Map<string, Set<(data: string) => void>>} */
const sseClients = new Map();
const encoder = new TextEncoder();

/**
 * @param {string} uploadId
 * @param {object} data
 */
function broadcast(uploadId, data) {
	const clients = sseClients.get(uploadId);
	if (!clients) return;
	const msg = `data: ${JSON.stringify(data)}\n\n`;
	for (const send of clients) send(msg);
}

/**
 * @swagger
 * /api/upload/finalize/{uploadId}:
 *   get:
 *     summary: Get access to the EvenStream for the HLS processing status of an upload session.
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
 *         description: EventStream
 *         content:
 *           text/event-stream
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Unknown upload ID
 * @type {import('./$types').RequestHandler}
 */
export const GET = async ({ params, locals }) => {
	if (!db)
		return json({ error: 'Unexpected error' }, { status: 500 });

	if (!locals.user)
		return json({ error: 'Unauthorized' }, { status: 401 });

	const { uploadId } = params;

	const [session] = await db.select().from(upload).where(eq(upload.id, uploadId)).limit(1);
	if (!session || session.userId !== locals.user.id)
		return json({ error: 'Unknown uploadId' }, { status: 404 });

	let send = /** @type {((data: string) => void)|null} */ (null);

	const stream = new ReadableStream({
		start(controller) {
			send = (data) => controller.enqueue(encoder.encode(data));

			if (!sseClients.has(uploadId)) sseClients.set(uploadId, new Set());
			sseClients.get(uploadId)?.add(send);

			// Send initial status
			send(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);
		},
		cancel() {
			if (send !== null) {
				sseClients.get(uploadId)?.delete(send);
			}
			if (sseClients.get(uploadId)?.size === 0) sseClients.delete(uploadId);
		},
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive',
		},
	});
};

/**
 * @swagger
 * /api/upload/finalize/{uploadId}:
 *   post:
 *     summary: Finalizes an upload session by concatenating all chunks into the final file.
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
 *                   format: uuid
 *       400:
 *         description: Not all chunks received
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Unknown upload ID
 *       500:
 *         description: Finalization error
 * @type {import('./$types').RequestHandler}
 */
export const POST = async ({ params, locals }) => {
	if (!db)
		return json({ error: 'Unexpected error' }, { status: 500 });

	if (!locals.user)
		return json({ error: 'Unauthorized' }, { status: 401 });

	const userId = locals.user.id;

	const { uploadId } = params;

	const [session] = await db.select().from(upload).where(eq(upload.id, uploadId)).limit(1);

	if (!session || session.userId !== userId)
		return json({ error: 'Unknown uploadId' }, { status: 404 });

	const receivedChunks = /** @type {number[]} */ JSON.parse(String(session.receivedChunks));
	if (receivedChunks.length !== session.totalChunks)
		return json({
			error: 'Not all chunks received',
			missing: Array.from({ length: session.totalChunks }, (_, i) => i).filter(i => !receivedChunks.includes(i)),
		}, { status: 400 });

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

		await db.update(upload).set({ status: 'processing' }).where(eq(upload.id, uploadId));

		// Return immediately so frontend can open SSE, then process async, without awaiting it.
		(async () => {
			try {
				broadcast(uploadId, { type: 'progress', percent: 0, eta: null });

				const { duration } = await processHLS(finalPath, uploadId, (progress) => {
					broadcast(uploadId, { type: 'progress', ...progress });
				});

				await unlink(finalPath);

				await db.insert(video).values({
					id: uploadId,
					userId,
					filename,
					fileSize: session.fileSize,
					duration,
				});

				await db.delete(upload).where(eq(upload.id, uploadId));

				broadcast(uploadId, { type: 'done', videoId: uploadId });
			} catch (err) {
				console.error('HLS processing failed', err);
				await db.update(upload).set({ status: 'error' }).where(eq(upload.id, uploadId));
				broadcast(uploadId, { type: 'error', message: 'HLS processing failed' });
			}
		})();

		return json({ processing: true, uploadId });
	} catch (err) {
		writeStream.destroy();
		await db.update(upload).set({ status: 'error' }).where(eq(upload.id, uploadId));
		return json({ error: 'Finalization failed', internal_error: err }, { status: 500 });
	}
};
