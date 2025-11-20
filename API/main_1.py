from fastapi import FastAPI, File, UploadFile 
import uvicorn
import numpy as np
from PIL import Image
from io import BytesIO
import tensorflow as tf
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:5173",  # React dev server origin
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL = tf.keras.models.load_model("C:/Users/nisar/OneDrive/Documents/Project/Potato-Disease-Classification/Store-Model/1.keras")

CLASS_NAMES = ['Early Blight', 'Late Blight', 'Healthy']

@app.get("/ping")
async def ping():
    return "Hello, I am alive."

def read_file_as_image(data) -> np.ndarray:
    image = np.array(Image.open(BytesIO(data)))
    return image

@app.post("/predict-potato-leaf-disease")
async def predict_potato_leaf_disease(
        image: UploadFile = File(...),
    ):
    image = read_file_as_image(await image.read())
    image_batch = np.expand_dims(image, axis=0)
    predictions = MODEL.predict(image_batch)
    predicted_class_name = CLASS_NAMES[np.argmax(predictions[0])]
    confidence = np.max(predictions[0]) * 100
    return {
        "predicted_class_name": predicted_class_name,
        "confidence": float(confidence)
    }

if __name__ == "__main__":
    uvicorn.run(app, host='localhost', port=8000)