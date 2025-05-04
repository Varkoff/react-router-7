import { getUsers } from '~/server/users.server';
import type { Route } from './+types/csv';

export async function loader({}: Route.LoaderArgs) {
	const users = await getUsers();
	// initializing the CSV string content with the headers
	let csvData = ['id', 'name', 'slug'].join(',') + '\r\n';

	users.forEach((user) => {
		// populating the CSV content
		// and converting the null fields to ""
		csvData += [user.id, user.name, user.slug].join(',') + '\r\n';
	});

	return new Response(csvData, {
		headers: {
			'Content-Type': 'text/csv',
			'Content-Disposition': `attachment; filename="users.csv"`,
		},
	});
}
