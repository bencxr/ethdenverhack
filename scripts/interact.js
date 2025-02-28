const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  // Get contract addresses from .env or command line arguments
  const hodlJarAddress = process.env.HODL_JAR_ADDRESS;
  const yieldVaultAddress = process.env.YIELD_VAULT_ADDRESS;
  
  if (!hodlJarAddress || !yieldVaultAddress) {
    console.error("Please set HODL_JAR_ADDRESS and YIELD_VAULT_ADDRESS in your .env file");
    return;
  }
  
  // Get signers
  const [deployer, fosterHome, donor] = await ethers.getSigners();
  
  // Get contract instances
  const hodlJar = await ethers.getContractAt("HODLJar", hodlJarAddress);
  const yieldVault = await ethers.getContractAt("FlowYieldVault", yieldVaultAddress);
  
  console.log("Interacting with HODLJar at:", hodlJarAddress);
  
  // Create a new HODL jar
  const kidName = "John Doe";
  const kidStory = "A bright kid with big dreams!";
  const lockPeriodInYears = 5;
  
  console.log(`Creating HODL jar for ${kidName}...`);
  const createTx = await hodlJar.connect(fosterHome).createHODLJar(
    kidName,
    kidStory,
    fosterHome.address,
    lockPeriodInYears
  );
  await createTx.wait();
  
  // Get the created jar ID
  const jarIds = await hodlJar.getAllHODLJarIds();
  const jarId = jarIds[jarIds.length - 1];
  console.log(`HODL jar created with ID: ${jarId}`);
  
  // Donate to the HODL jar
  const donationAmount = ethers.utils.parseEther("1000"); // 1000 FLOW tokens
  console.log(`${donor.address} donating ${ethers.utils.formatEther(donationAmount)} FLOW tokens...`);
  const donateTx = await hodlJar.connect(donor).donate(jarId, {
    value: donationAmount
  });
  await donateTx.wait();
  console.log("Donation successful!");
  
  // Check if the jar is sponsored
  const isSponsored = await hodlJar.isSponsored(jarId);
  console.log(`Is the HODL jar sponsored? ${isSponsored}`);
  
  // Get kid data
  const kidData = await hodlJar.getKidData(jarId);
  console.log("Kid data:");
  console.log(`- Name: ${kidData[0]}`);
  console.log(`- Story: ${kidData[1]}`);
  console.log(`- Foster Home: ${kidData[2]}`);
  console.log(`- Donor: ${kidData[3]}`);
  console.log(`- Initial Deposit: ${ethers.utils.formatEther(kidData[4])} FLOW`);
  console.log(`- Deposit Timestamp: ${new Date(kidData[5].toNumber() * 1000).toISOString()}`);
  console.log(`- Lock Period: ${kidData[6]} years`);
  
  // Simulate yield generation
  console.log("\nSimulating yield generation...");
  // For testing - simulate adding yield to the vault
  // In production, this would happen through the MORE protocol
  const yieldAmount = ethers.utils.parseEther("50"); // 50 FLOW tokens as yield
  await deployer.sendTransaction({
    to: yieldVaultAddress,
    value: yieldAmount
  });
  console.log(`Added ${ethers.utils.formatEther(yieldAmount)} FLOW tokens as yield`);
  
  // Check current yield
  const currentYield = await hodlJar.getCurrentYield(jarId);
  console.log(`Current yield: ${ethers.utils.formatEther(currentYield)} FLOW tokens`);
  
  // Withdraw yield
  console.log("\nWithdrawing yield...");
  try {
    const withdrawYieldTx = await hodlJar.connect(fosterHome).withdrawYield(jarId);
    await withdrawYieldTx.wait();
    console.log("Yield withdrawal successful!");
  } catch (error) {
    console.error("Error withdrawing yield:", error.message);
  }
  
  // Check time remaining for lock period
  const timeRemaining = await hodlJar.getLockTimeRemaining(jarId);
  const daysRemaining = Math.ceil(timeRemaining.toNumber() / (24 * 60 * 60));
  console.log(`\nTime remaining until principal can be withdrawn: ${daysRemaining} days`);
  
  console.log("\nScript completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });