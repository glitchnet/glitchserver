'use strict';

const Cylon = require('cylon');
const Hypher = require('hypher');
const english = require('hyphenation.en-us');
const hypher = new Hypher(english);

let me;

function stutter() {
  return Math.round(Math.random());
}

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

exports.say = function (message, socket) {
  let messageArr = message.split(' ');
  let timeout = 0;
  let counter = 0;
  let idx = 0;
  let msgIdx = 0;
  let syllableArr;

  function setFace(face, msg, timer) {
    setTimeout(() => {

      me.voice.say(msg);
      // console.log(msg)
      socket.emit('messageack', {
        message: message,
        face: face
      });
      setTimeout(() => {
        socket.emit('messageack', {
          message: message,
          face: 10
        });
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
