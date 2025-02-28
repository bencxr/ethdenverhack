// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IMOREYieldProtocol.sol";
import "./tokens/FlowWrappedToken.sol";

/**
 * @title FlowYieldVault
 * @dev An ERC4626-compliant yield vault that connects to the MORE yield protocol
 */
contract FlowYieldVault is ERC4626, Ownable {
    using SafeERC20 for IERC20;

    FlowWrappedToken public immutable wFlow;
    IMOREYieldProtocol public moreYieldProtocol;

    // Events
    event YieldAdded(uint256 amount);
    event ProtocolConnected(address indexed protocolAddress);
    event YieldHarvested(uint256 amount);

    /**
     * @dev Constructor to initialize the vault with the wrapped Flow token
     * @param _moreYieldProtocol Address of the MORE yield protocol
     */
    constructor(
        address _moreYieldProtocol
    )
        ERC4626(IERC20(address(new FlowWrappedToken())))
        ERC20("Flow Yield Vault", "FYV")
        Ownable(msg.sender)
    {
        require(
            _moreYieldProtocol != address(0),
            "Invalid MORE protocol address"
        );
        wFlow = FlowWrappedToken(payable(address(asset())));
        moreYieldProtocol = IMOREYieldProtocol(_moreYieldProtocol);
        emit ProtocolConnected(_moreYieldProtocol);
    }

    /**
     * @dev Deposit Flow tokens into the vault
     * @return Boolean indicating success
     */
    function deposit(uint256 amount) external payable returns (bool) {
        require(msg.value > 0, "Amount must be greater than 0");

        // Convert Flow to wFlow first by depositing directly to wFlow contract
        wFlow.deposit{value: msg.value}();

        // Transfer the wFlow tokens from this contract to the caller
        // This step is essential for the ERC4626 deposit function to work correctly
        IERC20(address(wFlow)).transfer(msg.sender, msg.value);

        // Now the sender has wFlow tokens, so they need to approve the vault
        // This would normally be done by the caller before calling deposit

        // Deposit into the vault using ERC4626 functionality
        // The caller needs to have approved this contract to spend their wFlow tokens
        // deposit(msg.value, msg.sender);

        // Instead of using the ERC4626 deposit function, handle deposit manually
        IERC20(address(wFlow)).transferFrom(
            msg.sender,
            address(this),
            msg.value
        );

        // Mint shares to the sender
        _mint(msg.sender, msg.value);

        // Deposit into MORE yield protocol
        IERC20(address(wFlow)).approve(address(moreYieldProtocol), msg.value);
        moreYieldProtocol.deposit(amount);

        return true;
    }

    /**
     * @dev Wrapper to withdraw Flow tokens from the vault
     * @param amount Amount of Flow tokens to withdraw
     * @return Boolean indicating success
     */
    function withdraw(uint256 amount) external returns (bool) {
        require(amount > 0, "Amount must be greater than 0");

        // Calculate shares to burn
        // uint256 shares = previewWithdraw(amount);

        // Withdraw from MORE yield protocol
        uint256 receivedAmount = moreYieldProtocol.withdraw(amount);
        require(receivedAmount >= amount, "Yield protocol withdrawal failed");

        // Withdraw assets from the vault using ERC4626 functionality
        withdraw(amount, msg.sender, msg.sender);

        // Convert wFlow back to Flow
        wFlow.withdraw(amount);

        // Transfer Flow tokens to the sender
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Flow transfer failed");

        return true;
    }

    /**
     * @dev Get the balance of an account in the vault
     * @param account Address of the account
     * @return Balance in underlying assets (Flow tokens)
     */
    function getBalance(address account) external view returns (uint256) {
        return convertToAssets(balanceOf(account));
    }

    /**
     * @dev Get the total assets in the vault
     * @return Total assets
     */
    function getTotalDeposits() external view returns (uint256) {
        return totalAssets();
    }

    /**
     * @dev Get the current APY from the MORE protocol
     * @return Current APY in basis points (e.g., 500 = 5%)
     */
    function getCurrentAPY() external view returns (uint256) {
        return moreYieldProtocol.getAPY();
    }

    /**
     * @dev Harvest yield from the MORE protocol (only owner)
     * @return Amount of yield harvested
     */
    function harvestYield() external onlyOwner returns (uint256) {
        // Calculate total assets in the MORE protocol
        uint256 totalInProtocol = moreYieldProtocol.balanceOf(address(this));

        // Calculate total shares outstanding
        uint256 totalSharesValue = convertToAssets(totalSupply());

        // If there's yield (protocol balance > shares value), harvest it
        if (totalInProtocol > totalSharesValue) {
            uint256 yieldAmount = totalInProtocol - totalSharesValue;

            // Withdraw only the yield amount from the protocol
            moreYieldProtocol.withdraw(yieldAmount);

            emit YieldHarvested(yieldAmount);
            return yieldAmount;
        }

        return 0;
    }

    /**
     * @dev Distribute harvested yield to vault (only owner)
     */
    function distributeYield() external payable onlyOwner {
        require(msg.value > 0, "Amount must be greater than 0");

        // Convert Flow to wFlow and send to the MORE protocol
        wFlow.deposit{value: msg.value}();
        IERC20(address(wFlow)).approve(address(moreYieldProtocol), msg.value);
        moreYieldProtocol.deposit{value: 0}(msg.value);

        emit YieldAdded(msg.value);
    }

    /**
     * @dev Update MORE yield protocol address (only owner)
     * @param _newProtocol Address of the new MORE yield protocol
     */
    function updateYieldProtocol(address _newProtocol) external onlyOwner {
        require(_newProtocol != address(0), "Invalid protocol address");

        // Withdraw all assets from the old protocol
        uint256 totalInProtocol = moreYieldProtocol.balanceOf(address(this));
        if (totalInProtocol > 0) {
            moreYieldProtocol.withdraw(totalInProtocol);
        }

        // Update to new protocol
        moreYieldProtocol = IMOREYieldProtocol(_newProtocol);

        // Deposit all assets to the new protocol
        uint256 wFlowBalance = IERC20(address(wFlow)).balanceOf(address(this));
        if (wFlowBalance > 0) {
            IERC20(address(wFlow)).approve(
                address(moreYieldProtocol),
                wFlowBalance
            );
            moreYieldProtocol.deposit{value: 0}(wFlowBalance);
        }

        emit ProtocolConnected(_newProtocol);
    }

    /**
     * @dev Override totalAssets to include assets in the MORE protocol
     * @return Total assets managed by this vault
     */
    function totalAssets() public view override returns (uint256) {
        return moreYieldProtocol.balanceOf(address(this));
    }

    // Override required by ERC4626
    function _decimalsOffset() internal pure override returns (uint8) {
        return 0;
    }

    // Fallback function to receive Flow tokens
    receive() external payable {
        emit YieldAdded(msg.value);
    }
}
