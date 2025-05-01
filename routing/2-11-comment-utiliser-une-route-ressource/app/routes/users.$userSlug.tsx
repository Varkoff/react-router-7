// $userSlug => slug dynamique

import {
	Form,
	href,
	isRouteErrorResponse,
	redirect,
	useLoaderData,
	useParams,
	useRouteError,
} from 'react-router';
import { addUser, getUserBySlug, updateUser } from '~/users.server';
import type { Route } from './+types/users.$userSlug';

export async function loader({ params }: Route.LoaderArgs) {
	const userSlug = params.userSlug;
	const isNew = userSlug === 'new';
	if (isNew) {
		return { user: null };
	}
	const user = await getUserBySlug({ slug: userSlug });
	if (!user) {
		throw new Response(`User ${userSlug} was not found`, {
			status: 404,
		});
	}
	console.log({ user });
	return { user };
}

export async function action({ request, params }: Route.ActionArgs) {
	const formData = await request.formData();
	const name = formData.get('name');
	
	const userSlug = params.userSlug;
	const isNew = userSlug === 'new';
	if (isNew) {
		const createdUser = await addUser({ name: name as string });
		return redirect(href('/users/:userSlug', {
			userSlug: createdUser.slug
		}));
	}
	const updatedUser = await updateUser({ slug: userSlug, name: name as string });
	return redirect(href('/users/:userSlug', {
		userSlug: updatedUser.slug
	}));
}

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
	const { userSlug } = useParams();
	const isNew = userSlug === 'new';
	return (
		<div className='px-8 py-2 flex flex-col gap-4 w-full'>
			{isNew ? (
				<h1 className='text-lg font-bold'>Ajouter un utilisateur</h1>
			) : (
				<h1 className='text-lg font-bold'>Modifier un utilisateur</h1>
			)}
			<Form
				key={userSlug}
				method='POST'
				className='flex w-full flex-col gap-3 p-4 bg-white rounded-lg shadow-sm'
			>
				<input
					type='text'
					name='name'
					defaultValue={user?.name}
					className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
				/>
				<button
					type='submit'
					className={`px-4 py-2  text-white rounded-md 0 transition-colors ${
						isNew
							? 'bg-emerald-600 hover:bg-emerald-700'
							: 'bg-blue-600 hover:bg-blue-700'
					}`}
				>
					{isNew ? 'Ajouter' : 'Modifier'}
				</button>
			</Form>
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
