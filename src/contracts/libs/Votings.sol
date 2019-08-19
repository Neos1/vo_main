pragma solidity 0.5;

library Votings {

  enum Status {ACTIVE, ENDED}

  struct Voting {
    // ? question id used for vote
    uint questionId;
    // ? vote status
    Status status;
    // ? group of users, who started vote
    uint starterGroup;
    // ? user, who started the voting
    address starterAddress;
    // ? block when voting was started
    uint startTime;
    uint endTime;
    // ? contains pairs of (address => vote) for every user
    mapping (address=> mapping(address => uint)) votes;

    // contains total weights for voting variants
    mapping (address=> mapping(address => uint256)) voteWeigths;
    mapping (uint=> mapping(string => uint256)) descisionWeights;
    mapping (address=> mapping (address=>uint256)) tokenReturns;
    
    bytes data;
  }

  struct List {
    uint votingIdIndex;
    mapping (uint => Voting) voting;
    mapping (uint => uint) descision;
  }

  function init(List storage _self) internal {
    _self.votingIdIndex = 1;
  }


  function save(List storage _self, Voting memory _voting) internal returns (uint id) {
    uint votingId = _self.votingIdIndex;
    _self.voting[votingId] = _voting;
    _self.votingIdIndex++;
    return votingId;
  }

  function close(List storage _self) internal {
    uint votingId = _self.votingIdIndex - 1;
    _self.voting[votingId].status = Status.ENDED;
  }

}