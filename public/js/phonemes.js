'use strict';

const ws = require('./ws');

let message = document.querySelector('#message input');
let messageBtn = document.querySelector('#message button');
let incoming = document.querySelector('#incoming');
let identifier = document.querySelector('#mid');
let socketID;

const socket = ws.getSocket();

socket.on('connect', () => {
  socket.emit('join');
});

socket.on('connected', (data) => {
  socketID = data;
});

messageBtn.onclick = function () {
  socket.emit('message', {
    message: message.value,
    socketID: identifier.value
  });
};
