import { createCookieSessionStorage } from "react-router";
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
