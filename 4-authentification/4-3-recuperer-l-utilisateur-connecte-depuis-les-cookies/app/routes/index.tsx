import { type LoaderFunctionArgs, data, useLoaderData } from "react-router";
import { getOptionalUser } from "~/server/sessions.server";

export async function loader({ request }: LoaderFunctionArgs) {
	const user = await getOptionalUser({ request });
	return data({ user });
}

export default function Home() {
	const { user } = useLoaderData<typeof loader>();
	return (
		<div className="px-8 py-2">
			<h1 className="text-2xl font-bold">
				{user ? `Hello ${user.firstName}` : "Hello"}
			</h1>
			<ul>
				<li className="text-lg font-mono">
					<a href="/">Accueil</a>
				</li>
			</ul>
		</div>
	);
}
