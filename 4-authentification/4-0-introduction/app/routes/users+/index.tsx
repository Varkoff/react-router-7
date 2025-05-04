import type { ActionFunctionArgs } from "react-router";

export default function UsersIndex() {
	return (
		<h2 className="flex items-center justify-center size-full">
			{" "}
			Veuillez sélectionner un profil
		</h2>
	);
}

export async function action({ request, params }: ActionFunctionArgs) {
	const formData = await request.formData();
	console.log(Object.fromEntries(formData));
	return null;
}
