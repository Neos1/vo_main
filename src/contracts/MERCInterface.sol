pragma solidity 0.5;

interface MERCInterface {


  function symbol() external returns (string);

  function name() external returns (string);

  function totalSupply() external returns (uint256);

  function setAdmin(address who) external ;

  function balanceOfERC(address who) external returns (uint256);

  function balanceOf() external returns (uint256) ;

  function _addUser(address who, uint256 balance) external returns (uint256);

  function transferFrom(address who, address to, uint256 value) external;
}