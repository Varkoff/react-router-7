// $userSlug => slug dynamique

import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import {
	data,
	Form,
	href,
	isRouteErrorResponse,
	redirect,
	useActionData,
	useLoaderData,
	useNavigation,
	useParams,
	useRouteError,
} from 'react-router';
import { z } from 'zod';
import { Field } from '~/components/Field';
import {
	addUser,
	createSlug,
	getUserBySlug,
	updateUser,
} from '~/server/users.server';
import type { Route } from './+types/$userSlug';

export async function loader({ params }: Route.LoaderArgs) {
	const userSlug = params.userSlug;
	const isNew = userSlug === 'new';
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

export const UserCreateSchema = z.object({
	action: z.literal('create-user'),
	firstName: z
		.string({ required_error: 'Le prénom est requis' })
		.min(2, 'Longueur minimum : 2 caractères'),
	lastName: z
		.string({ required_error: 'Le nom est requis' })
		.min(2, 'Longueur minimum : 2 caractères'),
});

export const UserUpdateSchema = z.object({
	action: z.literal('update-user'),
	firstName: z
		.string({ required_error: 'Le prénom est requis' })
		.min(2, 'Longueur minimum : 2 caractères'),
	lastName: z
		.string({ required_error: 'Le nom est requis' })
		.min(2, 'Longueur minimum : 2 caractères'),
});

export const UserActionsSchema = z.discriminatedUnion('action', [
	UserCreateSchema,
	UserUpdateSchema,
]);

export async function action({ request, params }: Route.ActionArgs) {
	const formData = await request.formData();

	const submission = await parseWithZod(formData, {
		async: true,
		schema: UserActionsSchema.superRefine(async (data, ctx) => {
			if (data.action === 'create-user') {
				const slug = createSlug({ firstName: data.firstName });
				const existingUser = await getUserBySlug({ slug });

				if (existingUser) {
					ctx.addIssue({
						path: ['firstName'],
						code: 'custom',
						message: "L'utilisateur existe déjà.",
					});
				}
			}
		}),
	});

	console.log(submission);
	if (submission.status !== 'success') {
		return data(
			{ result: submission.reply() },
			{
				status: 400,
			}
		);
	}

	const userSlug = params.userSlug;

	switch (submission.value.action) {
		case 'create-user': {
			const createdUser = await addUser(submission.value);
			return redirect(
				href('/users/:userSlug', {
					userSlug: createdUser.slug,
				})
			);
		}
		case 'update-user': {
			const updatedUser = await updateUser({
				slug: userSlug,
				userData: submission.value,
			});
			return redirect(
				href('/users/:userSlug', {
					userSlug: updatedUser.slug,
				})
			);
		}
	}
}

export function meta({ data }: Route.MetaArgs) {
	if (!data) {
		return [
			{ title: 'Utilisateur non trouvé' },
			{
				property: 'og:title',
				content: 'Utilisateur non trouvé',
			},
		];
	}
	return [
		{ title: `${data.user?.firstName} ${data.user?.lastName}` },
		{
			property: 'og:title',
			content: `${data.user?.firstName} ${data.user?.lastName}`,
		},
		{
			name: 'description',
			content: `Profil de ${data.user?.firstName} ${data.user?.lastName}`,
		},
	];
}

export default function User() {
	const { isNew } = useLoaderData<typeof loader>();
	const { userSlug } = useParams();

	return (
		<div className='px-8 py-2 flex flex-col gap-4 w-full'>
			{isNew ? (
				<h1 className='text-lg font-bold'>Ajouter un utilisateur</h1>
			) : (
				<h1 className='text-lg font-bold'>Modifier un utilisateur</h1>
			)}
			<UserForm key={userSlug} />
		</div>
	);
}

function UserForm() {
	const { user, isNew } = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const isSubmitting = navigation.state === 'submitting';

	const [form, fields] = useForm({
		id: 'user-form',
		lastResult: actionData?.result,
		constraint: getZodConstraint(UserActionsSchema),
		onValidate({ formData }) {
			const parsed = parseWithZod(formData, {
				schema: UserActionsSchema,
			});
			return parsed;
		},
		defaultValue: {
			firstName: user?.firstName,
			lastName: user?.lastName,
			action: isNew ? 'create-user' : 'update-user',
		},
	});
	return (
		<Form
			method='POST'
			className='flex w-full flex-col gap-3 p-4 bg-white rounded-lg shadow-sm'
			{...getFormProps(form)}
		>
			<input
				{...getInputProps(fields.action, {
					type: 'hidden',
				})}
				value={isNew ? 'create-user' : 'update-user'}
			/>
			<Field
				inputProps={{
					...getInputProps(fields.firstName, {
						type: 'text',
					}),
				}}
				labelProps={{
					children: 'Prénom',
				}}
				errors={fields.firstName.errors}
			/>
			<Field
				inputProps={{
					...getInputProps(fields.lastName, {
						type: 'text',
					}),
				}}
				labelProps={{
					children: 'Nom',
				}}
				errors={fields.lastName.errors}
			/>
			<button
				type='submit'
				disabled={isSubmitting}
				className={`px-4 py-2 text-white rounded-md 0 disabled:opacity-50 transition-colors ${
					isNew
						? 'bg-emerald-600 hover:bg-emerald-700'
						: 'bg-blue-600 hover:bg-blue-700'
				}`}
			>
				{isSubmitting ? 'En cours...' : isNew ? 'Ajouter' : 'Modifier'}
			</button>
		</Form>
	);
}

export function ErrorBoundary() {
	const error = useRouteError();

	if (isRouteErrorResponse(error)) {
		return (
			<div className='flex flex-col items-center justify-center h-screen px-8 py-2'>
				<h1 className='text-3xl font-bold text-red-600 mb-2'>
					{error.status} {error.statusText}
				</h1>
				<p className='text-red-500'>{error.data}</p>
			</div>
		);
	} else if (error instanceof Error) {
		return (
			<div className='flex flex-col items-center justify-center h-screen px-8 py-2'>
				<h1 className='text-3xl font-bold text-red-600 mb-2'>Error</h1>
				<p className='text-red-500'>{error.message}</p>
				{/* <p>The stack trace is:</p> */}
				{/* <pre>{error.stack}</pre> */}
			</div>
		);
	} else {
		return <h1>Unknown Error</h1>;
	}
}
