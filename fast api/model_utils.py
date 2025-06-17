import torch
from PIL import Image
import io
import base64
from transformers import AutoImageProcessor, AutoModelForImageClassification
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables
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
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))
        else:
            image = Image.open(io.BytesIO(image_data))
        
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        return image
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        raise

def predict_emotion(image_data):
    """Main function to predict emotion from image"""
    global model, processor, device
    
    try:
        if model is None or processor is None:
            processor, model = initialize_model()
        
        image = process_image(image_data)
        inputs = processor(images=image, return_tensors="pt")
        inputs = {k: v.to(device) for k, v in inputs.items()}
        
        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits
            probabilities = torch.nn.functional.softmax(logits, dim=1)
            predicted_class_idx = torch.argmax(probabilities, dim=1).item()
        
        predicted_label = model.config.id2label[predicted_class_idx]
        confidence = probabilities[0][predicted_class_idx].item()
        
        emotion_probs = {
            model.config.id2label[i]: float(prob)
            for i, prob in enumerate(probabilities[0].tolist())
        }
        
        result = {
            "emotion": predicted_label,
            "confidence": float(confidence),
            "all_emotions": emotion_probs
        }
        
        logger.info(f"Prediction successful: {predicted_label} ({confidence:.2%})")
        return result
        
    except Exception as e:
        logger.error(f"Error in emotion prediction: {str(e)}")
        raise

# Initialize model when module is loaded
initialize_model()