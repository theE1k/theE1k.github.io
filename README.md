# thee1k.github.io

Source for my personal blog: <https://thee1k.github.io>

Built with [Astro](https://astro.build/) and deployed to GitHub Pages by the workflow in `.github/workflows/deploy.yml` on every push to `main`.

## Writing a post

Add a Markdown or MDX file to `src/content/blog/`. The filename becomes the URL slug.

```markdown
---
title: 'Post title'
description: 'One-line summary.'
pubDate: 2026-10-11
---
```

Optional frontmatter: `updatedDate`, `heroImage`.

## Password-protected posts

Write the post as Markdown in `private/` (git-ignored) with the same frontmatter, then run:

```sh
npm run lock              # encrypt every post in private/
npm run lock -- my-post   # encrypt only private/my-post.md
```

This asks for a password and writes an encrypted copy to `src/content/locked/`, which is what gets committed. The title, description, date and tags stay readable; the body is decrypted in the reader's browser. Run it again after editing a post.

## Journal

Personal entries live under `/journal` and stay out of the home page's recent posts and the RSS feed. Each entry needs only `title` and `pubDate`, and can be:

- **local only** (the default): write it in `private/journal/`. It is git-ignored and only shows up in `npm run dev`.
- **password-protected**: add `locked: true` to its frontmatter and run `npm run lock`. Remove the line and run it again to take the entry back off the site.
- **public**: put the file in `src/content/journal/`.

`private/journal/_template.md` is a starting point; files starting with `_` are ignored.

## Local development

Requires Node.js 22.12 or later.

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
```
