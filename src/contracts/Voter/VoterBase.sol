pragma solidity 0.5;

import "../libs/QuestionGroups.sol";
import "../libs/UserGroups.sol";
import "../libs/Questions.sol";
import "../libs/Votings.sol";
import "./VoterInterface.sol";
import "../IERC20.sol";




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
