<script>
	import { m } from '$lib/paraglide/messages.js';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	let { data } = page;
	/** @type {{
		id: string;
		name: string;
		email: string;
		emailVerified: boolean;
		createdAt: Date;
		role: string | null;
		banned: boolean | null;
		banReason: string | null;
		banExpires: Date | null;
	}[]} */
	const users = data.users;
</script>

<h1>Users</h1>
<p>Here's a list of the existing users</p>
<p>Click <a href={resolve('/users/create')}>here</a> if you need to create a new user/uploader/admin</p>

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Email</th>
			<th>Email Verified</th>
			<th>{m['pages.videos.table.date']()}</th>
			<th>Role</th>
			<th>Banned?</th>
		</tr>
	</thead>
	<tbody>
		{#each users as user (user.id)}
			<tr>
				<td>
					<a href={resolve('/(admin)/users/[id]', { id: String(user.id) })}>
						{user.name}
					</a>
				</td>
				<td>{user.email}</td>
				<td>{user.emailVerified}</td>
				<td>{user.createdAt}</td>
				<td>{user.role}</td>
				<td>{user.banned ? user.banReason : "false"}</td>
			</tr>
		{/each}
	</tbody>
</table>
