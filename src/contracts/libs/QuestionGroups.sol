pragma solidity 0.5;


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
