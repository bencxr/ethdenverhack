// This script creates HODLJars using the deployed HODLJarFactory
const hre = require("hardhat");

async function main() {
  console.log("Creating HODLJars using factory...");

  // Factory address
  const factoryAddress = "0x21a19C7036bcD02b91951083467F06ba232f52b1";
  console.log("Using HODLJarFactory at:", factoryAddress);

  // Get the factory contract instance
  const hodlJarFactory = await hre.ethers.getContractAt("HODLJarFactory", factoryAddress);

  // Sample jar data
  const jars = [
    {
      kidname: "Emma",
      imageurl: "https://live.staticflickr.com/65535/54357472806_06aca1faf7_b.jpg",
      story: "Emma is a bright 8-year-old who loves reading and science experiments.",
      age: 6,
      fosterHome: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" // Replace with actual foster home address
    },
    {
      kidname: "Tim",
      imageurl: "https://live.staticflickr.com/65535/54357472801_27d4b0ee51_b.jpg",
      story: "Liam is a growing boy who loves sports and playing with his friends.",
      age: 4,
      fosterHome: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" // Replace with actual foster home address
    },
    {
      kidname: "Jeannie",
      imageurl: "https://live.staticflickr.com/65535/54357873385_618e38b675_b.jpg",
      story: "Jeannie is a kind 6-year-old who loves to play with her dolls.",
      age: 5,
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
