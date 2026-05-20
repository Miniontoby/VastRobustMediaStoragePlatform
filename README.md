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
npm install --global pnpm@latest-10
```
(may require root privileges under unix systems)


### Installing on Openbsd

For OpenBSD you'll need to patch the package.json file, in order to make sure that OpenBSD uses the WASM variants.
This is needed because these packages do not provide direct support for OpenBSD.

Save the following code into `fix_openbsd.patch` file and then run `git apply fix_openbsd.patch`
```patch
diff --git a/pnpm-workspace.yaml b/pnpm-workspace.yaml
index 79b9e34..ca093e0 100644
--- a/pnpm-workspace.yaml
+++ b/pnpm-workspace.yaml
@@ -6,6 +6,10 @@ allowBuilds:

 overrides:
   'better-call': '>=1.3.5'
+  'rollup': 'npm:@rollup/wasm-node'
+  '@parcel/watcher': 'npm:@parcel/watcher-wasm'
+  'lightningcss': 'npm:lightningcss-wasm'
+  '@tailwindcss/oxide': 'npm:@tailwindcss/oxide-wasm32-was'

 supportedArchitectures:
   os:
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
The migrations are made for use with MariaDB, not with MySQL. Altho you technically can use MySQL if you change one line.

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
To run the auth.spec.js test, you will need a working database connection in the .env file!


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


# First time use

After installing and setting up the database for the first time, you need to register your first account as soon as you can.
This first account will be your admin account! After an admin account has been registered, the register form will only be used to register as a normal user.


# Threat model mitigrations

## Path traversal

To avoid path traversal exploits during uploads, inside `src\routes\api\upload\finalize\[uploadId=uuid]\+server.js` we use the UUID as the filename instead of a user provided filename.
The user provided filename is only used for the uploader to identify their files.
