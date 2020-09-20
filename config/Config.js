const config = {
    default: {
        dbPassword: process.env.DB_PASSWORD,
        database: 'mongodb://localhost:27017/test',
    },
    test: {
        dbPassword: process.env.DB_PASSWORD,
        database: 'mongodb://localhost:27017/chai_mocha',
    },
    development: {
        dbPassword: process.env.DB_PASSWORD,
        database: 'mongodb://localhost:27017/portfoliotrack',
        migrateUri: 'mongodb://localhost:27017',
        databaseName: 'portfoliotrack'
    },
    production: {
        dbPassword: process.env.DB_PASSWORD,
        database: `mongodb+srv://dbUser:${process.env.DB_PASSWORD}@cluster0.wfcom.mongodb.net/portfoliotrack?retryWrites=true&w=majority`,
        migrateUri: 'mongodb+srv://dbUser:${process.env.DB_PASSWORD}@cluster0.wfcom.mongodb.net/',
        databaseName: 'portfoliotrack',
    }
};

module.exports = () => {
    return config[process.env.NODE_ENV] || config.default;
};
