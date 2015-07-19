'use strict';
var dgram = require('dgram');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

util.inherits(influx_line_udp, EventEmitter);

function influx_line_udp(host, port) {
  var self = this;
  EventEmitter.call(self);
  self.host = host;
  self.port = port;
  self.socket = dgram.createSocket('udp4');
  return self;
}

module.exports = influx_line_udp;

influx_line_udp.prototype.send = function (mesurement, fields) {
  var tags = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
  var timestamp = arguments.length <= 3 || arguments[3] === undefined ? undefined : arguments[3];

  var self = this;
  if (!mesurement || typeof mesurement !== 'string') {
    return self.emit('error', 'mesurement should be string');
  }

  mesurement = escape(mesurement);

  if (!fields || !isObject(fields)) {
    return self.emit('error', 'fields should be an Object');
  }

  var escaped_fields_array = [];
  var unescaped_fields_keys = Object.keys(fields) || [];
  for (var i = 0; i < unescaped_fields_keys.length; i++) {
    escaped_fields_array.push(escape(unescaped_fields_keys[i]) + '=' + fields[unescaped_fields_keys[i]]);
  }
  var escaped_fields_str = escaped_fields_array.join(',');

  var escapeTags = '';

  if (!isObject(tags)) {
    return self.emit('error', 'tags if provied should be an object');
  }

  var esapedTagsArray = [];
  for (var tagKey in tags) {
    esapedTagsArray.push(escape(tagKey), escape(tags[tagKey]));
  }
  escapeTags = esapedTagsArray.join(',');

  var data = '' + mesurement + (escapeTags.length > 0 ? ',' + escapeTags : '') + ' ' + escaped_fields_str + (timestamp ? ' ' + timestamp : timestamp);

  if (!self.socket) {
    self.socket = dgram.createSocket('udp4');
  }
  _send(self.socket, data, 0, self.port, self.host);
};

function _send(socket, data, offset, port, host) {
  if (!Buffer.isBuffer(data)) {
    data = new Buffer(data);
  }
  socket.send(data, offset, data.length, port, host);
}

function isObject(obj) {
  var type = typeof obj;
  return type === 'function' || type === 'object' && !!obj;
}

function escape(str) {
  return str.split('').map(function (character) {
    if (character === ' ' || character === ',') {
      character = '\\' + character;
    }
    return character;
  }).join('');
}

