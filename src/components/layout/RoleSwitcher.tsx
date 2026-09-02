import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { HardHat, ClipboardCheck, PackageCheck, BarChart3, Database, CheckCircle2, AlertCircle, RotateCcw, Crown } from 'lucide-react';
import { isSupabaseConfigured } from '../../services/supabase';
import { store } from '../../services/store';

interface RoleSwitcherProps {
  onOpenSupabaseModal: () => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ onOpenSupabaseModal }) => {
  const { currentUser, setRole } = useAuth();
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const isSupabaseReady = isSupabaseConfigured();

  if (!currentUser) return null;

  const roles: { role: UserRole; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      role: 'superadmin',
      label: 'Staff / Superadmin',
      icon: <Crown className="w-3.5 h-3.5 text-amber-400" />,
      desc: 'Control total de plataforma',
    },
    {
      role: 'jefe_seccion',
      label: 'Jefe de Sección',
      icon: <BarChart3 className="w-3.5 h-3.5" />,
      desc: 'Presupuestos y métricas',
    },
    {
      role: 'bodeguero_admin',
      label: 'Bodega & Compras',
      icon: <PackageCheck className="w-3.5 h-3.5" />,
      desc: 'Entrega física y órdenes',
    },
    {
      role: 'supervisor',
      label: 'Supervisor',
      icon: <ClipboardCheck className="w-3.5 h-3.5" />,
      desc: 'Autorización y stock',
    },
    {
      role: 'tecnico',
      label: 'Técnico de Terreno',
      icon: <HardHat className="w-3.5 h-3.5" />,
      desc: 'Pide insumos en faena',
    },
  ];

  const handleReset = () => {
    store.resetToDefaults();
    setShowConfirmReset(false);
  };

  return (
    <div className="bg-slate-900 text-white px-3 py-2 border-b border-slate-800 shadow-sm no-print">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-calibri-normal text-slate-400 hidden sm:inline">Perfil Activo:</span>
          <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <strong className="text-calibri-normal text-white">{currentUser.name}</strong>
            <span className="text-calibri-normal text-slate-400 text-xs hidden md:inline">({currentUser.rut})</span>
            <span className="text-calibri-normal text-sky-300 font-semibold bg-sky-950/80 px-1.5 py-0.2 rounded border border-sky-800 text-xs">
              {currentUser.cost_center_id}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          <span className="text-calibri-normal text-slate-400 text-xs mr-1 hidden lg:inline">Alternar:</span>
          {roles.map((r) => {
            const isActive = currentUser.role === r.role;
            return (
              <button
                key={r.role}
                onClick={() => setRole(r.role)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-calibri-normal transition-all whitespace-nowrap touch-target ${
                  isActive
                    ? 'bg-sky-600 text-white font-bold shadow-sm ring-1 ring-sky-300'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
                title={r.desc}
              >
                {r.icon}
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSupabaseModal}
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-calibri-normal border transition-colors ${
              isSupabaseReady
                ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300 hover:bg-emerald-900/60'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="Configuración de Base de Datos Supabase"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Supabase:</span>
            {isSupabaseReady ? (
              <span className="inline-flex items-center gap-1 text-emerald-400 text-xs">
                <CheckCircle2 className="w-3 h-3" /> Conectado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-sky-300 text-xs">
                <AlertCircle className="w-3 h-3" /> Configurar / SQL
              </span>
            )}
          </button>

          {showConfirmReset ? (
            <div className="flex items-center gap-1 bg-rose-950 border border-rose-800 px-2 py-0.5 rounded">
              <span className="text-calibri-normal text-rose-300 text-xs">¿Restaurar?</span>
              <button
                onClick={handleReset}
                className="text-xs bg-rose-700 hover:bg-rose-600 text-white px-1.5 py-0.5 rounded font-bold"
              >
                Sí
              </button>
              <button
                onClick={() => setShowConfirmReset(false)}
                className="text-xs text-slate-400 hover:text-white px-1 py-0.5"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
              title="Restaurar datos iniciales de prueba"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
