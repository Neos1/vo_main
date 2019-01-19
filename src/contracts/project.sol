pragma solidity ^0.4.25;
import "./IERC20.sol";

contract UsingERC20 {
    IERC20 public associatedToken;

    // Constructor. Pass it the token you want this contract to work with
    constructor(IERC20 _token) public {
        associatedToken = _token;
    }

    function doSomethingThatRequiresERC20tokens() public {
        // The key here is to use ERC20's transferFrom method.
        // For this to work, the given address has to have enough balance,
        // and it has to allow this contract to transfer tokens from their account.
        // This can be done using ERC20's approve method/

        // If transferFrom fails, the transaction reverts. So if the transaction
        // does not revert, we know that the transer succeeded.

        // Using msg.sender here, the caller of this function.
        // Could be any address you like, though.
        // This transfers 100 tokens from msg.sender to this contract.
        associatedToken.transfer(msg.sender, address(this), 100);

        // Ok, now the tokens are transferred successfully, let's do some cool stuff!
        emit YayIReceivedTokens(100, msg.sender, associatedToken.balanceOf(address(this)));
    }

    event YayIReceivedTokens(uint256 amount, address fromAccount, uint256 totalBalance);
}