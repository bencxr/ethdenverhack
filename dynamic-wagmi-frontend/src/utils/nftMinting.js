import { encodeFunctionData } from 'viem';
import { isEthereumWallet } from '@dynamic-labs/ethereum';

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
                    trait_type: "Age",
                    value: nftFormData.age
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

        // NFT Collection contract address
        const contractAddress = '0x8935E25FBef320b3AE18F2C96FD61791B7CCcad7';

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
            to: contractAddress,
            data: data,
        });

        // Wait for transaction confirmation
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.status === 'success') {
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
                ipfsUrl: `https://${data.IpfsHash}.ipfs.w3s.link`
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
                ipfsUrl: `https://${data.IpfsHash}.ipfs.w3s.link`
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