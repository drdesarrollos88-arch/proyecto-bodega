import React, { useState, useEffect } from 'react';
import { UserProfile, CostCenter, UserRole } from '../../types';
import { store } from '../../services/store';
import { formatRut } from '../../utils/rut';
import { 
  Users, 
  DollarSign, 
  Plus, 
  Upload, 
  Download, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Search, 
  AlertCircle, 
  ShieldCheck, 
  FileSpreadsheet,
  Building2
} from 'lucide-react';
import { Badge } from '../common/Badge';

export const SectionUserManagerView: React.FC = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>(() => store.getProfiles());
  const [costCenters, setCostCenters] = useState<CostCenter[]>(() => store.getCostCenters());
  const [search, setSearch] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'usuarios' | 'centros_costo'>('usuarios');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Modal Usuario Individual
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [rut, setRut] = useState('');
  const [role, setRole] = useState<UserRole>('tecnico');
  const [costCenterId, setCostCenterId] = useState('CC-101');
  const [password, setPassword] = useState('123456');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Modal Centro de Costos
  const [showCCModal, setShowCCModal] = useState(false);
  const [editingCC, setEditingCC] = useState<CostCenter | null>(null);
  const [ccCode, setCcCode] = useState('');
  const [ccName, setCcName] = useState('');
  const [ccArea, setCcArea] = useState('Área de Telecomunicaciones');
  const [ccBudget, setCcBudget] = useState(15000000);

  // Modal Carga Masiva Excel/CSV
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkCsvText, setBulkCsvText] = useState('');
  const [bulkPreview, setBulkPreview] = useState<Omit<UserProfile, 'id'>[]>([]);
  const [bulkError, setBulkError] = useState<string | null>(null);

  useEffect(() => {
    return store.subscribe(() => {
      setProfiles(store.getProfiles());
      setCostCenters(store.getCostCenters());
    });
  }, []);

  // --- FILTRO DE USUARIOS ---
  const filteredUsers = profiles.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.rut.toLowerCase().includes(q) ||
      u.cost_center_id.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  // --- MANEJO DE RUT AUTOMÁTICO ---
  const handleRutChange = (val: string) => {
    setRut(val);
  };

  const handleRutBlur = () => {
    setRut(formatRut(rut));
  };

  // --- GUARDAR USUARIO INDIVIDUAL ---
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedRut = formatRut(rut);

    if (editingUser) {
      store.updateUser(editingUser.id, {
        name: name.trim(),
        rut: formattedRut,
        role,
        cost_center_id: costCenterId,
        password: password.trim() || '123456',
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      setFeedback(`Usuario ${name} actualizado con éxito.`);
    } else {
      store.addUser({
        name: name.trim(),
        rut: formattedRut,
        role,
        cost_center_id: costCenterId,
        password: password.trim() || '123456',
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      setFeedback(`Usuario ${name} (${formattedRut}) creado con éxito.`);
    }

    setShowUserModal(false);
    setEditingUser(null);
    setTimeout(() => setFeedback(null), 3000);
  };

  const openCreateUserModal = () => {
    setEditingUser(null);
    setName('');
    setRut('');
    setRole('tecnico');
    setCostCenterId(costCenters[0]?.id || 'CC-101');
    setPassword('123456');
    setEmail('');
    setPhone('');
    setShowUserModal(true);
  };

  const openEditUserModal = (u: UserProfile) => {
    setEditingUser(u);
    setName(u.name);
    setRut(u.rut);
    setRole(u.role);
    setCostCenterId(u.cost_center_id);
    setPassword(u.password || '123456');
    setEmail(u.email || '');
    setPhone(u.phone || '');
    setShowUserModal(true);
  };

  // --- GUARDAR CENTRO DE COSTOS ---
  const handleSaveCC = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCC) {
      store.updateCostCenter(editingCC.id, {
        name: ccName.trim(),
        area: ccArea.trim(),
        assigned_budget: Number(ccBudget),
      });
      setFeedback(`Centro de costos ${editingCC.code} actualizado.`);
    } else {
      const code = ccCode.toUpperCase().trim();
      store.addCostCenter({
        code,
        name: ccName.trim(),
        area: ccArea.trim(),
        assigned_budget: Number(ccBudget),
        executed_budget: 0,
      });
      setFeedback(`Centro de costos ${code} creado con éxito.`);
    }

    setShowCCModal(false);
    setEditingCC(null);
    setTimeout(() => setFeedback(null), 3000);
  };

  const openCreateCCModal = () => {
    setEditingCC(null);
    setCcCode(`CC-${100 + costCenters.length + 1}`);
    setCcName('');
    setCcArea('Área de Telecomunicaciones');
    setCcBudget(10000000);
    setShowCCModal(true);
  };

  // --- DESCARGAR PLANTILLA EXCEL/CSV ---
  const downloadCsvTemplate = () => {
    const headers = 'Nombre,RUT,Rol,CentroCosto,Email,Telefono,Password\n';
    const example1 = 'Juan Pérez González,168942215,tecnico,CC-101,juan.perez@empresa.cl,+56911223344,123456\n';
    const example2 = 'Patricia Lagos Morales,14321987-k,supervisor,CC-102,patricia.lagos@empresa.cl,+56988776655,123456\n';
    const example3 = 'Carlos Soto Alarcón,18999888-2,bodeguero_admin,CC-101,carlos.soto@empresa.cl,+56933445566,123456\n';

    const blob = new Blob([headers + example1 + example2 + example3], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'plantilla_usuarios_bodega.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- PROCESAR ARCHIVO O TEXTO CSV ---
  const parseCsvContent = (content: string) => {
    setBulkError(null);
    const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length <= 1) {
      setBulkError('El archivo no contiene filas de datos para importar.');
      setBulkPreview([]);
      return;
    }

    const header = lines[0].toLowerCase();
    const rows: Omit<UserProfile, 'id'>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Soportar coma o punto y coma
      const parts = line.includes(';') ? line.split(';') : line.split(',');
      if (parts.length < 3) continue;

      const rowName = parts[0]?.trim() || '';
      const rawRut = parts[1]?.trim() || '';
      const rowRole = (parts[2]?.trim().toLowerCase() || 'tecnico') as UserRole;
      const rowCC = parts[3]?.trim() || 'CC-101';
      const rowEmail = parts[4]?.trim() || '';
      const rowPhone = parts[5]?.trim() || '';
      const rowPass = parts[6]?.trim() || '123456';

      if (rowName && rawRut) {
        rows.push({
          name: rowName,
          rut: formatRut(rawRut), // Formateo estricto automático de RUT XX.XXX.XXX-X
          role: ['tecnico', 'supervisor', 'bodeguero_admin', 'jefe_seccion'].includes(rowRole) ? rowRole : 'tecnico',
          cost_center_id: rowCC,
          email: rowEmail || undefined,
          phone: rowPhone || undefined,
          password: rowPass,
        });
      }
    }

    if (rows.length === 0) {
      setBulkError('No se pudieron extraer usuarios válidos. Revisa el formato de columnas.');
    }

    setBulkPreview(rows);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setBulkCsvText(text);
      parseCsvContent(text);
    };
    reader.readAsText(file);
  };

  const handleExecuteBulkImport = () => {
    if (bulkPreview.length === 0) return;

    const created = store.addUsersBulk(bulkPreview);
    setFeedback(`¡Carga masiva exitosa! Se importaron ${created.length} usuarios con RUT formateado a la base de datos.`);
    setShowBulkModal(false);
    setBulkPreview([]);
    setBulkCsvText('');
    setTimeout(() => setFeedback(null), 4500);
  };

  return (
    <div className="space-y-4">
      {/* Feedback Toast */}
      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-md text-emerald-800 flex items-center gap-2 shadow-sm animate-fade-in text-calibri-title text-xs font-bold">
          <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Cabecera Principal */}
      <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-calibri-title text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-700" />
            Configuración de Centros de Costos y Gestión de Personal
          </h1>
          <p className="text-calibri-normal text-slate-600">
            Crea o ajusta centros de costos de tu área, registra funcionarios individuales o impórtalos masivamente con Excel/CSV.
          </p>
        </div>

        {/* Pestañas de Cambio Rápido */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveSubTab('usuarios')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'usuarios'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Funcionarios ({profiles.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('centros_costo')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'centros_costo'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" /> Centros de Costo ({costCenters.length})
          </button>
        </div>
      </div>

      {/* =========================================================================
          SUB-TAB 1: GESTIÓN DE USUARIOS Y CARGA MASIVA EXCEL
      ========================================================================= */}
      {activeSubTab === 'usuarios' && (
        <div className="space-y-3">
          {/* Barra de Búsqueda y Botones de Acción */}
          <div className="bg-white p-3 rounded-lg border border-slate-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, RUT, CC o rol..."
                className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-calibri-normal text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={downloadCsvTemplate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 rounded text-xs font-bold transition-colors"
                title="Descargar plantilla CSV/Excel para completar"
              >
                <Download className="w-3.5 h-3.5 text-sky-700" />
                Descargar Plantilla Excel
              </button>

              <button
                type="button"
                onClick={() => setShowBulkModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold shadow-sm transition-colors touch-target"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-200" />
                Carga Masiva Excel/CSV
              </button>

              <button
                type="button"
                onClick={openCreateUserModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded text-xs font-bold shadow-sm transition-colors touch-target"
              >
                <Plus className="w-4 h-4" />
                Crear Usuario
              </button>
            </div>
          </div>

          {/* Tabla de Usuarios */}
          <div className="bg-white rounded-lg border border-slate-300 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-calibri-normal">
                <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                  <tr>
                    <th className="p-2.5">Funcionario</th>
                    <th className="p-2.5">RUT Formateado</th>
                    <th className="p-2.5">Rol en Sistema</th>
                    <th className="p-2.5">Centro de Costos</th>
                    <th className="p-2.5">Contacto</th>
                    <th className="p-2.5">Contraseña</th>
                    <th className="p-2.5 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60">
                      <td className="p-2.5 font-bold text-slate-900">{u.name}</td>
                      <td className="p-2.5 font-mono font-bold text-sky-800">{formatRut(u.rut)}</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-slate-100 border border-slate-200 text-slate-700">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-2.5 font-bold text-slate-700">{u.cost_center_id}</td>
                      <td className="p-2.5 text-slate-500">
                        {u.email && <div>{u.email}</div>}
                        {u.phone && <div className="text-[10px]">{u.phone}</div>}
                      </td>
                      <td className="p-2.5 font-mono text-slate-600 bg-slate-50/80">
                        {u.password || '123456'}
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => openEditUserModal(u)}
                          className="p-1 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded transition-colors"
                          title="Editar usuario"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 2: CONFIGURACIÓN DE CENTROS DE COSTOS
      ========================================================================= */}
      {activeSubTab === 'centros_costo' && (
        <div className="space-y-3">
          <div className="bg-white p-3 rounded-lg border border-slate-300 shadow-sm flex items-center justify-between">
            <p className="text-calibri-normal text-xs text-slate-600">
              Centros de costos autorizados para imputar retiros y consumo de bodega.
            </p>
            <button
              type="button"
              onClick={openCreateCCModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded text-xs font-bold shadow-sm transition-colors touch-target"
            >
              <Plus className="w-4 h-4" />
              Nuevo Centro de Costos
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {costCenters.map((cc) => {
              const executed = Number(cc.executed_budget) || 0;
              const assigned = Number(cc.assigned_budget) || 0;
              const pct = assigned > 0 ? (executed / assigned) * 100 : 0;

              return (
                <div key={cc.id} className="bg-white p-4 rounded-lg border border-slate-300 shadow-sm space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-mono font-bold text-sky-900 text-sm">{cc.code}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCC(cc);
                        setCcCode(cc.code);
                        setCcName(cc.name);
                        setCcArea(cc.area);
                        setCcBudget(cc.assigned_budget);
                        setShowCCModal(true);
                      }}
                      className="text-xs text-purple-700 hover:underline font-bold flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Editar
                    </button>
                  </div>

                  <h3 className="text-calibri-title text-slate-800 text-xs font-bold">{cc.name}</h3>
                  <p className="text-[11px] text-slate-500">{cc.area}</p>

                  <div className="pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center justify-between text-slate-600 mb-1">
                      <span>Presupuesto Asignado:</span>
                      <strong className="text-slate-900 font-mono">${assigned.toLocaleString('es-CL')}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 mb-1">
                      <span>Gasto Ejecutado:</span>
                      <strong className="text-amber-800 font-mono">${executed.toLocaleString('es-CL')}</strong>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1.5">
                      <div
                        className={`h-full ${pct > 85 ? 'bg-rose-600' : 'bg-emerald-600'}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CREAR / EDITAR USUARIO INDIVIDUAL (CON AUTOFORMATO RUT)
      ========================================================================= */}
      {showUserModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={() => setShowUserModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl w-full max-w-md border border-slate-300 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-purple-800 text-white flex items-center justify-between">
              <h2 className="text-calibri-title text-white">
                {editingUser ? 'Editar Funcionario' : 'Crear Nuevo Usuario / Funcionario'}
              </h2>
              <button
                type="button"
                onClick={() => setShowUserModal(false)}
                className="text-white/80 hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre Completo: *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Marcelo Gómez Morales"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-calibri-normal text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    RUT (Autoformateado): *
                  </label>
                  <input
                    type="text"
                    required
                    value={rut}
                    onChange={(e) => handleRutChange(e.target.value)}
                    onBlur={handleRutBlur}
                    placeholder="12.345.678-K"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-calibri-normal text-xs font-mono font-bold text-sky-900"
                  />
                  <span className="text-[10px] text-slate-400">Formato XX.XXX.XXX-X</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rol en Sistema: *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-calibri-normal text-xs bg-white font-bold"
                  >
                    <option value="tecnico">Técnico de Terreno</option>
                    <option value="supervisor">Supervisor de Faena</option>
                    <option value="bodeguero_admin">Bodega & Administrativo</option>
                    <option value="jefe_seccion">Jefe de Sección</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Centro de Costos: *
                  </label>
                  <select
                    value={costCenterId}
                    onChange={(e) => setCostCenterId(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-calibri-normal text-xs bg-white"
                  >
                    {costCenters.map((cc) => (
                      <option key={cc.id} value={cc.id}>
                        {cc.code} ({cc.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contraseña de Acceso: *
                  </label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="123456"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-calibri-normal text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Correo Electrónico:
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@empresa.cl"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-calibri-normal text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teléfono de Contacto:
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+56 9 1234 5678"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-calibri-normal text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded text-xs text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded text-xs shadow-sm"
                >
                  {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CREAR / EDITAR CENTRO DE COSTOS
      ========================================================================= */}
      {showCCModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={() => setShowCCModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl w-full max-w-md border border-slate-300 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-purple-800 text-white flex items-center justify-between">
              <h2 className="text-calibri-title text-white">
                {editingCC ? 'Editar Centro de Costos' : 'Crear Centro de Costos'}
              </h2>
              <button
                type="button"
                onClick={() => setShowCCModal(false)}
                className="text-white/80 hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCC} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Código de Identificación: *
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingCC}
                  value={ccCode}
                  onChange={(e) => setCcCode(e.target.value.toUpperCase())}
                  placeholder="CC-105"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-calibri-normal text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre Descriptivo del CC: *
                </label>
                <input
                  type="text"
                  required
                  value={ccName}
                  onChange={(e) => setCcName(e.target.value)}
                  placeholder="Ej: Operaciones Especiales Subterráneas"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-calibri-normal text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Área o Departamento: *
                </label>
                <input
                  type="text"
                  required
                  value={ccArea}
                  onChange={(e) => setCcArea(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-calibri-normal text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Presupuesto Asignado (CLP): *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={ccBudget}
                  onChange={(e) => setCcBudget(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-calibri-normal text-xs font-mono font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowCCModal(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded text-xs text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded text-xs shadow-sm"
                >
                  Guardar Centro de Costos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CARGA MASIVA EXCEL / CSV CON PLANTILLA
      ========================================================================= */}
      {showBulkModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setShowBulkModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl w-full max-w-2xl border border-slate-300 overflow-hidden my-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-emerald-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-300" />
                <h2 className="text-calibri-title text-white">
                  Carga Masiva de Usuarios desde Archivo Excel / CSV
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="text-white/80 hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
                <p className="text-slate-800 font-bold">Instrucciones de Carga:</p>
                <p className="text-slate-600">
                  1. Descarga la plantilla predefinida o utiliza un archivo delimitado por comas (.csv) con las columnas:
                  <code className="block bg-slate-200 px-1 py-0.5 rounded font-mono text-[11px] mt-1 text-slate-800">
                    Nombre, RUT, Rol, CentroCosto, Email, Telefono, Password
                  </code>
                </p>
                <p className="text-slate-600">
                  2. <strong>RUT Automático:</strong> Puedes ingresar los RUT con o sin puntos y guión; el sistema los convertirá automáticamente al formato oficial <code>XX.XXX.XXX-X</code>.
                </p>
              </div>

              {/* Selector de Archivo */}
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-emerald-500 transition-colors bg-slate-50/50">
                <input
                  type="file"
                  id="csvFileInput"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="csvFileInput"
                  className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
                >
                  <Upload className="w-8 h-8 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800">
                    Haz clic aquí para seleccionar tu archivo CSV o Excel guardado como CSV
                  </span>
                  <span className="text-[11px] text-slate-500">Formato admitido: .csv delimitado por comas o punto y coma</span>
                </label>
              </div>

              {/* O pegar texto directo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  O pega directamente el contenido aquí:
                </label>
                <textarea
                  rows={4}
                  value={bulkCsvText}
                  onChange={(e) => {
                    setBulkCsvText(e.target.value);
                    parseCsvContent(e.target.value);
                  }}
                  placeholder="Nombre,RUT,Rol,CentroCosto,Email,Telefono,Password&#10;Raúl Castro,168942215,tecnico,CC-101,raul@empresa.cl,+56911223344,123456"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono"
                />
              </div>

              {bulkError && (
                <div className="p-2.5 bg-rose-50 border border-rose-300 rounded text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{bulkError}</span>
                </div>
              )}

              {/* Vista Previa de Filas Parseadas */}
              {bulkPreview.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Vista Previa: {bulkPreview.length} usuarios listos para ser importados
                  </span>
                  <div className="max-h-40 overflow-y-auto border border-slate-200 rounded">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                        <tr>
                          <th className="p-1.5">Nombre</th>
                          <th className="p-1.5">RUT Formateado</th>
                          <th className="p-1.5">Rol</th>
                          <th className="p-1.5">CC</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {bulkPreview.map((u, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-1.5 font-medium">{u.name}</td>
                            <td className="p-1.5 font-mono font-bold text-sky-900">{u.rut}</td>
                            <td className="p-1.5 uppercase text-[10px]">{u.role}</td>
                            <td className="p-1.5">{u.cost_center_id}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t">
                <button
                  type="button"
                  onClick={downloadCsvTemplate}
                  className="text-xs text-sky-700 hover:underline font-bold flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> Descargar Plantilla
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBulkModal(false)}
                    className="px-3.5 py-1.5 border border-slate-300 rounded text-xs text-slate-600 hover:bg-slate-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={bulkPreview.length === 0}
                    onClick={handleExecuteBulkImport}
                    className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded text-xs shadow-sm"
                  >
                    Importar {bulkPreview.length} Usuarios a la Base de Datos
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
