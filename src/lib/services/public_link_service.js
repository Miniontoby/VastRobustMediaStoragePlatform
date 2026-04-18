import { resolve } from '$app/paths';

/**
 * Create a public link
 * @param {string} videoId - Unique ID for this upload session
 * @returns {Promise<{ id: string; videoId: string; URL: string; downloadingEnabled: boolean; createdAt: Date; updatedAt: Date; }>}
 */
export async function createPublicLink(videoId) {
	try {
		const response = await fetch(resolve('/api/public_link/[videoId]', { videoId }), { method: 'POST' });
		return await response.json();
	} catch (err) {
		throw new Error('API_FINALIZE_UPLOAD_FAILED', { cause: err });
	}
}
