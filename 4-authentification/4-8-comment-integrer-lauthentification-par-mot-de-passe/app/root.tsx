import {
	Form,
	Link,
	Links,
	type LoaderFunctionArgs,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	data,
	href,
	isRouteErrorResponse,
	useLoaderData,
	useLocation,
	useRouteLoaderData,
} from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
	const user = await getOptionalUser({ request });
	return data({ user });
}

export function meta() {
	return [
		{ title: "Very cool app" },
		{
			property: "og:title",
			content: "Very cool app",
		},
		{
			name: "description",
			content: "This app is the best",
		},
	];
}

import type { Route } from "./+types/root";
import "./app.css";
import { getOptionalUser } from "./server/sessions.server";

export const links: Route.LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
	},
];

export function useOptionalUser() {
	const data = useRouteLoaderData<typeof loader>("root");
	return data?.user || null;
}

export function Layout({ children }: { children: React.ReactNode }) {
	const { user } = useLoaderData<typeof loader>();
	const location = useLocation();
	const pathname = location.pathname;
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body className="bg-gray-200! px-4 py-6 min-h-screen text-black">
				<header className="bg-white shadow-md">
					<nav className="container mx-auto flex gap-8 items-center px-4 py-2">
						<Link to={href("/")} className="text-gray-800 font-bold">
							Home
						</Link>
						<Link to={href("/users")} className="text-gray-800 font-bold">
							Users
						</Link>
						{user ? (
							<div className="flex gap-4 items-center">
								<Link to={href("/profile")} className="text-gray-800 font-bold">
									Profile
								</Link>
								<Form
									method="POST"
									action={`${href("/logout")}?redirectTo=${pathname}`}
								>
									<button type="submit" className="cursor-pointer">
										Logout
									</button>
								</Form>
							</div>
						) : (
							<Link to={href("/login")} className="text-gray-800 font-bold">
								Login
							</Link>
						)}
					</nav>
				</header>
				{children}

				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "Error";
		details =
			error.status === 404
				? "The requested page could not be found."
				: error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="pt-16 p-4 container mx-auto">
			<h1>{message}</h1>
			<p>{details}</p>
			{stack && (
				<pre className="w-full p-4 overflow-x-auto">
					<code>{stack}</code>
				</pre>
			)}
		</main>
	);
}
