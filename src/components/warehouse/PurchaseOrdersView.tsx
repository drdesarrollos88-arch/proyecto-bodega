import React, { useState, useEffect } from 'react';
import { PurchaseOrder, Product } from '../../types';
import { store } from '../../services/store';
import { useAuth } from '../../context/AuthContext';
import { 
  ShoppingCart, 
  Plus, 
  CheckCircle2, 
  Truck, 
  Clock, 
  AlertTriangle, 
  PackagePlus, 
  Building2, 
  DollarSign, 
  X 
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface PurchaseOrdersViewProps {
  initialProductToOrder?: Product | null;
}

export const PurchaseOrdersView: React.FC<PurchaseOrdersViewProps> = ({ initialProductToOrder }) => {
  const { currentUser, activeUser } = useAuth();
  const user = activeUser || currentUser || store.getProfiles()[0];
  const [purchases, setPurchases] = useState<PurchaseOrder[]>(() => store.getPurchaseOrders());
  const [products, setProducts] = useState<Product[]>(() => store.getProducts());
  const [showCreateModal, setShowCreateModal] = useState<boolean>(!!initialProductToOrder);

  // Formulario de nueva orden
  const [selectedProductId, setSelectedProductId] = useState<string>(initialProductToOrder?.id || '');
  const [quantity, setQuantity] = useState<number>(10);
  const [supplier, setSupplier] = useState<string>('Distribuidora Logística Central SpA');
  const [estimatedCost, setEstimatedCost] = useState<number>(initialProductToOrder?.unit_price || 15000);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    return store.subscribe(() => {
      setPurchases(store.getPurchaseOrders());
      setProducts(store.getProducts());
    });
  }, []);

  useEffect(() => {
    if (initialProductToOrder) {
      setSelectedProductId(initialProductToOrder.id);
      setEstimatedCost(initialProductToOrder.unit_price);
      setShowCreateModal(true);
    }
  }, [initialProductToOrder]);

  const criticalProducts = products.filter((p) => p.current_stock <= p.min_stock);

  const handleProductSelect = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setEstimatedCost(prod.unit_price);
    }
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    const newOrder = store.createPurchaseOrder({
      productId: prod.id,
      productName: prod.name,
      productSku: prod.sku,
      quantity: Number(quantity),
      estimatedUnitCost: Number(estimatedCost),
      supplier: supplier.trim(),
      requestedBy: user.name,
    });

    setFeedback(`Orden de Compra ${newOrder.id} generada exitosamente.`);
    setShowCreateModal(false);
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleReceiveOrder = (orderId: string) => {
    store.receivePurchaseOrder(orderId);
    setFeedback(`Orden ${orderId} recibida. El stock de bodega fue incrementado automáticamente.`);
    setTimeout(() => setFeedback(null), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Mensaje de Confirmación */}
      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-md text-emerald-800 flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="text-calibri-title">{feedback}</span>
        </div>
      )}

      {/* Cabecera */}
      <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-calibri-title text-slate-900">
            Gestión de Solicitudes de Compras y Reabastecimiento
          </h1>
          <p className="text-calibri-normal text-slate-600">
            Módulo del Personal Administrativo para solicitar compras a proveedores y alimentar el inventario tras la recepción física.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (products.length > 0 && !selectedProductId) {
              handleProductSelect(products[0].id);
            }
            setShowCreateModal(true);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded text-calibri-normal font-bold shadow-sm transition-colors touch-target"
        >
          <Plus className="w-4 h-4" /> Generar Solicitud de Compra
        </button>
      </div>

      {/* Alerta de Insumos Bajo Stock Crítico para Reposición Inmediata */}
      {criticalProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-3">
          <div className="flex items-center gap-2 text-amber-900 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-calibri-title">
              Insumos con Necesidad Urgente de Compra ({criticalProducts.length} artículos bajo nivel mínimo)
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {criticalProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white p-2 rounded border border-amber-200 flex items-center justify-between text-calibri-normal text-xs"
              >
                <div>
                  <span className="font-mono font-bold text-sky-800">{p.sku}</span> - {p.name}
                  <span className="block text-slate-500">
                    Stock: <strong className="text-rose-700">{p.current_stock}</strong> / Mínimo: {p.min_stock} {p.unit}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleProductSelect(p.id);
                    setShowCreateModal(true);
                  }}
                  className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold whitespace-nowrap"
                >
                  Pedir Compra
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabla de Órdenes de Compra */}
      <div className="bg-white rounded-lg border border-slate-300 shadow-sm overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-calibri-title text-slate-800">
            Historial de Solicitudes y Órdenes de Compra
          </h2>
          <span className="text-calibri-normal text-slate-500 text-xs">
            {purchases.length} órdenes registradas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-calibri-normal">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-xs font-bold border-b border-slate-300">
                <th className="p-2.5">Folio OC</th>
                <th className="p-2.5">Insumo Requerido</th>
                <th className="p-2.5 text-center">Cantidad</th>
                <th className="p-2.5">Proveedor Seleccionado</th>
                <th className="p-2.5 text-right">Costo Estimado</th>
                <th className="p-2.5 text-center">Estado Compra</th>
                <th className="p-2.5">Solicitado Por</th>
                <th className="p-2.5 text-center">Acción de Bodega</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {purchases.map((po) => {
                return (
                  <tr key={po.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono text-xs font-bold text-sky-800">{po.id}</td>
                    <td className="p-2.5">
                      <span className="font-mono text-xs text-slate-500 block">{po.product_sku}</span>
                      <strong className="text-slate-800">{po.product_name}</strong>
                    </td>
                    <td className="p-2.5 text-center font-bold text-slate-900 text-calibri-title">
                      {po.quantity}
                    </td>
                    <td className="p-2.5 text-slate-700 text-xs flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {po.supplier}
                    </td>
                    <td className="p-2.5 text-right font-semibold text-slate-800">
                      ${po.total_cost.toLocaleString('es-CL')}
                    </td>
                    <td className="p-2.5 text-center">
                      {po.status === 'solicitada' && (
                        <Badge variant="warning" className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-700" /> Solicitada a Compras
                        </Badge>
                      )}
                      {po.status === 'en_camino' && (
                        <Badge variant="info" className="flex items-center gap-1 font-bold">
                          <Truck className="w-3 h-3 text-sky-700" /> Despachada por Proveedor
                        </Badge>
                      )}
                      {po.status === 'recibida' && (
                        <Badge variant="success" className="flex items-center gap-1 font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Recibida en Bodega
                        </Badge>
                      )}
                    </td>
                    <td className="p-2.5 text-slate-600 text-xs">
                      {po.requested_by}
                      <span className="block text-slate-400">
                        {new Date(po.created_at).toLocaleDateString('es-CL')}
                      </span>
                    </td>
                    <td className="p-2.5 text-center">
                      {po.status !== 'recibida' ? (
                        <button
                          type="button"
                          onClick={() => handleReceiveOrder(po.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-calibri-normal font-bold shadow-sm transition-colors touch-target whitespace-nowrap"
                        >
                          <PackagePlus className="w-3.5 h-3.5" /> Recepcionar Insumos
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-semibold flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Stock sumado
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear Orden de Compra */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg border border-slate-300 overflow-hidden my-6">
            <div className="p-3 bg-slate-800 text-white flex items-center justify-between">
              <h2 className="text-calibri-title text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-sky-300" />
                Nueva Solicitud de Compra a Proveedor
              </h2>
              <button onClick={() => setShowCreateModal(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-4 space-y-3">
              <div>
                <label className="block text-calibri-normal font-bold text-slate-700 mb-1">
                  Seleccionar Artículo de Bodega a Reponer: *
                </label>
                <select
                  required
                  value={selectedProductId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full px-2.5 py-2 border border-slate-300 rounded text-calibri-normal bg-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.sku} - {p.name} (Stock actual: {p.current_stock} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-calibri-normal font-bold text-slate-700 mb-1">
                    Cantidad a Adquirir: *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-calibri-title font-bold text-sky-900"
                  />
                </div>
                <div>
                  <label className="block text-calibri-normal font-bold text-slate-700 mb-1">
                    Costo Unitario Estimado:
                  </label>
                  <input
                    type="number"
                    required
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-calibri-normal"
                  />
                </div>
              </div>

              <div>
                <label className="block text-calibri-normal font-bold text-slate-700 mb-1">
                  Proveedor Sugerido / Contactado: *
                </label>
                <input
                  type="text"
                  required
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="Ej: Distribuidora Industrial Chile SpA"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-calibri-normal"
                />
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded flex items-center justify-between text-calibri-normal">
                <span className="text-slate-600 font-semibold">Costo Total Estimado Compra:</span>
                <span className="text-calibri-title text-sky-900 font-bold">
                  ${(quantity * estimatedCost).toLocaleString('es-CL')}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 border rounded text-calibri-normal text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded text-calibri-normal shadow-sm"
                >
                  Emitir Orden de Compra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

