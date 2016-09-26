'use strict';

const Cylon = require('cylon');
const Filter = require('bad-words');
const Hypher = require('hypher');
const english = require('hyphenation.en-us');
const hypher = new Hypher(english);

let me;

let customFilter = new Filter({ placeHolder: '*'});

function currentFace(w) {
  let face = 10;

  switch (w.charAt(0).toLowerCase()) {
    case 'a':
    case 'i':
    case 'h':
      face = 1;
      break;
    case 'o':
      face = 2;
      break;
    case 'e':
      face = 3;
      break;
    case 'u':
      face = 4;
      break;
    case 'j':
      face = 5;
      break;
    case 'l':
    case 'n':
      face = 6;
      break;
    case 'w':
    case 'q':
    case 'y':
      face = 7;
      break;
    case 'm':
    case 'b':
    case 'p':
      face = 8;
      break;
    case 'f':
    case 'v':
      face = 9;
      break;
    default:
      face = 5;
      break;
  }

  return face;
};

Cylon.robot({
  connections: {
    speech: {
      adaptor: 'speech'
    }
  },

  devices: {
    voice: {
      driver: 'speech',
      voice: 'en+f1',
      speed: 170
    }
  },

  work: function (m) {
    me = m;
  }
}).start();

exports.incoming = function (message, socketID, io, admins) {
  for(let k in admins) {
    io.sockets.in(k).emit('receiveack', {
      message: customFilter.clean(message),
      socketID: socketID
    });
  }
};

exports.say = function (message, socketArr, io) {
  let messageArr = message.split(' ');
  let timeout = 0;
  let counter = 0;
  let idx = 0;
  let msgIdx = 0;
  let syllableArr;
  console.log(socketArr)
  function setFace(face, msg, timer) {
    setTimeout(() => {
      socketArr.forEach((s) => {
        me.voice.say(msg);
        io.sockets.in(s).emit('messageack', {
          message: message,
          face: face
        });
      });
      setTimeout(() => {
        socketArr.forEach((s) => {
          io.sockets.in(s).emit('messageack', {
            message: message,
            face: 10
          });
        })
      }, 150);

      timeout++;
    }, timeout * timer);
  }

  function setWord() {
    if (messageArr[msgIdx]) {
      setTimeout(() => {
        syllableArr = hypher.hyphenate(messageArr[msgIdx]);
        if (idx < syllableArr.length) {
          setFace(currentFace(syllableArr[idx]), syllableArr[idx], 220);
          idx++;
        } else {
          msgIdx++;
          idx = 0;
        }
        setWord();
      }, 220);
    }
  }

  setWord();
};
