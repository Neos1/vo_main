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
        mapping (uint => UserGroup) group;
    }

    function init(List storage _self) internal {
        _self.groupIdIndex = 1;
    }

    function save(List storage _self, UserGroup memory _group) internal returns (uint id) {
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

    function saveNewUserGroup (string _name, address _address,  string _type) {
      UserGroups.UserGroup memory userGroup = UserGroups.UserGroup({
          name: _name,
          groupType: _type,
          status: UserGroups.GroupStatus.ACTIVE,
          groupAddr: _address
      });
      userGroups.save(userGroup);
    } 

}