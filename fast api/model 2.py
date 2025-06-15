import os
import torch
from PIL import Image, ImageDraw
from transformers import AutoImageProcessor, AutoModelForImageClassification

# -----------------------------
# Setup
# -----------------------------
# Load processor and model
def initialize_model():
    model_name = "mo-thecreator/vit-Facial-Expression-Recognition"
    processor = AutoImageProcessor.from_pretrained(model_name)
    model = AutoModelForImageClassification.from_pretrained(model_name)
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = model.to(device)
    
    return processor, model

def predict_emotion(image_bytes, processor, model):
    try:
        # Convert bytes to PIL Image
        image = Image.open(image_bytes)
        
        # Process image into patches and prepare for model
        inputs = processor(images=image, return_tensors="pt")
        
        # Move inputs to same device as model
        device = next(model.parameters()).device
        inputs = {k: v.to(device) for k, v in inputs.items()}
        
        # Get prediction
        with torch.no_grad():
            outputs = model(**inputs)
            probs = outputs.logits.softmax(-1)
            pred_class = probs.argmax(-1).item()
        
        # Map prediction to emotion
        emotions = ["anger", "disgust", "fear", "happy", "neutral", "sad"]
        emotion = emotions[pred_class]
        confidence = probs[0][pred_class].item()
        
        return emotion, confidence
        
    except Exception as e:
        raise Exception(f"Error processing image: {str(e)}")
}

# Emotion labels as per model's index mapping
emotion_labels = model.config.id2label  # uses the model's internal label mapping

# -----------------------------
# Utility Functions
# -----------------------------
def draw_landmarks(image: Image.Image, landmarks: list[tuple[int, int]]) -> Image.Image:
    """Draws red dots for landmarks on the image."""
    draw = ImageDraw.Draw(image)
    for (x, y) in landmarks:
        r = 2
        draw.ellipse((x - r, y - r, x + r, y + r), fill='red')
    return image

def load_image(image_path: str) -> Image.Image:
    """Loads an image and converts to RGB."""
    return Image.open(image_path).convert("RGB")

# -----------------------------
# Core Prediction Function
# -----------------------------
def predict_emotion_from_image(image_path: str, landmarks: list[tuple[int, int]] = None) -> str:
    """
    Loads image from path, draws landmarks (optional), predicts emotion.
    Returns the predicted emotion label.
    """
    image = load_image(image_path)

    # Optionally overlay landmarks
    if landmarks:
        image = draw_landmarks(image, landmarks)

    # Preprocess and predict
    inputs = processor(images=image, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs)
        predicted_class = outputs.logits.argmax(-1).item()

    return emotion_labels[predicted_class]

# -----------------------------
# Example Batch Inference
# -----------------------------
def batch_predict_emotions(image_dir: str, landmarks_dict: dict = None):
    """
    Predicts emotions for all .jpg images in a directory.
    Optionally uses a dictionary of landmarks.
    """
    if not os.path.isdir(image_dir):
        raise ValueError(f"{image_dir} is not a valid directory.")

    for img_file in os.listdir(image_dir):
        if img_file.lower().endswith(".jpg"):
            img_path = os.path.join(image_dir, img_file)
            landmarks = landmarks_dict.get(img_file) if landmarks_dict else None
            emotion = predict_emotion_from_image(img_path, landmarks)
            print(f"{img_file}: {emotion}")

# -----------------------------
# Example Usage
# -----------------------------
if __name__ == "__main__":
    # Replace with your real path
    image_folder = r"C:\Users\varsh\OneDrive\Documents\codes\Joyverse\Images"
    
    # Example: Define landmarks if needed
    landmarks_dict = {
        "img1.jpg": [(100, 120), (110, 130), (115, 125)],  # example landmarks
        "img2.jpg": [(90, 105), (95, 110), (100, 108)],
    }

    batch_predict_emotions(image_folder, landmarks_dict)
