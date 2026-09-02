import React, { useState, useEffect } from 'react';
import { WarehouseRequest, CostCenter } from '../../types';
import { store } from '../../services/store';
import { useAuth } from '../../context/AuthContext';
import { 
  ClipboardCheck, 
  Check, 
  X, 
  Clock, 
  User, 
  Boxes, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck 
} from 'lucide-react';
import { Badge } from '../common/Badge';

export const SectionApprovalsView: React.FC = () => {
  const { currentUser, activeUser } = useAuth();
  const user = activeUser || currentUser || store.getProfiles()[0];

  const [requests, setRequests] = useState<WarehouseRequest[]>(() => store.getRequests());
  const [costCenters, setCostCenters] = useState<CostCenter[]>(() => store.getCostCenters());
  const [feedback, setFeedback] = useState<string | null>(null);
  const [rejectModalReq, setRejectModalReq] = useState<WarehouseRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    return store.subscribe(() => {
      setRequests(store.getRequests());
      setCostCenters(store.getCostCenters());
    });
  }, []);

  // Solicitudes dirigidas al Jefe de Sección (Supervisor, Bodeguero o auto-pedidos pendientes)
  const staffPendingRequests = requests.filter(
    (r) =>
      r.status === 'pendiente' &&
      (r.approver_role === 'jefe_seccion' ||
        r.requested_by_role === 'supervisor' ||
        r.requested_by_role === 'bodeguero_admin' ||
        r.requested_by_role === 'jefe_seccion')
  );

  const handleApprove = (req: WarehouseRequest) => {
    store.updateRequestStatus(
      req.id,
      'aprobada',
      user.id,
      user.name,
      `Autorizado por Jefe de Sección (${user.name})`
    );
    setFeedback(`¡Solicitud ${req.id} de ${req.technician_name} autorizada! Pasó a la cola de despacho de bodega.`);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalReq) return;

    store.updateRequestStatus(
      rejectModalReq.id,
      'rechazada',
      user.id,
      user.name,
      rejectReason.trim() || 'Rechazado por Jefatura de Sección'
    );

    setFeedback(`Solicitud ${rejectModalReq.id} rechazada.`);
    setRejectModalReq(null);
    setRejectReason('');
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="space-y-4">
      {/* Toast de Feedback */}
      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-md text-emerald-800 flex items-center gap-2 shadow-sm animate-fade-in text-calibri-title text-xs font-bold">
          <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Cabecera */}
      <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-calibri-title text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-purple-700" />
            Autorizaciones de Solicitudes de Staff y Supervisión
          </h1>
          <p className="text-calibri-normal text-slate-600">
            Bandeja exclusiva del Jefe de Sección para autorizar los requerimientos de materiales de supervisores y personal de bodega.
          </p>
        </div>
        <span className="text-calibri-normal bg-purple-50 border border-purple-300 text-purple-900 px-3 py-1.5 rounded font-bold flex items-center gap-1.5 text-xs">
          <Clock className="w-4 h-4 text-purple-700" />
          {staffPendingRequests.length} solicitudes pendientes
        </span>
      </div>

      {staffPendingRequests.length === 0 ? (
        <div className="bg-white p-8 text-center rounded-lg border border-slate-300 text-slate-400">
          <ShieldCheck className="w-12 h-12 mx-auto mb-2 text-purple-600 opacity-60" />
          <p className="text-calibri-title text-slate-800">No hay solicitudes de staff pendientes de tu autorización</p>
          <p className="text-calibri-normal text-slate-500">
            Cuando un supervisor o personal administrativo solicite insumos para sus labores, aparecerán aquí para tu aprobación.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {staffPendingRequests.map((req) => {
            const totalItemsCount = req.items.reduce((s, i) => s + i.quantity, 0);
            const totalCost = req.items.reduce((s, i) => s + i.total_price, 0);

            return (
              <div
                key={req.id}
                className="bg-white rounded-lg border-2 border-purple-300 shadow-sm p-4 flex flex-col justify-between hover:border-purple-500 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-calibri-title text-purple-900 font-mono font-bold">
                        {req.id}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-100 text-purple-800 border border-purple-200">
                        {req.requested_by_role || 'Staff'}
                      </span>
                    </div>
                    <Badge variant="warning">Pendiente Jefatura</Badge>
                  </div>

                  <div className="space-y-1 text-calibri-normal text-slate-700 text-xs mb-3">
                    <p className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Solicitante: <strong className="text-slate-900">{req.technician_name}</strong> ({req.technician_rut})
                    </p>
                    <p className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                      Centro de Costos: <strong className="text-slate-800">{req.cost_center_id}</strong>
                    </p>
                    <p className="text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-200 mt-1">
                      <strong>Motivo:</strong> {req.reason}
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded border border-slate-200 p-2 text-calibri-normal mb-3">
                    <span className="text-xs font-bold text-slate-500 block mb-1">
                      Insumos Solicitados ({totalItemsCount} unidades • ${totalCost.toLocaleString('es-CL')} CLP):
                    </span>
                    <ul className="space-y-1 text-xs">
                      {req.items.map((it) => (
                        <li key={it.id} className="flex items-center justify-between text-slate-800">
                          <span>
                            <strong className="font-mono text-purple-800">{it.product_sku}</strong> - {it.product_name}
                          </span>
                          <span className="font-bold bg-white px-1.5 py-0.5 rounded border border-slate-300">
                            Cant: {it.quantity}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRejectModalReq(req);
                      setRejectReason('');
                    }}
                    className="px-3 py-1.5 border border-slate-300 rounded text-xs text-rose-700 hover:bg-rose-50 font-bold transition-colors"
                  >
                    Rechazar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(req)}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded text-xs font-bold shadow transition-colors touch-target"
                  >
                    <Check className="w-4 h-4" />
                    Autorizar Solicitud de Staff
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Rechazo */}
      {rejectModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md border border-slate-300 overflow-hidden">
            <div className="p-3 bg-rose-700 text-white flex items-center justify-between">
              <h2 className="text-calibri-title text-white">Rechazar Solicitud {rejectModalReq.id}</h2>
              <button onClick={() => setRejectModalReq(null)} className="text-white/80 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleConfirmReject} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Motivo de Rechazo: *
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Indica la razón por la cual no se autoriza esta solicitud..."
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-calibri-normal text-xs"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setRejectModalReq(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded text-xs shadow-sm"
                >
                  Confirmar Rechazo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

