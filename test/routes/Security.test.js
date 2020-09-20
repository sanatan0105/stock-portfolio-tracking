const mongoose = require('mongoose');
const app = require("../../app");
const chai = require("chai");
const chaiHttp = require("chai-http");
const PortfolioModel = require('../../model/PortfolioModel');
const SecurityModel = require('../../model/SecurityModel');
chai.use(chaiHttp);

let should = chai.should();

describe('#Test Cases for Security Route', () => {
    before(async done => {
        await PortfolioModel.deleteMany({});
        await SecurityModel.deleteMany({});
        done();
    });

    it('Creates a security', async done => {
        chai.request(app)
            .post("/security/create")
            .send({companyName: 'Tata Consultancy Services Limited', ticketSymbol: 'TCS', sharePrice: 1843.45})
            .end((err, res) => {
                res.status.should.equal(200);
                done();
            })
    });

});