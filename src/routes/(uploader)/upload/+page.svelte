<script>
	import { m } from '$lib/paraglide/messages.js';
	import { resolve } from '$app/paths';
	import { uploadFile } from '$lib/services/file_uploader_service.js';

	let files = $state();
	/** @type {Number|null} */
	let progress = $state(null);
	let uploadId = $state("");

	/** @param {Number} percentage */
	function updateProgressCallback(percentage) {
		progress = percentage;
		if (progress === 100) {
			console.log('We should practically be done...');
		}
	}

	/** @param {SubmitEvent} event */
	async function submitCallback(event) {
		event.preventDefault();

		// TODO Maybe in a new usecase add multiple file uploads at once?
		if (files && files.length > 0) {
			progress = 0;
			const file = files[0];
			try {
				const response = await uploadFile(file, updateProgressCallback);
				console.log(response);
				uploadId = response.uploadId
				progress = 100;
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
<br>

<form onsubmit={submitCallback} method="post">
	<input type="file" id="video" name="video" bind:files={files} accept="video/*" /><br/>
	<button class="btn btn-primary" disabled={progress !== null}>{m['actions.upload']()}</button>
</form>

{#if progress !== null}
	<dialog id="popup-modal" tabindex="-1" aria-labelledby="dialog-title" class="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full flex" open>
		<div class="relative p-4 w-full max-w-md max-h-full">
			<div class="relative bg-neutral-primary-soft border border-default rounded-base shadow-sm p-4 md:p-6">
				<button type="button" class="absolute top-3 inset-e-2.5 text-body bg-transparent hover:bg-neutral-tertiary hover:text-heading rounded-base text-sm w-9 h-9 ms-auto inline-flex justify-center items-center" onclick={closePopup}>
					<svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6"/></svg>
					<span class="sr-only">Close modal</span>
				</button>
				<div class="p-4 md:p-5 text-center">
					{#if progress === 100}
						<h3 id="dialog-title" class="mb-6">{m['pages.upload.uploaded.title']()}</h3>
						<div class="mt-2">
							<p class="text-sm text-gray-400">{m['pages.upload.uploaded.description']()}</p>
							<p><a href={resolve("/(uploader)/videos/[id]", { id: uploadId })}>{uploadId}</a></p>
						</div>
						<div class="flex items-center space-x-4 justify-center">
							<button type="button" class="btn btn-success" onclick={closePopup}>{m['actions.okay']()}</button>
						</div>
					{:else}
						<h3 id="dialog-title" class="mb-6">{m['pages.upload.uploading.title']()}</h3>
						<div class="mt-2">
							<p class="text-sm text-gray-400">{m['pages.upload.uploading.description']({ progress: String(progress) })}</p>
						</div>
						<div class="flex items-center space-x-4 justify-center">
							<button type="button" class="btn btn-danger" onclick={cancelUpload}>{m['actions.cancel']()}</button>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</dialog>
{/if}

<style>
	@reference "tailwindcss";
</style>