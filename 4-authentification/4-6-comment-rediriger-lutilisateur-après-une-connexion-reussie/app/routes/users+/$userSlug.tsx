// $userSlug => slug dynamique

import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
	Form,
	data,
	href,
	isRouteErrorResponse,
	redirect,
	useActionData,
	useLoaderData,
	useNavigation,
	useParams,
	useRouteError,
	useSubmit,
} from "react-router";
import { z } from "zod";
import { CheckboxField } from "~/components/CheckboxField";
import { Field } from "~/components/Field";
import {
	addUser,
	createSlug,
	deleteUser,
	getUserBySlug,
	updateUser,
} from "~/server/users.server";
import type { Route } from "./+types/$userSlug";

export async function loader({ params }: Route.LoaderArgs) {
	const userSlug = params.userSlug;
	const isNew = userSlug === "new";
	if (isNew) {
		return { user: null, isNew };
	}
	const user = await getUserBySlug({ slug: userSlug });
	if (!user) {
		throw new Response(`User ${userSlug} was not found`, {
			status: 404,
		});
	}
	return { user, isNew };
}
export const UserSettingsSchema = z.object({
	theme: z.enum(["light", "dark"]),
	language: z.enum(["fr", "en"]),
});

export const UserEmailSchema = z.object({
	email: z
		.string({ required_error: "L'email est requis" })
		.email("Email invalide"),
	active: z.boolean().default(false),
});

export const UserCreateSchema = z.object({
	action: z.literal("create-user"),
	firstName: z
		.string({ required_error: "Le prénom est requis" })
		.min(2, "Longueur minimum : 2 caractères"),
	lastName: z
		.string({ required_error: "Le nom est requis" })
		.min(2, "Longueur minimum : 2 caractères"),
	age: z.number({ required_error: "L'age est requis" }),
	active: z.boolean().default(false),

	// settings: UserSettingsSchema,
	// emails: z.array(UserEmailSchema),
});

export const UserUpdateSchema = z.object({
	action: z.literal("update-user"),
	firstName: z
		.string({ required_error: "Le prénom est requis" })
		.min(2, "Longueur minimum : 2 caractères"),
	lastName: z
		.string({ required_error: "Le nom est requis" })
		.min(2, "Longueur minimum : 2 caractères"),
	age: z.number({ required_error: "L'age est requis" }),
	active: z.boolean().default(false),
	// settings: UserSettingsSchema,
	// emails: z.array(UserEmailSchema),
});

export const UserDeleteSchema = z.object({
	action: z.literal("delete-user"),
	slug: z.string(),
});

export const UserActionsSchema = z.discriminatedUnion("action", [
	UserCreateSchema,
	UserUpdateSchema,
	UserDeleteSchema,
]);

export async function action({ request, params }: Route.ActionArgs) {
	const formData = await request.formData();

	const submission = await parseWithZod(formData, {
		async: true,
		schema: UserActionsSchema.superRefine(async (data, ctx) => {
			if (data.action === "delete-user") {
				const existingUser = await getUserBySlug({ slug: data.slug });

				if (!existingUser) {
					ctx.addIssue({
						path: ["slug"],
						code: "custom",
						message: "L'utilisateur n'existe pas.",
					});
				}
				return true;
			}

			if (data.action === "create-user") {
				const slug = createSlug({ firstName: data.firstName });
				const existingUser = await getUserBySlug({ slug });

				if (existingUser) {
					ctx.addIssue({
						path: ["firstName"],
						code: "custom",
						message: "L'utilisateur existe déjà.",
					});
				}
			}
			// if (data.emails.length > 0) {
			// 	const hasDuplicateEmails = data.emails.some(
			// 		(email, index) =>
			// 			data.emails.findIndex((e) => e.email === email.email) !== index,
			// 	);

			// 	if (hasDuplicateEmails) {
			// 		// Find all duplicate email addresses
			// 		const duplicateEmails = data.emails
			// 			.map((email) => email.email)
			// 			.filter((email, index, array) => array.indexOf(email) !== index);

			// 		// Add issues for all instances of each duplicate email
			// 		for (const duplicateEmail of duplicateEmails) {
			// 			// Find all indexes where this email appears
			// 			for (let i = 0; i < data.emails.length; i++) {
			// 				if (data.emails[i].email === duplicateEmail) {
			// 					ctx.addIssue({
			// 						path: ["emails", i, "email"],
			// 						code: "custom",
			// 						message: "Cet email est en double. Veuillez en retirer un.",
			// 					});
			// 				}
			// 			}
			// 		}
			// 	}
			// }
		}),
	});

	if (submission.status !== "success") {
		return data(
			{ result: submission.reply() },
			{
				status: 400,
			},
		);
	}

	console.log(submission.value);
	const userSlug = params.userSlug;

	switch (submission.value.action) {
		case "create-user": {
			const createdUser = await addUser(submission.value);
			return redirect(
				href("/users/:userSlug", {
					userSlug: createdUser.slug,
				}),
			);
		}
		case "update-user": {
			const updatedUser = await updateUser({
				slug: userSlug,
				userData: submission.value,
			});
			return redirect(
				href("/users/:userSlug", {
					userSlug: updatedUser.slug,
				}),
			);
		}
		case "delete-user": {
			await deleteUser({ slug: userSlug });
			return redirect(href("/users"));
		}
	}
}

