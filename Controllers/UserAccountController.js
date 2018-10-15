var UserAccountController = function () {
  const _error = require('../Common/ErrorString')

  console.log('======= Begin UserAccount W3')

  const fs = require('fs')
  const Web3 = require('web3')
  const Web3Utils = require('web3-utils')

  let source = fs.readFileSync('./Contacts/UserAccount.json')
  let abi = JSON.parse(source)

  //let contractAddress = '0x8d91f91a68b5397af79051de73898817b178b94f'
  let contractAddress = '0xa16f91dd92171e0002c21c635a35675ba3aeebfe'
  let accounts = ['0x14a9186d31a85f5494c9f367123abe4c77659b37', '0x8401623f3f4ea409cab1ca28b007fb18d03b39e8']
  let web3 = new Web3()


  web3.setProvider(new web3.providers.HttpProvider('http://localhost:8501'))
  let ucContract = new web3.eth.Contract(abi, contractAddress, {from: web3.eth.coinbase, gasPrice: '4700000'})
  if (!ucContract) {
    throw('Error: Contract equal null.')
  }
  console.log("web3.eth.coinbase=>",web3.eth.coinbase, " accounts[0]=>",accounts[0]);
  //console.log("contract.methods=>",ucContract.methods);

  var _updateByLineid = function (lineid,nameTitle, name, password, cid, groupid, memberid, email, sex, birthdate, role) {
    console.log('begin _updateByLineid')

    var foundUser = {};

    var operation = (resolve, reject) => {

      _getUserByLineid(lineid)
        .then((response) => {
          if(response.resultCode!==0){
            return Promise.reject(response)
          }

          foundUser = response.data;

          if(cid!==undefined && cid!==null && cid.length>0){
            foundUser.cid = cid;
            return _getUserByCid(foundUser.cid)
          }else{
            return Promise.resolve({
              resultCode: 102,
              resultstr: _error(102),
              data: null,
            })
          }
        })
        .then((response) => {
          console.log("result from get cid=>",response);
          if(response.resultCode===0 && response.data.found){
            // cid's used already
            return Promise.reject({
              resultCode: 104,
              resultstr: _error(104),
              data: null,
            })
          }

          console.log('unlock Account')
          return web3.eth.personal.unlockAccount(accounts[0], 'teenueng35', 300)
        })
        .then((response) => {
          console.log('unlockAccount OK =>', response)

          let currentDateTime = new Date();

          if(nameTitle!==undefined && nameTitle!==null){
            foundUser.nameTitle = nameTitle;
          }

          if(name!==undefined && name!==null){
            foundUser.name = name;
          }

          if(password!==undefined && password!==null){
            foundUser.password = password;
          }

          if(cid!==undefined && cid!==null && cid.length!==0){
            foundUser.cid = cid;
          }

          if(groupid!==undefined && groupid!==null){
            foundUser.groupid = groupid;
          }

          if(memberid!==undefined && memberid!==null){
            foundUser.memberid = memberid;
          }

          if(email!==undefined && email!==null){
            foundUser.email = email;
          }

          if(sex!==undefined && sex!==null){
            foundUser.sex = sex;
          }

          if(birthdate!==undefined && birthdate!==null){
            foundUser.birthdate = birthdate;
          }

          if(role!==undefined && role!==null){
            foundUser.role = role;
          }

          console.log("update user=>",foundUser);

          foundUser.cid = web3.utils.utf8ToHex(foundUser.cid);
          foundUser.groupid = web3.utils.utf8ToHex(foundUser.groupid);
          foundUser.memberid = web3.utils.utf8ToHex(foundUser.memberid);
          foundUser.sex = web3.utils.utf8ToHex(foundUser.sex);
          foundUser.role = web3.utils.utf8ToHex(foundUser.role);


          return ucContract.methods.updateUserByLineId(
            web3.utils.utf8ToHex(lineid),
            foundUser.name,
            foundUser.password,
            web3.utils.utf8ToHex(foundUser.cid),
            web3.utils.utf8ToHex(foundUser.groupid),
            web3.utils.utf8ToHex(foundUser.memberid),
            foundUser.email,
            web3.utils.utf8ToHex(foundUser.sex),
            foundUser.birthdate,
            web3.utils.utf8ToHex(foundUser.role),
            currentDateTime.toUTCString()).send({from: accounts[0],gas: 1000000}, function(err, tx) {
            if (err) {
              console.log("error=>",err);
            }
            console.log("tx=>",tx)
          })
        })
        .then((response) => {
          console.log('_updateByLineid result=>', response)

          return resolve({
            resultCode: 0,
            resultstr: "",
            data: {
              status : 'updated'
            },
          })
        })
        .catch((error) => {
          console.log('_updateByLineid=>',error)
          return reject(error)
        })
    }

    return new Promise(operation);
  }

  var _getUserByCid = function (cid) {
    console.log('begin _getUserByCid')

    var resultUser = {};

    var operation = (resolve, reject) => {
      console.log('begin _getUserByCid=>')

      ucContract.methods.getUserByCID(web3.utils.utf8ToHex(cid)).call({from: accounts[0]})
        .then((response) => {
          console.log('getUserByCID result=>', response)

          if(!response.found){
            return Promise.resolve(response)
          }

          resultUser = {
            found : response.found,
            userAddress: response.userAddress,
            name : response.name,
            password : response.password,
            lineid : web3.utils.hexToUtf8(response.lineid),
            memberid : web3.utils.hexToUtf8(response.memberid),
            role : web3.utils.hexToUtf8(response.role)
          }

          return ucContract.methods.getUserDetailByLineID(web3.utils.utf8ToHex(resultUser.lineid)).call({from: accounts[0]})
        })
        .then((response) => {

          if(!response.found){
            return resolve({
              found: false,
              resultCode: 102,
              resultstr: _error(102),
              data: null,
            })
          }

          resultUser.nameTitle = web3.utils.hexToUtf8(response.nameTitle);
          resultUser.groupid = web3.utils.hexToUtf8(response.groupid);
          resultUser.email = response.email;
          resultUser.sex = web3.utils.hexToUtf8(response.sex);
          resultUser.birthdate = response.birthdate;
          resultUser.createTimestamp = response.createTimestamp;
          resultUser.updateTimestamp = response.updateTimestamp;

          let result = {
            found: true,
            resultCode: 0,
            resultstr: "",
            data:resultUser
          }

          return resolve(result)
        })
        .catch((error) => {
          error.found = false
          console.log('_getUserByCid error=>',error)
          return reject(error)
        })
    }

    return new Promise(operation);
  }

  var _getUserByLineid = function (lineid) {
    var resultUser = {};

    var operation = (resolve, reject) => {
      console.log('begin _getUserByLineid')

      var lineIdByte32 = web3.utils.utf8ToHex(lineid);
      console.log("line id=>",lineIdByte32);

      ucContract.methods.getUserByLineID(lineIdByte32).call({from: accounts[0]})
        .then((response) => {
          console.log('ucContract.methods.getUserByLineID result=>', response)

          resultUser = {
            found: response.found,
            userAddress: response.userAddress,
            name: response.name,
            password: response.password,
            cid: web3.utils.hexToUtf8(response.cid),
            memberid: web3.utils.hexToUtf8(response.memberid),
            role: web3.utils.hexToUtf8(response.role)
          }

          if(!resultUser.found){
            return Promise.resolve(resultUser)
          }

          return ucContract.methods.getUserDetailByLineID(lineIdByte32).call({from: accounts[0]})
        })
        .then((response) => {

          console.log("then((response)=>",response);
          if(!response.found){
            return resolve({
              found: false,
              resultCode: 102,
              resultstr: _error(102),
              data: null,
            })
          }

          resultUser.nameTitle = web3.utils.hexToUtf8(response.nameTitle);
          resultUser.groupid = web3.utils.hexToUtf8(response.groupid);
          resultUser.email = response.email;
          resultUser.sex = web3.utils.hexToUtf8(response.sex);
          resultUser.birthdate = response.birthdate;
          resultUser.createTimestamp = response.createTimestamp;
          resultUser.updateTimestamp = response.updateTimestamp;

          let result = {
            found: true,
            resultCode: 0,
            resultstr: "",
            data: resultUser
          }

          return resolve(result)
        })
        .catch((error) => {
          error.found = false
          console.log('_getUserByLineid error=>',error)
          return reject(error)
        })
    }

    return new Promise(operation);
  }

  var _createUser = function (name, password, cid, lineid, groupid, memberid, email, sex, birthdate, role) {
    console.log('begin _createUser')

    var createUser = {}
    var operation = (resolve, reject) => {

      _getUserByLineid(lineid)
        .then((response) => {
          /*if(response.found){
            return Promise.reject({
              resultCode: 103,
              resultstr: _error(103),
              data: null,
            })
          }*/

          return _getUserByCid(cid)
        })
        .then((response) => {
          /*if(response.found){
            return Promise.reject({
              resultCode: 104,
              resultstr: _error(104),
              data: null,
            })
          }*/

          console.log('unlock Account')
          return web3.eth.personal.unlockAccount(accounts[0], 'teenueng35', 300)
        })
        .then((response) => {
          console.log('unlockAccount OK =>', response)
          console.log('create account => web3.eth.personal.newAccount')

          // let address = web3.eth.personal.newAccount('password');
          //return address
          createUser.userAddress = accounts[0];
          return Promise.resolve(createUser.userAddress)
        })
        .then((address) => {
          console.log('result address=>', address)
          let currentDateTime = new Date();

          if(name===undefined || name===null){
            name = "";
          }

          if(password===undefined || password===null){
            password = "";
          }

          if(lineid===undefined || lineid===null){
            lineid = "";
          }

          if(groupid===undefined || groupid===null){
            groupid = "";
          }

          if(memberid===undefined || memberid===null){
            memberid = "";
          }

          if(email===undefined || email===null){
            email = "";
          }

          if(sex===undefined || sex===null){
            sex = 'U';
          }

          if(birthdate===undefined || birthdate===null){
            birthdate = "";
          }

          if(role===undefined || role===null){
            role = "";
          }

          console.log("ucContract.methods.createUser **** =>", name, cid)

          return ucContract.methods.createUser(
            address,
            name,
            password,
            web3.utils.utf8ToHex(cid),
            web3.utils.utf8ToHex(lineid),
            web3.utils.utf8ToHex(groupid),
            web3.utils.utf8ToHex(memberid),
            email,
            web3.utils.utf8ToHex(sex),
            birthdate,
            web3.utils.utf8ToHex(role),
            currentDateTime.toUTCString()).send({from: accounts[0],gas: 1000000}, function(err, tx) {
              if (err) {
                console.log("error=>",err);
              }
              console.log("tx=>",tx)
            })
        })
        .then((response) => {
          console.log('createUser result=>', response)
          return resolve({
            resultCode: 0,
            resultstr: "",
            data: createUser
          })
        })
        .catch((error) => {
          //console.log('_createUser error=>',error)
          return reject(error)
        })
    }

    return new Promise(operation);
  }

  var updateByLineid = function (req, res) {
    let lineid = req.body.lineid
    let nameTitle = req.body.nameTitle
    let name = req.body.name
    let password = req.body.password
    let cid = req.body.cid
    let groupid = req.body.groupid; // id of Line's group
    let memberid = req.body.memberid;
    let email = req.body.email;
    let sex = req.body.sex;
    let birthdate = req.body.birthdate;
    let role = req.body.role;

    if (lineid === undefined || lineid.length <= 0) {
      res.status(200).send({
        resultCode: 1,
        resultstr: _error(1),
        data: null,
      })
      return
    }

    _updateByLineid(lineid, nameTitle, name, password, cid, groupid, memberid, email, sex, birthdate, role)
      .then((response) => {
        res.status(200).send(response)
      })
      .catch((error) => {
        console.log('_updateByLineid error=>', error)
        res.status(200).send({
          resultCode: 2,
          resultstr: error,
          data: {}
        })
      })
  }

  var getUserByCid = function (req, res) {
    let cid = req.query.cid

    if (cid === undefined || cid.length <= 0) {
      res.status(200).send({
        resultCode: 1,
        resultstr: _error(1),
        data: null,
      })
      return
    }

    _getUserByCid(cid)
      .then((response) => {
        res.status(200).send(response)
      })
      .catch((error) => {
        console.log('getUserByCid error=>', error)
        res.status(200).send({
          resultCode: 2,
          resultstr: error,
          data: {}
        })
      })
  }

  var getUserByLineid = function (req, res) {
    let lineid = req.query.lineid

    if (lineid === undefined || lineid.length <= 0) {
      res.status(200).send({
        resultCode: 1,
        resultstr: _error(1),
        data: null,
      })
      return
    }

    _getUserByLineid(lineid)
      .then((response) => {
        res.status(200).send(response)
      })
      .catch((error) => {
        console.log('getUserByLineid error=>', error)
        res.status(200).send({
          resultCode: 2,
          resultstr: error,
          data: {}
        })
      })
  }

  var createUser = function (req, res) {
    let lineid = req.body.lineid
    let cid = req.body.cid
    let name = req.body.name
    let password = req.body.password
    let groupid = req.body.groupid; // id of Line's group
    let memberid = req.body.memberid; // id of Line's group
    let email = req.body.email;
    let sex = req.body.sex; // id of Line's group
    let birthdate = req.body.birthdate; // id of Line's group
    let role = req.body.role;

    if (lineid === undefined || lineid === null || lineid.length <= 0 ||
        cid === undefined || cid === null || cid.length <= 0 ) {
        res.status(200).send({
          resultCode: 1,
          resultstr: _error(1),
          data: null,
        })
        return
    }

    _createUser(name,password,cid,lineid,groupid,memberid,email,sex,birthdate,role)
     .then((response) => {
       res.status(200).send(response)
     })
     .catch((error) => {
         console.log('_createUser error=>', error)
         res.status(200).send(error)
     })
  }

  return ({
    create: createUser,
    getByCid: getUserByCid,
    getByLindid: getUserByLineid,
    updateByLineid: updateByLineid,
    _createUser: _createUser,
    _getUserByLineid: _getUserByLineid,
  })
}

module.exports = UserAccountController
