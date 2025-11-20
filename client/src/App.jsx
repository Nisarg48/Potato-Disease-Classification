import './App.css';
import React, { useState, useCallback } from 'react';
import axios from 'axios';

function App() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0] && files[0].type.startsWith('image/')) {
      setImage(files[0]);
      setPreviewUrl(URL.createObjectURL(files[0]));
      setPrediction(null);
      setConfidence(null);
    }
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setPrediction(null);
      setConfidence(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      alert("Please upload an image.");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('image', image); 

    try {
      const res = await axios.post(apiUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setPrediction(res.data.predicted_class_name);
      setConfidence(res.data.confidence);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Something went wrong!');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setImage(null);
    setPreviewUrl(null);
    setPrediction(null);
    setConfidence(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🌿 Leaf Disease Classifier</h1>
        <p>Upload an image of a potato or apple leaf to detect diseases</p>
      </header>

      <main className="main-content">
        <div className="upload-container">
          <div 
            className={`upload-area ${isDragOver ? 'drag-over' : ''} ${previewUrl ? 'has-image' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !previewUrl && document.getElementById('file-input').click()}
          >
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            
            {previewUrl ? (
              <div className="image-preview">
                <img src={previewUrl} alt="Preview" />
                <div className="image-overlay">
                  <button className="change-btn" onClick={(e) => { e.stopPropagation(); resetForm(); }}>
                    Choose Different Image
                  </button>
                </div>
              </div>
            ) : (
              <div className="upload-content">
                <div className="upload-icon">
                  <svg viewBox="0 0 24 24" width="48" height="48">
                    <path fill="currentColor" d="M14,13V17H10V13H7L12,8L17,13M19.35,10.03C18.67,6.59 15.64,4 12,4C9.11,4 6.6,5.64 5.35,8.03C2.34,8.36 0,10.9 0,14A6,6 0 0,0 6,20H19A5,5 0 0,0 24,15C24,12.36 21.95,10.22 19.35,10.03Z" />
                  </svg>
                </div>
                <p className="upload-text">Drag & drop your image here</p>
                <p className="upload-subtext">or click to browse</p>
                <p className="upload-info">Supports JPG, PNG, WEBP (Max 5MB)</p>
              </div>
            )}
          </div>

          <div className="action-buttons">
            {previewUrl && !isLoading && (
              <button 
                className="predict-btn"
                onClick={handleSubmit}
              >
                Analyze Image
              </button>
            )}

            {isLoading && (
              <div className="loading">
                <div className="spinner"></div>
                <p>Analyzing your image...</p>
              </div>
            )}
          </div>
        </div>

        {prediction && confidence && (
          <div className="result-container">
            <h2>Analysis Results</h2>
            <div className="result-card">
              <div className="result-header">
                <h3>{prediction}</h3>
                <div className="confidence">
                  <div className="confidence-meter">
                    <div 
                      className="confidence-fill" 
                      style={{width: `${confidence * 100}%`}}
                    ></div>
                  </div>
                  <span className="confidence-value">{Math.round(confidence)}% confidence</span>
                </div>
              </div>
              
              <div className="result-body">
                <div className={`status ${prediction.toLowerCase().includes('healthy') ? 'healthy' : 'disease'}`}>
                  {prediction.toLowerCase().includes('healthy') ? (
                    <>
                      <span className="status-icon">✅</span>
                      <div>
                        <h4>Healthy Plant Detected</h4>
                        <p>Your plant appears to be in good condition!</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="status-icon">⚠️</span>
                      <div>
                        <h4>Disease Detected</h4>
                        <p>This appears to be {prediction}. Consider consulting agricultural resources for treatment options.</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Leaf Disease Classification for Potato and Apple plants</p>
      </footer>
    </div>
  );
}

export default App;