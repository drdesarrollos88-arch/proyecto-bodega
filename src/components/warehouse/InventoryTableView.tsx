import React, { useState, useEffect } from 'react';
import { Product, ProductCategory } from '../../types';
import { store } from '../../services/store';
import { 
  Package, 
  Search, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  ArrowDownCircle, 
  PlusCircle, 
  ShoppingCart, 
  X,
  Check,
  Tag,
  Ruler
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface InventoryTableViewProps {
  onGoToPurchaseOrder?: (product: Product) => void;
}

export const InventoryTableView: React.FC<InventoryTableViewProps> = ({ onGoToPurchaseOrder }) => {
  const [products, setProducts] = useState<Product[]>(() => store.getProducts());
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyCritical, setOnlyCritical] = useState(false);

  // Modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [stockAdjustProduct, setStockAdjustProduct] = useState<Product | null>(null);
  const [adjustQuantity, setAdjustQuantity] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState<string>('Entrada de recepción de proveedor');

  // Formulario de nuevo producto
  const [newSku, setNewSku] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<ProductCategory>('EPP');
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [newSize, setNewSize] = useState('');
  const [newUnit, setNewUnit] = useState('unidad');
  const [newStock, setNewStock] = useState(10);
  const [newMinStock, setNewMinStock] = useState(5);
  const [newPrice, setNewPrice] = useState(10000);
  const [newLocation, setNewLocation] = useState('Pasillo 1 - Estante A1');

  // Categorías personalizadas registradas
  const [customCategories, setCustomCategories] = useState<string[]>(() => store.getCustomCategories());

  useEffect(() => {
    return store.subscribe(() => {
      setProducts(store.getProducts());
      setCustomCategories(store.getCustomCategories());
    });
  }, []);

  const matchingCategories = customCategories.filter(
    (c) =>
      c.toLowerCase().includes(customCategoryInput.toLowerCase().trim()) &&
      c.toLowerCase() !== 'otros'
  );

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'todos' ||
      p.category === selectedCategory ||
      p.custom_category === selectedCategory;

    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.size && p.size.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.custom_category && p.custom_category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCritical = !onlyCritical || p.current_stock <= p.min_stock;
    return matchesCategory && matchesSearch && matchesCritical;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSku || !newName) return;

    const isOther = newCategory === 'Otros';
    const finalCategoryName = isOther && customCategoryInput.trim() ? customCategoryInput.trim() : newCategory;

    if (isOther && customCategoryInput.trim()) {
      store.saveCustomCategory(customCategoryInput.trim());
    }

    store.addProduct({
      sku: newSku.toUpperCase().trim(),
      name: newName.trim(),
      category: finalCategoryName,
      custom_category: isOther ? customCategoryInput.trim() : undefined,
      size: newSize.trim() || undefined,
      unit: newUnit.trim(),
      current_stock: Number(newStock),
      min_stock: Number(newMinStock),
      unit_price: Number(newPrice),
      location: newLocation.trim(),
    });

    setShowAddModal(false);
    setNewSku('');
    setNewName('');
    setNewCategory('EPP');
    setCustomCategoryInput('');
    setNewSize('');
    setNewStock(10);
    setNewMinStock(5);
    setNewPrice(10000);
  };

  const handleAdjustStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockAdjustProduct) return;

    const newStockVal = stockAdjustProduct.current_stock + Number(adjustQuantity);
    store.updateProduct(stockAdjustProduct.id, {
      current_stock: Math.max(0, newStockVal),
    });

    setStockAdjustProduct(null);
  };

  const criticalCount = products.filter((p) => p.current_stock <= p.min_stock).length;

  return (
    <div className="space-y-4">
      {/* Cabecera */}
      <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-calibri-title text-slate-900">
            Inventario General de Bodega y Control de Existencias
          </h1>
          <p className="text-calibri-normal text-slate-600">
            Catálogo completo de insumos, ubicaciones físicas, stock mínimo y semáforo de niveles críticos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded text-calibri-normal font-bold shadow-sm transition-colors touch-target"
          >
            <Plus className="w-4 h-4" /> Registrar Nuevo Artículo
          </button>
        </div>
      </div>

      {/* Filtros, Búsqueda y Alerta Crítica */}
      <div className="bg-white p-3 rounded-lg border border-slate-300 shadow-sm space-y-2.5">
        <div className="flex flex-col md:flex-row items-center gap-2.5 justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por código SKU, nombre o ubicación física..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-calibri-normal focus:outline-none focus:ring-1 focus:ring-sky-600"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={() => setOnlyCritical(!onlyCritical)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-calibri-normal border transition-colors ${
                onlyCritical
                  ? 'bg-rose-700 text-white font-bold border-rose-800'
                  : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Ver sólo Stock Crítico ({criticalCount})</span>
            </button>
          </div>
        </div>

        {/* Categorías */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'todos', label: 'Todas las Categorías' },
            { id: 'EPP', label: 'EPP' },
            { id: 'Herramientas Menores', label: 'Herramientas Menores' },
            { id: 'Artículos de Oficina', label: 'Artículos de Oficina' },
            ...customCategories.map((c) => ({ id: c, label: c })),
            { id: 'Otros', label: 'Otros Insumos' },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-2.5 py-1 rounded text-calibri-normal whitespace-nowrap border ${
                selectedCategory === c.id
                  ? 'bg-sky-700 text-white font-bold border-sky-800'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de Existencias */}
      <div className="bg-white rounded-lg border border-slate-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-calibri-normal">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-xs font-bold border-b border-slate-300">
                <th className="p-2.5">Código SKU</th>
                <th className="p-2.5">Nombre del Artículo</th>
                <th className="p-2.5">Categoría</th>
                <th className="p-2.5 text-center">Stock Actual</th>
                <th className="p-2.5 text-center">Stock Mínimo</th>
                <th className="p-2.5 text-center">Semáforo de Estado</th>
                <th className="p-2.5">Ubicación Bodega</th>
                <th className="p-2.5 text-right">Precio Unitario</th>
                <th className="p-2.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredProducts.map((prod) => {
                const isOutOfStock = prod.current_stock <= 0;
                const isCritical = prod.current_stock <= prod.min_stock && !isOutOfStock;

                return (
                  <tr
                    key={prod.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      isOutOfStock ? 'bg-rose-50/50' : isCritical ? 'bg-amber-50/40' : ''
                    }`}
                  >
                    <td className="p-2.5 font-mono text-xs font-bold text-sky-800">{prod.sku}</td>
                    <td className="p-2.5 font-medium text-slate-900">
                      {prod.name}
                      {prod.size && (
                        <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[11px] font-bold bg-sky-100 text-sky-900 border border-sky-300">
                          <Ruler className="w-3 h-3 text-sky-700" /> Talla: {prod.size}
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 text-slate-600 text-xs font-semibold">
                      {prod.custom_category || prod.category}
                    </td>
                    <td className="p-2.5 text-center font-bold text-calibri-title text-slate-900">
                      {prod.current_stock} <span className="text-xs font-normal text-slate-500">{prod.unit}</span>
                    </td>
                    <td className="p-2.5 text-center text-slate-500 text-xs font-semibold">
                      {prod.min_stock} {prod.unit}
                    </td>
                    <td className="p-2.5 text-center">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-800 bg-rose-100 border border-rose-200 px-2 py-0.5 rounded">
                          <XCircle className="w-3 h-3 text-rose-600" /> Agotado
                        </span>
                      ) : isCritical ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded">
                          <AlertTriangle className="w-3 h-3 text-amber-600" /> Nivel Crítico
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Normal
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 text-slate-600 text-xs">{prod.location}</td>
                    <td className="p-2.5 text-right font-semibold text-slate-800">
                      ${prod.unit_price.toLocaleString('es-CL')}
                    </td>
                    <td className="p-2.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setStockAdjustProduct(prod)}
                          className="p-1 text-sky-700 hover:text-sky-900 hover:bg-sky-50 rounded"
                          title="Ajustar stock o entrada de insumos"
                        >
                          <ArrowDownCircle className="w-4 h-4" />
                        </button>
                        {(isOutOfStock || isCritical) && onGoToPurchaseOrder && (
                          <button
                            type="button"
                            onClick={() => onGoToPurchaseOrder(prod)}
                            className="p-1 text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded"
                            title="Solicitar compra a proveedor"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Ajuste / Entrada de Stock */}
      {stockAdjustProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md border border-slate-300 overflow-hidden">
            <div className="p-3 bg-slate-800 text-white flex items-center justify-between">
              <h2 className="text-calibri-title text-white">
                Ingreso / Ajuste de Stock ({stockAdjustProduct.sku})
              </h2>
              <button onClick={() => setStockAdjustProduct(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdjustStockSubmit} className="p-4 space-y-3">
              <p className="text-calibri-normal text-slate-700 font-semibold">
                {stockAdjustProduct.name}
              </p>
              <div className="p-2 bg-slate-50 border rounded text-xs text-slate-600">
                Stock actual: <strong>{stockAdjustProduct.current_stock} {stockAdjustProduct.unit}</strong> | Ubicación: <strong>{stockAdjustProduct.location}</strong>
              </div>
              <div>
                <label className="block text-calibri-normal font-bold text-slate-700 mb-1">
                  Cantidad a ingresar (o restar con signo negativo):
                </label>
                <input
                  type="number"
                  required
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-calibri-title font-bold text-sky-800"
                />
              </div>
              <div>
                <label className="block text-calibri-normal font-bold text-slate-700 mb-1">
                  Motivo del ajuste:
                </label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-calibri-normal"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setStockAdjustProduct(null)}
                  className="px-3 py-1.5 border rounded text-calibri-normal text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded text-calibri-normal"
                >
                  Confirmar Ingreso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Nuevo Producto */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg border border-slate-300 overflow-hidden my-6">
            <div className="p-3 bg-sky-800 text-white flex items-center justify-between">
              <h2 className="text-calibri-title text-white">Registrar Nuevo Artículo en Bodega</h2>
              <button onClick={() => setShowAddModal(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateProduct} className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-calibri-normal font-bold text-slate-700 mb-1">
                    Código SKU: *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: EPP-008"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-calibri-normal font-mono"
                  />
                </div>
                <div>
                  <label className="block text-calibri-normal font-bold text-slate-700 mb-1">
                    Categoría:
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => {
                      const val = e.target.value as ProductCategory;
                      setNewCategory(val);
                      if (val !== 'Otros') {
                        setCustomCategoryInput('');
                        setShowCategorySuggestions(false);
                      }
                    }}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-calibri-normal bg-white"
                  >
                    <option value="EPP">EPP</option>
                    <option value="Herramientas Menores">Herramientas Menores</option>
                    <option value="Artículos de Oficina">Artículos de Oficina</option>
                    {customCategories
                      .filter((c) => !['EPP', 'Herramientas Menores', 'Artículos de Oficina', 'Otros'].includes(c))
                      .map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    <option value="Otros">Otros (Especificar con Buscador)</option>
                  </select>
                </div>
              </div>

              {/* Buscador y Especificación de Categoría "Otros" */}
              {newCategory === 'Otros' && (
                <div className="p-3 bg-sky-50 border-2 border-sky-300 rounded-lg space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-sky-950 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-sky-700" />
                      Especificar a qué se refiere la categoría "Otros": *
                    </label>
                    <span className="text-[10px] bg-sky-200 text-sky-900 px-2 py-0.5 rounded font-bold">
                      Buscador de Referencia Activo
                    </span>
                  </div>

                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-sky-600" />
                    <input
                      type="text"
                      required
                      placeholder="Escribe para buscar o definir categoría (ej: Ferretería, Cables, Pinturas...)"
                      value={customCategoryInput}
                      onChange={(e) => {
                        setCustomCategoryInput(e.target.value);
                        setShowCategorySuggestions(true);
                      }}
                      onFocus={() => setShowCategorySuggestions(true)}
                      className="w-full pl-8 pr-3 py-1.5 border border-sky-300 rounded text-calibri-normal text-xs bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                    />
                  </div>

                  {/* Resultados sugeridos del buscador en vivo */}
                  {showCategorySuggestions && customCategoryInput.trim() && (
                    <div className="bg-white border border-sky-200 rounded shadow-md overflow-hidden text-xs max-h-36 overflow-y-auto">
                      {matchingCategories.length > 0 ? (
                        <div>
                          <div className="px-2.5 py-1 bg-sky-100/70 text-[10px] font-bold text-sky-900 uppercase flex items-center justify-between">
                            <span>Coincidencias guardadas en el sistema:</span>
                            <span className="text-slate-500 font-normal">Haz clic para reutilizarla</span>
                          </div>
                          {matchingCategories.map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => {
                                setCustomCategoryInput(cat);
                                setShowCategorySuggestions(false);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-sky-50 text-slate-800 flex items-center justify-between border-b border-slate-100 last:border-none transition-colors"
                            >
                              <span className="font-semibold">{cat}</span>
                              <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-bold">
                                Seleccionar
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-2 text-emerald-800 bg-emerald-50 text-[11px] flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span>
                            No hay coincidencias previas. Se creará <strong>"{customCategoryInput.trim()}"</strong> y quedará guardada como referencia para futuros artículos.
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-calibri-normal font-bold text-slate-700 mb-1">
                  Nombre descriptivo del Artículo: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Barbiquejo para Casco con Mentonera Silicona"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-calibri-normal"
                />
              </div>

              {/* Selector de Talla / Calzado / Medida */}
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-calibri-normal font-bold text-slate-700 text-xs flex items-center gap-1">
                    <Ruler className="w-3.5 h-3.5 text-sky-700" />
                    Talla / Medida / Calzado (Para ropa o zapatos):
                  </label>
                  <span className="text-[10px] text-slate-500 font-medium">Opcional</span>
                </div>
                <input
                  type="text"
                  placeholder="Ej: S, M, L, XL, 41, 42, Estándar..."
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-calibri-normal text-xs bg-white font-medium"
                />
                <div className="flex flex-wrap items-center gap-1 pt-1">
                  <span className="text-[10px] text-slate-400 font-bold mr-1">Tallas frecuentes:</span>
                  {['S', 'M', 'L', 'XL', 'XXL', '38', '39', '40', '41', '42', '43', '44', 'Estándar', 'N/A'].map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setNewSize(sz === newSize ? '' : sz)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                        newSize === sz
                          ? 'bg-sky-700 text-white border-sky-800 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-calibri-normal font-bold text-slate-700 mb-1">
                    Unidad de Medida:
                  </label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="unidad, par, caja..."
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-calibri-normal"
                  />
                </div>
                <div>
                  <label className="block text-calibri-normal font-bold text-slate-700 mb-1">
                    Stock Inicial:
                  </label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-calibri-normal"
                  />
                </div>
                <div>
                  <label className="block text-calibri-normal font-bold text-slate-700 mb-1">
                    Stock Mínimo:
                  </label>
                  <input
                    type="number"
                    value={newMinStock}
                    onChange={(e) => setNewMinStock(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-calibri-normal"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-calibri-normal font-bold text-slate-700 mb-1">
                    Precio Unitario ($ CLP):
                  </label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-calibri-normal"
                  />
                </div>
                <div>
                  <label className="block text-calibri-normal font-bold text-slate-700 mb-1">
                    Ubicación en Bodega:
                  </label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Pasillo 1 - Estante A2"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-calibri-normal"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border rounded text-calibri-normal text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded text-calibri-normal"
                >
                  Guardar Artículo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

