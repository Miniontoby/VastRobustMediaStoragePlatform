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
```json
diff --git a/package.json b/package.json
index 4410c92..77114c8 100644
--- a/package.json
+++ b/package.json
@@ -66,5 +66,18 @@
 		"vite-plugin-devtools-json": "^1.0.0",
 		"vitest": "^4.1.4",
 		"vitest-browser-svelte": "^2.1.1"
+	},
+	"pnpm": {
+		"supportedArchitectures": {
+			"os": ["openbsd", "any"],
+			"cpu": ["x64", "wasm32"],
+			"libc": ["unknown", "any"]
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
```
pnpm install
```

If it doesn't want to work, you can add `--force` at the end (`pnpm install --force`)


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

