if ( Meteor.users.find().count() === 0 ) {
    Accounts.createUser({
        username: 'admin',
        email: 'admin@email.local',
        password: 'password',
        profile: {
            first_name: 'Admin',
            last_name: 'User',
        }
    });
}