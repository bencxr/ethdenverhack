// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    uint8 private _decimals;

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_
    ) ERC20(name, symbol) {
        _decimals = decimals_;
        // Mint 1 million tokens to deployer for testing
        _mint(msg.sender, 1_000_000 * 10**decimals_);
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    // Optional: Add mint function for testing
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
