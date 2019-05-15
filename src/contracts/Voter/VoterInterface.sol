pragma solidity 0.5;

import "../libs/QuestionGroups.sol";
import "../libs/Questions.sol";
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
        string calldata _caption,
        string calldata _text,
        uint _time,
        address _target,
        bytes4 _methodSelector,
        string calldata _formula
    ) external returns (uint id);

    /**
     * @notice adds new question to question library
     * @param _groupType question group type
     * @param _name question group name
     * @return new question id
     */
    function saveNewGroup(
        QuestionGroups.GroupType _groupType,
        string calldata _name
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
