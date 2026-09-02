import React, { useState, useEffect } from 'react';
import { UserProfile, CostCenter, Product, UserRole, ProductCategory } from '../../types';
import { store } from '../../services/store';
import { useAuth } from '../../context/AuthContext';
import { 
  Crown, 
  Users, 
  DollarSign, 
  Package, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  ShieldCheck, 
  Database, 
  RotateCcw, 
  Check, 
  X, 
  Search, 
  Layers 
} from 'lucide-react';
import { Badge } from '../common/Badge';

export const SuperadminDashboard: React.FC = () => {
  const { allUsers, startEmulation } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>(allUsers);
  const [costCenters, setCostCenters] = useState<CostCenter[]>(() => store.getCostCenters());
  const [products, setProducts] = useState<Product[]>(() => store.getProducts());

  const [activeTab, setActiveTab] = useState<'usuarios' | 'centros_costo' | 'catalogo' | 'sistema'>('usuarios');
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Modales de Usuarios
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [userName, setUserName] = useState('');
  const [userRut, setUserRut] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('tecnico');
  const [userCC, setUserCC] = useState('CC-101');
  const [userPassword, setUserPassword] = useState('123456');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');

  // Modales de Centros de Costo
  const [showCCModal, setShowCCModal] = useState(false);
  const [editingCC, setEditingCC] = useState<CostCenter | null>(null);
  const [ccCode, setCcCode] = useState('');
  const [ccName, setCcName] = useState('');
  const [ccArea, setCcArea] = useState('Área de Telecomunicaciones y Redes');
  const [ccBudget, setCcBudget] = useState(10000000);

  // Modales de Productos
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodSku, setProdSku] = useState('');
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState<ProductCategory>('EPP');
  const [prodUnit, setProdUnit] = useState('unidad');
  const [prodStock, setProdStock] = useState(10);
  const [prodMinStock, setProdMinStock] = useState(5);
  const [prodPrice, setProdPrice] = useState(5000);
  const [prodLocation, setProdLocation] = useState('Pasillo 1 - Estante A1');

  useEffect(() => {
    return store.subscribe(() => {
      setUsers(store.getProfiles());
      setCostCenters(store.getCostCenters());
      setProducts(store.getProducts());
    });
  }, []);

  const notify = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  // --- ACCIONES DE USUARIO ---
  const handleOpenUserModal = (u?: UserProfile) => {
    if (u) {
      setEditingUser(u);
      setUserName(u.name);
      setUserRut(u.rut);
      setUserRole(u.role);
      setUserCC(u.cost_center_id);
      setUserPassword(u.password || '123456');
      setUserEmail(u.email || '');
      setUserPhone(u.phone || '');
    } else {
      setEditingUser(null);
      setUserName('');
      setUserRut('');
      setUserRole('tecnico');
      setUserCC(costCenters[0]?.id || 'CC-101');
      setUserPassword('123456');
      setUserEmail('');
      setUserPhone('');
    }
    setShowUserModal(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userRut) return;

    if (editingUser) {
      store.updateUser(editingUser.id, {
        name: userName.trim(),
        rut: userRut.trim(),
        role: userRole,
        cost_center_id: userCC,
        password: userPassword.trim() || '123456',
        email: userEmail.trim() || undefined,
        phone: userPhone.trim() || undefined,
      });
      notify(`Usuario ${userName} actualizado correctamente.`);
    } else {
      store.addUser({
        name: userName.trim(),
        rut: userRut.trim(),
        role: userRole,
        cost_center_id: userCC,
        password: userPassword.trim() || '123456',
        email: userEmail.trim() || undefined,
        phone: userPhone.trim() || undefined,
      });
      notify(`Nuevo usuario ${userName} creado correctamente.`);
    }
    setShowUserModal(false);
  };

  const handleDeleteUser = (u: UserProfile) => {
    if (u.role === 'superadmin' && users.filter((x) => x.role === 'superadmin').length <= 1) {
      alert('No puedes eliminar al único Superadmin del sistema.');
      return;
    }
    if (confirm(`¿Seguro que deseas eliminar al usuario ${u.name}?`)) {
      store.deleteUser(u.id);
      notify(`Usuario ${u.name} eliminado.`);
    }
  };

  // --- ACCIONES DE CENTRO DE COSTO ---
  const handleOpenCCModal = (cc?: CostCenter) => {
    if (cc) {
      setEditingCC(cc);
      setCcCode(cc.code);
      setCcName(cc.name);
      setCcArea(cc.area);
      setCcBudget(Number(cc.assigned_budget));
    } else {
      setEditingCC(null);
      setCcCode('CC-' + (100 + costCenters.length + 1));
      setCcName('');
      setCcArea('Área de Telecomunicaciones y Redes');
      setCcBudget(10000000);
    }
    setShowCCModal(true);
  };

  const handleSaveCC = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ccCode || !ccName) return;

    if (editingCC) {
      store.updateCostCenter(editingCC.id, {
        code: ccCode.trim().toUpperCase(),
        name: ccName.trim(),
        area: ccArea.trim(),
        assigned_budget: Number(ccBudget),
      });
      notify(`Centro de Costos ${ccCode} modificado.`);
    } else {
      store.addCostCenter({
        code: ccCode.trim().toUpperCase(),
        name: ccName.trim(),
        area: ccArea.trim(),
        assigned_budget: Number(ccBudget),
        executed_budget: 0,
      });
      notify(`Nuevo Centro de Costos ${ccCode} creado con éxito.`);
    }
    setShowCCModal(false);
  };

  const handleDeleteCC = (cc: CostCenter) => {
    if (confirm(`¿Seguro que deseas eliminar el Centro de Costos ${cc.code} - ${cc.name}?`)) {
      store.deleteCostCenter(cc.id);
      notify(`Centro de Costos ${cc.code} eliminado.`);
    }
  };

  // --- ACCIONES DE PRODUCTOS ---
  const handleOpenProductModal = (p?: Product) => {
    if (p) {
      setEditingProduct(p);
      setProdSku(p.sku);
      setProdName(p.name);
      setProdCategory(p.category);
      setProdUnit(p.unit);
      setProdStock(p.current_stock);
      setProdMinStock(p.min_stock);
      setProdPrice(p.unit_price);
      setProdLocation(p.location);
    } else {
      setEditingProduct(null);
      setProdSku('');
      setProdName('');
      setProdCategory('EPP');
      setProdUnit('unidad');
      setProdStock(10);
      setProdMinStock(5);
      setProdPrice(5000);
      setProdLocation('Pasillo 1 - Estante A1');
    }
    setShowProductModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodSku || !prodName) return;

    if (editingProduct) {
      store.updateProduct(editingProduct.id, {
        sku: prodSku.trim().toUpperCase(),
        name: prodName.trim(),
        category: prodCategory,
        unit: prodUnit.trim(),
        current_stock: Number(prodStock),
        min_stock: Number(prodMinStock),
        unit_price: Number(prodPrice),
        location: prodLocation.trim(),
      });
      notify(`Artículo ${prodSku} actualizado.`);
    } else {
      store.addProduct({
        sku: prodSku.trim().toUpperCase(),
        name: prodName.trim(),
        category: prodCategory,
        unit: prodUnit.trim(),
        current_stock: Number(prodStock),
        min_stock: Number(prodMinStock),
        unit_price: Number(prodPrice),
        location: prodLocation.trim(),
      });
      notify(`Artículo ${prodSku} registrado en bodega.`);
    }
    setShowProductModal(false);
  };

  const handleDeleteProduct = (p: Product) => {
    if (confirm(`¿Seguro que deseas eliminar ${p.sku} - ${p.name}?`)) {
      store.deleteProduct(p.id);
      notify(`Artículo ${p.sku} eliminado del inventario.`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Feedback Message */}
      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-emerald-800 text-calibri-normal font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-900 text-white p-4 rounded-lg shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-400">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-calibri-title text-white text-base">
              PANEL DE CONTROL STAFF / SUPERADMIN
            </h1>
            <p className="text-calibri-normal text-slate-300 text-xs">
              Administración de usuarios, centros de costo, presupuesto y catálogo maestro desde la interfaz
            </p>
          </div>
        </div>

        {/* Pestañas de Gestión Superadmin */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-md border border-slate-700 overflow-x-auto">
          <button
            onClick={() => setActiveTab('usuarios')}
            className={`px-3 py-1 rounded text-calibri-normal whitespace-nowrap transition-colors ${
              activeTab === 'usuarios'
                ? 'bg-sky-600 text-white font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Usuarios ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('centros_costo')}
            className={`px-3 py-1 rounded text-calibri-normal whitespace-nowrap transition-colors ${
              activeTab === 'centros_costo'
                ? 'bg-sky-600 text-white font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Centros de Costo ({costCenters.length})
          </button>
          <button
            onClick={() => setActiveTab('catalogo')}
            className={`px-3 py-1 rounded text-calibri-normal whitespace-nowrap transition-colors ${
              activeTab === 'catalogo'
                ? 'bg-sky-600 text-white font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Catálogo Maestro ({products.length})
          </button>
        </div>
      </div>

      {/* 1. GESTIÓN DE USUARIOS */}
      {activeTab === 'usuarios' && (
        <div className="space-y-3">
          <div className="bg-white p-3.5 rounded-lg border border-slate-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-calibri-title text-slate-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-sky-700" />
                Administración de Usuarios y Roles
              </h2>
              <p className="text-calibri-normal text-slate-500 text-xs">
                Crea nuevos técnicos, supervisores o jefes sin editar código. Puedes emular la vista de cualquiera.
              </p>
            </div>
            <button
              onClick={() => handleOpenUserModal()}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded text-calibri-normal font-bold shadow-sm touch-target"
            >
              <Plus className="w-4 h-4" /> Agregar Nuevo Usuario
            </button>
          </div>

          <div className="bg-white rounded-lg border border-slate-300 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-calibri-normal">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-xs font-bold border-b border-slate-300">
                    <th className="p-2.5">ID</th>
                    <th className="p-2.5">Nombre Completo</th>
                    <th className="p-2.5">RUT</th>
                    <th className="p-2.5">Rol en Sistema</th>
                    <th className="p-2.5">Centro de Costo</th>
                    <th className="p-2.5">Contraseña</th>
                    <th className="p-2.5">Contacto / Correo</th>
                    <th className="p-2.5 text-center">Acciones y Emulación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono text-xs text-sky-800 font-bold">{u.id}</td>
                      <td className="p-2.5 font-bold text-slate-900">{u.name}</td>
                      <td className="p-2.5 text-slate-600 font-mono text-xs">{u.rut}</td>
                      <td className="p-2.5">
                        <span className="capitalize font-semibold text-xs px-2 py-0.5 rounded bg-slate-100 border text-slate-800">
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-2.5 font-bold text-slate-800">{u.cost_center_id}</td>
                      <td className="p-2.5">
                        <code className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded font-mono font-bold text-xs text-sky-900">
                          {u.password || '123456'}
                        </code>
                      </td>
                      <td className="p-2.5 text-xs text-slate-500">
                        {u.email} <span className="block text-slate-400">{u.phone}</span>
                      </td>
                      <td className="p-2.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {u.role !== 'superadmin' && (
                            <button
                              type="button"
                              onClick={() => startEmulation(u)}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded text-xs font-bold touch-target"
                              title="Ver la plataforma exactamente como este usuario"
                            >
                              <Eye className="w-3.5 h-3.5" /> Ver como él
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenUserModal(u)}
                            className="p-1.5 text-slate-600 hover:text-sky-700 hover:bg-slate-100 rounded"
                            title="Editar usuario"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. GESTIÓN DE CENTROS DE COSTO */}
      {activeTab === 'centros_costo' && (
        <div className="space-y-3">
          <div className="bg-white p-3.5 rounded-lg border border-slate-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-calibri-title text-slate-900 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Gestión Maestra de Centros de Costo
              </h2>
              <p className="text-calibri-normal text-slate-500 text-xs">
                Crea nuevos centros de costos o ajusta asignaciones presupuestarias operacionales.
              </p>
            </div>
            <button
              onClick={() => handleOpenCCModal()}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-calibri-normal font-bold shadow-sm touch-target"
            >
              <Plus className="w-4 h-4" /> Nuevo Centro de Costos
            </button>
          </div>

          <div className="bg-white rounded-lg border border-slate-300 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-calibri-normal">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-xs font-bold border-b border-slate-300">
                    <th className="p-2.5">Código</th>
                    <th className="p-2.5">Nombre del Centro</th>
                    <th className="p-2.5">Área</th>
                    <th className="p-2.5 text-right">Presupuesto Asignado</th>
                    <th className="p-2.5 text-right">Gasto Ejecutado</th>
                    <th className="p-2.5 text-right">Saldo Disponible</th>
                    <th className="p-2.5 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {costCenters.map((cc) => (
                    <tr key={cc.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono text-xs font-bold text-sky-800">{cc.code}</td>
                      <td className="p-2.5 font-bold text-slate-900">{cc.name}</td>
                      <td className="p-2.5 text-slate-600 text-xs">{cc.area}</td>
                      <td className="p-2.5 text-right font-bold text-slate-800">
                        ${Number(cc.assigned_budget).toLocaleString('es-CL')}
                      </td>
                      <td className="p-2.5 text-right font-bold text-rose-700">
                        ${Number(cc.executed_budget).toLocaleString('es-CL')}
                      </td>
                      <td className="p-2.5 text-right font-bold text-emerald-700">
                        ${(Number(cc.assigned_budget) - Number(cc.executed_budget)).toLocaleString('es-CL')}
                      </td>
                      <td className="p-2.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenCCModal(cc)}
                            className="p-1.5 text-slate-600 hover:text-sky-700 hover:bg-slate-100 rounded"
                            title="Editar Centro de Costo"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCC(cc)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            title="Eliminar Centro de Costo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. CATÁLOGO MAESTRO */}
      {activeTab === 'catalogo' && (
        <div className="space-y-3">
          <div className="bg-white p-3.5 rounded-lg border border-slate-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-calibri-title text-slate-900 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-sky-700" />
                Catálogo Maestro de Artículos de Bodega
              </h2>
              <p className="text-calibri-normal text-slate-500 text-xs">
                Modifica precios, mínimos críticos, nombres o agrega nuevos ítems directamente.
              </p>
            </div>
            <button
              onClick={() => handleOpenProductModal()}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded text-calibri-normal font-bold shadow-sm touch-target"
            >
              <Plus className="w-4 h-4" /> Nuevo Producto
            </button>
          </div>

          <div className="bg-white rounded-lg border border-slate-300 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-calibri-normal">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-xs font-bold border-b border-slate-300">
                    <th className="p-2.5">SKU</th>
                    <th className="p-2.5">Descripción</th>
                    <th className="p-2.5">Categoría</th>
                    <th className="p-2.5 text-center">Stock</th>
                    <th className="p-2.5 text-center">Mínimo</th>
                    <th className="p-2.5 text-right">Precio Unitario</th>
                    <th className="p-2.5">Ubicación</th>
                    <th className="p-2.5 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono text-xs font-bold text-sky-800">{p.sku}</td>
                      <td className="p-2.5 font-bold text-slate-800">{p.name}</td>
                      <td className="p-2.5 text-slate-600 text-xs">{p.category}</td>
                      <td className="p-2.5 text-center font-bold">{p.current_stock} {p.unit}</td>
                      <td className="p-2.5 text-center text-xs text-slate-500">{p.min_stock}</td>
                      <td className="p-2.5 text-right font-semibold text-slate-800">
                        ${p.unit_price.toLocaleString('es-CL')}
                      </td>
                      <td className="p-2.5 text-xs text-slate-600">{p.location}</td>
                      <td className="p-2.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenProductModal(p)}
                            className="p-1.5 text-slate-600 hover:text-sky-700 hover:bg-slate-100 rounded"
                            title="Editar Producto"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            title="Eliminar Producto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL USUARIO */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md border border-slate-300 overflow-hidden my-6">
            <div className="p-3 bg-slate-800 text-white flex items-center justify-between">
              <h2 className="text-calibri-title text-white">
                {editingUser ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
              </h2>
              <button onClick={() => setShowUserModal(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveUser} className="p-4 space-y-3">
              <div>
                <label className="block text-calibri-normal font-bold text-slate-700 mb-1">
                  Nombre Completo: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Juan Pérez Morales"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-calibri-normal"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-calibri-normal font-bold text-slate-700 mb-1">
                    RUT: *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="12.345.678-9"
                    value={userRut}
                    onChange={(e) => setUserRut(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-calibri-normal font-mono"
                  />
                </div>
                <div>
                  <label className="block text-calibri-normal font-bold text-slate-700 mb-1">
                    Rol en Sistema: *
                  </label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as UserRole)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-calibri-normal bg-white"
                  >
                    <option value="tecnico">Técnico de Terreno</option>
                    <option value="supervisor">Supervisor de Faena</option>
                    <option value="bodeguero_admin">Bodega y Compras</option>
                    <option value="jefe_seccion">Jefe de Sección</option>
                    <option value="superadmin">Staff / Superadmin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-calibri-normal font-bold text-slate-700 mb-1">
                  Centro de Costos Asignado:
                </label>
                <select
                  value={userCC}
                  onChange={(e) => setUserCC(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-calibri-normal bg-white"
                >
                  {costCenters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-calibri-normal font-bold text-slate-700 mb-1">
                    Correo Electrónico:
                  </label>
                  <input
                    type="email"
                    placeholder="juan@empresa.cl"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-calibri-normal"
                  />
                </div>
                <div>
                  <label className="block text-calibri-normal font-bold text-slate-700 mb-1">
                    Teléfono Móvil:
                  </label>
                  <input
                    type="text"
                    placeholder="+56 9 1234 5678"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-calibri-normal"
                  />
                </div>
              </div>

              <div>
                <label className="block text-calibri-normal font-bold text-slate-700 mb-1">
                  Contraseña de Acceso al Portal: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Mínimo 4 caracteres (ej: 123456)"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-calibri-normal font-mono font-bold text-sky-900"
                />
                <span className="text-xs text-slate-400 block mt-0.5">
                  El trabajador usará esta clave para ingresar a su portal.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-3 py-1.5 border rounded text-calibri-normal text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded text-calibri-normal"
                >
                  Guardar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CENTRO DE COSTO */}
      {showCCModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md border border-slate-300 overflow-hidden">
            <div className="p-3 bg-slate-800 text-white flex items-center justify-between">
              <h2 className="text-calibri-title text-white">
                {editingCC ? 'Editar Centro de Costos' : 'Nuevo Centro de Costos'}
              </h2>
              <button onClick={() => setShowCCModal(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveCC} className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-calibri-normal font-bold text-slate-700 mb-1">
                    Código CC: *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CC-105"
                    value={ccCode}
                    onChange={(e) => setCcCode(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-calibri-normal font-mono"
                  />
                </div>
                <div>
                  <label className="block text-calibri-normal font-bold text-slate-700 mb-1">
                    Presupuesto Asignado ($ CLP): *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={ccBudget}
                    onChange={(e) => setCcBudget(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-calibri-normal font-bold text-sky-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-calibri-normal font-bold text-slate-700 mb-1">
                  Nombre Descriptivo: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Obras Civiles y Subestaciones"
                  value={ccName}
                  onChange={(e) => setCcName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-calibri-normal"
                />
              </div>

              <div>
                <label className="block text-calibri-normal font-bold text-slate-700 mb-1">
                  Área Superior:
                </label>
                <input
                  type="text"
                  value={ccArea}
                  onChange={(e) => setCcArea(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-calibri-normal"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowCCModal(false)}
                  className="px-3 py-1.5 border rounded text-calibri-normal text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded text-calibri-normal"
                >
                  Guardar Centro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PRODUCTO */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg border border-slate-300 overflow-hidden my-6">
            <div className="p-3 bg-sky-800 text-white flex items-center justify-between">
              <h2 className="text-calibri-title text-white">
                {editingProduct ? 'Editar Artículo de Bodega' : 'Nuevo Artículo de Bodega'}
              </h2>
              <button onClick={() => setShowProductModal(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveProduct} className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-calibri-normal font-bold text-slate-700 mb-1">
                    Código SKU: *
                  </label>
                  <input
                    type="text"
                    required
                    value={prodSku}
                    onChange={(e) => setProdSku(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-calibri-normal font-mono"
                  />
                </div>
                <div>
                  <label className="block text-calibri-normal font-bold text-slate-700 mb-1">
                    Categoría:
                  </label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value as ProductCategory)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-calibri-normal bg-white"
                  >
                    <option value="EPP">EPP</option>
                    <option value="Herramientas Menores">Herramientas Menores</option>
                    <option value="Artículos de Oficina">Artículos de Oficina</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-calibri-normal font-bold text-slate-700 mb-1">
                  Nombre del Artículo: *
                </label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-calibri-normal"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-calibri-normal font-bold text-slate-700 mb-1">
                    Unidad:
                  </label>
                  <input
                    type="text"
                    value={prodUnit}
                    onChange={(e) => setProdUnit(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-calibri-normal"
                  />
                </div>
                <div>
                  <label className="block text-calibri-normal font-bold text-slate-700 mb-1">
                    Stock Actual:
                  </label>
                  <input
                    type="number"
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-calibri-normal"
                  />
                </div>
                <div>
                  <label className="block text-calibri-normal font-bold text-slate-700 mb-1">
                    Stock Mínimo:
                  </label>
                  <input
                    type="number"
                    value={prodMinStock}
                    onChange={(e) => setProdMinStock(Number(e.target.value))}
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
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-calibri-normal font-bold"
                  />
                </div>
                <div>
                  <label className="block text-calibri-normal font-bold text-slate-700 mb-1">
                    Ubicación en Bodega:
                  </label>
                  <input
                    type="text"
                    value={prodLocation}
                    onChange={(e) => setProdLocation(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-calibri-normal"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
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

