"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MessageSquare,
  MessageCircle,
  Send,
  Paperclip,
  PhoneCall,
  ClipboardCheck,
  Video,
  Mic,
  Sparkles,
  Search,
  Bell,
  BellOff,
  ChevronRight,
  ChevronDown,
  X,
  Plus,
  Settings,
  User,
  LogOut,
  Laptop,
  Sun,
  Moon,
  Wifi,
  HeartPulse,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Mail,
  Phone,
  Bot,
  Tag,
  FolderKanban,
  Check,
  Star,
  Archive,
  Trash2,
  Globe,
  Clock,
  Shield,
  Filter,
  CheckCircle2,
  Pin,
} from "lucide-react";

type TemaColor = "light" | "dark" | "blue" | "purple" | "green";

interface ConfiguracionTema {
  nombre: string;
  icono: any;
  colores: {
    fondo: string;
    fondoSecundario: string;
    texto: string;
    textoSecundario: string;
    primario: string;
    secundario: string;
    acento: string;
    borde: string;
    sombra: string;
    gradiente: string;
    sidebar: string;
    header: string;
    card: string;
    hover: string;
  };
}

interface UsuarioSesion {
  id_usuario: number;
  username: string;
  email: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  foto_perfil_url: string | null;
  rol: {
    id_rol: number;
    nombre: string;
    nivel_jerarquia: number;
  };
  medico?: {
    id_medico: number;
    numero_registro_medico: string;
    titulo_profesional: string;
    especialidades: Array<{
      id_especialidad: number;
      nombre: string;
      es_principal: boolean;
    }>;
    id_centro_principal: number;
    centro_principal: {
      id_centro: number;
      nombre: string;
      plan: "basico" | "profesional" | "enterprise";
      logo_url: string | null;
      ciudad: string;
      region: string;
    };
    calificacion_promedio: number;
    anos_experiencia: number;
  };
}

interface ConversacionResumen {
  id_conversacion: string;
  nombre_contacto: string;
  tipo_contacto: "paciente" | "medico" | "admin" | "chatbot" | "otro";
  ultimo_mensaje: string;
  fecha_ultima: string;
  no_leidos: number;
  canal?: string;
  prioridad?: "alta" | "media" | "baja";
  avatar?: string | null;
  paciente_id?: number | null;
}

interface MensajeChat {
  id_mensaje: number;
  id_usuario_emisor: number;
  id_usuario_receptor: number;
  contenido: string;
  fecha_envio: string;
  fecha_lectura: string | null;
  leido: 0 | 1;
  id_conversacion: string;
  tipo_mensaje: "texto" | "imagen" | "archivo" | "sistema" | "ubicacion";
  metadata?: any;
  estado_envio: "enviado" | "entregado" | "leido" | "fallido";
  es_mio?: boolean;
  mensaje_respuesta?: MensajeChat | null;
}

interface PlantillaMensaje {
  id_plantilla: number;
  nombre: string;
  tipo: "email" | "sms" | "whatsapp" | "notificacion" | "chatbot";
  contenido: string;
  categoria: string;
  descripcion?: string | null;
  etiquetas?: string | null;
}

interface CanalComunicacion {
  id_canal: number;
  nombre: string;
  tipo: "email" | "sms" | "whatsapp" | "push" | "telegram" | "voz";
  estado: "activo" | "inactivo" | "pruebas" | "error";
  proveedor: string;
  prioridad: number;
}

interface MensajeAutomatico {
  id_mensaje_auto: number;
  nombre: string;
  descripcion: string | null;
  evento_disparador: string;
  activo: 0 | 1 | boolean;
}

