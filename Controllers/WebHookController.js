var WebHookController = function () {
  const _error = require('../Common/ErrorString')
  const userController = require('./UserAccountController')()
  const pollController = require('./PollController')()
  const voteController = require('./VoteController')()


  var registerUser = async (agent,inLineid,inCID,inName)=>{
    let name = inName;
    let cid = inCID;
    let lineid = inLineid;
    let password = "";
    let groupid = "";
    let memberid = "";
    let email = "";
    let sex = "";
    let birthdate = "";
    let role = "member";

    console.log("registerUser=>",inLineid, inCID, inName)
    let resultMessage = await userController._createUser(name, password, cid, lineid, groupid, memberid, email, sex, birthdate, role)
      .then((response)=>{
        //console.log("registerUser reponse=>",response);
        return _error(50)
      })
      .catch((error)=>{
        console.log("registerUser error=>",error);
        if(error.reason!==undefined && error.reason!==null && error.reason.length>0){
          return _error(105)
        }else if(error.resultstr!==undefined && error.resultstr!==null && error.resultstr.length>0){
          return error.resultstr
        }else {
          return _error(106)
        }
      })

    return resultMessage
  }

  var getUserByLineid = async (agent,inLineid)=>{
    let lineid = inLineid;

    console.log("getUserByLineid=>",lineid)
    let resultMessage = await userController._getUserByLineid(lineid)
      .then((response)=>{
        //console.log("_getUserByLineid reponse=>",response);
        //return "สวัสดีค่ะ" + response

        const getUserName = response => {
          try {
            return "สวัสดีค่ะ คุณ" + response.data.name
          } catch (e) {
            return "สวัสดีค่ะ"
          }
        }

        return getUserName(response)
      })
      .catch((error)=>{
        return "สวัสดีค่ะ เราอยากรบกวนท่านช่วยสละเวลาในการลงทะเบียนหน่อยนะค่ะ"
      })

    return resultMessage
  }

  let choiceMessageTemplate = {
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
  }

  var getQuestionListMessage = (questionList)=>{
    let messageTemplate = {
      type: "flex",
      altText: "This is the list of voting questions.",
      contents: {
        type: "bubble",
        body: {
          type: "box",
          layout: "vertical",
          spacing: "sm",
          contents: [
            {
              type: "text",
              text: "โหวตเรื่อง",
              weight: "bold",
              size: "xl"
            },
            {
              type: "text",
              text: "กรุณาเลือกหัวข้อที่จะโหวต",
              color: "#999999",
              flex: 1
            },
            {
              type: "separator"
            },
          ]
        }
      }
    }

    let resultMessage = JSON.parse(JSON.stringify(messageTemplate));
    questionList.map((questionObj)=>{
      let voteChoiceMessage = JSON.parse(JSON.stringify(choiceMessageTemplate))
      voteChoiceMessage.contents[0].action.label = questionObj.text
      voteChoiceMessage.contents[0].action.text = "เลือก" + questionObj.text + '#' + questionObj.qid
      resultMessage.contents.body.contents.push(voteChoiceMessage)
    })

    //console.log("resultMessage after =>",resultMessage);

    return resultMessage;
  }

  var getVoteResultListMessage = (questionList)=>{
    let messageTemplate = {
      type: "flex",
      altText: "This is the list of voting result.",
      contents: {
        type: "bubble",
        body: {
          type: "box",
          layout: "vertical",
          spacing: "sm",
          contents: [
            {
              type: "text",
              text: "ผลโหวต",
              weight: "bold",
              size: "xl"
            },
            {
              type: "text",
              text: "กรุณาเลือกหัวข้อที่ต้องการดูผล",
              color: "#999999",
              flex: 1
            },
            {
              type: "separator"
            },
          ]
        }
      }
    }

    let resultMessage = JSON.parse(JSON.stringify(messageTemplate));
    questionList.map((questionObj)=>{
      let voteChoiceMessage = JSON.parse(JSON.stringify(choiceMessageTemplate))
      voteChoiceMessage.contents[0].action.label = questionObj.text
      voteChoiceMessage.contents[0].action.text = "เลือก" + questionObj.text + '#' + questionObj.qid
      resultMessage.contents.body.contents.push(voteChoiceMessage)
    })

    //console.log("resultMessage after =>",resultMessage);

    return resultMessage;
  }

  var getQuestionMessage = (question)=>{
    let messageTemplate = {
      type: "flex",
      altText: "This is the voting questions.",
      contents: {
        type: "bubble",
        body: {
          type: "box",
          layout: "vertical",
          spacing: "sm",
          contents: [
            {
              type: "text",
              text: "เรื่อง : ",
              weight: "bold",
              size: "xl"
            },
            {
              type: "text",
              text: "กรุณากดโหวตข้อที่ต้องการ",
              color: "#999999",
              flex: 1
            },
            {
              type: "separator"
            },
          ]
        }
      }
    }

    let resultMessage = JSON.parse(JSON.stringify(messageTemplate));
    resultMessage.contents.body.contents[0].text += question.text;
    question.answerList.map((answerObj)=>{
      let voteChoiceMessage = JSON.parse(JSON.stringify(choiceMessageTemplate))
      voteChoiceMessage.contents[0].action.label = answerObj.text
      voteChoiceMessage.contents[0].action.text = "เลือก" + answerObj.text + '#' + answerObj.aid
      resultMessage.contents.body.contents.push(voteChoiceMessage)
    })

    //console.log("resultMessage after =>",resultMessage);

    return resultMessage;
  }

  var getReplyTextMessage = (text)=>{
    let textMessageTemplate = {
      "type": "text",
      "text": text
    }

    return textMessageTemplate
  }

  var checkValidQuestionData = (response)=>{
    try {
      return (response.data.questionList.length>0)
    }catch(error){
      return false;
    }
  }

  var getVotingQuestion = async (agent)=>{
    let resultMessage = await pollController._getQuestionOfStatus("voting")
      .then((response)=>{
        //console.log("_getQuestionOfStatus reponse=>",response);
        if(!checkValidQuestionData(response)){
          return getReplyTextMessage("ขณะนี้ยังไม่มีการเปิดหัวข้อให้โหวต")
        }

        // generate message
        return getQuestionListMessage(response.data.questionList)
      })
      .catch((error)=>{
        console.log("_getQuestionOfStatus error=>", error)
        return getReplyTextMessage("ระบบยังไม่เปิดให้มีการลงคะแนนโหวต");
      })

    return resultMessage
  }

  var checkValidFullQuestionData = (response)=>{
    try {
      let result = response.data;
      if(result.found &&
         result.text.length>0 &&
        result.answerList.length>0){

        result.answerList.forEach((answer)=>{
            if(answer.text.length<=0){
              return false
            }
        })
        return true
      }
    }catch (e) {
    }

    return false;
  }

  var getQuestion = async (agent, qid)=>{
    let resultMessage = await pollController._getQuestion(qid)
      .then((response)=>{

        //console.log("pollController._getQuestion response=>", response)

        if(!checkValidFullQuestionData(response)){
          return getReplyTextMessage("ไม่พบคำถามนี้อยู่ในระบบ")
        }

        // // generate message
        return getQuestionMessage(response.data)
        //return getReplyTextMessage("ไม่พบคำถามนี้อยู่ในระบบ");
      })
      .catch((error)=>{
        console.log("pollController._getQuestion=>", error)
        return getReplyTextMessage("ไม่พบคำถามนี้อยู่ในระบบ");
      })

    return resultMessage
  }

  var ChcekValidQuestion = (lineid,qText,aTexts,voteRight,viewRight,status)=>{
    if(qText===undefined || qText===null || qText.length<=0){
      return "ข้อความคำถามห้ามเป็นข้อความว่างนะค่ะ";
    }

    if(aTexts===undefined || aTexts===null || aTexts.length<2){
      return "ข้อความตัวเลือกห้ามเป็นข้อความว่างและต้องมีมากกว่า 2 ตัวเลือกค่ะ"
    }else{
      let valid = true
      for(let i=0; i<aTexts.length; i++){
        if(aTexts[i].length<=0){
          valid = false
          break;
        }
      }
      if(!valid){
        return "ข้อความตัวเลือกห้ามเป็นข้อความว่างและต้องมีมากกว่า 2 ตัวเลือกค่ะ";
      }
    }

    return ""
  }

  var createQuestion = async (lineid , question, answers, voteRight, viewRight, status)=>{

    let resultStr = ChcekValidQuestion(question,answers,voteRight,viewRight,status);
    if(resultStr.length!=0){
      return getReplyTextMessage(resultStr);
    }
    console.log(question, voteRight, viewRight, status)
    console.log("aTexts.length",answers.length)
    console.log("answers",answers)
    answers.forEach((answer)=>{
      console.log(answer)
    })

    let resultMessage = await pollController._createQuestion(question,voteRight,viewRight,status,answers)
      .then((response)=>{
        console.log("pollController._createQuestion response", response);
        // generate message
        return getReplyTextMessage("คำถามสร้างเสร็จเรียบร้อยแล้วค่ะ");
        //return getReplyTextMessage("ไม่พบคำถามนี้อยู่ในระบบ");
      })
      .catch((error)=>{
        console.log("pollController._createQuestion=>", error)
        return getReplyTextMessage("ไม่สามารถสร้างคำถามในระบบ");
      })

    return resultMessage
  }

  var createVote = async (agent, qid, aid, lineid)=>{
    let resultMessage = await voteController._createVote(qid,aid,lineid)
      .then((response)=>{
        console.log("voteController._createVote result =>",response)
        if(response.resultCode===0){
          console.log("1")
          return getReplyTextMessage("การโหวตสำเร็จแล้วค่ะ ขอบคุณค่ะ");
        }else{
          console.log("2")
          if(response.resultstr!==undefined && response.resultstr!==null && response.resultstr.length>0){
            console.log("2.1")
            return getReplyTextMessage("ขอโทษค่ะการโหวตไม่สำเร็จเนื่องจากพบปัญหาคือ ",response.resultstr);
          }else {
            console.log("2.2")
            return getReplyTextMessage("ขอโทษค่ะพบว่าระบบภายในมีปัญญา กรุณาติดต่อแอทมินหรือกลับเข้ามาโหวตใหม่อีกค่ะ");
          }
        }
      })
      .catch((error)=>{
        console.log("3")
        console.log("voteController._createVote=>", error)
        if(response.resultstr!==undefined && response.resultstr!==null && response.resultstr.length>0){
          return getReplyTextMessage("ขอโทษค่ะการโหวตไม่สำเร็จเนื่องจากพบปัญหาคือ ",response.resultstr);
        }else {
          return getReplyTextMessage("ขอโทษค่ะพบว่าระบบภายในมีปัญญา กรุณาติดต่อแอทมินหรือกลับเข้ามาโหวตใหม่อีกค่ะ");
        }
      })

    return resultMessage;
  }

  var getActiveQuestion = async (agent)=>{
    let resultMessage = await pollController._getQuestionOfStatus("active")
      .then((response)=>{
        //console.log("_getQuestionOfStatus reponse=>",response);
        if(!checkValidQuestionData(response)){
          return getReplyTextMessage("ไม่พบผลโหวต")
        }

        // generate message
        return getVoteResultListMessage(response.data.questionList)
      })
      .catch((error)=>{
        console.log("_getQuestionOfStatus error=>", error)
        return getReplyTextMessage("ระบบภายในมีปัญหาไม่สามารถดูผลการโหวตได้");
      })

    return resultMessage
  }

  let choiceResultMessage = {
    type: "box",
    layout: "horizontal",
    margin: "lg",
    spacing: "sm",
    contents: [
      {
        type: "text",
        text: "flex=1",
        flex: 7,
        gravity: "center"
      },
      {
        type: "text",
        text: "flex=1",
        flex: 1,
        gravity: "center"
      }
    ]
  }

  let voteResultMessage = {
    type: "flex",
    altText: "this is a the vote's result message",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "text",
            text: "ผลโหวต",
            weight: "bold",
            size: "xl"
          },
          {
            type: "text",
            text: "เรื่อง : ",
            color: "#099999",
            flex: 1
          },
          {
            type: "separator"
          },
        ]
      }
    }
  }

  var showResult = async (agent, qid, lineid)=>{
    let resultMessage = await voteController._getVote(qid,lineid)
      .then((response)=>{
        //console.log("voteController._getVote=>",response)
        if(!response.found){
          return getReplyTextMessage("ขอโทษค่ะไม่สามารถดูผลโหวตได้เนื่องจากไม่พบคำถามนี้ในระบบ");
        }

        let resultMessage = JSON.parse(JSON.stringify(voteResultMessage))
        resultMessage.contents.body.contents[1].text += response.text

        response.answerList.map((answer)=>{
          let voteChoiceMessage = JSON.parse(JSON.stringify(choiceResultMessage))
          //let voteChoiceMessage = choiceResultMessage
          voteChoiceMessage.contents[0].text = answer.text
          voteChoiceMessage.contents[1].text = answer.voteCount.toString()
          resultMessage.contents.body.contents.push(voteChoiceMessage)
        })

        //voteResultMessage.contents.body.contents.push();

        return resultMessage;
      })
      .catch((error)=>{
        console.log("_getVote error=>", error)
        return getReplyTextMessage("ระบบภายในมีปัญหาไม่สามารถดูผลการโหวตได้");
      })

    return resultMessage
  }

  return ({
    registerUser: registerUser,
    getUserByLineId: getUserByLineid,
    getVotingQuestion: getVotingQuestion,
    getQuestion: getQuestion,
    createVote: createVote,
    getActiveQuestion: getActiveQuestion,
    showResult: showResult,
    createQuestion: createQuestion
  })


}

module.exports = WebHookController
