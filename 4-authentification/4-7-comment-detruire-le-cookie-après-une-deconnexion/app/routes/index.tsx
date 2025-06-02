import { useOptionalUser } from "~/root";

export default function Home() {
	const user = useOptionalUser();
	return (
		<div className="px-8 py-2">
			<h1 className="text-2xl font-bold">
				{user ? `Hello ${user.firstName}` : "Hello"}
			</h1>
			<ul>
				<li className="text-lg font-mono">
					<a href="/">Accueil</a>
				</li>
			</ul>
		</div>
	);
}
