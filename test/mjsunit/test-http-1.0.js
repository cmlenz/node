process.mixin(require("./common"));
var http = require("http");
var tcp = require("tcp");
var PORT = 8888;

var server = http.createServer(function (req, res) {
  assertEquals('1.0', req.httpVersion);
  res.sendHeader(200, {'Content-Type': 'text/plain'});
  res.sendBody('hey my http 1.0 friend');
  res.finish();
});
server.listen(PORT)

var c = tcp.createConnection(PORT);
var response = '';
c.setEncoding("utf8");

c.addListener("connect", function () {
  c.send( "GET /hello HTTP/1.0\r\n\r\n" );
});

c.addListener("receive", function (chunk) {
  response += chunk;
});

c.addListener("eof", function (chunk) {
  c.close();
  server.close();
});

process.addListener('exit', function() {
  // Make sure no chunked header comes in
  assertFalse(!!response.match(/chunked/));
  // Make sure the response ends with "friend" and not "\r\n0\r\n\r\n"
  assertTrue(!!response.match(/friend$/));
});