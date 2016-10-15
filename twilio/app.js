// Copyright 2015-2016, Google, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// [START app]
'use strict';

var pg = require('pg');
var format = require('util').format;
var express = require('express');
var bodyParser = require('body-parser').urlencoded({
  extended: false
});

var app = express();

// [START config]
var TWILIO_NUMBER = process.env.TWILIO_NUMBER;
if (!TWILIO_NUMBER) {
  console.log(
    'Please configure environment variables as described in README.md');
  process.exit(1);
}

var twilio = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN);

var TwimlResponse = require('twilio').TwimlResponse;
// [END config]

// [START receive_call]
app.post('/call/receive', function (req, res) {
  var resp = new TwimlResponse();
  resp.say('Thanks for calling Bad Batch Alert. Lets save some lives!.');

  res.status(200)
    .contentType('text/xml')
    .send(resp.toString());
});
// [END receive_call]

// [START send_sms]
app.get('/sms/send', function (req, res, next) {
  var to = req.query.to;
  if (!to) {
    return res.status(400).send(
      'Please provide an number in the "to" query string parameter.');
  }

  twilio.sendMessage({
    to: to,
    from: TWILIO_NUMBER,
    body: 'Hello from Google App Engine'
  }, function (err) {
    if (err) {
      return next(err);
    }
    res.status(200).send('Message sent.');
  });
});
// [END send_sms]

// [START receive_sms]
// [START receive_sms]
app.post('/sms/receive', bodyParser, function (req, res) {

  pg.defaults.ssl = true;
  pg.connect(process.env.DATABASE_URL, function(err, client) {
  if (err) throw err;
    console.log('Connected to postgres! Getting schemas...');

    client
      .query('SELECT table_schema,table_name FROM information_schema.tables;')
      .on('row', function(row) {
        console.log(JSON.stringify(row));
      });
  });


  var sender = req.body.From;
  var body = req.body.Body;

  var resp = '<Response><Message><Body>Thank you for registering. Find out more at BadBatchAlert.com</Body><Media>http://www.mike-legrand.com/BadBatchAlert/logoSmall150.png</Media></Message></Response>';
  res.status(200)
    .contentType('text/xml')
    .send(resp);
});
// [END receive_sms]

// Start the server
var server = app.listen(process.env.PORT || '8080', function () {
  console.log('App listening on port %s', server.address().port);
  console.log('Press Ctrl+C to quit.');
});
// [END app]
