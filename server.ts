import * as http from "http";
import * as url from "url";
import * as express from "express";
import * as socketIO from "socket.io";

var app = express();

var server = http.Server(app);

var sio = socketIO(server);

app.use(express.static('www'));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

server.listen(8080, function() {
  console.log('Server started on port 8080.');
});


sio.serveClient(true);

sio.on('connection', function (socket) {
  console.log('connection');
  socket.on('letter', function (data) {
    console.log(data);
    socket.broadcast.emit('letter', data);
  });
});
