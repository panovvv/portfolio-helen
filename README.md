# Based on Nuxt UI Minimal Starter

Look at [Nuxt docs](https://nuxt.com/docs/getting-started/introduction) and [Nuxt UI docs](https://ui.nuxt.com) to learn more.

## Setup

Make sure to install the dependencies:

```bash
# npm
npm install
```

... and generate the image list for the gallery:

```bash
npm run gallery-manifest
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
npm run dev
```

## Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Upgrades

* Install npm-check-updates (you can do this locally or globally):
```shell
npm install -g npm-check-updates
```

* Preview what would change (optional, but highly recommended):
```shell
ncu
```

* To update only within the ranges you've already specified (e.g. ^1.x→^1.y):
```shell
ncu -u
```

* To update to any newer version, including major bumps (1.x→2.x):
```shell
ncu -u --target latest
```

* Optional: Clear your node_modules and package-lock.json, then run
```shell
rm -rf ./node_modules ./package-lock.json
npm cache clean --force
```

* Re-install with the new versions:
```shell
npm install
```
