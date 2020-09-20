const config = {
    default: {
        database: `mongodb+srv://dbUser:RK4D45w5U5woioaQ@cluster0.wfcom.mongodb.net/portfoliotrack?retryWrites=true&w=majority`,
        migrateUri: 'mongodb+srv://dbUser:${process.env.DB_PASSWORD}@cluster0.wfcom.mongodb.net/',
        databaseName: 'portfoliotrack',
    },
    test: {
        dbPassword: process.env.DB_PASSWORD,
        database: 'mongodb://localhost:27017/chai_mocha',
    },
    development: {
        database: 'mongodb://localhost:27017/portfoliotrack',
        migrateUri: 'mongodb://localhost:27017',
        databaseName: 'portfoliotrack'
    },
    production: {
        database: `mongodb+srv://dbUser:RK4D45w5U5woioaQ@cluster0.wfcom.mongodb.net/portfoliotrack?retryWrites=true&w=majority`,
        migrateUri: 'mongodb+srv://dbUser:${process.env.DB_PASSWORD}@cluster0.wfcom.mongodb.net/',
        databaseName: 'portfoliotrack',
    }
};

module.exports = () => {
    return config[process.env.NODE_ENV] || config.default;
};
