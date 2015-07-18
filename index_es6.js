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

  mesurement = escape(mesurement)

  if (!fields || !isObject(fields)) {
    return self.emit('error', 'fields should be an Object')
  }

  let escaped_fields_array = []
  let unescaped_fields_keys = Object.keys(fields) || []
  for (let i = 0; i < unescaped_fields_keys.length; i++) {
    escaped_fields_array.push(escape(unescaped_fields_keys[i]) + '=' + fields[unescaped_fields_keys[i]])
  }
  let escaped_fields_str = escaped_fields_array.join(',')

  let escapeTags = ''

  if (!isObject(tags)) {
    return self.emit('error', 'tags if provied should be an object')
  }

  let esapedTagsArray = []
  for (let tagKey in tags) {
    esapedTagsArray.push(escape(tagKey), escape(tags[tagKey]))
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

function isObject (obj) {
  let type = typeof obj
  return type === 'function' || type === 'object' && !!obj
}

function escape (str) {
  return str.split('').map(function (character) {
    if (character === ' ') {
      character = '\\' + character
    }
    return character
  }).join('')
}
