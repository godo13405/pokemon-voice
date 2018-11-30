'use strict';

if (process.env.SILENT) process.env.DEBUG = false;

global.express = require('express');
let compression = require('compression');
global.bodyParser = require('body-parser');
global.capabilities = process.env.CAPABILITIES ? [process.env.CAPABILITIES] : ['audio', 'screen'];
global.i18n = require('./config/lang/en');
global.ex = express();

// const FBadmin = require('firebase-admin');
// const FBfunctions = require('firebase-functions');
//
// FBadmin.initializeApp(FBfunctions.config().firebase);
//
// global.db = FBadmin.firestore();

let Pokedex = require('pokedex-promise-v2');
global.P = new Pokedex();

global.params = {};
global.suggestions = require('./config/suggestions');

global.service = require('./service');

global.gameMap = require('./config/map.json');
global.saveFile = {
  location: "pallet-town",
  party: {
    1: {
      name: 'bulbasaur',
      level: 5
    }
  }
};

global.location = null;

P.getLocationAreaByName('route-1' + '-area')
    .then(function(response) {
    })
    .catch(function(error) {
      console.log('There was an ERROR: ', error);
    });

const webhook = (request, response) => {
  if (!process.env.SILENT && process.env.DEBUG) console.time('total response time');
  if (request.body.queryResult) {
    if (!process.env.SILENT) console.log("\x1b[36m", request.body.queryResult.queryText, "\x1b[2m", request.body.queryResult.action, "\x1b[0m");
  }
  global.request = request;
  global.response = response;
  global.actionArr = request.body.queryResult.action.split(".");
  global.context = request.body.queryResult.outputContexts;
  global.collection = actionArr[0];
  global.intention = actionArr[actionArr.length - 1];
  global.source = request.body.originalDetectIntentRequest.source || 'web';
  global.userId = request.body.user ? request.body.user.userId : null;
  console.log(response.body);

  // Get surface capabilities, such as screen
  capabilities = service.setCapabilities(request.body.originalDetectIntentRequest);

  //direct intents to proper functions
  return service.router(request.body.queryResult.action, actionArr[1]);
};

global.sak = require('./_swiss-army-knife');
global.tools = require('./_tools');
global.responses = require('./_responses');

process.env.GOOGLE_APPLICATION_CREDENTIALS = process.env.google_application_credentials;

ex.use(bodyParser.json());
ex.use(compression(6))
// ex.use(express.static('./www'));
ex.post('/', webhook);
let port = process.env.PORT || 3000;
ex.listen(port, () => {
  if (!process.env.SILENT) console.log('Pokemon Voice is ready on port ' + port);
});

exports.webhook = webhook;
