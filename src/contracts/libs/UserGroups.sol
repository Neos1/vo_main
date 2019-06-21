pragma solidity 0.5;


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
