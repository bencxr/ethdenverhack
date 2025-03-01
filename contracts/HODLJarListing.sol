// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./HODLJar.sol";

/**
 * @title HODLJarListing
 * @dev Contract to track all deployed HODL jars and their sponsorship status
 */
contract HODLJarListing {
    // Array to store all HODL jar addresses
    address[] public hodlJars;

    // Mapping to track if a HODL jar is sponsored
    mapping(address => bool) public isSponsored;

    // Mapping to check if an address is a registered HODL jar
    mapping(address => bool) public isRegisteredJar;

    // Events
    event HODLJarAdded(address indexed jarAddress);
    event HODLJarSponsored(address indexed jarAddress, address indexed donor);

    /**
     * @dev Constructor to initialize the listing contract
     */
    constructor() {}

    /**
     * @dev Add a new HODL jar to the listing
     */
    function addHODLJar() external {
        address jarAddress = msg.sender;
        // require(!isRegisteredJar[jarAddress], "Jar already registered");

        hodlJars.push(jarAddress);
        isRegisteredJar[jarAddress] = true;

        emit HODLJarAdded(jarAddress);
    }

    /**
     * @dev Update the sponsorship status of a HODL jar
     */
    function updateSponsorshipStatus() external {
        require(
            isRegisteredJar[msg.sender],
            "Only registered jars can update status"
        );
        require(!isSponsored[msg.sender], "Jar already marked as sponsored");

        HODLJar jar = HODLJar(msg.sender);
        address donor = jar.donor();

        require(donor != address(0), "Jar has no donor");

        isSponsored[msg.sender] = true;

        emit HODLJarSponsored(msg.sender, donor);
    }

    /**
     * @dev Get all HODL jars
     * @return Array of all HODL jar addresses
     */
    function getAllHODLJars() external view returns (address[] memory) {
        return hodlJars;
    }

    /**
     * @dev Get all unsponsored HODL jars
     * @return Array of unsponsored HODL jar addresses
     */
    function getUnsponsoredHODLJars() external view returns (address[] memory) {
        uint256 count = 0;

        // Count unsponsored jars
        for (uint256 i = 0; i < hodlJars.length; i++) {
            if (!isSponsored[hodlJars[i]]) {
                count++;
            }
        }

        // Create array of unsponsored jars
        address[] memory unsponsoredJars = new address[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < hodlJars.length; i++) {
            if (!isSponsored[hodlJars[i]]) {
                unsponsoredJars[index] = hodlJars[i];
                index++;
            }
        }

        return unsponsoredJars;
    }

    /**
     * @dev Get total number of HODL jars
     * @return Total number of jars
     */
    function getTotalJars() external view returns (uint256) {
        return hodlJars.length;
    }

    /**
     * @dev Get number of sponsored HODL jars
     * @return Number of sponsored jars
     */
    function getSponsoredJarsCount() external view returns (uint256) {
        uint256 count = 0;

        for (uint256 i = 0; i < hodlJars.length; i++) {
            if (isSponsored[hodlJars[i]]) {
                count++;
            }
        }

        return count;
    }
}
