import React, { useState, useEffect } from 'react';
import { CostCenter, DeliveryRecord } from '../../types';
import { store } from '../../services/store';
import { DollarSign, TrendingUp, AlertCircle, CheckCircle2, Edit3, X, Filter } from 'lucide-react';

export const CostCentersBudgetView: React.FC = () => {
  const [costCenters, setCostCenters] = useState<CostCenter[]>(() => store.getCostCenters());
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>(() => store.getDeliveries());
  const [editingCC, setEditingCC] = useState<CostCenter | null>(null);
  const [newBudget, setNewBudget] = useState<number>(0);
  const [selectedFilterCC, setSelectedFilterCC] = useState<string>('TODOS');

  useEffect(() => {
    return store.subscribe(() => {
      setCostCenters(store.getCostCenters());
      setDeliveries(store.getDeliveries());
    });
  }, []);

  const displayedCostCenters = selectedFilterCC === 'TODOS'
    ? costCenters
    : costCenters.filter((c) => c.id === selectedFilterCC || c.code === selectedFilterCC);

  const totalAssigned = displayedCostCenters.reduce((s, c) => s + Number(c.assigned_budget), 0);
  const totalExecuted = displayedCostCenters.reduce((s, c) => s + Number(c.executed_budget), 0);
  const totalRemaining = totalAssigned - totalExecuted;
  const totalExecutionPercent = totalAssigned > 0 ? (totalExecuted / totalAssigned) * 100 : 0;

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCC) return;

    store.updateCostCenter(editingCC.id, {
      assigned_budget: Number(newBudget),
    });
    setEditingCC(null);
  };

  return (
    <div className="space-y-4">
      {/* Cabecera con Filtro */}
      <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-calibri-title text-slate-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Control Presupuestario por Centros de Costos (Área de Telecomunicaciones)
          </h1>
          <p className="text-calibri-normal text-slate-600">
            Supervisión y ajuste del presupuesto asignado, gasto ejecutado por bodega y saldos disponibles.
          </p>
        </div>

        {/* Filtro por Centro de Costos o Total */}
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
          <Filter className="w-4 h-4 text-slate-500 ml-1" />
          <span className="text-xs font-bold text-slate-600">Filtrar:</span>
          <select
            value={selectedFilterCC}
            onChange={(e) => setSelectedFilterCC(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-300 rounded bg-white text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-sky-600"
          >
            <option value="TODOS">TODOS LOS CENTROS (Consolidado)</option>
            {costCenters.map((cc) => (
              <option key={cc.id} value={cc.id}>
                {cc.code} - {cc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tarjeta de Resumen Consolidado del Área */}
      <div className="bg-slate-900 text-white rounded-lg p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase text-slate-400 font-bold tracking-wider block">
              Consolidado Total del Área
            </span>
            <span className="text-calibri-title text-2xl font-bold text-white block mt-1">
              ${totalAssigned.toLocaleString('es-CL')} CLP
            </span>
            <span className="text-calibri-normal text-slate-400 text-xs">
              Presupuesto total distribuido en {costCenters.length} centros de costos operacionales
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div>
              <span className="text-xs text-slate-400 block font-bold">Total Ejecutado (Bodega):</span>
              <span className="text-calibri-title text-lg font-bold text-rose-400">
                ${totalExecuted.toLocaleString('es-CL')}
              </span>
              <span className="text-xs text-slate-400 block">{totalExecutionPercent.toFixed(1)}% del total</span>
            </div>

            <div>
              <span className="text-xs text-slate-400 block font-bold">Saldo Disponible Total:</span>
              <span className="text-calibri-title text-lg font-bold text-emerald-400">
                ${totalRemaining.toLocaleString('es-CL')}
              </span>
              <span className="text-xs text-slate-400 block">{(100 - totalExecutionPercent).toFixed(1)}% restante</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800">
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                totalExecutionPercent > 85 ? 'bg-rose-500' : totalExecutionPercent > 60 ? 'bg-amber-400' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, totalExecutionPercent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabla Detallada por Centro de Costos */}
      <div className="bg-white rounded-lg border border-slate-300 shadow-sm overflow-hidden">
        <div className="p-3 border-b border-slate-200">
          <h2 className="text-calibri-title text-slate-800">
            Desglose por Centro de Costos Operacional
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-calibri-normal">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-xs font-bold border-b border-slate-300">
                <th className="p-2.5">Código</th>
                <th className="p-2.5">Nombre del Centro de Costos</th>
                <th className="p-2.5">Área Superior</th>
                <th className="p-2.5 text-right">Presupuesto Asignado</th>
                <th className="p-2.5 text-right">Gasto Ejecutado</th>
                <th className="p-2.5 text-right">Saldo Disponible</th>
                <th className="p-2.5 text-center">% Ejecución</th>
                <th className="p-2.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {displayedCostCenters.map((cc) => {
                const assigned = Number(cc.assigned_budget);
                const executed = Number(cc.executed_budget);
                const balance = assigned - executed;
                const percent = assigned > 0 ? (executed / assigned) * 100 : 0;

                return (
                  <tr key={cc.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono text-xs font-bold text-sky-800">{cc.code}</td>
                    <td className="p-2.5 font-bold text-slate-900">{cc.name}</td>
                    <td className="p-2.5 text-slate-600 text-xs">{cc.area}</td>
                    <td className="p-2.5 text-right font-bold text-slate-800">
                      ${assigned.toLocaleString('es-CL')}
                    </td>
                    <td className="p-2.5 text-right font-bold text-rose-700">
                      ${executed.toLocaleString('es-CL')}
                    </td>
                    <td className="p-2.5 text-right font-bold text-emerald-700">
                      ${balance.toLocaleString('es-CL')}
                    </td>
                    <td className="p-2.5 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                          percent > 85
                            ? 'bg-rose-100 text-rose-800'
                            : percent > 60
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {percent.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCC(cc);
                          setNewBudget(Number(cc.assigned_budget));
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-700 hover:text-sky-800 hover:bg-slate-100 rounded text-xs font-bold border border-slate-300 transition-colors touch-target"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Ajustar Presupuesto
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Modificación Presupuestaria */}
      {editingCC && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md border border-slate-300 overflow-hidden">
            <div className="p-3 bg-slate-800 text-white flex items-center justify-between">
              <h2 className="text-calibri-title text-white">
                Ajustar Presupuesto Asignado ({editingCC.code})
              </h2>
              <button onClick={() => setEditingCC(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveBudget} className="p-4 space-y-3">
              <div>
                <span className="text-xs text-slate-500 block">Centro de Costo:</span>
                <p className="text-calibri-title text-slate-800 font-bold">{editingCC.name}</p>
              </div>

              <div className="p-2.5 bg-slate-50 border rounded text-xs text-slate-600">
                Gasto actual ejecutado: <strong>${editingCC.executed_budget.toLocaleString('es-CL')} CLP</strong>
              </div>

              <div>
                <label className="block text-calibri-normal font-bold text-slate-700 mb-1">
                  Nuevo Presupuesto Asignado ($ CLP):
                </label>
                <input
                  type="number"
                  min={editingCC.executed_budget}
                  required
                  value={newBudget}
                  onChange={(e) => setNewBudget(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-calibri-title font-bold text-sky-900"
                />
                <span className="text-xs text-slate-400 block mt-1">
                  No puede ser inferior al gasto ya ejecutado (${editingCC.executed_budget.toLocaleString('es-CL')}).
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setEditingCC(null)}
                  className="px-3 py-1.5 border rounded text-calibri-normal text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded text-calibri-normal"
                >
                  Guardar Presupuesto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

