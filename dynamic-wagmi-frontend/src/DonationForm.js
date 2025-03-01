import { useState } from 'react';
import './DonationForm.css';

export function DonationForm({ onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        jarId: '',
        amount: 0.01, // Default amount set to 0.01 USDC
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'amount' ? Number(value) : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onSubmit(formData);
        setIsSubmitting(false);
    };

    return (
        <div className="donation-form">
            <h2>Donate to a HODL Jar</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="jarId">HODL Jar Address:</label>
                    <input
                        type="text"
                        id="jarId"
                        name="jarId"
                        value={formData.jarId}
                        onChange={handleChange}
                        placeholder="0x..."
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="amount">Amount (USDC):</label>
                    <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        min="0.01"
                        step="0.01"
                        required
                    />
                    <small>Minimum donation: 0.01 USDC</small>
                </div>
                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Processing...' : 'Donate'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={onCancel}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
} 