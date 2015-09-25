'use strict'
var dgram = require('dgram')
var EventEmitter = require('events').EventEmitter
var util = require('util')

util.inherits(influx_line_udp, EventEmitter)

function influx_line_udp (host, port) {
  var self = this
  EventEmitter.call(self)
  self.host = host
  self.port = port
  self.socket = dgram.createSocket('udp4')
  return self
}

module.exports = influx_line_udp

influx_line_udp.prototype.send = function (mesurement, fields, tags={}, timestamp=undefined) {
  let self = this
  if (!mesurement || typeof mesurement !== 'string') {
    return self.emit('error', 'mesurement should be string')
  }

  mesurement = escape(mesurement, true)

  if (!fields || !isObject(fields)) {
    return self.emit('error', 'fields should be an Object')
  }

  let escaped_fields_array = []
  let unescaped_fields_keys = Object.keys(fields) || []
  for (let i = 0; i < unescaped_fields_keys.length; i++) {
    escaped_fields_array.push(escape(unescaped_fields_keys[i], true) + '=' + fields[unescaped_fields_keys[i]])
  }
  let escaped_fields_str = escaped_fields_array.join(',')

  let escapeTags = ''

  if (!isObject(tags)) {
    return self.emit('error', 'tags if provied should be an object')
  }

  let esapedTagsArray = []
  for (let tagKey in tags) {
    esapedTagsArray.push(escape(tagKey, true) + '=' + escape(tags[tagKey]))
  }
  escapeTags = esapedTagsArray.join(',')

  let data = `${mesurement}${escapeTags.length > 0 ? ',' + escapeTags : ''} ${escaped_fields_str}${timestamp ? ' ' + timestamp : timestamp}`

  if (!self.socket) {
    self.socket = dgram.createSocket('udp4')
  }
  _send(self.socket, data, 0, self.port, self.host)
}

function _send (socket, data, offset, port, host) {
  if (!Buffer.isBuffer(data)) {
    data = new Buffer(data)
  }
  socket.send(data, offset, data.length, port, host)
}

function isString(arg) {
  return typeof arg === 'string' || arg instanceof String;
}

function isBoolean(arg) {
  return typeof arg === 'boolean' || arg instanceof Boolean;
}

function isObject (obj) {
  let type = typeof obj
  return type === 'function' || type === 'object' && !!obj
}

function isNumber(arg) {
  return typeof arg === 'number' || arg instanceof Number;
}

function isInt(n) {
   return n % 1 === 0;
}

function escape (value, skipQuote) {
  if(isString(value)){
    var svalue = value.split('').map(function (character) {
      if (character === ' ' || character === ',' || (!skipQuote && character === '"')) {
        character = '\\' + character
      }
      return character
    }).join('');

    if(skipQuote){
      return svalue;
    }

    return '"' + svalue + '"';
  }

  if(isBoolean(value)){
    return value ? 'TRUE' : 'FALSE';
  }

  if(isNumber(value)){
    if(isInt(value)){
      return value + 'i';
    }

    return value;
  }

  if(isObject(value)){
    return escape(value.toString());
  }

  return value;
}
