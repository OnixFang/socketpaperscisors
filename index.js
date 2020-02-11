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
    // Get current room number
    let currentRoom = 'room' + roomNumber.toString();

    // Create player info
    let playerInfo = {
      username: username,
      choice: ''
    };

    // Check room availability
    io.in(currentRoom).clients((err, socketIds) => {
      let currentPlayers = socketIds.length;

      if (currentPlayers >= 1) {
        // Join socket to the room and send information back to the client
        socket.join(currentRoom);
        socket.emit('join-room', currentRoom, playerInfo);

        // Close current room then increase room number
        io.in(currentRoom).emit('close-room', true);
        roomNumber = roomNumber + 1;
      } else {
        // Join socket to the room and send room/player back to the client
        socket.join(currentRoom);
        socket.emit('join-room', currentRoom, playerInfo);

        console.log(`${playerInfo.name} has joined the queue.`);
      }
    });
  });

  socket.on('send-opponent', (room, playerInfo) => {
    socket.to(room).emit('get-opponent', opponentInfo, playerInfo);
  });

  socket.on('submit-choice', (choice, room, user) => {
    io.to(room).emit('player-choice', `${user} choose ${choice}!`);
  });
});
