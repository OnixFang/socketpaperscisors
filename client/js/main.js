$(() => {
  const socket = io();

  // Socket events
  socket.on('joinRoom', (roomName) => {
    $('#queue').show();

    console.log('Waiting for next player to join on: ', roomName);
  });

  $('#join').show();

  $('#frmJoinGame').submit((e) => {
    e.preventDefault();
    console.log('Prevented the default behavior. ' + txtUsername.value);

    socket.emit('joinGame', txtUsername.value);

    $('#join').hide();
    return false;
  });
});