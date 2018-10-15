var VoteController = function () {
  const _error = require('../Common/ErrorString')
  let controllerMap = require('../Common/ControllerMap');

  console.log('======= Begin UserAccount W3')

  const fs = require('fs')
  const Web3 = require('web3')
  const Web3Utils = require('web3-utils')

  let source = fs.readFileSync('./Contacts/Vote.json')
  let abi = JSON.parse(source)

  //let contractAddress = '0xdb5e26868af4fff2cffd0e2463db32ce3d87229b'
  let contractAddress = '0x4bdb980485038ac9d12eaabfba7ff4fe2024a7a1'
  let accounts = ['0x14a9186d31a85f5494c9f367123abe4c77659b37', '0x8401623f3f4ea409cab1ca28b007fb18d03b39e8']
  let web3 = new Web3()
  
  web3.setProvider(new web3.providers.HttpProvider('http://localhost:8501'))
  let voteContract = new web3.eth.Contract(abi, contractAddress, {from: web3.eth.coinbase, gasPrice: '4700000'})
  if (!voteContract) {
    throw('Error: Contract equal null.')
  }
  console.log("web3.eth.coinbase=>",web3.eth.coinbase, " accounts[0]=>",accounts[0]);
  //console.log("contract.methods=>",voteContract.methods);

  var _getVote = (qid,lineid) => {
    var resultQuestion = {}

    var operation = (resolve, reject) => {
      let pollController = controllerMap.getController(controllerMap.getPollControllerId());
      pollController._getQuestion(qid)
        .then((response) => {
          //console.log('_getQuestion result=>', response)

          if (response.resultCode != 0 || response.data === undefined || response.data === null || !response.data.found) {
            let resultQuestion = {
              found: false,
              resultCode: 0,
              resultstr: "",
              data: response
            }
            return Promise.reject(resultQuestion)
          }
          resultQuestion = response.data

          let aidByte32List = [];
          resultQuestion.answerList.map((answer) => {
            aidByte32List.push(web3.utils.utf8ToHex(answer.aid))
          })
          //console.log("answer =>", aidByte32List)

          return voteContract.methods.getVote(aidByte32List).call({from: accounts[0]})
        })
        .then((response)=>{
          let numAnswer = resultQuestion.answerList.length

          resultQuestion.totalVote = 0
          resultQuestion.memberVote = 0
          resultQuestion.anonymousVote = 0
          for(let i=0; i<numAnswer; i++){
            let memberCount = parseInt(response.memberCount[i])
            let adminCount = parseInt(response.adminCount[i])
            let anonymousCount = parseInt(response.anonymousCount[i])

            let answerVoteCount = memberCount + adminCount + anonymousCount
            resultQuestion.answerList[i].voteCount = answerVoteCount
            resultQuestion.totalVote = parseInt(answerVoteCount) + parseInt(resultQuestion.totalVote)
            resultQuestion.memberVote = memberCount  + adminCount +  parseInt(resultQuestion.memberVote)
            resultQuestion.anonymousVote = anonymousCount + parseInt(resultQuestion.anonymousVote)

            //console.log("score**=>",resultQuestion.totalVote,resultQuestion.memberVote,resultQuestion.anonymousVote)
          }

          //console.log("resultQuestion",resultQuestion)
          return resolve(resultQuestion)
        })
        .catch((error) => {
          console.log('_getVote error=>',error)
          return reject(error)
        })
    }

    return new Promise(operation);
  }

  var getVote = function (req, res) {

    console.log("getVote")
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

    _getVote(qid)
      .then((response) => {
        res.status(200).send(response)
      })
      .catch((error) => {
        console.log('_getQuestion error=>', error)
        res.status(200).send(error)
      })

  }

  var _createVote = function (qid,aid,lineid) {
    var result = {
      lineid : lineid
    }
    var operation = (resolve, reject) => {

      let userController = controllerMap.getController(controllerMap.getUserAccountControllerId());
      userController._getUserByLineid(lineid)
        .then((response) => {
          //console.log("_getUserByLineid=>",response)
          result.found = response.found
          if(!response.found){
            // vote as anomymous
            console.log("_createVote: by anomymous")
            result.userAddress = ""
            result.role = ""
          }else{
           // vote as member
            console.log("_createVote: by ",result.role)
            result.userAddress = response.data.userAddress
            result.role = response.data.role
          }

          return web3.eth.personal.unlockAccount(accounts[0], 'teenueng35', 300)
        })
        .then((response) => {
          console.log('unlockAccount OK =>', response)
          let currentDateTime = new Date();
          console.log("qid=>",qid," ; ",web3.utils.utf8ToHex(qid))
          console.log("result=>",result)

          return voteContract.methods.createVote(
            web3.utils.utf8ToHex(qid),
            web3.utils.utf8ToHex(aid),
            web3.utils.utf8ToHex(result.lineid),
            web3.utils.utf8ToHex(result.role),
            currentDateTime.toUTCString()).send({from: accounts[0],gas: 1000000}, function(err, tx) {
            if (err) {
              console.log("error=>",err);
            }
            console.log("tx=>",tx)
          })
        })
        .then((response)=>{
          console.log("_createVote response=>",response)

          return resolve({
            resultCode: 0,
            resultstr: "",
            data: result
          })
        })
        .catch((error) => {
          console.log('_createVote error=>',error)
          return reject(error)
        })
    }

    return new Promise(operation);
  }

  var createVote = function (req, res) {

    console.log("createVote")
    let qid = req.body.qid
    let aid = req.body.aid
    let lineid = req.body.lineid

    if (qid === undefined || qid === null || qid.length <= 0 ||
        aid === undefined || aid === null || aid.length <= 0 ||
        lineid === undefined || lineid === null || lineid.length <= 0 ) {
        res.status(200).send({
          resultCode: 1,
          resultstr: _error(1),
          data: null,
        })
        return
    }

    _createVote(qid,aid,lineid)
     .then((response) => {
       res.status(200).send(response)
     })
     .catch((error) => {
         console.log('_createVote error=>', error)
         res.status(200).send(error)
     })
  }

  return ({
    createVote: createVote,
    getVote: getVote,
    _createVote: _createVote,
    _getVote: _getVote,
  })
}

module.exports = VoteController
