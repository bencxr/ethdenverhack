// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract NFTCollection is ERC721Enumerable, Ownable {
    using Strings for uint256;

    // Mapping to store token URIs
    mapping(uint256 => string) private _tokenURIs;

    // Mapping for whitelisted addresses
    mapping(address => bool) public whitelist;

    // Token counter
    uint256 private _tokenIdCounter;

    constructor() ERC721("PaintingsByKids", "PBK") Ownable(msg.sender) {
        // Initialize with token ID counter at 0
        _tokenIdCounter = 0;
    }

    // Function to add addresses to whitelist (only owner)
    function addToWhitelist(address[] calldata addresses) external onlyOwner {
        for (uint256 i = 0; i < addresses.length; i++) {
            whitelist[addresses[i]] = true;
        }
    }

    // Function to remove addresses from whitelist (only owner)
    function removeFromWhitelist(
        address[] calldata addresses
    ) external onlyOwner {
        for (uint256 i = 0; i < addresses.length; i++) {
            whitelist[addresses[i]] = false;
        }
    }

    // Function to mint new NFT (only whitelisted addresses)
    function mint(string calldata uri) external {
        // require(whitelist[msg.sender], "Address is not whitelisted");
        // TODO: Remove this once we have a proper whitelist
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // Internal function to set token URI
    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal {
        require(
            _ownerOf(tokenId) != address(0),
            "URI set for nonexistent token"
        );
        _tokenURIs[tokenId] = _tokenURI;
    }

    // Function to get token URI
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        require(
            _ownerOf(tokenId) != address(0),
            "URI query for nonexistent token"
        );
        return _tokenURIs[tokenId];
    }

    // Function to check if an address is whitelisted
    function isWhitelisted(address account) public view returns (bool) {
        return whitelist[account];
    }
}
