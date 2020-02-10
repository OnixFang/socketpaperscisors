const socket = io();
let room = '';
let player = {};

// Socket events
socket.on('join-room', (roomName, playerInfo) => {
  console.log(playerInfo);
  room = roomName;
  player = playerInfo;
  $('#queue').show();

  $(`#player${player.order}`).show();
  $(`#player-name${player.order}`).html(player.name);

  console.log('Waiting for next player to join on: ', roomName);
});

socket.on('close-room', (bool) => {
  console.log('Room is now closed');
  $('#queue').hide();
  $('#game').show();
});

socket.on('player-choice', (message) => {
  console.log(message);
});

// Page code
$('#join').show();

$('#frmJoinGame').submit((e) => {
  e.preventDefault();
  console.log('Prevented the default behavior. ' + txtUsername.value);

  socket.emit('join-game', txtUsername.value);

  $('#join').hide();
  return false;
});

function sendMessage(choice) {
  socket.emit('submit-choice', choice, room, txtUsername.value);
}
