import React from 'react';
import { DeliveryRecord } from '../../types';
import { X, Printer, ShieldCheck, CheckCircle, Calendar, User, FileText, Camera } from 'lucide-react';

interface DeliveryReceiptModalProps {
  delivery: DeliveryRecord | null;
  onClose: () => void;
}

export const DeliveryReceiptModal: React.FC<DeliveryReceiptModalProps> = ({ delivery, onClose }) => {
  if (!delivery) return null;

  // Cerrar modal con tecla Escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-3xl border border-slate-300 overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra Superior con Controles Sticky (Siempre visible arriba para cerrar) */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-2.5 bg-slate-800 text-white shadow no-print">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-calibri-title text-white">
              Acta Oficial de Entrega de Bodega ({delivery.id})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-700 hover:bg-sky-600 text-white rounded text-xs font-bold transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" /> Imprimir / PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded text-xs font-bold shadow transition-colors touch-target"
              title="Cerrar ventana (Esc)"
            >
              <X className="w-4 h-4" /> Cerrar (Esc)
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

          {/* Control de Reposición y Estado de Devolución del Artículo Anterior */}
          <div className="p-3 rounded border text-calibri-normal text-xs space-y-2 bg-slate-50 border-slate-200">
            <span className="text-slate-500 font-bold block uppercase text-[11px]">
              Trazabilidad y Estado de Reposición (Artículo Anterior):
            </span>
            {delivery.return_status === 'devuelto_danado' && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-amber-50 border border-amber-300 rounded text-amber-950">
                <div>
                  <span className="font-bold flex items-center gap-1.5 text-xs text-amber-900">
                    <span>🛠️</span> Producto Anterior Devuelto Dañado / Deteriorado
                  </span>
                  <p className="text-xs text-amber-800 mt-0.5">
                    El técnico hizo entrega física del insumo en mal estado. Se da de baja conforme a protocolo interno.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold text-xs whitespace-nowrap">
                  Devolución Física Conforme
                </span>
              </div>
            )}

            {delivery.return_status === 'extraviado' && (
              <div className="p-2.5 bg-rose-50 border border-rose-300 rounded text-rose-950 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5 text-xs text-rose-900">
                    <span>⚠️</span> Producto Anterior Declarado EXTRAVIADO en Faena
                  </span>
                  <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-900 font-bold text-xs">
                    Sin Devolución Física
                  </span>
                </div>
                <p className="text-xs text-rose-800">
                  <strong>Circunstancia del Extravío:</strong> {delivery.loss_reason || 'Extraviado en terreno durante faena'}
                </p>
                <p className="text-[11px] text-slate-500 italic">
                  * Por tratarse de pérdida o extravío en terreno, no se registra fotografía física de devolución.
                </p>
              </div>
            )}

            {(!delivery.return_status || delivery.return_status === 'sin_retorno_nuevo') && (
              <div className="p-2 bg-sky-50 border border-sky-200 rounded text-sky-900">
                <span className="font-bold text-xs">✨ Asignación de Insumo Nuevo / Sin Reemplazo Previo</span>
                <p className="text-[11px] text-sky-800 mt-0.5">
                  Corresponde a primera asignación o insumo fungible directo sin producto a dar de baja.
                </p>
              </div>
            )}
          </div>

          {/* Observaciones */}
          {delivery.observations && (
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-calibri-normal">
              <span className="text-xs text-slate-500 font-bold block">Observaciones de la Entrega:</span>
              <p className="text-slate-800">{delivery.observations}</p>
            </div>
          )}

          {/* Evidencia Verificable: Firma Digital, Foto de Entrega y Foto de Daño */}
          <div className={`grid grid-cols-1 ${delivery.damaged_photo_data ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3 pt-2 border-t border-slate-200`}>
            {/* Panel de Firma Digital */}
            <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 flex flex-col items-center justify-between">
              <div className="w-full flex items-center justify-between mb-2">
                <span className="text-calibri-title text-slate-800 flex items-center gap-1">
                  <FileText className="w-4 h-4 text-sky-700" /> Firma Digital
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
                <p className="text-calibri-normal font-bold text-slate-800 truncate">{delivery.technician_name}</p>
                <p className="text-xs text-slate-500">RUT: {delivery.technician_rut}</p>
              </div>
            </div>

            {/* Panel de Fotografía de Entrega */}
            <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 flex flex-col items-center justify-between">
              <div className="w-full flex items-center justify-between mb-2">
                <span className="text-calibri-title text-slate-800 flex items-center gap-1">
                  <Camera className="w-4 h-4 text-sky-700" /> Entrega de Insumos
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
                  Punto de retiro - Bodega Central
                </p>
              </div>
            </div>

            {/* Panel de Fotografía del Producto Dañado (Baja) */}
            {delivery.damaged_photo_data && (
              <div className="border border-amber-300 rounded-lg p-3 bg-amber-50/70 flex flex-col items-center justify-between">
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="text-calibri-title text-amber-950 flex items-center gap-1">
                    <Camera className="w-4 h-4 text-amber-700" /> Producto Dañado
                  </span>
                  <span className="text-xs text-amber-900 font-bold bg-amber-200 px-2 py-0.5 rounded border border-amber-300">
                    Baja Física
                  </span>
                </div>
                <div className="w-full h-32 bg-slate-900 rounded border border-amber-300 flex items-center justify-center overflow-hidden">
                  <img
                    src={delivery.damaged_photo_data}
                    alt="Producto dañado recibido"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="w-full text-center mt-2 border-t border-amber-300 pt-1">
                  <p className="text-xs text-amber-800">
                    Evidencia de deterioro para baja
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sello de Auditoría Inmutable */}
          <div className="p-2 bg-slate-100 rounded text-center text-xs text-slate-500 border border-slate-200">
            Documento emitido electrónicamente por el Sistema de Gestión de Bodega e Inventario. Válido para auditoría interna y justificación de costos operacionales.
          </div>
        </div>

        {/* Barra Inferior Fija para Cerrar (No imprimible) */}
        <div className="p-3.5 bg-slate-100 border-t border-slate-300 flex flex-wrap items-center justify-between gap-2.5 no-print">
          <span className="text-xs text-slate-600 font-medium">
            Folio Auditado: <strong className="text-sky-900 font-mono">{delivery.id}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors touch-target"
            >
              <Printer className="w-4 h-4 text-sky-700" /> Imprimir Documento
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors touch-target"
            >
              <CheckCircle className="w-4 h-4" /> Cerrar y Volver a la Bandeja
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

