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
  DollarSign 
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  const { currentUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Definir pestañas según el rol activo
  const getNavItems = () => {
    switch (currentUser.role) {
      case 'tecnico':
        return [
          { id: 'nueva_solicitud', label: 'Pedir Insumos', icon: <PlusCircle className="w-4 h-4" /> },
          { id: 'mis_solicitudes', label: 'Mis Pedidos', icon: <ListOrdered className="w-4 h-4" /> },
          { id: 'mis_retiros', label: 'Mis Actas de Retiro', icon: <FileText className="w-4 h-4" /> },
        ];
      case 'supervisor':
        return [
          { id: 'aprobaciones', label: 'Bandeja de Aprobación', icon: <ClipboardCheck className="w-4 h-4" /> },
          { id: 'stock_consulta', label: 'Verificar Stock', icon: <Package className="w-4 h-4" /> },
          { id: 'presupuesto_supervisor', label: 'Presupuesto CC', icon: <DollarSign className="w-4 h-4" /> },
        ];
      case 'bodeguero_admin':
        return [
          { id: 'despacho', label: 'Despacho & Entrega', icon: <Boxes className="w-4 h-4" /> },
          { id: 'inventario', label: 'Inventario General', icon: <Package className="w-4 h-4" /> },
          { id: 'compras', label: 'Solicitud de Compras', icon: <ShoppingCart className="w-4 h-4" /> },
          { id: 'actas_auditoria', label: 'Actas y Firmas', icon: <FileText className="w-4 h-4" /> },
          { id: 'metricas_admin', label: 'Métricas de Uso', icon: <BarChart3 className="w-4 h-4" /> },
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

  const getRoleLabel = () => {
    switch (currentUser.role) {
      case 'tecnico': return 'Técnico de Terreno';
      case 'supervisor': return 'Supervisor de Operaciones';
      case 'bodeguero_admin': return 'Bodega & Compras';
      case 'jefe_seccion': return 'Jefe de Sección';
    }
  };

  return (
    <nav className="bg-white border-b border-slate-300 shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo y Nombre de Plataforma */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-sky-700 flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-calibri-title text-slate-900 tracking-tight">
                  GESTIÓN DE BODEGA E INVENTARIO
                </span>
                <span className="hidden md:inline-block px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded border border-slate-300">
                  {getRoleLabel()}
                </span>
              </div>
              <p className="text-calibri-normal text-slate-500 text-xs hidden sm:block">
                Trazabilidad con firmas digitales, fotos y control presupuestario
              </p>
            </div>
          </div>

          {/* Navegación en Escritorio */}
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

          {/* Botón de Menú Móvil */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md touch-target"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Desplegable en Móvil */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-slate-50 px-4 pt-2 pb-4 space-y-1">
          <div className="pb-2 mb-2 border-b border-slate-200">
            <span className="text-xs text-slate-500 block">Rol actual:</span>
            <span className="text-calibri-title text-sky-800">{getRoleLabel()}</span>
            <span className="text-calibri-normal text-slate-600 block text-xs">{currentUser.name}</span>
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
  );
};
