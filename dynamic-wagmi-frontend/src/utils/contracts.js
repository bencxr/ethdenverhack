import { getContract } from 'viem';
import { usdcABI } from './abis/usdcABI';
import { hodlJarABI } from './abis/hodlJarABI';

// USDC contract address on the network you're using
const USDC_ADDRESS = '0xF1815bd50389c46847f0Bda824eC8da914045D14'; // Polygon USDC address - replace with your network's address

/**
 * Get the USDC contract instance
 * @param {Object} walletClient - The wallet client
 * @returns {Object} The USDC contract instance
 */
export function getUSDCContract(walletClient) {
    return getContract({
        address: USDC_ADDRESS,
        abi: usdcABI,
        walletClient,
    });
}

/**
 * Get the HODL jar contract instance
 * @param {Object} walletClient - The wallet client
 * @param {string} jarAddress - The HODL jar contract address
 * @returns {Object} The HODL jar contract instance
 */
export function getHODLJarContract(walletClient, jarAddress) {
    return getContract({
        address: jarAddress,
        abi: hodlJarABI,
        walletClient,
    });
} 