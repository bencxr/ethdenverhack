// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IYieldVault.sol";

/**
 * @title HODLJar
 * @dev Contract representing a single HODL jar for a foster kid
 */
contract HODLJar {
    struct Kid {
        string name;
        string story;
        address fosterHome;
        address donor;
        uint256 age;
        uint256 initialDeposit;
        uint256 depositTimestamp;
        uint256 lockPeriodInYears;
    }

    // Single kid instance
    Kid public kid;
    
    // Yield vault contract
    IYieldVault public yieldVault;
    
    // Minimum lock period in years
    uint256 public constant MIN_LOCK_PERIOD = 1;
    
    // Fixed donation amount (in Flow tokens, 1000 with 18 decimals)
    uint256 public constant DONATION_AMOUNT = 1000 * 10**18;
    
    // Events
    event KidCreated(string name, address fosterHome, uint256 age);
    event DonationReceived(address donor, uint256 amount);
    event YieldWithdrawn(address fosterHome, uint256 amount);
    event PrincipalWithdrawn(address fosterHome, uint256 amount);
    
    /**
     * @dev Constructor to initialize the HODL jar
     * @param _yieldVault Address of the yield vault contract
     * @param _name Kid's name
     * @param _story Kid's story
     * @param _age Kid's age
     * @param _fosterHome Address of the foster home
     * @param _lockPeriodInYears Period in years until principal can be withdrawn
     */
    constructor(
        address _yieldVault,
        string memory _name,
        string memory _story,
        uint256 _age,
        address _fosterHome,
        uint256 _lockPeriodInYears
    ) {
        require(_yieldVault != address(0), "Invalid yield vault address");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(_fosterHome != address(0), "Invalid foster home address");
        require(_lockPeriodInYears >= MIN_LOCK_PERIOD, "Lock period too short");
        require(_age > 0, "Age must be greater than 0");

        yieldVault = IYieldVault(_yieldVault);
        
        kid = Kid({
            name: _name,
            story: _story,
            fosterHome: _fosterHome,
            donor: address(0),
            age: _age,
            initialDeposit: 0,
            depositTimestamp: 0,
            lockPeriodInYears: _lockPeriodInYears
        });
        
        emit KidCreated(_name, _fosterHome, _age);
    }

    /**
     * @dev Donate to the HODL jar
     */
    function donate() external payable {
        require(kid.donor == address(0), "HODL jar already has a donor");
        require(msg.value == DONATION_AMOUNT, "Donation amount must be 1000 FLOW");
        
        kid.donor = msg.sender;
        kid.initialDeposit = msg.value;
        kid.depositTimestamp = block.timestamp;
        
        // Deposit to yield vault
        bool success = yieldVault.deposit{value: msg.value}();
        require(success, "Deposit to yield vault failed");
        
        emit DonationReceived(msg.sender, msg.value);
    }
    
    /**
     * @dev Withdraw yield from the HODL jar
     */
    function withdrawYield() external {
        require(kid.donor != address(0), "HODL jar has no donor");
        require(msg.sender == kid.fosterHome, "Only foster home can withdraw yield");
        
        // Get current balance from yield vault
        uint256 currentBalance = yieldVault.getBalance(address(this));
        
        // Calculate yield
        uint256 yieldAmount = currentBalance > kid.initialDeposit ? 
                             currentBalance - kid.initialDeposit : 0;
        
        require(yieldAmount > 0, "No yield available");
        
        // Withdraw from yield vault
        bool success = yieldVault.withdraw(yieldAmount);
        require(success, "Withdrawal from yield vault failed");
        
        // Transfer to foster home
        payable(kid.fosterHome).transfer(yieldAmount);
        
        emit YieldWithdrawn(kid.fosterHome, yieldAmount);
    }
    
    /**
     * @dev Withdraw principal from the HODL jar after lock period
     */
    function withdrawPrincipal() external {
        require(kid.donor != address(0), "HODL jar has no donor");
        require(msg.sender == kid.fosterHome, "Only foster home can withdraw principal");
        
        // Check if lock period has passed
        uint256 lockPeriodInSeconds = kid.lockPeriodInYears * 365 days;
        require(
            block.timestamp >= kid.depositTimestamp + lockPeriodInSeconds,
            "Lock period has not passed yet"
        );
        
        // Get current balance from yield vault
        uint256 currentBalance = yieldVault.getBalance(address(this));
        
        // Withdraw entire balance from yield vault
        bool success = yieldVault.withdraw(currentBalance);
        require(success, "Withdrawal from yield vault failed");
        
        // Transfer to foster home
        payable(kid.fosterHome).transfer(currentBalance);
        
        // Reset kid data to avoid duplicate withdrawals
        kid.initialDeposit = 0;
        
        emit PrincipalWithdrawn(kid.fosterHome, currentBalance);
    }
    
    /**
     * @dev Get current yield for the HODL jar
     * @return Current yield amount
     */
    function getCurrentYield() external view returns (uint256) {
        require(kid.donor != address(0), "HODL jar has no donor");
        
        // Get current balance from yield vault
        uint256 currentBalance = yieldVault.getBalance(address(this));
        
        // Calculate yield
        uint256 yieldAmount = currentBalance > kid.initialDeposit ? 
                             currentBalance - kid.initialDeposit : 0;
        
        return yieldAmount;
    }
    
    /**
     * @dev Get current APY from the vault
     * @return Current APY in basis points
     */
    function getCurrentAPY() external view returns (uint256) {
        return yieldVault.getCurrentAPY();
    }
    
    /**
     * @dev Check if the kid has been sponsored
     * @return Boolean indicating if kid has been sponsored
     */
    function isSponsored() external view returns (bool) {
        return kid.donor != address(0);
    }
    
    /**
     * @dev Get the time remaining until principal can be withdrawn
     * @return Time remaining in seconds
     */
    function getLockTimeRemaining() external view returns (uint256) {
        uint256 lockEndTime = kid.depositTimestamp + (kid.lockPeriodInYears * 365 days);
        
        if (block.timestamp >= lockEndTime) {
            return 0;
        }
        
        return lockEndTime - block.timestamp;
    }
    
    // Fallback function to receive FLOW tokens
    receive() external payable {}
}