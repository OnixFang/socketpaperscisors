$(() => {
  const socket = io();

  $('#frmJoinGame').submit((e) => {
    e.preventDefault();
    console.log('Prevented the default behavior. ' + txtUsername.value);
    return false;
  });
});