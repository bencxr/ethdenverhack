import { parseUnits } from 'viem';
import { getHODLJarContract, getUSDCContract } from './contracts';

export async function donateToHODLJar(wallet, donationData) {
    try {
        const { jarId, amount } = donationData;

        if (!wallet || !jarId || !amount) {
            return {
                success: false,
                message: "Missing required information for donation."
            };
        }

        // Get the wallet client
        const walletClient = await wallet.getWalletClient();

        // Get the USDC contract
        const usdcContract = getUSDCContract(walletClient);

        // Get the HODL jar contract
        const hodlJarContract = getHODLJarContract(walletClient, jarId);

        // Convert amount to USDC units (6 decimals)
        const amountInUSDC = parseUnits(amount.toString(), 6);

        // First approve USDC transfer
        console.log(`Approving ${amount} USDC for transfer to HODL jar...`);
        const approveTx = await walletClient.writeContract({
            ...usdcContract,
            functionName: 'approve',
            args: [jarId, amountInUSDC]
        });

        console.log(`Approval transaction hash: ${approveTx}`);

        // Then deposit into the HODL jar
        console.log(`Depositing ${amount} USDC into HODL jar...`);
        const depositTx = await walletClient.writeContract({
            ...hodlJarContract,
            functionName: 'deposit',
            args: [amountInUSDC, wallet.address]
        });

        console.log(`Deposit transaction hash: ${depositTx}`);

        return {
            success: true,
            message: `Successfully donated ${amount} USDC to HODL jar. Transaction hash: ${depositTx}`
        };
    } catch (error) {
        console.error("Error donating to HODL jar:", error);
        return {
            success: false,
            message: `Failed to donate to HODL jar: ${error.message}`
        };
    }
} 