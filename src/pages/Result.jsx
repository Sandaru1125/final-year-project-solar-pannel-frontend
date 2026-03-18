import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Result.css';

const Result = () => {
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedResult = sessionStorage.getItem('predictionResult');
    if (storedResult) {
      setResult(JSON.parse(storedResult));
    } else {
      // Redirect to upload if no result
      navigate('/upload');
    }
  }, [navigate]);

  const getPredictionColor = (prediction) => {
    const colors = {
      clean: '#28a745',
      dusty: '#ffc107',
      snowy: '#17a2b8',
      bird_drop: '#fd7e14',
      electrical_damage: '#dc3545',
      physical_damage: '#6f42c1'
    };
    return colors[prediction] || '#667eea';
  };

  const getPredictionIcon = (prediction) => {
    const icons = {
      clean: '✅',
      dusty: '🌫️',
      snowy: '❄️',
      bird_drop: '🐦',
      electrical_damage: '⚡',
      physical_damage: '🔧'
    };
    return icons[prediction] || '🔍';
  };

  const formatPredictionName = (prediction) => {
    const names = {
      clean: 'Clean',
      dusty: 'Dusty',
      snowy: 'Snow Covered',
      bird_drop: 'Bird Droppings',
      electrical_damage: 'Electrical Damage',
      physical_damage: 'Physical Damage'
    };
    return names[prediction] || prediction.charAt(0).toUpperCase() + prediction.slice(1).replace(/_/g, ' ');
  };

  if (!result) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="result-page">
      <div className="container">
        <div className="card">
          <h1>Analysis Results</h1>
          
          <div className="result-content">
            <div className="result-image">
              {result.imageFile && (
                <img src={result.imageFile} alt="Solar Panel" />
              )}
            </div>

            <div className="result-details">
              <div 
                className="prediction-badge"
                style={{ backgroundColor: getPredictionColor(result.prediction) }}
              >
                <span className="prediction-icon">{getPredictionIcon(result.prediction)}</span>
                <span className="prediction-text">
                  {formatPredictionName(result.prediction)}
                </span>
              </div>

              <div className="recommendation-box">
                <h3>💡 Recommendation</h3>
                <p>{result.recommendation}</p>
              </div>

              {result.confidence && (
                <div className="confidence-box">
                  <p>Confidence: <strong>{(result.confidence * 100).toFixed(1)}%</strong></p>
                </div>
              )}

              <div className="action-buttons">
                <button
                  onClick={() => navigate('/booking')}
                  className="btn btn-primary"
                >
                  Book Cleaning Service
                </button>
                <button
                  onClick={() => navigate('/upload')}
                  className="btn btn-secondary"
                >
                  Analyze Another Panel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Result;


