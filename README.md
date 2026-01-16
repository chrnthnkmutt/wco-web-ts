# WCO Elephant Monitor 🐘

A modern, full-stack application for monitoring and tracking wild elephants. This system combines a **Next.js 14+** frontend with a **FastAPI** Python backend to provide real-time analytics, AI-powered object detection, and interactive mapping.

## 🌟 Key Features

*   **Real-time Dashboard**: Interactive map using **Leaflet** to visualize elephant locations and tracking zones.
*   **AI Object Detection**: Integrated **YOLOv12** model for detecting elephants in images/video streams (Backend via FastAPI & Frontend via ONNX).
*   **Smart Assistant**: Voice-enabled AI assistant powered by **Google GenAI** for system querying and tracking updates.
*   **Simulation Mode**: Built-in tools to simulate "Buffer Breach" or "Critical Threat" scenarios for testing response protocols.
*   **Analytics**: Historical data visualization using **Recharts**.

## 🛠️ Tech Stack

### Frontend
*   **Framework**: Next.js 16 (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS v4
*   **Map Engine**: React Leaflet
*   **AI/ML (Client)**: ONNX Runtime Web (`onnxruntime-web`)

### Backend (AI Service)
*   **Framework**: FastAPI
*   **ML Engine**: Ultralytics YOLO
*   **Language**: Python 3.x

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18 or later)
*   Python (v3.8 or later)

### 1. Setup the Backend (Python)

The Python backend handles the heavy-lifting for image processing and inference.

```bash
# Optional: Create a virtual environment
python -m venv venv
# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the API server
python api.py
```
*The backend API will start on `http://localhost:8000`*

### 2. Setup the Frontend (Next.js)

Open a new terminal window for the frontend.

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```
*The application will be accessible at `http://localhost:3000`*

## 📁 Project Structure

```
wco-web-ts/
├── app/                  # Next.js App Router pages & API routes
│   ├── analytics/        # Analytics dashboard
│   ├── api/              # Internal API (Voice, Simulation)
│   ├── liff/             # LINE Front-end Framework integration
│   └── system/           # System status page
├── components/           # Reusable UI Components
│   ├── Map.tsx           # Leaflet map wrapper
│   ├── VoiceAssistant.tsx# AI Voice interface
│   └── YoloDetector.tsx  # Object detection component
├── lib/                  # Utility functions & State management
├── model/                # YOLO models (PyTorch .pt & ONNX)
├── public/               # Static assets & WASM files
├── api.py                # FastAPI backend entry point
└── requirements.txt      # Python dependencies
```

## ⚠️ Notes
*   **Model Files**: Ensure `model/V12img10/best.pt` exists for the Python backend to work correctly.
*   **Google GenAI**: The Voice Assistant requires a valid API key configured in your environment variables.
