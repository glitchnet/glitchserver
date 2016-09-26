'use strict';

const Boom = require('boom');
const Joi = require('joi');

const auth = require('./auth');

const authSession = {
  mode: 'try',
  strategy: 'session'
};

exports.routes = [
  {
    method: 'GET',
    path: '/',
    config: {
      handler: function (request, reply) {
        reply.view('index', {
          session: request.auth.isAuthenticated
        });
      },
      auth: authSession
    }
  },
  {
    method: 'GET',
    path: '/login',
    handler: function (request, reply) {
      reply.view('login');
    }
  },
  {
    method: 'GET',
    path: '/authenticate',
    config: {
      handler: function (request, reply) {
        reply.view('authenticate')
      },
      auth: authSession
    }
  },
  {
    method: 'POST',
    path: '/authenticate',
    config: {
      handler: auth.authenticate,
      auth: authSession,
      validate: {
        payload: {
          pin: Joi.number().integer()
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/login',
    handler: auth.login,
    config: {
      validate: {
        payload: {
          phone: Joi.string().regex(/^\+?[0-9]+$/).min(10).max(15).options({
            language: {
              label: 'phone number'
            }
          })
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/logout',
    config: {
      handler: auth.logout,
      auth: authSession
    }
  }
];
