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

    // Skip verification for Flow EVM mainnet
    if (network.name !== "localhost" &&
        network.name !== "hardhat" &&
        network.name !== "flowEvmMainnet") {
        console.log("Waiting for block confirmations...");

        await hodlJarListing.waitForDeployment();

        // Wait for 6 blocks
        const currentBlock = await ethers.provider.getBlockNumber();
        const targetBlock = currentBlock + 6;
        while ((await ethers.provider.getBlockNumber()) < targetBlock) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log("Verifying contract...");

        await hre.run("verify:verify", {
            address: await hodlJarListing.getAddress(),
            constructorArguments: [],
        });

        console.log("Verification complete!");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 