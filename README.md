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

## Local development

Requires Node.js 22.12 or later.

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
```
