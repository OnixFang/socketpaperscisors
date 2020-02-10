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

    // Join player's socket to the room
    socket.join(currentRoom);

    // Get number of players in room
    io.in(currentRoom).clients((err, socketIds) => {
      let currentPlayers = socketIds.length;

      // Close room if more than 1 player is inside
      if (currentPlayers > 1) {
        io.in(currentRoom).emit('close-room', true);
        roomNumber = roomNumber + 1;
      }

      // Create player info
      let playerInfo = {
        name: username,
        order: currentPlayers,
        choise: ''
      };

      // Send room and player information back to socket
      socket.emit('join-room', currentRoom, playerInfo);

      console.log(`${playerInfo.name} has joined the queue.`);
    });
  });

  socket.on('submit-choice', (choice, room, user) => {
    io.to(room).emit('player-choice', `${user} choose ${choice}!`);
  });
});
