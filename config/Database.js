console.log('11');
console.log(process.env.NODE_ENV);
let mongoose = require('mongoose');
console.log('12');
const Config = require('./config');
console.log(Config());
console.log('13');

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
            console.log('Database connection successful');
            Winston.info('Database connection successful');
        }).
        catch(err => {
            console.log('Database connection error'+err);
            Winston.error('Database connection error'+err)
        })
    }
}
module.exports = new Database();