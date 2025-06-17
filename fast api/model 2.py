import os
import torch
import numpy as np
from PIL import Image, ImageDraw
import io
import base64
from transformers import AutoImageProcessor, AutoModelForImageClassification
import logging
from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import uvicorn
import asyncio

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables to store model and processor
model = None
processor = None
device = None

def initialize_model():
    """Initialize the model and processor"""
    global model, processor, device
    try:
        model_name = "mo-thecreator/vit-Facial-Expression-Recognition"
        logger.info(f"Loading model: {model_name}")
        processor = AutoImageProcessor.from_pretrained(model_name)
        model = AutoModelForImageClassification.from_pretrained(model_name)
        
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        model = model.to(device)
        model.eval()
        logger.info(f"Model initialized successfully on {device}")
        
        return processor, model
    except Exception as e:
        logger.error(f"Error initializing model: {str(e)}")
        raise

def process_image(image_data):
    """Process image data from either base64 or bytes"""
    try:
        if isinstance(image_data, str):
            # Handle base64 string
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))
        else:
            # Handle bytes directly
            image = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        return image
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        raise

def predict_emotion(image_data):
    """
    Main function to predict emotion from image
    Args:
        image_data: Either base64 string or bytes of image
    Returns:
        dict: Prediction results with emotion and confidence scores
    """
    global model, processor, device
    
    try:
        # Initialize model if not already done
        if model is None or processor is None:
            processor, model = initialize_model()
        
        # Process the image
        image = process_image(image_data)
        
        # Prepare image for model
        inputs = processor(images=image, return_tensors="pt")
        inputs = {k: v.to(device) for k, v in inputs.items()}
        
        # Make prediction
        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits
            probabilities = torch.nn.functional.softmax(logits, dim=1)
            predicted_class_idx = torch.argmax(probabilities, dim=1).item()
        
        # Get prediction details
        predicted_label = model.config.id2label[predicted_class_idx]
        confidence = probabilities[0][predicted_class_idx].item()
        
        # Get all emotion probabilities
        emotion_probs = {
            model.config.id2label[i]: float(prob)
            for i, prob in enumerate(probabilities[0].tolist())
        }
        
        # Prepare response
        result = {
            "emotion": predicted_label,
            "confidence": float(confidence),
            "all_emotions": emotion_probs
        }
        
        logger.info(f"Prediction successful: {predicted_label} ({confidence:.2%})")
        return result
        
    except Exception as e:
<<<<<<< Updated upstream
        raise Exception(f"Error processing image: {str(e)}")

=======
        logger.error(f"Error in emotion prediction: {str(e)}")
        raise
>>>>>>> Stashed changes

# Initialize the model when the module is loaded
initialize_model()

# Create FastAPI application
app = FastAPI()

