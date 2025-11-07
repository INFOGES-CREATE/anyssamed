"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Shield,
  Bell,
  Database,
  Mail,
  Globe,
  Lock,
  Key,
  Server,
  Zap,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Moon,
  Sun,
  Eye,
  EyeOff,
  Upload,
  Download,
  Trash2,
  Plus,
  X,
  Building2,
  Users,
  Clock,
  DollarSign,
  FileText,
  Smartphone,
  Wifi,
  HardDrive,
  Activity,
} from "lucide-react";
import Link from "next/link";

interface ConfiguracionSistema {
  id_configuracion: number;
  clave: string;
  valor: string;
  tipo_dato: string;
  categoria: string;
  descripcion: string;
  es_publica: boolean;
  requiere_reinicio: boolean;
  fecha_modificacion: string;
}

interface ConfiguracionesAgrupadas {
  [categoria: string]: ConfiguracionSistema[];
}

export default function ConfiguracionPage() {
  const [configuraciones, setConfiguraciones] = useState<ConfiguracionesAgrupadas>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedTab, setSelectedTab] = useState("general");
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});
  const [cambios, setCambios] = useState<{ [key: string]: string }>({});
  const [mensaje, setMensaje] = useState<{ tipo: "success" | "error"; texto: string } | null>(null);

  // Categorías de configuración
  const categorias = [
    { id: "general", nombre: "General", icon: Settings, color: "blue" },
    { id: "seguridad", nombre: "Seguridad", icon: Shield, color: "red" },
    { id: "notificaciones", nombre: "Notificaciones", icon: Bell, color: "yellow" },
    { id: "email", nombre: "Email", icon: Mail, color: "green" },
    { id: "base_datos", nombre: "Base de Datos", icon: Database, color: "purple" },
    { id: "api", nombre: "APIs", icon: Globe, color: "indigo" },
    { id: "sistema", nombre: "Sistema", icon: Server, color: "gray" },
    { id: "facturacion", nombre: "Facturación", icon: DollarSign, color: "emerald" },
  ];

  useEffect(() => {
    fetchConfiguraciones();
  }, []);

  const fetchConfiguraciones = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/configuracion", {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Error al cargar configuraciones");

      const data = await response.json();
      
      // Agrupar por categoría
      const agrupadas: ConfiguracionesAgrupadas = {};
      data.configuraciones.forEach((config: ConfiguracionSistema) => {
        if (!agrupadas[config.categoria]) {
          agrupadas[config.categoria] = [];
        }
        agrupadas[config.categoria].push(config);
      });

      setConfiguraciones(agrupadas);
    } catch (error: any) {
      setMensaje({ tipo: "error", texto: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (clave: string, valor: string) => {
    setCambios({ ...cambios, [clave]: valor });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMensaje(null);

      const response = await fetch("/api/admin/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ cambios }),
      });

      if (!response.ok) throw new Error("Error al guardar configuraciones");

      const data = await response.json();
      
      setMensaje({ tipo: "success", texto: "Configuraciones guardadas exitosamente" });
      setCambios({});
      
      // Verificar si requiere reinicio
      const requiereReinicio = Object.keys(cambios).some((clave) => {
        for (const categoria in configuraciones) {
          const config = configuraciones[categoria].find((c) => c.clave === clave);
          if (config?.requiere_reinicio) return true;
        }
        return false;
      });

      if (requiereReinicio) {
        setMensaje({
          tipo: "success",
          texto: "Configuraciones guardadas. Se requiere reiniciar el sistema para aplicar algunos cambios.",
        });
      }

      await fetchConfiguraciones();
    } catch (error: any) {
      setMensaje({ tipo: "error", texto: error.message });
    } finally {
      setSaving(false);
    }
  };

  const renderInput = (config: ConfiguracionSistema) => {
    const valor = cambios[config.clave] ?? config.valor;
    const inputClasses = `w-full px-4 py-3 rounded-xl border transition-all duration-300 ${
      darkMode
        ? "bg-gray-700 border-gray-600 text-white focus:border-indigo-500"
        : "bg-white border-gray-300 text-gray-900 focus:border-indigo-500"
    } focus:ring-2 focus:ring-indigo-500/20`;

    switch (config.tipo_dato) {
      case "boolean":
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={valor === "true" || valor === "1"}
              onChange={(e) => handleChange(config.clave, e.target.checked ? "true" : "false")}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
          </label>
        );

      case "password":
        return (
          <div className="relative">
            <input
              type={showPassword[config.clave] ? "text" : "password"}
              value={valor}
              onChange={(e) => handleChange(config.clave, e.target.value)}
              className={inputClasses}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword({ ...showPassword, [config.clave]: !showPassword[config.clave] })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword[config.clave] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        );

      case "number":
        return (
          <input
            type="number"
            value={valor}
            onChange={(e) => handleChange(config.clave, e.target.value)}
            className={inputClasses}
          />
        );

      case "textarea":
        return (
          <textarea
            value={valor}
            onChange={(e) => handleChange(config.clave, e.target.value)}
            rows={4}
            className={inputClasses}
          />
        );

      case "select":
        // Aquí puedes agregar opciones específicas según la configuración
        return (
          <select value={valor} onChange={(e) => handleChange(config.clave, e.target.value)} className={inputClasses}>
            <option value="">Seleccionar...</option>
            {/* Agregar opciones dinámicas */}
          </select>
        );

      default:
        return (
          <input
            type="text"
            value={valor}
            onChange={(e) => handleChange(config.clave, e.target.value)}
            className={inputClasses}
          />
        );
    }
  };

  const getCategoriaColor = (categoriaId: string) => {
    const categoria = categorias.find((c) => c.id === categoriaId);
    return categoria?.color || "gray";
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
            Cargando configuraciones...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Header */}
      <div className={`sticky top-0 z-50 backdrop-blur-xl border-b ${darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-gray-200"}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className={`p-2 rounded-xl transition-colors ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
              >
                <Settings className="w-6 h-6" />
              </Link>
              <div>
                <h1 className={`text-2xl font-black ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Configuración del Sistema
                </h1>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Administra todos los parámetros del sistema
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-3 rounded-xl transition-all ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"}`}
              >
                {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
              </button>

              <button
                onClick={fetchConfiguraciones}
                disabled={loading}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                  darkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-white hover:bg-gray-50 text-gray-900"
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Actualizar
              </button>

              {Object.keys(cambios).length > 0 && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl flex items-center gap-2 font-semibold shadow-lg disabled:opacity-50"
                >
                  <Save className={`w-4 h-4 ${saving ? "animate-pulse" : ""}`} />
                  Guardar Cambios ({Object.keys(cambios).length})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje de estado */}
      {mensaje && (
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <div
            className={`rounded-xl p-4 flex items-center gap-3 ${
              mensaje.tipo === "success"
                ? darkMode
                  ? "bg-green-900/30 border border-green-500/50 text-green-300"
                  : "bg-green-50 border border-green-200 text-green-800"
                : darkMode
                ? "bg-red-900/30 border border-red-500/50 text-red-300"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {mensaje.tipo === "success" ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            <p className="font-semibold">{mensaje.texto}</p>
            <button onClick={() => setMensaje(null)} className="ml-auto">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar de categorías */}
          <div className={`lg:col-span-1 rounded-2xl p-6 h-fit sticky top-24 ${darkMode ? "bg-gray-800" : "bg-white"} shadow-xl`}>
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>Categorías</h3>
            <div className="space-y-2">
              {categorias.map((categoria) => {
                const Icon = categoria.icon;
                const count = configuraciones[categoria.id]?.length || 0;
                const isActive = selectedTab === categoria.id;

                return (
                  <button
                    key={categoria.id}
                    onClick={() => setSelectedTab(categoria.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? `bg-${categoria.color}-500 text-white shadow-lg`
                        : darkMode
                        ? "hover:bg-gray-700 text-gray-300"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="flex-1 text-left font-semibold">{categoria.nombre}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        isActive ? "bg-white/20" : darkMode ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contenido de configuraciones */}
          <div className="lg:col-span-3 space-y-6">
            {configuraciones[selectedTab]?.map((config) => (
              <div
                key={config.id_configuracion}
                className={`rounded-2xl p-6 shadow-xl border ${
                  darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {config.clave.replace(/_/g, " ").toUpperCase()}
                      </h4>
                      {config.requiere_reinicio && (
                        <span className="px-3 py-1 bg-yellow-500/20 text-yellow-600 rounded-full text-xs font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Requiere reinicio
                        </span>
                      )}
                      {!config.es_publica && (
                        <span className="px-3 py-1 bg-red-500/20 text-red-600 rounded-full text-xs font-bold flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Privado
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{config.descripcion}</p>
                  </div>
                </div>

                {renderInput(config)}

                <div className={`mt-3 text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                  Última modificación: {new Date(config.fecha_modificacion).toLocaleString("es-CL")}
                </div>
              </div>
            ))}

            {(!configuraciones[selectedTab] || configuraciones[selectedTab].length === 0) && (
              <div className={`rounded-2xl p-12 text-center ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                <Settings className={`w-16 h-16 mx-auto mb-4 ${darkMode ? "text-gray-600" : "text-gray-300"}`} />
                <p className={`text-lg font-semibold ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  No hay configuraciones en esta categoría
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
