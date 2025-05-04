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

type UserActionResponse = {
	success: boolean;
	errors: {
		firstName?: string[];
		lastName?: string[];
	};
	slug: string;
};

export async function addUser({
	firstName,
	lastName,
}: {
	firstName: string;
	lastName: string;
}): Promise<UserActionResponse> {
	await new Promise((resolve) => setTimeout(resolve, 250));
	const actionResponse: UserActionResponse = {
		errors: {
			firstName: [],
			lastName: []
		},
		slug: '',
		success: true,
	};
	if (!firstName) {
		actionResponse.errors.firstName?.push(`Veuillez renseigner le prénom`);
		actionResponse.success = false;
	}
	if (!lastName) {
		actionResponse.errors.lastName?.push(`Veuillez renseigner le nom`);
		actionResponse.success = false;
	}

	if (!actionResponse.success) {
		return actionResponse;
	}

	const slug = firstName.toLowerCase().replace(/ /g, '-');
	const existingUser = await getUserBySlug({ slug });
	if (existingUser) {
		return {
			errors: {
				firstName: [`Le prénom ${firstName} existe déjà`],
			},
			success: false,
			slug: '',
		};
		// throw new Response(`User ${slug} already exists`, {
		// 	status: 400,
		// });
	}
	const newUser = { id: db.users.length + 1, firstName, lastName, slug };
	db.users.push(newUser);
	return {
		success: true,
		errors: {},
		slug: newUser.slug,
	};
}

export async function updateUser({
	slug,
	name,
}: {
	slug: string;
	name: string;
}) {
	const existingUser = await getUserBySlug({ slug });

	const newSlug = name.toLowerCase().replace(/ /g, '-');
	if (!existingUser) {
		throw new Response(`User ${slug} not found`, {
			status: 404,
		});
	}
	const newExistingUser = await getUserBySlug({ slug: newSlug });
	if (newExistingUser) {
		throw new Response(`User ${newSlug} already exists`, {
			status: 400,
		});
	}
	existingUser.name = name;
	existingUser.slug = newSlug;

	db.users = db.users.map((user) =>
		user.id === existingUser.id ? existingUser : user
	);

	return existingUser;
}

export async function getUserBySlug({ slug }: { slug: string }) {
	const existingUser = db.users.find((user) => user.slug === slug);
	// if (!existingUser) {
	//     throw new Error('User not found')
	// }
	return existingUser;
}
