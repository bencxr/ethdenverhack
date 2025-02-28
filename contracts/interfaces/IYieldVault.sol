// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IYieldVault
 * @dev Interface for the ERC4626-compliant yield-generating vault
 */
interface IYieldVault {
    function deposit() external payable returns (bool);
    function withdraw(uint256 amount) external returns (bool);
    function getBalance(address account) external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function convertToAssets(uint256 shares) external view returns (uint256);
    function getCurrentAPY() external view returns (uint256);
}