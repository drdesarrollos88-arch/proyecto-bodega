import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Boxes, 
  Menu, 
  X, 
  PlusCircle, 
  ListOrdered, 
  ClipboardCheck, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  FileText, 
  DollarSign,
  LogOut,
  Crown,
  Layers,
  ArrowLeft,
  Search
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenSupabaseModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, onOpenSupabaseModal }) => {
  const { currentUser, activeUser, isEmulating, stopEmulation, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!activeUser) return null;

  // Definir pestañas según el rol activo
  const getNavItems = () => {
    switch (activeUser.role) {
      case 'superadmin':
        return [
          { id: 'admin_panel', label: 'Panel Superadmin', icon: <Crown className="w-4 h-4 text-amber-500" /> },
          { id: 'dashboard_ejecutivo', label: 'Dashboard Área', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'presupuestos_area', label: 'Presupuestos CC', icon: <DollarSign className="w-4 h-4" /> },
          { id: 'inventario', label: 'Bodega Central', icon: <Package className="w-4 h-4" /> },
          { id: 'auditoria_total', label: 'Libro de Actas', icon: <FileText className="w-4 h-4" /> },
        ];
      case 'tecnico':
        return [
          { id: 'portal_tecnico', label: 'Buscador y Retiros', icon: <Search className="w-4 h-4" /> },
          { id: 'mis_retiros', label: 'Mis Actas de Retiro', icon: <FileText className="w-4 h-4" /> },
        ];
      case 'supervisor':
        return [
          { id: 'aprobaciones', label: 'Bandeja de Aprobación', icon: <ClipboardCheck className="w-4 h-4" /> },
          { id: 'stock_consulta', label: 'Verificar Stock', icon: <Package className="w-4 h-4" /> },
        ];
      case 'bodeguero_admin':
        return [
          { id: 'despacho', label: 'Despacho & Entrega', icon: <Boxes className="w-4 h-4" /> },
          { id: 'inventario', label: 'Inventario General', icon: <Package className="w-4 h-4" /> },
          { id: 'compras', label: 'Solicitud de Compras', icon: <ShoppingCart className="w-4 h-4" /> },
          { id: 'actas_auditoria', label: 'Actas y Firmas', icon: <FileText className="w-4 h-4" /> },
        ];
      case 'jefe_seccion':
        return [
          { id: 'dashboard_ejecutivo', label: 'Dashboard Ejecutivo', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'presupuestos_area', label: 'Presupuestos por CC', icon: <DollarSign className="w-4 h-4" /> },
          { id: 'stock_critico', label: 'Stock y Alertas', icon: <Package className="w-4 h-4" /> },
          { id: 'auditoria_total', label: 'Auditoría de Entregas', icon: <FileText className="w-4 h-4" /> },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const handleTabClick = (tabId: string) => {
    onSelectTab(tabId);
    setMobileMenuOpen(false);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'superadmin':
        return { label: 'Staff / Superadmin', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'jefe_seccion':
        return { label: 'Jefe de Sección', bg: 'bg-purple-100 text-purple-900 border-purple-300' };
      case 'bodeguero_admin':
        return { label: 'Bodega & Compras', bg: 'bg-sky-100 text-sky-900 border-sky-300' };
      case 'supervisor':
        return { label: 'Supervisor de Faena', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'tecnico':
        return { label: 'Técnico de Terreno', bg: 'bg-slate-200 text-slate-800 border-slate-300' };
      default:
        return { label: role, bg: 'bg-slate-100 text-slate-800' };
    }
  };

  const roleBadge = getRoleBadge(activeUser.role);

  return (
    <>
      {/* Banner de Emulación para Superadmin */}
      {isEmulating && (
        <div className="bg-purple-900 text-white px-4 py-2 flex items-center justify-between text-xs no-print shadow-md">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-300 animate-pulse" />
            <span>
              <strong>MODO EMULACIÓN SUPERADMIN:</strong> Estás visualizando la plataforma exactamente como{' '}
              <strong className="underline">{activeUser.name}</strong> ({roleBadge.label}).
            </span>
          </div>
          <button
            onClick={stopEmulation}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white text-purple-950 font-bold rounded hover:bg-purple-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Volver al Panel Superadmin
          </button>
        </div>
      )}

      <nav className="bg-white border-b border-slate-300 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo y Nombre */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-sky-700 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                <Boxes className="w-4 h-4" />
              </div>
              <div>
                <span className="text-calibri-title text-slate-900 tracking-tight font-bold text-sm block leading-none">
                  BODEGA & MATERIALES
                </span>
                <span className="text-xs text-slate-500 block leading-none mt-1">
                  Portal Operativo
                </span>
              </div>
            </div>

            {/* Pestañas de Navegación según Rol */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-calibri-normal transition-colors touch-target ${
                      isActive
                        ? 'bg-sky-700 text-white font-bold shadow-sm'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Usuario, Rol y Salir */}
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-center gap-1.5 justify-end">
                  <span className="text-calibri-normal font-bold text-slate-900 text-xs">
                    {activeUser.name}
                  </span>
                  <span
                    className={`text-xs px-1.5 py-0.2 rounded border font-bold ${roleBadge.bg}`}
                  >
                    {roleBadge.label}
                  </span>
                </div>
                <span className="text-xs text-slate-400 block">
                  {activeUser.cost_center_id} • {activeUser.rut}
                </span>
              </div>

              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-slate-300 text-slate-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors touch-target"
                title="Cerrar sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Salir</span>
              </button>
            </div>

            {/* Botón de Menú Móvil */}
            <div className="flex md:hidden items-center gap-2">
              <button
                type="button"
                onClick={logout}
                className="p-2 text-slate-600 hover:text-rose-700"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Menú Desplegable Móvil */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-slate-50 px-4 pt-2 pb-4 space-y-1">
            <div className="pb-2 mb-2 border-b border-slate-200">
              <span className="text-xs text-slate-500 block">Conectado como:</span>
              <strong className="text-calibri-normal text-slate-900 block">{activeUser.name}</strong>
              <span
                className={`inline-block mt-1 text-xs px-2 py-0.5 rounded border font-bold ${roleBadge.bg}`}
              >
                {roleBadge.label}
              </span>
            </div>
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded text-calibri-normal text-left touch-target ${
                    isActive
                      ? 'bg-sky-700 text-white font-bold'
                      : 'text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </nav>
    </>
  );
};
