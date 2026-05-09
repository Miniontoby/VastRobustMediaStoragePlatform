<script>
	import HlsVideoPlayer from '$lib/components/hls_video_player.svelte';
	import { page } from '$app/state';

	const { videoRow } = page.data;
	let video = $state(videoRow.video);
	let public_link = $state(videoRow.public_link);
	const downloadingEnabled = $derived(videoRow.public_link.downloadingEnabled);
</script>

<HlsVideoPlayer videoId={video.id} token={public_link.URL} downloadingEnabled={downloadingEnabled} />