<script>
	import { page } from '$app/state';

	let { userRow } = page.data;
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
	}} */
	let user = $derived(userRow);
</script>

<h1>{user.name}</h1>
<p>{user.email}</p>
