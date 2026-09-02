import React, { useState, useEffect } from 'react';
import { CostCenter, WarehouseRequest } from '../../types';
import { store } from '../../services/store';
import { useAuth } from '../../context/AuthContext';
import { DollarSign, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';

export const SupervisorBudgetView: React.FC = () => {
  const { currentUser } = useAuth();
  const [costCenters, setCostCenters] = useState<CostCenter[]>(() => store.getCostCenters());
  const [requests, setRequests] = useState<WarehouseRequest[]>(() => store.getRequests());

  useEffect(() => {
    return store.subscribe(() => {
      setCostCenters(store.getCostCenters());
      setRequests(store.getRequests());
    });
  }, []);

  const myCC = costCenters.find((c) => c.id === currentUser.cost_center_id) || costCenters[0];
  const assigned = Number(myCC.assigned_budget);
  const executed = Number(myCC.executed_budget);
  const balance = assigned - executed;
  const percent = assigned > 0 ? (executed / assigned) * 100 : 0;

  const myApprovedRequests = requests.filter(
    (r) => r.cost_center_id === myCC.id && (r.status === 'aprobada' || r.status === 'entregada')
  );

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-sm">
        <h1 className="text-calibri-title text-slate-900 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-600" />
          Presupuesto y Ejecución: {myCC.code} - {myCC.name}
        </h1>
        <p className="text-calibri-normal text-slate-600">
          Supervisa el saldo asignado a tu cuadrilla de operaciones para evitar sobregiros en la entrega de materiales.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase block">Presupuesto Asignado</span>
          <span className="text-calibri-title text-xl font-bold text-slate-900 block mt-1">
            ${assigned.toLocaleString('es-CL')} CLP
          </span>
          <p className="text-xs text-slate-400 mt-1">Fijado por Jefe de Sección</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase block">Gasto Ejecutado (Bodega)</span>
          <span className="text-calibri-title text-xl font-bold text-rose-700 block mt-1">
            ${executed.toLocaleString('es-CL')} CLP
          </span>
          <p className="text-xs text-rose-600 mt-1 font-semibold">{percent.toFixed(1)}% utilizado</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase block">Saldo Disponible</span>
          <span className="text-calibri-title text-xl font-bold text-emerald-700 block mt-1">
            ${balance.toLocaleString('es-CL')} CLP
          </span>
          <p className="text-xs text-emerald-600 mt-1 font-semibold">
            {(100 - percent).toFixed(1)}% disponible para autorizaciones
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-300 shadow-sm p-4">
        <h2 className="text-calibri-title text-slate-800 mb-3">
          Historial de Solicitudes Imputadas a este Centro de Costos
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-calibri-normal">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-xs font-bold border-b border-slate-300">
                <th className="p-2">Folio Solicitud</th>
                <th className="p-2">Fecha</th>
                <th className="p-2">Técnico Receptor</th>
                <th className="p-2">Motivo</th>
                <th className="p-2 text-right">Monto</th>
                <th className="p-2 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {myApprovedRequests.map((req) => {
                const total = req.items.reduce((s, i) => s + i.total_price, 0);
                return (
                  <tr key={req.id} className="hover:bg-slate-50">
                    <td className="p-2 font-mono text-xs font-bold text-sky-800">{req.id}</td>
                    <td className="p-2 text-slate-600 text-xs">{new Date(req.created_at).toLocaleDateString('es-CL')}</td>
                    <td className="p-2 font-bold text-slate-800">{req.technician_name}</td>
                    <td className="p-2 text-slate-700 text-xs">{req.reason}</td>
                    <td className="p-2 text-right font-bold text-slate-900">${total.toLocaleString('es-CL')}</td>
                    <td className="p-2 text-center">
                      <span className="text-xs px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800">
                        {req.status === 'entregada' ? 'Retirado' : 'Autorizado'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

