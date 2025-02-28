// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockMOREProtocol
 * @dev Mock implementation of the MORE yield protocol for testing
 */
contract MockMOREProtocol is Ownable {
    // Mapping of account balances
    mapping(address => uint256) private balances;
    
    // Total deposits in the protocol
    uint256 private totalDeposits;
    
    // Current APY in basis points (e.g., 500 = 5%)
    uint256 public apy = 500;
    
    // Events
    event Deposited(address indexed account, uint256 amount);
    event Withdrawn(address indexed account, uint256 amount);
    event APYUpdated(uint256 newApy);
    
    /**
     * @dev Constructor
     */
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Deposit tokens into the protocol
     * @param amount Amount to deposit
     * @return Amount deposited
     */
    function deposit(uint256 amount) external payable returns (uint256) {
        require(amount > 0, "Amount must be greater than 0");
        
        // Transfer tokens from sender
        IERC20(msg.sender).transferFrom(msg.sender, address(this), amount);
        
        // Update balances
        balances[msg.sender] += amount;
        totalDeposits += amount;
        
        emit Deposited(msg.sender, amount);
        
        return amount;
    }
    
    /**
     * @dev Withdraw tokens from the protocol
     * @param amount Amount to withdraw
     * @return Amount withdrawn
     */
    function withdraw(uint256 amount) external returns (uint256) {
        require(amount > 0, "Amount must be greater than 0");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        // Update balances
        balances[msg.sender] -= amount;
        totalDeposits -= amount;
        
        // Transfer tokens to sender
        IERC20(address(this)).transfer(msg.sender, amount);
        
        emit Withdrawn(msg.sender, amount);
        
        return amount;
    }
    
    /**
     * @dev Get the current APY
     * @return APY in basis points
     */
    function getAPY() external view returns (uint256) {
        return apy;
    }
    
    /**
     * @dev Set the APY (only owner)
     * @param _apy APY in basis points
     */
    function setAPY(uint256 _apy) external onlyOwner {
        apy = _apy;
        emit APYUpdated(_apy);
    }
    
    /**
     * @dev Get the balance of an account
     * @param account Address of the account
     * @return Balance of the account
     */
    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }
    
    /**
     * @dev Get the total deposits
     * @return Total deposits
     */
    function getTotalDeposits() external view returns (uint256) {
        return totalDeposits;
    }
    
    /**
     * @dev Add yield to an account (for testing)
     * @param account Address of the account
     * @param amount Amount of yield to add
     */
    function addYieldToAccount(address account, uint256 amount) external onlyOwner {
        balances[account] += amount;
        totalDeposits += amount;
    }
}