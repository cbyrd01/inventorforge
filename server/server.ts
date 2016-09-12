import * as http from "http";
import * as url from "url";
import * as express from "express";
import * as socketIO from "socket.io";
import * as nconf from "nconf";
import * as SerialPort from "serialport";


// Load configuration options from command argument, environment, or config
// file

nconf.argv().env();

let environment = nconf.get('NODE_ENV') || 'development';
nconf.file(environment, './config/' + environment.toLowerCase() + '.json');
nconf.file('default', './config/default.json');

var serialPort : SerialPort;

if(!nconf.get('serial:disable')) {
  serialPort = new SerialPort(nconf.get('serial:port'), { baudrate: nconf.get('serial:baudrate') });
}


var app = express();

var server = http.Server(app);

var sio = socketIO(server);

var gear : boolean;

var state : {letter: number, red: number, green: number, blue: number}[] = [
  {letter: 0, red: 0, green: 0, blue: 0},
  {letter: 1, red: 0, green: 0, blue: 0}, 
  {letter: 2, red: 0, green: 0, blue: 0},
  {letter: 3, red: 0, green: 0, blue: 0},
  {letter: 4, red: 0, green: 0, blue: 0}];

app.use(express.static('www'));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

server.listen(nconf.get('network:port'), nconf.get('network:host'), function() {
  console.log('Server started on host: ' + nconf.get('network:host') + 
              ', port ' + nconf.get('network:port') + '.');
});


sio.serveClient(true);

sio.on('connection', function (socket) {
  console.log('connection');
  for(let letter of state) {
    console.log("Sending: " + letter);
    socket.emit('letter', letter);
  }

  socket.on('gear', function (data) {
    console.log("calling gear.");
    if(typeof data["gear"] != "undefined") {
      gear = data["gear"];
      console.log("setting ear to " + data["gear"]);
    }
    if(data["gear"] == true) {
      setGearOn();
    }
    else {
      setGearOff();
    }
    socket.broadcast.emit('gear', data);
  });

  socket.on('allon', function(data) {
    console.log("received allon");
    for(let i in state) {
      setLetter( socket, { "letter": i, "red": 255, "green": 255, "blue": 255} );
    }
  });

  socket.on('alloff', function(data) {
    console.log("received alloff");
    for(let i in state) {
      setLetter( socket, { "letter": i, "red": 0, "green": 0, "blue": 0} );
    }
  });

  socket.on('letter', function (data) {
    console.log(data);
    setLetter(socket, data);
  });
});

function setLetter(socket : any, data : any) {
  let letterNumber : number = Number(data["letter"]);
  if(typeof data["red"] != "undefined") {
    state[letterNumber].red = data["red"];
    console.log("setting red to " + data["red"]);
    setAllLettersSerial(letterNumber);
  }
  if(typeof data["green"] != "undefined") {
    state[letterNumber].green = data["green"];
    console.log("setting green to " + data["green"]);
    setAllLettersSerial(letterNumber);
  }
  if(typeof data["blue"] != "undefined") {
    state[letterNumber].blue = data["blue"];
    console.log("setting blue to " + data["blue"]);
    setAllLettersSerial(letterNumber);
  }
  socket.broadcast.emit('letter', data);
}

function setGearOn() {
  if(!nconf.get('serial:disable')) {
    // s=special, 1=gear, 01=on, 0000=unused
    serialPort.write('s1010000;');
  }
}

function setGearOff() {
  if(!nconf.get('serial:disable')) {
    // s=special, 1=gear, 00=off, 0000=unused
    serialPort.write('s1000000;');
  }
}

function setAllLettersSerial(letterNumber: number) {
  if(!nconf.get('serial:disable')) {
    serialPort.write('c' + letterNumber + 
      parseSerial(state[letterNumber].red) +
      parseSerial(state[letterNumber].green) +
      parseSerial(state[letterNumber].blue) + ';'
    );
  }
}

function parseSerial(colorValue : number) : string {
  let hexValue : string = colorValue.toString(16);
  if(hexValue.length < 2 ) {
    hexValue = "0" + hexValue;
  }
  return hexValue;
}
