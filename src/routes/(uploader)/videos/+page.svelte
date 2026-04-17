<script>
	import { m } from '$lib/paraglide/messages.js';
	import { resolveRoute } from '$app/paths';

	/** @type {import('./$types').PageData} */
	export let data;
	/** @type {object[]} */
	const videos = $state(data.videos); // TODO change typescript type to the model of the Video thing instead.
</script>

<h1>{m['pages.videos.title']()}</h1>
<p>{m['pages.videos.description']()}</p>

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
		{#each videos as video}
			<tr>
				<td><a href={resolveRoute('/videos/[id]', { id: String(video.id) })}>{video.name}</a></td>
				<td>{video.size}</td>
				<td>{video.createdAt}</td>
				<td>{video.publicLink !== null ? m['answers.yes'] : m['answers.no']}</td>
			</tr>
		{/each}
	</tbody>
</table>

