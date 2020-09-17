const Mongoose = require('mongoose');
module.exports = {
    addNumber: (num1, num2) =>{
        return num1 + num2
    },

    generateId: () =>{
        return Mongoose.Types.ObjectId();
    },
};