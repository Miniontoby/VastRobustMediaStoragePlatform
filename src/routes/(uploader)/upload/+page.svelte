<script>
	import { m } from '$lib/paraglide/messages.js';
	import { uploadFile } from '$lib/file_uploader.js';

	let files = $state();
	let progress = $state(null);
	let chooseFileBtn; // bind:this on the file upload

	function updateProgressCallback(percentage) {
		progress = percentage;
		if (progress === 100) {
			console.log('We should practically be done...');
		}
	}

	async function submitCallback(event) {
		event.preventDefault();

		// TODO Maybe in a new usecase add multiple file uploads at once?
		if (files && files.length > 0) {
			progress = 0;
			const file = files[0];
			try {
				await uploadFile(file, updateProgressCallback);
				// TODO Add message when done
			} catch (e) {
				console.error(e);
				// TODO Add frontend message
			}
		} else {
			alert("Missing file...");
		}
	}

	function closePopup() {
		progress = null;
	}

	function cancelUpload() {
		// TODO add cancel here...
		closePopup();
	}
</script>

<h1>{m['pages.upload.title']()}</h1>
<p>{m['pages.upload.description']()}</p>

<form onsubmit={submitCallback}>
	<input type="file" id="video" name="video" bind:this={chooseFileBtn} accept="video/*" /><br/>
	<button disabled={progress === null}>{m['actions.upload']()}</button>
</form>

{#if progress !== null}
	<div role="alert" class="popup">
		{#if progress === 100}
			<h1>{m['pages.upload.uploaded.title']()}</h1>
			<br>
			<p>{m['pages.upload.uploaded.description']()}</p>
			<button onclick={closePopup}>{m['actions.okay']()}</button>
		{:else}
			<h1>{m['pages.upload.uploading.title']()}</h1>
			<br>
			<p>{m['pages.upload.uploading.description({ progress })}</p>
			<button onclick={cancelUpload}>{m['actions.cancel']()}</button>
		{/if}
	</div>
{/if}

