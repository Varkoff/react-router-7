import { type ActionFunctionArgs, redirect } from "react-router";
import { destroySession, getUserSession } from "~/server/sessions.server";

export async function action({ request }: ActionFunctionArgs) {
	const session = await getUserSession({ request });
	return redirect("/", {
		headers: {
			"Set-Cookie": await destroySession(session),
		},
	});
}
