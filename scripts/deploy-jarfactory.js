// This script deploys the HODLJarFactory contract on Flow EVM
const hre = require("hardhat");

async function main() {
    console.log("Deploying HODLJarFactory...");

    // Get the contract factory
    const HODLJarFactory = await hre.ethers.getContractFactory("HODLJarFactory");

    // Use existing USDC contract address
    const usdcAddress = "0xF1815bd50389c46847f0Bda824eC8da914045D14";

    console.log("Using USDC at:", usdcAddress);

    // Deploy the HODLJarFactory contract
    const hodlJarFactory = await HODLJarFactory.deploy(usdcAddress);

    await hodlJarFactory.waitForDeployment();

    const factoryAddress = await hodlJarFactory.getAddress();
    console.log("HODLJarFactory deployed to:", factoryAddress);

    // Log some additional information
    console.log("\nFactory contract is now ready to create HODLJars");
    console.log("You can create a new jar by calling createHODLJar() on the factory");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 