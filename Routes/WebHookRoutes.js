const { WebhookClient, Payload, Image, Card, Suggestion } = require('dialogflow-fulfillment')
const WebHookController = require('../Controllers/WebHookController')()

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

const getIntentDisplayName = request => {
  try {
    return request.body.queryResult.intent.displayName
  } catch (e) {
    return null
  }
}

function handleReqister(agent){
  var registerIntent = async (agent) => {
    console.log("test line id=>",agent.userId.length)
    let lineid = agent.userId.length > 32 ? agent.userId.substring(0, 32) : agent.userId
    //cid = agent.parameters.cid
    //name = agent.parameters.name
    let cid = agent.parameters.cid
    let name = agent.parameters.name
    //let cid = '9999'
    //let name = 'test test'
    let resultMessage = await WebHookController.registerUser(agent, lineid, cid, name)
    let handleRegisterMessage = {
      "type": "text",
      "text": resultMessage
    }
    //console.log("handleRegisterMessage=>",handleRegisterMessage)

    var payload = new Payload(agent.LINE, handleRegisterMessage, {
      sendAsMessage: true
    });
    agent.add(payload);
  }

  try {
    // check
    //console.log("agent.parameters.cid", agent.parameters.cid , "agent.parameters.name", agent.parameters.name)
    if(agent.parameters.cid.length>0 && agent.parameters.name.length>0){
      let intentMap = new Map()
      intentMap.set(null, registerIntent)
      agent.handleRequest(intentMap)
    }
  }catch (error) {
    console.log("handleReqister error=>",error)
  }
}

function handleGreeting (agent){
  var greetingIntent = async (agent) => {
    console.log("test line id=>",agent.userId.length)
    lineid = agent.userId.length > 32 ? agent.userId.substring(0, 32) : agent.userId

    let resultMessage = await WebHookController.getUserByLineId(agent, lineid)

    let handleRegisterMessage = {
      "type": "text",
      "text": resultMessage
    }

    console.log("handleRegisterMessage=>",handleRegisterMessage)

    var payload = new Payload(agent.LINE, handleRegisterMessage, {
      sendAsMessage: true
    });
    agent.add(payload);
  }

  try {
    let intentMap = new Map()
    intentMap.set(null, greetingIntent)
    agent.handleRequest(intentMap)
  }catch (error) {
    console.log("handleGreeting error=>",error)
  }
}

function handleVote(agent){
  var voteIntent = async (agent) => {
    //lineid = agent.userId.length > 32 ? agent.userId.substring(0, 32) : agent.userId

    let resultMessage = await WebHookController.getVotingQuestion(agent)
    console.log("handleGetVotingQuestion=>",resultMessage)

    var payload = new Payload(agent.LINE, resultMessage, {
      sendAsMessage: true
    });
    agent.add(payload);
  }

  try {
    let intentMap = new Map()
    intentMap.set(null, voteIntent)
    agent.handleRequest(intentMap)
  }catch (error) {
    console.log("handleVote error=>",error)
  }
}

/*async function handleGetQuestion (agent) {
  //let qid = "16629479fbb"
  let qid = "166294eeeae"
  //let qid = "1662b3b98f1"
  //let qid = "1662b3f0d3e"
  //let qid = "1662b4cb0b4"
  //let qid = "1662b5146a3"
  let resultMessage = await WebHookController.getQuestion(agent,qid)
  //console.log("handleGetQuestion=>",resultMessage)
  //console.log("handleGetQuestion 2=>",JSON.stringify(resultMessage))

  var payload = new Payload(agent.LINE, resultMessage, {
    sendAsMessage: true
  });
  agent.add(payload);
}*/

function handleGetVoteQuestion(agent){
  var getVoteQuestionIntent = async (agent) => {

    let question = agent.parameters.qid
    let splitResult = question.split("#")
    let qid = splitResult[splitResult.length-1].trim();
    //let qid = "166294eeeae"
    console.log("qid",qid)

    let resultMessage = await WebHookController.getQuestion(agent,qid)
    console.log("handleGetQuestion=>",resultMessage)

    var payload = new Payload(agent.LINE, resultMessage, {
      sendAsMessage: true
    });
    agent.add(payload);
  }

  try {
    //if(agent.parameters.qid.length>0 ) {
      let intentMap = new Map()
      intentMap.set(null, getVoteQuestionIntent)
      agent.handleRequest(intentMap)
    //}
  }catch (error) {
    console.log("handleVote error=>",error)
  }
}

