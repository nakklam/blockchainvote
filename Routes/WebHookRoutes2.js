const line = require('@line/bot-sdk');
const { WebhookClient, Payload, Image, Card, Suggestion } = require('dialogflow-fulfillment')

const config = require('../config.json');
const client = new line.Client(config);
const menuAPI = require('../Utilities/LineRichMenuAPI');


const { LineClient } = require('messaging-api-line');
const clientObj =LineClient.connect({
  accessToken: "izECD2yKr/y46AWQ10SrELg9WzdQyJ1BVKeSWqhgrhyf/tTHCkN/J7LU0zYurTP6kt5sd9NYc9qMa5vmXcWRyGusZ+JRKvvzyT7/wDJSyLZC429H8cBMga+7M7isQb2ZLBakLSaKGv/J5z5mlwiU/QdB04t89/1O/w1cDnyilFU=",
  channelSecret: "89c3200751a58baf5cd183b9bd9a686a",
});

function handleText(message, userId, replyToken) {

  let triggerMsg = message.text.toLowerCase();
  if(triggerMsg==='สมัครสมาชิก'){
    return handleRegisterMenu(replyToken,userId)
  }else if(triggerMsg==='โหวต'){
    return handleVoteMenu(replyToken,userId)
  }

  return replyText(replyToken, message.text);
}

function handleImage(message, replyToken) {
  return replyText(replyToken, 'Got Image');
}

function handleVideo(message, replyToken) {
  return replyText(replyToken, 'Got Video');
}

function handleAudio(message, replyToken) {
  return replyText(replyToken, 'Got Audio');
}

function handleLocation(message, replyToken) {
  return replyText(replyToken, 'Got Location');
}

function handleSticker(message, replyToken) {
  return replyText(replyToken, 'Got Sticker');
}

// simple reply function
/*const replyText = (token, texts) => {
  texts = Array.isArray(texts) ? texts : [texts];
  return client.replyMessage(
    token,
    texts.map((text) => ({ type: 'text', text }))
  );
};
*/

const handleRegisterMenu = (token,userId) => {
  let text = "กรุณาระบุเลขบัตรประชาชน 13 หลักด้วยค่ะ"
  return clientObj.replyText(token, text).catch(error => {
    console.log(error); // formatted error message
    console.log(error.stack); // error stack trace
    console.log(error.config); // axios request config
    console.log(error.request); // HTTP request
    console.log(error.response); // HTTP response
  });
}

const handleVoteMenu = (token,userId) => {

  let flexContent = {
    "type": "bubble",
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        {
          "type": "text",
          "text": "โหวตเรื่อง",
          "weight": "bold",
          "size": "xl"
        },
        {
          "type": "text",
          "text": "กรุณาเลือกเรื่องที่ต้องการโหวต",
          "color": "#999999",
          "size": "sm",
          "flex": 1
        },
        {
          "type": "box",
          "layout": "vertical",
          "margin": "lg",
          "spacing": "sm",
          "contents": [
            {
              "type": "button",
              "style": "primary",
              "height": "sm",
              "action": {
                "type": "message",
                "label": "เลือกตั้งเลขาธิการพรรค",
                "text": "เลือก 1"
              }
            },
            {
              "type": "button",
              "style": "primary",
              "height": "sm",
              "action": {
                "type": "message",
                "label": "นโยบายการทำงาน",
                "text": "เลือก 2"
              }
            }
          ]
        }
      ]
    }
  }

  return clientObj.pushFlex(userId, 'this is a flex', flexContent).catch(error => {
    console.log(error); // formatted error message
    console.log(error.stack); // error stack trace
    console.log(error.config); // axios request config
    console.log(error.request); // HTTP request
    console.log(error.response); // HTTP response
  });
}

const replyText = (token, text) => {
  return clientObj.replyText(token, text).catch(error => {
    console.log(error); // formatted error message
    console.log(error.stack); // error stack trace
    console.log(error.config); // axios request config
    console.log(error.request); // HTTP request
    console.log(error.response); // HTTP response
  });
};

