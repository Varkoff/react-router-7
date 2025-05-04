// $userSlug => slug dynamique

import {
	isRouteErrorResponse,
	useLoaderData,
	useRouteError,
} from 'react-router';
import { getUserBySlug } from '~/users.server';
import type { Route } from './+types/users.$userSlug';

export async function loader({ params }: Route.LoaderArgs) {
	console.log(params);
	const userSlug = params.userSlug;
	const user = await getUserBySlug({ slug: userSlug });
	if (!user) {
		throw new Response(`User ${userSlug} was not found`, {
			status: 404,
		});
	}
	console.log({ user });
	return { user };
}

export const handle = {
	name: `Virgile`,
	url: '/users/:userSlug',
};

export function meta({ data }: Route.MetaArgs) {
	if (!data) {
		return [
			{ title: 'Utilisateur non trouvé' },
			{
				property: 'og:title',
				content: 'Utilisateur non trouvé',
			},
		];
	}
	return [
		{ title: `${data.user?.name}` },
		{
			property: 'og:title',
			content: `${data.user?.name}`,
		},
		{
			name: 'description',
			content: `Profil de ${data.user?.name}`,
		},
	];
}

export default function User() {
	const { user } = useLoaderData<typeof loader>();
	// throw new Error("This is a test error")
	return (
		<div className='px-8 py-2'>
			<h1 className='text-2xl font-bold'>{user?.name}</h1>
		</div>
	);
}

export function ErrorBoundary() {
	const error = useRouteError();

	if (isRouteErrorResponse(error)) {
		return (
			<div className='flex flex-col items-center justify-center h-screen px-8 py-2'>
				<h1 className='text-3xl font-bold text-red-600 mb-2'>
					{error.status} {error.statusText}
				</h1>
				<p className='text-red-500'>{error.data}</p>
			</div>
		);
	} else if (error instanceof Error) {
		return (
			<div className='flex flex-col items-center justify-center h-screen px-8 py-2'>
				<h1 className='text-3xl font-bold text-red-600 mb-2'>Error</h1>
				<p className='text-red-500'>{error.message}</p>
				{/* <p>The stack trace is:</p> */}
				{/* <pre>{error.stack}</pre> */}
			</div>
		);
	} else {
		return <h1>Unknown Error</h1>;
	}
}
