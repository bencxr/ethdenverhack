import { encodeFunctionData } from 'viem';
import { isEthereumWallet } from '@dynamic-labs/ethereum';

/**
 * Mints an NFT using the connected wallet
 * @param {Object} primaryWallet - The user's primary wallet
 * @param {string} tokenURI - URI for the NFT metadata
 * @param {Function} setResult - Function to update the result state
 * @returns {Promise<void>}
 */
export async function mintNFT(primaryWallet, tokenURI = "https://bafybeidqfbmquh3u7nm4pmpycouijnyebaglk376ymfaztd45kmy4dpgye.ipfs.w3s.link/nft1.json") {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) return;

    try {
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
            args: [tokenURI]
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