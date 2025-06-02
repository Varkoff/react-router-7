import { useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { NavLink, href, useFetcher } from "react-router";
import type { z } from "zod";
import {
	UserActionsSchema,
	type UserDeleteSchema,
	type action as userSlugAction,
} from "~/routes/users+/$userSlug";
import type { getUsers } from "../server/users.server";
import { ErrorList } from "./ErrorList";

export const UserItem = ({
	user,
}: {
	user: Awaited<ReturnType<typeof getUsers>>[0];
}) => {
	const fetcher = useFetcher<typeof userSlugAction>();
	const isSubmitting = fetcher.state === "submitting";

	const [form, fields] = useForm({
		lastResult: fetcher.data?.result,
		constraint: getZodConstraint(UserActionsSchema),
		onValidate({ formData }) {
			const parsed = parseWithZod(formData, {
				schema: UserActionsSchema,
			});
			console.log(parsed);
			return parsed;
		},
	});

	return (
		<li
			key={user.id}
			className={`
		flex items-center justify-between gap-2 ${isSubmitting ? "hidden" : ""}`}
		>
			<NavLink
				className={({ isActive }) =>
					`text-lg font-mono w-full flex items-center gap-2 p-4 shadow-md rounded-lg hover:shadow-lg transition-shadow ${
						isActive
							? "bg-blue-900 text-white hover:bg-blue-900"
							: "bg-white text-blue-500 hover:text-blue-700"
					}`
				}
				to={href("/users/:userSlug", {
					userSlug: user.slug,
				})}
			>
				{user.firstName} {user.lastName} {user.active ? "🟢" : "🔴"}{" "}
				<span className="text-sm text-gray-300">({user.age} ans)</span>{" "}
				{/* <span className="text-xs">
					{user.settings.language === "fr" ? "🇫🇷" : "🇬🇧"}{" "}
					{user.settings.theme === "dark" ? "🌙" : "☀️"}
				</span> */}
			</NavLink>

			{/* <fetcher.Form
				action={href("/users/:userSlug", {
					userSlug: user.slug,
				})}
				method="POST"
				{...getFormProps(form)}
				className="flex flex-col gap-1 ml-auto"
			>
				<input type="hidden" name="slug" value={user.slug} />
				<input type="hidden" name="action" value="delete-user" /> */}
			<button
				disabled={isSubmitting}
				type="button"
				onClick={() => {
					const formData: z.infer<typeof UserDeleteSchema> = {
						action: "delete-user",
						slug: user.slug,
					};
					fetcher.submit(formData, {
						method: "POST",
						action: href("/users/:userSlug", {
							userSlug: user.slug,
						}),
					});
				}}
				className="bg-red-500 text-white px-2 py-1 rounded-md"
			>
				Supprimer
			</button>
			<ErrorList errors={fields.slug.errors} />
			<ErrorList errors={form.errors} />
			{/* </fetcher.Form> */}
		</li>
	);
};
