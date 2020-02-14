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

function joinToNextOpenRoom(socket, roomIndex = 0) {
  const roomName = `room${roomIndex}`;

  if (roomName === socket.roomToSkip) {
    console.log(`Skipping ${roomName}.`);
    joinToNextOpenRoom(socket, roomIndex + 1);
  } else {
    io.in(roomName).clients((err, socketIds) => {
      console.log(`${roomName}: ${socketIds.length} players.`);
      if (socketIds.length < 2) {
        // Create player info
        const playerInfo = {
          username: socket.username,
          choice: ''
        };

        socket.join(roomName);
        socket.emit('join-room', roomName, playerInfo);
        console.log(`${playerInfo.username} joined ${roomName}.`);

        // Close room if there are 2 players in it
        if (socketIds.length >= 1) {
          io.in(roomName).emit('close-room', true);
          console.log('Room is now full. Closing room.');
          console.log(`Match starting in ${roomName}.`);
        }
      } else {
        console.log('Room full, going to next room.');
        joinToNextOpenRoom(socket, roomIndex + 1);
      }
    });
  }
}

// Server launch
const io = socketIo(app.listen(port, () => {
  console.log(`App listening on http://localhost:${port}`);
}));

io.on('connection', (socket) => {
  // Player Joining to queue
  socket.on('join-game', (username, roomToSkip) => {
    // Get player out of any previous rooms if re-joining queue
    for (const key in socket.rooms) {
      if (key != socket.id) {
        socket.leave(socket.rooms[key]);
      }
    }

    socket.username = username;
    socket.roomToSkip = roomToSkip;

    // Join player to the next open room
    console.log(`------------------ New Join request from ${username} ------------------`);
    joinToNextOpenRoom(socket);
  });

  socket.on('send-opponent', (room, playerInfo) => {
    socket.to(room).emit('get-opponent', playerInfo);
  });

  socket.on('submit-choice', (choice, room, user) => {
    io.to(room).emit('player-choice', `${user} choose ${choice}!`);
  });

  socket.on('leave-match', (roomName) => {
    socket.to(roomName).emit('left-room', true);
    socket.leave(roomName);
    console.log(`------------------> ${socket.username} left ${roomName}.`);
  });

  socket.on('disconnecting', (reason) => {
    for (const key in socket.rooms) {
      // Check if the player was in a room
      if (key != socket.id) {
        let oldRoom = socket.rooms[key];

        // Inform opponent to leave that room and join new one
        console.log(`------------------> ${socket.username} disconnected from ${roomName}.`);
        socket.to(oldRoom).emit('left-room', true);
      }
    }
  });
});
