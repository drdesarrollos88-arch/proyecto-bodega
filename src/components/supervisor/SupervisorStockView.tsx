import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { store } from '../../services/store';
import { Package, Search, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '../common/Badge';

export const SupervisorStockView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(() => store.getProducts());
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('todos');

  useEffect(() => {
    return store.subscribe(() => setProducts(store.getProducts()));
  }, []);

  const filtered = products.filter((p) => {
    const matchesCat = category === 'todos' || p.category === category;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-sm">
        <h1 className="text-calibri-title text-slate-900 flex items-center gap-2">
          <Package className="w-5 h-5 text-sky-700" />
          Consulta de Stock en Tiempo Real para Supervisión
        </h1>
        <p className="text-calibri-normal text-slate-600">
          Verifica la disponibilidad física en bodega antes de asignar órdenes de trabajo o autorizar cuadrillas.
        </p>
      </div>

      <div className="bg-white p-3 rounded-lg border border-slate-300 shadow-sm flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por insumo o código..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-calibri-normal focus:ring-1 focus:ring-sky-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 w-full sm:w-auto">
          {['todos', 'EPP', 'Herramientas Menores', 'Artículos de Oficina', 'Otros'].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-2.5 py-1 rounded text-calibri-normal border whitespace-nowrap ${
                category === c
                  ? 'bg-sky-700 text-white font-bold border-sky-800'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {c === 'todos' ? 'Todos' : c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((prod) => {
          const isOutOfStock = prod.current_stock <= 0;
          const isCritical = prod.current_stock <= prod.min_stock && !isOutOfStock;

          return (
            <div
              key={prod.id}
              className={`bg-white rounded-lg border p-3 flex flex-col justify-between ${
                isOutOfStock ? 'border-rose-300 bg-rose-50/20' : isCritical ? 'border-amber-300 bg-amber-50/20' : 'border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                    {prod.sku}
                  </span>
                  {isOutOfStock ? (
                    <Badge variant="danger">Sin Existencias</Badge>
                  ) : isCritical ? (
                    <Badge variant="warning">Stock Crítico ({prod.current_stock})</Badge>
                  ) : (
                    <Badge variant="success">Disponible ({prod.current_stock})</Badge>
                  )}
                </div>
                <h3 className="text-calibri-title text-slate-900 mt-1 mb-1">
                  {prod.name}
                </h3>
                <div className="text-xs text-slate-500 space-y-0.5">
                  <p>Ubicación: <strong className="text-slate-700">{prod.location}</strong></p>
                  <p>Stock Mínimo establecido: <strong className="text-slate-700">{prod.min_stock} {prod.unit}</strong></p>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Valor Unitario:</span>
                <strong className="text-slate-900">${prod.unit_price.toLocaleString('es-CL')} / {prod.unit}</strong>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
