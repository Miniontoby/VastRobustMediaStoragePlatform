import { resolve } from '$app/paths';

/**
 * Create a public link
 * @param {string} videoId - Unique ID for this upload session
 * @returns {Promise<object>}
 */
export async function createPublicLink(videoId) {
	try {
		const response = await fetch(resolve('/api/public_link/[videoId]', { videoId }), { method: 'POST' });
		return await response.json();
	} catch (err) {
		throw new Error('API_FINALIZE_UPLOAD_FAILED', { cause: err });
	}
}
