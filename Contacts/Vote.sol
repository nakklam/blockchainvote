pragma solidity ^0.4.25;

// ----------------------------------------------------------------------------
// Contract : Vote
//
// Deployed to : 0x8a1dbaa294042cea091bd64ff27f50e08fd3415f
//
// copyright 2018 Teerapong Sansaneeyawat
// ----------------------------------------------------------------------------

contract Vote {
    struct Score {
        bool found;
        uint memberCount;
        uint adminCount;
        uint anonymousCount;
    }
    mapping(bytes32 => Score) _votePool;

    struct QuestionData{
        bytes32[] voteByList;
    }
    mapping(bytes32 => QuestionData) _questionVotePool;

    struct VoteTransaction{
        bytes32 qid;
        bytes32 aid;
        bytes32 voteBy; // lineid
        string voteTimestamp;
    }

    VoteTransaction[] _transaction;
    bytes32 _adminStr;
    bytes32 _memberStr;

    constructor() public {
        _adminStr = stringToBytes32("admin");
        _memberStr = stringToBytes32("member");
    }

    function createVote(
        bytes32 qid,
        bytes32 aid,
        bytes32 voteBy,
        bytes32 role,
        string timestamp) public returns (bool result){

        VoteTransaction memory vote;
        vote.qid = qid;
        vote.aid = aid;
        vote.voteBy = voteBy;
        vote.voteTimestamp = timestamp;
        _transaction.push(vote);

        // keep data who vote the question
        _questionVotePool[qid].voteByList.push(voteBy);

        // keep score of each question choice
        bool curFound = _votePool[aid].found;
        uint curAdminCount = _votePool[aid].adminCount;
        uint curMemberCount = _votePool[aid].memberCount;
        uint curAnonymousCount = _votePool[aid].anonymousCount;
        if(!curFound){
            curMemberCount = 0;
            curAdminCount = 0;
            curAnonymousCount = 0;
        }

        if(isEqualBytes32(role,_adminStr)){
            curAdminCount = curAdminCount+1;
        }else if(isEqualBytes32(role,_memberStr)){
            curMemberCount = curMemberCount+1;
        }else {
            //role==anonymous
            curAnonymousCount = curAnonymousCount+1;
        }
        _votePool[aid].found = true;
        _votePool[aid].adminCount = curAdminCount;
        _votePool[aid].memberCount = curMemberCount;
        _votePool[aid].anonymousCount = curAnonymousCount;

        return true;
    }

    function getVote(bytes32[] aid) public constant returns (uint[] memberCount, uint[] adminCount, uint[] anonymousCount){
        uint _amount = aid.length;
        uint[] memory _memberCount = new uint[](_amount);
        uint[] memory _adminCount = new uint[](_amount);
        uint[] memory _anonymousCount = new uint[](_amount);

        for(uint i=0; i<_amount; i++){
            bytes32 needAid = aid[i];
            _memberCount[i] = _votePool[needAid].memberCount;
            _adminCount[i] = _votePool[needAid].adminCount;
            _anonymousCount[i] = _votePool[needAid].anonymousCount;
        }

        return(_memberCount,_adminCount,_anonymousCount);
    }

    function getVoteBy(bytes32 qid) public constant returns (bytes32[] voteBye){
        return _questionVotePool[qid].voteByList;
    }

    function getScore(bytes32 aid) public constant returns (
        uint memberCount,
        uint adminCount,
        uint anonymousCount){
        return (
        _votePool[aid].memberCount,
        _votePool[aid].adminCount,
        _votePool[aid].anonymousCount);
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
