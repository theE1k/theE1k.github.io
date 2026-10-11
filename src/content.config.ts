import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
			// Topic ids from src/consts.ts, e.g. ['ai-agents']
			tags: z.array(z.string()).default([]),
		}),
});

// Password-protected posts: encrypted by `npm run lock`, decrypted in the browser
const locked = defineCollection({
	loader: glob({ base: './src/content/locked', pattern: '*.json' }),
	schema: z.object({
		title: z.string(),
		description: z.string().default(''),
		pubDate: z.coerce.date(),
		tags: z.array(z.string()).default([]),
		section: z.enum(['blog', 'journal']).default('blog'),
		salt: z.string(),
		iv: z.string(),
		data: z.string(),
	}),
});

const journalSchema = z.object({
	title: z.string(),
	description: z.string().default(''),
	pubDate: z.coerce.date(),
	locked: z.boolean().default(false),
});

// Public journal entries
const journal = defineCollection({
	loader: glob({ base: './src/content/journal', pattern: '**/[^_]*.md' }),
	schema: journalSchema,
});

// Journal entries that stay on this machine: private/ is git-ignored, and these are
// only shown by the local dev server (see src/posts.ts)
const journalLocal = defineCollection({
	loader: glob({ base: './private/journal', pattern: '**/[^_]*.md' }),
	schema: journalSchema,
});

export const collections = { blog, locked, journal, journalLocal };
