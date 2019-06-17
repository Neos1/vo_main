pragma solidity 0.5;

import "./IERC20.sol";

contract MERC20 {
  string private name;
  string private symbol;
  uint256 private decimals;
  address public admin;
  IERC20 private parentERC;

  mapping (address => userBalance) balances;
  address[] users;

  constructor (string _name, string _symbol, address _parentAddr ) public {
    name = _name;
    symbol = _symbol;
    parentERC = IERC20(_parentAddr);
    decimals = parentERC.totalSupply();
    admin = msg.sender;
    balances[msg.sender].currBalance = decimals;
  }

  struct userBalance{
    uint256 prevBalance;
    uint256 currBalance;
    uint256 blockNum;
  }


  function _symbol() public view returns(string) {
    return symbol;
  }
  function _name() public view returns(string) {
    return name;
  }
  function _decimals() public view returns(uint256) {
    return decimals;
  }

  function balanceOfERC(address owner) public returns (uint256) {
    uint256 balance = parentERC.balanceOf(owner);
    return balance;
  }

  function _addUser(address user, uint256 balance) public returns(uint256) {
    balances[user].prevBalance = balance;
    balances[user].currBalance = balance;
    balances[user].blockNum = block.number;
    return balances[user].currBalance;
  }

  function transferFrom(address _who, address _to, uint256 value) {
    require(_who != address(0), "MERC20: transfer from the zero address");
    require(_to != address(0), "MERC20: transfer to the zero address");

    balances[_who].prevBalance = balances[_who].currBalance;
    balances[_to].prevBalance = balances[_to].currBalance;
    balances[_who].currBalance = balances[_who].currBalance - value;
    balances[_to].currBalance = balances[_to].currBalance + value;
  }


}