// This script deploys the HODL jar system on Flow EVM
const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying HODL jar system...");

  // Get the contract factories
  const FlowYieldVault = await ethers.getContractFactory("FlowYieldVault");
  const HODLJar = await ethers.getContractFactory("HODLJar");

  // For testing purposes, we'll deploy a mock MORE protocol
  // In production, you would use the actual MORE protocol address
  const MockMOREProtocol = await ethers.getContractFactory("MockMOREProtocol");
  const mockMoreProtocol = await MockMOREProtocol.deploy();
  await mockMoreProtocol.deployed();
  console.log("Mock MORE Protocol deployed to:", mockMoreProtocol.address);

  // Deploy the yield vault with the MORE protocol address
  const flowYieldVault = await FlowYieldVault.deploy(mockMoreProtocol.address);
  await flowYieldVault.deployed();
  console.log("Flow Yield Vault deployed to:", flowYieldVault.address);

  // Deploy the HODL jar contract with the yield vault address
  const hodlJar = await HODLJar.deploy(flowYieldVault.address);
  await hodlJar.deployed();
  console.log("HODL Jar contract deployed to:", hodlJar.address);

  console.log("Deployment complete!");

  // Verify contracts if deploying to a public network
  if (network.name !== "localhost" && network.name !== "hardhat") {
    console.log("Waiting for block confirmations...");
    
    // Wait for block confirmations
    await flowYieldVault.deployTransaction.wait(6);
    await hodlJar.deployTransaction.wait(6);
    
    console.log("Verifying contracts...");
    
    // Verify the yield vault
    await hre.run("verify:verify", {
      address: flowYieldVault.address,
      constructorArguments: [mockMoreProtocol.address],
    });
    
    // Verify the HODL jar
    await hre.run("verify:verify", {
      address: hodlJar.address,
      constructorArguments: [flowYieldVault.address],
    });
    
    console.log("Verification complete!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });