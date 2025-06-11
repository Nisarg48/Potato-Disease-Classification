import './App.css';
import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [image, setImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      alert("Please upload an image.");
      return;
    }

    const formData = new FormData();
    formData.append('image', image); 

    try {
      const res = await axios.post(apiUrl , formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setPrediction(res.data.predicted_class_name);
      setConfidence(res.data.confidence);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Something went wrong!');
    }
  };

  return (
    <>
      <div>
        <h1>Predict Potato Leaf Disease</h1>
      </div>

      <div>
        <p>Upload an image of a potato leaf to predict its health status.</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="file-upload" className="custom-file-upload">
            Choose a file
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
          <button type="submit">Predict Disease</button>
        </form>

        {prediction && confidence && (
          <div className="result">
            <h2>Prediction Result</h2>
            <p><strong>Predicted Class:</strong> {prediction}</p>
            <p><strong>Confidence:</strong> {confidence.toFixed(2)}</p>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
