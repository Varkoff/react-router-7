import { href, NavLink } from "react-router";
import type { getUsers } from "../server/users.server";

export const UserItem = ({
	user,
}: {
	user: Awaited<ReturnType<typeof getUsers>>[0];
}) => {
	return (
		<li key={user.id} className=''>
			<NavLink
				className={({ isActive }) =>
					`text-lg font-mono p-4 shadow-md rounded-lg hover:shadow-lg transition-shadow block ${
						isActive
							? 'bg-blue-800 text-white hover:bg-blue-900'
							: 'bg-white text-blue-500 hover:text-blue-700'
					}`
				}
				to={href('/users/:userSlug', {
					userSlug: user.slug,
				})}
			>
				{user.name}
			</NavLink>
		</li>
	);
};
