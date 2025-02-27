const hre = require("hardhat");

async function main() {
    // Get the contract factory
    const NFTCollection = await hre.ethers.getContractFactory("NFTCollection");

    // Deploy the contract
    const nftCollection = await NFTCollection.deploy();
    await nftCollection.waitForDeployment();

    const address = await nftCollection.getAddress();
    console.log("NFTCollection deployed to:", address);
}

// Handle errors
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 