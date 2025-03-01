// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IPool.sol";

/**
 * @title HODLJar
 * @dev Contract representing a single HODL jar for a foster kid
 */
contract HODLJar is ReentrancyGuard {
    string public kidname;
    string public story;
    string public imageurl;
    address public fosterHome;
    address public donor;
    uint256 public age;
    uint256 public initialDeposit;
    uint256 public depositTimestamp;

    // USDC token contract
    IERC20 public immutable usdc;

    // MORE Markets contract
    IPool public immutable moreMarkets =
        IPool(0xbC92aaC2DBBF42215248B5688eB3D3d2b32F2c8d);

    // Fixed donation amount (in USDC, 0.1 with 6 decimals)
    uint256 public constant DONATION_AMOUNT = 0.001 * 10 ** 6;

    // Events
    event DonationReceived(address donor, uint256 amount);
    event YieldWithdrawn(address fosterHome, uint256 amount);
    event PrincipalWithdrawn(address fosterHome, uint256 amount);

    /**
     * @dev Constructor to initialize the HODL jar
     * @param _usdc Address of the USDC token contract
     * @param _kidname Kid's name
     * @param _imageurl Kid's image url
     * @param _story Kid's story
     * @param _age Kid's age
     * @param _fosterHome Address of the foster home
     */
    constructor(
        address _usdc,
        string memory _kidname,
        string memory _imageurl,
        string memory _story,
        uint256 _age,
        address _fosterHome
    ) {
        require(_usdc != address(0), "Invalid USDC address");
        require(bytes(_kidname).length > 0, "Name cannot be empty");
        require(_fosterHome != address(0), "Invalid foster home address");
        require(_age > 0 && _age < 18, "Age must be between 1 and 17");
        require(bytes(_imageurl).length > 0, "Invalid image url");

        usdc = IERC20(_usdc);

        kidname = _kidname;
        story = _story;
        fosterHome = _fosterHome;
        donor = address(0);
        age = _age;
        initialDeposit = 0;
        depositTimestamp = 0;
        imageurl = _imageurl;
    }

    /**
     * @dev Deposit USDC into the HODL jar
     * @param amount Amount of USDC to deposit
     */
    function deposit(uint256 amount) external nonReentrant {
        require(donor == address(0), "HODL jar already has a donor");
        require(
            amount >= DONATION_AMOUNT,
            "Must deposit exact donation amount"
        );

        // Transfer USDC from donor to this contract
        require(
            usdc.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );

        // Approve and deposit into MORE Markets
        usdc.approve(address(moreMarkets), amount);

        moreMarkets.supply(address(usdc), amount, address(this), 0);

        donor = msg.sender;
        initialDeposit = amount;
        depositTimestamp = block.timestamp;

        emit DonationReceived(msg.sender, amount);
    }

    /**
     * @dev Withdraw assets from the HODL jar
     * @param amount Amount of USDC to withdraw
     */
    function withdraw(uint256 amount) external nonReentrant {
        require(msg.sender == fosterHome, "Only foster home can withdraw");
        /*require(
            block.timestamp >= depositTimestamp + ((18 - age) * 365 days),
            "Cannot withdraw until kid turns 18"
        );*/

        moreMarkets.withdraw(address(usdc), type(uint256).max, address(this));

        // Transfer USDC to foster home
        require(usdc.transfer(fosterHome, amount), "Transfer failed");

        emit PrincipalWithdrawn(fosterHome, amount);
    }

    /**
     * @dev Get current yield for the HODL jar
     * @return Current yield amount
     */
    function getCurrentYield() external view returns (uint256) {
        require(donor != address(0), "HODL jar has no donor");

        uint256 currentBalance = moreMarkets.getBalance(
            address(this),
            address(usdc)
        );
        return
            currentBalance > initialDeposit
                ? currentBalance - initialDeposit
                : 0;
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
        return donor != address(0);
    }

    /**
     * @dev Get the time remaining until principal can be withdrawn
     * @return Time remaining in seconds
     */
    function getLockTimeRemaining() external view returns (uint256) {
        uint256 lockEndTime = depositTimestamp + ((18 - age) * 365 days);
        return
            block.timestamp >= lockEndTime ? 0 : lockEndTime - block.timestamp;
    }

    /**
     * @dev Get total assets in the HODL jar
     * @return Total assets amount
     */
    function totalAssets() public view returns (uint256) {
        return moreMarkets.getBalance(address(this), address(usdc));
    }
}
