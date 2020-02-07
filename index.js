// Modules
const express = require('express');
const path = require('path');
const socketIo = require('socket.io');

// Server variables
const app = express();
const port = 8018;
let roomNumber = 0;

// Server configuration
app.use(express.static(path.join(__dirname, 'client')))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/client/index.html');
});

// Server launch
const io = socketIo(app.listen(port, () => {
  console.log(`App listening on http://localhost:${port}`);
}));

io.on('connection', (socket) => {
  socket.on('joinGame', (username) => {
    let currentRoom = 'room' + roomNumber.toString();

    io.in(currentRoom).clients((err, socketIds) => {
      if (socketIds.length === 2) {
        roomNumber = roomNumber + 1;
        currentRoom = 'room' + roomNumber.toString();
      }

      socket.join(currentRoom);
      socket.emit('joinRoom', currentRoom);
    });

    console.log(`${username} has joined the queue.`);
  });
});
