# Cloudflare Deploy

## Pages Build Settings

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

## Worker Deploy

- Deploy command: `npx wrangler deploy`
- Checked-in config: [`wrangler.jsonc`](../wrangler.jsonc)
- Asset directory: `dist`
- SPA fallback: enabled through `not_found_handling = "single-page-application"`

This path is useful if you want the app served as a Worker-backed static asset project instead of a Pages project.

## Worker Custom Domain

After the Worker has been deployed successfully:

1. Open Cloudflare Dashboard.
2. Go to `Workers & Pages`.
3. Open the `punkcity` Worker.
4. Open `Settings` then `Domains & Routes`.
5. Add the custom domain `abcollective.punkcity.ai`.
6. Confirm the DNS record Cloudflare creates for the Worker.

If the subdomain is already attached to a Pages project, remove that binding first so the Worker can claim the hostname cleanly.

## Notes

- The game is a static build and does not require a backend for v1.
- Save data is stored client-side in the browser.
- Cloudflare Pages will rebuild automatically on every push to the production branch.
- Worker deploys use the same built `dist/` output, but the runtime entry is managed by Wrangler and the Cloudflare Vite plugin.
