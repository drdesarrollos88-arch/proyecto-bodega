import React, { useState } from 'react';
import { DeliveryRecord, UserProfile, WarehouseRequest } from '../../types';
import { store } from '../../services/store';
import { 
  X, 
  Printer, 
  ShieldCheck, 
  User, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  FileSpreadsheet, 
  Filter 
} from 'lucide-react';

interface EmployeeConsolidatedReportModalProps {
  onClose: () => void;
  initialEmployeeRut?: string;
}

interface ConsolidatedItem {
  sku: string;
  name: string;
  totalQuantity: number;
  unitPrice: number;
  totalAmount: number;
  firstDeliveryDate: string;
  lastDeliveryDate: string;
  actasFolios: string[];
}

export const EmployeeConsolidatedReportModal: React.FC<EmployeeConsolidatedReportModalProps> = ({
  onClose,
  initialEmployeeRut,
}) => {
  const profiles = store.getProfiles();
  const allDeliveries = store.getDeliveries();
  const allRequests = store.getRequests();

  // Buscar todos los funcionarios que tienen entregas registradas
  const employeesWithDeliveries = profiles.filter((p) =>
    allDeliveries.some((d) => d.technician_rut === p.rut || d.technician_name === p.name)
  );

  // Si el perfil inicial no está en la lista pero existe en profiles, usarlo
  const defaultRut = initialEmployeeRut || (employeesWithDeliveries[0]?.rut || profiles[0]?.rut);
  const [selectedRut, setSelectedRut] = useState<string>(defaultRut);

  const selectedEmployee = profiles.find((p) => p.rut === selectedRut) || {
    id: 'USR-TEMP',
    name: allDeliveries.find((d) => d.technician_rut === selectedRut)?.technician_name || 'Funcionario',
    rut: selectedRut,
    role: 'tecnico' as const,
    cost_center_id: allDeliveries.find((d) => d.technician_rut === selectedRut)?.cost_center_id || 'CC-101',
  };

  // Filtrar todas las entregas del funcionario
  const employeeDeliveries = allDeliveries.filter(
    (d) => d.technician_rut === selectedRut || d.technician_name === selectedEmployee.name
  );

  // Consolidar todos los insumos entregados
  const consolidatedMap: { [sku: string]: ConsolidatedItem } = {};

  employeeDeliveries.forEach((del) => {
    const req = allRequests.find((r) => r.id === del.request_id);
    if (!req) return;

    req.items.forEach((item) => {
      if (!consolidatedMap[item.product_sku]) {
        consolidatedMap[item.product_sku] = {
          sku: item.product_sku,
          name: item.product_name,
          totalQuantity: item.quantity,
          unitPrice: item.unit_price,
          totalAmount: item.total_price,
          firstDeliveryDate: del.delivered_at,
          lastDeliveryDate: del.delivered_at,
          actasFolios: [del.id],
        };
      } else {
        const existing = consolidatedMap[item.product_sku];
        existing.totalQuantity += item.quantity;
        existing.totalAmount += item.total_price;
        if (!existing.actasFolios.includes(del.id)) {
          existing.actasFolios.push(del.id);
        }
        if (new Date(del.delivered_at) < new Date(existing.firstDeliveryDate)) {
          existing.firstDeliveryDate = del.delivered_at;
        }
        if (new Date(del.delivered_at) > new Date(existing.lastDeliveryDate)) {
          existing.lastDeliveryDate = del.delivered_at;
        }
      }
    });
  });

  const consolidatedItems = Object.values(consolidatedMap);
  const grandTotalAmount = consolidatedItems.reduce((s, i) => s + i.totalAmount, 0);
  const totalUnits = consolidatedItems.reduce((s, i) => s + i.totalQuantity, 0);

  // Cerrar con tecla Escape
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
        className="bg-white rounded-lg shadow-2xl w-full max-w-4xl border border-slate-300 overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra Superior con Controles Sticky (No imprimible) */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-2.5 bg-slate-800 text-white shadow no-print">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-calibri-title text-white">
              Acta Consolidada Histórica de Entregas por Funcionario
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

        {/* Selector de Funcionario (No imprimible) */}
        <div className="p-3 bg-slate-100 border-b border-slate-300 flex flex-wrap items-center justify-between gap-2 no-print">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-600" />
            <label className="text-xs font-bold text-slate-700">Seleccionar Funcionario a Auditar:</label>
            <select
              value={selectedRut}
              onChange={(e) => setSelectedRut(e.target.value)}
              className="px-2.5 py-1 text-xs border border-slate-300 rounded bg-white text-slate-800 font-bold"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.rut}>
                  {p.name} ({p.rut} - {p.role})
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            Entregas históricas registradas: <strong>{employeeDeliveries.length} actas</strong>
          </span>
        </div>

        {/* Documento Imprimible Oficial (SIN FOTOS, FORMATO RESUMEN CORPORATIVO) */}
        <div className="p-6 text-slate-900 bg-white space-y-4 print:p-0">
          {/* Membrete Corporativo */}
          <div className="border-b-2 border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-calibri-title text-slate-900 uppercase font-black tracking-wider text-base">
                HOJA DE VIDA Y ACTA CONSOLIDADA DE INSUMOS POR FUNCIONARIO
              </h1>
              <p className="text-calibri-normal text-slate-600">
                Departamento de Logística, Control de Activos y Bodega Central
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 uppercase font-bold block">Fecha Emisión:</span>
              <span className="text-calibri-normal text-slate-800 font-mono font-bold">
                {new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Ficha Oficial del Funcionario */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded text-calibri-normal text-xs">
            <div>
              <span className="text-slate-500 block font-bold">Nombre Completo:</span>
              <strong className="text-slate-900 text-sm">{selectedEmployee.name}</strong>
            </div>
            <div>
              <span className="text-slate-500 block font-bold">RUT Oficial:</span>
              <span className="font-mono font-bold text-sky-900">{selectedEmployee.rut}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-bold">Centro de Costos / Rol:</span>
              <span className="text-slate-800 font-bold">{selectedEmployee.cost_center_id} • {selectedEmployee.role.toUpperCase()}</span>
            </div>
          </div>

          {/* Tabla de Resumen Consolidado */}
          <div className="space-y-1">
            <h2 className="text-calibri-title text-slate-900 text-xs uppercase font-bold tracking-wide">
              Detalle Consolidado de Materiales, EPP y Herramientas Entregadas
            </h2>

            {consolidatedItems.length === 0 ? (
              <div className="p-6 text-center text-slate-400 bg-slate-50 rounded border border-slate-200">
                No existen registros históricos de insumos o herramientas entregadas a este funcionario.
              </div>
            ) : (
              <div className="border border-slate-300 rounded overflow-hidden">
                <table className="w-full text-left text-xs text-calibri-normal">
                  <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                    <tr>
                      <th className="p-2">SKU</th>
                      <th className="p-2">Descripción del Artículo</th>
                      <th className="p-2 text-center">Cant. Total</th>
                      <th className="p-2 text-right">Precio Unit.</th>
                      <th className="p-2 text-right">Total Acumulado</th>
                      <th className="p-2 text-center">Última Entrega</th>
                      <th className="p-2 text-center">Folios de Actas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    {consolidatedItems.map((item) => (
                      <tr key={item.sku} className="hover:bg-slate-50/60">
                        <td className="p-2 font-mono font-bold text-sky-800">{item.sku}</td>
                        <td className="p-2 font-medium">{item.name}</td>
                        <td className="p-2 text-center font-bold">{item.totalQuantity}</td>
                        <td className="p-2 text-right text-slate-600">${item.unitPrice.toLocaleString('es-CL')}</td>
                        <td className="p-2 text-right font-bold text-slate-900">${item.totalAmount.toLocaleString('es-CL')}</td>
                        <td className="p-2 text-center text-slate-600 font-mono text-[11px]">
                          {new Date(item.lastDeliveryDate).toLocaleDateString('es-CL')}
                        </td>
                        <td className="p-2 text-center text-[10px] text-slate-500 font-mono">
                          {item.actasFolios.join(', ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-100 border-t-2 border-slate-400 font-bold">
                    <tr>
                      <td colSpan={2} className="p-2.5 text-right uppercase text-slate-700 font-bold">
                        Totales Consolidados:
                      </td>
                      <td className="p-2.5 text-center text-slate-900 font-bold">{totalUnits} unids.</td>
                      <td className="p-2.5"></td>
                      <td className="p-2.5 text-right text-sky-900 text-sm font-bold">
                        ${grandTotalAmount.toLocaleString('es-CL')}
                      </td>
                      <td colSpan={2} className="p-2.5 text-center text-xs text-slate-500">
                        {employeeDeliveries.length} actas procesadas
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Cuadro de Declaración y Firmas Oficiales */}
          <div className="pt-4 space-y-6">
            <p className="text-[11px] text-slate-500 italic text-justify leading-relaxed">
              El funcionario identificado declara bajo firma haber recibido a entera conformidad y en óptimas condiciones los materiales, herramientas menores y elementos de protección personal (EPP) detallados en el presente consolidado histórico, comprometiéndose a su adecuado uso y conservación conforme al reglamento interno de seguridad y operaciones.
            </p>

            <div className="grid grid-cols-2 gap-8 pt-4">
              <div className="text-center border-t border-slate-400 pt-2">
                <span className="text-xs font-bold text-slate-800 block">{selectedEmployee.name}</span>
                <span className="text-[11px] text-slate-500 block">RUT: {selectedEmployee.rut}</span>
                <span className="text-[10px] text-slate-400 block uppercase">Firma del Funcionario / Receptor</span>
              </div>
              <div className="text-center border-t border-slate-400 pt-2">
                <span className="text-xs font-bold text-slate-800 block">Jefatura de Sección / Bodega Central</span>
                <span className="text-[11px] text-slate-500 block">Departamento de Logística</span>
                <span className="text-[10px] text-slate-400 block uppercase">Firma y Timbre Autorizado</span>
              </div>
            </div>
          </div>

          {/* Sello de Auditoría Inmutable */}
          <div className="p-2 bg-slate-100 rounded text-center text-[10px] text-slate-500 border border-slate-200">
            Documento emitido electrónicamente por el Sistema de Gestión de Bodega e Inventario. Válido para auditoría interna, control de dotación y legajo de personal.
          </div>
        </div>

        {/* Barra Inferior Fija para Cerrar (No imprimible) */}
        <div className="p-3.5 bg-slate-100 border-t border-slate-300 flex flex-wrap items-center justify-between gap-2.5 no-print">
          <span className="text-xs text-slate-600 font-medium">
            Funcionario: <strong className="text-sky-900">{selectedEmployee.name}</strong> ({selectedEmployee.rut})
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors touch-target"
            >
              <Printer className="w-4 h-4 text-sky-700" /> Imprimir / Exportar PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors touch-target"
            >
              <CheckCircle className="w-4 h-4" /> Cerrar y Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
