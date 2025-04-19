import { useLoaderData } from "react-router";
import { getUsers } from "~/users.server";

export async function loader() {
    return { users: await getUsers() }
}

export default function Users() {
    const { users } = useLoaderData<typeof loader>()
    return (
        <div className='px-8 py-2'>
            <h1 className='text-2xl font-bold'>Utilisateurs</h1>
            <ul>
                {users.map((user) => (
                    <li key={user.id} className='text-lg font-mono'>
                        <a href='/'>{user.name}</a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
