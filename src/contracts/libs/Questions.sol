pragma solidity 0.5;


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
