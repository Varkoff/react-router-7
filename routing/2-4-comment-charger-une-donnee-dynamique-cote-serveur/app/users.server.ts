const db = {
    users: [
        { id: 1, name: 'Virgile', slug: 'virgile' },
        { id: 2, name: 'Robert', slug: 'robert' },
        { id: 3, name: 'John', slug: 'john' },
        { id: 4, name: 'Jack', slug: 'jack' },
    ],
    userSettings: [
        { id: 1, userId: 1, settings: { theme: 'light' } },
        { id: 2, userId: 2, settings: { theme: 'dark' } },
        { id: 3, userId: 3, settings: { theme: 'light' } },
        { id: 4, userId: 4, settings: { theme: 'dark' } },
    ]
}

export async function getUsers() {

    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return db.users;
}

export async function  addUser({name}:{name: string}) {
    const newUser = { id: db.users.length + 1, name, slug: name.toLowerCase().replace(/ /g, '-') };
    db.users.push(newUser);
    return newUser;
}

export async function getUserBySlug({slug}:{slug: string}) {
    return db.users.find(user => user.slug === slug);
}