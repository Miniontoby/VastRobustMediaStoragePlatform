import adapter from '@sveltejs/adapter-node';
import { relative, sep } from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const path = fileURLToPath(new URL('package.json', import.meta.url));
/** @type {{ name: string, version: string, description: string }} */
const pkg = JSON.parse(readFileSync(path, 'utf8'));

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// defaults to rune mode for the project, except for `node_modules`. Can be removed in svelte 6.
		runes: ({ filename }) => {
			const relativePath = relative(import.meta.dirname, filename);
			const pathSegments = relativePath.toLowerCase().split(sep);
			const isExternalLibrary = pathSegments.includes('node_modules');

			return isExternalLibrary ? undefined : true;
		},
	},
	kit: {
		adapter: adapter(),
		csp: {
			directives: {
				'script-src': ["'self'"],
				'worker-src': ["'self'", 'blob:'],
				'connect-src': ["'self'", 'ws://localhost:*'],
				'img-src': ["'self'", 'data:'],
				'font-src': ["'self'", 'data:'],
				'form-action': ["'self'"],
				'frame-ancestors': ["'self'"],
				'frame-src': ["'self'",],
				'manifest-src': ["'self'"],
				'media-src': ["'self'", 'data:', 'blob:'],
				'object-src': ["'none'"],
				'style-src': ["'self'"], // unsafe-inline would be required for svelte transitions
			},
			// must be specified with either the `report-uri` or `report-to` directives, or both
			// reportOnly: {
			// 	'script-src': ["'self'"],
			// 	'worker-src': ["'self'", 'blob:'],
			// 	'connect-src': ["'self'", 'ws://localhost:*'],
			// 	'img-src': ["'self'", 'data:'],
			// 	'font-src': ["'self'", 'data:'],
			// 	'form-action': ["'self'"],
			// 	'frame-ancestors': ["'self'"],
			// 	'frame-src': ["'self'",],
			// 	'manifest-src': ["'self'"],
			// 	'media-src': ["'self'", 'data:', 'blob:'],
			// 	'object-src': ["'none'"],
			// 	'style-src': ["'self'"], // unsafe-inline would be required for svelte transitions
			// 	'report-uri': ['/'],
			// },
		},
		csrf: {
			trustedOrigins: [],
		},
		version: {
			name: pkg.version,
		},
	}
};

export default config;
