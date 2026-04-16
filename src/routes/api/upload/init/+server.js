import { json } from '@sveltejs/kit';
import { randomUUID } from 'crypto';
import { mkdir } from 'fs/promises';
import path from 'path';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { upload } from '$lib/server/db/video.schema';

const UPLOAD_DIR = env.UPLOAD_DIR ?? '/tmp/uploads';

/**
 * Initializes an upload session.
 * Must be called before any chunk uploads.
 * @type {import('./$types').RequestHandler}
 */
export const POST = async ({ request, locals }) => {
	if (!db) return json({ error: 'Unexpected error' }, { status: 500 });

	if (!locals.user) return json({ error: 'Not logged in' }, { status: 400 });

	const userId = locals.user.id;

	const formData = await request.formData();
	const filename = String(formData.get('filename'));
	const totalChunks = Number(formData.get('totalChunks'));

	if (!filename || isNaN(totalChunks)) {
		return json({ error: 'Missing filename or totalChunks' }, { status: 400 });
	}

	const uploadId = randomUUID();
	const uploadPath = path.join(UPLOAD_DIR, uploadId);

	await mkdir(uploadPath, { recursive: true });

	await db.insert(upload).values({
		id: uploadId,
		userId,
		filename,
		totalChunks,
		receivedChunks: [],
		status: 'pending',
	});

	return json({ uploadId }, { status: 201 });
};
