<script>
	import { m } from '$lib/paraglide/messages.js';
	import { createPublicLink } from '$lib/services/public_link_service.js';

	/** @type {import('./$types').PageData} */
	let { data } = $props();
	/** @type {{
		video: {
			id: string;
			userId: string;
			filename: string;
			fileSize: number;
			createdAt: Date;
			updatedAt: Date;
		};
		public_link: {
			id: string;
			videoId: string;
			URL: string;
			downloadingEnabled: boolean;
			createdAt: Date;
			updatedAt: Date;
		} | null;
	}} */
	let { video } = data.video;
	/** @type {{
			id: string;
			videoId: string;
			URL: string;
			downloadingEnabled: boolean;
			createdAt: Date;
			updatedAt: Date;
		} | null
	} */
	let public_link = $state(data.video.public_link);

	/** @param {MouseEvent & { currentTarget: EventTarget & HTMLButtonElement; }} event */
	async function generateLink(event) {
		event.preventDefault();
		if (public_link !== null) return;

		// @ts-ignore
		public_link = await createPublicLink(video.id);
	}
</script>

<h1>{video.filename}</h1>
<p>{video.fileSize}</p>

<input type="text" class="w-full" value={public_link ? public_link.URL : "No link"} disabled>
<button class="btn btn-primary" onclick={generateLink} disabled={public_link !== null}>{m['pages.videos.action.generate_link']()}</button>

