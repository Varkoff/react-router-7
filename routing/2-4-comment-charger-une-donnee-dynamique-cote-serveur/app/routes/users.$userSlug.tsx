// $userSlug => slug dynamique

import { useLoaderData } from 'react-router';
import { getUserBySlug } from '~/users.server';
import type { Route } from './+types/users.$userSlug';

export async function loader({ params }: Route.LoaderArgs) {
	console.log(params);
	const userSlug = params.userSlug;
	const user = await getUserBySlug({ slug: userSlug });
	return { user };
}

export default function User() {
	const { user } = useLoaderData<typeof loader>();
	return (
		<div className='px-8 py-2'>
			<h1 className='text-2xl font-bold'>{user?.name}</h1>
		</div>
	);
}
