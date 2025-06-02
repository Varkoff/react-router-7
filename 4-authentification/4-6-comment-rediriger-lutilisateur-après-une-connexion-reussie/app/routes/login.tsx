import {
	type ActionFunctionArgs,
	Form,
	type LoaderFunctionArgs,
	redirect,
} from "react-router";
import {
	commitSession,
	getOptionalUser,
	getUserSession,
} from "~/server/sessions.server";

export async function loader({ request }: LoaderFunctionArgs) {
	const user = await getOptionalUser({ request });
	if (user) {
		throw redirect("/");
	}
	return null;
}

export async function action({ request }: ActionFunctionArgs) {
	const session = await getUserSession({ request });
	const url = new URL(request.url);
	const searchParams = url.searchParams;
	const redirectTo = searchParams.get("redirectTo") || "/";
	session.set("userId", "10");
	return redirect(redirectTo, {
		headers: {
			"Set-Cookie": await commitSession(session),
		},
	});
}
export default function Login() {
	return (
		<div className="flex flex-col items-center justify-center h-screen bg-white">
			<Form method="POST" className="max-w-[300px] w-full mx-auto">
				<button
					type="submit"
					className="cursor-pointer w-full p-2 rounded-md bg-sky-600 text-white"
				>
					Login
				</button>
			</Form>
		</div>
	);
}
