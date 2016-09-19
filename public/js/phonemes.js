'use strict';

const ws = require('./ws');

let message = document.querySelector('#message input');
let messageBtn = document.querySelector('#message button');
let incoming = document.querySelector('#incoming');

const socket = ws.getSocket();

socket.on('connect', () => {
  socket.emit('join');
});

messageBtn.onclick = function () {
  socket.emit('message', {
    message: message.value
  });
};
