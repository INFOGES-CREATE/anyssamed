// src/components/tecnico/SidebarTecnico.tsx
"use client";

import React, { Dispatch, SetStateAction, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  ClipboardList,
  Plus,
  Search,
  FileText,
  CheckSquare,
  Clock,
  Calendar,
  CheckCircle2,
  Cpu,
  Wrench,
  AlertCircle,
  AlertTriangle,
  Database,
  MessageSquare,
  Mail,
  Phone,
  BarChart3,
  TrendingUp,
  Target,
  User,
  Sparkles,
  PenTool,
  Shield,
  Settings,
  SlidersHorizontal,
  Eye,
  Globe,
  Bell,
  Lock,
  ShieldCheck,
  Activity,
  History,
  RefreshCcw,
  Smartphone,
  Key,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

type TemaSidebar = {
  colores: {
    sidebar: string;
    borde: string;
    sombra: string;
    hover: string;
    texto: string;
    textoSecundario: string;
    acento: string;
    card: string;
  };
};

type UsuarioSidebar = {
  nombre: string;
  apellido_paterno: string;
  foto_perfil_url: string | null;
};

type EstadisticasSidebar = {
  tickets_asignados_hoy: number;
  tareas_pendientes: number;
  alertas_activas: number;
  mensajes_sin_leer: number;
};

type SubMenuItem = {
  titulo: string;
  icono: React.ComponentType<{ className?: string }>;
  url: string;
  requiereNivel?: string[];
};

type MenuItem = {
  titulo: string;
  icono: React.ComponentType<{ className?: string }>;
  url: string;
  badge?: number;
  submenu?: SubMenuItem[];
};

interface SidebarTecnicoProps {
  usuario: UsuarioSidebar;
  tema: TemaSidebar;
  sidebarAbierto: boolean;
  setSidebarAbierto: Dispatch<SetStateAction<boolean>>;
  estadisticas?: any;
}

const SidebarTecnico: React.FC<SidebarTecnicoProps> = ({
  usuario,
  tema,
  sidebarAbierto,
  setSidebarAbierto,
  estadisticas,
}) => {
  const pathname = usePathname();
  const [menuExpandido, setMenuExpandido] = useState<string | null>(null);

  const isActive = (url: string) => {
    if (url === "/tecnico") {
      return pathname === "/tecnico";
    }
    return pathname.startsWith(url);
  };

  const menuItems: MenuItem[] = useMemo(
    () => [
      // ==============================
      // DASHBOARD
      // ==============================
      {
        titulo: "Dashboard",
        icono: Home,
        url: "/tecnico",
      },

      // ==============================
      // TICKETS
      // ==============================
      {
        titulo: "Tickets",
        icono: ClipboardList,
        url: "/tecnico/tickets",
        badge: estadisticas?.tickets_asignados_hoy ?? 0,
        submenu: [
          { titulo: "Mis Tickets", icono: ClipboardList, url: "/tecnico/tickets" },
          { titulo: "Nuevo Ticket", icono: Plus, url: "/tecnico/tickets/nuevo" },
          { titulo: "Búsqueda", icono: Search, url: "/tecnico/tickets/buscar" },
          { titulo: "Historial", icono: FileText, url: "/tecnico/tickets/historial" },
        ],
      },

      // ==============================
      // TAREAS
      // ==============================
      {
        titulo: "Tareas",
        icono: CheckSquare,
        url: "/tecnico/tareas",
        badge: estadisticas?.tareas_pendientes ?? 0,
        submenu: [
          { titulo: "Pendientes", icono: Clock, url: "/tecnico/tareas/pendientes" },
          { titulo: "Programadas", icono: Calendar, url: "/tecnico/tareas/programadas" },
          { titulo: "Completadas", icono: CheckCircle2, url: "/tecnico/tareas/completadas" },
        ],
      },

      // ==============================
      // EQUIPOS
      // ==============================
      {
        titulo: "Equipos",
        icono: Cpu,
        url: "/tecnico/equipos",
        submenu: [
          { titulo: "Todos", icono: Cpu, url: "/tecnico/equipos" },
          { titulo: "Mantenimiento", icono: Wrench, url: "/tecnico/equipos/mantenimiento" },
          { titulo: "Alertas", icono: AlertCircle, url: "/tecnico/equipos/alertas" },
          { titulo: "Inventario", icono: Database, url: "/tecnico/equipos/inventario" },
        ],
      },

      // ==============================
      // MANTENIMIENTO
      // ==============================
      {
        titulo: "Mantenimiento",
        icono: Wrench,
        url: "/tecnico/mantenimiento",
        submenu: [
          { titulo: "Programado", icono: Calendar, url: "/tecnico/mantenimiento/programado" },
          { titulo: "Correctivo", icono: AlertTriangle, url: "/tecnico/mantenimiento/correctivo" },
          { titulo: "Historial", icono: FileText, url: "/tecnico/mantenimiento/historial" },
        ],
      },

      // ==============================
      // ALERTAS
      // ==============================
      {
        titulo: "Alertas",
        icono: AlertCircle,
        url: "/tecnico/alertas",
        badge: estadisticas?.alertas_activas ?? 0,
        submenu: [
          { titulo: "Activas", icono: AlertCircle, url: "/tecnico/alertas/activas" },
          { titulo: "Resueltas", icono: CheckCircle2, url: "/tecnico/alertas/resueltas" },
          { titulo: "Configuración", icono: Settings, url: "/tecnico/alertas/config" },
        ],
      },

      // ==============================
      // MENSAJES
      // ==============================
      {
        titulo: "Mensajes",
        icono: MessageSquare,
        url: "/secretaria/mensajes",
        badge: estadisticas?.mensajes_sin_leer ?? 0,
        submenu: [
          { titulo: "Bandeja", icono: Mail, url: "/secretaria/mensajes" },
          { titulo: "WhatsApp", icono: MessageSquare, url: "/secretaria/mensajes/whatsapp" },
          { titulo: "SMS", icono: Phone, url: "/secretaria/mensajes/sms" },
          { titulo: "Email", icono: Mail, url: "/secretaria/mensajes/email" },
          { titulo: "Automáticos", icono: Mail, url: "/secretaria/mensajes/auto" },
        ],
      },

      // ==============================
      // REPORTES
      // ==============================
      {
        titulo: "Reportes",
        icono: BarChart3,
        url: "/tecnico/reportes",
        submenu: [
          { titulo: "Mis Métricas", icono: TrendingUp, url: "/tecnico/reportes/metricas" },
          { titulo: "Tickets", icono: ClipboardList, url: "/tecnico/reportes/tickets" },
          { titulo: "Equipos", icono: Cpu, url: "/tecnico/reportes/equipos" },
          { titulo: "Rendimiento", icono: Target, url: "/tecnico/reportes/rendimiento" },
        ],
      },

      // ==============================
      // PERFIL
      // ==============================
      {
        titulo: "Mi Perfil",
        icono: User,
        url: "/tecnico/perfil",
        submenu: [
          { titulo: "Información", icono: User, url: "/tecnico/perfil" },
          { titulo: "Horarios", icono: Clock, url: "/tecnico/perfil/horarios" },
          { titulo: "Certificaciones", icono: FileText, url: "/tecnico/perfil/certificaciones" },
          { titulo: "Especialidad", icono: Sparkles, url: "/tecnico/perfil/especialidad" },
          { titulo: "Firma Digital", icono: PenTool, url: "/tecnico/perfil/firma" },
          { titulo: "PIN de Seguridad", icono: Shield, url: "/tecnico/perfil/pin" },
          { titulo: "Preferencias", icono: Settings, url: "/tecnico/perfil/preferencias" },
        ],
      },

      // ==============================
      // CONFIGURACIÓN
      // ==============================
      {
        titulo: "Configuración",
        icono: Settings,
        url: "/tecnico/configuracion",
        submenu: [
          { titulo: "General", icono: Settings, url: "/tecnico/configuracion/general" },
          { titulo: "Preferencias", icono: SlidersHorizontal, url: "/tecnico/configuracion/preferencias" },
          { titulo: "Temas", icono: Sparkles, url: "/tecnico/configuracion/temas" },
          { titulo: "Accesibilidad", icono: Eye, url: "/tecnico/configuracion/accesibilidad" },
          { titulo: "Idioma", icono: Globe, url: "/tecnico/configuracion/idioma" },
          { titulo: "Zona Horaria", icono: Clock, url: "/tecnico/configuracion/zona-horaria" },
          { titulo: "Notificaciones", icono: Bell, url: "/tecnico/configuracion/notificaciones" },
          { titulo: "Alertas Inteligentes", icono: AlertCircle, url: "/tecnico/configuracion/alertas-inteligentes" },
          { titulo: "Seguridad", icono: Lock, url: "/tecnico/configuracion/seguridad" },
          { titulo: "PIN de Seguridad", icono: ShieldCheck, url: "/tecnico/configuracion/pin" },
          { titulo: "Firma Digital", icono: PenTool, url: "/tecnico/configuracion/firma-digital" },
          { titulo: "Sesiones y Dispositivos", icono: Smartphone, url: "/tecnico/configuracion/sesiones" },
          { titulo: "Permisos", icono: Shield, url: "/tecnico/configuracion/permisos" },
          {
            titulo: "API Key",
            icono: Key,
            url: "/tecnico/configuracion/api-key",
            requiereNivel: ["avanzado", "administrador"],
          },
          { titulo: "Actividad Reciente", icono: Activity, url: "/tecnico/configuracion/actividad" },
          { titulo: "Historial de Cambios", icono: History, url: "/tecnico/configuracion/auditoria" },
          { titulo: "Sincronización", icono: RefreshCcw, url: "/tecnico/configuracion/sync" },
        ],
      },
    ],
    [estadisticas]
  );

  return (
    <aside
      className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 ${
        sidebarAbierto ? "w-72" : "w-20"
      } ${tema.colores.sidebar} ${tema.colores.borde} border-r ${tema.colores.sombra}`}
    >
      <div className="flex flex-col h-full">
        {/* Logo y Toggle */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          {sidebarAbierto ? (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-black ${tema.colores.texto}`}>
                  AnyssaMed
                </h1>
                <p className={`text-xs font-semibold ${tema.colores.acento}`}>
                  Panel Técnico
                </p>
              </div>
            </div>
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg mx-auto">
              <Wrench className="w-6 h-6 text-white" />
            </div>
          )}

          <button
            onClick={() => setSidebarAbierto((prev) => !prev)}
            className={`p-2 rounded-lg ${tema.colores.hover} transition-colors ${
              !sidebarAbierto && "mx-auto mt-4"
            }`}
          >
            <ChevronRight
              className={`w-5 h-5 ${tema.colores.texto} transition-transform ${
                sidebarAbierto ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* Menú de Navegación */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
          {menuItems.map((item) => {
            const activo = isActive(item.url);

            return (
              <div key={item.titulo} className="mb-1">
                <Link
                  href={item.url}
                  className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 group ${
                    activo
                      ? `bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white ${tema.colores.sombra}`
                      : `${tema.colores.hover} ${tema.colores.texto}`
                  }`}
                  onClick={() => {
                    if (item.submenu) {
                      setMenuExpandido((prev) =>
                        prev === item.titulo ? null : item.titulo
                      );
                    }
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <item.icono
                      className={`w-5 h-5 flex-shrink-0 ${
                        activo ? "text-white" : tema.colores.acento
                      }`}
                    />
                    {sidebarAbierto && (
                      <span className="truncate">{item.titulo}</span>
                    )}
                  </div>

                  {sidebarAbierto && item.badge && item.badge > 0 && (
                    <span
                      className={`px-2 py-1 text-xs font-bold rounded-full ${
                        activo
                          ? "bg-white/20 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}

                  {sidebarAbierto && item.submenu && (
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        menuExpandido === item.titulo ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </Link>

                {/* Submenú */}
                {sidebarAbierto &&
                  item.submenu &&
                  menuExpandido === item.titulo && (
                    <div className="mt-2 ml-4 space-y-1">
                      {item.submenu.map((subitem) => (
                        <Link
                          key={subitem.titulo}
                          href={subitem.url}
                          className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${tema.colores.hover} ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
                        >
                          <subitem.icono className="w-4 h-4" />
                          <span>{subitem.titulo}</span>
                        </Link>
                      ))}
                    </div>
                  )}
              </div>
            );
          })}
        </nav>

        {/* Usuario abajo */}
        <div className={`p-4 border-t ${tema.colores.borde}`}>
          {sidebarAbierto ? (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
                {usuario.foto_perfil_url ? (
                  <Image
                    src={usuario.foto_perfil_url}
                    alt={usuario.nombre}
                    width={48}
                    height={48}
                    className="rounded-xl object-cover"
                  />
                ) : (
                  `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold truncate ${tema.colores.texto}`}>
                  {usuario.nombre} {usuario.apellido_paterno}
                </p>
                <p
                  className={`text-xs font-medium truncate ${tema.colores.textoSecundario}`}
                >
                  Técnico
                </p>
              </div>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg mx-auto">
              {usuario.foto_perfil_url ? (
                <Image
                  src={usuario.foto_perfil_url}
                  alt={usuario.nombre}
                  width={48}
                  height={48}
                  className="rounded-xl object-cover"
                />
              ) : (
                `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default SidebarTecnico;
