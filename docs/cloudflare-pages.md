# Cloudflare Pages Deploy

## Build Settings

- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: project root

## GitHub Connection

1. Create the GitHub repository from this workspace.
2. In Cloudflare Pages, choose `Connect to Git`.
3. Select the repository.
4. Use the build settings above.
5. Attach the custom domain `abcollective.punkcity.ai` after the first successful deploy.

## Notes

- The game is a static build and does not require a backend for v1.
- Save data is stored client-side in the browser.
- Cloudflare Pages will rebuild automatically on every push to the production branch.
