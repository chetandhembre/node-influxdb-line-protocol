#InfluxDB-Line-Protocol

implementation of [line protocol](https://influxdb.com/docs/v0.9/write_protocols/line.html) for [influxdb](https://influxdb.com/). Specifications of protocol are [here](https://influxdb.com/docs/v0.9/write_protocols/write_syntax.html).


[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)


Currently only UDP protocol is supported

##Why UDP ?

because in metric collection application you mostly do not want to get reply from influxdb on write.

##prerequisites

To use UDP protocol for writing data in influxdb using line protocol, we have to enable UDP support in influxdb [configuration file](https://influxdb.com/docs/v0.9/administration/config.html).

```
[udp]
  enabled = true
  bind-address = ":9999"
  database = "visitors"
```

after changing UDP configuration to above configuration, influxdb will start listening on port 9999. Important point here is we have to specified `database` to which all write will go and we can not change it in run time. :(


##Installation

```
npm i influxdb-line-protocol --save
```  

##Test

just run following command

```
npm test
```

we do not require influxdb running for testing as nature of UDP protocol we can not identify whether data is written or not.

##API

##### constructor
---

```js
var InfluxDbLine = require('influxdb-line-protocol'
var influxDbLine = new InfluxDbLine(host, port)
influxDbLine.on('error', console.log)
```
 * `host`: host of influxdb server
 * `port`: port on which influxdb listening on UDP protocol
 * returns event listener which Currently emits 'error' event.

 Philosophy behind return event emitter is will gives you error which may occurs due to invalid data (explained below) so no callbacks.

#####send
---
It is use for sending metrics to influxdb

```js
influxDbLine.send('CPU', {
  value : 50
}, {
  instanceId : 'i-4159e7sdd'
}, new Date().getTime())
```

 * `measurement`<string>: metric you want to send value for
 * `fields`<object>: fields to store with entry
 * `tags`<object>: optional fields for tags to add in entry
 * `timestamps`: optional if you want to specified timestamps for entry  

This method will throw exception when module unable to make UPD connection with influxdb.  

##Example

```js

var InfluxDbLine = require('influxdb-line-protocol')

var influxDbLine = new InfluxDbLine('localhost', 9999)
influxDbLine.on('error', console.error)

influxDbLine.send('CPU', {
  value : 50
}, {
  instanceId : 'i-4159e7sdd'
})
```

##Contribution

This module is using es6 features. So es6 code is written in `index_es6.js` and it is converted to `index.js`. Just run following command to do it

```js
npm run build
```
##license
MIT
