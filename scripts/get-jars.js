// This script retrieves all jars from a HODLJarListing contract and prints them to the screen
const hre = require("hardhat");

async function main() {
    console.log("Retrieving jars from HODLJarListing...");
    // Get the HODLJar contract factory
    const HODLJar = await hre.ethers.getContractFactory("HODLJar");

    // Get the HODLJarListing contract factory
    const HODLJarListing = await hre.ethers.getContractFactory("HODLJarListing");

    // Address of the deployed HODLJarListing contract
    const hodlJarListingAddress = "0xE1e4514c4eDaFD43d6bCB073EB3bB3515f8C479c";

    // Connect to the deployed contract
    const hodlJarListing = HODLJarListing.attach(hodlJarListingAddress);

    console.log("Connected to HODLJarListing at:", hodlJarListingAddress);

    // Get the total number of jars
    const jars = await hodlJarListing.getAllHODLJars();
    console.log(`Total jars: ${jars.length}`);

    // Retrieve and print details for each jar
    console.log("\nJar Details:");
    console.log("===========");

    for (let i = 0; i < jars.length; i++) {
        // Get the HODLJar contract factory
        const jarAddress = jars[i];

        // Connect to the jar contract
        const jar = HODLJar.attach(jarAddress);

        // Get jar details
        const kidname = await jar.kidname();
        const story = await jar.story();
        const age = await jar.age();
        const fosterHome = await jar.fosterHome();

        console.log(`\nJar #${i + 1}:`);
        console.log(`Address: ${jarAddress}`);
        console.log(`Name: ${kidname}`);
        console.log(`Age: ${age}`);
        console.log(`Story: ${story}`);
        console.log(`Foster Home: ${fosterHome}`);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 