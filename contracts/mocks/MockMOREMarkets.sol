// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IMOREMarkets.sol";

contract MockMOREMarkets is IMOREMarkets, Ownable {
    // Mapping of token balances for each account
    mapping(address => mapping(address => uint256)) private balances;
    
    // APY for each token (in basis points)
    mapping(address => uint256) private apyRates;
    
    constructor() Ownable(msg.sender) {}
    
    function deposit(address token, uint256 amount) external override returns (bool) {
        require(amount > 0, "Amount must be greater than 0");
        
        // Transfer tokens from sender
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        
        // Update balance
        balances[msg.sender][token] += amount;
        
        return true;
    }
    
    function withdraw(address token, uint256 amount) external override returns (bool) {
        require(amount > 0, "Amount must be greater than 0");
        require(balances[msg.sender][token] >= amount, "Insufficient balance");
        
        // Update balance
        balances[msg.sender][token] -= amount;
        
        // Transfer tokens back to sender
        IERC20(token).transfer(msg.sender, amount);
        
        return true;
    }
    
    function getBalance(address account, address token) external view override returns (uint256) {
        return balances[account][token];
    }
    
    function getAPY(address token) external view override returns (uint256) {
        return apyRates[token];
    }
    
    // Admin function to set APY for testing
    function setAPY(address token, uint256 apy) external onlyOwner {
        apyRates[token] = apy;
    }
    
    // Admin function to add yield for testing
    function addYield(address account, address token, uint256 amount) external onlyOwner {
        balances[account][token] += amount;
    }
}