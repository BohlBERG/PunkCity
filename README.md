# PunkCity

Browser-hosted 1980s side-scrolling beat 'em up prototype for `abcollective.punkcity.ai`.

## Project

- [Game design brief](./docs/abcollective-browser-beatemup-plan.md)
- [Cloudflare Pages deploy notes](./docs/cloudflare-pages.md)

## Stack

- Phaser 3
- TypeScript
- Vite
- DOM HUD layered over the game canvas

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

Cloudflare Pages should use `npm run build` with `dist/` as the output directory.

## Cloudflare Worker Deploy

```bash
npm run cf:deploy
```

This project now includes a checked-in [wrangler.worker.jsonc](./wrangler.worker.jsonc) that serves the built `dist/` output as a single-page application when deployed with Workers.

After deploy, attach `abcollective.punkcity.ai` to the `punkcity` Worker in Cloudflare under `Workers & Pages` -> `Settings` -> `Domains & Routes`.

For Cloudflare Pages, set the dashboard build command to `npm run build`. Do not use `npx vitepress build`.
