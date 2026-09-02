import React, { useState, useEffect } from 'react';
import { DeliveryRecord } from '../../types';
import { store } from '../../services/store';
import { ShieldCheck, Search, Eye, Calendar, Printer, User, DollarSign, Filter, FileSpreadsheet } from 'lucide-react';
import { DeliveryReceiptModal } from '../reports/DeliveryReceiptModal';
import { EmployeeConsolidatedReportModal } from '../reports/EmployeeConsolidatedReportModal';

export const AuditRecordsView: React.FC = () => {
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>(() => store.getDeliveries());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCostCenter, setSelectedCostCenter] = useState('todos');
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryRecord | null>(null);
  const [showConsolidatedModal, setShowConsolidatedModal] = useState(false);
  const [consolidatedRut, setConsolidatedRut] = useState<string | undefined>(undefined);

  useEffect(() => {
    return store.subscribe(() => {
      setDeliveries(store.getDeliveries());
    });
  }, []);

  const filteredDeliveries = deliveries.filter((d) => {
    const matchesCC = selectedCostCenter === 'todos' || d.cost_center_id === selectedCostCenter;
    const matchesSearch =
      d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.technician_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.technician_rut.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.request_id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCC && matchesSearch;
  });

  const totalAuditedAmount = filteredDeliveries.reduce((sum, d) => sum + d.total_amount, 0);

  return (
    <div className="space-y-4">
      {/* Cabecera */}
      <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-calibri-title text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Libro de Actas y Registro Verificable de Entregas
          </h1>
          <p className="text-calibri-normal text-slate-600">
            Archivo inmutable de comprobantes individuales por evento y actas consolidadas por funcionario.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setConsolidatedRut(undefined);
              setShowConsolidatedModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-calibri-normal font-bold shadow-sm transition-colors touch-target"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            Acta Consolidada por Funcionario
          </button>
          <span className="text-calibri-normal bg-sky-50 text-sky-800 border border-sky-200 px-3 py-1 rounded font-bold">
            {filteredDeliveries.length} actas (${totalAuditedAmount.toLocaleString('es-CL')})
          </span>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white p-3 rounded-lg border border-slate-300 shadow-sm flex flex-col sm:flex-row items-center gap-2.5 justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por Folio Acta, RUT o Técnico..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-calibri-normal focus:outline-none focus:ring-1 focus:ring-sky-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-calibri-normal text-slate-600 text-xs">Centro de Costo:</span>
          <select
            value={selectedCostCenter}
            onChange={(e) => setSelectedCostCenter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded text-calibri-normal bg-white"
          >
            <option value="todos">Todos los Centros</option>
            <option value="CC-101">CC-101 (Operaciones Terreno)</option>
            <option value="CC-102">CC-102 (Mantenimiento)</option>
            <option value="CC-103">CC-103 (Fibra Óptica)</option>
            <option value="CC-104">CC-104 (Administración)</option>
          </select>
        </div>
      </div>

      {/* Tabla de Actas */}
      <div className="bg-white rounded-lg border border-slate-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-calibri-normal">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-xs font-bold border-b border-slate-300">
                <th className="p-2.5">Folio Acta</th>
                <th className="p-2.5">Fecha y Hora</th>
                <th className="p-2.5">Solicitud</th>
                <th className="p-2.5">Técnico Receptor</th>
                <th className="p-2.5">Bodeguero Despachador</th>
                <th className="p-2.5">Centro Costo</th>
                <th className="p-2.5 text-right">Monto Total</th>
                <th className="p-2.5 text-center">Firma Digital</th>
                <th className="p-2.5 text-center">Evidencia Foto</th>
                <th className="p-2.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredDeliveries.map((del) => (
                <tr key={del.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-2.5 font-mono text-xs font-bold text-sky-800">{del.id}</td>
                  <td className="p-2.5 text-slate-600 text-xs">
                    {new Date(del.delivered_at).toLocaleString('es-CL')}
                  </td>
                  <td className="p-2.5 font-mono text-xs text-slate-500">{del.request_id}</td>
                  <td className="p-2.5">
                    <strong className="text-slate-800">{del.technician_name}</strong>
                    <span className="block text-slate-400 text-xs">RUT: {del.technician_rut}</span>
                  </td>
                  <td className="p-2.5 text-slate-700 text-xs">{del.warehouse_staff_name}</td>
                  <td className="p-2.5 font-bold text-slate-800">{del.cost_center_id}</td>
                  <td className="p-2.5 text-right font-bold text-slate-900">
                    ${del.total_amount.toLocaleString('es-CL')}
                  </td>
                  <td className="p-2.5 text-center">
                    <div className="w-16 h-8 mx-auto bg-slate-50 border border-slate-200 rounded flex items-center justify-center p-0.5 overflow-hidden">
                      <img src={del.signature_data} alt="Firma" className="max-h-7 max-w-full object-contain" />
                    </div>
                  </td>
                  <td className="p-2.5 text-center">
                    <div className="w-12 h-8 mx-auto bg-slate-900 border border-slate-300 rounded flex items-center justify-center overflow-hidden">
                      <img src={del.photo_data} alt="Foto" className="max-h-8 max-w-full object-contain" />
                    </div>
                  </td>
                  <td className="p-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => setSelectedDelivery(del)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-700 hover:bg-sky-800 text-white rounded text-xs font-bold transition-colors touch-target"
                    >
                      <Eye className="w-3.5 h-3.5" /> Ver / Imprimir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Acta de Entrega Individual */}
      <DeliveryReceiptModal
        delivery={selectedDelivery}
        onClose={() => setSelectedDelivery(null)}
      />

      {/* Modal de Acta Consolidada Histórica por Funcionario (Sin Fotos) */}
      {showConsolidatedModal && (
        <EmployeeConsolidatedReportModal
          initialEmployeeRut={consolidatedRut}
          onClose={() => setShowConsolidatedModal(false)}
        />
      )}
    </div>
  );
};

