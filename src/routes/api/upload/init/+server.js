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
 * @swagger
 * /api/upload/init:
 *   post:
 *     summary: Initialize a new video upload
 *     tags:
 *       - Uploads
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - filename
 *               - fileSize
 *               - totalChunks
 *             properties:
 *               filename:
 *                 description: Filename
 *                 type: string
 *               fileSize:
 *                 description: File size
 *                 type: number
 *               totalChunks:
 *                 description: Total chunks
 *                 type: number
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uploadId:
 *                   description: Upload ID
 *                   type: string
 *                   format: uuid
 *       400:
 *         description: Missing parameters
 *       403:
 *         description: Not logged in
 */
export const POST = async ({ request, locals }) => {
	if (!db) return json({ error: 'Unexpected error' }, { status: 500 });

	if (!locals.user) return json({ error: 'Not logged in' }, { status: 403 });

	const userId = locals.user.id;

	const formData = await request.formData();
	const filename = String(formData.get('filename'));
	const fileSize = Number(formData.get('fileSize'));
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
		fileSize,
		totalChunks,
		receivedChunks: [],
		status: 'pending',
	});

	return json({ uploadId }, { status: 201 });
};
