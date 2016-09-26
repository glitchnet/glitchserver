'use strict';

const TP = require('twilio-party');
const Boom = require('boom');

const conf = require('./conf');

const tp = new TP(conf.get('twilioSID'), conf.get('twilioToken'),
                  conf.get('twilioNumber'), conf.get('phoneSalt'));
tp.message = 'Here is your creepy glitch face pin: ';

exports.login = function (request, reply) {
  const prehashPhone = request.payload.phone;
  const ip = request.info.remoteAddress;

  if (!ip) {
    return reply(Boom.wrap(new Error('remote ip required'), 400));
  }

  tp.addNumber(prehashPhone, (err, formattedPhone) => {
    if (err) {
      return reply.redirect('/authenticate?err=Invalid number');
    }
    // set session phone temporarily to the prehashed one so that we can verify auth later
    request.cookieAuth.set({
      phone: formattedPhone
    });

    reply.redirect('/authenticate');
  });
};

exports.authenticate = function (request, reply) {
  const validated = tp.validatePin(request.auth.credentials.phone, request.payload.pin);

  if (validated) {
    // change session phone # to hashed version.
    request.auth.credentials.phone = validated;
    reply.redirect('/');
  } else {
    return reply(Boom.wrap(new Error('Invalid pin'), 400));
  }
};

exports.logout = function (request, reply) {
  request.cookieAuth.clear();
  reply.redirect('/');
};