import {
	type ActionFunctionArgs,
	Form,
	type LoaderFunctionArgs,
	data,
	redirect,
	useLoaderData,
} from "react-router";
import { commitSession, getSession } from "~/server/sessions.server";

export async function loader({ request }: LoaderFunctionArgs) {
	const session = await getSession(request.headers.get("Cookie"));
	const userId = session.get("userId");
	const theme = session.get("theme") || "da";
	const lang = session.get("lang") || "en";
	console.log({ userId, theme, lang });
	return data({ userId, theme, lang });
}

export async function action({ request }: ActionFunctionArgs) {
	const session = await getSession(request.headers.get("Cookie"));
	const theme = session.get("theme");
	const lang = session.get("lang");
	session.set("userId", "1");
	session.set("theme", theme === "dark" ? "light" : "dark");
	session.set("lang", lang === "en" ? "fr" : "en");
	return redirect("/login", {
		headers: {
			"Set-Cookie": await commitSession(session),
		},
	});
}
export default function Login() {
	const { userId, theme, lang } = useLoaderData<typeof loader>();
	return (
		<div
			className={`flex flex-col items-center justify-center h-screen ${theme === "dark" ? "bg-black" : "bg-white"}`}
		>
			<Form method="POST" className="max-w-[300px] w-full mx-auto">
				<button
					type="submit"
					className={`cursor-pointer w-full p-2 rounded-md ${theme === "dark" ? "bg-cyan-300 text-black" : "bg-sky-600 text-white"}`}
				>
					{lang === "en" ? "Login" : "Connexion"}
				</button>
			</Form>
		</div>
	);
}
