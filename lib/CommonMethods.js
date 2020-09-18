const Mongoose = require('mongoose');
module.exports = {
    generateId: () =>{
        /**
         * This method is used to generate a unique id
         * @augments: null
         * @return: an mongoDB unique id
         * **/
        return Mongoose.Types.ObjectId();
    },
};