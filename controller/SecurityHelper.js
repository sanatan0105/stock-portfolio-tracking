const ErrorHandler = require("../lib/ErrorHandler");
const InputValidator = require('../lib/InputValidator');
const SecurityModel = require('../model/SecurityModel');

module.exports = {
    createObjForSecurity: (companyName, ticketSymbol, sharePrice) => {
        /**
         * This method is used to create the object for security model. This method can be called from anywhere
         * and this will validate and sanitize the object for security model.
         * @augments:
         * 1. companyName: the company name of the security
         * 2. ticketSymbol: the ticket symbol of the company
         * 3. sharePrice: the share price at the time the entry was created
         * @return: Return the sanitize object for security model
         * **/


        return {
            companyName: companyName,
            ticketSymbol: ticketSymbol.toUpperCase(),
            sharePrice: sharePrice
        }
    },

    createSecurity: async (companyName, ticketSymbol, sharePrice)=>{
        try{

            /**
             * This method is used to create an entry in the security model.
             * Steps:
             * 1. It validate the input (arguments)
             * 2. If any error is there in input, it return the failed object
             * 3. If input is validated successfully, it calls the createObjForSecurity method to generate the security
             *      object
             * 4. It saves the object in security model.
             * 5. Returns the saved security
             * @augments:
             * 1. companyName: the company name of the security
             * 2. ticketSymbol: the ticket symbol of the company
             * 3. sharePrice: the share price at the time the entry was created
             * @return: Return failed object with failed message if there is any validation failure occurs
             * else it return the success object with the saved security object
             * **/


            let _validateName = InputValidator.ValidateSecurityName(companyName);
            if (_validateName.status === 'failed') return ErrorHandler.userDefinedError(400, _validateName.message);
            if (_validateName.status === 'failedInCatch') return ErrorHandler.parseError(_validateName.message);

            let _validateTicket = InputValidator.ValidateTicketSymbol(ticketSymbol);
            if (_validateTicket.status === 'failed') return ErrorHandler.userDefinedError(400, _validateTicket.message);
            if (_validateTicket.status === 'failedInCatch') return ErrorHandler.parseError(_validateTicket.message);

            let _validateSharePrice = InputValidator.ValidateSharePrice(sharePrice);
            if (_validateSharePrice.status === 'failed') return ErrorHandler.userDefinedError(400, _validateSharePrice.message);
            if (_validateSharePrice.status === 'failedInCatch') return ErrorHandler.parseError(_validateSharePrice.message);

            const securityObj = new SecurityModel(module.exports.createObjForSecurity(companyName, ticketSymbol, sharePrice));

            let saveResult = await securityObj.save();
            return {status: 'success', message: 'security saved', other: saveResult}

        } catch (e) {
            return ErrorHandler.parseError(e);
        }
    },

    getSecurities: async ()=>{
        try{
            /**
             * This method is used return all the securities stored in the database.
             * We are assuming here the list won't be long
             * @augments: No argument is required
             * @return: returns all the security
             * **/

            let securities = await SecurityModel.find();
            return {status: 'success', securities: securities}

        } catch (e) {
            return ErrorHandler.parseError(e);
        }
    },

    getSecurityById: async (id) => {
        try{
            /**
             * This method is used return the security by security id
             * @augments: security id
             * @return: return the security obj if security if found with the id else null will get returned
             * **/

            let securities = await SecurityModel.findById(id);
            return {status: 'success', security: securities}

        } catch (e) {
            return ErrorHandler.parseError(e);
        }
    }
};