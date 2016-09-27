'use strict';

const Hapi = require('hapi');
const SocketIO = require('socket.io');
const http = require('http');
const Boom = require('boom');
const Blankie = require('blankie');
const Scooter = require('scooter');
const Statehood = require('statehood');

const conf = require('./lib/conf');
const operators = require('./lib/operators');
const { routes } = require('./lib/routes');

const server = new Hapi.Server();

let io;
let admins = {};

server.connection({
  host: conf.get('domain'),
  port: conf.get('port'),
  routes: {
    cors: true,
    security: {
      xframe: 'sameorigin',
      hsts: {
        includeSubDomains: true,
        preload: true,
        maxAge: 15768000
      }
    }
  }
});

server.register([Scooter,
  {
    register: Blankie,
    options: {
      defaultSrc: ['self'],
      connectSrc: ['ws:', 'wss:', 'self'],
      imgSrc: ['self'],
      frameSrc: ['self', 'https://w.soundcloud.com'],
      scriptSrc: ['self'],
      styleSrc: ['self', 'https://fonts.googleapis.com'],
      fontSrc: ['self', 'https://fonts.gstatic.com'],
      mediaSrc: ['self'],
      generateNonces: false
    }
  }
], (err) => {
  if (err) {
    return console.log(err);
  }
});

server.register(require('hapi-auth-cookie'), (err) => {
  if (err) {
    throw err;
  }

  server.auth.strategy('session', 'cookie', {
    password: conf.get('password'),
    ttl: conf.get('session-ttl'),
    cookie: conf.get('cookie'),
    keepAlive: true,
    isSecure: process.env.node === 'production'
  });
});

server.register([
  {
    register: require('vision')
  },
  {
    register: require('inert')
  },
  {
    register: require('crumb')
  },
  {
    register: require('hapi-cache-buster'),
    options: new Date().getTime().toString()
  }
], (err) => {
  if (err) {
    console.log(err);
  }

  server.views({
    engines: {
      pug: require('pug')
    },
    isCached: process.env.node === 'production',
    path: __dirname + '/views',
    compileOptions: {
      pretty: true
    }
  });
});

server.route(routes);

server.route({
  path: '/{p*}',
  method: 'GET',
  handler: {
    directory: {
      path: ['./public', './build'],
      listing: false,
      index: false
    }
  }
});

server.ext('onPreResponse', (request, reply) => {
  let response = request.response;
  if (!response.isBoom) {
    return reply.continue();
  }

  let error = response;
  let ctx = {};

  let message = error.output.payload.message;
  let statusCode = error.output.statusCode || 500;
  ctx.code = statusCode;
  ctx.httpMessage = http.STATUS_CODES[statusCode].toLowerCase();

  switch (statusCode) {
    case 404:
      ctx.reason = 'page not found';
      break;
    case 403:
      ctx.reason = 'forbidden';
      break;
    case 500:
      ctx.reason = 'something went wrong';
      break;
    default:
      break;
  }

  if (process.env.node !== 'production') {
    console.log(error.stack || error);
  }

  if (ctx.reason) {
    // Use actual message if supplied
    ctx.reason = message || ctx.reason;
    return reply.view('error', ctx).code(statusCode);
  } else {
    ctx.reason = message.replace(/\s/gi, '+');
    reply.redirect(request.path + '?err=' + ctx.reason);
  }
});

const stateDefn = new Statehood.Definitions({
  encoding: 'iron',
  password: conf.get('password'),
  ttl: conf.get('session-ttl'),
  isSecure: process.env.NODE_ENV === 'production'
});

server.start((err) => {
  if (err) {
    console.error(err.message);
    process.exit(1);
  }

  io = SocketIO.listen(server.listener);

  io.set('authorization', (handshake, next) => {
    if (handshake.headers.cookie) {
      stateDefn.parse(handshake.headers.cookie, (err, state) => {
        const key = conf.get('cookie');
        if (state && state[key]) {
          const sessionID = state[key].phone;

          if (sessionID) {
            handshake.headers.uid = sessionID;
          }
        }
      });
    } else {
      return next('No cookie transmitted.', false);
    }
    next(null, true);
  });

  io.on('connection', (socket) => {
    socket.on('join', (data) => {
      console.log('joined');

      if (socket.handshake.headers.uid) {
        admins[socket.id] = true;
      }

      if (!socket.handshake.headers.uid) {
        setTimeout(() => {
          operators.say('Hello. I am not alive right now. I hope you enjoy the music.', [socket.id], io);
        }, 2000);
      }
      socket.emit('connected', socket.id);
    });

    socket.on('message', (data) => {
      if (socket.handshake.headers.uid) {
        operators.say(data.message, [socket.id, data.socketID], io);
      } else {
        operators.incoming(data.message, socket.id, io, admins);
      }
    });
  });
});
