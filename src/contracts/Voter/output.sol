pragma solidity ^0.4.24;






library QuestionGroups {
    
    enum GroupType {
        // system group
        SYSTEM,
        // user group
        CUSTOM
    }

    struct Group {
        // group type
        GroupType groupType;
        // group name
        string name;
    }

    struct List {
        uint groupIdIndex;
        mapping (bytes32 => uint) uniqNames;
        mapping (uint => Group) group;
    }

    function init(List storage _self) internal {
        _self.groupIdIndex = 1;
         Group memory systemGroup = Group({
            name: 'Системные',
            groupType: GroupType.SYSTEM
        });
        save(_self, systemGroup);
         Group memory otherGroup = Group({
            name: "Другие",
            groupType: GroupType.CUSTOM
        });
        save(_self, otherGroup);
    }

    function save(List storage _self, Group memory _group) internal returns (uint id) {
        bytes32 name = keccak256(abi.encodePacked(_group.name));
        uint groupId = _self.groupIdIndex;
        require(!exists(_self, name), "provided group already exists");
        _self.group[groupId] = _group;
        _self.uniqNames[name] = groupId;
        _self.groupIdIndex++;
        return groupId;
    }

    function exists(List storage _self, bytes32 _name) internal view returns (bool) {
        return _self.uniqNames[_name] != 0;
    }

}




library UserGroups {

    enum GroupStatus {
        // deleted or inactive question
        INACTIVE,
        // active question
        ACTIVE
    }

    struct UserGroup {
        string name;
        string groupType;
        GroupStatus status;
        address groupAddr;
    }

    struct List {
        uint groupIdIndex;
        mapping (bytes32 => uint) uniqNames;
        mapping (uint => string) names;
        mapping (uint => UserGroup) group;
    }

    function init(List storage _self, address _ERC20) internal {
        _self.groupIdIndex = 1;
        UserGroup memory group = UserGroup({
            name: "Owner",
            groupType: "ERC20",
            status: GroupStatus.ACTIVE,
            groupAddr: _ERC20
        });
        save(_self, group);
    }

    function save(List storage _self, UserGroup memory _group) internal returns (uint id) {
        bytes32 key = keccak256(abi.encodePacked(_group.name));
        string memory name = _group.name;
        uint groupId = _self.groupIdIndex;
        require(!exists(_self, key), "provided group already exists");
        _self.names[groupId] = name;
        _self.group[groupId] = _group;
        _self.uniqNames[key] = groupId;
        _self.groupIdIndex++;
        return groupId;
    }

    function exists(List storage _self, bytes32 _name) internal view returns (bool) {
        return _self.uniqNames[_name] != 0;
    }

}




library Questions {

    enum Status {
        // deleted or inactive question
        INACTIVE,
        // active question
        ACTIVE
    }

    struct Question {
        // question group id
        uint groupId;
        // question status
        Status status;
        // question name
        string caption;
        // question description
        string text;
        // question length in minutes
        uint time;
        // target address
        address target;
        // method to be called
        bytes4 methodSelector;
        uint[] formula;
        bytes32[] parameters;
    }

    struct List {
        uint questionIdIndex;
        mapping (bytes32 => uint) uniqNames;
        mapping (uint => Question) question;
    }

    function init(List storage _self) internal {
        _self.questionIdIndex = 1;
    }

    function save(List storage _self, Question memory _question, uint _id) internal returns (uint id) {
        bytes32 name = keccak256(abi.encodePacked(_question.caption));
        uint questionId = _self.questionIdIndex;
        require(!exists(_self, name), "provided group already exists");
        _self.question[_id] = _question;
        _self.uniqNames[name] = questionId;
        _self.questionIdIndex++;
        return questionId;
    }

    function exists(List storage _self, bytes32 _name) internal view returns (bool) {
        return _self.uniqNames[_name] != 0;
    }

}



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




/**
 * @dev Interface of the ERC20 standard as defined in the EIP. Does not include
 * the optional functions; to access them see `ERC20Detailed`.
 */
