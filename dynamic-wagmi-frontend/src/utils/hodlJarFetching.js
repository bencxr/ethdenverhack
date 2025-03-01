import { HODL_JAR_FACTORY_ADDRESS } from './constants';

// ABI fragments needed for interacting with the contracts
const factoryABI = [
    {
        name: 'getTotalJars',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'uint256' }]
    },
    {
        name: 'getAllHODLJars',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'address[]' }]
    }
];

const jarABI = [
    {
        name: 'kidname',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'string' }]
    },
    {
        name: 'imageurl',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'string' }]
    },
    {
        name: 'story',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'string' }]
    },
    {
        name: 'age',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'uint256' }]
    },
    {
        name: 'donor',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'address' }]
    },
    {
        name: 'fosterHome',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'address' }]
    }
];


export async function fetchAllHODLJars(wallet) {
    try {
        if (!wallet) {
            throw new Error("Wallet not connected");
        }

        // Get public client from the wallet
        const publicClient = await wallet.getPublicClient();

        // Get total jars count
        const totalJars = await publicClient.readContract({
            address: HODL_JAR_FACTORY_ADDRESS,
            abi: factoryABI,
            functionName: 'getTotalJars'
        });

        if (totalJars === 0n) {
            return { success: true, message: "No jars have been created yet.", jars: [] };
        }

        // Get all jar addresses
        const allJarAddresses = await publicClient.readContract({
            address: HODL_JAR_FACTORY_ADDRESS,
            abi: factoryABI,
            functionName: 'getAllHODLJars'
        });

        // Get details for each jar
        const jarsDetails = await Promise.all(
            allJarAddresses.map(async (jarAddress) => {
                // Get jar details
                const kidname = await publicClient.readContract({
                    address: jarAddress,
                    abi: jarABI,
                    functionName: 'kidname'
                });

                const imageurl = await publicClient.readContract({
                    address: jarAddress,
                    abi: jarABI,
                    functionName: 'imageurl'
                });

                const story = await publicClient.readContract({
                    address: jarAddress,
                    abi: jarABI,
                    functionName: 'story'
                });

                const age = await publicClient.readContract({
                    address: jarAddress,
                    abi: jarABI,
                    functionName: 'age'
                });

                const fosterHome = await publicClient.readContract({
                    address: jarAddress,
                    abi: jarABI,
                    functionName: 'fosterHome'
                });

                const donor = await publicClient.readContract({
                    address: jarAddress,
                    abi: jarABI,
                    functionName: 'donor'
                });

                return {
                    address: jarAddress,
                    kidname,
                    imageurl,
                    story,
                    age: age.toString(),
                    donor: donor,
                    fosterHome
                };
            })
        );

        return {
            success: true,
            message: `Found ${jarsDetails.length} HODL jars`,
            jars: jarsDetails
        };
    } catch (error) {
        console.error("Error fetching HODL jars:", error);
        return {
            success: false,
            message: `Error fetching HODL jars: ${error.message}`,
            jars: []
        };
    }
} 