var express = require('express');
var app = express();
var fs = require('fs');
var https = require('https');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// TODO:
// mongo auth + app auth + encryption
// schedule
// backup db to s3 (dropbox?) 
// deployment
// lightrail
// error handling
// unit tests (jest?)
// authn p14c

function errorHandler(_error) {
  console.log("ERROR : " + _error);
}

var DB = require("./db");
var CRYPTO = require("./crypto");
var MGR = require("./mgr");

DB.connect().then((db) => MGR.init(db)).catch((error) => errorHandler(error));

if (process.argv[2] == "local") {
  const port = 80;
  app.listen(port, () => console.log(`Local app listening on port ${port}!`));
} else {
  var privateKey = fs.readFileSync( './creds/pingiregel-private.key' );
  var certificate = fs.readFileSync( './creds/pingiregel-public.pem' );
  
  const port = 443;
  https.createServer({
      key: privateKey,
      cert: certificate
  }, app).listen(port, () => console.log(`App listening on port ${port}!`));
}

function sendResponse(response, value) {
  if (value) {
    response.send(DB.prepareForSend(value));
  } else {
    response.sendStatus(404);
  }
}

function verifyPassword(request, response, next) {
  if (!request.headers.password || request.headers.password != CRYPTO.getPassword()) {
    response.sendStatus(401);
    return false;
  }
  return true;
}

function shouldVerifyPassword(request) {
  if (request.path.startsWith("/webhook")) return false;
  if (request.path.startsWith("/misc")) return true;
  if (request.method != "GET") return true;
}

app.use(function (request, response, next) {
  if (request.path.startsWith("webhook")) {
    dumpWebhook(request);
  }
  if (shouldVerifyPassword(request)) {
    if (verifyPassword(request, response, next)) {
      next();
    }
  } else {
    next();
  }
})

app.route('/settings')
.get(function(_request, response, next) {
  p = DB.getSettings();
  p.then((value) => {sendResponse(response, value)});
})
.post(function(request, response, next) {
  p = DB.addSetting(request.body);
  p.then((value) => {sendResponse(response, value)});
});

app.route('/settings/:setting')
.get(function(request, response, next) {
  p = DB.getSetting(request.params.setting);
  p.then((value) => {sendResponse(response, value)});
})
.delete(function(request, response, next) {
  p = DB.deleteSetting(request.params.setting);
  p.then((value) => {sendResponse(response, value)});
});

app.route('/misc/:setting')
.get(function(request, response, next) {
  p = DB.getMisc(request.params.setting);
  p.then((value) => {sendResponse(response, value)});
})
.delete(function(request, response, next) {
  p = DB.deleteMisc(request.params.setting);
  p.then((value) => {sendResponse(response, value)});
});

app.route('/misc')
.post(function(request, response, next) {
  p = DB.addMisc(request.body);
  p.then((value) => {sendResponse(response, value)});
});

app.route('/games')
.get(function(request, response, next) {
  p = DB.getGames();
  p.then((value) => {sendResponse(response, value)});
})
.post(function(request, response, next) {
  p = DB.addGame(request.body);
  p.then((value) => {sendResponse(response, value)});
});

app.route('/games/:id')
.delete(function(request, response, next) {
  p = DB.deleteGame(request.params.id);
  p.then((value) => {sendResponse(response, value)});
});

app.route('/players')
.get(function(request, response, next) {
  p = DB.getPlayers();
  p.then((value) => {sendResponse(response, value)});
})
.post(function(request, response, next) {
  p = DB.addPlayer(request.body);
  p.then((value) => {sendResponse(response, value)});
});

app.route('/players/:id')
.delete(function(request, response, next) {
  p = DB.deletePlayer(request.params.id);
  p.then((value) => {sendResponse(response, value)});
});


app.route('/poll')
.post(function(request, response, next) {
  p = MGR.pollCurrentGame();
  response.sendStatus(200);
});

app.route('/check')
.post(function(request, response, next) {
  p = MGR.check();
  p.then((value) => {sendResponse(response, value)});
  // response.sendStatus(200);
});

function dumpWebhook(request) {
  var msg = "webhook - ";
  if (request.body.message) {
    msg += "message: " + request.method + " " +  request.body.message.text;
  } else if (request.body.callback_query) {
    msg += "callback_query: " + request.method + " " +  request.body.callback_query.data;
  } else {
    msg += "misc: " + request.method + " " + JSON.stringify(request.body);
  }
  console.log(msg);
}

app.route('/webhook')
.post(function(request, response, next) {
  if (request.body.callback_query) {
    p = MGR.handleCallback(request.body);
  }
  response.sendStatus(200);
});

