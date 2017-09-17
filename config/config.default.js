module.exports = {
    keys: 'One',
    logger: {
        dir: './logs/dev',
    },
    knex: {
        client: {
            dialect: 'mysql',
            connection: {
                host: '127.0.0.1',
                port: '3306',
                user: 'root',
                password: 'tdvro9',
                database: 'db_one',
            },
        },
        agent: true
    },
    tortoise: {
        client: {
            uri: 'amqp://guest:guest@localhost'
        },
        agent: true
    }
};
