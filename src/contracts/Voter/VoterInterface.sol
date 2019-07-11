pragma solidity 0.5;

import "../libs/QuestionGroups.sol";
import "../libs/Questions.sol";
import "../libs/Votings.sol";
import "../libs/UserGroups.sol";

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
