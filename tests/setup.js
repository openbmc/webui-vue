var chai = require('chai');
var sinonChai = require('sinon-chai');

chai.use(sinonChai);

require('jsdom-global')('', {
  url: 'http://localhost'
});

global.expect = require('chai').expect;
global.sinon = require('sinon');
