import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { predictImage } from '../api/api';
import './Upload.css';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      setFile(selectedFile);
      setError('');
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select an image file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await predictImage(file);
      
      // Store result in sessionStorage for Result page
      sessionStorage.setItem('predictionResult', JSON.stringify({
        ...result,
        imageFile: preview
      }));
      
      navigate('/result');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process image. Please try again.');
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-page">
      <div className="container">
        <div className="card">
          <h1>🌞 Solar Panel Condition Detection</h1>
          <p className="subtitle">Upload an image of your solar panel to analyze its condition</p>
          
          <form onSubmit={handleSubmit} className="upload-form">
            <div className="upload-area">
              <input
                type="file"
                id="file-input"
                accept="image/*"
                onChange={handleFileChange}
                className="file-input"
                disabled={loading}
              />
              <label htmlFor="file-input" className="file-label">
                {preview ? (
                  <div className="preview-container">
                    <img src={preview} alt="Preview" className="preview-image" />
                    <p className="preview-text">Click to change image</p>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <span className="upload-icon">📷</span>
                    <p>Click to select an image</p>
                    <p className="upload-hint">or drag and drop</p>
                  </div>
                )}
              </label>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={!file || loading}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span> Analyzing...
                </>
              ) : (
                'Analyze Panel'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Upload;



