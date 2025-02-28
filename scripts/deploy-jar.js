// This script deploys the HODL jar system on Flow EVM
const hre = require("hardhat");

async function main() {
  console.log("Deploying HODL jar system...");

  // Get the contract factories
  const HODLJar = await hre.ethers.getContractFactory("HODLJar");
  const MockMOREMarkets = await hre.ethers.getContractFactory("MockMOREMarkets");

  // Deploy mock MORE Markets for testing
  const mockMoreMarkets = await MockMOREMarkets.deploy();
  await mockMoreMarkets.waitForDeployment();
  console.log("Mock MORE Markets deployed to:", await mockMoreMarkets.getAddress());

  // Deploy USDC mock for testing
  const MockUSDC = await hre.ethers.getContractFactory("MockERC20");
  const mockUSDC = await MockUSDC.deploy("USD Coin", "USDC", 6);
  await mockUSDC.waitForDeployment();
  console.log("Mock USDC deployed to:", await mockUSDC.getAddress());

  // Deploy the HODL jar contract
  const hodlJar = await HODLJar.deploy(
    await mockUSDC.getAddress(),      // _usdc
    await mockMoreMarkets.getAddress(), // _moreMarkets
    "Timmy",                          // _name
    "This is a test HODL jar story",  // _story
    10,                               // _age
    "0x1234567890123456789012345678901234567890" // _fosterHome
  );
  await hodlJar.waitForDeployment();
  console.log("HODL Jar deployed to:", await hodlJar.getAddress());

  // Skip verification for Flow EVM mainnet
  if (network.name !== "localhost" && 
      network.name !== "hardhat" && 
      network.name !== "flowEvmMainnet") {
    console.log("Waiting for block confirmations...");
    
    await mockMoreMarkets.waitForDeployment();
    await mockUSDC.waitForDeployment();
    await hodlJar.waitForDeployment();
    
    // Wait for 6 blocks
    const currentBlock = await ethers.provider.getBlockNumber();
    const targetBlock = currentBlock + 6;
    while ((await ethers.provider.getBlockNumber()) < targetBlock) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log("Verifying contracts...");
    
    await hre.run("verify:verify", {
      address: await mockUSDC.getAddress(),
      constructorArguments: ["USD Coin", "USDC", 6],
    });

    await hre.run("verify:verify", {
      address: await mockMoreMarkets.getAddress(),
      constructorArguments: [],
    });

    await hre.run("verify:verify", {
      address: await hodlJar.getAddress(),
      constructorArguments: [
        await mockUSDC.getAddress(),
        await mockMoreMarkets.getAddress(),
        "Timmy",
        "This is a test HODL jar story",
        10,
        "0x1234567890123456789012345678901234567890"
      ],
    });
    
    console.log("Verification complete!");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
