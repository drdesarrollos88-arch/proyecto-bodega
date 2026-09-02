import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Boxes, 
  ShieldCheck, 
  Lock, 
  User, 
  ArrowRight, 
  HardHat, 
  ClipboardCheck, 
  PackageCheck, 
  BarChart3, 
  Crown,
  Database
} from 'lucide-react';
import { UserRole } from '../../types';

interface LoginViewProps {
  onOpenSupabaseModal: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onOpenSupabaseModal }) => {
  const { allUsers, login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const found = allUsers.find(
      (u) =>
        u.rut.toLowerCase() === identifier.trim().toLowerCase() ||
        (u.email && u.email.toLowerCase() === identifier.trim().toLowerCase())
    );

    if (found) {
      login(found.id);
    } else {
      setError('Credenciales no válidas. Puedes seleccionar uno de los perfiles rápidos abajo.');
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'superadmin':
        return { label: 'Staff / Superadmin', icon: <Crown className="w-3.5 h-3.5 text-amber-500" />, color: 'bg-amber-50 text-amber-900 border-amber-300' };
      case 'jefe_seccion':
        return { label: 'Jefe de Sección', icon: <BarChart3 className="w-3.5 h-3.5 text-purple-600" />, color: 'bg-purple-50 text-purple-900 border-purple-200' };
      case 'bodeguero_admin':
        return { label: 'Bodega & Compras', icon: <PackageCheck className="w-3.5 h-3.5 text-sky-600" />, color: 'bg-sky-50 text-sky-900 border-sky-200' };
      case 'supervisor':
        return { label: 'Supervisor', icon: <ClipboardCheck className="w-3.5 h-3.5 text-emerald-600" />, color: 'bg-emerald-50 text-emerald-900 border-emerald-200' };
      case 'tecnico':
        return { label: 'Técnico de Terreno', icon: <HardHat className="w-3.5 h-3.5 text-slate-700" />, color: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-8 sm:px-6 lg:px-8 bg-slate-100/80">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-sky-700 text-white shadow-md mb-2">
          <Boxes className="w-7 h-7" />
        </div>
        <h1 className="text-calibri-title text-slate-900 text-xl font-bold tracking-tight">
          SISTEMA DE GESTIÓN DE BODEGA E INVENTARIO
        </h1>
        <p className="text-calibri-normal text-slate-600 text-xs mt-1">
          Acceso autenticado con separación estricta de vistas por perfil
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="bg-white py-6 px-4 sm:px-8 shadow-sm rounded-lg border border-slate-300">
          {/* Formulario de Login */}
          <form onSubmit={handleManualLogin} className="space-y-3.5">
            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-300 rounded text-calibri-normal text-rose-800 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-calibri-normal font-bold text-slate-700 mb-1">
                RUT o Correo Electrónico:
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Ej: admin@empresa.cl o 16.894.221-5"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-calibri-normal focus:outline-none focus:ring-1 focus:ring-sky-700 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-calibri-normal font-bold text-slate-700 mb-1">
                Contraseña o PIN de Acceso:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-calibri-normal focus:outline-none focus:ring-1 focus:ring-sky-700 text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-sky-700 hover:bg-sky-800 text-white rounded text-calibri-normal font-bold shadow-sm transition-colors touch-target"
            >
              <span>Ingresar a mi Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Acceso Rápido por Perfil */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-calibri-title text-slate-800 text-xs uppercase tracking-wider font-bold">
                Acceso Rápido por Perfil (Entorno Separado):
              </span>
              <span className="text-xs text-slate-400">1 Clic</span>
            </div>

            <div className="space-y-2">
              {allUsers.map((user) => {
                const badge = getRoleBadge(user.role);
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => login(user.id)}
                    className="w-full flex items-center justify-between p-2.5 rounded-md border border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 transition-all text-left touch-target group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-sky-100 flex items-center justify-center flex-shrink-0">
                        {badge.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <strong className="text-calibri-normal text-slate-900 group-hover:text-sky-900 truncate">
                            {user.name}
                          </strong>
                          <span
                            className={`inline-flex items-center gap-1 text-xs px-2 py-0.2 rounded border font-bold ${badge.color}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 block">
                          RUT: {user.rut} • CC: {user.cost_center_id}
                        </span>
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-700 transition-transform group-hover:translate-x-1" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pie con Supabase */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <button
              type="button"
              onClick={onOpenSupabaseModal}
              className="inline-flex items-center gap-1 text-sky-700 hover:underline"
            >
              <Database className="w-3.5 h-3.5" /> Configuración Base de Datos
            </button>
            <span>Tipografía Calibri 10pt/12pt</span>
          </div>
        </div>
      </div>
    </div>
  );
};
