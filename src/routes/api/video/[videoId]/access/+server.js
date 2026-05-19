import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { auth } from '$lib/server/auth';
import checkVideoPermissions from '$lib/server/check-video-permissions';
import grantVideoAccess from '$lib/server/grant-video-access';

/**
 * @swagger
 * /api/video/{videoId}/access:
 *   post:
 *     summary: Grants video access to a certain user
 *     tags:
 *       - Video
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 description: Email of an existing user
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Done
 *       400:
 *         description: Missing parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Unable to grant access
 * @type {import('./$types').RequestHandler}
 */
export const POST = async ({ request, params, locals }) => {
	if (!db || !auth)
		return json({ error: 'Service Unavailable' }, { status: 503 });

	if (!locals.user)
		return json({ error: 'Unauthorized' }, { status: 401 });
	
	const userId = locals.user.id;
	const permissionsResponse = await auth.api.userHasPermission({
		body: {
			userId,
			permissions: { video: ['share'] }
		},
	});
	if (!permissionsResponse.success)
		return json({ error: 'Forbidden' }, { status: 403 });

	const { videoId } = params;

	const formData = await request.formData();
	const email = String(formData.get('email'));

	const result = await checkVideoPermissions(userId, videoId, null);
	if (result.response) return result.response;

	const row = result.row;

	try {
		await grantVideoAccess(userId, row.id, email);
		return json({ message: 'Success!' }, { status: 200 });
	} catch (/** @type {any} */ e) {
		return json({ error: 'Unable to grant access', inner_error: e.message }, { status: 500 });
	}
};
