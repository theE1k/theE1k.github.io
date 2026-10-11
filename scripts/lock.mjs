// Encrypts the Markdown posts in private/ into src/content/locked/*.json.
// Only the encrypted copies are committed; private/ is git-ignored.
//
//   npm run lock            encrypt every post in private/
//   npm run lock -- my-post encrypt only private/my-post.md
//
// Files directly in private/ are always encrypted. Journal entries in
// private/journal/ stay on this machine unless their frontmatter says `locked: true`.
//
// The password is asked for on the terminal (or read from BLOG_PASSWORD).
import { webcrypto as crypto } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline';
import { Marked } from 'marked';
import { codeToHtml } from 'shiki';
import { parse as parseYaml } from 'yaml';

const SOURCE = 'private';
const TARGET = 'src/content/locked';
// Keep in sync with src/components/LockedPost.astro
const ITERATIONS = 600_000;

const marked = new Marked({
	async: true,
	async walkTokens(token) {
		if (token.type !== 'code') return;
		token.html = await codeToHtml(token.text, {
			lang: token.lang || 'text',
			themes: { light: 'min-light', dark: 'min-dark' },
		}).catch(() => undefined);
	},
	renderer: {
		code(token) {
			return token.html ?? false;
		},
	},
});

function askPassword(question) {
	return new Promise((resolve) => {
		const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
		// Hide what is typed
		rl._writeToOutput = (text) => {
			if (text.includes(question)) process.stdout.write(text);
		};
		rl.question(question, (answer) => {
			rl.close();
			process.stdout.write('\n');
			resolve(answer);
		});
	});
}

async function encrypt(password, text) {
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const material = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(password),
		'PBKDF2',
		false,
		['deriveKey'],
	);
	const key = await crypto.subtle.deriveKey(
		{ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITERATIONS },
		material,
		{ name: 'AES-GCM', length: 256 },
		false,
		['encrypt'],
	);
	const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(text));
	const base64 = (bytes) => Buffer.from(bytes).toString('base64');
	return { salt: base64(salt), iv: base64(iv), data: base64(new Uint8Array(data)) };
}

async function read(dir, section) {
	const names = (await fs.readdir(dir).catch(() => [])).filter(
		(name) => name.endsWith('.md') && !name.startsWith('_'),
	);
	return Promise.all(
		names.map(async (name) => {
			const raw = await fs.readFile(path.join(dir, name), 'utf8');
			const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
			return {
				slug: path.basename(name, '.md'),
				section,
				meta: match ? parseYaml(match[1]) : undefined,
				body: match?.[2],
			};
		}),
	);
}

const only = process.argv.slice(2);
const journal = await read(path.join(SOURCE, 'journal'), 'journal');
// A journal entry that is no longer marked `locked: true` is taken off the site
for (const entry of journal.filter((entry) => entry.meta?.locked !== true)) {
	const stale = path.join(TARGET, `${entry.slug}.json`);
	const existing = await fs.readFile(stale, 'utf8').catch(() => undefined);
	if (existing && JSON.parse(existing).section === 'journal') {
		await fs.rm(stale);
		console.log(`unlocked ${entry.slug} (encrypted copy removed)`);
	}
}
const files = [...(await read(SOURCE, 'blog')), ...journal.filter((entry) => entry.meta?.locked === true)].filter(
	(file) => only.length === 0 || only.includes(file.slug),
);
if (files.length === 0) {
	console.log('Nothing to encrypt.');
	process.exit(0);
}

const password = process.env.BLOG_PASSWORD || (await askPassword('Password: '));
if (!process.env.BLOG_PASSWORD && password !== (await askPassword('Repeat password: '))) {
	console.error('Passwords do not match.');
	process.exit(1);
}
if (password.length < 12) {
	console.error('Use at least 12 characters: the encrypted posts are public, so short passwords can be guessed offline.');
	process.exit(1);
}

await fs.mkdir(TARGET, { recursive: true });
for (const { slug, section, meta, body } of files) {
	if (!meta?.title || !meta?.pubDate || (section === 'blog' && !meta?.description)) {
		console.error(`${slug}: frontmatter needs title, pubDate${section === 'blog' ? ' and description' : ''}, skipped`);
		continue;
	}
	const html = await marked.parse(body);
	const entry = {
		title: meta.title,
		description: meta.description ?? '',
		pubDate: new Date(meta.pubDate).toISOString(),
		tags: meta.tags ?? [],
		section,
		...(await encrypt(password, html)),
	};
	await fs.writeFile(path.join(TARGET, `${slug}.json`), JSON.stringify(entry, null, '\t') + '\n');
	console.log(`locked ${slug}`);
}
