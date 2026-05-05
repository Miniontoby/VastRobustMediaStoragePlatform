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
	form.append('fileSize', String(file.size));
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
		throw new Error('API_NO_UPLOAD_ID_RECEIVED', { cause: data.error });
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
		const response = await fetch(resolve('/api/upload/chunk/[uploadId=uuid]', { uploadId }), { method: 'POST', body: form });
		if (!response.ok) throw new Error(await response.json().then(r => r.error))
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
 * @param {(progress: { percent: number, eta: number | null }) => void} hlsProgressCallback
 * @returns {Promise<{ videoId: string }>}
 */
export async function uploadFile(file, progressCallback, hlsProgressCallback) {
	if (!file) throw new Error('LIB_NO_FILE_TO_UPLOAD', { cause: 'USER_FAULT' });

	const fileSize = file.size;
	const chunkSize = 20_000_000; // 20.000 kb?
	const totalChunks = Math.ceil(fileSize / chunkSize);

	const uploadId = await initUpload(file, totalChunks);
	for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
		await uploadChunk(file, uploadId, chunkIndex, totalChunks, chunkSize);
		progressCallback(Math.round(chunkIndex / totalChunks * 100));
	}

	const data = await finalizeUpload(uploadId);

	if (!data?.processing) throw new Error('API_FINALIZE_FAILED', { cause: data?.error });

	return new Promise((res, rej) => {
		const sse = new EventSource(resolve('/api/upload/finalize/[uploadId=uuid]', { uploadId }));

		sse.onmessage = (e) => {
			const msg = JSON.parse(e.data);

			if (msg.type === 'progress') {
				hlsProgressCallback({ percent: msg.percent, eta: msg.eta });
			} else if (msg.type === 'done') {
				sse.close();
				res({ videoId: msg.videoId });
			} else if (msg.type === 'error') {
				sse.close();
				rej(new Error('API_HLS_PROCESSING_FAILED', { cause: msg.message }));
			}
		};

		sse.onerror = (e) => {
			sse.close();
			rej(new Error('API_SSE_CONNECTION_FAILED', { cause: e }));
		};
	});
}
