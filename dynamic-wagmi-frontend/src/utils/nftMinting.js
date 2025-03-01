import { encodeFunctionData } from 'viem';
import { isEthereumWallet } from '@dynamic-labs/ethereum';
import { PAINTING_NFT_CONTRACT_ADDRESS } from './constants';

/**
 * Mints an NFT using the connected wallet
 * @param {Object} primaryWallet - The user's primary wallet
 * @param {Object} nftFormData - NFT metadata including name, description, age, animal, and image
 * @returns {Promise<Object>} - Result of the minting operation
 */
export async function mintNFT(primaryWallet, nftFormData) {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
        return {
            success: false,
            message: "No Ethereum wallet connected"
        };
    }

    try {
        // First, upload the image to Pinata
        const imageUploadResult = await uploadImageToPinata(nftFormData.image);
        if (!imageUploadResult.success) {
            return imageUploadResult;
        }
        console.log(imageUploadResult);

        // Create NFT metadata JSON
        const nftJSON = {
            name: nftFormData.name,
            description: nftFormData.description,
            image: imageUploadResult.ipfsUrl,
            attributes: [
                {
                    trait_type: "Jar ID",
                    value: nftFormData.jarId
                },
                {
                    trait_type: "Animal",
                    value: nftFormData.animal
                }
            ]
        };

        // Upload metadata JSON to Pinata
        const metadataUploadResult = await uploadMetadataToPinata(nftJSON);
        if (!metadataUploadResult.success) {
            return metadataUploadResult;
        }

        // Now mint the NFT with the metadata URI
        const walletClient = await primaryWallet.getWalletClient();
        const publicClient = await primaryWallet.getPublicClient();
        const userAddress = await walletClient.account.address;

        // Check if recipient address is valid
        let recipientAddress = nftFormData.recipientAddress.trim();
        if (!recipientAddress || !/^0x[a-fA-F0-9]{40}$/.test(recipientAddress)) {
            recipientAddress = userAddress;
        }

        // ABI for the mint function
        const mintABI = {
            name: 'mint',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [{ name: 'uri', type: 'string' }],
            outputs: []
        };

        // Encode the function call
        const data = encodeFunctionData({
            abi: [mintABI],
            functionName: 'mint',
            args: [metadataUploadResult.ipfsUrl]
        });

        // Send the transaction
        const hash = await walletClient.sendTransaction({
            to: PAINTING_NFT_CONTRACT_ADDRESS,
            data: data,
        });

        // Wait for transaction confirmation
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.status === 'success') {
            // Get the token ID from the mint event
            const tokenId = await getTokenIdFromReceipt(publicClient, receipt);

            if (tokenId && recipientAddress.toLowerCase() !== userAddress.toLowerCase()) {
                // Transfer the NFT to the recipient if it's not the minter
                const transferResult = await transferNFT(
                    walletClient,
                    publicClient,
                    userAddress,
                    recipientAddress,
                    tokenId
                );

                if (transferResult.success) {
                    return {
                        success: true,
                        message: `NFT minted and transferred successfully! Mint TX: ${hash}, Transfer TX: ${transferResult.hash}`
                    };
                } else {
                    return {
                        success: true,
                        message: `NFT minted successfully, but transfer failed: ${transferResult.message}. Mint TX: ${hash}`
                    };
                }
            }

            return {
                success: true,
                message: `NFT minted successfully! Transaction Hash: ${hash}`
            };
        } else {
            return {
                success: false,
                message: `Transaction completed but may have failed. Hash: ${hash}`
            };
        }
    } catch (error) {
        return {
            success: false,
            message: `Error minting NFT: ${error.message}`
        };
    }
}

/**
 * Uploads an image file to Pinata IPFS
 * @param {File} imageFile - The image file to upload
 * @returns {Promise<Object>} - Result of the upload operation
 */
async function uploadImageToPinata(imageFile) {
    try {
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('pinataMetadata', JSON.stringify({
            name: `NFT-Image-${Date.now()}`
        }));

        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI5ZTgxZjExZi1kN2M3LTQ0OTYtYmJjYy03YTJjNmJmM2RlYzUiLCJlbWFpbCI6ImJlbmN4ckBmcmFnbmV0aWNzLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI2YmE1NDA4NTA4YTA2MWRhMGVkMyIsInNjb3BlZEtleVNlY3JldCI6IjY5ZDM4OGRlYmZiNTUzMDdlNjRjYzAzZmE1NzIwNjYyNjRjNDUwYzc5NjgxOTRkNThhYzc2MzFlMWRkYWEwN2YiLCJleHAiOjE3NzIzMjkzNzJ9.hc0kBix7t9PcdXlVqFL9gCPB6d87BQtIq6fg5yuzmF0'
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            return {
                success: true,
                ipfsHash: data.IpfsHash,
                ipfsUrl: `https://sapphire-known-spoonbill-176.mypinata.cloud/ipfs/${data.IpfsHash}`
            };
        } else {
            return {
                success: false,
                message: `Failed to upload image: ${data.error || 'Unknown error'}`
            };
        }
    } catch (error) {
        return {
            success: false,
            message: `Error uploading image: ${error.message}`
        };
    }
}