interface IERC20 {
    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256);
    /**
     * @dev Returns the amount of tokens in existence.
     */
    function name() external view returns (string);
    /**
     * @dev Returns the amount of tokens in existence.
     */
    function symbol() external view returns (string);

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves `amount` tokens from the caller's account to `recipient`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a `Transfer` event.
     */
    function transfer(address recipient, uint256 amount) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through `transferFrom`. This is
     * zero by default.
     *
     * This value changes when `approve` or `transferFrom` are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * > Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an `Approval` event.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Moves `amount` tokens from `sender` to `recipient` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a `Transfer` event.
     */
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to `approve`. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);
}




/**
 * @title VoterInterface
 * @dev an interface for voter
 */
interface VoterInterface {
    // LIBRARIES
    using QuestionGroups for QuestionGroups.List;
    using Questions for Questions.List;
    using Votings for Votings.List;
    using UserGroups for UserGroups.List;

    
    // DIFINTIONS
    // new question added event
    event NewQuestion(
        uint groupId,
        Questions.Status status,
        string caption,
        string text,
        uint time,
        address target,
        bytes4 methodSelector
    );
    // new Votings added event
    event NewVoting(
        uint id,
        uint questionId,
        Votings.Status status,
        uint starterGroup,
        address starterAddress,
        uint startblock
    );

    // METHODS
    /*
     * @notice adds new question to question library
     * @param _ids question group id
     * @param _status question status
     * @param _caption question name
     * @param _text question description
     * @param _time question length
     * @param _target target address to call
     * @param _methodSelector method to call
     * @param _formula voting formula
     * @param _parameters parameters of inputs
     * return new question id
     */
    function saveNewQuestion(
        uint[] _idsAndTime,
        Questions.Status _status,
        string _caption,
        string _text,
        address _target,
        bytes4 _methodSelector,
        uint[] _formula,
        bytes32[] _parameters
    ) external returns (bool _saved);

    /**
     * @notice adds new question to question library
     * @param _name question group name
     * @return new question id
     */
    function saveNewGroup(
        string _name
    ) external returns (uint id);

    /**
     * @notice gets question data
     * @param _id question id
     * @return question data
     */
    function question(
        uint _id
    ) external view returns (
        uint groupId,
        Questions.Status status,
        string memory caption,
        string memory text,
        uint time,
        address target,
        bytes4 methodSelector,
        uint[] memory _formula,
        bytes32[] memory _parameters
    );

    function getCount() external returns (uint length);

    function startNewVoting( 
        uint questionId,
        Votings.Status status,
        uint starterGroup,
        bytes data
    ) external returns (bool);

    function voting(uint id) external view returns (
        uint questionId,
        Votings.Status status,
        string memory caption,
        string memory text,
        uint startTime,
        uint endTime,
        bytes data
    );
    function getVotingsCount() external view returns (uint length);
}






/**
 * @title VoterBase
 * @dev an base difinitions for voter
 */