function handleEvent(event) {
  console.log('event', event);
  // check verify webhook event
  if (event.replyToken === '00000000000000000000000000000000' ||
    event.replyToken === 'ffffffffffffffffffffffffffffffff') {
    return;
  }

  let userId = event.source.userId;
  switch (event.type) {
    case 'message':
      const message = event.message;
      switch (message.type) {
        case 'text':
          return handleText(message, userId, event.replyToken);
        case 'image':
          return handleImage(message, userId, event.replyToken);
        case 'video':
          return handleVideo(message, userId, event.replyToken);
        case 'audio':
          return handleAudio(message, userId, event.replyToken);
        case 'location':
          return handleLocation(message, userId, event.replyToken);
        case 'sticker':
          return handleSticker(message, userId, event.replyToken);
        default:
          throw new Error(`Unknown message: ${JSON.stringify(message)}`);
      }

    case 'follow':
      //return replyText(event.replyToken, 'Got followed event');
      return console.log(`Got followed event: ${JSON.stringify(event)}`);

    case 'unfollow':
      return console.log(`Unfollowed this bot: ${JSON.stringify(event)}`);

    case 'join':
      //return replyText(event.replyToken, `Joined ${event.source.type}`);
      return console.log(`Joined: ${JSON.stringify(event)}`);

    case 'leave':
      return console.log(`Left: ${JSON.stringify(event)}`);

    case 'postback':
      let data = event.postback.data;
      return replyText(event.replyToken, `Got postback: ${data}`);

    case 'beacon':
      const dm = `${Buffer.from(event.beacon.dm || '', 'hex').toString('utf8')}`;
      return replyText(event.replyToken, `${event.beacon.type} beacon hwid : ${event.beacon.hwid} with device message = ${dm}`);

    default:
      throw new Error(`Unknown event: ${JSON.stringify(event)}`);
  }
}

/*const webhook = (req, res) => {
  // req.body.events should be an array of events

  console.log(`begin webhook`);
  if (!Array.isArray(req.body.events)) {
    return res.status(500).end();
  }

  console.log(`User id: ${req.body.events[0].source.userId}`);
  // handle events separately
  Promise.all(req.body.events.map(handleEvent))
    .then(() => res.end())
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
};*/

const getUserId = request => {
  try {
    return request.body.originalDetectIntentRequest.payload.data.source.userId
  } catch (e) {
    return null
  }
}

const getQueryText = request => {
  try {
    return request.body.queryResult.queryText
  } catch (e) {
    return null
  }
}

const getLanguageCode = request => {
  try {
    return request.body.queryResult.languageCode
  } catch (e) {
    return null
  }
}

const controller = require('../Controllers/WebHookController')


