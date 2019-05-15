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
        //voting formula
        string formula;
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

    function getCount(List storage _self) internal returns (uint count) {
        return _self.questionIdIndex;
    }

    function exists(List storage _self, bytes32 _name) internal view returns (bool) {
        return _self.uniqNames[_name] != 0;
    }

}





/**
 * @title VoterInterface
 * @dev an interface for voter
 */
interface VoterInterface {
    // LIBRARIES
    using QuestionGroups for QuestionGroups.List;
    using Questions for Questions.List;
    
    // DIFINTIONS
    // new question added event
    event NewQuestion(
        uint id,
        uint groupId,
        Questions.Status status,
        string caption,
        string text,
        uint time,
        address target,
        bytes4 methodSelector,
        string formula
    );

    // METHODS
    /**
     * @notice adds new question to question library
     * @param _groupId question group id
     * @param _status question status
     * @param _caption question name
     * @param _text question description
     * @param _time question length
     * @param _target target address to call
     * @param _methodSelector method to call
     * @param _formula voting formula
     * @return new question id
     */
    function saveNewQuestion(
        uint _id,
        uint _groupId,
        Questions.Status _status,
        string  _caption,
        string  _text,
        uint _time,
        address _target,
        bytes4 _methodSelector,
        string  _formula
    ) external returns (uint id);

    /**
     * @notice adds new question to question library
     * @param _groupType question group type
     * @param _name question group name
     * @return new question id
     */
    function saveNewGroup(
        QuestionGroups.GroupType _groupType,
        string  _name
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
        string memory formula
    );
}



/**
 * @title VoterBase
 * @dev an base difinitions for voter
 */
contract VoterBase is VoterInterface {

    Questions.List public questions;
    QuestionGroups.List public groups;

    constructor() internal {
        questions.init();
        groups.init();
    }

    // METHODS
    function getCount() public returns (uint count) {
        return questions.getCount();
    }

    /**
     * @notice adds new question to question library
     * @param _groupId question group id
     * @param _status question status
     * @param _caption question name
     * @param _text question description
     * @param _time question length
     * @param _target target address to call
     * @param _methodSelector method to call
     * @param _votingFormula voting formula
     * @return new question id
     */
    function saveNewQuestion(
        uint _id,
        uint _groupId,
        Questions.Status _status,
        string  _caption,
        string  _text,
        uint _time,
        address _target,
        bytes4 _methodSelector,
        string  _votingFormula
    ) external returns (uint id) {
        // validate params
        // call questions.save()
        // example
        Questions.Question memory question = Questions.Question({
            groupId: _groupId,
            status: _status,
            caption: _caption,
            text: _text,
            time: _time,
            target: _target,
            methodSelector: _methodSelector,
            formula: _votingFormula
        });
        id = questions.save(question, _id);
        emit NewQuestion(
            id,
            _groupId,
            _status,
            _caption,
            _text,
            _time,
            _target,
            _methodSelector,
            _votingFormula
        );
        return id;
    }

    /**
     * @notice adds new question to question library
     * @param _groupType question group type
     * @param _name question group name
     * @return new question id
     */
    function saveNewGroup(
        QuestionGroups.GroupType _groupType,
        string  _name
    ) external returns (uint id) {
        // validate params
        // call groups.save()
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
        string memory formula
    ) {
        uint i = _id;
        return (
            questions.question[i].groupId,
            questions.question[i].status,
            questions.question[i].caption,
            questions.question[i].text,
            questions.question[i].time,
            questions.question[i].target,
            questions.question[i].methodSelector,
            questions.question[i].formula
        );
    }
}



contract Voter is VoterBase {
    
    constructor() public {
        // implement contract deploy
        // set erc20 token here
    }

}
