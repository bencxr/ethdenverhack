import { useState, useEffect } from 'react';
import { useDynamicContext, useIsLoggedIn, useUserWallets } from "@dynamic-labs/sdk-react-core";
import { isEthereumWallet } from '@dynamic-labs/ethereum'
import { parseEther } from 'viem';
import { mintNFT as mintNFTUtil } from './utils/nftMinting';
import { createHODLJar } from './utils/hodlJarCreation';
import { fetchAllHODLJars } from './utils/hodlJarFetching';
import { HODLJarForm } from './HODLJarForm';
import { NFTMintingForm } from './NFTMintingForm';
import { HODLJarsList } from './HODLJarsList';

import './Methods.css';

export default function DynamicMethods({ isDarkMode }) {
  const isLoggedIn = useIsLoggedIn();
  const { sdkHasLoaded, primaryWallet, user } = useDynamicContext();
  const userWallets = useUserWallets();
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState('');
  const [isCreatingJar, setIsCreatingJar] = useState(false);
  const [showNftForm, setShowNftForm] = useState(false);
  const [hodlJars, setHodlJars] = useState([]);
  const [showJars, setShowJars] = useState(false);

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

  async function fetchWalletClient() {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) return;

    const walletClient = await primaryWallet.getWalletClient();
    setResult(safeStringify(walletClient));
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

  function toggleNftForm() {
    setShowNftForm(!showNftForm);
  }

  async function handleNftFormSubmit(nftFormData) {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) return;

    setResult("Preparing NFT metadata and initiating minting...");
    const result = await mintNFTUtil(primaryWallet, nftFormData);
    setResult(result.message);
    setShowNftForm(false);
  }

  async function testPinataAuth() {
    try {
      setResult('Fetching Pinata authentication status...');

      const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI5ZTgxZjExZi1kN2M3LTQ0OTYtYmJjYy03YTJjNmJmM2RlYzUiLCJlbWFpbCI6ImJlbmN4ckBmcmFnbmV0aWNzLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI2YmE1NDA4NTA4YTA2MWRhMGVkMyIsInNjb3BlZEtleVNlY3JldCI6IjY5ZDM4OGRlYmZiNTUzMDdlNjRjYzAzZmE1NzIwNjYyNjRjNDUwYzc5NjgxOTRkNThhYzc2MzFlMWRkYWEwN2YiLCJleHAiOjE3NzIzMjkzNzJ9.hc0kBix7t9PcdXlVqFL9gCPB6d87BQtIq6fg5yuzmF0'
        }
      });

      const data = await response.json();
      setResult(safeStringify(data));
    } catch (error) {
      setResult(`Error testing Pinata authentication: ${error.message}`);
    }
  }

  const handleCreateHODLJar = async (formData) => {
    setIsCreatingJar(true);
    const result = await createHODLJar(primaryWallet, formData);
    setResult(result.message);
    setIsCreatingJar(false);
  };

  async function fetchHODLJars() {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) return;

    setResult("Fetching HODL jars...");
    const result = await fetchAllHODLJars(primaryWallet);

    if (result.success) {
      setHodlJars(result.jars);
      setShowJars(true);
      setResult(result.message);
    } else {
      setResult(result.message);
    }
  }

  return (
    <>
      {!isLoading && (
        <div className="dynamic-methods" data-theme={isDarkMode ? 'dark' : 'light'}>
          <div className="methods-container">
            <button className="btn btn-primary" onClick={showUser}>Fetch User</button>
            <button className="btn btn-primary" onClick={showUserWallets}>Fetch User Wallets</button>
            <button className="btn btn-primary" onClick={testPinataAuth}>Test Pinata Auth</button>

            {primaryWallet && isEthereumWallet(primaryWallet) &&
              <>
                <button className="btn btn-primary" onClick={fetchWalletClient}>Fetch Wallet Client</button>
                <button className="btn btn-primary" onClick={showBalance}>Show Balance</button>
                <button className="btn btn-primary" onClick={sendEth}>Send 0.01 ETH</button>
                <button className="btn btn-primary" onClick={toggleNftForm}>Mint NFT</button>
                <button
                  className="btn btn-primary"
                  onClick={() => setIsCreatingJar(!isCreatingJar)}
                >
                  {isCreatingJar ? 'Hide Form' : 'Create New HODL Jar'}
                </button>
                <button className="btn btn-primary" onClick={fetchHODLJars}>
                  View All HODL Jars
                </button>
              </>
            }
          </div>

          {showNftForm && (
            <div className="form-container">
              <NFTMintingForm
                onSubmit={handleNftFormSubmit}
                onCancel={toggleNftForm}
              />
            </div>
          )}

          {isCreatingJar && (
            <div className="form-container">
              <HODLJarForm onSubmit={handleCreateHODLJar} />
            </div>
          )}

          {showJars && <HODLJarsList hodlJars={hodlJars} />}

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