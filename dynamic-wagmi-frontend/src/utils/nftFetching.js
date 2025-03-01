import { getContract } from 'viem';
import { paintingNFTABI } from './abis/paintingNFTABI';

// Replace with your actual contract address
import { PAINTING_NFT_CONTRACT_ADDRESS } from './constants';

// Add a new function to fetch all NFTs in the collection
export async function fetchAllCollectionNFTs(wallet) {
    if (!wallet) {
        return {
            success: false,
            message: "Wallet not connected",
            nfts: []
        };
    }

    try {
        const publicClient = await wallet.getPublicClient();

        // Log to debug
        console.log("Contract address:", PAINTING_NFT_CONTRACT_ADDRESS);
        console.log("ABI:", paintingNFTABI);

        // Get contract instance
        const contract = getContract({
            address: PAINTING_NFT_CONTRACT_ADDRESS,
            abi: paintingNFTABI,
            publicClient
        });

        // Debug the contract object
        console.log("Contract methods:", Object.keys(contract.read || {}));

        // Check if totalSupply exists before calling it
        if (!contract.read || typeof contract.read.totalSupply !== 'function') {
            return {
                success: false,
                message: "Contract doesn't have totalSupply method. Check your ABI.",
                nfts: []
            };
        }

        // Get total supply of NFTs in the collection
        const totalSupply = await contract.read.totalSupply();

        if (totalSupply === 0n) {
            return {
                success: true,
                message: "No NFTs found in this collection",
                nfts: []
            };
        }

        // Fetch all NFTs in the collection
        const nfts = [];
        for (let i = 0; i < Number(totalSupply); i++) {
            const tokenId = await contract.read.tokenByIndex([i.toString()]);

            // Get token URI
            const tokenURI = await contract.read.tokenURI([tokenId]);

            // Fetch metadata from IPFS or other storage
            let metadata = {};
            try {
                // If tokenURI is IPFS URI, convert to HTTP gateway URL
                const metadataURL = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
                const response = await fetch(metadataURL);
                metadata = await response.json();
            } catch (error) {
                console.error("Error fetching metadata:", error);
            }

            nfts.push({
                tokenId: tokenId.toString(),
                contractAddress: PAINTING_NFT_CONTRACT_ADDRESS,
                tokenURI,
                metadata,
                name: metadata.name,
                description: metadata.description,
                image: metadata.image?.replace('ipfs://', 'https://ipfs.io/ipfs/')
            });
        }

        return {
            success: true,
            message: `Found ${nfts.length} NFTs in the collection`,
            nfts
        };
    } catch (error) {
        console.error("Error fetching collection NFTs:", error);
        return {
            success: false,
            message: `Error fetching collection NFTs: ${error.message}`,
            nfts: []
        };
    }
} 