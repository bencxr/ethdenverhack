const hre = require("hardhat");

async function main() {
    // Get the contract instance
    const contractAddress = "0x8935E25FBef320b3AE18F2C96FD61791B7CCcad7"; // Replace with your contract address
    const NFTCollection = await hre.ethers.getContractFactory("NFTCollection");
    const nftCollection = NFTCollection.attach(contractAddress);

    // Address to whitelist - replace with the address you want to whitelist
    // You can also pass an array of addresses to whitelist multiple at once
    const addressToWhitelist = "0x144D8f50882904798CC33AaEF7cb9C00Ba7CAfce"; // Replace with the address to whitelist

    try {
        console.log(`Adding address ${addressToWhitelist} to whitelist...`);
        const addToWhitelistTx = await nftCollection.addToWhitelist([addressToWhitelist]);
        await addToWhitelistTx.wait();

        console.log("Address added to whitelist successfully!");
        console.log("Transaction hash:", addToWhitelistTx.hash);

        // Verify the address is now whitelisted
        const isWhitelisted = await nftCollection.isWhitelisted(addressToWhitelist);
        console.log(`Is address whitelisted: ${isWhitelisted}`);
    } catch (error) {
        console.error("Error adding address to whitelist:", error);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 