const db = {
    users: [
        { id: 1, name: 'Virgile' },
        { id: 2, name: 'Robert' },
        { id: 3, name: 'John' },
        { id: 4, name: 'Jack' },
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