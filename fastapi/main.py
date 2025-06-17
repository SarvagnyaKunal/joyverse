from fastapi import FastAPI, Request, UploadFile, File, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
from PIL import Image
import io
import base64
from transformers import pipeline, AutoImageProcessor, AutoModelForImageClassification
import torch
import uvicorn

app = FastAPI(title="Emotion Detection App", description="Detect emotions from facial expressions")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Templates
templates = Jinja2Templates(directory="templates")

# Initialize the emotion detection model
print("Loading emotion detection model...")
try:
    # Load the model and processor
    model_name = "mo-thecreator/vit-Facial-Expression-Recognition"
    processor = AutoImageProcessor.from_pretrained(model_name)
    model = AutoModelForImageClassification.from_pretrained(model_name)
    
    # Create pipeline
    emotion_pipeline = pipeline(
        "image-classification",
        model=model,
        feature_extractor=processor,
        device=0 if torch.cuda.is_available() else -1
    )
    
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    emotion_pipeline = None

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """Serve the main HTML page"""
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/predict")
async def predict_emotion(file: UploadFile = File(...)):
    """Predict emotion from uploaded image"""
    try:
        if emotion_pipeline is None:
            raise HTTPException(status_code=500, detail="Model not loaded")
        
        # Read the image file
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Convert to RGB if necessary
        if image.mode != "RGB":
            image = image.convert("RGB")
        
        # Run emotion detection
        results = emotion_pipeline(image)
        
        # Format results
        predictions = []
        for result in results:
            predictions.append({
                "emotion": result["label"],
                "confidence": round(result["score"] * 100, 2)
            })
        
        return JSONResponse({
            "success": True,
            "predictions": predictions
        })
    
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)

@app.post("/predict-webcam")
async def predict_emotion_webcam(request: Request):
    """Predict emotion from webcam image (base64)"""
    try:
        if emotion_pipeline is None:
            print("Error: Model not loaded")
            raise HTTPException(status_code=500, detail="Model not loaded")
        
        # Get JSON data
        data = await request.json()
        image_data = data.get("image")
        
        if not image_data:
            print("Error: No image data provided")
            raise HTTPException(status_code=400, detail="No image data provided")
        
        # Remove data URL prefix if present
        if image_data.startswith("data:image"):
            image_data = image_data.split(",")[1]
        
        print("Processing webcam image...")
        
        # Decode base64 image
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if necessary
        if image.mode != "RGB":
            image = image.convert("RGB")
        
        print(f"Image size: {image.size}")
        
        # Run emotion detection
        results = emotion_pipeline(image)
        
        # Format results
        predictions = []
        for result in results:
            predictions.append({
                "emotion": result["label"],
                "confidence": round(result["score"] * 100, 2)
            })
        
        print(f"Predictions: {predictions}")
        
        return JSONResponse({
            "success": True,
            "predictions": predictions
        })
    
    except Exception as e:
        print(f"Error in predict_emotion_webcam: {str(e)}")
        import traceback
        traceback.print_exc()
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": emotion_pipeline is not None
    }

if __name__ == "__main__":
    print("Starting Emotion Detection Server...")
    print("Access the app at: http://localhost:8000")
    print("Make sure to use localhost (not 127.0.0.1) for webcam access!")
    uvicorn.run(app, host="localhost", port=8000, log_level="info")
