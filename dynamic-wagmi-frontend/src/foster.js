import { useState, useEffect } from 'react';
import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { isEthereumWallet } from '@dynamic-labs/ethereum';
import './FosterHomeManagement.css';

export default function FosterHomeManagement({ isDarkMode }) {
  const isLoggedIn = useIsLoggedIn();
  const { sdkHasLoaded, primaryWallet } = useDynamicContext();
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState('');
  const [activeForm, setActiveForm] = useState(null); // 'kid', 'withdrawal', 'kids', 'childWallet'
  const [kids, setKids] = useState([]);
  const [balance, setBalance] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);
  
  // Form states
  const [kidFormData, setKidFormData] = useState({
    name: '',
    age: '',
    dateOfEntry: '',
    specialNeeds: '',
    medicalInfo: '',
    educationLevel: '',
    notes: '',
    walletAddress: '' // Added wallet address field
  });
  
  const [withdrawalFormData, setWithdrawalFormData] = useState({
    amount: '',
    purpose: '',
    recipient: '',
    notes: ''
  });

  // Mock data for child wallets
  const [childWallets, setChildWallets] = useState([
    {
      childId: '1',
      childName: 'Emma Johnson',
      walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      balance: 0.45,
      transactions: [
        { date: '2023-10-15', amount: 0.1, type: 'deposit', description: 'Birthday gift' },
        { date: '2023-11-20', amount: 0.15, type: 'deposit', description: 'Holiday allowance' },
        { date: '2023-12-25', amount: 0.2, type: 'deposit', description: 'Christmas gift' }
      ]
    },
    {
      childId: '2',
      childName: 'Michael Smith',
      walletAddress: '0x2546BcD3c84621e976D8185a91A922aE77ECEc30',
      balance: 0.32,
      transactions: [
        { date: '2023-09-05', amount: 0.12, type: 'deposit', description: 'School achievement' },
        { date: '2023-11-10', amount: 0.2, type: 'deposit', description: 'Monthly allowance' }
      ]
    }
  ]);

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

  function hideAllForms() {
    setActiveForm(null);
    setResult('');
    setSelectedChild(null);
  }

  async function fetchBalance() {
    hideAllForms();
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) return;

    setResult("Fetching foster home balance...");
    try {
      // Mock API call - replace with actual implementation
      const balanceWei = await primaryWallet.getBalance();
      const balance = parseFloat(balanceWei) / 1e18;
      
      setBalance(balance);
      setResult(`Current Balance: ${balance.toFixed(4)} ETH (${balanceWei.toString()} wei)`);
    } catch (error) {
      setResult(`Error fetching balance: ${error.message}`);
    }
  }

  function handleKidFormChange(e) {
    const { name, value } = e.target;
    setKidFormData(prev => ({ ...prev, [name]: value }));
  }

  function handleWithdrawalFormChange(e) {
    const { name, value } = e.target;
    setWithdrawalFormData(prev => ({ ...prev, [name]: value }));
  }

  async function handleKidFormSubmit(e) {
    e.preventDefault();
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) return;

    setResult("Uploading child information...");
    try {
      // Generate a mock wallet address if not provided
      const walletAddress = kidFormData.walletAddress || 
        `0x${Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add to local state for demo purposes
      const newKid = {
        id: Date.now().toString(),
        ...kidFormData,
        walletAddress,
        dateAdded: new Date().toISOString()
      };
      
      setKids(prev => [...prev, newKid]);
      
      // Also add a wallet for this child
      const newWallet = {
        childId: newKid.id,
        childName: newKid.name,
        walletAddress,
        balance: 0,
        transactions: []
      };
      
      setChildWallets(prev => [...prev, newWallet]);
      
      setResult("Child information and wallet created successfully!");
      setActiveForm(null);
      setKidFormData({
        name: '',
        age: '',
        dateOfEntry: '',
        specialNeeds: '',
        medicalInfo: '',
        educationLevel: '',
        notes: '',
        walletAddress: ''
      });
    } catch (error) {
      setResult(`Error uploading information: ${error.message}`);
    }
  }

  async function handleWithdrawalSubmit(e) {
    e.preventDefault();
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) return;

    setResult("Processing withdrawal...");
    try {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setResult(`Successfully initiated withdrawal of ${withdrawalFormData.amount} ETH to ${withdrawalFormData.recipient}`);
      setActiveForm(null);
      setWithdrawalFormData({
        amount: '',
        purpose: '',
        recipient: '',
        notes: ''
      });
    } catch (error) {
      setResult(`Error processing withdrawal: ${error.message}`);
    }
  }

  async function fetchKids() {
    hideAllForms();
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) return;

    setResult("Fetching children information...");
    try {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Combine our mock data with any kids added through the form
      const allKids = [...kids];
      
      if (allKids.length > 0) {
        setActiveForm('kids');
        setResult(`Found ${allKids.length} children records.`);
      } else {
        setResult("No children records found.");
      }
    } catch (error) {
      setResult(`Error fetching children information: ${error.message}`);
    }
  }

  function viewChildWallet(childId) {
    const wallet = childWallets.find(w => w.childId === childId);
    if (wallet) {
      setSelectedChild(wallet);
      setActiveForm('childWallet');
    } else {
      setResult(`Error: Could not find wallet for child ID ${childId}`);
    }
  }

  async function createChildWallet(childId, childName) {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) return;

    setResult(`Creating wallet for ${childName}...`);
    try {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const walletAddress = `0x${Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      
      const newWallet = {
        childId,
        childName,
        walletAddress,
        balance: 0,
        transactions: []
      };
      
      setChildWallets(prev => [...prev, newWallet]);
      setResult(`Successfully created wallet for ${childName}: ${walletAddress}`);
    } catch (error) {
      setResult(`Error creating wallet: ${error.message}`);
    }
  }

  async function depositToChildWallet(childId, amount) {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) return;
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setResult("Please enter a valid amount");
      return;
    }

    const amountValue = parseFloat(amount);
    const child = childWallets.find(w => w.childId === childId);
    
    if (!child) {
      setResult(`Error: Could not find wallet for child ID ${childId}`);
      return;
    }

    setResult(`Depositing ${amountValue} ETH to ${child.childName}'s wallet...`);
    try {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the child's wallet with the new transaction and balance
      setChildWallets(prev => prev.map(wallet => {
        if (wallet.childId === childId) {
          const newTransaction = {
            date: new Date().toISOString().split('T')[0],
            amount: amountValue,
            type: 'deposit',
            description: 'Foster home deposit'
          };
          
          return {
            ...wallet,
            balance: wallet.balance + amountValue,
            transactions: [...wallet.transactions, newTransaction]
          };
        }
        return wallet;
      }));
      
      setResult(`Successfully deposited ${amountValue} ETH to ${child.childName}'s wallet`);
      
      // Refresh the selected child data if we're viewing their wallet
      if (selectedChild && selectedChild.childId === childId) {
        const updatedChild = childWallets.find(w => w.childId === childId);
        setSelectedChild(updatedChild);
      }
    } catch (error) {
      setResult(`Error making deposit: ${error.message}`);
    }
  }

  return (
    <>
      {!isLoading && (
        <div className="foster-home-management" data-theme={isDarkMode ? 'dark' : 'light'}>
          <h1>Foster Home Management</h1>
          
          <div className="management-buttons">
            {primaryWallet && isEthereumWallet(primaryWallet) && (
              <>
                <button className="btn" onClick={fetchBalance}>View Foster Home Balance</button>
                <button className="btn" onClick={() => setActiveForm('kid')}>Register New Child</button>
                <button className="btn" onClick={() => setActiveForm('withdrawal')}>Withdraw Funds</button>
                <button className="btn" onClick={fetchKids}>Manage Children</button>
              </>
            )}
          </div>

          {activeForm === 'kid' && (
            <div className="form-container">
              <h2>Child Registration Form</h2>
              <form onSubmit={handleKidFormSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={kidFormData.name}
                    onChange={handleKidFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="age">Age</label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={kidFormData.age}
                    onChange={handleKidFormChange}
                    required
                    min="0"
                    max="18"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="dateOfEntry">Date of Entry</label>
                  <input
                    type="date"
                    id="dateOfEntry"
                    name="dateOfEntry"
                    value={kidFormData.dateOfEntry}
                    onChange={handleKidFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="walletAddress">Existing Wallet Address (Optional)</label>
                  <input
                    type="text"
                    id="walletAddress"
                    name="walletAddress"
                    value={kidFormData.walletAddress}
                    onChange={handleKidFormChange}
                    placeholder="0x... (Leave blank to create new wallet)"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="specialNeeds">Special Needs</label>
                  <textarea
                    id="specialNeeds"
                    name="specialNeeds"
                    value={kidFormData.specialNeeds}
                    onChange={handleKidFormChange}
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="medicalInfo">Medical Information</label>
                  <textarea
                    id="medicalInfo"
                    name="medicalInfo"
                    value={kidFormData.medicalInfo}
                    onChange={handleKidFormChange}
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="educationLevel">Education Level</label>
                  <input
                    type="text"
                    id="educationLevel"
                    name="educationLevel"
                    value={kidFormData.educationLevel}
                    onChange={handleKidFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="notes">Additional Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={kidFormData.notes}
                    onChange={handleKidFormChange}
                    rows="4"
                  />
                </div>

                <div className="form-buttons">
                  <button type="submit" className="btn submit-btn">Register Child</button>
                  <button type="button" className="btn cancel-btn" onClick={hideAllForms}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {activeForm === 'withdrawal' && (
            <div className="form-container">
              <h2>Funds Withdrawal Request</h2>
              
              {balance !== null && (
                <div className="balance-info">
                  <p>Current Balance: <strong>{balance.toFixed(4)} ETH</strong></p>
                </div>
              )}
              
              <form onSubmit={handleWithdrawalSubmit}>
                <div className="form-group">
                  <label htmlFor="amount">Amount (USDC)</label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={withdrawalFormData.amount}
                    onChange={handleWithdrawalFormChange}
                    required
                    min="0.001"
                    step="0.001"
                    max={balance}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="purpose">Purpose</label>
                  <select
                    id="purpose"
                    name="purpose"
                    value={withdrawalFormData.purpose}
                    onChange={handleWithdrawalFormChange}
                    required
                  >
                    <option value="">Select purpose</option>
                    <option value="education">Education</option>
                    <option value="medical">Medical</option>
                    <option value="housing">Housing</option>
                    <option value="food">Food</option>
                    <option value="clothing">Clothing</option>
                    <option value="activities">Activities</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="recipient">Recipient Address</label>
                  <input
                    type="text"
                    id="recipient"
                    name="recipient"
                    value={withdrawalFormData.recipient}
                    onChange={handleWithdrawalFormChange}
                    required
                    placeholder="0x..."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="notes">Withdrawal Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={withdrawalFormData.notes}
                    onChange={handleWithdrawalFormChange}
                    rows="4"
                    placeholder="Explain how these funds will be used..."
                  />
                </div>

                <div className="form-buttons">
                  <button type="submit" className="btn submit-btn">Submit Withdrawal</button>
                  <button type="button" className="btn cancel-btn" onClick={hideAllForms}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {activeForm === 'kids' && (
            <div className="kids-list">
              <h2>Children Management</h2>
              {childWallets.length === 0 ? (
                <p className="no-records">No children records found.</p>
              ) : (
                <div className="kids-grid">
                  {childWallets.map((wallet) => (
                    <div key={wallet.childId} className="kid-card">
                      <div className="kid-details">
                        <h3>{wallet.childName}</h3>
                        <p><strong>Wallet:</strong> {wallet.walletAddress.substring(0, 6)}...{wallet.walletAddress.substring(38)}</p>
                        <p><strong>Balance:</strong> {wallet.balance.toFixed(4)} ETH</p>
                        
                        <div className="kid-actions">
                          <button 
                            className="btn view-btn" 
                            onClick={() => viewChildWallet(wallet.childId)}
                          >
                            View Wallet
                          </button>
                          
                          <div className="deposit-form">
                            <input 
                              type="number" 
                              placeholder="Amount (ETH)" 
                              min="0.001"
                              step="0.001"
                              id={`deposit-${wallet.childId}`}
                            />
                            <button 
                              className="btn deposit-btn"
                              onClick={() => {
                                const amount = document.getElementById(`deposit-${wallet.childId}`).value;
                                depositToChildWallet(wallet.childId, amount);
                              }}
                            >
                              Deposit
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="form-buttons">
                <button type="button" className="btn cancel-btn" onClick={hideAllForms}>Close</button>
              </div>
            </div>
          )}

          {activeForm === 'childWallet' && selectedChild && (
            <div className="wallet-details">
              <h2>{selectedChild.childName}'s Wallet</h2>
              
              <div className="wallet-info">
                <p><strong>Wallet Address:</strong> {selectedChild.walletAddress}</p>
                <p><strong>Current Balance:</strong> {selectedChild.balance.toFixed(4)} ETH</p>
              </div>
              
              <h3>Transaction History</h3>
              {selectedChild.transactions.length === 0 ? (
                <p>No transactions yet.</p>
              ) : (
                <div className="transaction-list">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Amount (ETH)</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedChild.transactions.map((tx, index) => (
                        <tr key={index} className={tx.type}>
                          <td>{tx.date}</td>
                          <td>{tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}</td>
                          <td>{tx.amount.toFixed(4)}</td>
                          <td>{tx.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              <div className="wallet-deposit">
                <h3>Make a Deposit</h3>
                <div className="deposit-form-large">
                  <input 
                    type="number" 
                    placeholder="Amount (ETH)" 
                    min="0.001"
                    step="0.001"
                    id="wallet-deposit-amount"
                  />
                  <button 
                    className="btn deposit-btn"
                    onClick={() => {
                      const amount = document.getElementById("wallet-deposit-amount").value;
                      depositToChildWallet(selectedChild.childId, amount);
                    }}
                  >
                    Deposit Funds
                  </button>
                </div>
              </div>
              
              <div className="form-buttons">
                <button type="button" className="btn back-btn" onClick={() => setActiveForm('kids')}>Back to Children</button>
                <button type="button" className="btn cancel-btn" onClick={hideAllForms}>Close</button>
              </div>
            </div>
          )}

          {result && (
            <div className="results-container">
              <pre className="results-text">
                {typeof result === "string" && result.startsWith("{")
                  ? JSON.stringify(JSON.parse(result), null, 2)
                  : result}
              </pre>
              <button className="btn clear-btn" onClick={clearResult}>Clear</button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
