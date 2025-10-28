import { current } from "@reduxjs/toolkit"
import { useCallback, useRef, useState,useEffect } from "react"

export const useCamera = (facingMode) => {
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode } },
        audio: false,
      });

      if (videoRef.current) videoRef.current.srcObject = stream;
      streamRef.current = stream;
    } catch (error) {
      setShowCamera(false);
      console.error("Camera access failed:", error);
      alert("Unable to access camera. Please check your browser permissions.");
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    const { videoWidth: width, videoHeight: height } = video;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (facingMode === "user") {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob((blob) => {
      const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
      const imageUrl = URL.createObjectURL(blob);
      setCapturedImage({ url: imageUrl, file });
      setShowCamera(false);
    }, "image/jpeg", 0.8);
  }, [facingMode]);

  useEffect(() => {
    if (showCamera) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [showCamera, startCamera, stopCamera]);

  useEffect(() => {
    return () => {
      if (capturedImage?.url) {
        URL.revokeObjectURL(capturedImage.url);
      }
    };
  }, [capturedImage]);

  return {
    showCamera,
    setShowCamera,
    capturedImage,
    setCapturedImage,
    videoRef,
    capturePhoto,
  };
};