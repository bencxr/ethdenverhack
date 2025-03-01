// This script creates HODLJars using the deployed HODLJarFactory
const hre = require("hardhat");

async function main() {
  console.log("Creating HODLJars using factory...");

  // Factory address
  const factoryAddress = "0xCA1008F2153F8f086EA89844Dc1336C63DA2f87A";
  console.log("Using HODLJarFactory at:", factoryAddress);

  // Get the factory contract instance
  const hodlJarFactory = await hre.ethers.getContractAt("HODLJarFactory", factoryAddress);

  // Sample jar data
  const jars = [
    {
      kidname: "Emma",
      imageurl: "https://example.com/emma.jpg",
      story: "Emma is a bright 8-year-old who loves reading and science experiments.",
      age: 8,
      fosterHome: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" // Replace with actual foster home address
    },
    {
      kidname: "Liam",
      imageurl: "https://example.com/liam.jpg",
      story: "Liam is a creative 10-year-old who enjoys art and building things.",
      age: 10,
      fosterHome: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" // Replace with actual foster home address
    }
  ];

  // Create jars
  for (const jar of jars) {
    console.log(`Creating jar for ${jar.kidname}...`);

    const tx = await hodlJarFactory.createHODLJar(
      jar.kidname,
      jar.imageurl,
      jar.story,
      jar.age,
      jar.fosterHome
    );

    const receipt = await tx.wait();

    // Find the HODLJarCreated event to get the jar address
    const event = receipt.logs
      .filter(log => log.fragment && log.fragment.name === 'HODLJarCreated')
      .map(log => hodlJarFactory.interface.parseLog(log))[0];

    if (event) {
      const jarAddress = event.args.jarAddress;
      console.log(`Jar for ${jar.kidname} created at: ${jarAddress}`);
    } else {
      console.log(`Jar for ${jar.kidname} created, but couldn't find address in events`);
    }
  }

  // Get total jars count
  const totalJars = await hodlJarFactory.getTotalJars();
  console.log(`\nTotal jars created: ${totalJars}`);

  // Get all jar addresses
  const allJars = await hodlJarFactory.getAllHODLJars();
  console.log("All jar addresses:", allJars);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
