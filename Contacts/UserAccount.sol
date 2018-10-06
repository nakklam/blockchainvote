pragma solidity ^0.4.25;

// ----------------------------------------------------------------------------
// Contract : UserAccount
//
// Deployed to : 0x4bdb980485038ac9d12eaabfba7ff4fe2024a7a1
//
// copyright 2018 Teerapong Sansaneeyawat
// ----------------------------------------------------------------------------

contract UserAccount {
    struct User {
        address userAddress;
        bytes32 nameTitle;
        string name;
        string password;
        bytes32 cid; // citizen's id
        bytes32 lineid; // id of Line's user
        bytes32 groupid; // id of Line's group
        bytes32 memberid;
        string email;
        byte sex;    // u=>undefined ,m=>male, f=>femail
        string birthdate;
        bytes32 role; // member, admin
        string createTimestamp;
        string updateTimestamp;
    }

    int _count;
    mapping(address => User) _account;
    address[] public _addressIndices;
    mapping(bytes32 => address) _mapCid;
    mapping(bytes32 => address) _mapLineId;

    constructor() public {
        _count = 0;
    }

    function createUser (
        address userAddress,
        string name,
        string password,
        bytes32 cid,
        bytes32 lineid,
        bytes32 groupid,
        bytes32 memberid,
        string email,
        byte sex,
        string birthdate,
        bytes32 role,
        string timestamp) public returns (int result)
    {
        //if(_account[userAddress].userAddress!=address(0)){
        //    return -1;
        //}

        //if(_account[_mapLineId[lineid]].userAddress!=address(0)){
        //    return -2; // duplicate line user's id
        //}

        //if(_account[_mapCid[cid]].userAddress!=address(0)){
        //    return -3; // duplicate citizen's id
        //}

        _account[userAddress].userAddress = userAddress;
        _account[userAddress].name = name;
        _account[userAddress].password = password;
        _account[userAddress].cid = cid;
        _account[userAddress].lineid = lineid;
        _account[userAddress].groupid = groupid;
        _account[userAddress].memberid = memberid;
        _account[userAddress].email = email;
        _account[userAddress].sex = sex;
        _account[userAddress].birthdate = birthdate;
        _account[userAddress].role = role;
        _account[userAddress].createTimestamp = timestamp;
        _account[userAddress].updateTimestamp = timestamp;

        _addressIndices.push(userAddress);
        _mapCid[cid] = userAddress;
        _mapLineId[lineid] = userAddress;
        _count = _count+1;

        return _count;
    }

    function updateUserByLineId (
        bytes32 lineid,
        string name,
        string password,
        bytes32 cid,
        bytes32 groupid,
        bytes32 memberid,
        string email,
        byte sex,
        string birthdate,
        bytes32 role,
        string timestamp) public returns (int result) {

        address userAddress = _mapLineId[lineid];

        if(_account[userAddress].userAddress==address(0)){
            return -1;
        }

        _account[userAddress].name = name;
        _account[userAddress].password = password;
        _account[userAddress].cid = cid;
        _account[userAddress].groupid = groupid;
        _account[userAddress].memberid = memberid;
        _account[userAddress].email = email;
        _account[userAddress].sex = sex;
        _account[userAddress].birthdate = birthdate;
        _account[userAddress].role = role;
        _account[userAddress].updateTimestamp = timestamp;

        return 0;
    }

    function getUserByAdress(address inAddress) public constant returns (
        bool found,
        string name,
        string password,
        bytes32 cid,
        bytes32 lineid,
        bytes32 memberid,
        bytes32 role){

        if(_account[inAddress].userAddress!=address(0)){
            return (
            true,
            _account[inAddress].name,
            _account[inAddress].password,
            _account[inAddress].cid,
            _account[inAddress].lineid,
            _account[inAddress].memberid,
            _account[inAddress].role);
        }else{
            return (
            false,
            "",
            "",
            "",
            "",
            "",
            "");
        }
    }

    function getUserByCID(bytes32 inCid) public constant returns (
        bool found,
        address userAddress,
        string name,
        string password,
        bytes32 lineid,
        bytes32 memberid,
        bytes32 role){

        address needAddress = _mapCid[inCid];

        if(needAddress!=address(0)){
            return (
            true,
            _account[needAddress].userAddress,
            _account[needAddress].name,
            _account[needAddress].password,
            _account[needAddress].lineid,
            _account[needAddress].memberid,
            _account[needAddress].role);
        }else{
            return (
            false,
            address(0),
            "",
            "",
            "",
            "",
            "");
        }
    }

    function getUserByLineID(bytes32 inLineID) public constant returns (
        bool found,
        address userAddress,
        string name,
        string password,
        bytes32 cid,
        bytes32 memberid,
        bytes32 role){

        address needAddress = _mapLineId[inLineID];

        if(needAddress!=address(0)){
            return (
            true,
            _account[needAddress].userAddress,
            _account[needAddress].name,
            _account[needAddress].password,
            _account[needAddress].cid,
            _account[needAddress].memberid,
            _account[needAddress].role);
        }else{
            return (
            false,
            address(0),
            "",
            "",
            "",
            "",
            "");
        }
    }

    function getUserDetailByLineID(bytes32 inLineID) public constant returns (
        bool found,
        bytes32 nameTitle,
        bytes32 groupid,
        string email,
        byte sex,
        string birthdate,
        string createTimestamp,
        string updateTimestamp){

        address needAddress = _mapLineId[inLineID];

        if(needAddress!=address(0)){
            return (
            true,
            _account[needAddress].nameTitle,
            _account[needAddress].groupid,
            _account[needAddress].email,
            _account[needAddress].sex,
            _account[needAddress].birthdate,
            _account[needAddress].createTimestamp,
            _account[needAddress].updateTimestamp);
        }else{
            return (
            false,
            "",
            "",
            "",
            "",
            "",
            "",
            "");
        }
    }

    function isFound(bytes32 inLineID,bytes32 inCid) public constant returns (
        bool found){

        address needAddress = _mapLineId[inLineID];
        if(needAddress!=address(0)){
            return(true);
        }

        needAddress = _mapCid[inCid];
        if(needAddress!=address(0)){
            return(true);
        }

        return (false);
    }

    //    function getAllUser(uint inIndex, uint inAmount) public constant
    //    returns (
    //        bool hasNext,
    //        uint amount,
    //        address[] userAddress,
    //        string[] name,
    //        string[] password,
    //        bytes32[] cid,
    //        bytes32[] lineid,
    //        string[] role,
    //        string[] createTimestamp)
    //    {
    //        uint length = addressIndices.length;
    //        bool _hasNext = true;
    //        uint _amount = inAmount;
    //        uint maxIndex = inIndex+inAmount;
    //        if(maxIndex >=length){
    //            maxIndex = length;
    //            _hasNext = false;
    //            _amount = maxIndex-inIndex;
    //        }
    //
    //        address[] memory _userAddress = new address[](_amount);
    //        string[] memory _name = new string[](_amount);
    //        string[] memory _password = new string[](_amount);
    //        bytes32[] memory _cid = new bytes32[](_amount);
    //        bytes32[] memory _lineid = new bytes32[](_amount);
    //        string[] memory _role = new string[](_amount);
    //        string[] memory _createTimestamp = new string[](_amount);
    //
    //        for (uint i = index; i < maxIndex; i++) {
    //            User storage user = _account[addressIndices[i]];
    //            _userAddress[i] = user.userAddress;
    //            _name[i] = user.name;
    //            _password[i] = user.password;
    //            _cid[i] = user.cid;
    //            _lineid[i] = user.lineid;
    //            _role[i] = user.role;
    //            _createTimestamp[i] = user.createTimestamp;
    //        }
    //
    //        return (_hasNext,_amount,_userAddress,_name,_password,_cid,_lineid,_role,_createTimestamp);
    //    }
}
