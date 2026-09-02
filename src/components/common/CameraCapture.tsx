import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Upload, Check, AlertCircle, SwitchCamera, Sparkles } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (photoDataUrl: string) => void;
  title?: string;
  subtitle?: string;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  title = 'Fotografía de Respaldo',
  subtitle = 'Fotografía de los insumos o producto dañado',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    setCameraError(null);
    stopCamera();

    try {
      let stream: MediaStream;
      try {
        // Intento 1: con facingMode para cámara trasera en móviles
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (errMode) {
        // Intento 2 fallback: cualquier cámara disponible (webcam laptop/PC)
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      setIsCameraActive(true);

      // Conectar stream al elemento video que SIEMPRE está montado
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch((e) => console.warn('Play video failed:', e));
        };
      }
    } catch (err: any) {
      console.warn('Error al iniciar la cámara:', err);
      setCameraError(
        'No se pudo abrir el visor en vivo. Puedes presionar "Tomar con Cámara Móvil" o seleccionar una foto de tu galería.'
      );
      setIsCameraActive(false);
    }
  };

  // Asegurar enlace del stream al video si se actualiza el estado
  useEffect(() => {
    if (isCameraActive && streamRef.current && videoRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(console.warn);
      }
    }
  }, [isCameraActive]);

  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dibujar fotograma
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Estampar marca de agua de fecha y hora
    const now = new Date();
    const timestampStr = now.toLocaleDateString('es-CL') + ' ' + now.toLocaleTimeString('es-CL');
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 13px Calibri, sans-serif';
    ctx.fillText(`AUDITORÍA BODEGA - ${timestampStr}`, 12, canvas.height - 10);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setPhotoPreview(dataUrl);
    onCapture(dataUrl);
    stopCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPhotoPreview(dataUrl);
      onCapture(dataUrl);
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  const retakePhoto = () => {
    setPhotoPreview(null);
    onCapture('');
    startCamera();
  };

  // Limpiar stream al desmontar
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="border border-slate-300 rounded-lg p-3 bg-white shadow-sm space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-sky-700" />
          <span className="text-calibri-title text-slate-800 font-bold text-xs">{title}</span>
        </div>
        {photoPreview && (
          <span className="inline-flex items-center gap-1 text-calibri-normal text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
            <Check className="w-3.5 h-3.5" /> Foto capturada
          </span>
        )}
      </div>

      {cameraError && (
        <div className="p-2 bg-amber-50 border border-amber-200 rounded text-calibri-normal text-amber-800 flex items-start gap-1.5 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Contenedor de Video y Preview: El elemento <video> SIEMPRE existe en el DOM */}
      <div className="relative border border-slate-200 rounded-md overflow-hidden bg-slate-950 aspect-video flex items-center justify-center">
        {/* 1. Vista Previa de la Foto Tomada */}
        {photoPreview && (
          <img
            src={photoPreview}
            alt="Evidencia fotográfica"
            className="w-full h-full object-contain bg-slate-950"
          />
        )}

        {/* 2. Video en Vivo (Permanece en el DOM para recibir srcObject) */}
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted
          className={`w-full h-full object-cover ${
            isCameraActive && !photoPreview ? 'block' : 'hidden'
          }`}
        />

        {/* 3. Placeholder cuando no hay cámara activa ni foto */}
        {!isCameraActive && !photoPreview && (
          <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <Camera className="w-10 h-10 mb-2 opacity-60 text-sky-400" />
            <p className="text-calibri-normal font-bold text-slate-300 text-xs mb-0.5">
              Evidencia Fotográfica
            </p>
            <p className="text-calibri-normal text-slate-400 text-[11px]">
              {subtitle}
            </p>
          </div>
        )}

        {/* Botón flotante para alternar cámara en móviles */}
        {isCameraActive && !photoPreview && (
          <button
            type="button"
            onClick={toggleFacingMode}
            className="absolute top-2 right-2 p-2 bg-slate-900/80 text-white rounded-full hover:bg-slate-800 transition-colors shadow z-10"
            title="Cambiar cámara frontal/trasera"
          >
            <SwitchCamera className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Input nativo móvil para tomar foto con app de cámara o galería */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Botones de Control */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        {!photoPreview ? (
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {!isCameraActive ? (
              <>
                <button
                  type="button"
                  onClick={() => startCamera()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-sky-700 hover:bg-sky-800 font-bold rounded shadow-sm transition-colors touch-target"
                >
                  <Camera className="w-4 h-4" /> Activar Visor Web
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 font-bold rounded shadow-sm transition-colors touch-target"
                >
                  <Upload className="w-3.5 h-3.5 text-sky-700" /> Cámara Móvil / Galería
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={takeSnapshot}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs text-white bg-emerald-600 hover:bg-emerald-700 font-bold rounded shadow-md transition-colors touch-target animate-pulse"
                >
                  <Camera className="w-4 h-4" /> Capturar Fotografía
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded border border-slate-300"
                >
                  Cancelar
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={retakePhoto}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Repetir Foto
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
