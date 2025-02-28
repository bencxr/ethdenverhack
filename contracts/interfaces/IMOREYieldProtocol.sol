// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IMOREYieldProtocol
 * @dev Interface for interacting with the MORE yield protocol on Flow EVM
 */
interface IMOREYieldProtocol {
    function deposit(uint256 amount) external payable returns (uint256);
    function withdraw(uint256 amount) external returns (uint256);
    function getAPY() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
}