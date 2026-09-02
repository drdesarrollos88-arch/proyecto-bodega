import React, { useState, useEffect } from 'react';
import { WarehouseRequest } from '../../types';
import { store } from '../../services/store';
import { useAuth } from '../../context/AuthContext';
import { Clock, CheckCircle2, XCircle, PackageCheck, AlertCircle, Calendar, Hash } from 'lucide-react';
import { Badge } from '../common/Badge';

interface RequestHistoryViewProps {
  onGoToPickup?: (requestId: string) => void;
}

export const RequestHistoryView: React.FC<RequestHistoryViewProps> = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<WarehouseRequest[]>(() => store.getRequests());
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  useEffect(() => {
    return store.subscribe(() => {
      setRequests(store.getRequests());
    });
  }, []);

  // Filtrar solicitudes del técnico activo o todas si se desea supervisar
  const technicianRequests = requests.filter((r) =>
    currentUser.role === 'tecnico' ? r.technician_id === currentUser.id : true
  );

  const filteredRequests = technicianRequests.filter((r) => {
    if (statusFilter === 'todos') return true;
    return r.status === statusFilter;
  });

  const getStatusBadge = (status: WarehouseRequest['status']) => {
    switch (status) {
      case 'pendiente':
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-700" /> Pendiente de Autorización
          </Badge>
        );
      case 'aprobada':
        return (
          <Badge variant="info" className="flex items-center gap-1 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-700" /> Autorizada - Lista para Retiro en Bodega
          </Badge>
        );
      case 'entregada':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <PackageCheck className="w-3.5 h-3.5 text-emerald-700" /> Retirada y Entregada
          </Badge>
        );
      case 'rechazada':
        return (
          <Badge variant="danger" className="flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-rose-700" /> Rechazada
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Cabecera */}
      <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-calibri-title text-slate-900">
            Seguimiento y Estado de Solicitudes de Pedido
          </h1>
          <p className="text-calibri-normal text-slate-600">
            Revisa el estado de autorización de tu supervisor y la disponibilidad para retiro en bodega.
          </p>
        </div>

        {/* Filtros de Estado */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {[
            { id: 'todos', label: 'Todas' },
            { id: 'pendiente', label: 'Pendientes' },
            { id: 'aprobada', label: 'Autorizadas (Retiro)' },
            { id: 'entregada', label: 'Entregadas' },
            { id: 'rechazada', label: 'Rechazadas' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-2.5 py-1 rounded text-calibri-normal border transition-colors whitespace-nowrap ${
                statusFilter === f.id
                  ? 'bg-sky-700 text-white font-bold border-sky-800'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Solicitudes */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white p-8 text-center rounded-lg border border-slate-300 text-slate-400">
          <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50 text-slate-400" />
          <p className="text-calibri-title text-slate-700">No hay solicitudes en este estado</p>
          <p className="text-calibri-normal text-slate-500">
            Crea una nueva solicitud desde la pestaña "Pedir Insumos".
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((req) => {
            const totalItemsCount = req.items.reduce((s, i) => s + i.quantity, 0);
            const totalCost = req.items.reduce((s, i) => s + i.total_price, 0);

            return (
              <div
                key={req.id}
                className="bg-white rounded-lg border border-slate-300 shadow-sm p-4 hover:border-slate-400 transition-colors"
              >
                {/* Encabezado de la Tarjeta */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="text-calibri-title text-sky-900 font-mono font-bold">
                      {req.id}
                    </span>
                    {req.priority === 'Urgente' && (
                      <Badge variant="danger" className="text-xs font-bold">
                        URGENTE FAENA
                      </Badge>
                    )}
                    <span className="text-calibri-normal text-slate-500 text-xs flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(req.created_at).toLocaleString('es-CL')}
                    </span>
                  </div>

                  <div>{getStatusBadge(req.status)}</div>
                </div>

                {/* Datos de Faena y Justificación */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 py-2.5 text-calibri-normal">
                  <div>
                    <span className="text-slate-500 block text-xs">Centro de Costos:</span>
                    <strong className="text-slate-800">{req.cost_center_id}</strong>
                    {req.work_order && (
                      <span className="text-slate-600 block text-xs">
                        OT: <strong className="text-slate-800">{req.work_order}</strong>
                      </span>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <span className="text-slate-500 block text-xs">Motivo de Retiro:</span>
                    <p className="text-slate-800 bg-slate-50 p-1.5 rounded border border-slate-200">
                      {req.reason}
                    </p>
                  </div>
                </div>

                {/* Lista de Insumos Solicitados */}
                <div className="mt-2 bg-slate-50 rounded border border-slate-200 p-2.5">
                  <div className="flex items-center justify-between mb-1.5 text-xs text-slate-500 font-bold border-b border-slate-200 pb-1">
                    <span>Artículos Solicitados ({totalItemsCount} unidades)</span>
                    <span>Subtotal Estimado: ${totalCost.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {req.items.map((it) => (
                      <div
                        key={it.id}
                        className="bg-white p-2 rounded border border-slate-200 flex items-center justify-between text-calibri-normal"
                      >
                        <div className="min-w-0 pr-2">
                          <span className="text-xs font-mono font-bold text-sky-800 block">
                            {it.product_sku}
                          </span>
                          <span className="text-slate-800 font-medium truncate block">
                            {it.product_name}
                          </span>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="bg-sky-100 text-sky-900 font-bold px-2 py-0.5 rounded text-xs">
                            Cant: {it.quantity}
                          </span>
                          <span className="text-slate-500 block text-xs mt-0.5">
                            ${it.total_price.toLocaleString('es-CL')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notas de Supervisor o Bodega */}
                {req.supervisor_notes && (
                  <div className="mt-2.5 p-2 bg-sky-50 border border-sky-200 rounded text-calibri-normal text-sky-900 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-sky-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Observaciones de Aprobación ({req.supervisor_name}):</span>{' '}
                      {req.supervisor_notes}
                    </div>
                  </div>
                )}

                {/* Banner de aviso para retirar en bodega */}
                {req.status === 'aprobada' && (
                  <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-300 rounded flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-emerald-900">
                      <PackageCheck className="w-5 h-5 text-emerald-700 flex-shrink-0" />
                      <span className="text-calibri-normal font-semibold">
                        Este pedido está autorizado. Puedes acudir a la Bodega Principal a retirar los insumos. Se registrará tu firma digital y fotografía de entrega.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

