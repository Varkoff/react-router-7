import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, useActionData, useNavigation } from "react-router";
import { z } from "zod";
import { CheckboxField } from "~/components/CheckboxField";
import { Field } from "~/components/Field";
import { useOptionalUser } from "~/root";
import { requireUser } from "~/server/sessions.server";

export async function loader({ request }: LoaderFunctionArgs) {
	await requireUser({ request });
	return null;
}

const ProfileSchema = z.object({
	firstName: z
		.string({ required_error: "Le prénom est requis" })
		.min(2, "Longueur minimum : 2 caractères"),
	lastName: z
		.string({ required_error: "Le nom est requis" })
		.min(2, "Longueur minimum : 2 caractères"),
	age: z.number({ required_error: "L'age est requis" }),
	active: z.boolean().default(false),
});

export async function action({ request }: ActionFunctionArgs) {
	await requireUser({ request });
	const formData = await request.formData();
	const submission = await parseWithZod(formData, {
		schema: ProfileSchema,
	});

	if (submission.status !== "success") {
		return submission.reply();
	}

	// TODO: Update user profile
	return submission.reply();
}

export default function Profile() {
	const user = useOptionalUser();
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";

	const [form, fields] = useForm({
		id: "profile-form",
		lastResult: actionData,
		constraint: getZodConstraint(ProfileSchema),
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: ProfileSchema });
		},
		defaultValue: {
			firstName: user?.firstName,
			lastName: user?.lastName,
			// age: user?.age,
			// active: user?.active,
		},
	});

	return (
		<div className="px-8 py-2 flex flex-col gap-4 w-full">
			<h1 className="text-lg font-bold">Profil</h1>
			<Form
				method="POST"
				className="flex w-full flex-col gap-3 p-4 bg-white rounded-lg shadow-sm"
				{...getFormProps(form)}
			>
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
				<button
					type="submit"
					disabled={isSubmitting}
					className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 transition-colors"
				>
					{isSubmitting ? "En cours..." : "Mettre à jour"}
				</button>
			</Form>
		</div>
	);
}
