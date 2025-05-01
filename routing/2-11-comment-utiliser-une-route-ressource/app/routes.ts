import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
	index('routes/home.tsx'),
	route('users', 'routes/_usersLayout.tsx', [
		index('routes/users.index.tsx'),
		route(':userSlug', 'routes/users.$userSlug.tsx'),
	]),
	route('users.json', 'routes/users.json.tsx'),
	route('users.csv', 'routes/users.csv.tsx'),
	route('users.pdf', 'routes/users.pdf.tsx'),
] satisfies RouteConfig;