export function meta({ data }: Route.MetaArgs) {
	if (!data) {
		return [
			{ title: "Utilisateur non trouvé" },
			{
				property: "og:title",
				content: "Utilisateur non trouvé",
			},
		];
	}
	return [
		{ title: `${data.user?.firstName} ${data.user?.lastName}` },
		{
			property: "og:title",
			content: `${data.user?.firstName} ${data.user?.lastName}`,
		},
		{
			name: "description",
			content: `Profil de ${data.user?.firstName} ${data.user?.lastName}`,
		},
	];
}

export default function User() {
	const { isNew } = useLoaderData<typeof loader>();
	const { userSlug } = useParams();

	return (
		<div className="px-8 py-2 flex flex-col gap-4 w-full">
			{isNew ? (
				<h1 className="text-lg font-bold">Ajouter un utilisateur</h1>
			) : (
				<h1 className="text-lg font-bold">Modifier un utilisateur</h1>
			)}
			<UserForm key={userSlug} />
		</div>
	);
}

function UserForm() {
	const { user, isNew } = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";

	const submit = useSubmit();

	const deleteUserFn = ({ slug }: { slug: string }) => {
		const formData: z.infer<typeof UserDeleteSchema> = {
			action: "delete-user",
			slug,
		};
		submit(formData, {
			method: "POST",
			action: href("/users/:userSlug", {
				userSlug: slug,
			}),
		});
	};

	const [form, fields] = useForm({
		id: "user-form",
		lastResult: actionData?.result,
		constraint: getZodConstraint(UserActionsSchema),
		onValidate({ formData }) {
			const parsed = parseWithZod(formData, {
				schema: UserActionsSchema,
			});
			console.log(parsed);
			return parsed;
		},
		defaultValue: {
			firstName: user?.firstName,
			lastName: user?.lastName,
			action: isNew ? "create-user" : "update-user",
			age: user?.age,
			active: user?.active,
			// settings: {
			// 	theme: user?.settings.theme,
			// 	language: user?.settings.language,
			// },
			// emails: user?.emails.map((email) => ({
			// 	email: email.email,
			// 	active: email.active,
			// })),
		},
	});

	// const settingsFieldset = fields.settings.getFieldset();
	// const emailsFieldList = fields.emails.getFieldList();

	return (
		<Form
			method="POST"
			className="flex w-full flex-col gap-3 p-4 bg-white rounded-lg shadow-sm"
			preventScrollReset
			{...getFormProps(form)}
		>
			{user ? (
				<button
					type="button"
					onClick={() => {
						deleteUserFn({ slug: user?.slug });
					}}
					className="px-4 py-2 bg-red-600 text-white rounded-md 0 disabled:opacity-50 transition-colors"
				>
					Supprimer
				</button>
			) : null}
			<input
				{...getInputProps(fields.action, {
					type: "hidden",
				})}
			/>
			<Field
				inputProps={{
					...getInputProps(fields.firstName, {
						type: "text",
					}),
				}}
				labelProps={{
					children: "Prénom",
				}}
				errors={fields.firstName.errors}
			/>
			<Field
				inputProps={{
					...getInputProps(fields.lastName, {
						type: "text",
					}),
				}}
				labelProps={{
					children: "Nom",
				}}
				errors={fields.lastName.errors}
			/>

			<Field
				inputProps={{
					...getInputProps(fields.age, {
						type: "number",
					}),
				}}
				labelProps={{
					children: "Âge",
				}}
				errors={fields.age.errors}
			/>
			<CheckboxField
				buttonProps={{
					...getInputProps(fields.active, {
						type: "checkbox",
					}),
				}}
				labelProps={{
					children: "Actif",
				}}
				errors={fields.active.errors}
			/>
			{/* <div className="flex flex-col gap-2">
				<h2 className="font-bold text-lg">Paramètres</h2>
				<div className="flex flex-col gap-1">
					<label htmlFor={settingsFieldset.theme.id}>Thème</label>
					<select {...getSelectProps(settingsFieldset.theme)}>
						<option value="light">Light</option>
						<option value="dark">Dark</option>
					</select>
				</div>
				<div className="flex flex-col gap-1">
					<label htmlFor={settingsFieldset.language.id}>Langue</label>
					<select {...getSelectProps(settingsFieldset.language)}>
						<option value="fr">Français</option>
						<option value="en">Anglais</option>
					</select>
				</div>
			</div> */}

			{/* <div className="flex flex-col gap-2">
				<h2 className="font-bold text-lg">Emails</h2>
				{emailsFieldList.map((emailField, index) => (
					<EmailField
						key={emailField.key}
						form={form}
						emailField={emailField}
						index={index}
					/>
				))}
				<button
					type="button"
					className="px-4 cursor-pointer py-2 bg-emerald-600 text-white rounded-md 0 disabled:opacity-50 transition-colors"
					// {...form.insert.getButtonProps({
					// 	name: fields.emails.name,
					// 	defaultValue: {
					// 		email: "",
					// 		active: true,
					// 	},
					// })}
					onClick={() => {
						form.insert({
							name: fields.emails.name,
							defaultValue: {
								email: "",
								active: true,
							},
						});
					}}
				>
					Ajouter un email
				</button>
			</div> */}

			<button
				type="submit"
				disabled={isSubmitting}
				className={`px-4 py-2 text-white rounded-md 0 disabled:opacity-50 transition-colors ${
					isNew
						? "bg-emerald-600 hover:bg-emerald-700"
						: "bg-blue-600 hover:bg-blue-700"
				}`}
			>
				{isSubmitting ? "En cours..." : isNew ? "Ajouter" : "Modifier"}
			</button>
		</Form>
	);
}

