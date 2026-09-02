import React from 'react';
import { DeliveryRecord } from '../../types';
import { X, Printer, ShieldCheck, CheckCircle, Calendar, User, FileText, Camera } from 'lucide-react';

interface DeliveryReceiptModalProps {
  delivery: DeliveryRecord | null;
  onClose: () => void;
}

export const DeliveryReceiptModal: React.FC<DeliveryReceiptModalProps> = ({ delivery, onClose }) => {
  if (!delivery) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl border border-slate-300 overflow-hidden my-6">
        {/* Barra Superior con Controles (No imprimible) */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800 text-white no-print">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-calibri-title text-white">
              Acta Oficial de Entrega de Bodega ({delivery.id})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-700 hover:bg-sky-600 text-white rounded text-calibri-normal font-bold transition-colors"
            >
              <Printer className="w-4 h-4" /> Imprimir / Exportar PDF
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Documento Imprimible Oficial */}
        <div className="p-6 text-slate-900 bg-white space-y-4 print:p-0">
          {/* Membrete Corporativo */}
          <div className="border-b-2 border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-calibri-title text-slate-900 uppercase font-black tracking-wider">
                COMPROBANTE OFICIAL DE ENTREGA Y RECEPCIÓN DE MATERIALES
              </h1>
              <p className="text-calibri-normal text-slate-600">
                Departamento de Logística, Bodega Central y Operaciones
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 uppercase font-bold block">Folio Acta Auditada:</span>
              <span className="text-calibri-title text-sky-800 font-mono font-bold text-lg">
                {delivery.id}
              </span>
            </div>
          </div>

          {/* Ficha de Información de la Entrega */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-slate-50 border border-slate-200 rounded text-calibri-normal">
            <div>
              <span className="text-xs text-slate-500 block font-bold">Fecha y Hora:</span>
              <span className="text-slate-800 font-medium">
                {new Date(delivery.delivered_at).toLocaleString('es-CL')}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block font-bold">N° Solicitud Origen:</span>
              <span className="text-slate-800 font-mono font-bold text-sky-800">
                {delivery.request_id}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block font-bold">Centro de Costos:</span>
              <span className="text-slate-800 font-bold">{delivery.cost_center_id}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block font-bold">Estado Entrega:</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Conforme en Terreno
              </span>
            </div>
          </div>

          {/* Intervinientes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-calibri-normal">
            <div className="p-2.5 border border-slate-200 rounded">
              <span className="text-xs text-slate-500 block font-bold">Receptor (Técnico de Terreno):</span>
              <p className="text-slate-900 font-bold">{delivery.technician_name}</p>
              <p className="text-slate-600 text-xs">RUT: {delivery.technician_rut}</p>
            </div>
            <div className="p-2.5 border border-slate-200 rounded">
              <span className="text-xs text-slate-500 block font-bold">Entregador (Personal de Bodega):</span>
              <p className="text-slate-900 font-bold">{delivery.warehouse_staff_name}</p>
              <p className="text-slate-600 text-xs">Bodega Principal de Insumos</p>
            </div>
          </div>

          {/* Tabla de Artículos Entregados */}
          <div>
            <h2 className="text-calibri-title text-slate-900 mb-1.5">
              Detalle de Insumos y Herramientas Entregadas
            </h2>
            <div className="border border-slate-300 rounded overflow-hidden">
              <table className="w-full text-left border-collapse text-calibri-normal">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 font-bold text-xs">
                    <th className="p-2">SKU</th>
                    <th className="p-2">Descripción del Artículo</th>
                    <th className="p-2 text-center">Cantidad</th>
                    <th className="p-2 text-right">Precio Unitario</th>
                    <th className="p-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {delivery.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2 font-mono text-xs font-bold text-sky-800">{item.product_sku}</td>
                      <td className="p-2 text-slate-800 font-medium">{item.product_name}</td>
                      <td className="p-2 text-center font-bold text-slate-900">{item.quantity}</td>
                      <td className="p-2 text-right text-slate-600">${item.unit_price.toLocaleString('es-CL')}</td>
                      <td className="p-2 text-right font-bold text-slate-900">${item.total_price.toLocaleString('es-CL')}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 border-t-2 border-slate-300 font-bold">
                    <td colSpan={4} className="p-2 text-right text-slate-700">
                      Monto Total Imputado a Presupuesto ({delivery.cost_center_id}):
                    </td>
                    <td className="p-2 text-right text-sky-900 text-calibri-title">
                      ${delivery.total_amount.toLocaleString('es-CL')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Observaciones */}
          {delivery.observations && (
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-calibri-normal">
              <span className="text-xs text-slate-500 font-bold block">Observaciones de la Entrega:</span>
              <p className="text-slate-800">{delivery.observations}</p>
            </div>
          )}

          {/* Evidencia Verificable: Firma Digital y Fotografía */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
            {/* Panel de Firma Digital */}
            <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 flex flex-col items-center justify-between">
              <div className="w-full flex items-center justify-between mb-2">
                <span className="text-calibri-title text-slate-800 flex items-center gap-1">
                  <FileText className="w-4 h-4 text-sky-700" /> Firma Digital del Receptor
                </span>
                <span className="text-xs text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                  Verificada
                </span>
              </div>
              <div className="w-full h-32 bg-white rounded border border-slate-300 flex items-center justify-center overflow-hidden p-2">
                {delivery.signature_data ? (
                  <img
                    src={delivery.signature_data}
                    alt="Firma del técnico"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-slate-400">Sin firma registrada</span>
                )}
              </div>
              <div className="w-full text-center mt-2 border-t border-slate-300 pt-1">
                <p className="text-calibri-normal font-bold text-slate-800">{delivery.technician_name}</p>
                <p className="text-xs text-slate-500">RUT: {delivery.technician_rut}</p>
              </div>
            </div>

            {/* Panel de Fotografía de Entrega */}
            <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 flex flex-col items-center justify-between">
              <div className="w-full flex items-center justify-between mb-2">
                <span className="text-calibri-title text-slate-800 flex items-center gap-1">
                  <Camera className="w-4 h-4 text-sky-700" /> Respaldo Fotográfico
                </span>
                <span className="text-xs text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                  Auditado
                </span>
              </div>
              <div className="w-full h-32 bg-slate-900 rounded border border-slate-300 flex items-center justify-center overflow-hidden">
                {delivery.photo_data ? (
                  <img
                    src={delivery.photo_data}
                    alt="Fotografía de entrega"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-slate-400">Sin foto registrada</span>
                )}
              </div>
              <div className="w-full text-center mt-2 border-t border-slate-300 pt-1">
                <p className="text-xs text-slate-500">
                  Evidencia fotográfica en el punto de retiro - Bodega Central
                </p>
              </div>
            </div>
          </div>

          {/* Sello de Auditoría Inmutable */}
          <div className="p-2 bg-slate-100 rounded text-center text-xs text-slate-500 border border-slate-200">
            Documento emitido electrónicamente por el Sistema de Gestión de Bodega e Inventario. Válido para auditoría interna y justificación de costos operacionales.
          </div>
        </div>
      </div>
    </div>
  );
};

