'use strict';

const ws = require('./ws');
const phonemes = require('./phonemes');

let links = document.querySelector('.links');
let creditsLk = links.querySelector('.credits');
let footerLk = links.querySelector('.webring');
let footer = document.querySelector('footer');
let overlay = document.querySelector('#overlay');
let canvasOct = document.querySelector('canvas#octagon');
let canvasFace = document.querySelector('canvas#face');
let incoming = document.querySelector('#incoming');
let ctx1 = canvasOct.getContext('2d');
let ctx2 = canvasFace.getContext('2d');
let isOverlay = false;
let isFooter = false;
let img;
let height = 0;
let width = 0;
let currentFace = 10;

const socket = ws.getSocket();

creditsLk.onclick = function () {
  isOverlay = !isOverlay;

  if (isOverlay) {
    overlay.classList.add('on');
  } else {
    overlay.classList.remove('on');
  }
};

footerLk.onclick = function () {
  isFooter = !isFooter;

  if (isFooter) {
    footer.classList.add('on');
  } else {
    footer.classList.remove('on');
  }
};

// Incoming messages are appended into the page.
socket.on('messageack', (data) => {
  incoming.textContent = data.message;
  currentFace = data.face;
});

let polycoord = [
  {
    x: 200,
    y: 100
  },
  {
    x: 500,
    y: 100
  },
  {
    x: 600,
    y: 200
  },
  {
    x: 600,
    y: 500
  },
  {
    x: 500,
    y: 600
  },
  {
    x: 200,
    y: 600
  },
  {
    x: 100,
    y: 500
  },
  {
    x: 100,
    y: 200
  }
];

function drawPoly() {
  ctx1.translate(700 / 2, 700 / 2);
  ctx1.rotate(5 * (Math.PI / 180));
  ctx1.translate(-700 / 2, -700 / 2);

  ctx1.beginPath();
  ctx1.strokeStyle = '#0f0';
  ctx1.lineWidth = 5;
  ctx1.shadowBlur = 25;
  ctx1.shadowColor = '#fff';

  for (let ix = 0; ix < polycoord.length; ix++) {
    if (ix === 0) {
      ctx1.moveTo(polycoord[ix].x, polycoord[ix].y);
    } else {
      ctx1.lineTo(polycoord[ix].x, polycoord[ix].y);
    }
  }

  ctx1.closePath();
  ctx1.stroke();

  img = new Image();
  img.onload = function () {
    ctx2.drawImage(img, 50, 20, 400, 444);
  };
  img.src = '/media/face' + currentFace + '.png';
}

function render() {
  ctx1.clearRect(0, 0, canvasOct.width, canvasOct.height);
  drawPoly();
  requestAnimationFrame(render);
}

render();