# Serve static files
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# HTML interface
html_content = """
<!DOCTYPE html>
<html>
<head>
    <title>JoyVerse Emotion Detection</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #f5f7ff;
            color: #333;
        }
        .container { 
            max-width: 800px; 
            margin: 0 auto; 
            background: white;
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        h1 { 
            color: #4361ee; 
            text-align: center;
            margin-bottom: 10px;
        }
        .subtitle {
            text-align: center;
            color: #6c757d;
            margin-bottom: 30px;
        }
        #video { 
            background: #000; 
            width: 100%; 
            border-radius: 8px; 
            transform: scaleX(-1);
        }
        .controls {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin: 20px 0;
        }
        .btn { 
            padding: 14px 28px; 
            background: #4361ee; 
            color: white; 
            border: none; 
            border-radius: 50px; 
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.3s;
            box-shadow: 0 4px 6px rgba(67, 97, 238, 0.3);
        }
        .btn:hover {
            background: #3a56e4;
            transform: translateY(-2px);
            box-shadow: 0 6px 8px rgba(67, 97, 238, 0.4);
        }
        .btn:active {
            transform: translateY(0);
        }
        #canvas { 
            display: none; 
        }
        .result-container {
            margin-top: 30px;
            text-align: center;
        }
        .result-box {
            padding: 20px;
            border-radius: 12px;
            background: #f0f7ff;
            display: inline-block;
            min-width: 300px;
        }
        .emotion-display {
            font-size: 32px;
            font-weight: bold;
            color: #4361ee;
            margin: 15px 0;
        }
        .confidence {
            font-size: 18px;
            color: #6c757d;
        }
        .loading {
            display: none;
            font-size: 18px;
            color: #4361ee;
        }
        .camera-feed {
            position: relative;
            overflow: hidden;
            border-radius: 8px;
        }
        .face-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            pointer-events: none;
        }
        .face-circle {
            width: 200px;
            height: 200px;
            border: 3px dashed rgba(255, 255, 255, 0.7);
            border-radius: 50%;
        }
        footer {
            text-align: center;
            margin-top: 30px;
            color: #6c757d;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>JoyVerse Emotion Detection</h1>
        <p class="subtitle">AI-powered emotional analysis for dyslexia therapy</p>
        
        <div class="camera-feed">
            <video id="video" autoplay playsinline></video>
            <div class="face-overlay">
                <div class="face-circle"></div>
            </div>
        </div>
        
        <div class="controls">
            <button id="capture-btn" class="btn">Capture & Analyze</button>
        </div>
        
        <div class="result-container">
            <div id="result" class="result-box">
                <h3>Emotion Analysis</h3>
                <div class="loading" id="loading">Analyzing emotions...</div>
                <div id="result-content">
                    <div class="emotion-display" id="emotion">-</div>
                    <div class="confidence">Confidence: <span id="confidence">-</span>%</div>
                </div>
            </div>
        </div>
        
        <footer>
            <p>JoyVerse - Adaptive Learning Therapy System | For Therapist Use Only</p>
        </footer>
    </div>

    <canvas id="canvas"></canvas>

    <script>
        // DOM elements
        const video = document.getElementById('video');
        const canvas = document.getElementById('canvas');
        const captureBtn = document.getElementById('capture-btn');
        const emotionDisplay = document.getElementById('emotion');
        const confidenceDisplay = document.getElementById('confidence');
        const loadingIndicator = document.getElementById('loading');
        const resultContent = document.getElementById('result-content');
        
        // Camera initialization
        async function initCamera() {
            try {
                const constraints = {
                    video: { 
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                        facingMode: 'user'
                    }
                };
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                video.srcObject = stream;
            } catch (err) {
                console.error('Camera error:', err);
                alert(`Could not access camera: ${err.message}`);
            }
        }
        
        // Capture and analyze image
        async function captureAndAnalyze() {
            try {
                // Show loading state
                loadingIndicator.style.display = 'block';
                resultContent.style.display = 'none';
                captureBtn.disabled = true;
                captureBtn.textContent = 'Processing...';
                
                // Setup canvas
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                
                // Draw image to canvas (mirrored)
                ctx.save();
                ctx.scale(-1, 1);
                ctx.drawImage(video, 0, 0, canvas.width * -1, canvas.height);
                ctx.restore();
                
                // Convert to blob
                const blob = await new Promise(resolve => 
                    canvas.toBlob(resolve, 'image/jpeg', 0.95)
                );
                
                // Create form data
                const formData = new FormData();
                formData.append('file', blob, 'face.jpg');
                
                // Send to API
                const response = await fetch('/predict', {
                    method: 'POST',
                    body: formData
                });
                
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }
                
                const result = await response.json();
                
                // Display results
                emotionDisplay.textContent = result.emotion;
                confidenceDisplay.textContent = result.confidence.toFixed(2);
                
                // Update emotion display color based on result
                const colors = {
                    happy: '#4caf50',
                    sad: '#2196f3',
                    angry: '#f44336',
                    fear: '#9c27b0',
                    surprise: '#ff9800',
                    neutral: '#9e9e9e',
                    disgust: '#795548'
                };
                
                emotionDisplay.style.color = colors[result.emotion.toLowerCase()] || '#4361ee';
                
            } catch (error) {
                console.error('Analysis error:', error);
                emotionDisplay.textContent = 'Error';
                confidenceDisplay.textContent = '0';
                emotionDisplay.style.color = '#f44336';
            } finally {
                // Reset UI
                loadingIndicator.style.display = 'none';
                resultContent.style.display = 'block';
                captureBtn.disabled = false;
                captureBtn.textContent = 'Capture & Analyze';
            }
        }
        
        // Event listeners
        captureBtn.addEventListener('click', captureAndAnalyze);
        
        // Initialize on load
        window.addEventListener('DOMContentLoaded', initCamera);
    </script>
</body>
</html>
"""

@app.get("/", response_class=HTMLResponse)
async def main_interface():
    return HTMLResponse(content=html_content, status_code=200)

@app.post("/predict")
async def predict_emotion_api(file: UploadFile = File(...)):
    try:
        # Read image file
        image_data = await file.read()
        
        # Get prediction
        result = predict_emotion(image_data)
        
        # Format confidence as percentage
        result["confidence"] = round(result["confidence"] * 100, 2)
        
        return JSONResponse(content={
            "emotion": result["emotion"],
            "confidence": result["confidence"]
        })
        
    except Exception as e:
        logger.error(f"API error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    config = uvicorn.Config(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info",
        reload=True
    )
    server = uvicorn.Server(config)
    asyncio.run(server.serve())