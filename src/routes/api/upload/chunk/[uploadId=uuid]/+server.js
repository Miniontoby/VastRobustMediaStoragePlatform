import { json } from '@sveltejs/kit';
import { writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { upload } from '$lib/server/db/video.schema';
import { eq } from 'drizzle-orm';

const UPLOAD_DIR = env.UPLOAD_DIR ?? '/tmp/uploads';

/**
 * Uploads a single chunk for the given uploadId.
 * Expects multipart/form-data with: chunkIndex, totalChunks, chunk
 * @type {import('./$types').RequestHandler}
 */
export const POST = async ({ request, params }) => {
	// TODO: get authenticated user from better-auth, reject if not authed
	const userId = 'todo';

	const { uploadId } = params;

	const [session] = await db.select().from(upload).where(eq(upload.id, uploadId)).limit(1);

	if (!session) {
		return json({ error: 'Unknown uploadId, call /upload/init first' }, { status: 404 });
	}

	// TODO: verify session.userId === userId once auth is implemented

	if (session.status === 'done' || session.status === 'finalizing') {
		return json({ error: 'Upload already finalized' }, { status: 400 });
	}

	const uploadPath = path.join(UPLOAD_DIR, uploadId);
	if (!existsSync(uploadPath)) {
		return json({ error: 'Upload directory missing, re-init required' }, { status: 400 });
	}

	const formData = await request.formData();
	const chunkIndex = Number(formData.get('chunkIndex'));
	const chunk = /** @type {File} */ (formData.get('chunk'));

	if (isNaN(chunkIndex) || !chunk) {
		return json({ error: 'Missing chunkIndex or chunk' }, { status: 400 });
	}

	const chunkBuffer = Buffer.from(await chunk.arrayBuffer());
	const chunkPath = path.join(uploadPath, `${chunkIndex}.part`);
	await writeFile(chunkPath, chunkBuffer);

	const receivedChunks = /** @type {number[]} */ (session.receivedChunks);
	if (!receivedChunks.includes(chunkIndex)) {
		receivedChunks.push(chunkIndex);
	}

	await db.update(upload)
		.set({ receivedChunks, status: 'uploading' })
		.where(eq(upload.id, uploadId));

	return json({ received: chunkIndex });
};