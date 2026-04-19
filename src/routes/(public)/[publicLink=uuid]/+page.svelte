<script>
	import { page } from '$app/state';
	import { resolve } from '$app/paths';

	const { videoRow } = page.data;
	const downloadingEnabled = videoRow.public_link.downloadingEnabled;
</script>

<video class="max-w-full max-h-full" width="1920" height="1080" controls controlsList={downloadingEnabled ? "" : "nodownload"} oncontextmenu={(e) => !downloadingEnabled && e.preventDefault()}>
	<source src={resolve("/api/public_link/[videoId]", { videoId: videoRow.video.id })}>
	<track kind="captions" />
</video>