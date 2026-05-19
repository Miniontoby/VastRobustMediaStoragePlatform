import { and, eq } from 'drizzle-orm';
import { db } from './db';
import { user } from './db/auth.schema';
import { video, videoAccess } from './db/video.schema';
import { auth } from './auth';
import { env } from '$env/dynamic/private';
import { defaultFrom, transporter } from './mailer';

/**
 * 
 * @param {string} ownerId 
 * @param {string} videoId 
 * @param {string} customerEmail 
 */
export default async function grantVideoAccess(ownerId, videoId, customerEmail) {
	if (!db || !auth)
		throw new Error('Service Unavailable');

	let [row] = await db.select().from(video).where(and(eq(video.id, videoId), eq(video.userId, ownerId))).limit(1);
	if (!row)
		throw new Error('Not found');

	const targetUser = await db.query.user.findFirst({
		where: eq(user.email, customerEmail),
	});

	if (ownerId !== undefined && targetUser) {
		const permissionsResponse = await auth.api.userHasPermission({
			body: {
				userId: targetUser.id,
				permissions: { file: ['watch'] }
			},
		});
		if (permissionsResponse.success) {
			await db.insert(videoAccess).values({
				userId: targetUser.id,
				videoId: videoId,
			});
			
			const url = `${env.ORIGIN}/videos/${videoId}`;
			try {
				await transporter.sendMail({
					from: defaultFrom,
					to: targetUser.email,
					subject: 'Access granted to new file! ' + row.filename,
					html: `<p>Click the link to view the new file: <a href="${url}">${url}</a></p>`,
				});
				return;
			} catch {
				throw new Error('Unable to send email. Just go tell the user themselves that they got access: ' + url);
			}
		}
	}

	throw new Error('Not found');
}
