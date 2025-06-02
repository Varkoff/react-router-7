import type { z } from "zod";
import type {
	UserCreateSchema,
	UserUpdateSchema,
} from "~/routes/users+/$userSlug";
import { prisma } from "./db.server";

export async function getUsers() {
	return await prisma.user.findMany();
}

export async function addUser({
	firstName,
	lastName,
	active,
	age,
	// settings,
	// emails,
}: z.infer<typeof UserCreateSchema>) {
	const slug = createSlug({ firstName });
	const existingUser = await getUserBySlug({ slug });
	if (existingUser) {
		throw new Response(`User ${slug} already exists`, {
			status: 400,
		});
	}

	const newUser = await prisma.user.create({
		data: {
			firstName,
			lastName,
			slug,
			age,
			active,
		},
	});
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
	const { firstName, lastName, age, active } = userData;

	await prisma.user.update({
		where: {
			slug,
		},
		data: {
			firstName,
			lastName,
			age,
			active,
		},
	});
	return {
		slug,
	};
}

export async function getUserBySlug({ slug }: { slug: string }) {
	const existingUser = await prisma.user.findUnique({
		where: {
			slug,
		},
	});
	return existingUser;
}

export const createSlug = ({ firstName }: { firstName: string }) => {
	return firstName.toLowerCase().replace(/ /g, "-");
};

export async function deleteUser({ slug }: { slug: string }) {
	const existingUser = await getUserBySlug({ slug });
	if (existingUser) {
		await prisma.user.delete({
			where: {
				slug,
			},
		});
	}
}
