import { isEthereumWallet } from '@dynamic-labs/ethereum';
import { useIsLoggedIn, useDynamicContext, useUserWallets } from '@dynamic-labs/sdk-react-core';
import { useState, useEffect } from 'react';
import { parseEther, encodeFunctionData } from 'viem';


export default function DynamicMethods({ isDarkMode }) {
    const isLoggedIn = useIsLoggedIn();
    const { sdkHasLoaded, primaryWallet, user } = useDynamicContext();
    const userWallets = useUserWallets();
    const [isLoading, setIsLoading] = useState(true);
    const [result, setResult] = useState('');

    const safeStringify = (obj) => {
        const seen = new WeakSet();
        return JSON.stringify(obj, (key, value) => {
            if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) {
                    return '[Circular]';
                }
                seen.add(value);
            }
            return value;
        }, 2);
    };



    useEffect(() => {
        if (sdkHasLoaded && isLoggedIn && primaryWallet) {
            setIsLoading(false);
        } else {
            setIsLoading(true);
        }
    }, [sdkHasLoaded, isLoggedIn, primaryWallet]);

    function clearResult() {
        setResult('');
    }

    function showUser() {
        setResult(safeStringify(user));
    }

    function showUserWallets() {
        setResult(safeStringify(userWallets));
    }


    async function fetchPublicClient() {
        if (!primaryWallet || !isEthereumWallet(primaryWallet)) return;

        const publicClient = await primaryWallet.getPublicClient();
        setResult(safeStringify(publicClient));
    }

    async function fetchWalletClient() {
        if (!primaryWallet || !isEthereumWallet(primaryWallet)) return;

        const walletClient = await primaryWallet.getWalletClient();
        setResult(safeStringify(walletClient));
    }

    async function signEthereumMessage() {
        if (!primaryWallet || !isEthereumWallet(primaryWallet)) return;

        const signature = await primaryWallet.signMessage("Hello World");
        setResult(signature);
    }

    async function showBalance() {
        if (!primaryWallet || !isEthereumWallet(primaryWallet)) return;

        const publicClient = await primaryWallet.getPublicClient();
        const balance = await publicClient.getBalance({
            address: primaryWallet.address,
        });

        // Convert wei to ETH (1 ETH = 10^18 wei)
        const ethBalance = Number(balance) / 1e18;
        setResult(`Balance: ${ethBalance.toFixed(4)} ETH (${balance.toString()} wei)`);
    }

    async function sendEth() {
        if (!primaryWallet || !isEthereumWallet(primaryWallet)) return;

        try {
            const walletClient = await primaryWallet.getWalletClient();
            const hash = await walletClient.sendTransaction({
                to: '0x4Ab9B0FD0B98549fe3eEc614109D93553E8235B1',
                value: parseEther('0.01'), // 0.01 ETH converted to wei
            });
            setResult(`Transaction Hash: ${hash}`);
        } catch (error) {
            setResult(`Error: ${error.message}`);
        }
    }

    async function mintNFT() {
        if (!primaryWallet || !isEthereumWallet(primaryWallet)) return;

        try {
            const walletClient = await primaryWallet.getWalletClient();
            const publicClient = await primaryWallet.getPublicClient();

            // NFT Collection contract address
            const contractAddress = '0x8935E25FBef320b3AE18F2C96FD61791B7CCcad7';

            // URI for the NFT (could be made dynamic with user input)
            const tokenURI = "https://bafybeidqfbmquh3u7nm4pmpycouijnyebaglk376ymfaztd45kmy4dpgye.ipfs.w3s.link/nft1.json";

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

            setResult(`Minting NFT... Transaction Hash: ${hash}`);

            // Optional: Wait for transaction confirmation
            const receipt = await publicClient.waitForTransactionReceipt({ hash });
            if (receipt.status === 'success') {
                setResult(`NFT minted successfully! Transaction Hash: ${hash}`);
            } else {
                setResult(`Transaction completed but may have failed. Hash: ${hash}`);
            }
        } catch (error) {
            setResult(`Error minting NFT: ${error.message}`);
        }
    }

    return (
        <>
            {!isLoading && (
                <div className="dynamic-methods" data-theme={isDarkMode ? 'dark' : 'light'}>
                    <div className="methods-container">
                        <button className="btn btn-primary" onClick={showUser}>Fetch User</button>
                        <button className="btn btn-primary" onClick={showUserWallets}>Fetch User Wallets</button>


                        {primaryWallet && isEthereumWallet(primaryWallet) &&
                            <>
                                <button className="btn btn-primary" onClick={fetchPublicClient}>Fetch Public Client</button>
                                <button className="btn btn-primary" onClick={fetchWalletClient}>Fetch Wallet Client</button>
                                <button className="btn btn-primary" onClick={signEthereumMessage}>Sign "Hello World" on Ethereum</button>
                                <button className="btn btn-primary" onClick={showBalance}>Show Balance</button>
                                <button className="btn btn-primary" onClick={sendEth}>Send 0.01 ETH</button>
                                <button className="btn btn-primary" onClick={mintNFT}>Mint NFT</button>
                            </>}

                    </div>
                    {result && (
                        <div className="results-container">
                            <pre className="results-text">
                                {result && (
                                    typeof result === "string" && result.startsWith("{")
                                        ? JSON.stringify(JSON.parse(result), null, 2)
                                        : result
                                )}
                            </pre>
                        </div>
                    )}
                    {result && (
                        <div className="clear-container">
                            <button className="btn btn-primary" onClick={clearResult}>Clear</button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
