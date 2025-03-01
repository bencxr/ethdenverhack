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
import { fetchAllCollectionNFTs } from './utils/nftFetching';
import { NFTGallery } from './NFTGallery';
import { donateToHODLJar } from './utils/hodlJarDonation';
import { DonationForm } from './DonationForm';

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
  const [nfts, setNfts] = useState([]);
  const [showNftGallery, setShowNftGallery] = useState(false);
  const [nftLoading, setNftLoading] = useState(false);
  const [showDonationForm, setShowDonationForm] = useState(false);

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

  // Helper function to hide all forms and clear result
  function hideAllForms() {
    setShowNftForm(false);
    setIsCreatingJar(false);
    setShowJars(false);
    setShowNftGallery(false);
    setShowDonationForm(false);
    setResult(''); // Clear the result message when switching methods
  }

  /*
  function showUser() {
    hideAllForms();
    setResult(safeStringify(user));
  }

  function showUserWallets() {
    hideAllForms();
    setResult(safeStringify(userWallets));
  }
  */

  async function fetchWalletClient() {
    hideAllForms();
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) return;

    const walletClient = await primaryWallet.getWalletClient();
    setResult(safeStringify(walletClient));
  }

  async function showBalance() {
    hideAllForms();
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
    hideAllForms();
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
    hideAllForms();
    setShowNftForm(true);
  }

  async function handleNftFormSubmit(nftFormData) {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) return;

    setResult("Preparing NFT metadata and initiating minting...");
    const result = await mintNFTUtil(primaryWallet, nftFormData);
    setResult(result.message);
    setShowNftForm(false);
  }

  const handleCreateHODLJar = async (formData) => {
    setIsCreatingJar(true);
    const result = await createHODLJar(primaryWallet, formData);
    setResult(result.message);
    setIsCreatingJar(false);
  };

  async function fetchHODLJars() {
    hideAllForms();
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

  // Update the HODL Jar button click handler
  const toggleHODLJarForm = () => {
    hideAllForms();
    setIsCreatingJar(true);
  };

  async function fetchNFTs() {
    hideAllForms();
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) return;

    setNftLoading(true);
    setResult("Fetching your NFT paintings...");

    const result = await fetchAllCollectionNFTs(primaryWallet);

    if (result.success) {
      setNfts(result.nfts);
      setShowNftGallery(true);
      setResult(result.message);
    } else {
      setResult(result.message);
    }

    setNftLoading(false);
  }

  const toggleDonationForm = () => {
    hideAllForms();
    setShowDonationForm(true);
  };

  const handleDonateToHODLJar = async (donationData) => {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) return;

    setResult("Processing donation...");
    const result = await donateToHODLJar(primaryWallet, donationData);
    setResult(result.message);

    if (result.success) {
      setShowDonationForm(false);
    }
  };

  return (
    <>
      {!isLoading && (
        <div className="dynamic-methods" data-theme={isDarkMode ? 'dark' : 'light'}>
          <div className="methods-container">
            {/* <button className="btn btn-primary" onClick={showUser}>Fetch User</button>
            <button className="btn btn-primary" onClick={showUserWallets}>Fetch User Wallets</button> */}

            {primaryWallet && isEthereumWallet(primaryWallet) &&
              <>

                <button className="btn btn-primary" onClick={fetchWalletClient}>Fetch Wallet Client</button>
                <button className="btn btn-primary" onClick={sendEth}>Send 0.01 ETH</button>

                <button className="btn btn-primary" onClick={showBalance}>Show Balance</button>
                <button className="btn btn-primary" onClick={toggleNftForm}>Upload painting as NFT</button>
                <button
                  className="btn btn-primary"
                  onClick={toggleHODLJarForm}
                >
                  Create New HODL Jar
                </button>
                <button className="btn btn-primary" onClick={fetchHODLJars}>
                  View All HODL Jars
                </button>
                <button className="btn btn-primary" onClick={toggleDonationForm}>
                  Donate to HODL Jar
                </button>
                <button className="btn btn-primary" onClick={fetchNFTs}>
                  View Paintings
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

          {showNftGallery && <NFTGallery nfts={nfts} isLoading={nftLoading} />}

          {showDonationForm && (
            <div className="form-container">
              <DonationForm
                onSubmit={handleDonateToHODLJar}
                onCancel={() => setShowDonationForm(false)}
              />
            </div>
          )}

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