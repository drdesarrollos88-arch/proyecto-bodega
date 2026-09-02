import React, { useState } from 'react';
import { WarehouseRequest, DeliveryRecord } from '../../types';
import { store } from '../../services/store';
import { useAuth } from '../../context/AuthContext';
import { X, Check, AlertCircle, ShieldCheck, User, Calendar, DollarSign, Package } from 'lucide-react';
import { SignaturePad } from '../common/SignaturePad';
import { CameraCapture } from '../common/CameraCapture';

interface DeliveryModalProps {
  request: WarehouseRequest | null;
  onClose: () => void;
  onDeliveryCompleted: (record: DeliveryRecord) => void;
}

export const DeliveryModal: React.FC<DeliveryModalProps> = ({
  request,
  onClose,
  onDeliveryCompleted,
}) => {
  const { currentUser, activeUser } = useAuth();
  const user = activeUser || currentUser || store.getProfiles()[0];
  const [signatureData, setSignatureData] = useState<string>('');
  const [photoData, setPhotoData] = useState<string>('');
  const [observations, setObservations] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!request) return null;

  const totalAmount = request.items.reduce((s, i) => s + i.total_price, 0);

  const handleSubmitDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validación estricta de auditoría: Se requiere firma y foto
    if (!signatureData) {
      setValidationError('La firma digital del receptor es obligatoria para garantizar la trazabilidad.');
      return;
    }

    if (!photoData) {
      setValidationError('La fotografía de respaldo de la entrega es obligatoria para la auditoría.');
      return;
    }

    try {
      setIsProcessing(true);
      const deliveryRecord = store.completeDelivery({
        requestId: request.id,
        warehouseStaffName: user.name,
        signatureData,
        photoData,
        observations: observations.trim() || undefined,
      });

      setIsProcessing(false);
      onDeliveryCompleted(deliveryRecord);
    } catch (err: any) {
      setIsProcessing(false);
      setValidationError(err.message || 'Error al procesar la entrega.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl border border-slate-300 overflow-hidden my-6">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-4 py-3 bg-sky-800 text-white">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-sky-200" />
            <h2 className="text-calibri-title text-white">
              Despacho y Entrega Oficial en Bodega ({request.id})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded hover:bg-sky-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmitDelivery} className="p-4 space-y-4 max-h-[85vh] overflow-y-auto">
          {validationError && (
            <div className="p-2.5 bg-rose-50 border border-rose-300 rounded text-calibri-normal text-rose-800 flex items-start gap-2 shadow-sm">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Ficha Resumen de Retiro */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded text-calibri-normal">
            <div>
              <span className="text-xs text-slate-500 block font-bold">Receptor (Técnico):</span>
              <p className="text-slate-900 font-semibold">{request.technician_name}</p>
              <p className="text-xs text-slate-500">RUT: {request.technician_rut}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500 block font-bold">Centro de Costos:</span>
              <p className="text-slate-900 font-bold">{request.cost_center_id}</p>
              {request.work_order && <p className="text-xs text-slate-600">OT: {request.work_order}</p>}
            </div>
            <div>
              <span className="text-xs text-slate-500 block font-bold">Bodeguero Despachador:</span>
              <p className="text-slate-900 font-semibold">{user.name}</p>
              <p className="text-xs text-slate-500">Bodega Central</p>
            </div>
          </div>

          {/* Lista de Insumos que se Entregan */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-calibri-title text-slate-900">
                Insumos a Entregar (Verificación Física)
              </h3>
              <span className="text-calibri-normal text-slate-600 text-xs font-semibold">
                Total: ${totalAmount.toLocaleString('es-CL')}
              </span>
            </div>
            <div className="border border-slate-300 rounded overflow-hidden">
              <table className="w-full text-left text-calibri-normal">
                <thead className="bg-slate-100 text-slate-700 text-xs font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-2">SKU</th>
                    <th className="p-2">Descripción</th>
                    <th className="p-2 text-center">Cant.</th>
                    <th className="p-2 text-right">Unitario</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {request.items.map((it) => (
                    <tr key={it.id} className="hover:bg-slate-50">
                      <td className="p-2 font-mono text-xs font-bold text-sky-800">{it.product_sku}</td>
                      <td className="p-2 text-slate-800 font-medium">{it.product_name}</td>
                      <td className="p-2 text-center font-bold text-slate-900">{it.quantity}</td>
                      <td className="p-2 text-right text-slate-600">${it.unit_price.toLocaleString('es-CL')}</td>
                      <td className="p-2 text-right font-bold text-slate-900">${it.total_price.toLocaleString('es-CL')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Observaciones de Entrega */}
          <div>
            <label className="block text-calibri-normal font-bold text-slate-700 mb-1">
              Observaciones del Despacho (Opcional):
            </label>
            <input
              type="text"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Ej: Materiales revisados y entregados en perfecto estado..."
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-calibri-normal text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-600"
            />
          </div>

          {/* 1. MÓDULO DE FIRMA DIGITAL */}
          <div className="space-y-1">
            <SignaturePad
              signeeName={request.technician_name}
              onSave={(sigUrl) => setSignatureData(sigUrl)}
            />
          </div>

          {/* 2. MÓDULO DE FOTOGRAFÍA DE LA ENTREGA */}
          <div className="space-y-1">
            <CameraCapture
              onCapture={(photoUrl) => setPhotoData(photoUrl)}
            />
          </div>

          {/* Botones de Finalización */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded text-calibri-normal text-slate-600 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-calibri-title font-bold shadow-md transition-colors touch-target"
            >
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
              {isProcessing ? 'Procesando entrega...' : 'Finalizar Entrega y Generar Acta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

