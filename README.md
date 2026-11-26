# devvit-app-template

Standard template for standalone [Reddit Devvit](https://developers.reddit.com/docs) Web apps under `AllHailSeizure`.

## Included Stack

- **Runtime & SDK:** Node `24` (`.node-version`), `@devvit/web`, `@devvit/start`, `@devvit/shared-types`, and `devvit` CLI pinned consistently (`0.15.6`).
- **Server:** Hono (`src/server/app.ts` separated from `src/server/index.ts` so routes can be tested in-process).
- **Quality gates:** `npm run check` runs `eslint`, `tsc --noEmit` (`strict: true`), `vitest`, and `vite build` (`dist/server/index.cjs`).
- **No-login testing:** `@devvit/test` (`createDevvitTest()`) extended by `FakeRedditWorld` + `ScenarioRunner` (`src/server/test-harness/`) for testing Hono triggers/menus and mocking Moderation/Listing/Flair APIs without logging in to Reddit.
- **Helpers:** Lightweight `logger()` (`src/server/helpers/logger.ts`) and `formatSignature()` (`src/server/helpers/signature.ts`).
- **CI/CD & Legal Docs:** GitHub Actions CI (`ci.yml`), tag-triggered lockstep release (`release.yml`), and per-repo GitHub Pages legal site (`docs/` + `pages.yml`).

---

## Creating a New App From This Template

1. On GitHub, click **Use this template → Create a new repository** under `AllHailSeizure` (public, default branch `master`).
2. Clone the new repository and customize these files:
   - `package.json` — set `"name"` to your app slug and `"version"` to your starting 3-part SemVer (e.g. `"0.1.0"` or matching your existing Devvit App Store version).
   - `devvit.json` — set `"name"` to your unique Devvit app slug, update `dev.subreddit`, `permissions`, `triggers`, `menu`, and `settings`.
   - `assets/icon.png` — replace the placeholder icon.
   - `docs/_config.yml` — update `title` and `baseurl` (`"/<your-repo-name>"`).
   - `docs/privacy.md` & `docs/terms.md` — replace `<APP_NAME>` and tailor data/terms sections.
3. Install dependencies and verify locally:

```sh
npm install
npm run check
```

4. Enable **GitHub Pages** in repository **Settings → Pages → Source: GitHub Actions** so `docs/` publishes to `https://allhailseizure.github.io/<repo>/`.
5. Configure the `DEVVIT_AUTH_TOKEN` secret (see below).

---

## Local Commands

```sh
npm run check       # lint + typecheck + test + vite build
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm test            # Vitest (no Reddit login required)
npm run build       # Vite build -> dist/server/index.cjs
npm run dev         # npx devvit playtest (requires Devvit login)
```

### No-Login Testing (offline virtual Reddit)

`createModTest()` in `src/server/test-harness/` wraps `@devvit/test` with:

- **`FakeRedditWorld`**: subreddits, users (mods, approved, banned, bots), threaded posts and comments, flair, reports, removals and approvals, modmail, wiki pages, mod notes and private messages behind the `reddit.*` API. Every write the app makes is logged (`world.describeActions()`).
- **`ScenarioRunner`**:
  - Simulates Reddit activity (`userPosts`, `userComments`, `report`, `modRemoves`, `userModmails`, `install`, …) and fires whichever triggers `devvit.json` declares.
  - Clicks menus and submits forms as a given user.
  - Advances a fake clock that runs cron tasks and `scheduler.runJob` jobs.
  - Offers a `given` / `when` / `then` scenario DSL.
- **`FakeHttp`**: per-domain `fetch` stubs. An unstubbed call fails the test, so does a host missing from `devvit.json` `permissions.http.domains`, and reddit.com is always blocked.
- **Coverage**: `expectAllEndpointsCovered()` fails if any declared trigger, menu, form or scheduler endpoint has no scenario.

See [`src/server/test-harness/README.md`](src/server/test-harness/README.md) for the API and known gaps, and `src/server/app.test.ts` for an example.

Apps created from this template keep the harness up to date with `npm run harness:sync`. `npm run harness:check` and the weekly `harness-drift` workflow report drift. Do not edit the harness folder in an app repo.

> `createModTest()` wraps plain `test(...)` calls only. For parameterised cases, loop over the cases and call `test(...)` for each one: `test.each` / `test.for` bypass the wrapper, so their tests get no `world` or `runner`.

---

## Required GitHub Secret (`DEVVIT_AUTH_TOKEN`)

The tag release workflow requires a repository (or organization) secret named **`DEVVIT_AUTH_TOKEN`** containing the **full raw contents** of your logged-in `~/.devvit/token` file:

```sh
npx devvit login
npx devvit whoami
gh secret set DEVVIT_AUTH_TOKEN < ~/.devvit/token
```

On Windows PowerShell:

```powershell
npx devvit whoami
Get-Content -LiteralPath (Join-Path $env:USERPROFILE '.devvit/token') -Raw |
  gh secret set DEVVIT_AUTH_TOKEN
```

> **Security & reliability note:** `DEVVIT_AUTH_TOKEN` is an undocumented CLI environment variable holding your personal Reddit OAuth refresh token — not a scoped CI service account. Keep it strictly on the tag release job (never PR workflows), rotate it if compromised, and note that it can expire or require re-login (`devvit login`) if Reddit invalidates sessions.

---

## Versioning & Release Process

### Versioning Rules

- **Strict 3-part SemVer only:** `MAJOR.MINOR.PATCH` (e.g. `1.2.0`). Never use 4-part versions or prerelease suffixes for releases.
- **Lockstep invariant:** Every release keeps four artifacts identical:
  1. `package.json` and `package-lock.json` (`"version": "X.Y.Z"`)
  2. Git tag (`vX.Y.Z`)
  3. GitHub Release (`vX.Y.Z`)
  4. Devvit App Store (`X.Y.Z`)

### Running a Release

Releases are tag-triggered. Pushing a `vX.Y.Z` tag runs **Release Devvit app** (`release.yml`), which publishes **that exact tagged commit** to the Devvit App Store. There is no manual publish button.

1. In a PR, bump the version in `package.json` and `package-lock.json` (`npm version X.Y.Z --no-git-tag-version`), merge it to `master`, and wait for **CI** (`ci.yml`) to pass.
2. Tag the merged commit and push **only the tag**:

```sh
git checkout master && git pull
git tag -a vX.Y.Z -m "Release vX.Y.Z"
git push origin vX.Y.Z
```

3. The workflow (a thin caller of the shared [`devvit-release.yml`](https://github.com/AllHailSeizure/.github/blob/master/.github/workflows/devvit-release.yml)) checks out the tag's commit and fails before publishing unless the tag is strict SemVer `vX.Y.Z`, the commit is on `master`, and `package.json` and `package-lock.json` already say `X.Y.Z`. It then runs `npm run check`, authenticates via `DEVVIT_AUTH_TOKEN`, runs `npx --no devvit publish --version X.Y.Z` (with `DEVVIT_ALLOW_SOURCE_UPLOAD=1`), asserts the store reports `X.Y.Z`, and creates GitHub Release `vX.Y.Z`. CI never pushes a commit back.

Releases publish as **unlisted**. To publish publicly, change `visibility: unlisted` to `public` in `release.yml`.

If a tag fails validation, nothing was published: delete the tag (`git push origin :refs/tags/vX.Y.Z`), fix the cause, and tag again. One release runs at a time per repository, so push tags one at a time.

> Note: `devvit publish` submits a version to Reddit's Developer Portal. Installing/upgrading on a subreddit (`devvit install`) and deploying any external Supabase migrations/functions remain separate steps.
