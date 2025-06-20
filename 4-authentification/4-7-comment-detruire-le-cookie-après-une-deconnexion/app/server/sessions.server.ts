import { createCookieSessionStorage, redirect } from "react-router";
import { prisma } from "./db.server";

type SessionData = {
	userId: string;
	// theme: "light" | "dark";
	// lang: "en" | "fr";
};

type SessionFlashData = {
	error: string;
};

const { getSession, commitSession, destroySession } =
	createCookieSessionStorage<SessionData, SessionFlashData>({
		// a Cookie from `createCookie` or the CookieOptions to create one
		cookie: {
			name: "__session",
			// httpOnly: true,
			// // maxAge: 60,
			// path: "/",
			// sameSite: "lax",
			// secrets: ["s3cret1", "adazdza", "azdazda"],
			// secure: true,
		},
	});

export { commitSession, destroySession };

export async function getUserSession({ request }: { request: Request }) {
	const session = await getSession(request.headers.get("Cookie"));
	return session;
}

export async function getUserId({ request }: { request: Request }) {
	const session = await getUserSession({ request });
	const userId = session.get("userId");
	return userId;
}

export async function getOptionalUser({ request }: { request: Request }) {
	const userId = await getUserId({ request });
	if (!userId) {
		return null;
	}
	const user = await prisma.user.findUnique({
		where: {
			id: Number.parseInt(userId),
		},
		select: {
			id: true,
			firstName: true,
			lastName: true,
		},
	});

	return user;
}

export async function requireUser({ request }: { request: Request }) {
	const user = await getOptionalUser({ request });
	const url = new URL(request.url);
	const pathname = url.pathname;
	if (!user) {
		throw await logout({
			request,
			redirectTo: `/login?redirectTo=${pathname}`,
		});
	}
	return user;
}

export async function logout({
	request,
	redirectTo,
}: { request: Request; redirectTo?: string }) {
	const session = await getUserSession({ request });
	return redirect(redirectTo || "/", {
		headers: {
			"Set-Cookie": await destroySession(session),
		},
	});
}
