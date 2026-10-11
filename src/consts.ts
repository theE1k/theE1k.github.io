// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'Jisen Lei';
export const SITE_DESCRIPTION = 'Notes on backend engineering, AI agents, and system design.';

// Topics shown on the home page. A post joins a topic by listing its id under `tags`.
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
] as const;
