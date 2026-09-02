import React, { useState, useEffect } from 'react';
import { DeliveryRecord } from '../../types';
import { store } from '../../services/store';
import { useAuth } from '../../context/AuthContext';
import { FileText, Eye, Calendar, DollarSign, ShieldCheck, User } from 'lucide-react';
import { DeliveryReceiptModal } from '../reports/DeliveryReceiptModal';

export const MyReceiptsView: React.FC = () => {
  const { currentUser } = useAuth();
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>(() => store.getDeliveries());
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryRecord | null>(null);

  useEffect(() => {
    return store.subscribe(() => {
      setDeliveries(store.getDeliveries());
    });
  }, []);

  // Filtrar si es técnico
  const myDeliveries = deliveries.filter((d) =>
    currentUser.role === 'tecnico' ? d.technician_rut === currentUser.rut : true
  );

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-calibri-title text-slate-900">
            Historial de Actas y Comprobantes de Retiro
          </h1>
          <p className="text-calibri-normal text-slate-600">
            Comprobantes oficiales de entrega firmados digitalmente con fotografía de respaldo.
          </p>
        </div>
        <span className="text-calibri-normal bg-sky-50 text-sky-800 border border-sky-200 px-3 py-1 rounded font-bold">
          {myDeliveries.length} actas registradas
        </span>
      </div>

      {myDeliveries.length === 0 ? (
        <div className="bg-white p-8 text-center rounded-lg border border-slate-300 text-slate-400">
          <FileText className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
          <p className="text-calibri-title text-slate-700">Aún no tienes retiros registrados</p>
          <p className="text-calibri-normal text-slate-500">
            Una vez que retires insumos autorizados en bodega, se generará aquí tu acta verificable.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {myDeliveries.map((del) => (
            <div
              key={del.id}
              className="bg-white rounded-lg border border-slate-300 shadow-sm p-4 hover:border-slate-400 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2">
                  <span className="text-calibri-title text-sky-800 font-mono font-bold">
                    {del.id}
                  </span>
                  <span className="text-xs text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Auditada
                  </span>
                </div>

                <div className="space-y-1 text-calibri-normal text-slate-600 text-xs">
                  <p className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Fecha: <strong className="text-slate-800">{new Date(del.delivered_at).toLocaleString('es-CL')}</strong>
                  </p>
                  <p className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Entregado por: <strong className="text-slate-800">{del.warehouse_staff_name}</strong>
                  </p>
                  <p className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    Centro de Costos: <strong className="text-slate-800">{del.cost_center_id}</strong> (${del.total_amount.toLocaleString('es-CL')})
                  </p>
                </div>

                {/* Previews de firma y foto */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-100">
                  <div className="bg-slate-50 border border-slate-200 rounded p-1 text-center">
                    <span className="text-xs text-slate-400 block mb-0.5">Firma Registrada</span>
                    <div className="h-12 flex items-center justify-center bg-white rounded">
                      <img src={del.signature_data} alt="Firma" className="max-h-10 max-w-full object-contain" />
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded p-1 text-center">
                    <span className="text-xs text-slate-400 block mb-0.5">Foto de Entrega</span>
                    <div className="h-12 flex items-center justify-center bg-slate-900 rounded overflow-hidden">
                      <img src={del.photo_data} alt="Foto" className="max-h-12 max-w-full object-contain" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDelivery(del)}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded text-calibri-normal font-bold transition-colors touch-target"
                >
                  <Eye className="w-4 h-4" /> Ver Acta Completa / Imprimir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Acta Imprimible */}
      <DeliveryReceiptModal
        delivery={selectedDelivery}
        onClose={() => setSelectedDelivery(null)}
      />
    </div>
  );
};

