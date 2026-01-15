"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AlertTriangle, Upload } from "lucide-react";

interface YoloDetectorProps {
    modelPath?: string; // Kept for prop compatibility but unused
    imageSrc: string;
}

interface DetectionBox {
    x: number;
    y: number;
    width: number;
    height: number;
    score: number;
    label: string;
}

export default function YoloDetector({ imageSrc }: YoloDetectorProps) {
    const [currentSrc, setCurrentSrc] = useState(imageSrc);
    const [loading, setLoading] = useState(true);
    const [inferenceTime, setInferenceTime] = useState(0);
    const [detections, setDetections] = useState<DetectionBox[]>([]);
    const [error, setError] = useState<string | null>(null);

    const imageRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Update state if prop changes
    useEffect(() => {
        setCurrentSrc(imageSrc);
    }, [imageSrc]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        setCurrentSrc(url);
        // The image onLoad will trigger detection
    };

    const drawBoxes = useCallback((boxes: DetectionBox[]) => {
        const canvas = canvasRef.current;
        const img = imageRef.current;
        if (!canvas || !img) return;

        // Match canvas size to image display size
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Calculate scaling factors (if image is resized by CSS)
        // For this component, we assume the API returns coordinates relative to the original image
        // but we need to scale them to the displayed image size.
        // However, usually we send the *file* to the API, so the API returns coords for the full resolution.
        // We need to scale them to the <img> render size.
        
        const scaleX = img.width / img.naturalWidth;
        const scaleY = img.height / img.naturalHeight;

        boxes.forEach(box => {
            const x = box.x * scaleX;
            const y = box.y * scaleY;
            const w = box.width * scaleX;
            const h = box.height * scaleY;

            // Box
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, w, h);

            // Label
            ctx.fillStyle = '#00ff00';
            ctx.font = '16px monospace';
            const text = `${box.label} ${(box.score * 100).toFixed(1)}%`;
            const textWidth = ctx.measureText(text).width;
            ctx.fillRect(x, y - 20, textWidth + 10, 20);
            
            ctx.fillStyle = 'black';
            ctx.fillText(text, x + 5, y - 5);
        });
    }, []);

    const detectObject = useCallback(async () => {
        if (!imageRef.current) return;
        const img = imageRef.current;
        if (!img.complete || img.naturalWidth === 0) return;

        setLoading(true);
        setError(null);
        
        try {
            // Fetch the image as a blob
            const res = await fetch(currentSrc);
            const blob = await res.blob();
            
            const formData = new FormData();
            formData.append('file', blob, 'image.jpg');

            const start = performance.now();
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const apiRes = await fetch(`${apiUrl}/detect`, {
                method: 'POST',
                body: formData
            });
            
            if (!apiRes.ok) {
                throw new Error(`API Error: ${apiRes.statusText}`);
            }

            const data = await apiRes.json();
            const end = performance.now();
            
            setInferenceTime(end - start);
            setDetections(data.detections);
            drawBoxes(data.detections);

        } catch (err: unknown) {
            console.error(err);
            setError(err instanceof Error ? err.message : "Failed to connect to detection API");
        } finally {
            setLoading(false);
        }
    }, [currentSrc, drawBoxes]);

    // Trigger detection when image loads
    useEffect(() => {
        // We can just rely on the image's onLoad, or if it's already loaded, call it.
        // But for safety, we'll set up the listener.
        const img = imageRef.current;
        if (img && img.complete) {
            detectObject();
        }
    }, [detectObject]);

    return (
        <div className="relative w-full h-full bg-black rounded-lg overflow-hidden group">
             {/* Main Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
                ref={imageRef} 
                src={currentSrc} 
                alt="CCTV Feed" 
                className="w-full h-full object-cover opacity-80"
                crossOrigin="anonymous"
                onLoad={detectObject}
            />
            
            {/* Detection Overlay */}
            <canvas 
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none z-10"
            />

            {/* Grid Overlay (Aesthetic) */}
            <div className="absolute inset-0 opacity-20 pointer-events-none z-20" 
                style={{ backgroundImage: 'linear-gradient(#0f0 1px, transparent 1px), linear-gradient(90deg, #0f0 1px, transparent 1px)', backgroundSize: '100px 100px' }}>
            </div>

             {/* UI Overlay */}
             <div className="absolute top-4 left-4 z-30 text-green-500 font-mono text-xs flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <span className="animate-pulse">●</span> REC
                </div>
                <div>MODEL: YOLOv12n (Native .pt)</div>
                <div>INFERENCE: {inferenceTime.toFixed(0)}ms</div>
            </div>

            {/* Upload Button */}
            <div className="absolute top-4 right-4 z-40">
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-slate-800/80 hover:bg-slate-700 text-white p-2 rounded-full border border-slate-600 transition-colors shadow-lg"
                    title="Upload Test Image"
                >
                    <Upload size={16} />
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileUpload}
                />
            </div>

             {/* Center Status */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/50">
                    <div className="text-green-500 font-mono animate-pulse">CONNECTING TO NEURAL NET...</div>
                </div>
            )}
            
            {error && (
                 <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/80">
                    <div className="text-red-500 font-mono p-4 text-center border border-red-500 rounded">
                        <AlertTriangle className="mx-auto mb-2"/>
                        <p>{error}</p>
                        <p className="text-xs mt-2 text-slate-400">Ensure 'python api.py' is running</p>
                    </div>
                </div>
            )}

            {!loading && detections.length > 0 && (
                <div className="absolute bottom-4 left-4 z-30">
                    <div className="bg-red-500/20 border border-red-500 text-red-100 px-3 py-1 rounded text-xs font-bold animate-pulse">
                        THREAT DETECTED: {detections.length} OBJECT(S)
                    </div>
                </div>
            )}
        </div>
    );
}