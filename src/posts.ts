import { getCollection } from 'astro:content';

// Public posts and password-protected posts as one list, newest first
export async function getAllPosts() {
	const [open, locked] = await Promise.all([getCollection('blog'), getCollection('locked')]);
	return [
		...open.map((post) => ({ id: post.id, locked: false, ...post.data })),
		...locked
			.filter((post) => post.data.section === 'blog')
			.map((post) => ({
				id: post.id,
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