const webhook = (request, response) => {
  // req.body.events should be an array of events

  // console.log('POST received');
  //console.log(req);
  //console.log(JSON.stringify(req.body));
  //console.log(JSON.stringify(req.action));

  const agent = new WebhookClient({request: request, response: response})

  //console.log('Dialogflow Request headers: ' + JSON.stringify(req.headers))
  //console.log('Dialogflow Request body: ' + JSON.stringify(req.body))
  agent.languageCode = getLanguageCode(request)
  console.log(`languageCode : ${agent.languageCode}`)

  agent.userId = getUserId(request)
  console.log(`userId : ${agent.userId}`)

  agent.queryText = getQueryText(request)
  console.log(`agent.queryText : ${agent.queryText}`)

  const req = {
    requestSource: agent.requestSource,
    locale: agent.locale,
    action: agent.action,
    session: agent.session,
    parameters: agent.parameters,
    senderId: agent.senderId,
    userId: agent.userId,
    languageCode: agent.languageCode,
    queryText: agent.queryText,
  }

  console.log(`req : ${JSON.stringify(req)}`)
  //console.log(`request :  `, request)
  // let signature = req.get('X-LINE-Signature');
  // let rawBody = req.rawBody;
  // let hash = crypto.createHmac('sha256', config.channelSecret).update(
  //   rawBody).digest('base64');
  //
  // if (hash !== signature) {
  //   this.log("Unauthorized request");
  //   return res.status(401).send('Wrong request signature');
  // }

  /*console.log(`begin webhook`);
  if (!Array.isArray(request.body.events)) {
    return res.status(500).end();
  }

  console.log(`User id: ${req.body.events[0].source.userId}`);
  // handle events separately
  Promise.all(req.body.events.map(handleEvent))
    .then(() => res.end())
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });*/

  //controller.handleMessage(request, response);


  async function intentList (agent) {
    const req = {
      requestSource: agent.requestSource,
      locale: agent.locale,
      action: agent.action,
      session: agent.session,
      parameters: agent.parameters,
      senderId: agent.senderId,
      userId: agent.userId,
      languageCode: agent.languageCode,
      queryText: agent.queryText,
    }

    console.log(`req : ${JSON.stringify(req)}`)

    let flexContent2 = {
      "type": "template",
      "altText": "This is a buttons template",
      "template": {
        "type": "buttons",
        "thumbnailImageUrl": "https://images.justlanded.com/event_images/Tets/photo/events_original_45195_42919.jpg",
        "imageAspectRatio": "rectangle",
        "imageSize": "cover",
        "imageBackgroundColor": "#FFFFFF",
        "title": "Menu",
        "text": "Please select",
        "defaultAction": {
          "type": "uri",
          "label": "View detail",
          "uri": "http://example.com/page/123"
        },
        "actions": [
          {
            "type": "postback",
            "label": "Buy",
            "data": "action=buy&itemid=123"
          },
          {
            "type": "postback",
            "label": "Add to cart",
            "data": "action=add&itemid=123"
          },
          {
            "type": "uri",
            "label": "View detail",
            "uri": "http://example.com/page/123"
          }
        ]
      }
    }

    let flexContent3 = {
      "type": "template",
      "altText": "This is a buttons template",
      "template": {
        "type": "buttons",
        "thumbnailImageUrl": "https://images.justlanded.com/event_images/Tets/photo/events_original_45195_42919.jpg",
        "imageAspectRatio": "rectangle",
        "imageSize": "cover",
        "imageBackgroundColor": "#FFFFFF",
        "title": "Menu",
        "text": "Please select",
        "defaultAction": {
          "type": "uri",
          "label": "View detail",
          "uri": "http://example.com/page/123"
        },
        "actions": [
          {
            "type": "postback",
            "label": "Buy",
            "data": "action=buy&itemid=123"
          },
          {
            "type": "postback",
            "label": "Add to cart",
            "data": "action=add&itemid=123"
          },
          {
            "type": "uri",
            "label": "View detail",
            "uri": "http://example.com/page/123"
          }
        ]
      }
    }

    let flexContent4 = {
      "type": "template",
      "altText": "this is a buttons template",
      "template": {
        "type": "buttons",
        "actions": [
          {
            "type": "message",
            "label": "Action 1",
            "text": "Action 1"
          },
          {
            "type": "message",
            "label": "Action 2",
            "text": "Action 2"
          }
        ],
        "title": "กรุณาเลือกหัวข้อที่จะโหวต",
        "text": "โหวตเรื่อง"
      }
    }

    let flexContent = {
      "type": "flex",
      "altText": "This is a Flex Message",
      "body": {
        "type": "box",
        "layout": "vertical",
        "contents": [
          {
            "type": "text",
            "text": "โหวตเรื่อง",
            "weight": "bold",
            "size": "xl"
          },
          {
            "type": "text",
            "text": "กรุณาเลือกเรื่องที่ต้องการโหวต",
            "color": "#999999",
            "size": "sm",
            "flex": 1
          },
          {
            "type": "box",
            "layout": "vertical",
            "margin": "lg",
            "spacing": "sm",
            "contents": [
              {
                "type": "button",
                "style": "primary",
                "height": "sm",
                "action": {
                  "type": "message",
                  "label": "เลือกตั้งเลขาธิการพรรค",
                  "text": "เลือก 1"
                }
              },
              {
                "type": "button",
                "style": "primary",
                "height": "sm",
                "action": {
                  "type": "message",
                  "label": "นโยบายการทำงาน",
                  "text": "เลือก 2"
                }
              }
            ]
          }
        ]
      }
    }

    console.log("send message back")
    let lineMessage = {
      "type": "text",
      "text": "นี่เป็นการทดสอบการส่งจาก Line"
    }

    var payload = new Payload(agent.LINE, flexContent5, {
      sendAsMessage: true
    });
    agent.add(payload);
  }

  function welcome (agent) {
    agent.add(`Welcome!`)
  }

  function fallback (agent) {
    agent.add(`I didn't understand`)
    agent.add(`I'm sorry, can you try again?`)
  }

  function yourFunctionHandler(agent) {
    agent.add(`This message is from Dialogflow's Cloud Functions for Firebase inline editor!`);
    agent.add(new Card({
        title: `Title: this is a card title`,
        imageUrl: 'https://dialogflow.com/images/api_home_laptop.svg',
        text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
        buttonText: 'This is a button',
        buttonUrl: 'https://docs.dialogflow.com/'
      })
    );
    agent.add(new Suggestion(`Quick Reply`));
    agent.add(new Suggestion(`Suggestion`));
    agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
  }

  let intentMap = new Map()
  intentMap.set('Default Welcome Intent', welcome)
  intentMap.set('Default Fallback Intent', fallback)
  // Register.Register-custom.Register-CitizenID-custom.Register-CitizenID-Name-yes


  intentMap.set(null, intentList)
  agent.handleRequest(intentMap)
};

module.exports = webhook;
