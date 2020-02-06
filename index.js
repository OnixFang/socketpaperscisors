// Modules
const express = require('express');
const socketIo = require('socket.io');

// Server variables
const app = express();
const port = 8018;

// Server configuration

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/client/index.html');
});

// Server launch
const io = socketIo(app.listen(port, () => {
  console.log(`App listening on http://localhost:${port}`);
}));

io.on('connection', (socket) => {
  console.log('A user has connected.');
});
