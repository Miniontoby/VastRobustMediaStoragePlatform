import { spawn } from 'child_process';
import { mkdir } from 'fs/promises';
import path from 'path';

/**
 * @param {string} inputPath
 * @param {string} videoId
 * @param {(progress: { percent: number, eta: number | null }) => void} onProgress
 * @returns {Promise<{ hlsPath: string, duration: number }>}
 */
export async function processHLS(inputPath, videoId, onProgress) {
	const outputDir = path.join(path.dirname(inputPath), 'hls', videoId);
	await mkdir(outputDir, { recursive: true });

	const manifestPath = path.join(outputDir, 'index.m3u8');

	return new Promise((resolve, reject) => {
		let duration = 0;
		let lastPercent = 0;
		const startTime = Date.now();

		const ff = spawn('ffmpeg', [
			'-i', inputPath,
			'-codec:', 'copy',
			'-start_number', '0',
			'-hls_time', '10',
			'-hls_list_size', '0',
			'-hls_segment_filename', path.join(outputDir, 'seg%03d.ts'),
			'-f', 'hls',
			manifestPath,
		]);

		ff.stderr.on('data', (chunk) => {
			const text = chunk.toString();

			if (!duration) {
				const d = text.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
				if (d) duration = parseInt(d[1]) * 3600 + parseInt(d[2]) * 60 + parseFloat(d[3]);
			}

			const t = text.match(/time=(\d+):(\d+):(\d+\.\d+)/);
			if (t && duration) {
				const current = parseInt(t[1]) * 3600 + parseInt(t[2]) * 60 + parseFloat(t[3]);
				const percent = Math.min(Math.round((current / duration) * 100), 99);

				if (percent !== lastPercent) {
					lastPercent = percent;
					const elapsed = (Date.now() - startTime) / 1000;
					const eta = percent > 0 ? Math.round((elapsed / percent) * (100 - percent)) : null;
					onProgress({ percent, eta });
				}
			}
		});

		ff.on('close', (code) => {
			if (code !== 0) return reject(new Error(`ffmpeg exited with code ${code}`));
			resolve({ hlsPath: manifestPath, duration: Math.round(duration) });
		});

		ff.on('error', reject);
	});
}