/**
 * Uploads NFT metadata JSON to Pinata IPFS
 * @param {Object} metadata - The NFT metadata
 * @returns {Promise<Object>} - Result of the upload operation
 */
async function uploadMetadataToPinata(metadata) {
    try {
        const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI5ZTgxZjExZi1kN2M3LTQ0OTYtYmJjYy03YTJjNmJmM2RlYzUiLCJlbWFpbCI6ImJlbmN4ckBmcmFnbmV0aWNzLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI2YmE1NDA4NTA4YTA2MWRhMGVkMyIsInNjb3BlZEtleVNlY3JldCI6IjY5ZDM4OGRlYmZiNTUzMDdlNjRjYzAzZmE1NzIwNjYyNjRjNDUwYzc5NjgxOTRkNThhYzc2MzFlMWRkYWEwN2YiLCJleHAiOjE3NzIzMjkzNzJ9.hc0kBix7t9PcdXlVqFL9gCPB6d87BQtIq6fg5yuzmF0'
            },
            body: JSON.stringify({
                pinataContent: metadata,
                pinataMetadata: {
                    name: `NFT-Metadata-${Date.now()}`
                }
            })
        });

        const data = await response.json();

        if (response.ok) {
            return {
                success: true,
                ipfsHash: data.IpfsHash,
                ipfsUrl: `https://sapphire-known-spoonbill-176.mypinata.cloud/ipfs/${data.IpfsHash}`
            };
        } else {
            return {
                success: false,
                message: `Failed to upload metadata: ${data.error || 'Unknown error'}`
            };
        }
    } catch (error) {
        return {
            success: false,
            message: `Error uploading metadata: ${error.message}`
        };
    }
}

/**
 * Extract the token ID from the transaction receipt
 * @param {Object} publicClient - The public client
 * @param {Object} receipt - Transaction receipt
 * @returns {Promise<string|null>} - The token ID or null if not found
 */
async function getTokenIdFromReceipt(publicClient, receipt) {
    try {
        // This assumes the contract emits a Transfer event when minting
        // with the format Transfer(address indexed from, address indexed to, uint256 indexed tokenId)
        const logs = receipt.logs;

        // ERC721 Transfer event topic
        const transferEventTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

        for (const log of logs) {
            if (log.topics[0] === transferEventTopic) {
                // The token ID is the third topic (index 2) in the Transfer event
                const tokenIdHex = log.topics[3];
                // Convert hex to decimal string without using BigInt
                return parseInt(tokenIdHex, 16).toString();
            }
        }
        return null;
    } catch (error) {
        console.error("Error extracting token ID:", error);
        return null;
    }
}

/**
 * Transfers an NFT to a recipient
 * @param {Object} walletClient - The wallet client
 * @param {Object} publicClient - The public client
 * @param {string} from - The sender's address
 * @param {string} to - The recipient's address
 * @param {string} tokenId - The token ID to transfer
 * @returns {Promise<Object>} - Result of the transfer operation
 */
async function transferNFT(walletClient, publicClient, from, to, tokenId) {
    try {
        // ABI for the transferFrom function
        const transferABI = {
            name: 'transferFrom',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
                { name: 'from', type: 'address' },
                { name: 'to', type: 'address' },
                { name: 'tokenId', type: 'uint256' }
            ],
            outputs: []
        };

        // Encode the function call
        const data = encodeFunctionData({
            abi: [transferABI],
            functionName: 'transferFrom',
            args: [from, to, tokenId]
        });

        // Send the transaction
        const hash = await walletClient.sendTransaction({
            to: PAINTING_NFT_CONTRACT_ADDRESS,
            data: data,
        });

        // Wait for transaction confirmation
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.status === 'success') {
            return {
                success: true,
                hash: hash,
                message: `NFT transferred successfully!`
            };
        } else {
            return {
                success: false,
                hash: hash,
                message: `Transfer transaction completed but may have failed.`
            };
        }
    } catch (error) {
        return {
            success: false,
            message: `Error transferring NFT: ${error.message}`
        };
    }
} 