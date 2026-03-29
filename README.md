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
