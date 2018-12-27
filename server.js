var express = require('express');
var app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// TODO:
// mongo auth + app auth + encryption
// schedule
// backup db to s3 (dropbox?) 
// webhook
// deployment
// MEAN lightrail
// error handling
// unit tests

function errorHandler(_error) {
  console.log("ERROR : " + _error);
}

var DB = require("./db");
var BOT = require("./bot");
var CRYPTO = require("./crypto");

DB.connect().then((db) => BOT.init(db)).catch((error) => errorHandler(error));

const port = 80;
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

function sendResponse(response, value) {
  if (value) {
    response.send(value)
  } else {
    response.send(404);
  }
}

function verifyPassword(request, response, next) {
  if (!request.headers.password || request.headers.password != CRYPTO.getPassword()) {
    response.send(401);
    return false;
  }
  return true;
}

app.use(function (request, response, next) {
  if (request.method != "GET" || request.path.startsWith("/misc")) {
    if (verifyPassword(request, response, next)) {
      next()
    }
  } else {
    next()
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

app.route('/webhook')
.all(function(request, response, next) {
  p = BOT.handleCallback(request.body);
  response.send(200);
});