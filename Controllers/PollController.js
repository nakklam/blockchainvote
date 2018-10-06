var PollController = function () {
  const _error = require('../Common/ErrorString')

  console.log('======= Begin UserAccount W3')

  const fs = require('fs')
  const Web3 = require('web3')
  const Web3Utils = require('web3-utils')

  let source = fs.readFileSync('./Contacts/Poll.json')
  let abi = JSON.parse(source)

  let contractAddress = '0xb849e3def0c94b2a57fac8bcfc6ee9c53c9c3190'
  let accounts = ['0xa1f8ce35a36ad05740f3e1ed65457b7474ac56a2', '0x29712c53f7dcd420b584025fd7bc35e430755416']
  let web3 = new Web3()


  web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'))
  let pollContract = new web3.eth.Contract(abi, contractAddress, {from: web3.eth.coinbase, gasPrice: '4700000'})
  if (!pollContract) {
    throw('Error: Contract equal null.')
  }
  console.log("web3.eth.coinbase=>",web3.eth.coinbase, " accounts[0]=>",accounts[0]);
  //console.log("contract.methods=>",pollContract.methods);

  var _updateQuestion = function (text,voteRight,viewRight,status,answers) {
    console.log('begin _createQuestion')

    var resultQuestion = {
      answers:[]
    }
    var operation = (resolve, reject) => {
      console.log('unlock Account')

      web3.eth.personal.unlockAccount(accounts[0], 'teenueng35', 300)
        .then((response) => {
          console.log('unlockAccount OK =>', response)
          console.log("qid=> begin")
          let currentDateTime = new Date();
          resultQuestion.qid = currentDateTime.getTime().toString(16)
          console.log("qid=>",resultQuestion.qid," ; ",web3.utils.utf8ToHex(resultQuestion.qid))

          return pollContract.methods.createQuestion(
            web3.utils.utf8ToHex(resultQuestion.qid),
            text,
            web3.utils.utf8ToHex(voteRight),
            web3.utils.utf8ToHex(viewRight),
            web3.utils.utf8ToHex(status),
            0, // normal question
            currentDateTime.toUTCString()).send({from: accounts[0],gas: 1000000}, function(err, tx) {
            if (err) {
              console.log("error=>",err);
            }
            console.log("tx=>",tx)
          })
        })
        .then((response) => {
          console.log('createQuestion result=>', response)

          let currentDateTime = new Date()

          const promiseLoop = async n => {
            for (let i = 0; i < n; i++) {

              let aid = resultQuestion.qid + "-" + i
              resultQuestion.answers.push(aid);

              await pollContract.methods.addAnswer(
                web3.utils.utf8ToHex(resultQuestion.qid),
                web3.utils.utf8ToHex(aid),
                answers[i],
                currentDateTime.toUTCString()).send({from: accounts[0], gas: 1000000}, function (err, tx) {
                if (err) {
                  console.log("addAnswer error =>", err);
                }
                console.log("addAnswer tx=>", tx)
              })
            }
            return Promise.resolve(resultQuestion.answers);
          }

          return promiseLoop(answers.length)
        })
        .then((response)=>{
          console.log("All AddAnswer response=>",response)

          return resolve({
            resultCode: 0,
            resultstr: "",
            data: resultQuestion
          })
        })
        .catch((error) => {
          console.log('_createQuestion error=>',error)
          return reject(error)
        })
    }

    return new Promise(operation);
  }

  var updateQuestion = function (req, res) {

    console.log("updateQuestion")
    let qid = req.body.qid
    let text = req.body.text
    let voteRight = req.body.voteRight
    let viewRight = req.body.viewRight
    let status = req.body.status
    let answers = req.body.answers

    res.status(200).send({
      resultCode: 1,
      resultstr: _error(1),
      data: null,
    })

    /*if (qid === undefined || qid === null || qid.length <= 0) {
      res.status(200).send({
        resultCode: 1,
        resultstr: _error(1),
        data: null,
      })
      return
    }

    _updateQuestion(qid,text,voteRight,viewRight,status,answers)
      .then((response) => {
        res.status(200).send(response)
      })
      .catch((error) => {
        console.log('_createQuestion error=>', error)
        res.status(200).send(error)
      })*/
  }

  var _getQuestionOfStatus = (status) => {
    var resultQuestion = {}

    var operation = (resolve, reject) => {

      let statusBytes32 = web3.utils.utf8ToHex(status)
      console.log('begin _getQuestionOfStatus=>', statusBytes32)

      pollContract.methods.getQidOfStatus(statusBytes32).call({from: accounts[0]})
        .then((response) => {
          console.log('getQidOfStatus result=>', response)

          resultQuestion = {
            found : false,
            data: null
          }

          if(response.length<=0){
            return Promise.reject(resultQuestion);
          }


          resultQuestion.questionList = [];
          let numAnswers = response.length;
          console.log("numAnswers",numAnswers);
          for(let i=0; i<numAnswers; i++){
            resultQuestion.questionList.push({
              qid: web3.utils.hexToUtf8(response[i])
            });
          }

          const promiseLoop = async n => {
            console.log("promiseLoop=>",n)
            for (let i = 0; i < n; i++) {
              let qidHex = web3.utils.utf8ToHex(resultQuestion.questionList[i].qid);
              console.log("qidHex=>",qidHex);
              await pollContract.methods.getQuestion(qidHex).call({from: accounts[0]})
                .then((response)=>{
                  // console.log("response=>", "i ", response)
                  resultQuestion.questionList[i].text = response.text;
                })
            }
            return Promise.resolve(resultQuestion);
          }

          return promiseLoop(resultQuestion.questionList.length)
        })
        .then((response) => {
          console.log("pollContract.methods.getQidOfStatus=>", response)

          let result = {
            found : true,
            resultCode: 0,
            resultstr: "",
            data:response
          }

          return resolve(result)
        })
        .catch((error) => {
          console.log('_getQuestion error=>',error)
          return reject(error)
        })
    }

    return new Promise(operation);
  }

  var _getQuestion = (qid) => {
    var resultQuestion = {}

    var operation = (resolve, reject) => {

      let qidBytes32 = web3.utils.utf8ToHex(qid)
      console.log('begin _getQuestion=>', qidBytes32)

      pollContract.methods.getQuestion(qidBytes32).call({from: accounts[0]})
        .then((response) => {
          //console.log('getQuestion result=>', response)

          resultQuestion = {
            found : response.text.length>0,
            text : response.text,
            voteRight : web3.utils.hexToUtf8(response.voteRight),
            viewRight : web3.utils.hexToUtf8(response.viewRight),
            status : web3.utils.hexToUtf8(response.status),
            createTimestamp : response.createTimestamp,
            updateTimestamp : response.updateTimestamp
          }

          resultQuestion.answerList = [];
          let numAnswers = response.answerList.length;
          console.log("numAnswers",numAnswers);
          for(let i=0; i<numAnswers; i++){
            resultQuestion.answerList.push({
              aid: web3.utils.hexToUtf8(response.answerList[i])
            });
          }

          return Promise.resolve(resultQuestion)
        })
        .then((response) => {
          if (!response.found) {
            return resolve({
              resultCode: 200,
              resultstr: _error(200),
              data: null,
            })
          }
          const promiseLoop = async n => {
            //console.log("promiseLoop=>",n)
            for (let i = 0; i < n; i++) {
              let aidHex = web3.utils.utf8ToHex(resultQuestion.answerList[i].aid);
              //console.log("aidHex=>",aidHex);
              await pollContract.methods.getAnswer(aidHex).call({from: accounts[0]})
                .then((response)=>{
                  //console.log("response=>", "i ", response)
                  resultQuestion.answerList[i].text = response.text;
                  resultQuestion.answerList[i].createTimestamp = response.createTimestamp;
                  resultQuestion.answerList[i].updateTimestamp = response.updateTimestamp;
                })
            }
            return Promise.resolve(resultQuestion);
          }

          return promiseLoop(resultQuestion.answerList.length)
        })
        .then((response) => {

          let result = {
            resultCode: 0,
            resultstr: "",
            data:response
          }

          return resolve(result)
        })
        .catch((error) => {
          console.log('_getQuestion error=>',error)
          return reject(error)
        })
    }

    return new Promise(operation);
  }

  var getQuestion = function (req, res) {

    console.log("getQuestion")
    let qid = req.query.qid
    console.log("qid=>",qid);

    if (qid === undefined || qid === null || qid.length <= 0) {
      res.status(200).send({
        resultCode: 1,
        resultstr: _error(1),
        data: null,
      })
      return
    }

    _getQuestion(qid)
      .then((response) => {
        res.status(200).send(response)
      })
      .catch((error) => {
        console.log('_getQuestion error=>', error)
        res.status(200).send(error)
      })

  }

  var _createQuestion = function (text,voteRight,viewRight,status,answers) {
    console.log('begin _createQuestion')

    var resultQuestion = {
      answers:[]
    }
    var operation = (resolve, reject) => {
      console.log('unlock Account')
      web3.eth.personal.unlockAccount(accounts[0], 'teenueng35', 300)
        .then((response) => {
          console.log('unlockAccount OK =>', response)
          console.log("qid=> begin")
          let currentDateTime = new Date();
          resultQuestion.qid = currentDateTime.getTime().toString(16)
          console.log("qid=>",resultQuestion.qid," ; ",web3.utils.utf8ToHex(resultQuestion.qid))

          return pollContract.methods.createQuestion(
            web3.utils.utf8ToHex(resultQuestion.qid),
            text,
            web3.utils.utf8ToHex(voteRight),
            web3.utils.utf8ToHex(viewRight),
            web3.utils.utf8ToHex(status),
            0, // normal question
            currentDateTime.toUTCString()).send({from: accounts[0],gas: 1000000}, function(err, tx) {
            if (err) {
              console.log("error=>",err);
            }
            console.log("tx=>",tx)
          })
        })
        .then((response) => {
          console.log('createQuestion result=>', response)

          let currentDateTime = new Date()

          const promiseLoop = async n => {
            for (let i = 0; i < n; i++) {

              let aid = resultQuestion.qid + "-" + i
              resultQuestion.answers.push(aid);

              await pollContract.methods.addAnswer(
                web3.utils.utf8ToHex(resultQuestion.qid),
                web3.utils.utf8ToHex(aid),
                answers[i],
                currentDateTime.toUTCString()).send({from: accounts[0], gas: 1000000}, function (err, tx) {
                if (err) {
                  console.log("addAnswer error =>", err);
                }
                console.log("addAnswer tx=>", tx)
              })
            }
            return Promise.resolve(resultQuestion.answers);
          }

          return promiseLoop(answers.length)
        })
        .then((response)=>{
          console.log("All AddAnswer response=>",response)

          return resolve({
            resultCode: 0,
            resultstr: "",
            data: resultQuestion
          })
        })
        .catch((error) => {
          console.log('_createQuestion error=>',error)
          return reject(error)
        })
    }

    return new Promise(operation);
  }

  var createQuestion = function (req, res) {

    console.log("createQuestion")
    let text = req.body.text
    let voteRight = req.body.voteRight
    let viewRight = req.body.viewRight
    let status = req.body.status
    let answers = req.body.answers

    if (text === undefined || text === null || text.length <= 0 ||
      voteRight === undefined || voteRight === null || voteRight.length <= 0 ||
      viewRight === undefined || viewRight === null || viewRight.length <= 0 ||
      status === undefined || status === null || status.length <= 0 ||
      answers === undefined || answers === null || answers.length <= 0 ) {
        res.status(200).send({
          resultCode: 1,
          resultstr: _error(1),
          data: null,
        })
        return
    }

    _createQuestion(text,voteRight,viewRight,status,answers)
     .then((response) => {
       res.status(200).send(response)
     })
     .catch((error) => {
         console.log('_createQuestion error=>', error)
         res.status(200).send(error)
     })

  }

  return ({
    createQuestion: createQuestion,
    getQuestion: getQuestion,
    updateQuestion: updateQuestion,
    _getQuestionOfStatus: _getQuestionOfStatus,
    _getQuestion: _getQuestion,
    _createQuestion: _createQuestion,
  })
}

module.exports = PollController
