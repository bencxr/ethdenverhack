// This script retrieves all HODLJars created by the factory and prints their details
const hre = require("hardhat");

async function main() {
    console.log("Retrieving HODLJars from factory...");

    // Factory address
    const factoryAddress = "0xCA1008F2153F8f086EA89844Dc1336C63DA2f87A";
    console.log("Using HODLJarFactory at:", factoryAddress);

    // Get the factory contract instance
    const hodlJarFactory = await hre.ethers.getContractAt("HODLJarFactory", factoryAddress);

    // Get total jars count
    const totalJars = await hodlJarFactory.getTotalJars();
    console.log(`\nTotal jars created: ${totalJars}`);

    if (totalJars.toString() === "0") {
        console.log("No jars have been created yet.");
        return;
    }

    // Get all jar addresses
    const allJarAddresses = await hodlJarFactory.getAllHODLJars();
    console.log(`Found ${allJarAddresses.length} jars.`);

    // Get details for each jar
    for (let i = 0; i < allJarAddresses.length; i++) {
        const jarAddress = allJarAddresses[i];
        console.log(`\n--- Jar ${i + 1} ---`);
        console.log(`Address: ${jarAddress}`);

        // Get the HODLJar contract instance
        const hodlJar = await hre.ethers.getContractAt("HODLJar", jarAddress);

        // Get jar details
        const kidname = await hodlJar.kidname();
        const imageurl = await hodlJar.imageurl();
        const story = await hodlJar.story();
        const age = await hodlJar.age();
        const fosterHome = await hodlJar.fosterHome();

        // Print jar details
        console.log(`Kid Name: ${kidname}`);
        console.log(`Age: ${age}`);
        console.log(`Image URL: ${imageurl}`);
        console.log(`Story: ${story}`);
        console.log(`Foster Home: ${fosterHome}`);
    }

    // Get jars by foster home (example)
    /*
    const exampleFosterHome = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    const fosterHomeJars = await hodlJarFactory.getJarsByFosterHome(exampleFosterHome);
    console.log(`\n--- Jars for Foster Home ${exampleFosterHome} ---`);
    console.log(`Total jars: ${fosterHomeJars.length}`);
    console.log(`Jar addresses: ${fosterHomeJars.join(", ")}`);
    */
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 