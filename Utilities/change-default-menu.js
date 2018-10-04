const config = require('../config.json');
const line = require('@line/bot-sdk');
const menuAPI = require('./LineRichMenuAPI');
const fs = require('fs');

// create LINE SDK client
const client = new line.Client(config);

// clear all default menu
client.getRichMenuList()
  .then(output => Promise.all(output.map(richMenuItem => {
    console.log("Rich Menu ID => ",richMenuItem.richMenuId)
    client.deleteRichMenu(richMenuItem.richMenuId)
  })));

var richMenuId = client.createRichMenu({
  "size": {
    "width": 2500,
    "height": 843
  },
  "selected": true,
  "name": "Default Menu",
  "chatBarText": "click here!",
  "areas": [
    {
      "bounds": {
        "x": 45,
        "y": 33,
        "width": 751,
        "height": 772
      },
      "action": {
        "type": "message",
        "text": "สมัครสมาชิก"
      }
    },
    {
      "bounds": {
        "x": 866,
        "y": 37,
        "width": 762,
        "height": 766
      },
      "action": {
        "type": "message",
        "text": "โหวต"
      }
    },
    {
      "bounds": {
        "x": 1704,
        "y": 33,
        "width": 759,
        "height": 780
      },
      "action": {
        "type": "message",
        "text": "ดูผลโหวต"
      }
    }
  ]
})
  .then((richMenuId) => {
    console.log("New Rich Menu ID =>",richMenuId);

    // Step 2: Upload image to Step 1's rich menu id
    client.setRichMenuImage(richMenuId, fs.createReadStream('./resources/default-menu.jpg')).then((response)=>{
      console.log("response=>",response);
      menuAPI.setMenuToAllUser(richMenuId);
    }).catch((error)=>{
      console.log("error=>",error);
    })


    console.log("End Change the Default Menu.");

  });
