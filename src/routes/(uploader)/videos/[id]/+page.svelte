<script>
	import HlsVideoPlayer from '$lib/components/hls_video_player.svelte';
	import { createPublicLink } from '$lib/services/public_link_service.js';
	import { m } from '$lib/paraglide/messages.js';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	let { videoRow } = page.data;
	/** @type {{
			id: string;
			videoId: string;
			URL: string;
			downloadingEnabled: boolean;
			createdAt: Date;
			updatedAt: Date;
		} | null
	} */
	let public_link = $state(videoRow.public_link);
	let video = $state(videoRow.video);

	let error = $state("");

	/** @param {SubmitEvent & { currentTarget: EventTarget & HTMLFormElement; }} event */
	async function generateLink(event) {
		event.preventDefault();
		if (public_link !== null) return;

		const response = await createPublicLink(video.id);
		if (response?.error !== undefined) {
			error = response.error;
		} else if (response?.data !== undefined) {
			public_link = response.data;
			public_link.URL = response.data.URL;
		}
	}
</script>

<h1>{video.filename}</h1>
<p>{video.fileSize}</p>

<form method="post" onsubmit={generateLink}>
	<a href={public_link?.URL ? resolve("/(public)/[publicLink=uuid]", { publicLink: public_link.URL }) : "about:blank"}>{public_link?.URL ? resolve("/(public)/[publicLink=uuid]", { publicLink: public_link.URL }) : "No link!"}</a>
	<button class="btn btn-primary bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition" disabled={public_link !== null}>{m['pages.videos.action.generate_link']()}</button>
</form>
<p class="text-red-500">{error ?? ''}</p>

<HlsVideoPlayer videoId={video.id} token={null} downloadingEnabled={true} />