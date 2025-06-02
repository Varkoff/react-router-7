import type { ActionFunctionArgs } from "react-router";
import { logout } from "~/server/sessions.server";

export async function action({ request }: ActionFunctionArgs) {
	const url = new URL(request.url);
	const searchParams = url.searchParams;
	const redirectTo = searchParams.get("redirectTo") || "/";
	return await logout({ request, redirectTo });
}
