// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./HODLJar.sol";

/**
 * @title HODLJarFactory
 * @dev Factory contract for creating and managing HODLJar instances
 */
contract HODLJarFactory {
    // USDC token address
    address public immutable usdcAddress;

    // Array to store all created HODLJars
    address[] public allHODLJars;

    // Mapping from foster home address to their HODLJars
    mapping(address => address[]) public fosterHomeToJars;

    // Events
    event HODLJarCreated(
        address indexed jarAddress,
        address indexed fosterHome,
        string kidname,
        uint256 age
    );

    /**
     * @dev Constructor to initialize the factory
     * @param _usdcAddress Address of the USDC token contract
     */
    constructor(address _usdcAddress) {
        require(_usdcAddress != address(0), "Invalid USDC address");
        usdcAddress = _usdcAddress;
    }

    /**
     * @dev Create a new HODLJar
     * @param _kidname Kid's name
     * @param _imageurl Kid's image url
     * @param _story Kid's story
     * @param _age Kid's age
     * @param _fosterHome Address of the foster home
     * @return Address of the newly created HODLJar
     */
    function createHODLJar(
        string memory _kidname,
        string memory _imageurl,
        string memory _story,
        uint256 _age,
        address _fosterHome
    ) external returns (address) {
        // Anyone can create a jar - no authorization check

        HODLJar newJar = new HODLJar(
            usdcAddress,
            _kidname,
            _imageurl,
            _story,
            _age,
            _fosterHome
        );

        address jarAddress = address(newJar);

        // Store the new jar
        allHODLJars.push(jarAddress);
        fosterHomeToJars[_fosterHome].push(jarAddress);

        emit HODLJarCreated(jarAddress, _fosterHome, _kidname, _age);

        return jarAddress;
    }

    /**
     * @dev Get all HODLJars
     * @return Array of all HODLJar addresses
     */
    function getAllHODLJars() external view returns (address[] memory) {
        return allHODLJars;
    }

    /**
     * @dev Get all HODLJars for a specific foster home
     * @param _fosterHome Address of the foster home
     * @return Array of HODLJar addresses for the foster home
     */
    function getJarsByFosterHome(
        address _fosterHome
    ) external view returns (address[] memory) {
        return fosterHomeToJars[_fosterHome];
    }

    /**
     * @dev Get the total number of HODLJars created
     * @return Total number of HODLJars
     */
    function getTotalJars() external view returns (uint256) {
        return allHODLJars.length;
    }
}
