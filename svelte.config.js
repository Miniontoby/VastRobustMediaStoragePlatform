import adapter from '@sveltejs/adapter-node';
import { relative, sep } from 'node:path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// defaults to rune mode for the project, except for `node_modules`. Can be removed in svelte 6.
		runes: ({ filename }) => {
			const relativePath = relative(import.meta.dirname, filename);
			const pathSegments = relativePath.toLowerCase().split(sep);
			const isExternalLibrary = pathSegments.includes('node_modules');

			return isExternalLibrary ? undefined : true;
		}
	},
	kit: {
		adapter: adapter(),
		csp: {
			directives: {
				'script-src': ['self'],
				'worker-src': ['self', 'blob:']
			},
			// must be specified with either the `report-uri` or `report-to` directives, or both
			// reportOnly: {
			// 	'script-src': ['self'],
			// 	'worker-src': ['self', 'blob:'],
			// 	'report-uri': ['/']
			// }
		},
		csrf: {
			trustedOrigins: []
		}
	}
};

export default config;
