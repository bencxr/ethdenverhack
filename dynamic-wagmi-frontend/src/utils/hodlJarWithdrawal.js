import { parseUnits } from 'viem';
import { getHODLJarContract } from './contracts';

export async function withdrawFromHODLJar(wallet, withdrawalData) {
    try {
        const { jarId, amount } = withdrawalData;

        if (!wallet || !jarId || !amount) {
            return {
                success: false,
                message: "Missing required information for withdrawal."
            };
        }

        // Get the wallet client
        const walletClient = await wallet.getWalletClient();

        // Get the HODL jar contract
        const hodlJarContract = getHODLJarContract(walletClient, jarId);

        // Convert amount to USDC units (6 decimals)
        const amountInUSDC = parseUnits(amount.toString(), 6);

        // Execute withdrawal from the HODL jar
        console.log(`Withdrawing ${amount} USDC from HODL jar...`);
        const withdrawTx = await walletClient.writeContract({
            ...hodlJarContract,
            functionName: 'withdraw',
            args: [amountInUSDC]
        });

        console.log(`Withdrawal transaction hash: ${withdrawTx}`);

        // Wait for the withdrawal transaction to be confirmed
        console.log(`Waiting for withdrawal transaction to be confirmed...`);
        const publicClient = await wallet.getPublicClient();
        await publicClient.waitForTransactionReceipt({
            hash: withdrawTx,
        });
        console.log(`Withdrawal transaction confirmed!`);

        return {
            success: true,
            message: `Successfully withdrew ${amount} USDC from HODL jar. Transaction hash: ${withdrawTx}`
        };
    } catch (error) {
        console.error("Error withdrawing from HODL jar:", error);
        return {
            success: false,
            message: `Failed to withdraw from HODL jar: ${error.message}`
        };
    }
} 