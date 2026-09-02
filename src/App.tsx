import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { LoginView } from './components/auth/LoginView';
import { SupabaseModal } from './components/layout/SupabaseModal';

// Panel Superadmin
import { SuperadminDashboard } from './components/admin/SuperadminDashboard';

// Vistas del Técnico
import { NewRequestView } from './components/technician/NewRequestView';
import { RequestHistoryView } from './components/technician/RequestHistoryView';
import { MyReceiptsView } from './components/technician/MyReceiptsView';

// Vistas del Supervisor
import { PendingApprovalsView } from './components/supervisor/PendingApprovalsView';
import { SupervisorStockView } from './components/supervisor/SupervisorStockView';
import { SupervisorBudgetView } from './components/supervisor/SupervisorBudgetView';

// Vistas de Bodega y Personal Administrativo
import { DeliveryQueueView } from './components/warehouse/DeliveryQueueView';
import { InventoryTableView } from './components/warehouse/InventoryTableView';
import { PurchaseOrdersView } from './components/warehouse/PurchaseOrdersView';

// Vistas del Jefe de Sección
import { ExecutiveDashboardView } from './components/manager/ExecutiveDashboardView';
import { CostCentersBudgetView } from './components/manager/CostCentersBudgetView';
import { AuditRecordsView } from './components/manager/AuditRecordsView';

import { Product } from './types';

const MainLayout: React.FC = () => {
  const { isAuthenticated, activeUser } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('nueva_solicitud');
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [productForPurchase, setProductForPurchase] = useState<Product | null>(null);

  // Inicializar pestaña por defecto según el rol del usuario conectado
  useEffect(() => {
    if (!activeUser) return;

    switch (activeUser.role) {
      case 'superadmin':
        setCurrentTab('admin_panel');
        break;
      case 'jefe_seccion':
        setCurrentTab('dashboard_ejecutivo');
        break;
      case 'bodeguero_admin':
        setCurrentTab('despacho');
        break;
      case 'supervisor':
        setCurrentTab('aprobaciones');
        break;
      case 'tecnico':
        setCurrentTab('nueva_solicitud');
        break;
    }
  }, [activeUser?.id, activeUser?.role]);

  // Si no está autenticado, mostrar pantalla de inicio de sesión
  if (!isAuthenticated || !activeUser) {
    return (
      <>
        <LoginView onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)} />
        <SupabaseModal
          isOpen={isSupabaseModalOpen}
          onClose={() => setIsSupabaseModalOpen(false)}
        />
      </>
    );
  }

  const handleGoToPurchase = (prod: Product) => {
    setProductForPurchase(prod);
    setCurrentTab('compras');
  };

  const renderActiveTab = () => {
    // 1. ROL STAFF / SUPERADMIN
    if (activeUser.role === 'superadmin') {
      switch (currentTab) {
        case 'admin_panel':
          return <SuperadminDashboard />;
        case 'dashboard_ejecutivo':
          return <ExecutiveDashboardView />;
        case 'presupuestos_area':
          return <CostCentersBudgetView />;
        case 'inventario':
          return <InventoryTableView onGoToPurchaseOrder={handleGoToPurchase} />;
        case 'auditoria_total':
          return <AuditRecordsView />;
        default:
          return <SuperadminDashboard />;
      }
    }

    // 2. ROL TÉCNICO DE TERRENO (Vista Separada Estricta)
    if (activeUser.role === 'tecnico') {
      switch (currentTab) {
        case 'nueva_solicitud':
          return <NewRequestView onSuccessSubmit={() => setCurrentTab('mis_solicitudes')} />;
        case 'mis_solicitudes':
          return <RequestHistoryView />;
        case 'mis_retiros':
          return <MyReceiptsView />;
        default:
          return <NewRequestView onSuccessSubmit={() => setCurrentTab('mis_solicitudes')} />;
      }
    }

    // 3. ROL SUPERVISOR (Vista Separada Estricta)
    if (activeUser.role === 'supervisor') {
      switch (currentTab) {
        case 'aprobaciones':
          return <PendingApprovalsView />;
        case 'stock_consulta':
          return <SupervisorStockView />;
        case 'presupuesto_supervisor':
          return <SupervisorBudgetView />;
        default:
          return <PendingApprovalsView />;
      }
    }

    // 4. ROL BODEGA & COMPRAS (Vista Separada Estricta)
    if (activeUser.role === 'bodeguero_admin') {
      switch (currentTab) {
        case 'despacho':
          return <DeliveryQueueView />;
        case 'inventario':
          return <InventoryTableView onGoToPurchaseOrder={handleGoToPurchase} />;
        case 'compras':
          return <PurchaseOrdersView initialProductToOrder={productForPurchase} />;
        case 'actas_auditoria':
          return <AuditRecordsView />;
        default:
          return <DeliveryQueueView />;
      }
    }

    // 5. ROL JEFE DE SECCIÓN (Vista Separada Estricta)
    if (activeUser.role === 'jefe_seccion') {
      switch (currentTab) {
        case 'dashboard_ejecutivo':
          return (
            <ExecutiveDashboardView
              onNavigateToStock={() => setCurrentTab('stock_critico')}
              onNavigateToBudget={() => setCurrentTab('presupuestos_area')}
              onNavigateToAudit={() => setCurrentTab('auditoria_total')}
            />
          );
        case 'presupuestos_area':
          return <CostCentersBudgetView />;
        case 'stock_critico':
          return <InventoryTableView onGoToPurchaseOrder={handleGoToPurchase} />;
        case 'auditoria_total':
          return <AuditRecordsView />;
        default:
          return <ExecutiveDashboardView />;
      }
    }

    return <div className="p-8 text-center text-slate-500">Módulo no disponible</div>;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-900">
      {/* Navegación específica según el rol autenticado */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
      />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6">
        {renderActiveTab()}
      </main>

      {/* Pie de Página */}
      <footer className="bg-white border-t border-slate-300 py-3 px-4 text-center text-slate-500 text-calibri-normal no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <span>
            Sistema Integral de Bodega e Inventarios • <strong>Tipografía Calibri (10pt texto / 12pt títulos)</strong>
          </span>
          <span>
            Portal Conectado con Supabase PostgreSQL & Hosting Vercel
          </span>
        </div>
      </footer>

      {/* Modal de Supabase */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
