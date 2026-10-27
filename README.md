# Skin Disease UI

## Run locally

```bash
npm ci
npm run dev
```

## Build

```bash
npm run build
```

## Host on GitHub Pages

This repository includes `.github/workflows/deploy-pages.yml` that deploys the Vite `dist/` output to GitHub Pages on every push to `main`.

Required repository configuration:

1. **Settings → Pages → Source**: set to **GitHub Actions**
2. Add repository secret `VITE_API_BASE_URL` with your backend API URL

The workflow builds with `VITE_BASE=/skin-disease-ui/` for project pages routing.
