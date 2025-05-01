import { Suspense } from 'react';
import {
	Await,
	Form,
	href,
	isRouteErrorResponse,
	Link,
	useLoaderData,
	useRouteError,
	type ActionFunctionArgs,
	type LinksFunction,
	type ShouldRevalidateFunctionArgs
} from 'react-router';
import { addUser, getUsers, getUserSettings } from '~/users.server';
import type { Route } from './+types/users';

export const links: LinksFunction = () => {
	return [
	  {
		rel: "icon",
		href: "https://algomax.fr/api/image?src=%2Fimages%2Fme-converted.webp&width=400&height=400&fit=cover&position=center&background[]=0&background[]=0&background[]=0&background[]=0&quality=80&compressionLevel=9&loop=0&delay=100&crop=null&contentType=image%2Fwebp",
	  },
	];
  };

export function meta() {
	return [
	  { title: "Liste des utilisateurs" },
	  {
		property: "og:title",
		content: "Liste des utilisateurs",
	  },
	  {
		name: "description",
		content: "Voici la liste des utilisateurs",
	  },
	];
  }

  export function headers() {
	return {
	//   "X-Stretchy-Pants": "its for fun",
	  "Cache-Control": "max-age=300, s-maxage=3600",
	};
  }

  export function shouldRevalidate(
	arg: ShouldRevalidateFunctionArgs
  ) {
	return false;
  }
  

export async function loader({}: Route.LoaderArgs) {
	console.log('trigger loader');
	return { usersPromise: getUsers(), usersSettings: await getUserSettings() };
}

let users: Awaited<ReturnType<typeof getUsers>> = [];

// export async function clientLoader({ serverLoader}: Route.ClientLoaderArgs) {
// 	if (users.length > 0) {
// 		return { users }
// 	}
// 	console.log('trigger client loader');
// 	const {usersPromise} = await serverLoader()
// 	const usersArray = await usersPromise
// 	users = usersArray
// 	return { users }
// }

// export async function clientAction({ serverAction }: Route.ClientActionArgs) {
// 	console.log('invalidate users cache')
// 	users = [];
// 	// can still call the server action if needed
// 	const data = await serverAction();
// 	return data;
//   }
  

// export function HydrateFallback() {
// 	return <div className='px-8 py-2'>
// 			<h1 className='text-2xl font-bold'>Utilisateurs</h1>
// 			<p>Loading...</p>
// 		</div>
//   }

export const handle = {
	name: "users",
	url: '/users'
  };
// clientLoader.hydrate = true as const;
export default function Users() {
	console.log('render component');
	const { usersPromise, usersSettings } = useLoaderData<typeof loader>();
	return (
		<div className='px-8 py-2'>
			<h1>user Settings</h1>
			<div className="flex items-center gap-2 mb-4 text-sm">
				<Link to="/" className="text-blue-500 hover:text-blue-700">Home</Link>
				<span>/</span>
				<Link 
					to={href("/users/:userSlug", { userSlug: "virgile" })}
					className="text-blue-500 hover:text-blue-700"
				>
					Virgile
				</Link>
				<span>/</span>
				<span className="text-gray-600">Settings</span>
			</div>
			<ul>
				{usersSettings.map((userSetting) => (
					<li key={userSetting.id}>{userSetting.userId} - {userSetting.settings.theme}</li>
				))}
			</ul>
			<h1 className='text-2xl font-bold'>Utilisateurs</h1>
			<Suspense fallback={
				<ul >
					<li className='h-6 w-3/4 bg-gray-300 rounded animate-pulse mb-2'></li>
					<li className='h-6 w-2/3 bg-gray-300 rounded animate-pulse mb-2'></li>
					<li className='h-6 w-4/5 bg-gray-300 rounded animate-pulse mb-2'></li>
					<li className='h-6 w-3/5 bg-gray-300 rounded animate-pulse'></li>
				</ul>
			}>

			<Await resolve={usersPromise}>
			{(users) => <>
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
			</>}
			</Await>
			</Suspense>

			
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