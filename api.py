import os
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import uvicorn
import io
from PIL import Image

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Model
# Note: On cloud, ensure the model file is included in the build or downloaded at runtime
model = YOLO("model/V12img10/best.pt")

@app.get("/")
def home():
    return {"status": "ok", "message": "YOLOv12 API is running"}

@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    # Read image
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))
    
    # Run Inference
    results = model(image)
    
    # Process results
    detections = []
    for result in results:
        for box in result.boxes:
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            w = x2 - x1
            h = y2 - y1
            
            detections.append({
                "x": x1,
                "y": y1,
                "width": w,
                "height": h,
                "score": float(box.conf[0]),
                "label": result.names[int(box.cls[0])]
            })
            
    return {"detections": detections}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
