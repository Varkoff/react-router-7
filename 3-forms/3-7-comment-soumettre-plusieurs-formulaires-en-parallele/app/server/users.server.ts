import type { z } from "zod";
import type {
	UserCreateSchema,
	UserUpdateSchema,
} from "~/routes/users+/$userSlug";

type User = {
	id: number;
	firstName: string;
	lastName: string;
	slug: string;
	age: number;
	active: boolean;
	settings: {
		theme: "dark" | "light";
		language: "en" | "fr";
	};
	emails: {
		email: string;
		active: boolean;
	}[];
};

type Database = {
	users: User[];
	// userSettings: UserSetting[];
};

const db: Database = {
	users: [
		{
			id: 1,
			firstName: "Virgile",
			lastName: "RIETSCH",
			slug: "virgile",
			age: 28,
			active: true,
			settings: { theme: "light", language: "fr" },
			emails: [
				{ email: "virgile@algomax.fr", active: true },
				{ email: "contact@algomax.fr", active: false },
			],
		},
		{
			id: 2,
			firstName: "Robert",
			lastName: "Durand",
			slug: "robert",
			age: 28,
			active: true,
			settings: { theme: "dark", language: "fr" },
			emails: [],
		},
		{
			id: 3,
			firstName: "John",
			lastName: "Doe",
			slug: "john",
			age: 28,
			active: true,
			settings: { theme: "light", language: "en" },
			emails: [],
		},
		{
			id: 4,
			firstName: "Jack",
			lastName: "Smith",
			slug: "jack",
			age: 28,
			active: true,
			settings: { theme: "dark", language: "en" },
			emails: [],
		},
	],
	// userSettings: [
	// 	{ id: 1, userId: 1, settings: { theme: 'light' } },
	// 	{ id: 2, userId: 2, settings: { theme: 'dark' } },
	// 	{ id: 3, userId: 3, settings: { theme: 'light' } },
	// 	{ id: 4, userId: 4, settings: { theme: 'dark' } },
	// ],
};

export async function getUsers() {
	// Simulate a delay
	await new Promise((resolve) => setTimeout(resolve, 50));
	return db.users;
}

// export async function getUserSettings() {
// 	// Simulate a delay
// 	await new Promise((resolve) => setTimeout(resolve, 100));
// 	return db.userSettings;
// }

export async function addUser({
	firstName,
	lastName,
	active,
	age,
	settings,
	emails,
}: z.infer<typeof UserCreateSchema>) {
	const slug = createSlug({ firstName });
	const existingUser = await getUserBySlug({ slug });
	if (existingUser) {
		throw new Response(`User ${slug} already exists`, {
			status: 400,
		});
	}
	const newUser: User = {
		id: db.users.length + 1,
		firstName,
		lastName,
		slug,
		age,
		active,
		settings,
		emails,
	};
	db.users.push(newUser);
	return {
		slug: newUser.slug,
	};
}

export async function updateUser({
	slug,
	userData,
}: {
	slug: string;
	userData: z.infer<typeof UserUpdateSchema>;
}) {
	const existingUser = await getUserBySlug({ slug });

	if (!existingUser) {
		throw new Response(`User ${slug} not found`, {
			status: 404,
		});
	}
	const { firstName, lastName, age, active, settings, emails } = userData;

	existingUser.firstName = firstName;
	existingUser.lastName = lastName;
	existingUser.age = age;
	existingUser.active = active;
	existingUser.settings = settings;
	existingUser.emails = emails;

	db.users = db.users.map((user) =>
		user.id === existingUser.id ? existingUser : user,
	);

	return existingUser;
}

export async function getUserBySlug({ slug }: { slug: string }) {
	const existingUser = db.users.find((user) => user.slug === slug);

	return existingUser;
}

export const createSlug = ({ firstName }: { firstName: string }) => {
	return firstName.toLowerCase().replace(/ /g, "-");
};

export async function deleteUser({ slug }: { slug: string }) {
	await new Promise((resolve) => setTimeout(resolve, 3000));
	const existingUser = await getUserBySlug({ slug });
	if (existingUser) {
		db.users = db.users.filter((user) => user.id !== existingUser.id);
	}
}
