import {
	Form,
	href,
	isRouteErrorResponse,
	Link,
	useLoaderData,
	useRouteError,
	type ActionFunctionArgs,
} from 'react-router';
import { addUser, getUsers } from '~/users.server';

export async function loader() {
	console.log('trigger loader');
	return { users: await getUsers() };
}

export default function Users() {
	console.log('render component');
	const { users } = useLoaderData<typeof loader>();
	return (
		<div className='px-8 py-2'>
			<h1 className='text-2xl font-bold'>Utilisateurs</h1>
			<ul>
				{users.map((user) => (
					<li key={user.id} className='text-lg font-mono'>
						<Link
							className='text-blue-500 hover:text-blue-700'
							to={href("/users/:userSlug", {
								userSlug: user.slug
							})}
						>
							{user.name}
						</Link>
					</li>
				))}
			</ul>
			<Form method='POST' className='mt-6 flex gap-2'>
				<input
					type='text'
					name='name'
					className='px-3 py-2 border border-gray-300 focus:outline-none'
					placeholder="Nom d'utilisateur"
				/>
				<button type='submit' className='px-4 py-2 bg-blue-600 text-white'>
					Ajouter un utilisateur
				</button>
			</Form>
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
		  <h1 className="text-3xl font-bold text-red-600 mb-2">
			{error.status} {error.statusText}
		  </h1>
		  <p className="text-red-500">{error.data}</p>
		</div>
	  );
	} else if (error instanceof Error) {
	  return (
		<div className='flex flex-col items-center justify-center h-screen px-8 py-2'>
		  <h1 className="text-3xl font-bold text-red-600 mb-2">Error</h1>
		  <p className="text-red-500">{error.message}</p>
		  {/* <p>The stack trace is:</p> */}
		  {/* <pre>{error.stack}</pre> */}
		</div>
	  );
	} else {
	  return <h1>Unknown Error</h1>;
	}
  }