import { getCollection } from 'astro:content';

// Public posts and password-protected posts as one list, newest first
export async function getAllPosts() {
	const [open, locked] = await Promise.all([getCollection('blog'), getCollection('locked')]);
	return [
		...open.map((post) => ({ id: post.id, url: `/blog/${post.id}/`, locked: false, ...post.data })),
		...locked
			.filter((post) => post.data.section === 'blog')
			.map((post) => ({
				id: post.id,
				url: `/blog/${post.id}/`,
				locked: true,
				title: post.data.title,
				description: post.data.description,
				pubDate: post.data.pubDate,
				tags: post.data.tags,
			})),
	].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());
}

// Journal entries, newest first. `status` says where an entry can be read:
//   public  on the site
//   locked  on the site, behind a password
//   local   only on this machine, in the dev server (never in a build)
export async function getJournal() {
	const [open, locked, local] = await Promise.all([
		getCollection('journal'),
		getCollection('locked'),
		import.meta.env.DEV ? getCollection('journalLocal') : [],
	]);
	const localIds = new Set(local.map((entry) => entry.id));
	return [
		...open.map((entry) => ({ status: 'public' as const, entry, cipher: undefined })),
		// In dev the readable local copy is shown instead of its encrypted version
		...locked
			.filter((entry) => entry.data.section === 'journal' && !localIds.has(entry.id))
			.map((entry) => ({ status: 'locked' as const, entry, cipher: entry.data })),
		...local.map((entry) => ({ status: 'local' as const, entry, cipher: undefined })),
	]
		.map((item) => ({
			...item,
			id: item.entry.id,
			title: item.entry.data.title,
			description: item.entry.data.description,
			pubDate: item.entry.data.pubDate,
		}))
		.sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());
}

// Everything readable on the site in one list, newest first: posts, journal entries
// (not the local-only ones) and reading notes. Undated reading notes go last.
export async function getAllWriting() {
	const [posts, journal, reading] = await Promise.all([getAllPosts(), getJournal(), getCollection('reading')]);
	return [
		...posts.map((post) => ({
			url: post.url,
			title: post.title,
			description: post.description,
			pubDate: post.pubDate as Date | undefined,
			locked: post.locked,
			kind: undefined as string | undefined,
			tags: post.tags,
		})),
		...journal
			.filter((entry) => entry.status !== 'local')
			.map((entry) => ({
				url: `/journal/${entry.id}/`,
				title: entry.title,
				description: entry.description,
				pubDate: entry.pubDate as Date | undefined,
				locked: entry.status === 'locked',
				kind: 'Journal' as string | undefined,
				tags: [] as string[],
			})),
		...reading
			.filter((entry) => (entry.body ?? '').trim().length > 0)
			.map((entry) => ({
				url: `/reading/${entry.id}/`,
				title: entry.data.title,
				description: entry.data.comment ?? entry.data.author ?? '',
				pubDate: entry.data.date,
				locked: false,
				kind: 'Reading' as string | undefined,
				tags: [] as string[],
			})),
	].sort((a, b) => (b.pubDate?.valueOf() ?? 0) - (a.pubDate?.valueOf() ?? 0));
}
