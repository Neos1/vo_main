pragma solidity 0.5;

import "./VoterBase.sol";


contract Voter is VoterBase {
    
    IERC20 public ERC20;

    constructor(address _address) public {
        // implement contract deploy
        // set erc20 token here        
        setERC20(_address); 
    }


}
