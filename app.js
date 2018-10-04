'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const config = require('./config.json');
const webhookHandler = require('./Routes/WebHookRoutes');
const bodyParser = require('body-parser');
const fs = require('fs');


// create LINE SDK client
const client = new line.Client(config);

const app = express();
app.use(bodyParser.urlencoded({extended: true}))
var jsonParser = bodyParser.json()
app.use(bodyParser.json())

// Allow access to resources from any origin and any headers. As we want
// the agent to reach the webhook and not bother with CORS, they are fully
// permissive
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', '*')
  next()
})

app.get('/',function(req,res){
  res.send('welcome to my Poll Service');
});

// webhook callback
app.post('/webhook', webhookHandler);

var userAccountRouter = require('./Routes/UserAccountRoutes')();
app.use('/user',jsonParser, userAccountRouter);

var pollRouter = require('./Routes/PollRoutes')();
app.use('/poll',jsonParser, pollRouter);

var voteRouter = require('./Routes/VoteRoutes')();
app.use('/vote',jsonParser, voteRouter);

const port = config.port;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
