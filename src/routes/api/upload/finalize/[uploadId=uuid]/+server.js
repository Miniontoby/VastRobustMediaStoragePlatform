import { json } from '@sveltejs/kit';
import { createWriteStream, existsSync } from 'fs';
import { readFile, unlink, rmdir } from 'fs/promises';
import path from 'path';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { upload } from '$lib/server/db/video.schema';
import { eq } from 'drizzle-orm';

const UPLOAD_DIR = env.UPLOAD_DIR ?? '/tmp/uploads';

/**
 * Finalizes an upload by concatenating all chunks into the final file.
 * @type {import('./$types').RequestHandler}
 */
export const POST = async ({ params, locals }) => {
	if (!locals.user) {
		return json({ error: 'Not logged in' }, { status: 400 });
	}
	const userId = locals.user.id;
	// TODO: get authenticated user from better-auth, reject if not authed

	const { uploadId } = params;

	const [session] = await db.select().from(upload).where(eq(upload.id, uploadId)).limit(1);

	if (!session) {
		return json({ error: 'Unknown uploadId' }, { status: 404 });
	}

	// TODO: verify session.userId === userId once auth is implemented

	const receivedChunks = /** @type {number[]} */ JSON.parse(session.receivedChunks);
	if (receivedChunks.length < session.totalChunks) {
		return json({
			error: 'Not all chunks received',
			missing: Array.from({ length: session.totalChunks }, (_, i) => i).filter(i => !receivedChunks.includes(i)),
		}, { status: 400 });
	}

	await db.update(upload).set({ status: 'finalizing' }).where(eq(upload.id, uploadId));

	const uploadPath = path.join(UPLOAD_DIR, uploadId);
	const finalPath = path.join(UPLOAD_DIR, session.filename);
	const writeStream = createWriteStream(finalPath);

	try {
		for (let i = 0; i < session.totalChunks; i++) {
			const chunkPath = path.join(uploadPath, `${i}.part`);
			const chunkData = await readFile(chunkPath);
			await new Promise((resolve, reject) => {
				writeStream.write(chunkData, err => err ? reject(err) : resolve());
			});
			await unlink(chunkPath);
		}

		writeStream.end();
		await rmdir(uploadPath);

		await db.update(upload).set({ status: 'done' }).where(eq(upload.id, uploadId));
		// TODO:  remove upload from upload table and add file to the videos table of the user

		return json({ done: true, filename: session.filename });
	} catch (err) {
		writeStream.destroy();
		await db.update(upload).set({ status: 'error' }).where(eq(upload.id, uploadId));
		return json({ error: 'Finalization failed' }, { status: 500 });
	}
};