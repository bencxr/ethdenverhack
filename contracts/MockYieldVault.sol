// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IYieldVault.sol";

contract MockYieldVault is IYieldVault {
    mapping(address => uint256) public balances;
    mapping(address => uint256) public shares;
    mapping(address => uint256) public yieldBalances;
    uint256 public apy = 500; // 5%

    // Receive ETH
    receive() external payable {}

    function deposit() external payable override returns (bool) {
        balances[msg.sender] += msg.value;
        shares[msg.sender] += msg.value; // 1:1 ratio for simplicity
        return true;
    }

    function withdraw(uint256 amount) external override returns (bool) {
        uint256 totalBalance = balances[msg.sender] + yieldBalances[msg.sender];
        require(totalBalance >= amount, "Insufficient balance");

        if (amount <= yieldBalances[msg.sender]) {
            yieldBalances[msg.sender] -= amount;
        } else {
            uint256 remainingAmount = amount - yieldBalances[msg.sender];
            yieldBalances[msg.sender] = 0;
            balances[msg.sender] -= remainingAmount;
        }

        // Reduce shares accordingly (1:1 ratio for simplicity)
        if (shares[msg.sender] >= amount) {
            shares[msg.sender] -= amount;
        } else {
            shares[msg.sender] = 0;
        }

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        return true;
    }

    function getBalance(
        address account
    ) external view override returns (uint256) {
        return balances[account] + yieldBalances[account];
    }

    function balanceOf(
        address account
    ) external view override returns (uint256) {
        return shares[account];
    }

    function convertToAssets(
        uint256 shareAmount
    ) external pure override returns (uint256) {
        // 1:1 ratio for simplicity
        return shareAmount;
    }

    function getCurrentAPY() external view override returns (uint256) {
        return apy;
    }

    // For testing: add yield to an account
    function addYield(address account, uint256 amount) external {
        yieldBalances[account] += amount;
    }
}
