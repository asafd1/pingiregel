var express = require('express');
var app = express();
var DB = require("./db");
const port = 80;

app.get('/', function(_request, response) {
  p = DB.getSetting("targetForGame");
  p.then((p) => {response.send(p)});
  });

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

// const http = require('http');

// const hostname = '0.0.0.0';
// const port = 80;

// const server = http.createServer((req, res) => {
//   res.statusCode = 200;
//   res.setHeader('Content-Type', 'text/plain');
//   res.end('pingiregel\n');
// });

// server.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });
