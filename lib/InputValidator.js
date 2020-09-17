const MAX_SECURITY_NAME_LEN = 150;
const MAX_TICKET_SYMBOL_LEN = 10;
module.exports = {
    ValidateQuantity: (quantity) =>{
        if (!quantity) return false;
        if (typeof quantity !== 'number') return false;
        return quantity >= 0;
    },

    ValidateSecurityName: name => {
        /**
         * This method validated the name of security
         * @augments: name
         * @return: object with status along with message
         * **/
        try {
            if (!name) return {status: 'failed', message: 'invalid input'};
            if (name.length > MAX_SECURITY_NAME_LEN) return {
                status: 'failed',
                message: 'security name length exceeded max limit'
            };
            return {status: 'success', message: 'name validated'}

        } catch (e) {
            return {status: 'failedInCatch', message: e};
        }
    },

    ValidateTicketSymbol: ticketSymbol => {
        /**
         * This method validated the name of security
         * @augments: ticketSymbol
         * @return: object with status along with message
         * **/
        try {
            if (!ticketSymbol) return {status: 'failed', message: 'ticket can\'t be empty'};
            if (ticketSymbol.length > MAX_TICKET_SYMBOL_LEN) return {
                status: 'failed',
                message: 'ticket Symbol length exceeded max limit'
            };
            return {status: 'success', message: 'ticket symbol validated'}

        } catch (e) {
            return {status: 'failedInCatch', message: e};
        }
    },

    ValidateSharePrice: price => {
        /**
         * This method validated the name of security
         * @augments: price
         * checks if the price is valid or not
         * @return: object with status along with message
         * **/
        try {
            if (!price) return {status: 'failed', message: 'price can\'t be empty'};
            if (typeof price !== 'number') {
                return {
                    status: 'failed',
                    message: 'ticket price should be number'
                }
            }
            return {status: 'success', message: 'share price validated'}

        } catch (e) {
            return {status: 'failedInCatch', message: e};
        }
    },


};