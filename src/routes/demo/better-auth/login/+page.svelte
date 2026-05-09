<script >
	import { enhance } from '$app/forms';
	
	let { form } = $props();
</script>

<h1>Login</h1>
<form method="post" action="?/signInEmail" use:enhance>
	<label>
		Email
		<input type="email" name="email" class="mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" autocomplete="email" />
	</label><br>
	<label>
		Password
		<input type="password" name="password" class="mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" autocomplete="current-password" />
	</label><br>
	<label>
		Name (for registration)
		<input name="name" class="mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
	</label><br>
	<button class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">Login</button>
	<button formaction="?/signUpEmail" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">Register</button>
	<button formaction="?/resetPassword" class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition">Reset Password</button>
</form>
<p class="text-red-500">{form?.message ?? ''}</p>
