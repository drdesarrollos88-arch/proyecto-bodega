import React, { useState, useEffect } from 'react';
import { WarehouseRequest, DeliveryRecord, CostCenter } from '../../types';
import { store } from '../../services/store';
import { useAuth } from '../../context/AuthContext';
import { PackageCheck, Clock, CheckCircle2, User, Calendar, DollarSign, PenTool, Camera, Boxes, Bell, Filter, Check } from 'lucide-react';
import { Badge } from '../common/Badge';
import { DeliveryModal } from './DeliveryModal';
import { DeliveryReceiptModal } from '../reports/DeliveryReceiptModal';

export const DeliveryQueueView: React.FC = () => {
  const { currentUser, activeUser } = useAuth();
  const user = activeUser || currentUser || store.getProfiles()[0];

  const [requests, setRequests] = useState<WarehouseRequest[]>(() => store.getRequests());
  const [costCenters, setCostCenters] = useState<CostCenter[]>(() => store.getCostCenters());
  const [selectedCC, setSelectedCC] = useState<string>('TODOS');
  const [activeDeliveryRequest, setActiveDeliveryRequest] = useState<WarehouseRequest | null>(null);
  const [completedVoucher, setCompletedVoucher] = useState<DeliveryRecord | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  useEffect(() => {
    return store.subscribe(() => {
      setRequests(store.getRequests());
      setCostCenters(store.getCostCenters());
    });
  }, []);

  // Solicitudes autorizadas o listas para retiro
  const queueRequests = requests
    .filter((r) => r.status === 'aprobada' || r.status === 'lista_retiro')
    .filter((r) => selectedCC === 'TODOS' || r.cost_center_id === selectedCC);

  const handleMarkReady = (requestId: string) => {
    store.markRequestReadyForPickup(requestId, user.name);
    setNotificationMsg(`¡Aviso emitido con éxito! Se notificó al técnico y al supervisor que el pedido ${requestId} está disponible en mesón de Bodega.`);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const handleDeliveryFinished = (record: DeliveryRecord) => {
    setActiveDeliveryRequest(null);
    setCompletedVoucher(record);
  };

  return (
    <div className="space-y-4">
      {/* Notificación de Aviso Exitoso */}
      {notificationMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-md text-emerald-800 flex items-center gap-2 shadow-sm animate-fade-in">
          <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="text-calibri-title text-xs font-bold">{notificationMsg}</span>
        </div>
      )}

      {/* Cabecera con Filtro de Centro de Costos */}
      <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-calibri-title text-slate-900">
            Cola de Despacho y Entrega en Bodega (Retiro de Materiales)
          </h1>
          <p className="text-calibri-normal text-slate-600">
            Prepara los insumos autorizados y avisa al técnico para su retiro. Toda entrega en mesón requiere firma y foto de entrega.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Selector Filtro por Centro de Costos */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded px-2 py-1">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-bold text-slate-700">Centro de Costos:</span>
            <select
              value={selectedCC}
              onChange={(e) => setSelectedCC(e.target.value)}
              className="text-xs border-0 bg-transparent font-bold text-sky-900 focus:ring-0 cursor-pointer"
            >
              <option value="TODOS">Todos los CC (Total)</option>
              {costCenters.map((cc) => (
                <option key={cc.id} value={cc.id}>
                  {cc.code} - {cc.name}
                </option>
              ))}
            </select>
          </div>

          <span className="text-calibri-normal bg-emerald-50 border border-emerald-300 text-emerald-900 px-3 py-1 rounded font-bold flex items-center gap-1.5 text-xs">
            <Boxes className="w-4 h-4 text-emerald-700" />
            {queueRequests.length} pedidos
          </span>
        </div>
      </div>

      {queueRequests.length === 0 ? (
        <div className="bg-white p-8 text-center rounded-lg border border-slate-300 text-slate-400">
          <PackageCheck className="w-12 h-12 mx-auto mb-2 text-slate-400 opacity-60" />
          <p className="text-calibri-title text-slate-700">No hay pedidos pendientes de entrega para el filtro seleccionado</p>
          <p className="text-calibri-normal text-slate-500">
            Los pedidos autorizados por el supervisor aparecerán aquí para ser preparados y despachados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {queueRequests.map((req) => {
            const totalItemsCount = req.items.reduce((s, i) => s + i.quantity, 0);
            const isReadyForPickup = req.status === 'lista_retiro';

            return (
              <div
                key={req.id}
                className={`bg-white rounded-lg border-2 shadow-sm p-4 flex flex-col justify-between transition-all ${
                  isReadyForPickup
                    ? 'border-emerald-500 bg-emerald-50/20'
                    : 'border-amber-400 bg-amber-50/10'
                }`}
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

                    {isReadyForPickup ? (
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-700" />
                        Listo en Mesón (Avisado)
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-700" />
                        Pendiente de Preparación
                      </span>
                    )}
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
                    {isReadyForPickup && req.prepared_by_name && (
                      <p className="text-xs text-emerald-800 font-medium bg-emerald-100/60 px-2 py-1 rounded border border-emerald-200">
                        🔔 Avisado para retiro por <strong>{req.prepared_by_name}</strong>
                        {req.ready_for_pickup_at && (
                          <span> a las {new Date(req.ready_for_pickup_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        )}
                      </p>
                    )}
                    <p className="text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-200 mt-1">
                      <strong>Motivo:</strong> {req.reason}
                    </p>
                  </div>

                  {/* Si el supervisor tomó foto de producto dañado en terreno */}
                  {req.damaged_photo_data && (
                    <div className="mb-2.5 p-2 bg-amber-50 border border-amber-300 rounded flex items-center gap-2">
                      <div className="w-12 h-12 bg-slate-900 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                        <img src={req.damaged_photo_data} alt="Dañado" className="max-h-full max-w-full object-contain" />
                      </div>
                      <div className="text-xs text-amber-900">
                        <strong className="block text-amber-950 font-bold">✓ Producto Dañado Auditado en Terreno</strong>
                        Foto tomada por el supervisor en faena. Se recibe artículo viejo en mesón.
                      </div>
                    </div>
                  )}

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

                {/* Acciones de Bodega: Avisar Retiro o Despachar */}
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  {!isReadyForPickup ? (
                    <button
                      type="button"
                      onClick={() => handleMarkReady(req.id)}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-sky-700 hover:bg-sky-800 text-white rounded text-calibri-title font-bold shadow transition-colors touch-target"
                    >
                      <Bell className="w-4 h-4 text-sky-200 animate-pulse" />
                      📦 Preparar Insumos y Avisar para Retiro
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveDeliveryRequest(req)}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-calibri-title font-bold shadow-md transition-colors touch-target"
                    >
                      <PackageCheck className="w-5 h-5 text-emerald-200" />
                      Despachar en Ventanilla (Firma y Foto)
                    </button>
                  )}

                  <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <PenTool className="w-3 h-3" /> Firma digital en mesón
                    </span>
                    <span className="flex items-center gap-1">
                      <Camera className="w-3 h-3" /> Foto de entrega
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

