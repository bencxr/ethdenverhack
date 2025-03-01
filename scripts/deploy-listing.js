// This script deploys the HODL jar listing contract on Flow EVM
const hre = require("hardhat");

async function main() {
    console.log("Deploying HODL jar listing contract...");

    // Get the contract factory
    const HODLJarListing = await hre.ethers.getContractFactory("HODLJarListing");

    // Deploy the HODL jar listing contract
    const hodlJarListing = await HODLJarListing.deploy();
    await hodlJarListing.waitForDeployment();
    console.log("HODL Jar Listing deployed to:", await hodlJarListing.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 