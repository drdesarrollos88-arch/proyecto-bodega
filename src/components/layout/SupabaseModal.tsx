import React, { useState } from 'react';
import { X, Database, Check, Copy, ExternalLink, ShieldCheck, RefreshCw } from 'lucide-react';
import { getSupabaseConfig, configureSupabase } from '../../services/supabase';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [key, setKey] = useState(currentConfig.key);
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const success = configureSupabase(url, key);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
        window.location.reload();
      }, 800);
    }
  };

  const copySchemaSQL = async () => {
    try {
      const response = await fetch('/supabase/schema.sql');
      let sqlText = '';
      if (response.ok) {
        sqlText = await response.text();
      } else {
        sqlText = `-- Ejecuta el archivo supabase/schema.sql ubicado en la raíz del proyecto`;
      }
      await navigator.clipboard.writeText(sqlText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl border border-slate-300 overflow-hidden my-6">
        {/* Encabezado */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800 text-white">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <h2 className="text-calibri-title text-white">Integración con Base de Datos Supabase</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-calibri-title text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sky-700" /> Estado de la Conexión
              </span>
              {currentConfig.isConnected ? (
                <span className="px-2 py-0.5 rounded text-calibri-normal bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300">
                  Conectado a Supabase
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-calibri-normal bg-sky-100 text-sky-800 font-semibold border border-sky-300">
                  Modo Local Resiliente (Listo para enlazar)
                </span>
              )}
            </div>
            <p className="text-calibri-normal text-slate-600">
              La plataforma incluye sincronización directa con Supabase. También opera con persistencia local reactiva y semillas de prueba para que los técnicos, supervisores y jefes operen sin interrupciones.
            </p>
          </div>

          {/* Formulario de Configuración de Llaves */}
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-calibri-normal font-bold text-slate-700 mb-1">
                Project URL de Supabase (VITE_SUPABASE_URL):
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://tu-proyecto.supabase.co"
                className="w-full px-3 py-2 border border-slate-300 rounded text-calibri-normal text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-600"
              />
            </div>

            <div>
              <label className="block text-calibri-normal font-bold text-slate-700 mb-1">
                Project Anon Key (VITE_SUPABASE_ANON_KEY):
              </label>
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2 border border-slate-300 rounded text-calibri-normal text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-600 font-mono text-xs"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-calibri-normal text-sky-700 hover:text-sky-800 underline"
              >
                Abrir consola de Supabase <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 border border-slate-300 rounded text-calibri-normal text-slate-600 hover:bg-slate-100"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded text-calibri-normal font-bold shadow-sm"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-4 h-4" /> Conectando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" /> Guardar y Conectar
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Guía de Esquema SQL */}
          <div className="border-t border-slate-200 pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-calibri-title text-slate-800">
                Esquema SQL (`supabase/schema.sql`)
              </span>
              <button
                type="button"
                onClick={copySchemaSQL}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 text-calibri-normal"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> ¡Copiado al portapapeles!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copiar SQL para Supabase
                  </>
                )}
              </button>
            </div>
            <p className="text-calibri-normal text-slate-500 text-xs">
              Pega este script en el <strong>SQL Editor</strong> de tu proyecto Supabase para crear las 7 tablas, centros de costo, usuarios y el catálogo completo de productos con stock y niveles críticos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
