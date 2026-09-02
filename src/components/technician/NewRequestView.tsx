import React, { useState, useEffect } from 'react';
import { Product, ProductCategory, CostCenter } from '../../types';
import { store } from '../../services/store';
import { useAuth } from '../../context/AuthContext';
import { Search, Plus, Minus, ShoppingBag, Send, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Badge } from '../common/Badge';

interface CartItem {
  product: Product;
  quantity: number;
}

interface NewRequestViewProps {
  onSuccessSubmit: () => void;
}

export const NewRequestView: React.FC<NewRequestViewProps> = ({ onSuccessSubmit }) => {
  const { currentUser, activeUser } = useAuth();
  const user = activeUser || currentUser || store.getProfiles()[0];
  const [products, setProducts] = useState<Product[]>(() => store.getProducts());
  const [costCenters, setCostCenters] = useState<CostCenter[]>(() => store.getCostCenters());
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Carrito de solicitud
  const [cart, setCart] = useState<CartItem[]>([]);
  const [costCenterId, setCostCenterId] = useState(user.cost_center_id || 'CC-101');
  const [workOrder, setWorkOrder] = useState('');
  const [reason, setReason] = useState('');
  const [priority, setPriority] = useState<'Normal' | 'Urgente'>('Normal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    return store.subscribe(() => {
      setProducts(store.getProducts());
      setCostCenters(store.getCostCenters());
    });
  }, []);

  const categories: { id: string; label: string }[] = [
    { id: 'todos', label: 'Todos los Artículos' },
    { id: 'EPP', label: 'EPP (Protección Personal)' },
    { id: 'Herramientas Menores', label: 'Herramientas Menores' },
    { id: 'Artículos de Oficina', label: 'Artículos de Oficina' },
    { id: 'Otros', label: 'Otros Insumos' },
  ];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'todos' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: Product) => {
    if (product.current_stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.current_stock) return prev;
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map((item) =>
          item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prev.filter((item) => item.product.id !== productId);
    });
  };

  const clearCart = () => setCart([]);

  const totalEstimatedCost = cart.reduce(
    (sum, item) => sum + item.product.unit_price * item.quantity,
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!reason.trim()) {
      alert('Por favor ingrese el motivo o justificación de la solicitud.');
      return;
    }

    setIsSubmitting(true);

    const items = cart.map((c) => ({
      id: 'ri-' + Math.random().toString(36).substring(2, 9),
      request_id: '',
      product_id: c.product.id,
      product_name: c.product.name,
      product_sku: c.product.sku,
      quantity: c.quantity,
      unit_price: c.product.unit_price,
      total_price: c.product.unit_price * c.quantity,
    }));

    const newReq = store.createRequest({
      technician_id: user.id,
      technician_name: user.name,
      technician_rut: user.rut,
      cost_center_id: costCenterId,
      work_order: workOrder.trim() || undefined,
      reason: reason.trim(),
      priority,
      items,
    });

    setIsSubmitting(false);
    setSuccessMessage(`Solicitud ${newReq.id} enviada exitosamente al Supervisor.`);
    setCart([]);
    setReason('');
    setWorkOrder('');

    setTimeout(() => {
      setSuccessMessage(null);
      onSuccessSubmit();
    }, 1500);
  };

  return (
    <div className="space-y-4">
      {/* Mensaje de Éxito Flotante */}
      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-md text-emerald-800 flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="text-calibri-title">{successMessage}</span>
        </div>
      )}

      {/* Encabezado con Instrucción Operativa */}
      <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-calibri-title text-slate-900">
            Nueva Solicitud de Materiales y Herramientas
          </h1>
          <p className="text-calibri-normal text-slate-600">
            Selecciona los insumos requeridos para faena. Tu supervisor revisará el stock y autorizará el retiro en bodega.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-calibri-normal text-slate-500">Técnico solicitante:</span>
          <span className="bg-slate-100 border border-slate-300 px-2 py-1 rounded text-calibri-normal font-bold text-slate-800">
            {user.name}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Catálogo de Productos (2 Columnas en escritorio) */}
        <div className="lg:col-span-2 space-y-3">
          {/* Filtros y Búsqueda */}
          <div className="bg-white p-3 rounded-lg border border-slate-300 shadow-sm space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, código SKU o ubicación (ej: Guantes, EPP-002, Pasillo 1)..."
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-calibri-normal focus:outline-none focus:ring-1 focus:ring-sky-600"
              />
            </div>

            {/* Selector de Categorías Horizontal */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-full text-calibri-normal whitespace-nowrap transition-colors border ${
                    selectedCategory === cat.id
                      ? 'bg-sky-700 text-white border-sky-800 font-bold'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grilla de Productos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredProducts.map((prod) => {
              const inCart = cart.find((c) => c.product.id === prod.id);
              const isOutOfStock = prod.current_stock <= 0;
              const isCritical = prod.current_stock <= prod.min_stock && !isOutOfStock;

              return (
                <div
                  key={prod.id}
                  className={`bg-white rounded-lg border p-3 flex flex-col justify-between transition-shadow hover:shadow-md ${
                    isOutOfStock
                      ? 'border-slate-200 opacity-60 bg-slate-50'
                      : isCritical
                      ? 'border-amber-300 bg-amber-50/20'
                      : 'border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-calibri-normal text-xs font-mono font-bold text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                        {prod.sku}
                      </span>
                      {isOutOfStock ? (
                        <Badge variant="danger">Sin Stock</Badge>
                      ) : isCritical ? (
                        <Badge variant="warning" className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Stock Crítico: {prod.current_stock}
                        </Badge>
                      ) : (
                        <Badge variant="success">Stock: {prod.current_stock} {prod.unit}</Badge>
                      )}
                    </div>

                    <h2 className="text-calibri-title text-slate-900 line-clamp-2 mb-1">
                      {prod.name}
                    </h2>

                    <div className="text-calibri-normal text-slate-500 text-xs space-y-0.5">
                      <p>Categoría: <span className="text-slate-700">{prod.category}</span></p>
                      <p>Ubicación: <span className="text-slate-700">{prod.location}</span></p>
                      <p className="font-semibold text-slate-800">
                        Valor ref.: ${prod.unit_price.toLocaleString('es-CL')} / {prod.unit}
                      </p>
                    </div>
                  </div>

                  {/* Acciones de Selección */}
                  <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between">
                    {inCart ? (
                      <div className="flex items-center gap-2 w-full justify-between">
                        <span className="text-calibri-normal text-slate-600 font-semibold">
                          Seleccionado:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => removeFromCart(prod.id)}
                            className="w-8 h-8 flex items-center justify-center bg-slate-200 hover:bg-slate-300 rounded text-slate-800 font-bold touch-target"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-7 text-center font-bold text-calibri-title text-sky-900">
                            {inCart.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => addToCart(prod)}
                            disabled={inCart.quantity >= prod.current_stock}
                            className="w-8 h-8 flex items-center justify-center bg-sky-700 hover:bg-sky-800 text-white rounded font-bold disabled:opacity-50 touch-target"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => addToCart(prod)}
                        disabled={isOutOfStock}
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-sky-700 hover:bg-sky-800 disabled:bg-slate-300 text-white rounded text-calibri-normal font-bold transition-colors touch-target shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                        {isOutOfStock ? 'No disponible' : 'Agregar al pedido'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Formulario de Resumen y Envío (Panel lateral) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-slate-300 shadow-sm p-4 sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-sky-700" />
                <h2 className="text-calibri-title text-slate-900">Lista del Pedido</h2>
              </div>
              <span className="text-calibri-normal bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-bold">
                {cart.reduce((s, i) => s + i.quantity, 0)} ítems
              </span>
            </div>

            {cart.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-calibri-normal font-medium">No has seleccionado insumos</p>
                <p className="text-calibri-normal text-slate-400 text-xs">
                  Haz clic en "Agregar al pedido" en los productos que necesitas.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Lista de Artículos Seleccionados */}
                <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-1">
                  {cart.map((item) => (
                    <div key={item.product.id} className="py-1.5 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-calibri-normal font-semibold text-slate-800 truncate">
                          {item.product.name}
                        </p>
                        <p className="text-calibri-normal text-slate-500 text-xs">
                          {item.quantity} x ${item.product.unit_price.toLocaleString('es-CL')} = $
                          {(item.quantity * item.product.unit_price).toLocaleString('es-CL')}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-xs"
                        >
                          -
                        </button>
                        <span className="w-5 text-center text-calibri-normal font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => addToCart(item.product)}
                          disabled={item.quantity >= item.product.current_stock}
                          className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-xs disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotal Estimado */}
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                  <span className="text-calibri-normal text-slate-600 font-semibold">Costo Total Estimado:</span>
                  <span className="text-calibri-title text-sky-900 font-bold">
                    ${totalEstimatedCost.toLocaleString('es-CL')}
                  </span>
                </div>

                {/* Centro de Costo Imputable */}
                <div>
                  <label className="block text-calibri-normal font-bold text-slate-700 mb-1">
                    Centro de Costos Imputable:
                  </label>
                  <select
                    value={costCenterId}
                    onChange={(e) => setCostCenterId(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-calibri-normal text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-sky-600"
                  >
                    {costCenters.map((cc) => (
                      <option key={cc.id} value={cc.id}>
                        {cc.code} - {cc.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Prioridad y Orden de Trabajo */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-calibri-normal font-bold text-slate-700 mb-1">
                      Prioridad:
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as 'Normal' | 'Urgente')}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded text-calibri-normal text-slate-800 bg-white"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Urgente">Urgente (Faena)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-calibri-normal font-bold text-slate-700 mb-1">
                      N° Orden Trabajo:
                    </label>
                    <input
                      type="text"
                      value={workOrder}
                      onChange={(e) => setWorkOrder(e.target.value)}
                      placeholder="Ej: OT-4915"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-calibri-normal"
                    />
                  </div>
                </div>

                {/* Justificación o Motivo */}
                <div>
                  <label className="block text-calibri-normal font-bold text-slate-700 mb-1">
                    Motivo / Justificación faena: *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Detalla para qué labor se ocuparán estos insumos..."
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-calibri-normal text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-600"
                  />
                </div>

                {/* Botones de Envío */}
                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-sky-700 hover:bg-sky-800 text-white rounded text-calibri-title shadow-sm transition-colors touch-target font-bold"
                  >
                    <Send className="w-4 h-4" />
                    {isSubmitting ? 'Enviando...' : 'Enviar Solicitud al Supervisor'}
                  </button>
                  <button
                    type="button"
                    onClick={clearCart}
                    className="w-full py-1 text-calibri-normal text-slate-500 hover:text-slate-700 text-center"
                  >
                    Vaciar lista
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

