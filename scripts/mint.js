const hre = require("hardhat");

/*
{
  "name": "Kid's Painting #1",
  "description": "A beautiful painting by a child artist",
  "image": "ipfs://YOUR_IMAGE_CID/image.png",
  "attributes": [
    {
      "trait_type": "Artist Age",
      "value": "8"
    },
    {
      "trait_type": "Medium",
      "value": "Watercolor"
    }
  ]
}
  */

async function main() {
    // Get the contract instance
    const contractAddress = "0x8935E25FBef320b3AE18F2C96FD61791B7CCcad7"; // Replace with your contract address
    const NFTCollection = await hre.ethers.getContractFactory("NFTCollection");
    const nftCollection = NFTCollection.attach(contractAddress);

    // Example URI - replace with your actual NFT metadata URI
    const tokenURI = "https://bafybeidqfbmquh3u7nm4pmpycouijnyebaglk376ymfaztd45kmy4dpgye.ipfs.w3s.link/nft1.json";

    try {
        // First, ensure the address is whitelisted
        const [signer] = await hre.ethers.getSigners();
        const isWhitelisted = await nftCollection.isWhitelisted(signer.address);

        if (!isWhitelisted) {
            console.log("Address not whitelisted. Adding to whitelist...");
            const addToWhitelistTx = await nftCollection.addToWhitelist([signer.address]);
            await addToWhitelistTx.wait();
            console.log("Address added to whitelist");
        }

        // Mint the NFT
        console.log("Minting NFT...");
        const mintTx = await nftCollection.mint(tokenURI);
        await mintTx.wait();

        console.log("NFT minted successfully!");
        console.log("Transaction hash:", mintTx.hash);
    } catch (error) {
        console.error("Error minting NFT:", error);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 