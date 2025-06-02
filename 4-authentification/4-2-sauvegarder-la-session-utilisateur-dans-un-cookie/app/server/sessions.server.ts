import { createCookieSessionStorage } from "react-router";

type SessionData = {
	userId: string;
	theme: "light" | "dark";
	lang: "en" | "fr";
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

export { commitSession, destroySession, getSession };
