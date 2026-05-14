import { useState, useRef, useCallback } from 'react';
import { Camera, X, RefreshCw } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageStr: string) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // prefer back camera
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError('');
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access the camera. Please ensure permissions are granted.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const captureImage = useCallback(() => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        // Get base64 string
        const base64Image = canvas.toDataURL('image/jpeg', 0.8);
        stopCamera();
        onCapture(base64Image);
      }
    }
  }, [onCapture, stopCamera]);

  // Start camera when component mounts
  useState(() => {
    startCamera();
    return () => stopCamera();
  });

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      <div className="absolute top-4 right-4 z-50 flex space-x-4">
        <button 
          onClick={startCamera}
          className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700"
          title="Restart Camera"
        >
          <RefreshCw size={24} />
        </button>
        <button 
          onClick={() => { stopCamera(); onClose(); }}
          className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700"
          title="Close Camera"
        >
          <X size={24} />
        </button>
      </div>

      {error ? (
        <div className="text-white text-center p-4">
          <p>{error}</p>
          <button 
            onClick={startCamera}
            className="mt-4 px-4 py-2 bg-blue-600 rounded-md text-white"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="relative w-full h-full flex flex-col">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="flex-1 w-full h-full object-cover"
          />
          <div className="absolute bottom-8 w-full flex justify-center">
            <button 
              onClick={captureImage}
              className="w-16 h-16 bg-white border-4 border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-200"
            >
              <Camera size={28} className="text-gray-800" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
