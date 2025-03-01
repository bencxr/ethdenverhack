// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IMOREMarkets.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

/**
 * @title HODLJar
 * @dev ERC4626 compliant contract representing a single HODL jar for a foster kid
 */
contract HODLJar is ERC4626, ReentrancyGuard {
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
    IMOREMarkets public immutable moreMarkets =
        IMOREMarkets(0xbC92aaC2DBBF42215248B5688eB3D3d2b32F2c8d);

    // Fixed donation amount (in USDC, 1000 with 6 decimals)
    uint256 public constant DONATION_AMOUNT = 500 * 10 ** 6;

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
    )
        ERC4626(IERC20(_usdc))
        ERC20(
            string.concat("HODL Jar - ", _kidname),
            string.concat("HODL-", _kidname)
        )
    {
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
     * @dev Override deposit to enforce single donor and fixed amount
     */
    function deposit(
        uint256 assets,
        address receiver
    ) public virtual override returns (uint256) {
        require(donor == address(0), "HODL jar already has a donor");
        require(
            assets >= DONATION_AMOUNT,
            "Must deposit exact donation amount"
        );

        uint256 shares = super.deposit(assets, receiver);

        donor = msg.sender;
        initialDeposit = assets;
        depositTimestamp = block.timestamp;

        emit DonationReceived(msg.sender, assets);
        return shares;
    }

    /**
     * @dev Override withdraw to enforce lock until age 18
     */
    function withdraw(
        uint256 assets,
        address receiver,
        address owner
    ) public virtual override returns (uint256) {
        require(msg.sender == fosterHome, "Only foster home can withdraw");
        require(
            block.timestamp >= depositTimestamp + ((18 - age) * 365 days),
            "Cannot withdraw until kid turns 18"
        );

        return super.withdraw(assets, receiver, owner);
    }

    /**
     * @dev Override to integrate with MORE Markets
     */
    function totalAssets() public view virtual override returns (uint256) {
        return moreMarkets.getBalance(address(this), address(asset()));
    }

    /**
     * @dev Internal function to deposit assets into MORE Markets
     */
    function _deposit(
        address caller,
        address receiver,
        uint256 assets,
        uint256 shares
    ) internal virtual override {
        super._deposit(caller, receiver, assets, shares);

        IERC20(asset()).approve(address(moreMarkets), assets);
        require(
            moreMarkets.deposit(address(asset()), assets),
            "MORE Markets deposit failed"
        );
    }

    /**
     * @dev Internal function to withdraw assets from MORE Markets
     */
    function _withdraw(
        address caller,
        address receiver,
        address owner,
        uint256 assets,
        uint256 shares
    ) internal virtual override {
        require(
            moreMarkets.withdraw(address(asset()), assets),
            "MORE Markets withdrawal failed"
        );
        super._withdraw(caller, receiver, owner, assets, shares);
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
}
