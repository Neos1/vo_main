pragma solidity 0.5;


contract Project {

    uint public test;

    constructor() public {
        test = 1;
    }

    function updateTest(uint _test) public pure returns (uint result) {
        return _test;
    }
}
