import { json } from '@sveltejs/kit';
import { db } from './db';
import { auth } from './auth';
import { video, publicLink, videoAccess } from './db/video.schema';
import { and, eq, exists } from 'drizzle-orm';

/**
 * 
 * @param {string|undefined} userId 
 * @param {string} videoId 
 * @param {string|null} token 
 * @returns 
 */
export default async function checkVideoPermissions(userId, videoId, token) {
	if (!db || !auth)
		return { response: json({ error: 'Service Unavailable' }, { status: 503 }) };

	let [row] = await db.select().from(video).where(eq(video.id, videoId)).limit(1);
	if (!row) return { response: json({ error: 'Not found' }, { status: 404 }) };

	const isOwner = userId === row.userId;
	if (!isOwner) {
		const permissionsResponse = userId !== undefined && await auth.api.userHasPermission({
			body: {
				userId,
				permissions: { file: ['watch'] }
			},
		});
		if (!permissionsResponse || !permissionsResponse.success) {
			// Public link access
			if (!token) return { response: json({ error: 'Not found' }, { status: 404 }) };

			const [link] = await db.select().from(publicLink).where(eq(publicLink.URL, token)).limit(1);
			if (!link || link.videoId !== videoId) return { response: json({ error: 'Unauthorized' }, { status: 401 }) };
		} else {
			[row] = await db.select()
				.from(video)
				.where(
					and(
						eq(video.id, videoId),
						exists( // Heeft expliciet toestemming gekregen. Checken van owner is al gedaan hoger in de code
							db.select()
							.from(videoAccess)
							.where(and(eq(videoAccess.videoId, videoId), eq(videoAccess.userId, userId)))
						)
					)
				).limit(1)
			if (!row) return { response: json({ error: 'Not found' }, { status: 404 }) };
		}
	}
	
	return { row }
}