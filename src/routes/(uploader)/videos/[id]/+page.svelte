<script>
	import HlsVideoPlayer from '$lib/components/hls_video_player.svelte';
	import { createPublicLink } from '$lib/services/public_link_service.js';
	import { m } from '$lib/paraglide/messages.js';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { grantAccess } from '$lib/services/video_service';

	let { videoRow, isOwner } = page.data;
	/** @type {{
			id: string;
			videoId: string;
			URL: string;
			downloadingEnabled: boolean;
			createdAt: Date;
			updatedAt: Date;
		} | null
	} */
	let public_link = $derived(videoRow.public_link);
	let video = $derived(videoRow.video);
	let URL = $derived(
		public_link?.URL && resolve('/(public)/[publicLink=uuid]', { publicLink: public_link.URL })
	);

	let emailValue = $state('');
	let error = $state('');
	/** @type {string|null} */
	let grantingText = $state(null);

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

	/** @param {SubmitEvent & { currentTarget: EventTarget & HTMLFormElement; }} event */
	async function giveAccess(event) {
		event.preventDefault();
		if (emailValue === null || emailValue.length === 0) return;
		grantingText = 'Working...';

		const response = await grantAccess(video.id, emailValue);
		if (response?.error !== undefined) {
			error = response.error;
			grantingText = null;
		} else if (response?.message !== undefined) {
			grantingText = response.message;
		}
	}
</script>

<h1>{video.filename}</h1>
<p>{video.fileSize}</p>

{#if isOwner}
	<h2>Public Link</h2>
	<form method="post" onsubmit={generateLink}>
		<a
			href={public_link?.URL
				? resolve('/(public)/[publicLink=uuid]', { publicLink: public_link.URL })
				: 'about:blank'}>{URL ?? 'No link!'}</a
		>
		<button
			class="btn btn-primary rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
			disabled={public_link !== null}
		>
			{m['pages.videos.action.generate_link']()}
		</button>
	</form>
	<br />
	<h2>Grant Access</h2>
	<form method="post" onsubmit={giveAccess}>
		<input type="email" name="email" bind:value={emailValue} />
		<button
			class="btn btn-primary rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
		>
			{m['pages.videos.action.grant_access']()}
		</button>
	</form>
	<br />
	<p class="text-red-500">{error ?? ''}</p>
	<p class="text-green-500">{grantingText ?? ''}</p>
{/if}

<HlsVideoPlayer videoId={video.id} token={null} downloadingEnabled={true} />
