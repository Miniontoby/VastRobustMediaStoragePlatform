<script>
	import { onMount, onDestroy } from 'svelte';
	import Hls from 'hls.js';
	import { resolve } from '$app/paths';

	/** @type {{ videoId: string; token: string|null; downloadingEnabled: boolean }} */
	const { videoId, token = null, downloadingEnabled = false } = $props();

	/** @type {HTMLVideoElement} */
	let videoEl;
	/** @type {Hls|undefined} */
	let hls;

	const manifestUrl = $derived(resolve('/api/video/[videoId]/manifest.m3u8', { videoId }) + (token ? `?token=${token}` : ''));

	onMount(() => {
		if (Hls.isSupported()) {
			hls = new Hls();
			hls.loadSource(manifestUrl);
			hls.attachMedia(videoEl);
		} else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
			// Safari native HLS
			videoEl.src = manifestUrl;
		}
	});

	onDestroy(() => hls?.destroy());
</script>

<video class="max-h-full max-w-full" bind:this={videoEl} controls>
	<source />
	<track kind="captions" />
</video>
{#if downloadingEnabled}
	<a class="btn btn-primary" href={resolve('/api/video/[videoId]/download', { videoId }) + (token ? `?token=${token}` : '')} download>
		Download Video
	</a>
{/if}
