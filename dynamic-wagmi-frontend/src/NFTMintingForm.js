import { useState } from 'react';
import './NFTMintingForm.css'; // You'll need to create this CSS file

export function NFTMintingForm({ onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        jarId: '',
        animal: '',
        image: null
    });

    function handleChange(e) {
        const { name, value, files } = e.target;
        if (name === 'image' && files && files[0]) {
            setFormData({
                ...formData,
                image: files[0]
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    }

    function handleSubmit(e) {
        e.preventDefault();
        onSubmit(formData);
    }

    return (
        <div className="nft-form-container">
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Name:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="description">Description:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="jarId">Jar ID:</label>
                    <input
                        type="text"
                        id="jarId"
                        name="jarId"
                        value={formData.jarId}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="animal">Animal:</label>
                    <input
                        type="text"
                        id="animal"
                        name="animal"
                        value={formData.animal}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="image">Image:</label>
                    <input
                        type="file"
                        id="image"
                        name="image"
                        onChange={handleChange}
                        accept="image/*"
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary">Create and Mint NFT</button>
                <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
            </form>
        </div>
    );
} 