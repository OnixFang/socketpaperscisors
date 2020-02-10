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
  // Player Joining to queue
  socket.on('join-game', (username) => {
    let currentRoom = 'room' + roomNumber.toString();
    socket.join(currentRoom);
    socket.emit('join-room', currentRoom);

    io.in(currentRoom).clients((err, socketIds) => {
      if (socketIds.length > 1) {
        io.in(currentRoom).emit('close-room', true);
        roomNumber = roomNumber + 1;
      }
    });

    console.log(`${username} has joined the queue.`);
  });

  socket.on('submit-choice', (choice, room, user) => {
    io.to(room).emit('player-choice', `${user} choose ${choice}!`);
  });
});
