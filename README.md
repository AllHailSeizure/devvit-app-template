# Devvit App Template

**A production-ready starting point for [Reddit Devvit](https://developers.reddit.com/docs) Web apps — Hono server, offline Reddit simulation, and local quality checks in one repo.**

<!-- SCREENSHOT: Devvit playtest or a moderator clicking "Example Action" on a post and seeing the success toast -->

> 📸 Screenshot coming soon: the template’s example moderator menu action and optional post-submit automation in a playtest subreddit.

## What you get

- **Node 24** (see `.node-version`) with **Devvit Web** `@devvit/web` and the `devvit` CLI pinned at **0.15.6** (matches `package.json`).
- **Hono server** — route logic in `src/server/app.ts`, thin entry in `src/server/index.ts` so you can test routes in-process.
- **Example Devvit surface** in `devvit.json`:
  - `onPostSubmit` trigger at `/internal/triggers/post-submit`
  - Moderator post menu **Example Action** at `/internal/menu/example-action`
  - Subreddit settings: `enabled` (boolean) and `botSignature` (paragraph)
  - Permissions: Redis and Reddit API enabled; placeholder playtest subreddit in `dev.subreddit`
- **Sample behavior** — posts whose titles contain `[TEST-REMOVE]` get a bot comment (with optional signature) and removal; the menu shows a success toast. Replace this with your own logic.
- **Helpers** — `logger()` (`src/server/helpers/logger.ts`) and `formatSignature()` (`src/server/helpers/signature.ts`).
- **`npm run check`** — ESLint, TypeScript (`strict`), Vitest, and Vite build (`dist/server/index.cjs`) in one command.
- **No-login tests** — `createModTest()` in `src/server/test-harness/` wraps `@devvit/test` with `FakeRedditWorld`, `ScenarioRunner`, `FakeHttp`, and endpoint coverage checks. See [`src/server/test-harness/README.md`](src/server/test-harness/README.md) and `src/server/app.test.ts`.
- **Legal docs scaffold** — Jekyll pages under `docs/` (terms and privacy). Customize before the Reddit Developer Portal.

## Start a new app from this template

### 1. Create your repository

On GitHub, open this repo and choose **Use this template → Create a new repository**.

### 2. Rename and configure

Clone your new repo, then update:

| Item | What to change |
|------|----------------|
| `package.json` | `"name"` (your app slug) and `"version"` (starting SemVer, e.g. `0.1.0`) |
| `devvit.json` | `"name"`, `dev.subreddit` (playtest community), `permissions`, `triggers`, `menu`, `settings` |
| `assets/icon.png` | Your app icon (`marketingAssets.icon` in `devvit.json`) |
| `docs/_config.yml` | `title` and `baseurl` (e.g. `"/your-repo-name"`) |
| `docs/privacy.md` & `docs/terms.md` | Replace `<APP_NAME>`, set effective dates, tailor sections |

### 3. Install and verify

```sh
npm install
npm run check
```

### 4. Playtest on Reddit (optional)

Requires a Devvit login and a subreddit you can use for development (`dev.subreddit` in `devvit.json`):

```sh
npm run dev
```

(`npm run dev` runs `devvit playtest`.)

### 5. Host legal pages (optional)

If you use `docs/` for Terms and Privacy, enable **GitHub Pages** in repository settings with **Source: GitHub Actions**. Set `url` and `baseurl` in `docs/_config.yml` so links resolve on your Pages site.

## Day-to-day commands

```sh
npm run check       # lint + typecheck + test + build
npm run lint        # ESLint on src/
npm run lint:fix    # ESLint with --fix
npm run format      # Prettier --write on src/
npm run typecheck   # tsc --noEmit
npm test            # vitest run (no Reddit login)
npm run test:watch  # vitest watch mode
npm run build       # vite build -> dist/server/index.cjs
npm run dev         # devvit playtest
```

## Offline testing (brief)

`createModTest({ appFactory: createApp, settings: { … } })` gives each test a fake Reddit (`world`), scenario runner (`runner`), HTTP stubs (`http`), and more. Use plain `test(...)` only — `test.each` / `test.for` skip the wrapper.

Apps forked from this template should refresh the harness from upstream with:

```sh
npm run harness:sync
npm run harness:check
```

Do not edit `src/server/test-harness/` or `scripts/sync-test-harness.mjs` by hand in an app repo; sync from this template instead.

Full API: [`src/server/test-harness/README.md`](src/server/test-harness/README.md).

## License

This project is [MIT licensed](LICENSE) (`package.json` sets `"license": "MIT"`). Copyright (c) 2026 Nate Bosma.