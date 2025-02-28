// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IMOREMarkets.sol";

/**
 * @title HODLJar
 * @dev Contract representing a single HODL jar for a foster kid
 */
contract HODLJar is ReentrancyGuard {
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
    
    // USDC token contract
    IERC20 public immutable usdc;
    
    // MORE Markets contract
    IMOREMarkets public immutable moreMarkets;
    
    // Minimum lock period in years
    uint256 public constant MIN_LOCK_PERIOD = 1;
    
    // Fixed donation amount (in USDC, 1000 with 6 decimals)
    uint256 public constant DONATION_AMOUNT = 1000 * 10**6;
    
    // Events
    event KidCreated(string name, address fosterHome, uint256 age);
    event DonationReceived(address donor, uint256 amount);
    event YieldWithdrawn(address fosterHome, uint256 amount);
    event PrincipalWithdrawn(address fosterHome, uint256 amount);
    
    /**
     * @dev Constructor to initialize the HODL jar
     * @param _usdc Address of the USDC token contract
     * @param _moreMarkets Address of the MORE Markets contract
     * @param _name Kid's name
     * @param _story Kid's story
     * @param _age Kid's age
     * @param _fosterHome Address of the foster home
     * @param _lockPeriodInYears Period in years until principal can be withdrawn
     */
    constructor(
        address _usdc,
        address _moreMarkets,
        string memory _name,
        string memory _story,
        uint256 _age,
        address _fosterHome,
        uint256 _lockPeriodInYears
    ) {
        require(_usdc != address(0), "Invalid USDC address");
        require(_moreMarkets != address(0), "Invalid MORE Markets address");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(_fosterHome != address(0), "Invalid foster home address");
        require(_lockPeriodInYears >= MIN_LOCK_PERIOD, "Lock period too short");
        require(_age > 0, "Age must be greater than 0");

        usdc = IERC20(_usdc);
        moreMarkets = IMOREMarkets(_moreMarkets);
        
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
    function donate() external nonReentrant {
        require(kid.donor == address(0), "HODL jar already has a donor");
        
        // Transfer USDC from donor to this contract
        require(usdc.transferFrom(msg.sender, address(this), DONATION_AMOUNT), 
                "USDC transfer failed");
        
        // Approve MORE Markets to spend USDC
        usdc.approve(address(moreMarkets), DONATION_AMOUNT);
        
        // Deposit into MORE Markets
        require(moreMarkets.deposit(address(usdc), DONATION_AMOUNT), 
                "MORE Markets deposit failed");
        
        kid.donor = msg.sender;
        kid.initialDeposit = DONATION_AMOUNT;
        kid.depositTimestamp = block.timestamp;
        
        emit DonationReceived(msg.sender, DONATION_AMOUNT);
    }
    
    /**
     * @dev Withdraw yield from the HODL jar
     */
    function withdrawYield() external nonReentrant {
        require(kid.donor != address(0), "HODL jar has no donor");
        require(msg.sender == kid.fosterHome, "Only foster home can withdraw yield");
        
        // Get current balance from MORE Markets
        uint256 currentBalance = moreMarkets.getBalance(address(this), address(usdc));
        
        // Calculate yield
        uint256 yieldAmount = currentBalance > kid.initialDeposit ? 
                             currentBalance - kid.initialDeposit : 0;
        
        require(yieldAmount > 0, "No yield available");
        
        // Withdraw from MORE Markets
        require(moreMarkets.withdraw(address(usdc), yieldAmount), 
                "MORE Markets withdrawal failed");
        
        // Transfer USDC to foster home
        require(usdc.transfer(kid.fosterHome, yieldAmount), 
                "USDC transfer failed");
        
        emit YieldWithdrawn(kid.fosterHome, yieldAmount);
    }
    
    /**
     * @dev Withdraw principal from the HODL jar after lock period
     */
    function withdrawPrincipal() external nonReentrant {
        require(kid.donor != address(0), "HODL jar has no donor");
        require(msg.sender == kid.fosterHome, "Only foster home can withdraw principal");
        
        // Check if lock period has passed
        uint256 lockPeriodInSeconds = kid.lockPeriodInYears * 365 days;
        require(
            block.timestamp >= kid.depositTimestamp + lockPeriodInSeconds,
            "Lock period has not passed yet"
        );
        
        // Get current balance from MORE Markets
        uint256 currentBalance = moreMarkets.getBalance(address(this), address(usdc));
        
        // Withdraw entire balance from MORE Markets
        require(moreMarkets.withdraw(address(usdc), currentBalance), 
                "MORE Markets withdrawal failed");
        
        // Transfer USDC to foster home
        require(usdc.transfer(kid.fosterHome, currentBalance), 
                "USDC transfer failed");
        
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
        
        uint256 currentBalance = moreMarkets.getBalance(address(this), address(usdc));
        return currentBalance > kid.initialDeposit ? currentBalance - kid.initialDeposit : 0;
    }
    
    /**
     * @dev Get current APY from the vault
     * @return Current APY in basis points
     */
    function getCurrentAPY() external view returns (uint256) {
        return moreMarkets.getAPY(address(usdc));
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
        return block.timestamp >= lockEndTime ? 0 : lockEndTime - block.timestamp;
    }
    
    // Fallback function to receive USDC tokens
    receive() external payable {}
}