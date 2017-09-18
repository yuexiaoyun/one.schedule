module.exports = {
    logger: {
        dir: './logs/prod',
    },
    cluster: {
        listen: {
            port: 8080
        }
    },
    knex: {
        client: {
            connection: {
                host: 'mysql'
            },
        }
    },
    tortoise: {
        client: {
            uri: 'amqp://guest:guest@rabbitmq'
        }
    }
};
