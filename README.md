# VastRobustMediaStoragePlatform (VRMSP)

A Free and Open Source Software project that gives you a self hostable web platform to share big/huge video/picture files.
This is a project for college.


## Installing

You can clone and then install using pnpm install!.

```sh
git clone https://github.com/Miniontoby/VastRobustMediaStoragePlatform.git
cd VastRobustMediaStoragePlatform
pnpm install
```

### Installing on Openbsd

For OpenBSD you'll need to patch the package.json file, in order to make sure that OpenBSD uses the WASM variants.
This is needed because these packages do not provide direct support for OpenBSD.

Save the following code into `fix_openbsd.patch` file and then run `git apply fix_openbsd.patch`
```patch
diff --git a/package.json b/package.json
index 4410c92..77114c8 100644
--- a/package.json
+++ b/package.json
@@ -66,5 +66,18 @@
 		"vite-plugin-devtools-json": "^1.0.0",
 		"vitest": "^4.1.4",
 		"vitest-browser-svelte": "^2.1.1"
 	},
 	"pnpm": {
 		"supportedArchitectures": {
 			"os": ["win32", "linux", "openbsd", "any"],
 			"cpu": ["x64", "wasm32"],
 			"libc": ["unknown", "any"]
-		}
+		},
+		"overrides": {
+			"rollup": "npm:@rollup/wasm-node",
+			"@parcel/watcher": "npm:@parcel/watcher-wasm",
+			"lightningcss": "npm:lightningcss-wasm",
+			"@tailwindcss/oxide": "npm:@tailwindcss/oxide-wasm32-wasi"
+		}
 	}
 }
```

After that is done, then you can run the install like normal:
```sh
pnpm install
```

If it doesn't want to work, you can add `--force` at the end (`pnpm install --force`)


## Initialize

To initialize, you have to copy `.env.example` and name the new file `.env`

Then go edit `.env` and fill in your database details, and the ORIGIN (e.g.: `https://yourdomain.com`) and fill in a secret key for auth.

Then to initialize the database, you run this:
```sh
pnpm run db:generate
pnpm run db:push
```


## Developing

Once you've created a project and installed dependencies with `pnpm install`, start a development server:

```sh
pnpm run dev

# or start the server and open the app in a new browser tab
pnpm run dev -- --open
```

## Building

To create a production version of your app:

```sh
pnpm run build
```

You can preview the production build with `pnpm run preview`.


# Threat model mitigrations

## Path traversal

To avoid path traversal exploits during uploads, inside `src\routes\api\upload\finalize\[uploadId=uuid]\+server.js` we use the UUID as the filename instead of a user provided filename.
The user provided filename is only used for the uploader to identify their files.
