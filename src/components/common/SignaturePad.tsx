import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Check, PenTool } from 'lucide-react';

interface SignaturePadProps {
  onSave: (signatureDataUrl: string) => void;
  onClear?: () => void;
  title?: string;
  signeeName?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  onSave,
  onClear,
  title = 'Firma Digital del Receptor',
  signeeName = 'Técnico de Terreno',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Ajustar resolución del canvas para pantallas táctiles de alta densidad (Retina / móviles)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    setIsDrawing(false);
    
    // Auto emitir firma
    const canvas = canvasRef.current;
    if (canvas && hasDrawn) {
      onSave(canvas.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    if (onClear) onClear();
    onSave('');
  };

  return (
    <div className="border border-slate-300 rounded-lg p-3 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <PenTool className="w-4 h-4 text-sky-700" />
          <span className="text-calibri-title text-slate-800">{title}</span>
        </div>
        <span className="text-calibri-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
          {signeeName}
        </span>
      </div>

      <div className="relative border-2 border-dashed border-slate-300 rounded bg-slate-50 overflow-hidden touch-none">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-40 cursor-crosshair block"
        />

        {!hasDrawn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400">
            <PenTool className="w-6 h-6 mb-1 opacity-40" />
            <span className="text-calibri-normal">Firme aquí con el dedo o lápiz táctil</span>
          </div>
        )}

        <div className="absolute bottom-2 left-4 right-4 border-b border-slate-300 border-dotted pointer-events-none" />
      </div>

      <div className="flex items-center justify-between mt-2.5">
        <button
          type="button"
          onClick={clearCanvas}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-calibri-normal text-slate-600 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors touch-target"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Limpiar firma
        </button>

        <div className="flex items-center gap-1.5 text-calibri-normal text-slate-500">
          {hasDrawn ? (
            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
              <Check className="w-4 h-4 text-emerald-600" /> Firma capturada
            </span>
          ) : (
            <span>Pendiente de firma</span>
          )}
        </div>
      </div>
    </div>
  );
};