export function ErrorBoundary() {
	const error = useRouteError();

	if (isRouteErrorResponse(error)) {
		return (
			<div className="flex flex-col items-center justify-center h-screen px-8 py-2">
				<h1 className="text-3xl font-bold text-red-600 mb-2">
					{error.status} {error.statusText}
				</h1>
				<p className="text-red-500">{error.data}</p>
			</div>
		);
	}
	if (error instanceof Error) {
		return (
			<div className="flex flex-col items-center justify-center h-screen px-8 py-2">
				<h1 className="text-3xl font-bold text-red-600 mb-2">Error</h1>
				<p className="text-red-500">{error.message}</p>
				{/* <p>The stack trace is:</p> */}
				{/* <pre>{error.stack}</pre> */}
			</div>
		);
	}
	return <h1>Unknown Error</h1>;
}

// function EmailField({
// 	emailField,
// 	form,
// 	index,
// }: {
// 	emailField: FieldMetadata<z.infer<typeof UserEmailSchema>>;
// 	form: FormMetadata<z.infer<typeof UserActionsSchema>>;
// 	index: number;
// }) {
// 	const { active, email } = emailField.getFieldset();
// 	return (
// 		<div className="flex gap-2 items-center">
// 			<div key={email.key} className="flex flex-col gap-1 w-full">
// 				<Field
// 					inputProps={{
// 						...getInputProps(email, {
// 							type: "email",
// 						}),
// 					}}
// 					labelProps={{
// 						children: "Email",
// 					}}
// 					errors={email.errors}
// 				/>
// 				<CheckboxField
// 					buttonProps={{
// 						...getInputProps(active, {
// 							type: "checkbox",
// 						}),
// 					}}
// 					labelProps={{
// 						children: "Actif",
// 					}}
// 					errors={active.errors}
// 				/>
// 			</div>
// 			<button
// 				type="button"
// 				className="px-4 cursor-pointer py-2 bg-red-600 text-white rounded-md 0 disabled:opacity-50 transition-colors"
// 				onClick={() => {
// 					form.remove({ name: form.getFieldset().emails.name, index: index });
// 				}}
// 			>
// 				Supprimer
// 			</button>
// 		</div>
// 	);
// }
