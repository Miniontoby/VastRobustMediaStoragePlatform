# VastRobustMediaStoragePlatform (VRMSP)

A Free and Open Source Software project that gives you a self hostable web platform to share big/huge video/picture files.
This is a project for college.


## Installing

You can clone and then install using pnpm install!

```sh
git clone https://github.com/Miniontoby/VastRobustMediaStoragePlatform.git
cd VastRobustMediaStoragePlatform
pnpm install
```

Make sure you have NodeJS installed and that you got pnpm installed as well. To install pnpm, you can run this command:
```sh
npm install --global pnpm@latest-11
```
(may require root privileges under unix systems)


### Installing on Openbsd

For OpenBSD you'll need to patch the package.json file, in order to make sure that OpenBSD uses the WASM variants.
This is needed because these packages do not provide direct support for OpenBSD.

Save the following code into `fix_openbsd.patch` file and then run `git apply fix_openbsd.patch`
```patch
diff --git a/package.json b/package.json
index c66eba2..8d20d0d 100644
--- a/package.json
+++ b/package.json
@@ -97,7 +97,11 @@
                        ]
                },
                "overrides": {
-                       "better-call": ">=1.3.5"
+                       "better-call": ">=1.3.5",
+                       "rollup": "npm:@rollup/wasm-node",
+                       "@parcel/watcher": "npm:@parcel/watcher-wasm",
+                       "lightningcss": "npm:lightningcss-wasm",
+                       "@tailwindcss/oxide": "npm:@tailwindcss/oxide-wasm32-wasi"
                }
        }
 }
```

After that is done, then you can run the install like normal:
```sh
pnpm install
```

If it doesn't want to work, you can add `--force` at the end (`pnpm install --force`)

You must also install ffmpeg and add it to PATH or put it inside the folder of the software.


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

## Testing

To run the unit test and UI tests that are included in the project you can use this command:
```sh
pnpm run test
```

If you need to specifically only test unit tests:
```sh
pnpm run test:unit
```

If you need to specifically only test UI/e2e tests:
```sh
pnpm run test:e2e
```

**Note: Tests must be ran before making any pull requests! and preferably also add new ones for the use cases you're adding!**


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
