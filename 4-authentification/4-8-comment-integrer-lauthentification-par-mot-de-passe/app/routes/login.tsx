import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { compare } from "bcryptjs";
import {
	type ActionFunctionArgs,
	Form,
	type LoaderFunctionArgs,
	data,
	redirect,
	useActionData,
	useNavigation,
} from "react-router";
import { z } from "zod";
import { Field } from "~/components/Field";
import { getOptionalUser, getUserSession } from "~/server/sessions.server";

const LoginSchema = z.object({
	email: z
		.string({
			required_error: "L'email est requis",
		})
		.email({
			message: "L'email est invalide",
		}),
	password: z
		.string({
			required_error: "Le mot de passe est requis",
		})
		.min(6, {
			message: "Le mot de passe doit contenir au moins 6 caractères",
		}),
});

export async function loader({ request }: LoaderFunctionArgs) {
	const user = await getOptionalUser({ request });
	if (user) {
		throw redirect("/");
	}
	return null;
}

export async function action({ request }: ActionFunctionArgs) {
	const session = await getUserSession({ request });
	const url = new URL(request.url);
	const searchParams = url.searchParams;
	const redirectTo = searchParams.get("redirectTo") || "/";
	const formData = await request.formData();
	const submission = parseWithZod(formData, { schema: LoginSchema });
	if (submission.status !== "success") {
		return data(
			{ result: submission.reply() },
			{
				status: 400,
			},
		);
	}
	const { email, password } = submission.value;
	const isValid = await compare(
		password,
		"$2b$10$efVw8Da7Vr3Bz0/Jwkk1b.D60zg405arnjbKEA/Vw.mEv65T/5FYa",
	);
	console.log({ email, password, isValid });
	return data({ result: submission.reply() });

	// session.set("userId", "10");
	// return redirect(redirectTo, {
	// 	headers: {
	// 		"Set-Cookie": await commitSession(session),
	// 	},
	// });
}
export default function Login() {
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";

	const [form, fields] = useForm({
		lastResult: actionData?.result,
		constraint: getZodConstraint(LoginSchema),
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: LoginSchema });
		},
	});
	return (
		<div className="flex flex-col py-8">
			<Form
				{...getFormProps(form)}
				method="POST"
				className="max-w-[300px] flex flex-col gap-4 w-full mx-auto"
			>
				<Field
					inputProps={{
						...getInputProps(fields.email, {
							type: "email",
						}),
					}}
					labelProps={{
						children: "Email",
					}}
					errors={fields.email.errors}
				/>
				<Field
					inputProps={{
						...getInputProps(fields.password, {
							type: "password",
						}),
					}}
					labelProps={{
						children: "Mot de passe",
					}}
					errors={fields.password.errors}
				/>
				<button
					type="submit"
					className="cursor-pointer w-full p-2 rounded-md bg-sky-600 text-white"
				>
					Login
				</button>
			</Form>
		</div>
	);
}
