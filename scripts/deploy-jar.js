// This script deploys the HODL jar system on Flow EVM
const hre = require("hardhat");

async function main() {
  console.log("Deploying HODL jar system...");

  // Get the contract factory
  const HODLJar = await hre.ethers.getContractFactory("HODLJar");

  // Use existing contract addresses instead of deploying mocks
  const usdcAddress = "0xF1815bd50389c46847f0Bda824eC8da914045D14";
  const hodlJarListingAddress = "0xE1e4514c4eDaFD43d6bCB073EB3bB3515f8C479c";
  const fosterHomeAddress = "0x4Ab9B0FD0B98549fe3eEc614109D93553E8235B1";

  console.log("Using USDC at:", usdcAddress);

  // Deploy the HODL jar contract
  const hodlJar = await HODLJar.deploy(
    usdcAddress,                      // _usdc
    "Benny",                          // _name
    "This is Benny's story",  // _story
    3, // _age
    fosterHomeAddress, // _fosterHome
    hodlJarListingAddress // hodlJarListing
  );
  await hodlJar.waitForDeployment();
  console.log("HODL Jar deployed to:", await hodlJar.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
