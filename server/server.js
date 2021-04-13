const static = require('node-static');
const server = require('http').createServer();
const file = new(static.Server)();

const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:8080",
  },
});
console.log("I CAN PRINT");
io.attach(server, {
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false
});

io.sockets.on('connection', (socket) => {
  console.log("CONNECTED BITCH");
  // Convenience function to log server messages to the client
  function log(message){
    socket.emit('log', message);
  }

  socket.on('message', (message) => {
    console.log(message)
    log(message);
    // For a real app, would be room only (not broadcast)
    socket.broadcast.emit('message', message);
  });

  socket.on('create or join', (room) => {
    console.log("Creating room")
    console.log(room)
    var clientsList = io.sockets.adapter.rooms[room];
    var numClients = clientsList == null ? 0 : clientsList.length;

    log('Room ' + room + ' has ' + numClients + ' client(s)');
    log('Request to create or join room ' + room);

    if (numClients === 0){
      socket.join(room);
      socket.emit('created', room);
    } else if (numClients === 1) {
      io.sockets.in(room).emit('join', room);
      socket.join(room);
      socket.emit('joined', room);
    } else { // max two clients
      socket.emit('full', room);
    }
    socket.emit('emit(): client ' + socket.id +
      ' joined room ' + room);
    socket.broadcast.emit('broadcast(): client ' + socket.id +
      ' joined room ' + room);

  });

});

server.listen(3000);
