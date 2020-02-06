$(() => {
  $('#game').hide();

  const socket = io();

  socket.on('test1', (args) => {
    console.log(args);
  });

  $('#frmJoinGame').submit((e) => {
    e.preventDefault();
    console.log('Prevented the default behavior. ' + txtUsername.value);

    $('#join').hide();
    $('#game').show();
    return false;
  });
});