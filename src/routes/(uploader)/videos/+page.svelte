<script>
	import { m } from '$lib/paraglide/messages.js';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	let { data } = page;
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
	}[]} */
	const videos = data.videos;
	/** @type {{
		video: {
			id: string;
			userId: string;
			filename: string;
			fileSize: number;
			createdAt: Date;
			updatedAt: Date;
		};
	}[]} */
	const sharedVideos = $derived(data.sharedVideos);
</script>

<h1>{m['pages.videos.title']()}</h1>
<p>{m['pages.videos.description']()}</p>
<p>Click <a href={resolve('/upload')}>here</a> if you need to upload a video</p>

<table>
	<thead>
		<tr>
			<th>{m['pages.videos.table.name']()}</th>
			<th>{m['pages.videos.table.size']()}</th>
			<th>{m['pages.videos.table.date']()}</th>
			<th>{m['pages.videos.table.has_link']()}</th>
		</tr>
	</thead>
	<tbody>
		{#each videos as video (video.video.id)}
			<tr>
				<td>
					<a href={resolve('/(uploader)/videos/[id]', { id: String(video.video.id) })}>
						{video.video.filename}
					</a>
				</td>
				<td>{video.video.fileSize}</td>
				<td>{video.video.createdAt}</td>
				<td>{video.public_link !== null ? m['answers.yes']() : m['answers.no']()}</td>
			</tr>
		{/each}
	</tbody>
</table>

<br />
<h2>Videos shared with you</h2>
<table>
	<thead>
		<tr>
			<th>{m['pages.videos.table.name']()}</th>
			<th>{m['pages.videos.table.size']()}</th>
			<th>{m['pages.videos.table.date']()}</th>
		</tr>
	</thead>
	<tbody>
		{#each sharedVideos as video (video.video.id)}
			<tr>
				<td>
					<a href={resolve('/(uploader)/videos/[id]', { id: String(video.video.id) })}>
						{video.video.filename}
					</a>
				</td>
				<td>{video.video.fileSize}</td>
				<td>{video.video.createdAt}</td>
			</tr>
		{/each}
	</tbody>
</table>