contract VoterBase is VoterInterface {

    Questions.List public questions;
    QuestionGroups.List public groups;
    Votings.List public votings;
    UserGroups.List public userGroups;

    IERC20 public ERC20;

    constructor() public {
        questions.init();
        groups.init();
        votings.init();
    }

    // METHODS
    function setERC20(address _address) public {
        ERC20 = IERC20(_address);
        userGroups.init(_address);
    }

    /*
     * @notice creates new question to saveNewQuestion function
     * @param _groupId question group id
     * @param _status question status
     * @param _caption question name
     * @param _text question description
     * @param _time question length
     * @param _target target address to call
     * @param _methodSelector method to call
     * @param _formula voting formula
     * @param _parameters parameters of inputs
     * @return new question id
     */
    function createNewQuestion(
        uint[] memory _idsAndTime,
        Questions.Status _status,
        string memory _caption,
        string memory _text,
        address _target,
        bytes4 _methodSelector,
        uint[] memory _formula,
        bytes32[] memory _parameters
    ) private returns (Questions.Question memory _question) {
        Questions.Question memory question = Questions.Question({
            groupId: _idsAndTime[1],
            status: _status,
            caption: _caption,
            text: _text,
            time: _idsAndTime[2],
            target: _target,
            methodSelector: _methodSelector,
            formula: _formula,
            parameters: _parameters
        });
        questions.save(question, _idsAndTime[0]);

        emit NewQuestion( _idsAndTime[1], _status, _caption, _text, _idsAndTime[0], _target, _methodSelector );
        return question;
    }
    
    /*
     * @notice adds new question to question library
     * @param _groupId question group id
     * @param _status question status
     * @param _caption question name
     * @param _text question description
     * @param _time question length
     * @param _target target address to call
     * @param _methodSelector method to call
     * @param _formula voting formula
     * @param _parameters parameters of inputs
     * @return new question id
     */
    function saveNewQuestion(
        uint[] _idsAndTime,
        Questions.Status _status,
        string  _caption,
        string  _text,
        address _target,
        bytes4 _methodSelector,
        uint[]  _formula,
        bytes32[] _parameters

    ) external returns (bool _saved){
        Questions.Question memory question = createNewQuestion( 
            _idsAndTime, 
            _status, 
            _caption, 
            _text, 
            _target, 
            _methodSelector, 
            _formula, 
            _parameters
        );
        return true;
    }


    /**
     * @notice adds new question to question library
     * @param _name question group name
     * @return new question id
     */
    function saveNewGroup(
        string _name
    ) external returns (uint id) {
        QuestionGroups.Group memory group = QuestionGroups.Group({
            name: _name,
            groupType: QuestionGroups.GroupType.CUSTOM
        });
        id = groups.save(group);
        return id;
    }
    
    function getCount() external returns (uint length) {
        uint count = questions.questionIdIndex;
        return count;
    }

    /**
     * @notice gets question data
     * @param _id question id
     * @return question data
     */
    function question(uint _id) public view returns (
        uint groupId,
        Questions.Status status,
        string memory caption,
        string memory text,
        uint time,
        address target,
        bytes4 methodSelector,
        uint[] memory _formula,
        bytes32[] memory _parameters
    ) {
        uint id = _id;
        return (
            questions.question[id].groupId,
            questions.question[id].status,
            questions.question[id].caption,
            questions.question[id].text,
            questions.question[id].time,
            questions.question[id].target,
            questions.question[id].methodSelector,
            questions.question[id].formula,
            questions.question[id].parameters
        );
    }

    function getQuestionGroup(uint _id) public view returns (
        string name,
        QuestionGroups.GroupType groupType
    ) {
        return (
            groups.group[_id].name,
            groups.group[_id].groupType
        );
    }

    function getQuestionGroupsLength() public view returns (uint length) {
        return groups.groupIdIndex ;
    }
    function getUserGroup(uint _id) public view returns (
        string name,
        string groupType,
        UserGroups.GroupStatus status,
        address groupAddress
    ) {
        return (
            userGroups.group[_id].name,
            userGroups.group[_id].groupType,
            userGroups.group[_id].status,
            userGroups.group[_id].groupAddr
        );
    }

    function getUserGroupsLength() public view returns (uint length) {
        return userGroups.groupIdIndex ;
    }

    function isActiveVoting() public view returns (bool) {

    }

    /**
     * @notice adds new voting to voting library
     * @param _questionId question id
     * @param _status voting status
     * @param _starterGroup group which started voting
     * @return new voting id
     */

    function startNewVoting(
        uint _questionId,
        Votings.Status _status,
        uint _starterGroup,
        bytes _data
    ) external returns (bool) {
        bool canStart;
        uint votingId = votings.votingIdIndex - 1;
        if (
            ((votings.votingIdIndex == 1) && (votings.voting[votingId].status == Votings.Status.ACTIVE)) 
            || (!(votings.votingIdIndex == 1) && !(votings.voting[votingId].status == Votings.Status.ACTIVE))) {
            canStart = true;
            uint start = block.timestamp;
            uint _endTime = start + (questions.question[_questionId].time * 60);
            Votings.Voting memory voting = Votings.Voting({
                questionId: _questionId,
                status: _status,
                starterGroup: _starterGroup,
                starterAddress: msg.sender,
                startTime: block.timestamp,
                endTime: _endTime,
                data: _data
            });
    
            uint id = votings.save(voting);

            emit NewVoting (
                id,
                _questionId,
                _status,
                _starterGroup,
                msg.sender,
                block.number
            );
        } else {
            canStart = false;
        }
        return canStart;
    }

    function voting(uint _id) external view returns (
        uint id,
        Votings.Status status,
        string memory caption,
        string memory text,
        uint startTime,
        uint endTime,
        bytes data
    ){
        uint votingId = _id;
        uint questionId = votings.voting[_id].questionId;
        return (
            votings.voting[votingId].questionId,
            votings.voting[votingId].status,
            questions.question[questionId].caption,
            questions.question[questionId].text,
            votings.voting[votingId].startTime,
            votings.voting[votingId].endTime,
            votings.voting[votingId].data
        );
    }

    function getVotingsCount() external view returns (uint count) {
        return votings.votingIdIndex;
    }

    function getVotingDescision(uint _id) external view returns (uint result) {
        return votings.descision[_id];
    }   

	function closeVoting() external {
        uint votingId = votings.votingIdIndex - 1;
        uint questionId = votings.voting[votingId].questionId;
        uint[] storage formula = questions.question[questionId].formula;

        uint votingCondition = formula[2]; // 1 - positive, 0 - quorum
        uint sign = formula[3]; // 1 - >=, 2 - <=
        uint percent = formula[4];
        uint quorumPercent;
        uint modificator; // modificator of votingCondition: 1 - of all, 0 - of quorum

        string memory groupName = userGroups.names[formula[1]];
		IERC20 group = IERC20(userGroups.group[formula[1]].groupAddr);
        uint256 positiveVotes = votings.voting[votingId].descisionWeights[1][groupName];
        uint256 negativeVotes = votings.voting[votingId].descisionWeights[2][groupName];
        uint256 totalSupply = group.totalSupply();
        
        if (formula[5] != 0) { // if modificator exists in question
            modificator = formula[5];
        } else {
            modificator = 0;
        }


        if (votingCondition == 0) { 
            // if condition == quorum
            quorumPercent = (positiveVotes + negativeVotes) * 100 / totalSupply;
        } else if (votingCondition == 1) { 
            // else if condition == positive
            if (modificator == 0) { 
                // of quorum
                quorumPercent = (positiveVotes * 100 / (positiveVotes + negativeVotes) );
            } else if (modificator == 1) { 
                // of all
                quorumPercent = ( positiveVotes * 100 / totalSupply );
            }
        }

        if (sign == 1) {
            // if >=
            if (quorumPercent >= percent) {
                if (positiveVotes > negativeVotes) {
                    votings.descision[votingId] = 1;
                    address(this).call(votings.voting[votingId].data);
                } else if (positiveVotes < negativeVotes) {
                    votings.descision[votingId] = 2;
                } else if (positiveVotes == negativeVotes) {
                    votings.descision[votingId] = 0;
                }
            }
        } else if (sign == 0) {
            //if <=
            if (quorumPercent <= percent) {
                if (positiveVotes > negativeVotes) {
                    votings.descision[votingId] = 1;
                    address(this).call(votings.voting[votingId].data);
                } else if (positiveVotes < negativeVotes) {
                    votings.descision[votingId] = 2;
                } else if (positiveVotes == negativeVotes) {
                    votings.descision[votingId] = 0;
                }
            }       
        }
        

        votings.voting[votingId].status = Votings.Status.ENDED;
    }


    function getVotes(uint _votingId) external view returns (uint256[3] memory _votes) {
        uint questionId = votings.voting[_votingId].questionId;
        uint groupId = questions.question[questionId].groupId;
        string memory groupName = userGroups.names[groupId];
        IERC20 group = IERC20(userGroups.group[groupId].groupAddr);
        uint256[3] memory votes;
        votes[0] = votings.voting[_votingId].descisionWeights[1][groupName];
        votes[1] = votings.voting[_votingId].descisionWeights[2][groupName];
        votes[2] = group.totalSupply();
        return votes;
    }

    function returnTokens(uint votingId) public returns (bool status){
		uint questionId =  votings.voting[votingId].questionId;
		uint groupId = questions.question[questionId].groupId;
        string memory groupType = userGroups.group[groupId].groupType;
		IERC20 group = IERC20(userGroups.group[groupId].groupAddr);
        uint256 weight = votings.voting[votingId].voteWeigths[address(group)][msg.sender];
        bool isReturned = this.isUserReturnTokens(votingId, msg.sender);

        if (!isReturned) {
            if( bytes4(keccak256(groupType)) == bytes4(keccak256("ERC20"))) {
                group.transfer(msg.sender, weight);            
            } else {
                group.transferFrom(address(this), msg.sender, weight);
            }
            votings.voting[votingId].tokenReturns[address(group)][msg.sender] = weight;
        }
        return true;
    }

    function isUserReturnTokens(uint votingId, address user) returns (bool result) {
        uint questionId =  votings.voting[votingId].questionId;
		uint groupId = questions.question[questionId].groupId;
        string memory groupType = userGroups.group[groupId].groupType;
		IERC20 group = IERC20(userGroups.group[groupId].groupAddr);
        uint256 returnedTokens = votings.voting[votingId].tokenReturns[address(group)][user];
        return returnedTokens > 0;
    }


    function findUserGroup(address user) external returns (uint) { 
		uint votingIndex = votings.votingIdIndex - 1;
		uint questionId =  votings.voting[votingIndex].questionId;
		uint groupId = questions.question[questionId].groupId;
		IERC20 group = IERC20(userGroups.group[groupId].groupAddr);
		uint256 balance = group.balanceOf(user);
		uint index = 0;
		if (balance != 0 ) {
			index = groupId;
		}
		return index;
    }


    function sendVote(uint _choice) external returns (uint result, uint256 votePos, uint256 voteNeg) {
        uint _voteId = votings.votingIdIndex - 1;
        uint timestamp = votings.voting[_voteId].endTime;
        uint questionId = votings.voting[_voteId].questionId;
        uint groupId = questions.question[questionId].groupId;
        string memory groupName = userGroups.names[groupId];
		uint index = this.findUserGroup(msg.sender);
		IERC20 group = IERC20(userGroups.group[index].groupAddr);
		uint256 balance = group.balanceOf(msg.sender);

        if (block.timestamp < timestamp ) {
			if ( balance != 0) {
				if (votings.voting[_voteId].votes[address(group)][msg.sender] == 0) {
					group.transferFrom(msg.sender, address(this), balance);
					votings.voting[_voteId].votes[address(group)][msg.sender] = _choice;
					votings.voting[_voteId].voteWeigths[address(group)][msg.sender] = balance;
					votings.voting[_voteId].descisionWeights[_choice][groupName] += balance;
				}
			}
        } else {
            this.closeVoting();
        }
        return (
            votings.voting[_voteId].votes[address(group)][msg.sender] = _choice,
            votings.voting[_voteId].descisionWeights[1][groupName],
            votings.voting[_voteId].descisionWeights[2][groupName]
        );
    }

    function getERCAddress() external view returns (address _address) {
        return address(ERC20);
    }

    function getUserBalance() external view returns (uint256 balance) {
        uint256 _balance = ERC20.balanceOf(msg.sender);
        return _balance;
    }

    function getERCTotal() external view returns (uint256 balance) {
        return ERC20.totalSupply();
    }

    function getERCSymbol() external view returns (string symbol) {
        return ERC20.symbol();
    }

    function getUserVote(uint _voteId) external view returns (uint vote) {
        uint questionId = votings.voting[_voteId].questionId;
        uint groupId = questions.question[questionId].groupId;
		IERC20 group = IERC20(userGroups.group[groupId].groupAddr);
        return votings.voting[_voteId].votes[address(group)][msg.sender];
    }

    function getUserWeight() external view returns (uint256 weight) {
        uint _voteId = votings.votingIdIndex - 1;
        return votings.voting[_voteId].voteWeigths[address(ERC20)][msg.sender];
    }

    function transferERC20(address _who, uint256 _value) external returns (uint256 newBalance) {
        ERC20.transferFrom(msg.sender, _who, _value);
        return ERC20.balanceOf(msg.sender);
    }

    function addresses() external view returns (address user, address instance) {
        return (
            msg.sender,
            address(this)
        );
    }

    function saveNewUserGroup (string _name, address _address,  string _type) external {
        UserGroups.UserGroup memory userGroup = UserGroups.UserGroup({
            name: _name,
            groupType: _type,
            status: UserGroups.GroupStatus.ACTIVE,
            groupAddr: _address
        });
        userGroups.save(userGroup);
    } 

    function setCustomGroupAdmin(address group, address admin) external returns (bool)  {    
        require(group.call( bytes4( keccak256("setAdmin(address)")), admin));
        return true;
    }
}



contract Voter is VoterBase {
    
    IERC20 public ERC20;

    constructor(address _address) public {
        // implement contract deploy
        // set erc20 token here        
        setERC20(_address); 
    }


}
