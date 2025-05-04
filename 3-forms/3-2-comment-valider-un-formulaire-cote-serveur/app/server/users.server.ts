import type { z } from 'zod';
import type { UserCreateSchema, UserUpdateSchema } from '~/routes/users+/$userSlug';

const db = {
	users: [
		{ id: 1, firstName: 'Virgile', lastName: 'Dupont', slug: 'virgile' },
		{ id: 2, firstName: 'Robert', lastName: 'Durand', slug: 'robert' },
		{ id: 3, firstName: 'John', lastName: 'Doe', slug: 'john' },
		{ id: 4, firstName: 'Jack', lastName: 'Smith', slug: 'jack' },
	],
	userSettings: [
		{ id: 1, userId: 1, settings: { theme: 'light' } },
		{ id: 2, userId: 2, settings: { theme: 'dark' } },
		{ id: 3, userId: 3, settings: { theme: 'light' } },
		{ id: 4, userId: 4, settings: { theme: 'dark' } },
	],
};

export async function getUsers() {
	// Simulate a delay
	await new Promise((resolve) => setTimeout(resolve, 50));
	return db.users;
}

export async function getUserSettings() {
	// Simulate a delay
	await new Promise((resolve) => setTimeout(resolve, 100));
	return db.userSettings;
}



export async function addUser({
	firstName,
	lastName,
}: z.infer<typeof UserCreateSchema>) {
	const slug = createSlug({ firstName });
	const existingUser = await getUserBySlug({ slug });
	if (existingUser) {
		throw new Response(`User ${slug} already exists`, {
			status: 400,
		});
	}
	const newUser = { id: db.users.length + 1, firstName, lastName, slug };
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
	userData: z.infer<typeof UserUpdateSchema>
}) {
	const existingUser = await getUserBySlug({ slug });

	if (!existingUser) {
		throw new Response(`User ${slug} not found`, {
			status: 404,
		});
	}
	
	existingUser.firstName = userData.firstName;
	existingUser.lastName = userData.lastName;

	db.users = db.users.map((user) =>
		user.id === existingUser.id ? existingUser : user
	);

	return existingUser;
}

export async function getUserBySlug({ slug }: { slug: string }) {
	const existingUser = db.users.find((user) => user.slug === slug);

	return existingUser;
}

export const createSlug = ({ firstName }: { firstName: string }) => {
	return firstName.toLowerCase().replace(/ /g, '-');
};
