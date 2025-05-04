import {
	href,
	isRouteErrorResponse,
	Link,
	NavLink,
	Outlet,
	useLoaderData,
	useRouteError,
	type ActionFunctionArgs,
} from 'react-router';
import { UserItem } from '../../components/UserItem';
import { addUser, getUsers } from '../../server/users.server';
import type { Route } from './+types/_usersLayout';

export async function loader({}: Route.LoaderArgs) {
	return { users: await getUsers() };
}

export default function Users() {
	const { users } = useLoaderData<typeof loader>();
	return (
		<div className='px-8 py-2 flex flex-row gap-4'>
			<ul className='flex flex-col gap-4 basis-[400px] flex-1'>
				<div className='flex flex-row gap-2 items-end w-full justify-between'>
					<div className='flex flex-col gap-2'>
						<h1 className='text-2xl font-bold'>Utilisateurs</h1>
						<div className='flex flex-row gap-2'>
							<Link
								to={href('/users/export/pdf')}
								reloadDocument
								className='px-4 py-2 h-fit rounded-sm bg-red-600 text-white'
							>
								PDF
							</Link>
							<Link
								to={href('/users/export/csv')}
								reloadDocument
								className='px-4 py-2 h-fit rounded-sm bg-blue-600 text-white'
							>
								CSV
							</Link>
							<Link
								to={href('/users/export/json')}
								reloadDocument
								className='px-4 py-2 h-fit rounded-sm bg-purple-600 text-white'
							>
								JSON
							</Link>
						</div>
					</div>
					<NavLink
						to={href('/users/:userSlug', {
							userSlug: 'new',
						})}
						className='px-4 py-2 h-fit rounded-sm bg-emerald-600 text-white'
					>
						Ajouter un utilisateur
					</NavLink>
				</div>
				{users.map((user) => (
					<UserItem key={user.id} user={user} />
				))}
			</ul>
			<div className='basis-[400px] flex-1 bg-slate-100 size-[400px] rounded-lg'>
				<Outlet />
			</div>
		</div>
	);
}


export async function action({ request }: ActionFunctionArgs) {
	console.log('trigger action');
	const formData = await request.formData();
	const name = formData.get('name') as string;
	console.log({ name });
	await addUser({ name: name });
	return { ok: true };
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
