// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IMOREMarkets {
    function deposit(address token, uint256 amount) external returns (bool);
    function withdraw(address token, uint256 amount) external returns (bool);
    function getBalance(address account, address token) external view returns (uint256);
    function getAPY(address token) external view returns (uint256);
}