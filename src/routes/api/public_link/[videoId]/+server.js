import { json } from '@sveltejs/kit';
import { randomUUID } from 'crypto';
import { db } from '$lib/server/db';
import { auth } from '$lib/server/auth';
import { video, publicLink } from '$lib/server/db/video.schema';
import { eq } from 'drizzle-orm';

/**
 * @type {import('./$types').RequestHandler}
 */
export const GET = async({ params, locals }) => {
	if (!db || !auth)
		return json({ error: 'Unexpected error' }, { status: 500 });

	if (!locals.user)
		return json({ error: 'Unauthorized' }, { status: 401 });

	const userId = locals.user.id;
	const permissionsResponse = await auth.api.userHasPermission({
		body: {
			userId,
			permissions: { public_link: ['view'] }
		},
	});
	if (!permissionsResponse.success)
		return json({ error: 'Forbidden' }, { status: 403 });

	const { videoId } = params;

	if (!videoId)
		return json({ error: 'Missing videoId' }, { status: 400 });

	const [session] = await db.select().from(publicLink).where(eq(publicLink.videoId, videoId)).limit(1);
	if (!session)
		return json({ error: 'File does not exist' }, { status: 404 });

	return json({ id: session.id, videoId: session.videoId, URL: session.URL, downloadingEnabled: session.downloadingEnabled }, { status: 200 });
}

/**
 * @swagger
 * /api/public_link/{videoId}:
 *   post:
 *     summary: Creates a new public link for the provided videoId
 *     tags:
 *       - Public Link
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [linkId, data]
 *               properties:
 *                 linkId:
 *                   description: Link ID
 *                   type: string
 *                   format: uuid
 *                 data:
 *                   description: Data
 *                   type: object
 *                   required: [id, videoId, URL]
 *                   properties:
 *                     id:
 *                       description: Link ID
 *                       type: string
 *                       format: uuid
 *                     videoId:
 *                       description: Video ID
 *                       type: string
 *                       format: uuid
 *                     URL:
 *                       description: URL
 *                       type: string
 *       400:
 *         description: There is already a public link
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [error, linkId, data]
 *               properties:
 *                 error:
 *                   description: Error message
 *                   type: string
 *                   enum: ["Already has a public link"]
 *                 linkId:
 *                   description: Link ID
 *                   type: string
 *                   format: uuid
 *                 data:
 *                   description: Data
 *                   type: object
 *                   required: [id, videoId, URL]
 *                   properties:
 *                     id:
 *                       description: Link ID
 *                       type: string
 *                       format: uuid
 *                     videoId:
 *                       description: Video ID
 *                       type: string
 *                     URL:
 *                       description: URL
 *                       type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Unknown video ID
 * @type {import('./$types').RequestHandler}
 */
export const POST = async ({ params, locals }) => {
	if (!db || !auth)
		return json({ error: 'Service Unavailable' }, { status: 503 });

	if (!locals.user)
		return json({ error: 'Unauthorized' }, { status: 401 });

	const userId = locals.user.id;
	const permissionsResponse = await auth.api.userHasPermission({
		body: {
			userId,
			permissions: { public_link: ['create'] }
		},
	});
	if (!permissionsResponse.success)
		return json({ error: 'Forbidden' }, { status: 403 });

	const { videoId } = params;

	const [videoSession] = await db.select().from(video).where(eq(video.id, videoId)).limit(1);
	if (!videoSession || videoSession.userId !== userId)
		return json({ error: 'Unknown videoId' }, { status: 404 });

	const [session] = await db.select().from(publicLink).where(eq(publicLink.videoId, videoId)).limit(1);
	if (session)
		return json({ error: 'Already has a public link', linkId: session.id, data: { id: session.id, videoId: session.videoId, URL: session.URL } }, { status: 400 });

	const linkId = randomUUID();
	const data = {
		id: linkId,
		videoId,
		URL: linkId,
	};
	await db.insert(publicLink).values(data);

	return json({ linkId, data }, { status: 201 });
};