const TEMAS: Record<TemaColor, ConfiguracionTema> = {
  light: {
    nombre: "Claro",
    icono: Sun,
    colores: {
      fondo: "from-slate-50 via-blue-50 to-indigo-50",
      fondoSecundario: "bg-white",
      texto: "text-gray-900",
      textoSecundario: "text-gray-600",
      primario: "bg-indigo-600 hover:bg-indigo-700",
      secundario: "bg-gray-200 hover:bg-gray-300",
      acento: "text-indigo-600",
      borde: "border-gray-200",
      sombra: "shadow-xl shadow-indigo-100/50",
      gradiente: "from-indigo-500 via-purple-500 to-pink-500",
      sidebar: "bg-white/95 backdrop-blur-xl border-gray-200",
      header: "bg-white/80 backdrop-blur-xl border-gray-200",
      card: "bg-white border-gray-200 hover:border-indigo-300",
      hover: "hover:bg-gray-50",
    },
  },
  dark: {
    nombre: "Oscuro",
    icono: Moon,
    colores: {
      fondo: "from-slate-950 via-indigo-950 to-purple-950",
      fondoSecundario: "bg-gray-900",
      texto: "text-white",
      textoSecundario: "text-gray-400",
      primario: "bg-indigo-600 hover:bg-indigo-700",
      secundario: "bg-gray-800 hover:bg-gray-700",
      acento: "text-indigo-400",
      borde: "border-gray-800",
      sombra: "shadow-2xl shadow-indigo-500/20",
      gradiente: "from-indigo-500 via-purple-500 to-pink-500",
      sidebar: "bg-gray-900/95 backdrop-blur-xl border-gray-800",
      header: "bg-gray-900/80 backdrop-blur-xl border-gray-800",
      card: "bg-gray-800/50 border-gray-700 hover:border-indigo-500/50",
      hover: "hover:bg-gray-800",
    },
  },
  blue: {
    nombre: "Azul Océano",
    icono: Wifi,
    colores: {
      fondo: "from-blue-950 via-cyan-950 to-teal-950",
      fondoSecundario: "bg-blue-900",
      texto: "text-white",
      textoSecundario: "text-cyan-300",
      primario: "bg-cyan-600 hover:bg-cyan-700",
      secundario: "bg-blue-800 hover:bg-blue-700",
      acento: "text-cyan-400",
      borde: "border-cyan-800",
      sombra: "shadow-2xl shadow-cyan-500/20",
      gradiente: "from-cyan-500 via-blue-500 to-indigo-500",
      sidebar: "bg-blue-900/95 backdrop-blur-xl border-cyan-800",
      header: "bg-blue-900/80 backdrop-blur-xl border-cyan-800",
      card: "bg-blue-800/50 border-cyan-700 hover:border-cyan-500/50",
      hover: "hover:bg-blue-800",
    },
  },
  purple: {
    nombre: "Púrpura Real",
    icono: Sparkles,
    colores: {
      fondo: "from-purple-950 via-fuchsia-950 to-pink-950",
      fondoSecundario: "bg-purple-900",
      texto: "text-white",
      textoSecundario: "text-purple-300",
      primario: "bg-fuchsia-600 hover:bg-fuchsia-700",
      secundario: "bg-purple-800 hover:bg-purple-700",
      acento: "text-fuchsia-400",
      borde: "border-purple-800",
      sombra: "shadow-2xl shadow-fuchsia-500/20",
      gradiente: "from-fuchsia-500 via-purple-500 to-pink-500",
      sidebar: "bg-purple-900/95 backdrop-blur-xl border-purple-800",
      header: "bg-purple-900/80 backdrop-blur-xl border-purple-800",
      card: "bg-purple-800/50 border-purple-700 hover:border-fuchsia-500/50",
      hover: "hover:bg-purple-800",
    },
  },
  green: {
    nombre: "Verde Médico",
    icono: HeartPulse,
    colores: {
      fondo: "from-emerald-950 via-teal-950 to-cyan-950",
      fondoSecundario: "bg-emerald-900",
      texto: "text-white",
      textoSecundario: "text-emerald-300",
      primario: "bg-emerald-600 hover:bg-emerald-700",
      secundario: "bg-teal-800 hover:bg-teal-700",
      acento: "text-emerald-400",
      borde: "border-emerald-800",
      sombra: "shadow-2xl shadow-emerald-500/20",
      gradiente: "from-emerald-500 via-teal-500 to-cyan-500",
      sidebar: "bg-emerald-900/95 backdrop-blur-xl border-emerald-800",
      header: "bg-emerald-900/80 backdrop-blur-xl border-emerald-800",
      card: "bg-emerald-800/50 border-emerald-700 hover:border-emerald-500/50",
      hover: "hover:bg-emerald-800",
    },
  },
};

