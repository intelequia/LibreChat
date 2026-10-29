# Intelewriter What's New

## Manual Release Notes

The profile menu opens Intelewriter's own What's New dialog. The separate Intelewriter
AdminPanel keeps its own notes in its repository; these histories are not mixed.

Run from the LibreChat repository root:

```sh
npm run add-changelog
npm run add-changelog -- --date 2026-10-23
```

The command reads the version in the root `package.json`. When that release is missing, it:

1. Creates `client/src/intelequia/news/content/librechat/v<VERSION>/en.md` and `es.md`.
2. Adds its version and release date to
   [`content/releases.json`](../client/src/intelequia/news/content/releases.json).
3. Sorts that index by descending semantic version.

Write the Markdown in both languages manually. The generated files only contain headings.
If the release already exists, nothing is changed, including its date and your notes. To update
the notes for the same application version, edit those existing Markdown files directly.

There is no import, translation, scraping, hash synchronization, publication, or external API
call. The existing English and Spanish history and upstream license are retained. The
`librechat` directory name is only the existing asset location, not the displayed product name.

## Historical Content Cleanup

Historical notes retain only What's Changed and Highlights, or their Spanish equivalents.
The selected blocks are kept verbatim, including their nested highlight details. Other
sections are removed. Entries without those blocks retain their metadata but no note text;
they are not removed from the catalog.

To preview or explicitly apply this cleanup:

```sh
node intelequia-patches/trim-changelog.mjs
node intelequia-patches/trim-changelog.mjs --write
```

This is an opt-in local Markdown cleanup, not part of `add-changelog` or a release job.

## Dates and Ordering

`content/releases.json` is the source of truth for dates and ordering metadata. Dates in old
Markdown frontmatter are not used by the dialog.

- The default date is today in UTC. `--date YYYY-MM-DD` specifies another release date.
- This is a release-note date, not evidence of when an environment was deployed.
- Versions sort by SemVer, not by date or JSON position: `0.8.10` precedes `0.8.9`, and a stable
  release precedes its release candidates. A newly added older version goes in its proper place.
- Breaking-change announcements remain separate, immediately after their associated release.
  Dates break ties between entries of the same version and category, newest first.
- The compiled root package version is the visibility ceiling. An older build never shows
  notes for a newer version.

You can edit the date in the index without changing UI code. `source` is optional and only
helps resolve relative links in historical Markdown. New notes do not require it.

## Rendering and Checks

The dialog keeps lazy loading, English fallback, Spanish regional locales, retry, keyboard
navigation, focus restoration, existing themes, and sanitized GFM Markdown. Keep notes focused
on changes rather than contributor credits, evidence, PRs, or commits. Writing notes manually
does not require running import or translation checks.

```sh
node --test intelequia-patches/add-changelog.test.mjs
node intelequia-patches/news-browser.mjs
```

From `client`, the existing focused Jest tests cover `catalog.spec.ts` and `Markdown.spec.tsx`;
`npm run typecheck` and `npm run build` remain the frontend gates. The Chromium check is only a
UI test with simulated authentication, not a release automation job.
