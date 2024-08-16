

const sinon = require('sinon');

module.exports = {
    ClientRequest: sinon.stub().returns({
        setHeader: sinon.stub()
    }),
    ServerResponse: sinon.stub().returns({
        statusCode: null,
        writeHead: sinon.stub(),
        write: sinon.stub(),
        end: sinon.stub(),
        getHeader: sinon.stub(),
        setHeader: sinon.stub(),
        removeHeader: sinon.stub()
    })
};
