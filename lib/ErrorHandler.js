module.exports = {
    userDefinedError: (status, message) => {
        throw new Error(JSON.stringify({type: 'user defined', status: status, message: message}));
    },
    parseError: (error) => {
        console.log(error);
        if (error.name === 'Error') {
            let err = JSON.parse(error.message);
            return {
                type: 'error',
                status: err.status,
                message: err.message
            }
        } else {
            let message;
            if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'staging') {
                message = error.message;
            } else {
                message = 'Something went wrong';
            }
            return {
                type: 'error',
                status: 500,
                message: message
            }
        }
    }
};