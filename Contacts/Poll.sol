pragma solidity ^0.4.25;

// ----------------------------------------------------------------------------
// Contract : Poll
//
// Deployed to : 0xb849e3def0c94b2a57fac8bcfc6ee9c53c9c3190
//
// copyright 2018 Teerapong Sansaneeyawat
// ----------------------------------------------------------------------------

contract Poll {
    struct Question {
        bytes32 qid;
        string text;
        bytes32[] answerList;
        bytes32 voteRight;      // who can vote => all, member, admin
        bytes32 viewRight;      // who can see vote's result=> all, member, admin
        bytes32 status;         // status of question => pending, voting, closed, delete (+for search
        int typeTag;            // narmal=>0
        string createTimestamp;
        string updateTimestamp;
    }

    struct Answer{
        bytes32 aid;
        string text;
        string createTimestamp;
        string updateTimestamp;
    }

    mapping(bytes32 => Question) _questionPool;
    bytes32[] _questionList;
    mapping(bytes32 => Answer) _answerPool;
    bytes32[] _answerList;
    bytes32[] _pendingList;
    bytes32[] _votingList;
    bytes32[] _closedList;
    bytes32 _pendingStr;
    bytes32 _votingStr;
    bytes32 _closedStr;
    bytes32 _allStr;
    bytes32 _activeStr;

    constructor() public {
        _pendingStr = stringToBytes32("pending");
        _votingStr = stringToBytes32("voting");
        _closedStr = stringToBytes32("closed");
        _allStr = stringToBytes32("all");
        _activeStr = stringToBytes32("active");
    }

    function getVotingList() public constant returns (bytes32[] result){
        return _votingList;
    }

    function getPendingList() public constant returns (bytes32[] result){
        return _pendingList;
    }

    function getClosedList() public constant returns (bytes32[] result){
        return _closedList;
    }

    function getPendingStr() public constant returns (bytes32 result){
        return _pendingStr;
    }

    function getVotingStr() public constant returns (bytes32 result){
        return _votingStr;
    }

    function createQuestion(
        bytes32 qid,
        string text,
        bytes32 voteRight,
        bytes32 viewRight,
        bytes32 status,
        int typeTag,
        string timestamp) public returns (bool result){

        _questionPool[qid].qid = qid;
        _questionPool[qid].text = text;
        _questionPool[qid].voteRight = voteRight;
        _questionPool[qid].viewRight = viewRight;
        _questionPool[qid].status = status;
        _questionPool[qid].typeTag = typeTag;
        _questionPool[qid].createTimestamp = timestamp;
        _questionPool[qid].updateTimestamp = timestamp;

        if(isEqualBytes32(status,_pendingStr)){
            _pendingList.push(qid);
        }else if(isEqualBytes32(status,_votingStr)){
            _votingList.push(qid);
        }else if(isEqualBytes32(status,_closedStr)){
            _closedList.push(qid);
        }

        _questionList.push(qid);

        return true;
    }

    function updateQuestion(
        bytes32 qid,
        string text,
        bytes32 voteRight,
        bytes32 viewRight,
        bytes32 status,
        int typeTag,
        string timestamp) public returns (bool result){

        uint textLength = bytes(text).length;
        if(textLength>0){
            _questionPool[qid].text = text;
        }

        if(voteRight[0]!=0){
            _questionPool[qid].voteRight = voteRight;
        }

        if(viewRight[0]!=0){
            _questionPool[qid].viewRight = viewRight;
        }

        if(typeTag>=0){
            _questionPool[qid].typeTag = typeTag;
        }

        if(status[0]!=0){
            bytes32 currentStatus = _questionPool[qid].status;
            if(!isEqualBytes32(currentStatus,status)){
                uint i;
                if(isEqualBytes32(currentStatus,_pendingStr)){
                    for (i = 0; i<_pendingList.length; i++){
                        if(_pendingList[i] == qid){
                            removeArrayElement(i, _pendingList);
                            break;
                        }
                    }
                }else if(isEqualBytes32(currentStatus,_votingStr)){
                    for (i = 0; i<_votingList.length; i++){
                        if(_votingList[i] == qid){
                            removeArrayElement(i, _votingList);
                            break;
                        }
                    }
                }else if(isEqualBytes32(currentStatus,_closedStr)){
                    for (i = 0; i<_closedList.length; i++){
                        if(_closedList[i] == qid){
                            removeArrayElement(i, _closedList);
                            break;
                        }
                    }
                }

                if(isEqualBytes32(status,_pendingStr)){
                    _pendingList.push(qid);
                }else if(isEqualBytes32(status,_votingStr)){
                    _votingList.push(qid);
                }else if(isEqualBytes32(status,_closedStr)){
                    _closedList.push(qid);
                }

                _questionPool[qid].status = status;
            }
        }

        _questionPool[qid].updateTimestamp = timestamp;

        return true;
    }

    function getQuestion(bytes32 qid) public constant returns (
        string text,
        bytes32[] answerList,
        bytes32 voteRight,
        bytes32 viewRight,
        bytes32 status,
        int typeTag,
        string createTimestamp){

        return(
        _questionPool[qid].text,
        _questionPool[qid].answerList,
        _questionPool[qid].voteRight,
        _questionPool[qid].viewRight,
        _questionPool[qid].status,
        _questionPool[qid].typeTag,
        _questionPool[qid].createTimestamp);
    }

    function addAnswer(
        bytes32 qid,
        bytes32 aid,
        string text,
        string timestamp) public returns (bool result){

        _answerPool[aid].aid = aid;
        _answerPool[aid].text = text;
        _answerPool[aid].createTimestamp = timestamp;
        _answerPool[aid].updateTimestamp = timestamp;

        _answerList.push(aid);
        _questionPool[qid].answerList.push(aid);

        return true;
    }

    function updateAnswer(bytes32 aid,string text, string timestamp) public returns (bool result){
        _answerPool[aid].text = text;
        _answerPool[aid].updateTimestamp = timestamp;

        return (true);
    }

    function getAnswer(bytes32 aid) constant public returns(
        string text, string createTimestamp, string updateTimestamp){
        return (_answerPool[aid].text,
        _answerPool[aid].createTimestamp,
        _answerPool[aid].updateTimestamp);
    }

    function getQidOfStatus(bytes32 status) public constant returns (bytes32[] qestionList){
        if(isEqualBytes32(status,_votingStr)){
            return _votingList;
        }else if(isEqualBytes32(status,_pendingStr)){
            return _pendingList;
        }else if(isEqualBytes32(status,_closedStr)){
            return _closedList;
        }else if(isEqualBytes32(status,_closedStr)){
            return _closedList;
        }else if(isEqualBytes32(status,_allStr)){
            return _questionList;
        }else if(isEqualBytes32(status,_activeStr)){
            // closed & voting status
            bytes32[] memory _resultList = new bytes32[](_closedList.length+_votingList.length);
            uint length = _closedList.length;
            uint i;
            for(i=0; i<length; i++){
                _resultList[i] = _closedList[i];
            }
            length = _votingList.length;

            for(i = 0; i <length; i++){
                _resultList[_closedList.length+i] = _votingList[i];
            }

            return _resultList;
        }

        bytes32[] memory _result = new bytes32[](0);
        return _result;
    }

    function stringToBytes32(string memory inSource) internal pure returns(bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(inSource);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            result := mload(add(inSource, 32))
        }
    }

    function removeArrayElement(uint inIndex, bytes32[] storage inArray) internal returns(bytes32[] result) {
        for(uint i = inIndex; i < inArray.length - 1; i++) {
            inArray[i] = inArray[i+1];
        }

        if (inIndex < inArray.length) {
            delete inArray[inArray.length - 1];
            inArray.length--;
        }

        return inArray;
    }

    function isEqualBytes32(bytes32 inB1, bytes32 inB2) public pure returns(bool result){
        bool _result = true;

        for(uint i=0; i<32; i++){
            if(inB1[i]!=inB2[i]){
                _result = false;
                break;
            }
        }

        return _result;
    }
}