function handleCreateVote(agent){
  var createVoteIntent = async (agent) => {
    let questionParam = agent.parameters.qid
    let qidSplitResult = questionParam.split("#")
    let qid = qidSplitResult[qidSplitResult.length-1].trim();

    let answerParam = agent.parameters.aid
    let answerSplitResult = answerParam.split("#")
    let aid = answerSplitResult[answerSplitResult.length-1].trim();

    let lineid = agent.userId.length > 32 ? agent.userId.substring(0, 32) : agent.userId

    //let qid = "166294eeeae"
    //let aid = "166294eeeae-1"

    console.log("voteChoiceIntent=> qid:", qid, "aid:", aid, "linid:", lineid)
    let resultMessage = await WebHookController.createVote(agent,qid,aid,lineid)
    console.log("handleCreateVote=>",resultMessage)

    var payload = new Payload(agent.LINE, resultMessage, {
      sendAsMessage: true
    });
    agent.add(payload);
  }

  try {
    //if(agent.parameters.answer.length>0 && agent.parameters.question.length>0 ) {
    let intentMap = new Map()
    intentMap.set(null, createVoteIntent)
    agent.handleRequest(intentMap)
    //}
  }catch (error) {
    console.log("handleVote error=>",error)
  }
}

function handleRequestResult(agent){
  var requestResultIntent = async (agent) => {
    //lineid = agent.userId.length > 32 ? agent.userId.substring(0, 32) : agent.userId

    let resultMessage = await WebHookController.getActiveQuestion(agent)
    //console.log("handleVoteResult=>",resultMessage)

    var payload = new Payload(agent.LINE, resultMessage, {
      sendAsMessage: true
    });
    agent.add(payload);
  }

  try {
    let intentMap = new Map()
    intentMap.set(null, requestResultIntent)
    agent.handleRequest(intentMap)
  }catch (error) {
    console.log("handleVote error=>",error)
  }
}

function handleTest(agent){
  var testIntent = async (agent) => {

    // let testMessage = {
    //   "type": "flex",
    //   "altText": "this is a flex message",
    //   "contents": {
    //     "type": "bubble",
    //     "body": {
    //       "type": "box",
    //       "layout": "vertical",
    //       "contents": [
    //         {
    //           "type": "text",
    //           "text": "ผลโหวต",
    //           "weight": "bold",
    //           "size": "xl"
    //         },
    //         {
    //           "type": "text",
    //           "text": "เรื่อง : นโยบายพลังงาน",
    //           "color": "#099999",
    //           "flex": 1
    //         },
    //         {
    //           "type": "separator"
    //         },
    //         {
    //           "type": "box",
    //           "layout": "horizontal",
    //           "margin": "lg",
    //           "spacing": "sm",
    //           "contents": [
    //             {
    //               "type": "text",
    //               "text": "flex=1",
    //               "flex": 1,
    //               "gravity": "center"
    //             },
    //             {
    //               "type": "text",
    //               "text": "flex=1",
    //               "flex": 1,
    //               "gravity": "center"
    //             }
    //           ]
    //         },
    //         {
    //           "type": "box",
    //           "layout": "horizontal",
    //           "margin": "lg",
    //           "spacing": "sm",
    //           "contents": [
    //             {
    //               "type": "text",
    //               "text": "flex=1",
    //               "flex": 1,
    //               "gravity": "center"
    //             },
    //             {
    //               "type": "text",
    //               "text": "flex=1",
    //               "flex": 1,
    //               "gravity": "center"
    //             }
    //           ]
    //         }
    //       ]
    //     }
    //   }
    // }

    let testMessage = {
      "type": "flex",
      "altText": "This is the list of voting questions.",
      "contents": {
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
              "text": "กรุณาเลือกหัวข้อที่จะโหวต",
              "color": "#999999",
              "flex": 1
            },
            {
              "type": "separator"
            },
            {
              "type": "box",
              "layout": "horizontal",
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
              ]
            },
            {
              "type": "box",
              "layout": "horizontal",
              "margin": "lg",
              "spacing": "sm",
              "contents": [
                {
                  "type": "button",
                  "style": "primary",
                  "height": "sm",
                  "action": {
                    "type": "message",
                    "label": "ต้องการให้มีการเลือกตั้งเมื่อไหร่",
                    "text": "เลือก 2"
                  }
                },
              ]
            }
          ]
        }
      }
    }

    var payload = new Payload(agent.LINE, testMessage, {
      sendAsMessage: true
    });
    agent.add(payload);
  }

  try {
    let intentMap = new Map()
    intentMap.set(null, testIntent)
    agent.handleRequest(intentMap)
  }catch (error) {
    console.log("handleVote error=>",error)
  }
}

