// src/components/tecnico/SidebarTecnico.tsx
"use client";

import React, { Dispatch, SetStateAction, useMemo, useState, useEffect } from "react";
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
  X,
  Menu,
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
  const [esMobile, setEsMobile] = useState(false);
  const [mostrarSidebarMobile, setMostrarSidebarMobile] = useState(false);

  // Hook para detectar el tamaño de pantalla
  useEffect(() => {
    const detectarTamañoPantalla = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setEsMobile(mobile);

      // En móvil, cerrar el sidebar por defecto
      if (mobile && sidebarAbierto) {
        setSidebarAbierto(false);
        setMostrarSidebarMobile(false);
      }
    };

    // Ejecutar al montar
    detectarTamañoPantalla();

    // Listener para cambios de tamaño
    window.addEventListener("resize", detectarTamañoPantalla);

    // Cleanup
    return () => {
      window.removeEventListener("resize", detectarTamañoPantalla);
    };
  }, []);

  // Cerrar sidebar mobile al cambiar de ruta
  useEffect(() => {
    if (esMobile) {
      setMostrarSidebarMobile(false);
      setMenuExpandido(null);
    }
  }, [pathname, esMobile]);

  // Prevenir scroll del body cuando el sidebar mobile está abierto
  useEffect(() => {
    if (esMobile && mostrarSidebarMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [esMobile, mostrarSidebarMobile]);

  const isActive = (url: string) => {
    if (url === "/tecnico") {
      return pathname === "/tecnico";
    }
    return pathname.startsWith(url);
  };

  const toggleSidebarMobile = () => {
    if (esMobile) {
      setMostrarSidebarMobile(!mostrarSidebarMobile);
    } else {
      setSidebarAbierto(!sidebarAbierto);
    }
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
        url: "/tecnico/mensajes",
        badge: estadisticas?.mensajes_sin_leer ?? 0,
        submenu: [
          { titulo: "Bandeja", icono: Mail, url: "/tecnico/mensajes" },
          { titulo: "WhatsApp", icono: MessageSquare, url: "/tecnico/mensajes/whatsapp" },
          { titulo: "SMS", icono: Phone, url: "/tecnico/mensajes/sms" },
          { titulo: "Email", icono: Mail, url: "/tecnico/mensajes/email" },
          { titulo: "Automáticos", icono: Mail, url: "/tecnico/mensajes/auto" },
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

  const ContenidoSidebar = () => (
    <>
      {/* Logo y Toggle */}
      <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
        {(sidebarAbierto || mostrarSidebarMobile) ? (
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
          onClick={toggleSidebarMobile}
          className={`p-2 rounded-lg ${tema.colores.hover} transition-colors ${
            !sidebarAbierto && !esMobile && "mx-auto mt-4"
          }`}
          aria-label={mostrarSidebarMobile || sidebarAbierto ? "Cerrar menú" : "Abrir menú"}
        >
          {esMobile && mostrarSidebarMobile ? (
            <X className={`w-5 h-5 ${tema.colores.texto}`} />
          ) : (
            <ChevronRight
              className={`w-5 h-5 ${tema.colores.texto} transition-transform ${
                sidebarAbierto ? "rotate-180" : ""
              }`}
            />
          )}
        </button>
      </div>

      {/* Menú de Navegación */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
        {menuItems.map((item) => {
          const activo = isActive(item.url);
          const tieneSubmenu = item.submenu && item.submenu.length > 0;
          const submenuExpandido = menuExpandido === item.titulo;

          return (
            <div key={item.titulo} className="mb-1">
              <div
                className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 group cursor-pointer ${
                  activo
                    ? `bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white ${tema.colores.sombra}`
                    : `${tema.colores.hover} ${tema.colores.texto}`
                }`}
                onClick={(e) => {
                  if (tieneSubmenu) {
                    e.preventDefault();
                    setMenuExpandido((prev) =>
                      prev === item.titulo ? null : item.titulo
                    );
                  }
                }}
              >
                <Link
                  href={item.url}
                  className="flex items-center gap-3 min-w-0 flex-1"
                  onClick={(e) => {
                    if (tieneSubmenu && (sidebarAbierto || mostrarSidebarMobile)) {
                      e.preventDefault();
                    }
                  }}
                >
                  <item.icono
                    className={`w-5 h-5 flex-shrink-0 ${
                      activo ? "text-white" : tema.colores.acento
                    }`}
                  />
                  {(sidebarAbierto || mostrarSidebarMobile) && (
                    <span className="truncate">{item.titulo}</span>
                  )}
                </Link>

                <div className="flex items-center gap-2">
                  {(sidebarAbierto || mostrarSidebarMobile) && item.badge && item.badge > 0 && (
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

                  {(sidebarAbierto || mostrarSidebarMobile) && tieneSubmenu && (
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        submenuExpandido ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </div>
              </div>

              {/* Submenú */}
              {(sidebarAbierto || mostrarSidebarMobile) &&
                tieneSubmenu &&
                submenuExpandido && (
                  <div className="mt-2 ml-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
                    {item.submenu!.map((subitem) => {
                      const subActivo = isActive(subitem.url);
                      return (
                        <Link
                          key={subitem.titulo}
                          href={subitem.url}
                          className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                            subActivo
                              ? `bg-gradient-to-r from-indigo-500/20 to-purple-500/20 ${tema.colores.acento}`
                              : `${tema.colores.hover} ${tema.colores.textoSecundario} hover:${tema.colores.acento}`
                          }`}
                        >
                          <subitem.icono className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{subitem.titulo}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
            </div>
          );
        })}
      </nav>

      {/* Usuario abajo */}
      <div className={`p-4 border-t ${tema.colores.borde}`}>
        {(sidebarAbierto || mostrarSidebarMobile) ? (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
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
    </>
  );

  return (
    <>
      {/* Botón flotante para móvil */}
      {esMobile && !mostrarSidebarMobile && (
        <button
          onClick={() => setMostrarSidebarMobile(true)}
          className="fixed top-4 left-4 z-50 p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-2xl hover:shadow-indigo-500/50 transition-all duration-300 hover:scale-110 lg:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Overlay para móvil */}
      {esMobile && mostrarSidebarMobile && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setMostrarSidebarMobile(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 ${
          esMobile
            ? mostrarSidebarMobile
              ? "translate-x-0 w-80"
              : "-translate-x-full w-80"
            : sidebarAbierto
            ? "w-72"
            : "w-20"
        } ${tema.colores.sidebar} ${tema.colores.borde} border-r ${tema.colores.sombra}`}
      >
        <div className="flex flex-col h-full">
          <ContenidoSidebar />
        </div>
      </aside>

      {/* Espaciador para el contenido principal (solo en desktop) */}
      {!esMobile && (
        <div
          className={`transition-all duration-300 ${
            sidebarAbierto ? "w-72" : "w-20"
          }`}
          aria-hidden="true"
        />
      )}

      {/* Estilos adicionales */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5);
        }

        @keyframes slide-in-from-top-2 {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-in {
          animation-fill-mode: both;
        }

        .slide-in-from-top-2 {
          animation-name: slide-in-from-top-2;
        }

        .duration-200 {
          animation-duration: 200ms;
        }
      `}</style>
    </>
  );
};

export default SidebarTecnico;