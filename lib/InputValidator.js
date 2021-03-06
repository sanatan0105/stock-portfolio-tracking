const MAX_SECURITY_NAME_LEN = 150;
const MAX_TICKET_SYMBOL_LEN = 10;
module.exports = {
    ValidateQuantity: quantity => {
        /**
         * This method validated the quantity or number of shares
         * @augments: number of shares
         * @return: true or false
         * **/
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
        if (!name) return {status: 'failed', message: 'invalid input'};
        if (name.length > MAX_SECURITY_NAME_LEN) return {
            status: 'failed',
            message: 'security name length exceeded max limit'
        };
        return {status: 'success', message: 'name validated'}


    },

    ValidateTicketSymbol: ticketSymbol => {
        /**
         * This method validated the ticket Symbol
         * @augments: ticketSymbol
         * @return: object with status along with message
         * **/

        if (!ticketSymbol) return {status: 'failed', message: 'ticket can\'t be empty'};
        if (ticketSymbol.length > MAX_TICKET_SYMBOL_LEN) return {
            status: 'failed',
            message: 'ticket Symbol length exceeded max limit'
        };
        return {status: 'success', message: 'ticket symbol validated'}
    },

    ValidateSharePrice: price => {
        /**
         * This method validated the price
         * @augments: price
         * @return: object with status along with message
         * **/

            if (!price) return {status: 'failed', message: 'price can\'t be empty'};
            if (typeof price !== 'number') {
                return {
                    status: 'failed',
                    message: 'ticket price should be number'
                }
            }
            return {status: 'success', message: 'share price validated'};
    }
};