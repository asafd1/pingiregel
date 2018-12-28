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
    response.send(value)
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
  p = DB.insertSetting(request.body);
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
  p = DB.insertMisc(request.body);
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
  response.sendStatus(200);
});

app.route('/webhook')
.post(function(request, response, next) {
  console.log("webhook");
  p = MGR.handleCallback(request.body);
  response.sendStatus(200);
});

