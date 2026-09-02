import React, { useState, useEffect } from 'react';
import { Product, WarehouseRequest, CostCenter, ProductCategory } from '../../types';
import { store } from '../../services/store';
import { useAuth } from '../../context/AuthContext';
import { 
  Search, 
  Bell, 
  Package, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Minus, 
  Trash2, 
  Send, 
  MapPin, 
  HardHat, 
  AlertCircle,
  FileCheck,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Boxes
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface TechnicianPortalViewProps {
  onNavigateToReceipts?: () => void;
}

export const TechnicianPortalView: React.FC<TechnicianPortalViewProps> = ({ onNavigateToReceipts }) => {
  const { currentUser, activeUser } = useAuth();
  const user = activeUser || currentUser || store.getProfiles()[0];

  const [products, setProducts] = useState<Product[]>(() => store.getProducts());
  const [requests, setRequests] = useState<WarehouseRequest[]>(() => store.getRequests());
  const [costCenters, setCostCenters] = useState<CostCenter[]>(() => store.getCostCenters());

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  // Carrito rápido de solicitud
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [reason, setReason] = useState('Faena en terreno');
  const [workOrder, setWorkOrder] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    return store.subscribe(() => {
      setProducts(store.getProducts());
      setRequests(store.getRequests());
      setCostCenters(store.getCostCenters());
    });
  }, []);

  // Solicitudes del técnico
  const myRequests = requests.filter((r) => r.technician_id === user.id || r.technician_rut === user.rut);

  // 1. Notificaciones urgentes: Pedidos preparados por bodega listos para retiro inmediato
  const readyToPickUp = myRequests.filter((r) => r.status === 'lista_retiro');

  // 2. Pedidos autorizados por supervisor pero que bodega está preparando
  const approvedWaitingPrep = myRequests.filter((r) => r.status === 'aprobada');

  // 3. Pedidos en revisión inicial de supervisor
  const pendingRequests = myRequests.filter((r) => r.status === 'pendiente');

  // Filtro de productos
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      search.trim() === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'todos' || p.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product: Product) => {
    if (product.current_stock <= 0) return;
    setCart((prev) => {
      const exists = prev.find((item) => item.product.id === product.id);
      if (exists) {
        if (exists.quantity >= product.current_stock) return prev;
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.product.current_stock) return item;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as { product: Product; quantity: number }[];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsSubmitting(true);

    const items = cart.map((c) => ({
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      request_id: '',
      product_id: c.product.id,
      product_name: c.product.name,
      product_sku: c.product.sku,
      size: c.product.size,
      quantity: c.quantity,
      unit_price: c.product.unit_price,
      total_price: c.product.unit_price * c.quantity,
    }));

    const isJefe = user.role === 'jefe_seccion';
    const isStaff = user.role === 'supervisor' || user.role === 'bodeguero_admin';

    const newReq = store.createRequest({
      technician_id: user.id,
      technician_name: user.name,
      technician_rut: user.rut,
      cost_center_id: user.cost_center_id || 'CC-101',
      work_order: workOrder.trim() || undefined,
      reason: reason.trim() || (isStaff ? 'Insumos operativos solicitados por ' + user.name : 'Trabajo en terreno'),
      priority: 'Normal',
      requested_by_role: user.role,
      approver_role: isJefe ? 'jefe_seccion' : (isStaff ? 'jefe_seccion' : 'supervisor'),
      items,
    });

    if (isJefe) {
      // Auto-aprobación directa para el Jefe de Sección
      store.updateRequestStatus(
        newReq.id,
        'aprobada',
        user.id,
        user.name,
        'Auto-autorizado por Jefe de Sección'
      );
      setSuccessToast(`¡Solicitud ${newReq.id} auto-autorizada! Se envió a Bodega Central para su preparación.`);
    } else if (isStaff) {
      setSuccessToast(`¡Solicitud ${newReq.id} enviada al Jefe de Sección para su autorización!`);
    } else {
      setSuccessToast(`¡Solicitud ${newReq.id} enviada a tu supervisor! Te avisaremos apenas la autorice.`);
    }

    setIsSubmitting(false);
    setCart([]);
    setTimeout(() => setSuccessToast(null), 4500);
  };

  const customCategories = store.getCustomCategories();
  const categories: { id: string; label: string }[] = [
    { id: 'todos', label: 'Todos los Artículos' },
    { id: 'EPP', label: 'EPP y Seguridad' },
    { id: 'Herramientas Menores', label: 'Herramientas' },
    { id: 'Artículos de Oficina', label: 'Oficina' },
    ...customCategories.map((c) => ({ id: c, label: c })),
    { id: 'Otros', label: 'Otros Insumos' },
  ];

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-24">
      {/* Toast de Éxito */}
      {successToast && (
        <div className="p-3 bg-emerald-700 text-white rounded-lg shadow-lg flex items-center gap-2 animate-fade-in text-calibri-title text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* =========================================================================
          1. ZONA DE NOTIFICACIONES AGRUPADAS (ORDENADAS: PENDIENTES ARRIBA, RETIROS ABAJO)
      ========================================================================= */}

      {/* TARJETA 1: SOLICITUDES PENDIENTES DE AUTORIZACIÓN (SIEMPRE AGRUPADAS EN UNA SOLA TARJETA) */}
      {pendingRequests.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 text-amber-900 rounded-xl shadow-sm p-3.5 space-y-2.5">
          <div className="flex items-center justify-between border-b border-amber-200 pb-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-full bg-amber-200 text-amber-900">
                <Clock className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-calibri-title text-amber-950 text-sm font-bold leading-none">
                  Pendiente de Autorización ({pendingRequests.length} solicitud{pendingRequests.length > 1 ? 'es' : ''})
                </h2>
                <span className="text-calibri-normal text-amber-800 text-xs">
                  Tu supervisor está verificando el stock en bodega para autorizar el retiro.
                </span>
              </div>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold">
              En Revisión
            </span>
          </div>

          <div className="space-y-1.5">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white p-2.5 rounded-lg border border-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1.5"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-900">{req.id}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-700 font-medium truncate">
                      {req.items.map((i) => `${i.quantity}x ${i.product_name}`).join(', ')}
                    </span>
                  </div>
                  <span className="text-slate-500 block mt-0.5">
                    Motivo: {req.reason} {req.work_order ? `• OT: ${req.work_order}` : ''}
                  </span>
                </div>
                <span className="text-slate-400 text-right whitespace-nowrap text-xs">
                  {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hrs
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TARJETA 2: EN PREPARACIÓN POR BODEGA (AUTORIZADO, ESPERANDO AVISO DEL BODEGUERO) */}
      {approvedWaitingPrep.length > 0 && (
        <div className="bg-sky-50 border-2 border-sky-300 text-sky-900 rounded-xl shadow-sm p-3.5 space-y-2.5">
          <div className="flex items-center justify-between border-b border-sky-200 pb-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-full bg-sky-200 text-sky-900 animate-pulse">
                <Boxes className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-calibri-title text-sky-950 text-sm font-bold leading-none">
                  En Preparación por Bodega ({approvedWaitingPrep.length} pedido{approvedWaitingPrep.length > 1 ? 's' : ''})
                </h2>
                <span className="text-calibri-normal text-sky-800 text-xs">
                  Tu supervisor ya autorizó la solicitud. El personal de bodega está preparando tus artículos y te notificará apenas estén listos.
                </span>
              </div>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-sky-200 text-sky-900 font-bold">
              Preparando Materiales
            </span>
          </div>

          <div className="space-y-1.5">
            {approvedWaitingPrep.map((req) => (
              <div
                key={req.id}
                className="bg-white p-2.5 rounded-lg border border-sky-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1.5"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sky-900">{req.id}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-700 font-medium truncate">
                      {req.items.map((i) => `${i.quantity}x ${i.product_name}`).join(', ')}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Autorizado por {req.supervisor_name || 'Supervisor'} • Espera el aviso de bodega antes de acudir al mesón.
                  </p>
                </div>
                <span className="text-slate-500 font-medium">⏳ Bodega Central</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TARJETA 3: AUTORIZADOS Y PREPARADOS LISTOS PARA RETIRO EN MESÓN */}
      {readyToPickUp.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 rounded-xl shadow-md space-y-2.5 animate-pulse-subtle">
          <div className="flex items-center justify-between border-b border-emerald-500/60 pb-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-full bg-white text-emerald-800 font-bold shadow animate-bounce">
                <Bell className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-calibri-title text-white text-sm font-bold leading-none">
                  ¡Listos para Retiro en Mesón! ({readyToPickUp.length} pedido{readyToPickUp.length > 1 ? 's' : ''})
                </h2>
                <p className="text-calibri-normal text-emerald-100 text-xs mt-0.5">
                  El personal de bodega ya preparó tus insumos. Puedes acercarte a retirar con tu firma digital.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 bg-white text-emerald-900 rounded-full text-xs font-bold shadow-sm">
              ✓ Disponible en Mesón
            </span>
          </div>

          <div className="space-y-1.5">
            {readyToPickUp.map((req) => (
              <div
                key={req.id}
                className="bg-white text-slate-800 p-2.5 rounded-lg border border-emerald-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-800">{req.id}</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold text-xs">
                      Preparado por {req.prepared_by_name || 'Personal de Bodega'}
                    </span>
                    {req.ready_for_pickup_at && (
                      <span className="text-slate-400 text-[11px]">
                        ({new Date(req.ready_for_pickup_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-slate-700 font-medium truncate">
                    <strong>Insumos:</strong> {req.items.map((i) => `${i.quantity}x ${i.product_name}`).join(', ')}
                  </div>
                  {req.supervisor_notes && (
                    <p className="text-slate-500 italic mt-0.5">
                      "{req.supervisor_notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded font-bold">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" /> Mesón Bodega Principal
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          2. BUSCADOR RÁPIDO DE INSUMOS (MOBILE FIRST)
      ========================================================================= */}
      <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 pb-2">
          <div>
            <h1 className="text-calibri-title text-slate-900 text-base font-bold flex items-center gap-1.5">
              <HardHat className="w-5 h-5 text-sky-700" />
              Buscador Rápido de Materiales y Herramientas
            </h1>
            <p className="text-calibri-normal text-slate-500 text-xs">
              Escribe lo que necesitas y agrégalo al pedido con un toque.
            </p>
          </div>
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
            Técnico: <strong>{user.name}</strong> ({user.cost_center_id})
          </span>
        </div>

        {/* Barra de Búsqueda Grande */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-3 text-sky-700" />
          <input
            type="text"
            placeholder="Buscar por nombre (ej: casco, guantes, multímetro, cinta, toner)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-2 border-slate-300 hover:border-sky-500 focus:border-sky-600 focus:bg-white rounded-lg text-calibri-normal text-slate-900 font-medium focus:outline-none transition-all placeholder:text-slate-400"
            autoFocus
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Categorías Rápidas en Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((c) => {
            const isSelected = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors touch-target ${
                  isSelected
                    ? 'bg-sky-700 text-white font-bold shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Lista de Resultados Simplificada */}
        <div className="divide-y divide-slate-200 mt-2">
          {filteredProducts.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-calibri-normal">
              No se encontraron insumos con "{search}". Intenta con otra palabra.
            </div>
          ) : (
            filteredProducts.map((p) => {
              const inCart = cart.find((i) => i.product.id === p.id);
              const isOutOfStock = p.current_stock <= 0;

              return (
                <div
                  key={p.id}
                  className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-lg transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-sky-800 font-bold">{p.sku}</span>
                      <strong className="text-calibri-normal text-slate-900 truncate block">
                        {p.name}
                      </strong>
                      {p.size && (
                        <span className="px-1.5 py-0.2 rounded bg-sky-100 text-sky-900 border border-sky-300 font-bold text-[10px] whitespace-nowrap">
                          Talla: {p.size}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span>Cat: {p.category}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" /> {p.location}
                      </span>
                      <span>•</span>
                      <span
                        className={`font-bold ${
                          isOutOfStock
                            ? 'text-rose-600'
                            : p.current_stock <= p.min_stock
                            ? 'text-amber-600'
                            : 'text-emerald-700'
                        }`}
                      >
                        {isOutOfStock ? 'Sin stock' : `Stock: ${p.current_stock} ${p.unit}`}
                      </span>
                    </div>
                  </div>

                  {/* Acciones de Pedido */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {inCart ? (
                      <div className="flex items-center gap-1.5 bg-sky-50 border border-sky-300 rounded-lg p-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(p.id, -1)}
                          className="w-7 h-7 flex items-center justify-center rounded bg-white text-slate-700 hover:bg-slate-100 shadow-sm border border-slate-300"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center font-bold text-sky-900 text-xs font-mono">
                          {inCart.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(p.id, 1)}
                          disabled={inCart.quantity >= p.current_stock}
                          className="w-7 h-7 flex items-center justify-center rounded bg-white text-slate-700 hover:bg-slate-100 shadow-sm border border-slate-300 disabled:opacity-40"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAddToCart(p)}
                        disabled={isOutOfStock}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-sky-700 hover:bg-sky-800 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-calibri-normal font-bold shadow-sm transition-colors touch-target text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" /> Pedir
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* =========================================================================
          3. BARRA FLOTANTE / INFERIOR DE CONFIRMACIÓN (SOLO CUANDO HAY ITEMS)
      ========================================================================= */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-sky-600 shadow-2xl p-3 sm:p-4">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sky-100 border border-sky-300 flex items-center justify-center text-sky-800 font-bold font-mono">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </div>
              <div className="min-w-0">
                <span className="text-calibri-title text-slate-900 text-sm font-bold block leading-none">
                  {cart.length} artículo(s) seleccionados para pedir
                </span>
                <span className="text-xs text-slate-500 truncate block mt-1">
                  {cart.map((i) => `${i.quantity}x ${i.product.name}`).join(' • ')}
                </span>
              </div>
            </div>

            <form onSubmit={handleSendRequest} className="flex items-center gap-2 flex-shrink-0">
              <input
                type="text"
                placeholder="Motivo (ej: OT-104 / Faena)"
                value={workOrder}
                onChange={(e) => setWorkOrder(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded text-xs text-slate-800 w-36 sm:w-44 focus:outline-none focus:ring-1 focus:ring-sky-700"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-lg text-calibri-normal shadow-md touch-target text-xs transition-transform active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Solicitar al Supervisor</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

