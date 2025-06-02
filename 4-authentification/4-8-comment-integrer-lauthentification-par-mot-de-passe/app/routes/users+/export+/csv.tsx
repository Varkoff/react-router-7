import { getUsers } from "~/server/users.server";
import type { Route } from "./+types/csv";

export async function loader({}: Route.LoaderArgs) {
	const users = await getUsers();
	// initializing the CSV string content with the headers
	let csvData = `${["id", "firstName", "lastName", "slug", "age", "active"].join(",")}\r\n`;

	for (const user of users) {
		// populating the CSV content
		// and converting the null fields to ""
		csvData += `${[user.id, user.firstName, user.lastName, user.slug, user.age, user.active].join(",")}\r\n`;
	}

	return new Response(csvData, {
		headers: {
			"Content-Type": "text/csv",
			"Content-Disposition": `attachment; filename="users.csv"`,
		},
	});
}
