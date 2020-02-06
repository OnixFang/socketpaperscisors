// Modules
const express = require('express');
const path = require('path');
const socketIo = require('socket.io');

// Server variables
const app = express();
const port = 8018;

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
  console.log('A user has connected.');
});
