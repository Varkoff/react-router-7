import { getUsers } from '~/server/users.server';
import type { Route } from './+types/csv';


export async function loader({}: Route.LoaderArgs) {
	return Response.json({ users: await getUsers() }, {
        headers: {
            "Cache-Control": "public, max-age=3600",
            "Content-Type": "application/json",
        }
    });
}