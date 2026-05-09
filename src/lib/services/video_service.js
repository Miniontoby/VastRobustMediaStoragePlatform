import { resolve } from '$app/paths';

/**
 * Grants access to a user to view a video
 * @param {string} videoId - Unique ID of this video
 * @param {string} email - Email of the user
 * @returns {Promise<{ error: string; message?: never; }|{ message: string; error?: never; }>}
 */
export async function grantAccess(videoId, email) {
	const form = new FormData();
	form.append('email', email);

	try {
		const response = await fetch(resolve('/api/video/[videoId]/access', { videoId }), { method: 'POST', body: form });
		return await response.json();
	} catch (err) {
		throw new Error('API_FINALIZE_UPLOAD_FAILED', { cause: err });
	}
}
