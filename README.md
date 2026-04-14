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

Use pnpm instead of npm, it handles the WASM overrides correctly.
The following overrides are already in package.json under `pnpm.overrides`:
- rollup -> @rollup/wasm-node
- lightningcss -> lightningcss-wasm
- @tailwindcss/oxide -> @tailwindcss/oxide-wasm32-wasi
- @parcel/watcher -> @parcel/watcher-wasm

Then run install with --force!
```
pnpm install --force
```

When building, you'll need a lot of memory. 2GB won't cut it:
```
NODE_OPTIONS=--max-old-space-size=4096 pnpm run build
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

