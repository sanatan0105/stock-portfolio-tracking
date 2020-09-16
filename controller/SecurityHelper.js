const mongoose = require("mongoose");
const ErrorHandler = require("../lib/ErrorHandler");
const InputValidator = require('../lib/InputValidator');
const Config = require('../config/config');
const SecurityModel = require('../model/SecurityModel');
const CommonMethod = require('../lib/CommonMethods');

module.exports = {
    _createObjForSecurity: (companyName, ticketSymbol, sharePrice) => {
        return {
            companyName: companyName,
            ticketSymbol: ticketSymbol.toUpperCase(),
            sharePrice: sharePrice
        }
    },

    createSecurity: async (companyName, ticketSymbol, sharePrice)=>{
        try{
            let _validateName = InputValidator.ValidateSecurityName(companyName);
            if (_validateName.status === 'failed') return ErrorHandler.userDefinedError(400, _validateName.message);
            if (_validateName.status === 'failedInCatch') return ErrorHandler.parseError(_validateName.message);

            let _validateTicket = InputValidator.ValidateTicketSymbol(ticketSymbol);
            if (_validateTicket.status === 'failed') return ErrorHandler.userDefinedError(400, _validateTicket.message);
            if (_validateTicket.status === 'failedInCatch') return ErrorHandler.parseError(_validateTicket.message);

            let _validateSharePrice = InputValidator.ValidateSharePrice(sharePrice);
            if (_validateSharePrice.status === 'failed') return ErrorHandler.userDefinedError(400, _validateSharePrice.message);
            if (_validateSharePrice.status === 'failedInCatch') return ErrorHandler.parseError(_validateSharePrice.message);

            // let newObjectForSecurity = module.exports._createObjForSecurity(companyName, ticketSymbol, sharePrice);
            const securityObj = new SecurityModel(module.exports._createObjForSecurity(companyName, ticketSymbol, sharePrice));

            let saveResult = await securityObj.save();
            return {status: 'success', message: 'security saved', other: saveResult}

        } catch (e) {
            return ErrorHandler.parseError(e);
        }
    },

    getSecurities: async ()=>{
        try{
            let securities = await SecurityModel.find();
            return {status: 'success', securities: securities}

        } catch (e) {
            return ErrorHandler.parseError(e);
        }
    },

    getSecurityById: async (id) => {
        try{
            let securities = await SecurityModel.findById(id);
            return {status: 'success', security: securities}

        } catch (e) {
            return ErrorHandler.parseError(e);
        }
    }
};