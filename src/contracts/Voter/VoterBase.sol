pragma solidity 0.5;

import "../libs/QuestionGroups.sol";
import "../libs/Questions.sol";
import "./VoterInterface.sol";


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
        string calldata _caption,
        string calldata _text,
        uint _time,
        address _target,
        bytes4 _methodSelector,
        string calldata _votingFormula
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
        string calldata _name
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
