import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Upload, Check, AlertCircle, SwitchCamera } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (photoDataUrl: string) => void;
  title?: string;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  title = 'Fotografía de Respaldo de la Entrega',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    setCameraError(null);
    stopCamera();

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err) {
      console.warn('No se pudo acceder a la cámara WebRTC:', err);
      setCameraError('No se pudo iniciar la cámara en directo. Puedes subir o tomar una foto usando el botón de captura.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

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

    // Dibujar fotograma del video
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Estampar marca de agua legal de trazabilidad
    const now = new Date();
    const timestampStr = now.toLocaleDateString('es-CL') + ' ' + now.toLocaleTimeString('es-CL');
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(0, canvas.height - 32, canvas.width, 32);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '14px Calibri, sans-serif';
    ctx.fillText(`ENTREGA BODEGA - ${timestampStr}`, 12, canvas.height - 11);

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
    <div className="border border-slate-300 rounded-lg p-3 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-sky-700" />
          <span className="text-calibri-title text-slate-800">{title}</span>
        </div>
        {photoPreview && (
          <span className="inline-flex items-center gap-1 text-calibri-normal text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <Check className="w-3.5 h-3.5" /> Foto lista
          </span>
        )}
      </div>

      {cameraError && (
        <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded text-calibri-normal text-amber-800 flex items-start gap-1.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Contenedor de Vista Previa o Video en Vivo */}
      <div className="relative border border-slate-200 rounded-md overflow-hidden bg-slate-900 aspect-video flex items-center justify-center">
        {photoPreview ? (
          <img
            src={photoPreview}
            alt="Evidencia de entrega"
            className="w-full h-full object-contain bg-slate-950"
          />
        ) : isCameraActive ? (
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <Camera className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-calibri-normal mb-1">Evidencia fotográfica obligatoria</p>
            <p className="text-calibri-normal text-slate-500 text-xs">
              Fotografía de los insumos siendo entregados al técnico
            </p>
          </div>
        )}

        {/* Botón flotante para alternar cámara en móviles */}
        {isCameraActive && !photoPreview && (
          <button
            type="button"
            onClick={toggleFacingMode}
            className="absolute top-2 right-2 p-2 bg-slate-900/80 text-white rounded-full hover:bg-slate-800 transition-colors shadow"
            title="Cambiar cámara"
          >
            <SwitchCamera className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Controles de Acción */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
        {!photoPreview ? (
          <>
            <div className="flex items-center gap-2">
              {!isCameraActive ? (
                <button
                  type="button"
                  onClick={() => startCamera()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-calibri-normal font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded shadow-sm transition-colors touch-target"
                >
                  <Camera className="w-4 h-4" />
                  Activar Cámara
                </button>
              ) : (
                <button
                  type="button"
                  onClick={takeSnapshot}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-calibri-normal font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-sm transition-colors touch-target"
                >
                  <Camera className="w-4 h-4" />
                  Tomar Fotografía
                </button>
              )}

              {/* Botón de carga alternativa de archivo o cámara nativa móvil */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-calibri-normal text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors touch-target"
              >
                <Upload className="w-3.5 h-3.5" />
                Subir Foto / Galería
              </button>
            </div>
            {isCameraActive && (
              <button
                type="button"
                onClick={stopCamera}
                className="text-calibri-normal text-slate-500 hover:text-slate-700 px-2 py-1"
              >
                Cancelar cámara
              </button>
            )}
          </>
        ) : (
          <div className="w-full flex items-center justify-between">
            <button
              type="button"
              onClick={retakePhoto}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-calibri-normal text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors touch-target"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Tomar otra fotografía
            </button>
            <span className="text-calibri-normal text-emerald-600 font-semibold flex items-center gap-1">
              <Check className="w-4 h-4" /> Evidencia vinculada al acta
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

