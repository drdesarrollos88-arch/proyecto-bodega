import React, { useState, useEffect } from 'react';
import { WarehouseRequest, Product, CostCenter } from '../../types';
import { store } from '../../services/store';
import { useAuth } from '../../context/AuthContext';
import { 
  ClipboardCheck, 
  Check, 
  X, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  DollarSign, 
  AlertCircle, 
  Boxes 
} from 'lucide-react';
import { Badge } from '../common/Badge';

export const PendingApprovalsView: React.FC = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<WarehouseRequest[]>(() => store.getRequests());
  const [products, setProducts] = useState<Product[]>(() => store.getProducts());
  const [costCenters, setCostCenters] = useState<CostCenter[]>(() => store.getCostCenters());

  // Modal o caja de confirmación para acción
  const [actionModal, setActionModal] = useState<{
    request: WarehouseRequest;
    type: 'approve' | 'reject';
  } | null>(null);
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    return store.subscribe(() => {
      setRequests(store.getRequests());
      setProducts(store.getProducts());
      setCostCenters(store.getCostCenters());
    });
  }, []);

  const pendingRequests = requests.filter((r) => r.status === 'pendiente');

  const handleConfirmAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionModal) return;

    if (actionModal.type === 'reject' && !notes.trim()) {
      alert('Debes indicar una observación o motivo para rechazar la solicitud.');
      return;
    }

    const newStatus = actionModal.type === 'approve' ? 'aprobada' : 'rechazada';

    store.updateRequestStatus(
      actionModal.request.id,
      newStatus,
      currentUser.id,
      currentUser.name,
      notes.trim() || undefined
    );

    setFeedback(
      actionModal.type === 'approve'
        ? `Solicitud ${actionModal.request.id} autorizada con éxito. Pasó a la cola de despacho de Bodega.`
        : `Solicitud ${actionModal.request.id} fue rechazada con observaciones.`
    );

    setActionModal(null);
    setNotes('');

    setTimeout(() => {
      setFeedback(null);
    }, 2500);
  };

  return (
    <div className="space-y-4">
      {/* Mensaje de Confirmación */}
      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-md text-emerald-800 flex items-center gap-2 shadow-sm animate-fade-in">
          <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="text-calibri-title">{feedback}</span>
        </div>
      )}

      {/* Cabecera */}
      <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-calibri-title text-slate-900">
            Bandeja de Autorización de Solicitudes (Supervisor)
          </h1>
          <p className="text-calibri-normal text-slate-600">
            Verifica la existencia real en bodega y aprueba los requerimientos de insumos de tu cuadrilla de terreno.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-calibri-normal bg-amber-50 border border-amber-300 text-amber-900 px-3 py-1 rounded font-bold flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-700" />
            {pendingRequests.length} solicitudes pendientes
          </span>
        </div>
      </div>

      {pendingRequests.length === 0 ? (
        <div className="bg-white p-8 text-center rounded-lg border border-slate-300 text-slate-400">
          <ClipboardCheck className="w-12 h-12 mx-auto mb-2 text-emerald-600 opacity-60" />
          <p className="text-calibri-title text-slate-800">No hay solicitudes pendientes de revisión</p>
          <p className="text-calibri-normal text-slate-500">
            Todas las solicitudes de terreno han sido atendidas o no hay pedidos nuevos.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingRequests.map((req) => {
            const cc = costCenters.find((c) => c.id === req.cost_center_id);
            const totalEstimatedCost = req.items.reduce((s, i) => s + i.total_price, 0);

            // Validar stock de cada ítem
            const itemsWithStock = req.items.map((item) => {
              const product = products.find((p) => p.id === item.product_id || p.sku === item.product_sku);
              const currentStock = product ? product.current_stock : 0;
              const hasEnoughStock = currentStock >= item.quantity;
              return {
                ...item,
                currentStock,
                hasEnoughStock,
                unit: product?.unit || 'unidad',
              };
            });

            const hasAnyStockIssue = itemsWithStock.some((it) => !it.hasEnoughStock);

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
                        PRIORIDAD URGENTE
                      </Badge>
                    )}
                    <span className="text-calibri-normal text-slate-500 text-xs flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(req.created_at).toLocaleString('es-CL')}
                    </span>
                  </div>

                  <div className="text-calibri-normal text-slate-600 text-xs">
                    Técnico: <strong className="text-slate-800">{req.technician_name}</strong> ({req.technician_rut})
                  </div>
                </div>

                {/* Justificación y Centro de Costos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 py-2.5 text-calibri-normal">
                  <div>
                    <span className="text-xs text-slate-500 block font-bold">Centro de Costos:</span>
                    <p className="text-slate-800 font-semibold">{req.cost_center_id} - {cc?.name || 'N/A'}</p>
                    {req.work_order && (
                      <p className="text-xs text-slate-600 mt-0.5">
                        Orden Trabajo: <strong className="text-slate-800">{req.work_order}</strong>
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <span className="text-xs text-slate-500 block font-bold">Motivo Justificado de Retiro:</span>
                    <p className="text-slate-800 bg-slate-50 p-1.5 rounded border border-slate-200">
                      {req.reason}
                    </p>
                  </div>
                </div>

                {/* Tabla de Verificación de Stock en Tiempo Real */}
                <div className="mt-2 border border-slate-300 rounded overflow-hidden">
                  <table className="w-full text-left text-calibri-normal">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 text-xs font-bold border-b border-slate-300">
                        <th className="p-2">SKU</th>
                        <th className="p-2">Artículo Solicitado</th>
                        <th className="p-2 text-center">Cant. Requerida</th>
                        <th className="p-2 text-center">Stock Bodega</th>
                        <th className="p-2 text-center">Disponibilidad</th>
                        <th className="p-2 text-right">Costo Estimado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {itemsWithStock.map((it) => (
                        <tr key={it.id} className={!it.hasEnoughStock ? 'bg-rose-50/60' : 'hover:bg-slate-50'}>
                          <td className="p-2 font-mono text-xs font-bold text-sky-800">{it.product_sku}</td>
                          <td className="p-2 text-slate-800 font-medium">{it.product_name}</td>
                          <td className="p-2 text-center font-bold text-slate-900">{it.quantity}</td>
                          <td className="p-2 text-center font-semibold text-slate-700">
                            {it.currentStock} {it.unit}
                          </td>
                          <td className="p-2 text-center">
                            {it.hasEnoughStock ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                                <Check className="w-3 h-3" /> Hay Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-200">
                                <AlertTriangle className="w-3 h-3" /> Sin Stock Suficiente
                              </span>
                            )}
                          </td>
                          <td className="p-2 text-right text-slate-800 font-semibold">
                            ${it.total_price.toLocaleString('es-CL')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 border-t border-slate-300 font-bold text-xs">
                        <td colSpan={5} className="p-2 text-right text-slate-600">
                          Total Imputable a Presupuesto ({req.cost_center_id}):
                        </td>
                        <td className="p-2 text-right text-sky-900 text-calibri-title">
                          ${totalEstimatedCost.toLocaleString('es-CL')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {hasAnyStockIssue && (
                  <div className="mt-2.5 p-2 bg-amber-50 border border-amber-300 rounded text-calibri-normal text-amber-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>
                      <strong>Atención:</strong> Uno o más artículos tienen stock insuficiente en bodega. Puedes autorizarlo condicionalmente o solicitar reabastecimiento antes.
                    </span>
                  </div>
                )}

                {/* Acciones de Decisión */}
                <div className="mt-3 pt-2.5 border-t border-slate-200 flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActionModal({ request: req, type: 'reject' });
                      setNotes('');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-calibri-normal font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded border border-rose-300 transition-colors touch-target"
                  >
                    <X className="w-4 h-4" /> Rechazar Solicitud
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActionModal({ request: req, type: 'approve' });
                      setNotes('Autorizado conforme a disponibilidad de faena.');
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-calibri-normal font-bold text-white bg-sky-700 hover:bg-sky-800 rounded shadow-sm transition-colors touch-target"
                  >
                    <Check className="w-4 h-4" /> Autorizar Retiro en Bodega
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Confirmación con Notas */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md border border-slate-300 overflow-hidden">
            <div
              className={`p-3 text-white flex items-center justify-between ${
                actionModal.type === 'approve' ? 'bg-sky-800' : 'bg-rose-800'
              }`}
            >
              <h2 className="text-calibri-title text-white flex items-center gap-2">
                {actionModal.type === 'approve' ? (
                  <>
                    <Check className="w-5 h-5 text-emerald-400" /> Autorizar Solicitud {actionModal.request.id}
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5 text-rose-300" /> Rechazar Solicitud {actionModal.request.id}
                  </>
                )}
              </h2>
              <button
                onClick={() => setActionModal(null)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmAction} className="p-4 space-y-3">
              <p className="text-calibri-normal text-slate-700">
                {actionModal.type === 'approve'
                  ? 'Al autorizar, este pedido pasará de inmediato a la lista de retiro del personal de bodega. El técnico podrá acudir a retirar.'
                  : 'Al rechazar, el técnico verá la justificación ingresada y el pedido no podrá ser despachado.'}
              </p>

              <div>
                <label className="block text-calibri-normal font-bold text-slate-700 mb-1">
                  {actionModal.type === 'approve'
                    ? 'Observación / Instrucción para bodega (Opcional):'
                    : 'Motivo del Rechazo (Obligatorio): *'}
                </label>
                <textarea
                  required={actionModal.type === 'reject'}
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    actionModal.type === 'approve'
                      ? 'Ej: Autorizado para turno 08:00 - 18:00 hrs...'
                      : 'Ej: No corresponde a la faena actual / Solicitar artículo alternativo...'
                  }
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-calibri-normal text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-calibri-normal text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-4 py-1.5 rounded text-white text-calibri-normal font-bold shadow-sm ${
                    actionModal.type === 'approve'
                      ? 'bg-sky-700 hover:bg-sky-800'
                      : 'bg-rose-700 hover:bg-rose-800'
                  }`}
                >
                  {actionModal.type === 'approve' ? 'Confirmar Autorización' : 'Confirmar Rechazo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

