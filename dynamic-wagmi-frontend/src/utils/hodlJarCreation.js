import { isEthereumWallet } from '@dynamic-labs/ethereum';

// Factory contract address
const HODL_JAR_FACTORY_ADDRESS = "0xCA1008F2153F8f086EA89844Dc1336C63DA2f87A";

// Add the HODLJarFactory ABI
const HODLJarFactoryABI = [
  {
    name: 'createHODLJar',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_kidname', type: 'string' },
      { name: '_imageurl', type: 'string' },
      { name: '_story', type: 'string' },
      { name: '_age', type: 'uint256' },
      { name: '_fosterHome', type: 'address' }
    ],
    outputs: [{ type: 'address' }]
  }
];

export async function createHODLJar(primaryWallet, params) {
  if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
    return {
      success: false,
      message: 'Invalid wallet connection'
    };
  }

  try {
    const walletClient = await primaryWallet.getWalletClient();
    const publicClient = await primaryWallet.getPublicClient();

    // Log creation parameters for debugging
    console.log('Starting HODLJar creation with parameters:', {
      name: params.name,
      story: params.story,
      imageUrl: params.imageUrl,
      age: params.age,
      fosterHome: params.fosterHome,
      factoryAddress: HODL_JAR_FACTORY_ADDRESS
    });

    // Validate inputs
    if (!params.name || !params.story || !params.fosterHome) {
      return {
        success: false,
        message: 'Missing required parameters'
      };
    }

    if (params.age <= 0 || params.age >= 18) {
      return {
        success: false,
        message: 'Age must be between 1 and 17'
      };
    }

    // Prepare the factory transaction
    const createJarPromise = walletClient.writeContract({
      address: HODL_JAR_FACTORY_ADDRESS,
      abi: HODLJarFactoryABI,
      functionName: 'createHODLJar',
      args: [
        params.name,
        params.imageUrl || '', // Default to empty string if not provided
        params.story,
        window.BigInt(params.age),
        params.fosterHome
      ],
      account: primaryWallet.address
    });

    // Add timeout handling
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Transaction confirmation timed out')), 180000); // 3 minutes
    });

    // Wait for either transaction or timeout
    const hash = await Promise.race([createJarPromise, timeoutPromise]);
    console.log('Factory transaction initiated:', hash);

    // Wait for confirmation
    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
      timeout: 60_000, // 60 seconds for confirmation
      confirmations: 1 // Wait for 1 confirmation
    });

    if (receipt.status === 'success') {
      // Parse logs to find the created HODLJar address
      // This would require parsing the HODLJarCreated event from the logs
      // For simplicity, we'll just return success without the address
      return {
        success: true,
        message: `HODL Jar created successfully!`,
        hash
      };
    } else {
      return {
        success: false,
        message: 'Creation failed. Please try again.',
        hash
      };
    }
  } catch (error) {
    console.error('Creation error:', error);

    // Handle specific error types
    if (error.message.includes('Proposal expired')) {
      return {
        success: false,
        message: 'Please confirm the transaction in your wallet promptly. Try again.',
        error: error
      };
    }

    return {
      success: false,
      message: `Error creating HODL Jar: ${error.message}`,
      error: error
    };
  }
}