const Web3 = require('web3');
const fs = require('fs');
const solc = require('solc');

/*
* connect to ethereum node
*/
const ethereumUri = 'http://localhost:8501';
const address = '0x14a9186d31a85f5494c9f367123abe4c77659b37'; // user

let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(ethereumUri));

let accounts
web3.eth.getAccounts()
  .then((response) => {
    accounts = response
    console.log("web3.eth.getAccounts", response)
    return web3.eth.personal.unlockAccount(accounts[0], 'teenueng35', 300)
  })
  .then((response)=>{
    console.log("web3.eth.personal.unlockAccount=>", response)

    if(!response){
      return Promise.reject({
        error : "web3.eth.personal.unlockAccount error"
      })
    }

    let source = fs.readFileSync("./Contacts/Vote.sol", 'utf8');

    console.log('compiling contract...');
    let compiledContract = solc.compile(source);
    console.log('done');

    for (let contractName in compiledContract.contracts) {
      // code and ABI that are needed by web3
      // console.log(contractName + ': ' + compiledContract.contracts[contractName].bytecode);
      // console.log(contractName + '; ' + JSON.parse(compiledContract.contracts[contractName].interface));
      var bytecode = compiledContract.contracts[contractName].bytecode;
      var abi = JSON.parse(compiledContract.contracts[contractName].interface);
    }

    console.log(JSON.stringify(abi, undefined, 2));

    //let gasEstimate = web3.eth.estimateGas({data: '0x' + bytecode});
    //console.log('gasEstimate = ' + gasEstimate);
    web3.eth.estimateGas({data: '0x' + bytecode}).then((response)=>{
      console.log("web3.eth.estimateGas=>",response)
    })

    //let MyContract = web3.eth.contract(abi);

    let MyContract = new web3.eth.Contract(abi)
    console.log('deploying contract...');


    MyContract.deploy({
      data: '0x'+ bytecode
    })
      .send({
        from: address,
        gas: 2320847,
        gasPrice: '300000000000'
      }, function(error, transactionHash){
        console.log("transactionHash1",transactionHash)
      })
      .on('error', function(error){
        console.log("error=>",error)
      })
      .on('transactionHash', function(transactionHash){
        console.log("transactionHash2",transactionHash)
      })
      .on('receipt', function(receipt){
        console.log("receipt.contractAddress",receipt.contractAddress) // contains the new contract address
      })
      .on('confirmation', function(confirmationNumber, receipt){
        console.log("receipt.contractAddress",receipt.contractAddress)
      })
      .then(function(newContractInstance){
        console.log(newContractInstance.options.address) // instance with the new contract address
      });


    // (function wait () {
    //   setTimeout(wait, 1000);
    // })();
  }).catch((error)=>{
    console.log("error",error)
  })


/*
* Compile Contract and Fetch ABI
*/


/*
* deploy contract
*/