function handleShowResult(agent){
  var showResultIntent = async (agent) => {

    let question = agent.parameters.qid
    let splitResult = question.split("#")
    let qid = splitResult[splitResult.length-1].trim();

    //let qid = "1662f46156f"
    let lineid = agent.userId.length > 32 ? agent.userId.substring(0, 32) : agent.userId

    let resultMessage = await WebHookController.showResult(agent,qid,lineid)

    //console.log("handleVoteResult=>",resultMessage)

    var payload = new Payload(agent.LINE, resultMessage, {
      sendAsMessage: true
    });
    agent.add(payload);
  }

  try {
    let intentMap = new Map()
    intentMap.set(null, showResultIntent)
    agent.handleRequest(intentMap)
  }catch (error) {
    console.log("handleVote error=>",error)
  }
}

function handleCreateQuestion(agent){
  var showResultIntent = async (agent) => {

    let text = agent.parameters.text
    let subtext = text.split("#")

    let question = subtext[0].trim()
    let answers = []
    let i;
    for (i=1; i<subtext.length; i++){
      let answer = subtext[i].trim()
      if(answer==='all' || answer==='admin' || answer==="member"){
        break;
      }
      answers.push(answer)
    }

    //let qid = "1662f46156f"
    let lineid = agent.userId.length > 32 ? agent.userId.substring(0, 32) : agent.userId
    let voteRight = "all"
    let viewRight = "all"
    let status = "voting"
    let resultMessage = await WebHookController.createQuestion(lineid, question, answers, voteRight, viewRight, status)

    //console.log("handleVoteResult=>",resultMessage)

    var payload = new Payload(agent.LINE, resultMessage, {
      sendAsMessage: true
    });
    agent.add(payload);
  }

  try {
    let intentMap = new Map()
    intentMap.set(null, showResultIntent)
    agent.handleRequest(intentMap)
  }catch (error) {
    console.log("handleVote error=>",error)
  }
}

const webhook = (request, response) => {
  const agent = new WebhookClient({request: request, response: response})
  //console.log(request)

  agent.languageCode = getLanguageCode(request)
  agent.userId = getUserId(request)
  agent.queryText = getQueryText(request)
  let intentName = getIntentDisplayName(request);

  if(intentName===undefined || intentName===null || intentName.length<=0){
    return;
  }
  //console.log("agent=>",agent)

  if(intentName==="Test"){
    console.log("intentName===Test")
    //handleTest(agent)
    //handleCreateQuestion(agent)
    //handleVote(agent)
  }else if(intentName==="Register - Citizen ID - Name - yes"){
    console.log("intentName===Register - Citizen ID - Name - yes")
    handleReqister(agent);
  }else if(intentName==="Greeting"){
    console.log("intentName===Greeting")
    handleGreeting(agent)
  }else if(intentName==="Vote"){
    console.log("intentName===Vote")
    handleVote(agent)
  }else if(intentName==="Vote - Question"){
    console.log("intentName===Vote - Question")
    handleGetVoteQuestion(agent)
  }else if(intentName==="Vote - Question - Answer") {
    console.log("intentName===Vote - Question - Answer")
    handleCreateVote(agent)
  }else if(intentName==="Result"){
    console.log("intentName===Result")
    handleRequestResult(agent)
  }else if(intentName==="Result - Question"){
    console.log("intentName===Result - Question")
    handleShowResult(agent)
  }else if(intentName==="Question - Text"){
    console.log("intentName===Result - Question")
    handleCreateQuestion(agent)
  }else{
    console.log("intentName else =>", intentName)
  }
}

module.exports = webhook;
