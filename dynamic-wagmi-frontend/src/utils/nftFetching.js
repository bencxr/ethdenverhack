import { paintingNFTABI } from './abis/paintingNFTABI';

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

        // Get total jars count
        const totalSupply = await publicClient.readContract({
            address: PAINTING_NFT_CONTRACT_ADDRESS,
            abi: paintingNFTABI,
            functionName: 'totalSupply'
        });

        if (totalSupply === 0n) {
            return {
                success: true,
                message: "No NFTs found in this collection",
                nfts: []
            };
        }
        console.log("Total supply:", totalSupply);

        // Fetch all NFTs in the collection
        const nfts = [];
        for (let i = 0; i < Number(totalSupply); i++) {
            const tokenId = await publicClient.readContract({
                address: PAINTING_NFT_CONTRACT_ADDRESS,
                abi: paintingNFTABI,
                functionName: 'tokenByIndex',
                args: [i.toString()]
            });

            const tokenURI = await publicClient.readContract({
                address: PAINTING_NFT_CONTRACT_ADDRESS,
                abi: paintingNFTABI,
                functionName: 'tokenURI',
                args: [tokenId]
            });

            // Fetch metadata from IPFS or other storage
            let metadata = {};
            try {
                // If tokenURI is IPFS URI, convert to HTTP gateway URL
                const metadataURL = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/Qmb8hkLxU3a4HAVm4wRK86HH6XYKYqfiPACFXkWNKmrEWY');
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
                jarId: metadata.attributes?.find(attr => attr.trait_type === "Jar ID")?.value,
                image: metadata.image?.replace('ipfs://', 'https://ipfs.io/ipfs/')
            });
        }

        return {
            success: true,
            message: `Found ${nfts.length} paintings`,
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