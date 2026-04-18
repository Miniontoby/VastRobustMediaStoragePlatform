import { resolve } from '$app/paths';

/**
 * Initialise a file upload
 * @param {File} file - The full file being uploaded
 * @param {number} totalChunks - Total number of chunks
 * @returns {Promise<string>}
 */
export async function initUpload(file, totalChunks) {
	const form = new FormData();
	form.append('filename', file.name ?? 'unknown.mp4');
	form.append('totalChunks', String(totalChunks));

	let data;
	try {
		const response = await fetch(resolve('/api/upload/init'), { method: 'POST', body: form });
		data = await response.json();
	} catch (err) {
		throw new Error('API_INIT_UPLOAD_FAILED', { cause: err });
	}

	if (data?.uploadId !== undefined) {
		return data.uploadId;
	} else {
		throw new Error('API_NO_UPLOAD_ID_RECEIVED', { cause: 'UNKNOWN' });
	}
}

/**
 * Uploads a single chunk of a file to the server.
 * @param {File} file - The full file being uploaded
 * @param {string} uploadId - Unique ID for this upload session
 * @param {number} chunkIndex - Zero-based index of this chunk
 * @param {number} totalChunks - Total number of chunks
 * @param {number} chunkSize - Size of each chunk in bytes
 * @returns {Promise<void>}
 */
export async function uploadChunk(file, uploadId, chunkIndex, totalChunks, chunkSize) {
	const start = chunkIndex * chunkSize;
	const end = Math.min(start + chunkSize, file.size);
	const chunk = file.slice(start, end);

	const form = new FormData();
	form.append('chunkIndex', String(chunkIndex));
	form.append('totalChunks', String(totalChunks));
	form.append('chunk', chunk);

	try {
		await fetch(resolve('/api/upload/chunk/[uploadId=uuid]', { uploadId }), { method: 'POST', body: form });
	} catch (err) {
		throw new Error('API_CHUNK_UPLOAD_FAILED', { cause: err });
	}
}

/**
 * Finalize a file upload
 * @param {string} uploadId - Unique ID for this upload session
 * @returns {Promise<object>}
 */
export async function finalizeUpload(uploadId) {
	const form = new FormData();

	try {
		const response = await fetch(resolve('/api/upload/finalize/[uploadId=uuid]', { uploadId }), { method: 'POST', body: form });
		return await response.json();
	} catch (err) {
		throw new Error('API_FINALIZE_UPLOAD_FAILED', { cause: err });
	}
}

/**
 * Run the full upload sequence
 * @param {File} file - The full file being uploaded
 * @param {(progress: Number) => void} progressCallback - A function callback for status updates
 * @returns {Promise<object>}
 */
export async function uploadFile(file, progressCallback) {
	if (!file) throw new Error('LIB_NO_FILE_TO_UPLOAD', { cause: 'USER_FAULT' });

	const fileSize = file.size;
	const chunkSize = 200_000; // 200 kb?
	const totalChunks = Math.ceil(fileSize / chunkSize);

	const uploadId = await initUpload(file, totalChunks);
	for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
		await uploadChunk(file, uploadId, chunkIndex, totalChunks, chunkSize);
		progressCallback(Math.round(chunkIndex / totalChunks * 100));
	}

	return await finalizeUpload(uploadId);
}
