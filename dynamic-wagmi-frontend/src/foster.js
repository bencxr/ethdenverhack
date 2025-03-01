import { useState, useEffect } from 'react';
import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { isEthereumWallet } from '@dynamic-labs/ethereum';
import './FosterHomeManagement.css';

export default function FosterHomeManagement({ isDarkMode }) {
  const isLoggedIn = useIsLoggedIn();
  const { sdkHasLoaded, primaryWallet } = useDynamicContext();
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState('');
  const [activeForm, setActiveForm] = useState(null); // 'kid', 'withdrawal', 'kids'
  const [kids, setKids] = useState([]);
  const [balance, setBalance] = useState(null);
  
  // Form states
  const [kidFormData, setKidFormData] = useState({
    name: '',
    age: '',
    dateOfEntry: '',
    specialNeeds: '',
    medicalInfo: '',
    educationLevel: '',
    notes: ''
  });
  
  const [withdrawalFormData, setWithdrawalFormData] = useState({
    amount: '',
    purpose: '',
    recipient: '',
    notes: ''
  });

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
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add to local state for demo purposes
      const newKid = {
        id: Date.now().toString(),
        ...kidFormData,
        dateAdded: new Date().toISOString()
      };
      
      setKids(prev => [...prev, newKid]);
      setResult("Child information uploaded successfully!");
      setActiveForm(null);
      setKidFormData({
        name: '',
        age: '',
        dateOfEntry: '',
        specialNeeds: '',
        medicalInfo: '',
        educationLevel: '',
        notes: ''
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
      
      // If we already have kids in state, just show them
      if (kids.length > 0) {
        setActiveForm('kids');
        setResult(`Found ${kids.length} children records.`);
      } else {
        setResult("No children records found.");
      }
    } catch (error) {
      setResult(`Error fetching children information: ${error.message}`);
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
                <button className="btn" onClick={fetchBalance}>View Current Balance</button>
                <button className="btn" onClick={() => setActiveForm('kid')}>Upload Child Information</button>
                <button className="btn" onClick={() => setActiveForm('withdrawal')}>Withdraw Funds</button>
                <button className="btn" onClick={fetchKids}>View Children Records</button>
              </>
            )}
          </div>

          {activeForm === 'kid' && (
            <div className="form-container">
              <h2>Child Information Form</h2>
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
                  <button type="submit" className="btn submit-btn">Submit</button>
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
                  <label htmlFor="amount">Amount (ETH)</label>
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
              <h2>Children Records</h2>
              {kids.length === 0 ? (
                <p className="no-records">No children records found.</p>
              ) : (
                <div className="kids-grid">
                  {kids.map((kid) => (
                    <div key={kid.id} className="kid-card">
                      <div className="kid-details">
                        <h3>{kid.name}</h3>
                        <p><strong>Age:</strong> {kid.age}</p>
                        <p><strong>Entry Date:</strong> {new Date(kid.dateOfEntry).toLocaleDateString()}</p>
                        
                        {kid.educationLevel && (
                          <p><strong>Education:</strong> {kid.educationLevel}</p>
                        )}
                        
                        {kid.specialNeeds && (
                          <div className="kid-section">
                            <p><strong>Special Needs:</strong></p>
                            <p>{kid.specialNeeds}</p>
                          </div>
                        )}
                        
                        {kid.medicalInfo && (
                          <div className="kid-section">
                            <p><strong>Medical Info:</strong></p>
                            <p>{kid.medicalInfo}</p>
                          </div>
                        )}
                        
                        {kid.notes && (
                          <div className="kid-section">
                            <p><strong>Notes:</strong></p>
                            <p>{kid.notes}</p>
                          </div>
                        )}
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