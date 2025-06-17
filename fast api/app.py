from fastapi import FastAPI, Request, HTTPException
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import logging
import os
from pathlib import Path
import base64
from fastapi import File, UploadFile

from pathlib import Path

BASE_DIR = Path(__file__).parent.resolve()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create a FastAPI instance
app = FastAPI(title="Facial Expression Recognition API",
    description="""
    Vision Transformer (ViT) based facial expression recognition.
    Model: mo-thecreator/vit-Facial-Expression-Recognition
    Detects: anger, disgust, fear, happy, neutral, sad
    """)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")
templates = Jinja2Templates(directory=BASE_DIR / "templates")

# Define a route to serve the HTML page
@app.get("/")
async def read_root(request: Request):
    try:
        # Check if index.html exists
        template_path = BASE_DIR / "templates" / "index.html"
        if not template_path.exists():
            logger.error("Template file 'index.html' not found")
            raise HTTPException(status_code=500, detail="Template file not found")
        
        logger.info("Serving index.html")
        return templates.TemplateResponse("index.html", {"request": request})
    except Exception as e:
        logger.error(f"Error serving index.html: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error rendering template: {str(e)}")
    
@app.post("/predict")
async def predict_image(file: UploadFile = File(...)):
    try:
        # Read the file content
        contents = await file.read()
        
        # Import the emotion analysis function
        from model2 import analyze_emotion
        
        # Get prediction
        result = analyze_emotion(contents)
        
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    try:
        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="Empty file")
        
        emotion, confidence = predict_emotion(contents, processor, model)
        
        print(f"Prediction made: {emotion} with confidence {confidence}")  # Debug log
        
        return {
            "emotion": emotion,
            "confidence": float(confidence) * 100
        }
    except Exception as e:
        print(f"Error in predict endpoint: {str(e)}")  # Debug log
        raise HTTPException(status_code=500, detail=str(e))

# Optional: Endpoint to save the captured image
@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    try:
        # Ensure the uploads directory exists
        upload_dir = BASE_DIR / "uploads"
        upload_dir.mkdir(exist_ok=True)

        # Read the image file
        contents = await file.read()
        
        # Save the image
        file_path = upload_dir / f"captured_face_{file.filename}"
        with open(file_path, "wb") as f:
            f.write(contents)
        
        logger.info(f"Image saved to {file_path}")
        return JSONResponse(content={"message": f"Image saved to {file_path}"}, status_code=200)
    except Exception as e:
        logger.error(f"Error saving image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error saving image: {str(e)}")
    
@app.post("/save-image")
async def save_image(file: UploadFile = File(...)):
    try:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        contents = await file.read()
        
        with open(file_path, "wb") as f:
            f.write(contents)
            
        return {"message": "Image saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save image: {str(e)}")