import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Boxes, 
  Lock, 
  User, 
  ArrowRight, 
  HardHat, 
  ClipboardCheck, 
  PackageCheck, 
  BarChart3, 
  Crown,
  Database,
  Eye,
  EyeOff,
  KeyRound
} from 'lucide-react';
import { UserRole } from '../../types';

interface LoginViewProps {
  onOpenSupabaseModal: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onOpenSupabaseModal }) => {
  const { allUsers, login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    if (!identifier.trim()) {
      setError('Por favor ingrese su RUT o Correo Electrónico.');
      return;
    }
    if (!password) {
      setError('Por favor ingrese su contraseña de acceso.');
      return;
    }

    const result = login(identifier, password);
    if (!result.success) {
      setError(result.error || 'Credenciales no válidas.');
    }
  };

  const handleSelectQuickUser = (user: typeof allUsers[0]) => {
    setIdentifier(user.email || user.rut);
    const pass = user.password || (user.role === 'superadmin' ? 'admin123' : '123456');
    setPassword(pass);
    setError(null);
    setInfoMessage(`Perfil seleccionado: ${user.name}. Contraseña: "${pass}". Haz clic en "Ingresar a mi Portal".`);
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
          Acceso corporativo protegido por contraseña obligatoria
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="bg-white py-6 px-4 sm:px-8 shadow-sm rounded-lg border border-slate-300">
          {/* Formulario de Login */}
          <form onSubmit={handleManualLogin} className="space-y-3.5">
            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-300 rounded text-calibri-normal text-rose-800 text-xs font-bold animate-fade-in">
                {error}
              </div>
            )}

            {infoMessage && (
              <div className="p-2.5 bg-sky-50 border border-sky-300 rounded text-calibri-normal text-sky-900 text-xs animate-fade-in">
                {infoMessage}
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
                Contraseña de Acceso:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 border border-slate-300 rounded text-calibri-normal focus:outline-none focus:ring-1 focus:ring-sky-700 text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
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
            <div className="flex items-center justify-between mb-2">
              <span className="text-calibri-title text-slate-800 text-xs uppercase tracking-wider font-bold">
                Perfiles del Sistema (Cargar Credenciales):
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <KeyRound className="w-3 h-3 text-amber-600" /> Clave por defecto
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Haz clic en cualquier usuario para cargar sus credenciales de prueba en el formulario y verificar la contraseña:
            </p>

            <div className="space-y-2">
              {allUsers.map((user) => {
                const badge = getRoleBadge(user.role);
                const pass = user.password || (user.role === 'superadmin' ? 'admin123' : '123456');
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleSelectQuickUser(user)}
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
                          RUT: {user.rut} • Clave: <code className="bg-slate-100 px-1 py-0.2 rounded font-mono font-bold text-slate-700">{pass}</code>
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
              <Database className="w-3.5 h-3.5" /> Conexión Supabase
            </button>
            <span>Tipografía Calibri 10pt/12pt</span>
          </div>
        </div>
      </div>
    </div>
  );
};
