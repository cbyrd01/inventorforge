import * as http from "http";
import * as url from "url";
import * as express from "express";
import * as socketIO from "socket.io";

var app = express();

var server = http.Server(app);

var sio = socketIO(server);

var state : {letter: number, red: number, green: number, blue: number}[] = [
  {letter: 0, red: 0, green: 0, blue: 0},
  {letter: 1, red: 0, green: 0, blue: 0}, 
  {letter: 2, red: 0, green: 0, blue: 0},
  {letter: 3, red: 0, green: 0, blue: 0},
  {letter: 4, red: 0, green: 0, blue: 0}];

app.use(express.static('../www'));

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
  for(let letter of state) {
    console.log("Sending: " + letter);
    socket.emit('letter', letter);
  }

  socket.on('letter', function (data) {
    console.log(data);
    let letterNumber = data["letter"];
    if(typeof data["red"] != "undefined") {
      state[letterNumber].red = data["red"];
      console.log("setting red to " + data["red"]);
    }
    if(typeof data["green"] != "undefined") {
      state[letterNumber].green = data["green"];
      console.log("setting green to " + data["green"]);
    }
    if(typeof data["blue"] != "undefined") {
      state[letterNumber].blue = data["blue"];
      console.log("setting blue to " + data["blue"]);
    }
    socket.broadcast.emit('letter', data);
  });
});
