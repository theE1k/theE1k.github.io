// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'Jisen Lei';
export const SITE_DESCRIPTION = 'Notes on backend engineering, AI agents, and system design.';

// Topics, each with its own page under /topics. A post joins a topic by listing its id under `tags`.
export const TOPICS = [
	{
		id: 'ai-agents',
		name: 'AI agents',
		text: 'Design patterns, evaluation, and what breaks in practice.',
		shape: 'pebble',
		color: '#3fb6a0',
		gradient: 'linear-gradient(160deg, #3d8fd1 0%, #9db7e8 45%, #f3a9a0 100%)',
	},
	{
		id: 'system-design',
		name: 'System design',
		text: 'Notes from working through real problems.',
		shape: 'triangle',
		color: '#6d5cf0',
		gradient: 'linear-gradient(200deg, #2f8f8a 0%, #a9c9a4 50%, #f2c79a 100%)',
	},
	{
		id: 'backend',
		name: 'Backend engineering',
		text: 'Lessons from Java, and from moving to Python.',
		shape: 'diamond',
		color: '#ee7b30',
		gradient: 'linear-gradient(150deg, #f08a4b 0%, #f3b6a3 50%, #b9a7f0 100%)',
	},
	{
		id: 'algorithms',
		name: 'Algorithms',
		text: 'Recognising the pattern, not memorising the solution.',
		shape: 'pebble',
		color: '#d94f4f',
		gradient: 'linear-gradient(165deg, #d94f4f 0%, #f0a58f 50%, #f4dca0 100%)',
	},
	{
		id: 'economics',
		name: 'Economics',
		text: 'Notes on economics.',
		shape: 'pill',
		color: '#2f9e6b',
		gradient: 'linear-gradient(170deg, #2f9e6b 0%, #b7d9a8 50%, #f4dc9c 100%)',
	},
	{
		id: 'anthropology',
		name: 'Anthropology',
		text: 'Notes on anthropology.',
		shape: 'squircle',
		color: '#c7802b',
		gradient: 'linear-gradient(190deg, #c7802b 0%, #edc38f 50%, #e9a7b4 100%)',
	},
] as const;

// Sections that are not topics but sit with them in the Topics menu and on /topics
export const SECTIONS = [
	{
		href: '/reading',
		name: 'Reading',
		text: 'Books and articles I am reading or have read.',
		shape: 'pebble',
		color: '#2f6fe4',
	},
	{
		href: '/journal',
		name: 'Journal',
		text: 'Personal notes, mostly in Chinese.',
		shape: 'squircle',
		color: '#e4588a',
	},
	{
		href: '/blog',
		name: 'All writing',
		text: 'Everything on the site, newest first.',
		shape: 'pill',
		color: 'var(--heading)',
	},
] as const;
