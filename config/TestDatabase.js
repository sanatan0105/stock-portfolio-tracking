// //inside tests/test_helper.js
// const mongoose = require('mongoose');
// //tell mongoose to use es6 implementation of promises
// mongoose.Promise = global.Promise;
// mongoose.connect('mongodb://localhost/pokemons');
// mongoose.connection
//     .once('open', () => console.log('Connected!'))
//     .on('error', (error) => {
//         console.warn('Error : ',error);
//     });
// //Called hooks which runs before something.
// // beforeEach((done) => {
// //     mongoose.connection.collections.pokemons.drop(() => {
// //         //this function runs after the drop is completed
// //         done(); //go ahead everything is done now.
// //     });
// // });

let mongoose = require('mongoose');
const Config = require('./config');
const Winston = require('./winston');
class Database {
    constructor() {
        this._connect()
    }
    _connect() {
        mongoose.connect(`${Config().database}`, {
            // useNewUrlParser: true
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            autoIndex: false, // Don't build indexes
            poolSize: 10, // Maintain up to 10 socket connections
            // If not connected, return errors immediately rather than waiting for reconnect
            bufferMaxEntries: 0,
            connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            family: 4, // Use IPv4, skip trying IPv6
            useUnifiedTopology: true
        }).
        then(() => {
            Winston.info('Database connection successful');
        }).
        catch(err => {
            Winston.error('Database connection error'+err)
        })
    }
}
module.exports = new Database();