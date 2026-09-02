import React, { useState, useEffect } from 'react';
import { WarehouseRequest, DeliveryRecord } from '../../types';
import { store } from '../../services/store';
import { PackageCheck, Clock, CheckCircle2, User, Calendar, DollarSign, PenTool, Camera, Boxes } from 'lucide-react';
import { Badge } from '../common/Badge';
import { DeliveryModal } from './DeliveryModal';
import { DeliveryReceiptModal } from '../reports/DeliveryReceiptModal';

export const DeliveryQueueView: React.FC = () => {
  const [requests, setRequests] = useState<WarehouseRequest[]>(() => store.getRequests());
  const [activeDeliveryRequest, setActiveDeliveryRequest] = useState<WarehouseRequest | null>(null);
  const [completedVoucher, setCompletedVoucher] = useState<DeliveryRecord | null>(null);

  useEffect(() => {
    return store.subscribe(() => {
      setRequests(store.getRequests());
    });
  }, []);

  // Solicitudes autorizadas por supervisor listas para retiro
  const approvedRequests = requests.filter((r) => r.status === 'aprobada');

  const handleDeliveryFinished = (record: DeliveryRecord) => {
    setActiveDeliveryRequest(null);
    setCompletedVoucher(record);
  };

  return (
    <div className="space-y-4">
      {/* Cabecera */}
      <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-calibri-title text-slate-900">
            Cola de Despacho y Entrega en Bodega (Retiro de Materiales)
          </h1>
          <p className="text-calibri-normal text-slate-600">
            Pedidos autorizados por el supervisor listos para ser entregados. Toda entrega requiere firma digital y fotografía de respaldo.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-calibri-normal bg-emerald-50 border border-emerald-300 text-emerald-900 px-3 py-1 rounded font-bold flex items-center gap-1.5">
            <Boxes className="w-4 h-4 text-emerald-700" />
            {approvedRequests.length} pedidos listos para entrega
          </span>
        </div>
      </div>

      {approvedRequests.length === 0 ? (
        <div className="bg-white p-8 text-center rounded-lg border border-slate-300 text-slate-400">
          <PackageCheck className="w-12 h-12 mx-auto mb-2 text-slate-400 opacity-60" />
          <p className="text-calibri-title text-slate-700">No hay pedidos pendientes de entrega en bodega</p>
          <p className="text-calibri-normal text-slate-500">
            Todos los pedidos autorizados han sido despachados o están pendientes de revisión del supervisor.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {approvedRequests.map((req) => {
            const totalItemsCount = req.items.reduce((s, i) => s + i.quantity, 0);
            const totalCost = req.items.reduce((s, i) => s + i.total_price, 0);

            return (
              <div
                key={req.id}
                className="bg-white rounded-lg border-2 border-sky-600/40 shadow-sm p-4 flex flex-col justify-between hover:border-sky-600 transition-all"
              >
                <div>
                  {/* Encabezado */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-calibri-title text-sky-900 font-mono font-bold">
                        {req.id}
                      </span>
                      {req.priority === 'Urgente' && (
                        <Badge variant="danger" className="text-xs font-bold">
                          URGENTE FAENA
                        </Badge>
                      )}
                    </div>
                    <Badge variant="info">Listo para Retiro</Badge>
                  </div>

                  {/* Datos del Técnico y Supervisor */}
                  <div className="space-y-1 text-calibri-normal text-slate-700 text-xs mb-3">
                    <p className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Técnico Receptor: <strong className="text-slate-900">{req.technician_name}</strong> ({req.technician_rut})
                    </p>
                    <p className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Autorizado por: <strong className="text-slate-800">{req.supervisor_name}</strong>
                    </p>
                    <p className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                      Centro de Costos: <strong className="text-slate-800">{req.cost_center_id}</strong>
                      {req.work_order && <span> | OT: {req.work_order}</span>}
                    </p>
                    <p className="text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-200 mt-1">
                      <strong>Motivo:</strong> {req.reason}
                    </p>
                  </div>

                  {/* Lista de Insumos */}
                  <div className="bg-slate-50 rounded border border-slate-200 p-2 text-calibri-normal mb-3">
                    <span className="text-xs font-bold text-slate-500 block mb-1">
                      Insumos a Despachar ({totalItemsCount} unidades):
                    </span>
                    <ul className="space-y-1 text-xs">
                      {req.items.map((it) => (
                        <li key={it.id} className="flex items-center justify-between text-slate-800">
                          <span>
                            <strong className="font-mono text-sky-800">{it.product_sku}</strong> - {it.product_name}
                          </span>
                          <span className="font-bold bg-white px-1.5 py-0.5 rounded border border-slate-300">
                            Cant: {it.quantity}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Botón Principal de Proceso de Entrega */}
                <div className="pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveDeliveryRequest(req)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-calibri-title font-bold shadow-md transition-colors touch-target"
                  >
                    <PackageCheck className="w-5 h-5 text-emerald-200" />
                    Iniciar Entrega con Firma y Fotografía
                  </button>
                  <div className="flex items-center justify-center gap-4 text-xs text-slate-400 mt-1.5">
                    <span className="flex items-center gap-1">
                      <PenTool className="w-3 h-3" /> Firma requerida
                    </span>
                    <span className="flex items-center gap-1">
                      <Camera className="w-3 h-3" /> Foto requerida
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Captura de Entrega (Firma + Cámara) */}
      <DeliveryModal
        request={activeDeliveryRequest}
        onClose={() => setActiveDeliveryRequest(null)}
        onDeliveryCompleted={handleDeliveryFinished}
      />

      {/* Modal de Comprobante / Acta Generada Inmediata */}
      <DeliveryReceiptModal
        delivery={completedVoucher}
        onClose={() => setCompletedVoucher(null)}
      />
    </div>
  );
};
