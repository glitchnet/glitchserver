'use strict';

const Boom = require('boom');

exports.routes = [
  {
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      reply.view('index');
    }
  }
];