export default function MensajesPage() {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(true);

  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [menuExpandido, setMenuExpandido] = useState<string | null>("Mensajes");

  // datos de mensajes
  const [conversaciones, setConversaciones] = useState<ConversacionResumen[]>([]);
  const [conversacionActiva, setConversacionActiva] = useState<ConversacionResumen | null>(null);
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [textoMensaje, setTextoMensaje] = useState("");
  const [plantillas, setPlantillas] = useState<PlantillaMensaje[]>([]);
  const [canales, setCanales] = useState<CanalComunicacion[]>([]);
  const [mensajesAuto, setMensajesAuto] = useState<MensajeAutomatico[]>([]);

  const [filtroInbox, setFiltroInbox] = useState<"todos" | "no_leidos" | "pacientes" | "sistema" | "chatbot">("todos");

  const chatRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/auth/session", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok || !data.success || !data.usuario) {
          window.location.href = "/login";
          return;
        }

        // validar médico
        const rolesUsuario: string[] = [];
        if (data.usuario.rol?.nombre) {
          rolesUsuario.push(
            data.usuario.rol.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toUpperCase()
          );
        }
        if (Array.isArray(data.usuario.roles)) {
          data.usuario.roles.forEach((r: any) => {
            if (r?.nombre) {
              rolesUsuario.push(
                r.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toUpperCase()
              );
            }
          });
        }
        const tieneRolMedico = rolesUsuario.some((r) => r.includes("MEDICO"));
        if (!tieneRolMedico || !data.usuario.medico) {
          alert("Acceso denegado. Módulo de mensajes solo para médicos.");
          window.location.href = "/";
          return;
        }

        setUsuario(data.usuario);
      } catch (error) {
        console.error("Error cargando usuario mensajes:", error);
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    };

    cargarUsuario();
  }, []);

  useEffect(() => {
    const cargarTema = async () => {
      try {
        const res = await fetch("/api/users/preferencias/tema", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (data.success && data.tema_color) {
          setTemaActual(data.tema_color);
          if (typeof window !== "undefined") localStorage.setItem("tema_medico", data.tema_color);
        }
      } catch (e) {
        // ignore
      }
    };
    cargarTema();
  }, []);

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
  }, [tema]);

  useEffect(() => {
    const cargarDatosMensajes = async () => {
      if (!usuario?.medico?.id_medico) return;
      try {
        setLoadingData(true);
        const [resConv, resPlantillas, resCanales, resAuto] = await Promise.all([
          fetch(`/api/medico/mensajes/conversaciones?id_medico=${usuario.medico.id_medico}`, {
            method: "GET",
            credentials: "include",
          }),
          fetch(`/api/medico/mensajes/plantillas?id_medico=${usuario.medico.id_medico}`, {
            method: "GET",
            credentials: "include",
          }),
          fetch(`/api/medico/mensajes/canales?id_medico=${usuario.medico.id_medico}`, {
            method: "GET",
            credentials: "include",
          }),
          fetch(`/api/medico/mensajes/automaticos?id_medico=${usuario.medico.id_medico}`, {
            method: "GET",
            credentials: "include",
          }),
        ]);

        const dataConv = await resConv.json().catch(() => ({ conversaciones: [] }));
        const dataPlant = await resPlantillas.json().catch(() => ({ plantillas: [] }));
        const dataCan = await resCanales.json().catch(() => ({ canales: [] }));
        const dataAuto = await resAuto.json().catch(() => ({ mensajes: [] }));

        const convs: ConversacionResumen[] = dataConv.conversaciones || [];
        setConversaciones(convs);
        setPlantillas(dataPlant.plantillas || []);
        setCanales(dataCan.canales || []);
        setMensajesAuto(dataAuto.mensajes || []);

        if (convs.length > 0) {
          setConversacionActiva(convs[0]);
        }
      } catch (e) {
        console.error("Error cargando datos mensajes:", e);
      } finally {
        setLoadingData(false);
      }
    };

    cargarDatosMensajes();
  }, [usuario]);

  // cargar mensajes de la conversación activa
  useEffect(() => {
    const cargarMensajes = async () => {
      if (!conversacionActiva) return;
      try {
        const res = await fetch(`/api/medico/mensajes/conversacion/${conversacionActiva.id_conversacion}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        setMensajes(
          (data.mensajes || []).map((m: any) => ({
            ...m,
            es_mio: m.id_usuario_emisor === usuario?.id_usuario,
          }))
        );
      } catch (e) {
        console.error("Error cargando mensajes de la conversación:", e);
      } finally {
        // scroll
        setTimeout(() => {
          if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
          }
        }, 150);
      }
    };

    cargarMensajes();
  }, [conversacionActiva, usuario]);

  // refresh cada 60s
  useEffect(() => {
    const interval = setInterval(() => {
      if (conversacionActiva) {
        fetch(`/api/medico/mensajes/conversacion/${conversacionActiva.id_conversacion}`, {
          method: "GET",
          credentials: "include",
        })
          .then((r) => r.json())
          .then((d) => {
            setMensajes(
              (d.mensajes || []).map((m: any) => ({
                ...m,
                es_mio: m.id_usuario_emisor === usuario?.id_usuario,
              }))
            );
          });
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [conversacionActiva, usuario]);

  const cambiarTema = async (nuevo: TemaColor) => {
    setTemaActual(nuevo);
    if (typeof window !== "undefined") localStorage.setItem("tema_medico", nuevo);
    try {
      await fetch("/api/users/preferencias/tema", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tema_color: nuevo }),
      });
    } catch (e) {
      console.error("No se pudo guardar el tema");
    }
  };

  const enviarMensaje = async () => {
    if (!textoMensaje.trim() || !conversacionActiva || !usuario) return;
    const contenido = textoMensaje.trim();
    const nuevoMensaje: MensajeChat = {
      id_mensaje: Date.now(),
      id_usuario_emisor: usuario.id_usuario,
      id_usuario_receptor: 0,
      contenido,
      fecha_envio: new Date().toISOString(),
      fecha_lectura: null,
      leido: 0,
      id_conversacion: conversacionActiva.id_conversacion,
      tipo_mensaje: "texto",
      estado_envio: "enviado",
      es_mio: true,
    };
    setMensajes((prev) => [...prev, nuevoMensaje]);
    setTextoMensaje("");

    // scroll
    setTimeout(() => {
      if (chatRef.current) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }
    }, 100);

    try {
      const res = await fetch(`/api/medico/mensajes/enviar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id_conversacion: conversacionActiva.id_conversacion,
          contenido,
          tipo_mensaje: "texto",
        }),
      });
      const data = await res.json();
      if (data.success && data.mensaje) {
        // actualizar el mensaje con el id real
        setMensajes((prev) =>
          prev.map((m) =>
            m.id_mensaje === nuevoMensaje.id_mensaje
              ? { ...data.mensaje, es_mio: true }
              : m
          )
        );
      } else {
        // marcar fallido
        setMensajes((prev) =>
          prev.map((m) =>
            m.id_mensaje === nuevoMensaje.id_mensaje ? { ...m, estado_envio: "fallido" } : m
          )
        );
      }
    } catch (e) {
      setMensajes((prev) =>
        prev.map((m) =>
          m.id_mensaje === nuevoMensaje.id_mensaje ? { ...m, estado_envio: "fallido" } : m
        )
      );
    }
  };

  const aplicarPlantilla = (p: PlantillaMensaje) => {
    setTextoMensaje((prev) => (prev ? prev + "\n" + p.contenido : p.contenido));
  };

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const formatearHora = (fecha: string) => {
    const d = new Date(fecha);
    return new Intl.DateTimeFormat("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  const cerrarSesion = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      window.location.href = "/login";
    } catch (e) {
      console.error(e);
    }
  };

  const conversacionesFiltradas = conversaciones.filter((c) => {
    const matchesSearch =
      busqueda.trim().length === 0 ||
      c.nombre_contacto.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.ultimo_mensaje.toLowerCase().includes(busqueda.toLowerCase());
    const matchesFilter =
      filtroInbox === "todos"
        ? true
        : filtroInbox === "no_leidos"
        ? c.no_leidos > 0
        : filtroInbox === "pacientes"
        ? c.tipo_contacto === "paciente"
        : filtroInbox === "sistema"
        ? c.ultimo_mensaje.startsWith("[SISTEMA]")
        : filtroInbox === "chatbot"
        ? c.tipo_contacto === "chatbot"
        : true;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}>
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            <div
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center animate-pulse`}
            >
              <MessageSquare className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>Cargando mensajes...</h2>
          <p className={tema.colores.textoSecundario}>Preparando tu inbox médico seguro</p>
        </div>
      </div>
    );
  }

  if (!usuario || !usuario.medico) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}>
        <div
          className={`text-center max-w-md mx-auto p-8 rounded-3xl ${tema.colores.card} ${tema.colores.sombra} ${tema.colores.borde} border`}
        >
          <div
            className={`w-24 h-24 bg-gradient-to-br ${tema.colores.gradiente} rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse`}
          >
            <AlertTriangle className="w-12 h-12 text-white" />
          </div>
          <h2 className={`text-3xl font-black mb-4 ${tema.colores.texto}`}>Acceso No Autorizado</h2>
          <p className={`text-lg mb-8 ${tema.colores.textoSecundario}`}>
            No tienes permisos para acceder al módulo de mensajes
          </p>
          <Link
            href="/login"
            className={`inline-flex items-center gap-3 px-8 py-4 ${tema.colores.primario} text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 ${tema.colores.sombra}`}
          >
            <LogOut className="w-5 h-5" />
            Ir al Login
          </Link>
        </div>
      </div>
    );
  }

  const menuItems = [
    { titulo: "Dashboard", icono: Laptop, url: "/medico" },
    { titulo: "Agenda", icono: Clock, url: "/medico/agenda" },
    { titulo: "Pacientes", icono: User, url: "/medico/pacientes" },
    { titulo: "Consultas", icono: ClipboardCheck, url: "/medico/consultas" },
    { titulo: "Recetas", icono: FolderKanban, url: "/medico/recetas" },
    {
      titulo: "Mensajes",
      icono: MessageSquare,
      url: "/medico/mensajes",
      submenu: [
        { titulo: "Inbox", icono: MessageCircle, url: "/medico/mensajes" },
        { titulo: "Plantillas", icono: Tag, url: "/medico/mensajes/plantillas" },
        { titulo: "Canales", icono: Globe, url: "/medico/mensajes/canales" },
        { titulo: "Automáticos", icono: Bot, url: "/medico/mensajes/automaticos" },
      ],
    },
    { titulo: "Telemedicina", icono: Video, url: "/medico/telemedicina" },
    { titulo: "Configuración", icono: Settings, url: "/medico/configuracion" },
  ];

  return (
    <div className={`min-h-screen transition-all duration-500 bg-gradient-to-br ${tema.colores.fondo}`}>
      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 ${
          sidebarAbierto ? "w-72" : "w-20"
        } ${tema.colores.sidebar} ${tema.colores.borde} border-r ${tema.colores.sombra}`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-700/30">
            {sidebarAbierto ? (
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-xl font-black ${tema.colores.texto}`}>Mensajes</h1>
                  <p className={`text-xs font-semibold ${tema.colores.acento}`}>Centro de comunicación</p>
                </div>
              </div>
            ) : (
              <div
                className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg mx-auto`}
              >
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
            )}

            <button
              onClick={() => setSidebarAbierto((p) => !p)}
              className={`p-2 rounded-lg ${tema.colores.hover} transition-colors`}
            >
              <ChevronRight
                className={`w-5 h-5 ${tema.colores.texto} transition-transform ${
                  sidebarAbierto ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
            {menuItems.map((item, idx) => {
              const activo = item.url === "/medico/mensajes";
              return (
                <div key={idx} className="mb-1">
                  <Link
                    href={item.url}
                    className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 group ${
                      activo
                        ? `bg-gradient-to-r ${tema.colores.gradiente} text-white ${tema.colores.sombra}`
                        : `${tema.colores.hover} ${tema.colores.texto}`
                    }`}
                    onClick={(e) => {
                      if (item.submenu) {
                        e.preventDefault();
                        setMenuExpandido((p) => (p === item.titulo ? null : item.titulo));
                        if (!sidebarAbierto) setSidebarAbierto(true);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <item.icono
                        className={`w-5 h-5 flex-shrink-0 ${
                          activo ? "text-white" : tema.colores.acento
                        }`}
                      />
                      {sidebarAbierto && <span className="truncate">{item.titulo}</span>}
                    </div>
                    {sidebarAbierto && item.submenu && (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          menuExpandido === item.titulo ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </Link>

                  {sidebarAbierto && item.submenu && menuExpandido === item.titulo && (
                    <div className="mt-2 ml-4 space-y-1">
                      {item.submenu.map((s, i) => (
                        <Link
                          key={i}
                          href={s.url}
                          className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${tema.colores.hover} ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
                        >
                          <s.icono className="w-4 h-4" />
                          <span>{s.titulo}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className={`p-4 border-t ${tema.colores.borde}`}>
            {sidebarAbierto ? (
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold shadow-lg`}
                >
                  {usuario.foto_perfil_url ? (
                    <Image
                      src={usuario.foto_perfil_url}
                      width={48}
                      height={48}
                      alt={usuario.nombre}
                      className="rounded-xl object-cover"
                    />
                  ) : (
                    `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate ${tema.colores.texto}`}>
                    Dr. {usuario.nombre} {usuario.apellido_paterno}
                  </p>
                  <p className={`text-xs font-medium truncate ${tema.colores.textoSecundario}`}>
                    {usuario.medico.especialidades[0]?.nombre || "Médico"}
                  </p>
                </div>
              </div>
            ) : (
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold shadow-lg mx-auto`}
              >
                {usuario.foto_perfil_url ? (
                  <Image
                    src={usuario.foto_perfil_url}
                    width={48}
                    height={48}
                    alt={usuario.nombre}
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

      {/* HEADER */}
      <header
        className={`fixed top-0 right-0 z-40 transition-all duration-300 ${
          sidebarAbierto ? "left-72" : "left-20"
        } ${tema.colores.header} ${tema.colores.borde} border-b ${tema.colores.sombra}`}
      >
        <div className="flex items-center justify-between px-8 py-4">
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`}
              />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar conversación, paciente, teléfono, asunto..."
                className={`w-full pl-12 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300`}
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda("")}
                  className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-lg ${tema.colores.hover}`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 ml-6">
            <div className="relative group">
              <button
                className={`p-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <Sparkles className="w-5 h-5" />
              </button>
              <div
                className={`absolute right-0 mt-2 w-64 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-4 space-y-2`}
              >
                <p className={`text-sm font-bold mb-3 ${tema.colores.texto}`}>Seleccionar Tema</p>
                {Object.entries(TEMAS).map(([key, t]) => (
                  <button
                    key={key}
                    onClick={() => cambiarTema(key as TemaColor)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      temaActual === key
                        ? `bg-gradient-to-r ${t.colores.gradiente} text-white`
                        : `${tema.colores.hover} ${tema.colores.texto}`
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <t.icono className="w-5 h-5" />
                      <span>{t.nombre}</span>
                    </div>
                    {temaActual === key && <Check className="w-5 h-5" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setNotificacionesAbiertas((p) => !p)}
                className={`relative p-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <Bell className="w-5 h-5" />
                {conversaciones.some((c) => c.no_leidos > 0) && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    !
                  </span>
                )}
              </button>

              {notificacionesAbiertas && (
                <div
                  className={`absolute right-0 mt-2 w-96 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} max-h-96 overflow-y-auto`}
                >
                  <div className={`p-4 border-b ${tema.colores.borde} sticky top-0 ${tema.colores.card}`}>
                    <div className="flex items-center justify-between">
                      <h3 className={`text-lg font-black ${tema.colores.texto}`}>Mensajes sin leer</h3>
                      <button
                        onClick={() => setNotificacionesAbiertas(false)}
                        className={`text-sm font-semibold ${tema.colores.acento} hover:underline`}
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                  {conversaciones.filter((c) => c.no_leidos > 0).length === 0 ? (
                    <div className="p-8 text-center">
                      <BellOff className={`w-12 h-12 mx-auto mb-3 ${tema.colores.textoSecundario}`} />
                      <p className={`text-sm ${tema.colores.textoSecundario}`}>No hay mensajes nuevos</p>
                    </div>
                  ) : (
                    conversaciones
                      .filter((c) => c.no_leidos > 0)
                      .map((c) => (
                        <div
                          key={c.id_conversacion}
                          className={`p-4 flex gap-3 border-b ${tema.colores.borde} ${tema.colores.hover} cursor-pointer`}
                          onClick={() => {
                            setConversacionActiva(c);
                            setNotificacionesAbiertas(false);
                          }}
                        >
                          <div
                            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-semibold`}
                          >
                            {c.nombre_contacto
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-bold ${tema.colores.texto}`}>{c.nombre_contacto}</p>
                            <p className={`text-xs ${tema.colores.textoSecundario} truncate`}>
                              {c.ultimo_mensaje}
                            </p>
                          </div>
                          <span className="px-2 py-1 bg-red-500/10 text-red-400 text-xs font-bold rounded-lg h-fit">
                            {c.no_leidos}
                          </span>
                        </div>
                      ))
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setPerfilAbierto((p) => !p)}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 ${tema.colores.hover}`}
              >
                <div className="text-right hidden md:block">
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    Dr. {usuario.nombre} {usuario.apellido_paterno}
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    {usuario.medico.especialidades[0]?.nombre || "Médico"}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold shadow-lg`}
                >
                  {usuario.foto_perfil_url ? (
                    <Image
                      src={usuario.foto_perfil_url}
                      alt={usuario.nombre}
                      width={40}
                      height={40}
                      className="rounded-xl object-cover"
                    />
                  ) : (
                    `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                  )}
                </div>
                <ChevronDown
                  className={`w-4 h-4 ${tema.colores.texto} transition-transform ${
                    perfilAbierto ? "rotate-180" : ""
                  }`}
                />
              </button>

              {perfilAbierto && (
                <div
                  className={`absolute right-0 mt-2 w-80 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} p-4`}
                >
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-700/30">
                    <div
                      className={`w-16 h-16 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold text-xl shadow-lg`}
                    >
                      {usuario.foto_perfil_url ? (
                        <Image
                          src={usuario.foto_perfil_url}
                          alt={usuario.nombre}
                          width={64}
                          height={64}
                          className="rounded-xl object-cover"
                        />
                      ) : (
                        `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-lg font-black ${tema.colores.texto}`}>
                        Dr. {usuario.nombre} {usuario.apellido_paterno}
                      </p>
                      <p className={`text-sm font-medium ${tema.colores.textoSecundario} mb-1`}>
                        {usuario.medico.especialidades[0]?.nombre || "Médico"}
                      </p>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className={`text-sm font-bold ${tema.colores.texto}`}>
                          {usuario.medico.calificacion_promedio?.toFixed(1) || "5.0"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Link
                      href="/medico/perfil"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <User className="w-5 h-5" />
                      <span>Mi Perfil</span>
                    </Link>
                    <Link
                      href="/medico/configuracion"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <Settings className="w-5 h-5" />
                      <span>Configuración</span>
                    </Link>
                    <button
                      onClick={cerrarSesion}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} text-red-500 hover:text-red-400`}
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className={`${sidebarAbierto ? "ml-72" : "ml-20"} pt-24 p-6 transition-all duration-300`}>
        {/* encabezado */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className={`text-4xl font-black mb-2 ${tema.colores.texto} flex items-center gap-3`}>
              {obtenerSaludo()}, Dr. {usuario.nombre}
              <span className="animate-wave inline-block">💬</span>
            </h2>
            <p className={tema.colores.textoSecundario}>
              Centro de mensajes médicos · {new Date().toLocaleDateString("es-CL", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                // recargar conversaciones
                if (!usuario?.medico?.id_medico) return;
                setLoadingData(true);
                fetch(`/api/medico/mensajes/conversaciones?id_medico=${usuario.medico.id_medico}`, {
                  method: "GET",
                  credentials: "include",
                })
                  .then((r) => r.json())
                  .then((d) => setConversaciones(d.conversaciones || []))
                  .finally(() => setLoadingData(false));
              }}
              className={`flex items-center gap-2 px-4 py-2 ${tema.colores.secundario} rounded-xl font-bold ${tema.colores.texto}`}
            >
              <RefreshCw className={`w-4 h-4 ${loadingData ? "animate-spin" : ""}`} />
              Actualizar
            </button>
          </div>
        </div>

        {/* layout mensajes */}
        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-180px)]">
          {/* Columna izquierda: conversaciones */}
          <div
            className={`col-span-12 md:col-span-3 rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} flex flex-col`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold ${tema.colores.texto}`}>Conversaciones</h3>
              <button
                onClick={() => setFiltroInbox("todos")}
                className={`p-2 rounded-lg ${tema.colores.hover}`}
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setFiltroInbox("todos")}
                className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                  filtroInbox === "todos"
                    ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                    : `${tema.colores.hover}`
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFiltroInbox("no_leidos")}
                className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                  filtroInbox === "no_leidos" ? "bg-red-500 text-white" : `${tema.colores.hover}`
                }`}
              >
                No leídos
              </button>
              <button
                onClick={() => setFiltroInbox("pacientes")}
                className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                  filtroInbox === "pacientes"
                    ? "bg-emerald-500 text-white"
                    : `${tema.colores.hover}`
                }`}
              >
                Pacientes
              </button>
              <button
                onClick={() => setFiltroInbox("chatbot")}
                className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                  filtroInbox === "chatbot" ? "bg-indigo-500 text-white" : `${tema.colores.hover}`
                }`}
              >
                Bot
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
              {loadingData ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-indigo-400" />
                  <p className={tema.colores.textoSecundario}>Cargando conversaciones...</p>
                </div>
              ) : conversacionesFiltradas.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className={`w-8 h-8 mx-auto mb-2 ${tema.colores.textoSecundario}`} />
                  <p className={tema.colores.textoSecundario}>No hay conversaciones</p>
                </div>
              ) : (
                conversacionesFiltradas.map((c) => (
                  <button
                    key={c.id_conversacion}
                    onClick={() => setConversacionActiva(c)}
                    className={`w-full flex gap-3 p-3 rounded-xl text-left transition-all duration-200 ${
                      conversacionActiva?.id_conversacion === c.id_conversacion
                        ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                        : `${tema.colores.hover}`
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-semibold flex-shrink-0`}
                    >
                      {c.nombre_contacto
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p
                          className={`text-sm font-bold truncate ${
                            conversacionActiva?.id_conversacion === c.id_conversacion
                              ? "text-white"
                              : tema.colores.texto
                          }`}
                        >
                          {c.nombre_contacto}
                        </p>
                        <span
                          className={`text-[10px] ${
                            conversacionActiva?.id_conversacion === c.id_conversacion
                              ? "text-white/70"
                              : tema.colores.textoSecundario
                          }`}
                        >
                          {new Date(c.fecha_ultima).toLocaleTimeString("es-CL", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p
                        className={`text-xs truncate ${
                          conversacionActiva?.id_conversacion === c.id_conversacion
                            ? "text-white/90"
                            : tema.colores.textoSecundario
                        }`}
                      >
                        {c.ultimo_mensaje}
                      </p>
                    </div>
                    {c.no_leidos > 0 && (
                      <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-lg h-fit">
                        {c.no_leidos > 9 ? "9+" : c.no_leidos}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Columna central: chat */}
          <div
            className={`col-span-12 md:col-span-6 rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} flex flex-col`}
          >
            {/* header chat */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-semibold`}
                >
                  {conversacionActiva
                    ? conversacionActiva.nombre_contacto
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                    : "?"}
                </div>
                <div>
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    {conversacionActiva ? conversacionActiva.nombre_contacto : "Sin conversación"}
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario} flex gap-2 items-center`}>
                    <span className="w-2 h-2 bg-emerald-400 rounded-full inline-block"></span>
                    Canal: {conversacionActiva?.canal || "interno"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className={`p-2 rounded-lg ${tema.colores.hover}`}>
                  <PhoneCall className="w-4 h-4" />
                </button>
                <button className={`p-2 rounded-lg ${tema.colores.hover}`}>
                  <Video className="w-4 h-4" />
                </button>
                <button className={`p-2 rounded-lg ${tema.colores.hover}`}>
                  <Pin className="w-4 h-4" />
                </button>
                <button className={`p-2 rounded-lg ${tema.colores.hover}`}>
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* mensajes */}
            <div
              ref={chatRef}
              className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3"
            >
              {mensajes.length === 0 ? (
                <div className="text-center py-10">
                  <MessageCircle className={`w-12 h-12 mx-auto mb-3 ${tema.colores.textoSecundario}`} />
                  <p className={tema.colores.textoSecundario}>No hay mensajes en esta conversación</p>
                </div>
              ) : (
                mensajes.map((m) => (
                  <div
                    key={m.id_mensaje}
                    className={`flex ${m.es_mio ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                        m.es_mio
                          ? "bg-indigo-600 text-white rounded-br-sm"
                          : `${tema.colores.hover} ${tema.colores.texto} rounded-bl-sm`
                      } shadow-sm`}
                    >
                      {m.mensaje_respuesta && (
                        <div className="mb-2 p-2 rounded-lg bg-black/10 text-xs">
                          {m.mensaje_respuesta.contenido.slice(0, 80)}...
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap break-words">{m.contenido}</p>
                      <div className="flex items-center gap-2 mt-2 text-[10px] opacity-70">
                        <span>{formatearHora(m.fecha_envio)}</span>
                        {m.es_mio && (
                          <span>
                            {m.estado_envio === "leido" ? "✓✓" : m.estado_envio === "entregado" ? "✓" : "…"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* input */}
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <button className={`p-2 rounded-lg ${tema.colores.hover}`}>
                  <Paperclip className="w-4 h-4" />
                </button>
                <button className={`p-2 rounded-lg ${tema.colores.hover}`}>
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (plantillas[0]) aplicarPlantilla(plantillas[0]);
                  }}
                  className={`p-2 rounded-lg ${tema.colores.hover} flex items-center gap-1 text-xs`}
                >
                  <Tag className="w-4 h-4" />
                  Plantillas
                </button>
              </div>
              <div className="flex gap-2">
                <textarea
                  value={textoMensaje}
                  onChange={(e) => setTextoMensaje(e.target.value)}
                  rows={2}
                  placeholder="Escribe tu mensaje seguro para el paciente..."
                  className={`flex-1 px-3 py-2 rounded-xl bg-transparent ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm resize-none`}
                />
                <button
                  onClick={enviarMensaje}
                  className={`h-[60px] px-4 rounded-xl ${tema.colores.primario} text-white flex items-center justify-center gap-2 font-bold`}
                >
                  <Send className="w-4 h-4" />
                  Enviar
                </button>
              </div>
            </div>
          </div>

          {/* Columna derecha: plantillas, canales, automáticos */}
          <div className="col-span-12 md:col-span-3 flex flex-col gap-4">
            {/* plantillas */}
            <div
              className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className={`text-sm font-bold ${tema.colores.texto}`}>Plantillas rápidas</h4>
                <Link href="/medico/mensajes/plantillas" className={`text-xs ${tema.colores.acento}`}>
                  Ver todas
                </Link>
              </div>
              {plantillas.length === 0 ? (
                <p className={tema.colores.textoSecundario}>No hay plantillas configuradas</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {plantillas.map((p) => (
                    <button
                      key={p.id_plantilla}
                      onClick={() => aplicarPlantilla(p)}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl ${tema.colores.hover} text-left`}
                    >
                      <div>
                        <p className={`text-xs font-semibold ${tema.colores.texto}`}>{p.nombre}</p>
                        <p className={`text-[10px] ${tema.colores.textoSecundario} truncate`}>
                          {p.contenido.slice(0, 60)}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* canales */}
            <div
              className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className={`text-sm font-bold ${tema.colores.texto}`}>Canales de comunicación</h4>
                <Link href="/medico/mensajes/canales" className={`text-xs ${tema.colores.acento}`}>
                  Configurar
                </Link>
              </div>
              {canales.length === 0 ? (
                <p className={tema.colores.textoSecundario}>No hay canales activos</p>
              ) : (
                <div className="space-y-2">
                  {canales.map((c) => (
                    <div
                      key={c.id_canal}
                      className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl ${tema.colores.hover}`}
                    >
                      <div className="flex gap-2 items-center">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                          {c.tipo === "whatsapp" ? (
                            <MessageCircle className="w-4 h-4" />
                          ) : c.tipo === "email" ? (
                            <Mail className="w-4 h-4" />
                          ) : c.tipo === "sms" ? (
                            <Phone className="w-4 h-4" />
                          ) : c.tipo === "push" ? (
                            <Bell className="w-4 h-4" />
                          ) : (
                            <Globe className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className={`text-xs font-semibold ${tema.colores.texto}`}>{c.nombre}</p>
                          <p className={`text-[10px] ${tema.colores.textoSecundario}`}>
                            {c.tipo.toUpperCase()} · {c.proveedor}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-1 rounded-lg ${
                          c.estado === "activo"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {c.estado}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* automáticos */}
            <div
              className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className={`text-sm font-bold ${tema.colores.texto}`}>Mensajes automáticos</h4>
                <Link href="/medico/mensajes/automaticos" className={`text-xs ${tema.colores.acento}`}>
                  Ver
                </Link>
              </div>
              {mensajesAuto.length === 0 ? (
                <p className={tema.colores.textoSecundario}>No hay reglas configuradas</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                  {mensajesAuto.map((m) => (
                    <div
                      key={m.id_mensaje_auto}
                      className={`px-3 py-2 rounded-xl ${tema.colores.hover} flex items-center justify-between gap-2`}
                    >
                      <div>
                        <p className={`text-xs font-semibold ${tema.colores.texto}`}>{m.nombre}</p>
                        <p className={`text-[10px] ${tema.colores.textoSecundario}`}>
                          Evento: {m.evento_disparador}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-1 rounded-lg ${
                          m.activo ? "bg-indigo-500/10 text-indigo-300" : "bg-gray-500/10 text-gray-300"
                        }`}
                      >
                        {m.activo ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* footer */}
        <footer
          className={`mt-4 rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} flex flex-col sm:flex-row items-center justify-between gap-4`}
        >
          <p className={tema.colores.textoSecundario}>
            © {new Date().getFullYear()} AnyssaMed · Módulo de mensajes médicos
          </p>
          <div className="flex gap-4">
            <Link
              href="/ayuda"
              className={`text-sm font-semibold ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
            >
              Ayuda
            </Link>
            <Link
              href="/privacidad"
              className={`text-sm font-semibold ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
            >
              Privacidad
            </Link>
            <Link
              href="/terminos"
              className={`text-sm font-semibold ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
            >
              Términos
            </Link>
          </div>
        </footer>
      </main>

      <style jsx global>{`
        @keyframes wave {
          0%,
          100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(20deg);
          }
          75% {
            transform: rotate(-20deg);
          }
        }
        .animate-wave {
          animation: wave 1s ease-in-out infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${["dark", "blue", "purple", "green"].includes(temaActual)
            ? "rgba(31, 41, 55, 0.5)"
            : "rgba(243, 244, 246, 0.5)"};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${["dark", "blue", "purple", "green"].includes(temaActual)
            ? "rgba(99, 102, 241, 0.5)"
            : "rgba(99, 102, 241, 0.7)"};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${["dark", "blue", "purple", "green"].includes(temaActual)
            ? "rgba(99, 102, 241, 0.7)"
            : "rgba(99, 102, 241, 0.9)"};
        }
      `}</style>
    </div>
  );
}
