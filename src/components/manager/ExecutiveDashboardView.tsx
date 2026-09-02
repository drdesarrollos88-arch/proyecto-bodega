import React, { useState, useEffect } from 'react';
import { Product, CostCenter, WarehouseRequest, DeliveryRecord } from '../../types';
import { store } from '../../services/store';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  Boxes, 
  DollarSign, 
  FileCheck2, 
  PieChart, 
  Users, 
  Eye, 
  ArrowUpRight, 
  ShieldCheck 
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { DeliveryReceiptModal } from '../reports/DeliveryReceiptModal';

interface ExecutiveDashboardViewProps {
  onNavigateToStock?: () => void;
  onNavigateToBudget?: () => void;
  onNavigateToAudit?: () => void;
}

export const ExecutiveDashboardView: React.FC<ExecutiveDashboardViewProps> = ({
  onNavigateToStock,
  onNavigateToBudget,
  onNavigateToAudit,
}) => {
  const [products, setProducts] = useState<Product[]>(() => store.getProducts());
  const [costCenters, setCostCenters] = useState<CostCenter[]>(() => store.getCostCenters());
  const [requests, setRequests] = useState<WarehouseRequest[]>(() => store.getRequests());
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>(() => store.getDeliveries());
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryRecord | null>(null);

  useEffect(() => {
    return store.subscribe(() => {
      setProducts(store.getProducts());
      setCostCenters(store.getCostCenters());
      setRequests(store.getRequests());
      setDeliveries(store.getDeliveries());
    });
  }, []);

  // Cálculos consolidados del Área
  const totalStockValue = products.reduce((sum, p) => sum + p.current_stock * p.unit_price, 0);
  const criticalProductsCount = products.filter((p) => p.current_stock <= p.min_stock).length;
  const outOfStockCount = products.filter((p) => p.current_stock <= 0).length;

  const totalAssignedBudget = costCenters.reduce((sum, c) => sum + Number(c.assigned_budget), 0);
  const totalExecutedBudget = costCenters.reduce((sum, c) => sum + Number(c.executed_budget), 0);
  const totalRemainingBudget = totalAssignedBudget - totalExecutedBudget;
  const totalExecutionPercent = totalAssignedBudget > 0 ? (totalExecutedBudget / totalAssignedBudget) * 100 : 0;

  // Conteo de solicitudes
  const pendingRequests = requests.filter((r) => r.status === 'pendiente').length;
  const approvedRequests = requests.filter((r) => r.status === 'aprobada').length;
  const deliveredRequests = requests.filter((r) => r.status === 'entregada').length;

  // Insumos más solicitados
  const itemUsageMap: { [sku: string]: { name: string; sku: string; quantity: number; totalCost: number } } = {};
  deliveries.forEach((d) => {
    d.items.forEach((it) => {
      if (!itemUsageMap[it.product_sku]) {
        itemUsageMap[it.product_sku] = {
          name: it.product_name,
          sku: it.product_sku,
          quantity: 0,
          totalCost: 0,
        };
      }
      itemUsageMap[it.product_sku].quantity += it.quantity;
      itemUsageMap[it.product_sku].totalCost += it.total_price;
    });
  });

  const topConsumedItems = Object.values(itemUsageMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Consumo por categoría
  const categoryUsage: { [cat: string]: number } = {
    EPP: 0,
    'Herramientas Menores': 0,
    'Artículos de Oficina': 0,
    Otros: 0,
  };

  deliveries.forEach((d) => {
    d.items.forEach((it) => {
      const prod = products.find((p) => p.sku === it.product_sku);
      const cat = prod?.category || 'Otros';
      categoryUsage[cat] = (categoryUsage[cat] || 0) + it.total_price;
    });
  });

  return (
    <div className="space-y-4">
      {/* Cabecera del Dashboard */}
      <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-calibri-title text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-700" />
            Dashboard Ejecutivo y Control Presupuestario del Área
          </h1>
          <p className="text-calibri-normal text-slate-600">
            Supervisión jerárquica para el Jefe de Sección: valorización de bodega, semáforo de quiebres y ejecución por Centro de Costos.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Área: <strong>Telecomunicaciones y Redes</strong></span>
        </div>
      </div>

      {/* Tarjetas KPIs Superiores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Presupuesto del Área */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-300 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-calibri-normal font-bold">Presupuesto Total Área</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <span className="text-calibri-title text-slate-900 font-bold text-lg block">
              ${totalAssignedBudget.toLocaleString('es-CL')}
            </span>
            <div className="text-xs text-slate-500 flex justify-between mt-1">
              <span>Ejecutado: <strong>${totalExecutedBudget.toLocaleString('es-CL')}</strong></span>
              <span className="text-emerald-700 font-bold">{totalExecutionPercent.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full mt-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  totalExecutionPercent > 85 ? 'bg-rose-600' : totalExecutionPercent > 65 ? 'bg-amber-500' : 'bg-emerald-600'
                }`}
                style={{ width: `${Math.min(100, totalExecutionPercent)}%` }}
              />
            </div>
          </div>
          <div className="mt-2 pt-1 border-t border-slate-100 flex justify-between text-xs text-slate-600">
            <span>Saldo Disponible:</span>
            <strong className="text-sky-900">${totalRemainingBudget.toLocaleString('es-CL')}</strong>
          </div>
        </div>

        {/* KPI 2: Valorización Total Bodega */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-300 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-calibri-normal font-bold">Valor Inventario Activo</span>
            <Boxes className="w-4 h-4 text-sky-700" />
          </div>
          <div>
            <span className="text-calibri-title text-sky-950 font-bold text-lg block">
              ${totalStockValue.toLocaleString('es-CL')}
            </span>
            <p className="text-xs text-slate-500 mt-1">
              {products.length} artículos en catálogo activo
            </p>
          </div>
          <div className="mt-2 pt-1 border-t border-slate-100 flex justify-between text-xs">
            <span className="text-slate-500">Unidades totales:</span>
            <strong className="text-slate-800">
              {products.reduce((s, p) => s + p.current_stock, 0)} unidades
            </strong>
          </div>
        </div>

        {/* KPI 3: Semáforo de Stock Crítico */}
        <div
          onClick={onNavigateToStock}
          className="bg-white p-3.5 rounded-lg border border-slate-300 shadow-sm flex flex-col justify-between cursor-pointer hover:border-amber-400 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-calibri-normal font-bold">Alertas de Stock Crítico</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-calibri-title text-amber-900 font-bold text-lg">
                {criticalProductsCount}
              </span>
              <span className="text-xs text-slate-500">artículos bajo mínimo</span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs">
              <span className="text-rose-700 font-semibold">{outOfStockCount} agotados</span>
              <span className="text-slate-300">|</span>
              <span className="text-amber-700 font-semibold">{criticalProductsCount - outOfStockCount} próximos</span>
            </div>
          </div>
          <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between text-xs text-sky-700 font-bold">
            <span>Revisar semáforo</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* KPI 4: Trazabilidad y Entregas */}
        <div
          onClick={onNavigateToAudit}
          className="bg-white p-3.5 rounded-lg border border-slate-300 shadow-sm flex flex-col justify-between cursor-pointer hover:border-sky-400 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-calibri-normal font-bold">Entregas Auditadas</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <span className="text-calibri-title text-slate-900 font-bold text-lg block">
              {deliveries.length} actas
            </span>
            <p className="text-xs text-slate-500 mt-1">
              Todas con firma digital y fotografía
            </p>
          </div>
          <div className="mt-2 pt-1 border-t border-slate-100 flex justify-between text-xs text-slate-600">
            <span>En despacho: <strong>{approvedRequests}</strong></span>
            <span>Pendientes: <strong>{pendingRequests}</strong></span>
          </div>
        </div>
      </div>

      {/* Control Presupuestario Detallado por Centro de Costos */}
      <div className="bg-white rounded-lg border border-slate-300 shadow-sm p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
          <div>
            <h2 className="text-calibri-title text-slate-900">
              Presupuesto Asignado y Ejecución por Centro de Costos (CC)
            </h2>
            <p className="text-calibri-normal text-slate-500 text-xs">
              Monitoreo del gasto real generado por los retiros de materiales autorizados en bodega.
            </p>
          </div>
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded font-bold">
            {costCenters.length} Centros de Costo
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {costCenters.map((cc) => {
            const assigned = Number(cc.assigned_budget);
            const executed = Number(cc.executed_budget);
            const balance = assigned - executed;
            const percent = assigned > 0 ? (executed / assigned) * 100 : 0;
            const isNearLimit = percent >= 85;

            return (
              <div
                key={cc.id}
                className={`p-3 rounded-lg border flex flex-col justify-between ${
                  isNearLimit ? 'bg-rose-50/30 border-rose-300' : 'bg-slate-50/50 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                      {cc.code}
                    </span>
                    <span
                      className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                        percent > 85
                          ? 'bg-rose-100 text-rose-800'
                          : percent > 60
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {percent.toFixed(1)}% Gastado
                    </span>
                  </div>

                  <h3 className="text-calibri-title text-slate-800 text-sm mb-2">
                    {cc.name}
                  </h3>

                  <div className="space-y-1 text-xs text-calibri-normal">
                    <div className="flex justify-between text-slate-500">
                      <span>Asignado:</span>
                      <strong className="text-slate-800">${assigned.toLocaleString('es-CL')}</strong>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Ejecutado (Retiros):</span>
                      <strong className="text-rose-700">${executed.toLocaleString('es-CL')}</strong>
                    </div>
                    <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-200">
                      <span>Saldo Disponible:</span>
                      <strong className="text-emerald-800 text-calibri-title font-bold">
                        ${balance.toLocaleString('es-CL')}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="mt-2.5">
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        percent > 85 ? 'bg-rose-600' : percent > 60 ? 'bg-amber-500' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.min(100, percent)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Métricas de Uso y Top Insumos Solicitados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top 5 Insumos con Mayor Demanda */}
        <div className="bg-white rounded-lg border border-slate-300 shadow-sm p-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 mb-3">
            <h2 className="text-calibri-title text-slate-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-sky-700" />
              Insumos con Mayor Rotación y Retiro
            </h2>
            <span className="text-xs text-slate-400">Por volumen histórico</span>
          </div>

          {topConsumedItems.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-xs">
              No hay retiros registrados para calcular rotación.
            </div>
          ) : (
            <div className="space-y-2.5">
              {topConsumedItems.map((item, idx) => (
                <div key={item.sku} className="flex items-center justify-between text-calibri-normal text-xs">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex-shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <span className="font-mono font-bold text-sky-800 mr-1">{item.sku}</span>
                      <span className="text-slate-800 font-medium truncate inline-block max-w-[200px] sm:max-w-xs align-bottom">
                        {item.name}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-bold text-slate-900 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
                      {item.quantity} un
                    </span>
                    <span className="block text-slate-500 text-xs mt-0.5">
                      ${item.totalCost.toLocaleString('es-CL')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Distribución Presupuestaria por Categoría */}
        <div className="bg-white rounded-lg border border-slate-300 shadow-sm p-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 mb-3">
            <h2 className="text-calibri-title text-slate-900 flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-sky-700" />
              Distribución de Gasto por Categoría de Insumos
            </h2>
            <span className="text-xs text-slate-400">En despachos oficiales</span>
          </div>

          <div className="space-y-3">
            {Object.entries(categoryUsage).map(([cat, amount]) => {
              const catPercent = totalExecutedBudget > 0 ? (amount / totalExecutedBudget) * 100 : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-calibri-normal text-xs">
                    <span className="font-bold text-slate-800">{cat}</span>
                    <span className="text-slate-600">
                      ${amount.toLocaleString('es-CL')}{' '}
                      <strong className="text-slate-800">({catPercent.toFixed(1)}%)</strong>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-700 rounded-full"
                      style={{ width: `${Math.min(100, catPercent)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Registro Reciente de Auditoría Inmutable */}
      <div className="bg-white rounded-lg border border-slate-300 shadow-sm p-4">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 mb-3">
          <div>
            <h2 className="text-calibri-title text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Últimas Actas de Entrega Verificadas (Firmas y Fotografías)
            </h2>
            <p className="text-calibri-normal text-slate-500 text-xs">
              Historial auditable para fiscalización y control interno.
            </p>
          </div>
          {onNavigateToAudit && (
            <button
              type="button"
              onClick={onNavigateToAudit}
              className="text-xs font-bold text-sky-700 hover:text-sky-800 flex items-center gap-1"
            >
              Ver todas las actas <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {deliveries.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs">
            No se han generado actas de entrega aún.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-calibri-normal">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-xs font-bold border-b border-slate-300">
                  <th className="p-2">Folio Acta</th>
                  <th className="p-2">Fecha y Hora</th>
                  <th className="p-2">Receptor (Técnico)</th>
                  <th className="p-2">Centro de Costo</th>
                  <th className="p-2 text-right">Monto Total</th>
                  <th className="p-2 text-center">Firma Digital</th>
                  <th className="p-2 text-center">Foto Entrega</th>
                  <th className="p-2 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {deliveries.slice(0, 5).map((del) => (
                  <tr key={del.id} className="hover:bg-slate-50">
                    <td className="p-2 font-mono text-xs font-bold text-sky-800">{del.id}</td>
                    <td className="p-2 text-slate-600 text-xs">
                      {new Date(del.delivered_at).toLocaleString('es-CL')}
                    </td>
                    <td className="p-2">
                      <strong className="text-slate-800">{del.technician_name}</strong>
                      <span className="block text-slate-400 text-xs">{del.technician_rut}</span>
                    </td>
                    <td className="p-2 font-semibold text-slate-700">{del.cost_center_id}</td>
                    <td className="p-2 text-right font-bold text-slate-900">
                      ${del.total_amount.toLocaleString('es-CL')}
                    </td>
                    <td className="p-2 text-center">
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <FileCheck2 className="w-3 h-3" /> Verificada
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      <span className="inline-flex items-center gap-1 text-xs text-sky-700 font-bold bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        <ShieldCheck className="w-3 h-3" /> Adjunta
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedDelivery(del)}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-bold transition-colors"
                      >
                        <Eye className="w-3 h-3" /> Ver Acta
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Acta de Entrega Oficial */}
      <DeliveryReceiptModal
        delivery={selectedDelivery}
        onClose={() => setSelectedDelivery(null)}
      />
    </div>
  );
};

