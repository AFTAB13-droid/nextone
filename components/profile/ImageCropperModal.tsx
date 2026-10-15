"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Modal } from "@/components/ui/Modal";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
  Check,
  Move,
  Sparkles,
} from "lucide-react";

interface ImageCropperModalProps {
  imageSrc: string | null;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedBase64: string) => Promise<void> | void;
  isSaving?: boolean;
}

const CROP_BOX_SIZE = 300; // Interactive viewport size in px
const OUTPUT_SIZE = 512;   // High-res output square size

export function ImageCropperModal({
  imageSrc,
  isOpen,
  onClose,
  onCropComplete,
  isSaving = false,
}: ImageCropperModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const imageRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Reset transform state when new image is loaded
  useEffect(() => {
    if (imageSrc) {
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
      setImageLoaded(false);

      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        imageRef.current = img;
        setImageLoaded(true);
      };
      img.src = imageSrc;
    }
  }, [imageSrc]);

  // Draw the image on the interactive canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !imageLoaded) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CROP_BOX_SIZE, CROP_BOX_SIZE);
    ctx.save();

    // Move to canvas center
    ctx.translate(CROP_BOX_SIZE / 2 + pan.x, CROP_BOX_SIZE / 2 + pan.y);
    ctx.rotate((rotation * Math.PI) / 180);

    // Calculate scale so image fills the crop box nicely
    const baseScale = Math.max(CROP_BOX_SIZE / img.naturalWidth, CROP_BOX_SIZE / img.naturalHeight);
    const finalScale = baseScale * zoom;

    const renderWidth = img.naturalWidth * finalScale;
    const renderHeight = img.naturalHeight * finalScale;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      img,
      -renderWidth / 2,
      -renderHeight / 2,
      renderWidth,
      renderHeight
    );

    ctx.restore();

    // Also draw live circle preview
    drawPreview();
  }, [zoom, rotation, pan, imageLoaded]);

  // Draw mini live preview
  const drawPreview = useCallback(() => {
    const previewCanvas = previewCanvasRef.current;
    const img = imageRef.current;
    if (!previewCanvas || !img || !imageLoaded) return;

    const pCtx = previewCanvas.getContext("2d");
    if (!pCtx) return;

    const size = 96;
    pCtx.clearRect(0, 0, size, size);
    pCtx.save();

    // Circle clipping mask
    pCtx.beginPath();
    pCtx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    pCtx.closePath();
    pCtx.clip();

    const ratio = size / CROP_BOX_SIZE;
    pCtx.translate(size / 2 + pan.x * ratio, size / 2 + pan.y * ratio);
    pCtx.rotate((rotation * Math.PI) / 180);

    const baseScale = Math.max(CROP_BOX_SIZE / img.naturalWidth, CROP_BOX_SIZE / img.naturalHeight);
    const finalScale = baseScale * zoom * ratio;

    const renderWidth = img.naturalWidth * finalScale;
    const renderHeight = img.naturalHeight * finalScale;

    pCtx.imageSmoothingEnabled = true;
    pCtx.imageSmoothingQuality = "high";

    pCtx.drawImage(
      img,
      -renderWidth / 2,
      -renderHeight / 2,
      renderWidth,
      renderHeight
    );

    pCtx.restore();
  }, [zoom, rotation, pan, imageLoaded]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch pan handlers for mobile/tablets
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.min(3, Math.max(0.6, Number((prev + delta).toFixed(2)))));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  // Crop & Export High-Resolution Output
  const handleConfirmCrop = async () => {
    const img = imageRef.current;
    if (!img) return;

    // Create high-res offscreen canvas
    const offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = OUTPUT_SIZE;
    offscreenCanvas.height = OUTPUT_SIZE;

    const ctx = offscreenCanvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    ctx.save();

    const scaleFactor = OUTPUT_SIZE / CROP_BOX_SIZE;
    ctx.translate(
      OUTPUT_SIZE / 2 + pan.x * scaleFactor,
      OUTPUT_SIZE / 2 + pan.y * scaleFactor
    );
    ctx.rotate((rotation * Math.PI) / 180);

    const baseScale = Math.max(CROP_BOX_SIZE / img.naturalWidth, CROP_BOX_SIZE / img.naturalHeight);
    const finalScale = baseScale * zoom * scaleFactor;

    const renderWidth = img.naturalWidth * finalScale;
    const renderHeight = img.naturalHeight * finalScale;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      img,
      -renderWidth / 2,
      -renderHeight / 2,
      renderWidth,
      renderHeight
    );

    ctx.restore();

    // Export as high quality JPEG data URL
    const croppedDataUrl = offscreenCanvas.toDataURL("image/jpeg", 0.92);
    await onCropComplete(croppedDataUrl);
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Crop & Resize Profile Picture"
      description="Position, scale, and adjust your photo to create a professional executive avatar"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Main Crop Viewport & Preview Section */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 p-4 sm:p-6 bg-slate-900 rounded-3xl relative overflow-hidden select-none">
          {/* Viewport Box */}
          <div
            className="relative cursor-grab active:cursor-grabbing rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/10"
            style={{ width: CROP_BOX_SIZE, height: CROP_BOX_SIZE }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
          >
            {/* Underlying Canvas */}
            <canvas
              ref={canvasRef}
              width={CROP_BOX_SIZE}
              height={CROP_BOX_SIZE}
              className="w-full h-full block bg-slate-950"
            />

            {/* Circular Vignette Overlay Mask */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div
                className="w-full h-full rounded-full border-2 border-dashed border-cyan-400 shadow-[0_0_0_9999px_rgba(15,23,42,0.65)]"
                style={{ width: CROP_BOX_SIZE - 20, height: CROP_BOX_SIZE - 20 }}
              />
            </div>

            {/* Helper drag indicator tag */}
            <div className="absolute bottom-2.5 inset-x-0 flex justify-center pointer-events-none">
              <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-[10px] font-bold text-slate-300 flex items-center gap-1.5 border border-white/10">
                <Move className="w-3 h-3 text-cyan-400" />
                <span>Drag to reposition</span>
              </span>
            </div>
          </div>

          {/* Right Column: Live circular avatar preview */}
          <div className="flex flex-col items-center justify-center gap-3 p-4 bg-slate-800/60 rounded-2xl border border-white/5 min-w-[140px]">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Avatar Preview
            </span>
            <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-950 ring-4 ring-indigo-500/40 shadow-xl">
              <canvas
                ref={previewCanvasRef}
                width={96}
                height={96}
                className="w-full h-full block"
              />
            </div>
            <span className="text-[10px] text-slate-400 font-medium">As shown across portal</span>
          </div>
        </div>

        {/* Adjustments & Controls Toolbar */}
        <div className="space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          {/* Zoom Slider */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setZoom((prev) => Math.max(0.6, Number((prev - 0.1).toFixed(2))))}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-indigo-600 transition-colors shadow-2xs"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <div className="flex-1 flex items-center gap-3">
              <span className="text-xs font-bold text-slate-600 min-w-[50px]">Zoom</span>
              <input
                type="range"
                min="0.6"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
              />
              <span className="text-xs font-mono font-bold text-indigo-700 min-w-[42px] text-right">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            <button
              type="button"
              onClick={() => setZoom((prev) => Math.min(3, Number((prev + 0.1).toFixed(2))))}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-indigo-600 transition-colors shadow-2xs"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Action Tools */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRotate}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-indigo-600 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <RotateCw className="w-3.5 h-3.5 text-indigo-600" />
                <span>Rotate 90°</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset View</span>
              </button>
            </div>

            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
              Scroll wheel zooms • Drag to position
            </span>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmCrop}
            disabled={isSaving || !imageLoaded}
            className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Uploading Cropped Photo...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Apply & Save Profile Picture</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
