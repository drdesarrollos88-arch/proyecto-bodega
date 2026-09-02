import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RoleSwitcher } from './components/layout/RoleSwitcher';
import { Navbar } from './components/layout/Navbar';
import { SupabaseModal } from './components/layout/SupabaseModal';

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

const MainContent: React.FC = () => {
  const { currentUser } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('nueva_solicitud');
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [productForPurchase, setProductForPurchase] = useState<Product | null>(null);

  // Al cambiar de rol, restablecer a la pestaña principal de ese rol
  useEffect(() => {
    switch (currentUser.role) {
      case 'tecnico':
        setCurrentTab('nueva_solicitud');
        break;
      case 'supervisor':
        setCurrentTab('aprobaciones');
        break;
      case 'bodeguero_admin':
        setCurrentTab('despacho');
        break;
      case 'jefe_seccion':
        setCurrentTab('dashboard_ejecutivo');
        break;
    }
  }, [currentUser.role]);

  const handleGoToPurchase = (prod: Product) => {
    setProductForPurchase(prod);
    setCurrentTab('compras');
  };

  const renderActiveTab = () => {
    switch (currentTab) {
      // Pestañas Técnico
      case 'nueva_solicitud':
        return <NewRequestView onSuccessSubmit={() => setCurrentTab('mis_solicitudes')} />;
      case 'mis_solicitudes':
        return <RequestHistoryView />;
      case 'mis_retiros':
        return <MyReceiptsView />;

      // Pestañas Supervisor
      case 'aprobaciones':
        return <PendingApprovalsView />;
      case 'stock_consulta':
        return <SupervisorStockView />;
      case 'presupuesto_supervisor':
        return <SupervisorBudgetView />;

      // Pestañas Bodega & Administrativo
      case 'despacho':
        return <DeliveryQueueView />;
      case 'inventario':
        return <InventoryTableView onGoToPurchaseOrder={handleGoToPurchase} />;
      case 'compras':
        return (
          <PurchaseOrdersView
            initialProductToOrder={productForPurchase}
          />
        );
      case 'actas_auditoria':
        return <AuditRecordsView />;
      case 'metricas_admin':
        return (
          <ExecutiveDashboardView
            onNavigateToStock={() => setCurrentTab('inventario')}
            onNavigateToBudget={() => setCurrentTab('presupuestos_area')}
            onNavigateToAudit={() => setCurrentTab('actas_auditoria')}
          />
        );

      // Pestañas Jefe de Sección
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
        return <div className="p-8 text-center text-slate-500">Pestaña no encontrada</div>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-900">
      {/* Barra de alternancia de roles para pruebas completas */}
      <RoleSwitcher onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)} />

      {/* Navegación principal */}
      <Navbar currentTab={currentTab} onSelectTab={(tab) => setCurrentTab(tab)} />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6">
        {renderActiveTab()}
      </main>

      {/* Pie de Página Corporativo con confirmación de especificación */}
      <footer className="bg-white border-t border-slate-300 py-3 px-4 text-center text-slate-500 text-calibri-normal no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <span>
            Sistema Integral de Bodega e Inventarios • <strong>Tipografía Calibri (10pt texto / 12pt títulos)</strong>
          </span>
          <span>
            Trazabilidad Inmutable con Firmas Digitales y Fotos de Entrega • Supabase Ready
          </span>
        </div>
      </footer>

      {/* Modal de Configuración y Esquema de Supabase */}
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
      <MainContent />
    </AuthProvider>
  );
}
