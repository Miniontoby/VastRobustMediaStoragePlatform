<script >
	import { enhance } from '$app/forms';
	
	let { form } = $props();
</script>

<h1>Reset Password</h1>
<form method="post" action="" use:enhance>
	<label>
		New Password
		<input type="password" name="newPassword" class="mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" autocomplete="new-password" />
	</label><br>
	<button class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">Reset</button>
</form>
<p class="text-red-500">{form?.message ?? ''}</p>
