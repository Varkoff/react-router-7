import { prisma } from "~/server/db.server";

const seedUsers = [
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
];

export async function main() {
	await prisma.user.deleteMany();
	for (const u of seedUsers) {
		await prisma.user.create({
			data: {
				age: u.age,
				active: u.active,
				firstName: u.firstName,
				lastName: u.lastName,
				slug: u.slug,
			},
		});
	}
}

main();
