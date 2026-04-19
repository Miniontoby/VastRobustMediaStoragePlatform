import { resolve } from '$app/paths';

/**
 * Create a public link
 * @param {string} videoId - Unique ID for this upload session
 * @returns {Promise<{ error: string|undefined; data: { id: string; videoId: string; URL: string; downloadingEnabled: boolean; createdAt: Date; updatedAt: Date; }|undefined }>}
 */
export async function createPublicLink(videoId) {
	const form = new FormData();

	try {
		const response = await fetch(resolve('/api/public_link/[videoId]', { videoId }), { method: 'POST', body: form });
		return await response.json();
	} catch (err) {
		throw new Error('API_FINALIZE_UPLOAD_FAILED', { cause: err });
	}
}
