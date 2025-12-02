"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Bell,
  BellOff,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  Plus,
  ChevronRight,
  Clock,
  Filter,
  RefreshCw,
  Lightbulb,
  Loader2,
  LogOut,
  Mail,
  MessageSquare,
  Mic,
  Moon,
  MoreVertical,
  Paperclip,
  Phone,
  PhoneCall,
  Send,
  Settings,
  Shield,
  Sparkles,
  Sun,
  Target,
  Trash2,
  User,
  UserCheck,
  Users,
  Wifi,
  WifiOff,
  X,
  Zap,
} from "lucide-react";

// ============================
// TIPOS BASE (tema + usuario)
// ============================

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
  secretaria?: {
    id_secretaria: number;
    id_centro: number;
    id_sucursal: number | null;
    id_departamento: number | null;
    extension_telefonica: string | null;
    estado: "activo" | "inactivo" | "suspendido" | "vacaciones";
    jornada: "completa" | "media" | "parcial";
    centro: {
      id_centro: number;
      nombre: string;
      logo_url: string | null;
      ciudad: string;
      region: string;
    };
    medicos_asignados: Array<{
      id_profesional: number;
      nombre_completo: string;
      especialidad: string;
      foto_url: string | null;
      es_principal: boolean;
    }>;
  };
}

// ============================
// TIPOS SMS PREMIUM
// ============================

type TabPrincipal =
  | "conversaciones"
  | "campanias"
  | "plantillas"
  | "dispositivos"
  | "auditoria";

interface SmsDispositivo {
  id_dispositivo: number;
  nombre: string;
  numero_telefono: string;
  tipo: "android_bridge" | "gateway_sim" | "api_directa";
  proveedor: string | null;
  estado: "online" | "offline" | "sincronizando" | "error";
  ultimo_contacto: string | null;
  mensajes_en_cola: number;
  mensajes_enviados_hoy: number;
}

interface SmsConversacion {
  id_conversacion: number;
  id_paciente: number | null;
  nombre_contacto: string;
  numero_telefono: string;
  canal: "sms";
  etiqueta_riesgo: "normal" | "prioritario" | "critico" | null;
  ultimo_mensaje: string;
  fecha_ultimo_mensaje: string;
  mensajes_no_leidos: number;
  estado: "abierta" | "pendiente" | "cerrada";
  centro?: {
    id_centro: number;
    nombre: string;
  } | null;
}

interface SmsMensaje {
  id_mensaje: number;
  id_conversacion: number;
  direccion: "entrante" | "saliente";
  contenido: string;
  fecha_envio: string;
  estado_entrega:
    | "pendiente"
    | "enviado"
    | "entregado"
    | "fallido"
    | "rechazado";
  error_detalle?: string | null;
  canal: "sms";
  etiqueta_sistema?: string | null; // "recordatorio_cita", "campania", etc.
  usuario_envio?: string | null;
}

interface PlantillaSms {
  id_plantilla: number;
  nombre: string;
  descripcion?: string;
  contenido: string;
  variables: string[];
  categoria:
    | "recordatorio_cita"
    | "campania_salud"
    | "informativo"
    | "urgente"
    | "otro";
  idioma: "es" | "ht" | "en" | "fr";
  activo: boolean;
}

interface EstadisticasSms {
  total_hoy: number;
  entregados_hoy: number;
  fallidos_hoy: number;
  pendientes_hoy: number;
  tasa_entrega: number;
  tasa_fallo: number;
  conversaciones_abiertas: number;
  contactos_unicos: number;
}

interface AuditoriaSmsEvento {
  id_evento: number;
  fecha_hora: string;
  tipo: string;
  descripcion: string;
  usuario: string;
  destino: string;
  resultado: string;
}

// ============================
// TEMAS (igual que dashboard)
// ============================

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
    icono: UserCheck,
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

// ============================
// COMPONENTE PRINCIPAL SMS
// ============================

export default function SmsSecretariaPage() {
  // Sesión / UI base
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loadingSesion, setLoadingSesion] = useState(true);
  const [temaActual, setTemaActual] = useState<TemaColor>("blue");
  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  // Estados SMS
  const [tabActiva, setTabActiva] = useState<TabPrincipal>("conversaciones");

  const [estadisticasSms, setEstadisticasSms] = useState<EstadisticasSms | null>(null);
  const [dispositivos, setDispositivos] = useState<SmsDispositivo[]>([]);
  const [conversaciones, setConversaciones] = useState<SmsConversacion[]>([]);
  const [conversacionSeleccionada, setConversacionSeleccionada] =
    useState<SmsConversacion | null>(null);
  const [mensajesConversacion, setMensajesConversacion] = useState<SmsMensaje[]>([]);
  const [plantillas, setPlantillas] = useState<PlantillaSms[]>([]);
  const [auditoriaSms, setAuditoriaSms] = useState<AuditoriaSmsEvento[]>([]);

  const [cargandoDatos, setCargandoDatos] = useState(false);
  const [cargandoMensajes, setCargandoMensajes] = useState(false);
  const [enviandoSms, setEnviandoSms] = useState(false);

  // Filtros / formularios
  const [busquedaConversacion, setBusquedaConversacion] = useState("");
  const [filtroEstadoConversacion, setFiltroEstadoConversacion] = useState<
    "todas" | "abierta" | "pendiente" | "cerrada"
  >("abierta");
  const [filtroSoloNoLeidos, setFiltroSoloNoLeidos] = useState(false);
  const [filtroCentroConversacion, setFiltroCentroConversacion] = useState<
    number | "todos"
  >("todos");

  const [mensajeNuevo, setMensajeNuevo] = useState("");
  const [plantillaSeleccionadaId, setPlantillaSeleccionadaId] = useState<
    number | ""
  >("");

  // Campañas
  const [segmentoCampania, setSegmentoCampania] = useState<string>("citas_manana");
  const [plantillaCampaniaId, setPlantillaCampaniaId] = useState<number | "">("");
  const [programarEnvio, setProgramarEnvio] = useState<"ahora" | "programado">(
    "ahora"
  );
  const [fechaProgramada, setFechaProgramada] = useState<string>("");
  const [horaProgramada, setHoraProgramada] = useState<string>("09:00");
  const [estimacionDestinatarios, setEstimacionDestinatarios] = useState<
    number | null
  >(null);

  // ============================
  // EFECTOS
  // ============================

  useEffect(() => {
    cargarDatosUsuario();
  }, []);

  useEffect(() => {
    if (usuario?.secretaria) {
      cargarTemaPreferido();
      cargarDashboardSms();
    }
  }, [usuario]);

  useEffect(() => {
    // Autorefresh cada 90 segundos para tener SMS casi en tiempo real
    if (!usuario?.secretaria) return;
    const interval = setInterval(() => {
      cargarDashboardSms(false);
      if (conversacionSeleccionada) {
        cargarMensajesConversacion(conversacionSeleccionada.id_conversacion, false);
      }
    }, 90_000);

    return () => clearInterval(interval);
  }, [usuario, conversacionSeleccionada]);

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
  }, [tema]);

  // ============================
  // CARGA SESIÓN / TEMA
  // ============================

  const cargarDatosUsuario = async () => {
    try {
      setLoadingSesion(true);
      const response = await fetch("/api/auth/session", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("No hay sesión activa");
      }

      const result = await response.json();
      if (result.success && result.usuario) {
        const rolesUsuario: string[] = [];

        if (result.usuario.rol?.nombre) {
          rolesUsuario.push(
            result.usuario.rol.nombre
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .trim()
              .toUpperCase()
          );
        }

        if (Array.isArray(result.usuario.roles)) {
          result.usuario.roles.forEach((r: any) => {
            if (r?.nombre) {
              rolesUsuario.push(
                r.nombre
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .trim()
                  .toUpperCase()
              );
            }
          });
        }

        const tieneRolSecretaria = rolesUsuario.some((rol) =>
          rol.includes("SECRETARIA")
        );

        if (!tieneRolSecretaria) {
          alert(
            `Acceso denegado. Este módulo SMS es solo para secretarias. Tus roles actuales son: ${rolesUsuario.join(
              ", "
            )}`
          );
          window.location.href = "/";
          return;
        }

        if (!result.usuario.secretaria) {
          alert(
            "Tu usuario tiene rol de SECRETARIA pero no está vinculado a un registro de secretaria. Contacta al administrador."
          );
          window.location.href = "/";
          return;
        }

        setUsuario(result.usuario);
      } else {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Error al cargar usuario:", error);
      alert("Error al verificar sesión. Serás redirigido al login.");
      window.location.href = "/login";
    } finally {
      setLoadingSesion(false);
    }
  };

  const cargarTemaPreferido = async () => {
    try {
      const local = typeof window !== "undefined"
        ? (localStorage.getItem("tema_secretaria") as TemaColor | null)
        : null;

      if (local && TEMAS[local]) {
        setTemaActual(local);
      }

      const res = await fetch("/api/users/preferencias/tema", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (data.success && data.tema_color ) {
        setTemaActual(data.tema_color);
        if (typeof window !== "undefined") {
          localStorage.setItem("tema_secretaria", data.tema_color);
        }
      }
    } catch (e) {
      console.error("No se pudo cargar la preferencia de tema:", e);
    }
  };

  const cambiarTema = async (nuevoTema: TemaColor) => {
    setTemaActual(nuevoTema);
    if (typeof window !== "undefined") {
      localStorage.setItem("tema_secretaria", nuevoTema);
    }

    try {
      await fetch("/api/users/preferencias/tema", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tema_color: nuevoTema }),
      });
    } catch (err) {
      console.error("No se pudo guardar preferencia en BD:", err);
    }
  };

  // ============================
  // CARGA DATOS SMS
  // ============================

  const cargarDashboardSms = async (mostrarLoader: boolean = true) => {
    if (!usuario?.secretaria?.id_secretaria) return;

    try {
      if (mostrarLoader) setCargandoDatos(true);

      const res = await fetch(
        `/api/secretaria/mensajes/sms/dashboard?id_secretaria=${usuario.secretaria.id_secretaria}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Respuesta dashboard SMS:", data);
        return;
      }

      setEstadisticasSms(data.estadisticas || null);
      setDispositivos(data.dispositivos || []);
      setConversaciones(data.conversaciones || []);
      setPlantillas(data.plantillas || []);
      setAuditoriaSms(data.auditoria || []);

      // Si no hay conversación seleccionada, elegir la primera abierta
      if (!conversacionSeleccionada && (data.conversaciones || []).length > 0) {
        const primera =
          data.conversaciones.find(
            (c: SmsConversacion) => c.estado === "abierta"
          ) || data.conversaciones[0];
        setConversacionSeleccionada(primera);
        cargarMensajesConversacion(primera.id_conversacion, false);
      }
    } catch (error) {
      console.error("Error al cargar dashboard SMS:", error);
    } finally {
      if (mostrarLoader) setCargandoDatos(false);
    }
  };

  const cargarMensajesConversacion = async (
    idConversacion: number,
    mostrarLoader: boolean = true
  ) => {
    try {
      if (mostrarLoader) setCargandoMensajes(true);

      const res = await fetch(
        `/api/secretaria/mensajes/sms/conversaciones/${idConversacion}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Respuesta mensajes conversación:", data);
        return;
      }

      setMensajesConversacion(data.mensajes || []);

      // Actualizar contador de no leídos en lista
      setConversaciones((prev) =>
        prev.map((c) =>
          c.id_conversacion === idConversacion
            ? { ...c, mensajes_no_leidos: 0 }
            : c
        )
      );
    } catch (error) {
      console.error("Error al cargar mensajes de conversación:", error);
    } finally {
      if (mostrarLoader) setCargandoMensajes(false);
    }
  };

  const seleccionarConversacion = (conv: SmsConversacion) => {
    setConversacionSeleccionada(conv);
    setMensajeNuevo("");
    setPlantillaSeleccionadaId("");
    cargarMensajesConversacion(conv.id_conversacion);
  };

  const enviarSmsActual = async () => {
    if (!conversacionSeleccionada) {
      alert("Selecciona una conversación primero.");
      return;
    }
    const texto = mensajeNuevo.trim();
    if (!texto) {
      alert("Escribe un mensaje antes de enviar.");
      return;
    }

    try {
      setEnviandoSms(true);

      // Optimista: agregar mensaje con estado PENDIENTE
      const mensajeTemporal: SmsMensaje = {
        id_mensaje: Date.now(),
        id_conversacion: conversacionSeleccionada.id_conversacion,
        direccion: "saliente",
        contenido: texto,
        fecha_envio: new Date().toISOString(),
        estado_entrega: "pendiente",
        canal: "sms",
        etiqueta_sistema: plantillaSeleccionadaId ? "plantilla" : null,
        usuario_envio: usuario?.nombre || "Tú",
      };

      setMensajesConversacion((prev) => [...prev, mensajeTemporal]);

      const body: any = {
        id_conversacion: conversacionSeleccionada.id_conversacion,
        texto,
      };
      if (plantillaSeleccionadaId) {
        body.id_plantilla = plantillaSeleccionadaId;
      }

      const res = await fetch("/api/secretaria/mensajes/sms/enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        alert("No se pudo enviar el SMS. Revisa el estado de los dispositivos.");
        // marcar último como fallido
        setMensajesConversacion((prev) =>
          prev.map((m) =>
            m.id_mensaje === mensajeTemporal.id_mensaje
              ? { ...m, estado_entrega: "fallido" }
              : m
          )
        );
        return;
      }

      // Reemplazar temporal por real si backend devuelve mensaje
      if (data.mensaje) {
        setMensajesConversacion((prev) =>
          prev.map((m) =>
            m.id_mensaje === mensajeTemporal.id_mensaje ? data.mensaje : m
          )
        );
      } else {
        setMensajesConversacion((prev) =>
          prev.map((m) =>
            m.id_mensaje === mensajeTemporal.id_mensaje
              ? { ...m, estado_entrega: "enviado" }
              : m
          )
        );
      }

      setMensajeNuevo("");
      setPlantillaSeleccionadaId("");
      cargarDashboardSms(false);
    } catch (error) {
      console.error("Error al enviar SMS:", error);
      alert("Error inesperado al enviar SMS.");
    } finally {
      setEnviandoSms(false);
    }
  };

  const estimarDestinatariosCampania = () => {
    // Simulación local, puedes reemplazar con llamada real a API
    let base = 120;
    if (segmentoCampania === "citas_manana") base = 80;
    if (segmentoCampania === "pacientes_sin_control") base = 150;
    if (segmentoCampania === "todos_pacientes") base = 400;
    setEstimacionDestinatarios(base);
  };

  const programarCampaniaSms = async () => {
    if (!plantillaCampaniaId) {
      alert("Selecciona una plantilla para la campaña.");
      return;
    }
    if (programarEnvio === "programado" && (!fechaProgramada || !horaProgramada)) {
      alert("Selecciona fecha y hora para el envío programado.");
      return;
    }

    try {
      setCargandoDatos(true);
      const res = await fetch("/api/secretaria/mensajes/sms/campanias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          segmento: segmentoCampania,
          id_plantilla: plantillaCampaniaId,
          modo_envio: programarEnvio,
          fecha: fechaProgramada,
          hora: horaProgramada,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        alert("No se pudo programar la campaña. Revisa los datos.");
        return;
      }

      alert("Campaña SMS creada correctamente.");
      setEstimacionDestinatarios(null);
    } catch (error) {
      console.error("Error al crear campaña SMS:", error);
      alert("Error inesperado al crear campaña.");
    } finally {
      setCargandoDatos(false);
    }
  };

  const sincronizarDispositivo = async (idDispositivo: number) => {
    try {
      setDispositivos((prev) =>
        prev.map((d) =>
          d.id_dispositivo === idDispositivo
            ? { ...d, estado: "sincronizando" }
            : d
        )
      );

      const res = await fetch(
        `/api/secretaria/mensajes/sms/dispositivos/${idDispositivo}/sincronizar`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        alert("No se pudo sincronizar el dispositivo.");
        setDispositivos((prev) =>
          prev.map((d) =>
            d.id_dispositivo === idDispositivo ? { ...d, estado: "error" } : d
          )
        );
        return;
      }

      setDispositivos((prev) =>
        prev.map((d) =>
          d.id_dispositivo === idDispositivo
            ? {
                ...d,
                estado: "online",
                ultimo_contacto: new Date().toISOString(),
                mensajes_en_cola: 0,
              }
            : d
        )
      );
    } catch (error) {
      console.error("Error al sincronizar dispositivo:", error);
      alert("Error inesperado al sincronizar dispositivo.");
    }
  };

  const cerrarSesion = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/login";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // ============================
  // HELPERS
  // ============================

  const formatearFecha = (fecha: string) => {
    if (!fecha) return "";
    const d = new Date(fecha);
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  const formatearHora = (fecha: string) => {
    if (!fecha) return "";
    const d = new Date(fecha);
    return new Intl.DateTimeFormat("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const obtenerColorEstadoEntrega = (estado: SmsMensaje["estado_entrega"]) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);
    const base = isDark
      ? {
          pendiente: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
          enviado: "bg-blue-500/15 text-blue-300 border-blue-500/30",
          entregado: "bg-green-500/15 text-green-300 border-green-500/30",
          fallido: "bg-red-500/15 text-red-300 border-red-500/30",
          rechazado: "bg-rose-500/15 text-rose-300 border-rose-500/30",
        }
      : {
          pendiente: "bg-yellow-100 text-yellow-800 border-yellow-200",
          enviado: "bg-blue-100 text-blue-800 border-blue-200",
          entregado: "bg-green-100 text-green-800 border-green-200",
          fallido: "bg-red-100 text-red-800 border-red-200",
          rechazado: "bg-rose-100 text-rose-800 border-rose-200",
        };

    return base[estado] || base.pendiente;
  };

  const obtenerColorEstadoConversacion = (
    estado: SmsConversacion["estado"]
  ) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);
    const base = isDark
      ? {
          abierta: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
          pendiente: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
          cerrada: "bg-slate-500/15 text-slate-300 border-slate-500/30",
        }
      : {
          abierta: "bg-emerald-100 text-emerald-800 border-emerald-200",
          pendiente: "bg-yellow-100 text-yellow-800 border-yellow-200",
          cerrada: "bg-slate-100 text-slate-800 border-slate-200",
        };

    return base[estado] || base.abierta;
  };

  const obtenerColorRiesgo = (
    riesgo: SmsConversacion["etiqueta_riesgo"] | null
  ) => {
    if (!riesgo) return "";
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);
    const base = isDark
      ? {
          normal: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
          prioritario: "bg-orange-500/10 text-orange-300 border-orange-500/30",
          critico: "bg-red-500/10 text-red-300 border-red-500/30",
        }
      : {
          normal: "bg-emerald-100 text-emerald-800 border-emerald-200",
          prioritario: "bg-orange-100 text-orange-800 border-orange-200",
          critico: "bg-red-100 text-red-800 border-red-200",
        };

    return base[riesgo] || "";
  };

  const obtenerColorDispositivo = (estado: SmsDispositivo["estado"]) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);
    const base = isDark
      ? {
          online: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
          offline: "bg-slate-500/15 text-slate-300 border-slate-500/30",
          sincronizando: "bg-blue-500/15 text-blue-300 border-blue-500/30",
          error: "bg-red-500/15 text-red-300 border-red-500/30",
        }
      : {
          online: "bg-emerald-100 text-emerald-800 border-emerald-200",
          offline: "bg-slate-100 text-slate-800 border-slate-200",
          sincronizando: "bg-blue-100 text-blue-800 border-blue-200",
          error: "bg-red-100 text-red-800 border-red-200",
        };

    return base[estado] || base.offline;
  };

  // ============================
  // MEMOS
  // ============================

  const centrosDisponibles = useMemo(() => {
    const mapa = new Map<number, string>();
    conversaciones.forEach((c) => {
      if (c.centro?.id_centro && c.centro?.nombre) {
        mapa.set(c.centro.id_centro, c.centro.nombre);
      }
    });
    return Array.from(mapa.entries()).map(([id, nombre]) => ({ id, nombre }));
  }, [conversaciones]);

  const conversacionesFiltradas = useMemo(() => {
    return conversaciones
      .filter((c) => {
        if (filtroEstadoConversacion !== "todas" && c.estado !== filtroEstadoConversacion)
          return false;
        if (filtroSoloNoLeidos && c.mensajes_no_leidos === 0) return false;
        if (
          filtroCentroConversacion !== "todos" &&
          c.centro?.id_centro !== filtroCentroConversacion
        )
          return false;
        if (!busquedaConversacion.trim()) return true;

        const q = busquedaConversacion.toLowerCase();
        return (
          c.nombre_contacto.toLowerCase().includes(q) ||
          c.numero_telefono.toLowerCase().includes(q) ||
          c.ultimo_mensaje.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        // Primero abiertas, luego pendientes, luego cerradas
        const ordenEstado: Record<SmsConversacion["estado"], number> = {
          abierta: 0,
          pendiente: 1,
          cerrada: 2,
        };
        const diffEstado =
          ordenEstado[a.estado] - ordenEstado[b.estado];
        if (diffEstado !== 0) return diffEstado;

        // Luego por fecha último mensaje
        return (
          new Date(b.fecha_ultimo_mensaje).getTime() -
          new Date(a.fecha_ultimo_mensaje).getTime()
        );
      });
  }, [
    conversaciones,
    filtroEstadoConversacion,
    filtroSoloNoLeidos,
    filtroCentroConversacion,
    busquedaConversacion,
  ]);

  // ============================
  // RENDER LOADING / SIN SESIÓN
  // ============================

  if (loadingSesion) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}
      >
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-28 h-28 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            <div
              className={`absolute inset-3 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center animate-pulse`}
            >
              <MessageSquare className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-3xl font-black mb-2 ${tema.colores.texto}`}>
            Preparando centro SMS
          </h2>
          <p className={`text-sm ${tema.colores.textoSecundario}`}>
            Conectando dispositivos, leyendo conversaciones y sincronizando datos...
          </p>
        </div>
      </div>
    );
  }

  if (!usuario || !usuario.secretaria) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}
      >
        <div
          className={`max-w-md mx-auto p-8 rounded-3xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} text-center`}
        >
          <div
            className={`w-20 h-20 bg-gradient-to-br ${tema.colores.gradiente} rounded-2xl flex items-center justify-center mx-auto mb-6`}
          >
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
          <h2 className={`text-2xl font-black mb-2 ${tema.colores.texto}`}>
            Acceso no autorizado
          </h2>
          <p className={`text-sm mb-6 ${tema.colores.textoSecundario}`}>
            Este centro de mensajería SMS es exclusivo para secretarias del sistema.
          </p>
          <Link
            href="/login"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl ${tema.colores.primario} text-white font-bold ${tema.colores.sombra}`}
          >
            <LogOut className="w-4 h-4" />
            Ir al login
          </Link>
        </div>
      </div>
    );
  }

  // ============================
  // RENDER PRINCIPAL
  // ============================

  return (
    <div
      className={`min-h-screen transition-all duration-500 bg-gradient-to-br ${tema.colores.fondo}`}
    >
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10">
        {/* HEADER SUPERIOR */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide opacity-80 mb-2">
              <Link
                href="/secretaria"
                className={`${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
              >
                Panel secretaria
              </Link>
              <span className={tema.colores.textoSecundario}>/</span>
              <Link
                href="/secretaria/mensajes"
                className={`${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
              >
                Mensajes
              </Link>
              <span className={tema.colores.texto}>/ SMS</span>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-lg`}
              >
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1
                  className={`text-2xl sm:text-3xl font-black flex items-center gap-2 ${tema.colores.texto}`}
                >
                  Centro SMS Clínico
                  <span className="text-xs px-3 py-1 rounded-full bg-black/10 text-white uppercase tracking-wide">
                    Omnicanal
                  </span>
                </h1>
                <p className={`text-sm sm:text-base ${tema.colores.textoSecundario}`}>
                  Todos los mensajes de texto de tus pacientes, campañas y alertas
                  críticas en un solo lugar.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <p className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                {obtenerSaludo()}, {usuario.nombre}
              </p>
              <p className={`text-xs ${tema.colores.textoSecundario}`}>
                {new Date().toLocaleDateString("es-CL", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* Selector de tema compacto */}
            <div className="relative group">
              <button
                className={`p-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <Sparkles className="w-4 h-4" />
              </button>
              <div
                className={`absolute right-0 mt-2 w-60 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-3 space-y-2 z-30`}
              >
                <p className={`text-xs font-bold mb-1 ${tema.colores.texto}`}>
                  Tema visual
                </p>
                {Object.entries(TEMAS).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => cambiarTema(key as TemaColor)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                      temaActual === key
                        ? `bg-gradient-to-r ${config.colores.gradiente} text-white`
                        : `${tema.colores.hover} ${tema.colores.texto}`
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <config.icono className="w-4 h-4" />
                      {config.nombre}
                    </span>
                    {temaActual === key && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={cerrarSesion}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </div>
        </div>

        {/* ESTADÍSTICAS RÁPIDAS */}
        {estadisticasSms && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div
              className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} hover:scale-[1.02] transition-all`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-xs font-semibold uppercase ${tema.colores.textoSecundario}`}
                >
                  SMS hoy
                </span>
                <MessageSquare className="w-4 h-4 text-cyan-400" />
              </div>
              <div className={`text-2xl font-black ${tema.colores.texto}`}>
                {estadisticasSms.total_hoy}
              </div>
              <p className={`text-xs mt-1 ${tema.colores.textoSecundario}`}>
                {estadisticasSms.entregados_hoy} entregados ·{" "}
                {estadisticasSms.fallidos_hoy} fallidos
              </p>
            </div>

            <div
              className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} hover:scale-[1.02] transition-all`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-xs font-semibold uppercase ${tema.colores.textoSecundario}`}
                >
                  Tasa entrega
                </span>
                <Target className="w-4 h-4 text-emerald-400" />
              </div>
              <div className={`text-2xl font-black ${tema.colores.texto}`}>
                {estadisticasSms.tasa_entrega}%
              </div>
              <p className={`text-xs mt-1 ${tema.colores.textoSecundario}`}>
                {estadisticasSms.tasa_fallo}% fallos
              </p>
            </div>

            <div
              className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} hover:scale-[1.02] transition-all`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-xs font-semibold uppercase ${tema.colores.textoSecundario}`}
                >
                  Conversaciones
                </span>
                <Activity className="w-4 h-4 text-violet-400" />
              </div>
              <div className={`text-2xl font-black ${tema.colores.texto}`}>
                {estadisticasSms.conversaciones_abiertas}
              </div>
              <p className={`text-xs mt-1 ${tema.colores.textoSecundario}`}>
                {estadisticasSms.contactos_unicos} contactos únicos
              </p>
            </div>

            <div
              className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} hover:scale-[1.02] transition-all`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-xs font-semibold uppercase ${tema.colores.textoSecundario}`}
                >
                  Dispositivos
                </span>
                <Wifi className="w-4 h-4 text-sky-400" />
              </div>
              <div className={`text-2xl font-black ${tema.colores.texto}`}>
                {dispositivos.length}
              </div>
              <p className={`text-xs mt-1 ${tema.colores.textoSecundario}`}>
                {dispositivos.filter((d) => d.estado === "online").length} online
              </p>
            </div>
          </div>
        )}

        {/* TABS PRINCIPALES */}
        <div
          className={`flex flex-wrap items-center gap-2 mb-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border px-2 py-2 ${tema.colores.sombra}`}
        >
          {[
            { id: "conversaciones", label: "Conversaciones", icon: MessageSquare },
            { id: "campanias", label: "Campañas SMS", icon: Target },
            { id: "plantillas", label: "Plantillas", icon: Paperclip },
            { id: "dispositivos", label: "Dispositivos", icon: PhoneCall },
            { id: "auditoria", label: "Auditoría", icon: Shield },
          ].map((tab) => {
            const Icono = tab.icon;
            const activa = tabActiva === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTabActiva(tab.id as TabPrincipal)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activa
                    ? `bg-gradient-to-r ${tema.colores.gradiente} text-white shadow-lg`
                    : `${tema.colores.hover} ${tema.colores.textoSecundario}`
                }`}
              >
                <Icono className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.id === "conversaciones" &&
                  conversaciones.some((c) => c.mensajes_no_leidos > 0) && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  )}
              </button>
            );
          })}

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => {
                cargarDashboardSms();
                if (conversacionSeleccionada) {
                  cargarMensajesConversacion(conversacionSeleccionada.id_conversacion);
                }
              }}
              className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold ${tema.colores.hover}`}
            >
              <RefreshCwIcon loading={cargandoDatos || cargandoMensajes} />
              Refrescar
            </button>
          </div>
        </div>

        {/* CONTENIDO SEGÚN TAB */}
        {tabActiva === "conversaciones" && (
          <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,0.38fr),minmax(0,0.62fr)] gap-4 lg:gap-6">
            {/* LISTA CONVERSACIONES */}
            <div
              className={`rounded-2xl p-4 sm:p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} flex flex-col`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2
                    className={`text-sm sm:text-base font-black ${tema.colores.texto}`}
                  >
                    Conversaciones de pacientes
                  </h2>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    Bandeja unificada de todos los SMS
                  </p>
                </div>
              </div>

              {/* Búsqueda y filtros */}
              <div className="space-y-2 mb-3">
                <div className="relative">
                  <Filter className={`w-4 h-4 absolute left-3 top-2.5 ${tema.colores.textoSecundario}`} />
                  <input
                    value={busquedaConversacion}
                    onChange={(e) => setBusquedaConversacion(e.target.value)}
                    placeholder="Buscar por nombre, teléfono o contenido..."
                    className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs sm:text-sm ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                  />
                  {busquedaConversacion && (
                    <button
                      onClick={() => setBusquedaConversacion("")}
                      className="absolute right-2 top-2 p-1 rounded-lg hover:bg-black/10"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={filtroEstadoConversacion}
                    onChange={(e) =>
                      setFiltroEstadoConversacion(
                        e.target.value as "todas" | "abierta" | "pendiente" | "cerrada"
                      )
                    }
                    className={`px-2 py-1.5 rounded-xl text-[11px] ${tema.colores.card} ${tema.colores.borde} border`}
                  >
                    <option value="todas">Todos los estados</option>
                    <option value="abierta">Abiertas</option>
                    <option value="pendiente">Pendientes</option>
                    <option value="cerrada">Cerradas</option>
                  </select>

                  <select
                    value={filtroCentroConversacion}
                    onChange={(e) =>
                      setFiltroCentroConversacion(
                        e.target.value === "todos"
                          ? "todos"
                          : Number(e.target.value)
                      )
                    }
                    className={`px-2 py-1.5 rounded-xl text-[11px] ${tema.colores.card} ${tema.colores.borde} border`}
                  >
                    <option value="todos">Todos los centros</option>
                    {centrosDisponibles.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => setFiltroSoloNoLeidos((p) => !p)}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold flex items-center gap-1 ${
                      filtroSoloNoLeidos
                        ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/40"
                        : `${tema.colores.card} ${tema.colores.borde} border ${tema.colores.textoSecundario}`
                    }`}
                  >
                    <Bell className="w-3 h-3" />
                    Solo no leídos
                  </button>
                </div>
              </div>

              {/* Lista */}
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-1">
                {conversacionesFiltradas.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center mb-3`}
                    >
                      <MessageSquare className="w-7 h-7 text-white" />
                    </div>
                    <p className={`text-sm font-semibold ${tema.colores.texto}`}>
                      Aún no hay conversaciones
                    </p>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>
                      Cuando recibas o envíes SMS aparecerán aquí.
                    </p>
                  </div>
                ) : (
                  conversacionesFiltradas.map((conv) => {
                    const seleccionada =
                      conversacionSeleccionada?.id_conversacion ===
                      conv.id_conversacion;
                    return (
                      <button
                        key={conv.id_conversacion}
                        onClick={() => seleccionarConversacion(conv)}
                        className={`w-full text-left rounded-2xl px-3 py-2.5 mb-1 flex gap-3 items-start transition-all ${
                          seleccionada
                            ? `bg-gradient-to-r ${tema.colores.gradiente} text-white shadow-lg`
                            : `${tema.colores.card} ${tema.colores.borde} border hover:scale-[1.01]`
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            seleccionada
                              ? "bg-black/10 text-white"
                              : "bg-black/10 text-white"
                          }`}
                        >
                          {conv.nombre_contacto
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .substring(0, 2)
                            .toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between gap-2 mb-0.5">
                            <p
                              className={`text-xs sm:text-sm font-bold truncate ${
                                seleccionada
                                  ? "text-white"
                                  : tema.colores.texto
                              }`}
                            >
                              {conv.nombre_contacto}
                            </p>
                            <span
                              className={`text-[10px] whitespace-nowrap ${
                                seleccionada
                                  ? "text-white/80"
                                  : tema.colores.textoSecundario
                              }`}
                            >
                              {formatearHora(conv.fecha_ultimo_mensaje)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-[10px] font-mono ${
                                seleccionada
                                  ? "text-white/80"
                                  : tema.colores.textoSecundario
                              }`}
                            >
                              {conv.numero_telefono}
                            </span>
                            {conv.centro?.nombre && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-black/10 uppercase tracking-wide">
                                {conv.centro.nombre}
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-[11px] line-clamp-2 ${
                              seleccionada
                                ? "text-white/90"
                                : tema.colores.textoSecundario
                            }`}
                          >
                            {conv.ultimo_mensaje}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border ${obtenerColorEstadoConversacion(
                                  conv.estado
                                )}`}
                              >
                                {conv.estado.toUpperCase()}
                              </span>
                              {conv.etiqueta_riesgo && (
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border ${obtenerColorRiesgo(
                                    conv.etiqueta_riesgo
                                  )}`}
                                >
                                  {conv.etiqueta_riesgo.toUpperCase()}
                                </span>
                              )}
                            </div>
                            {conv.mensajes_no_leidos > 0 && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white">
                                {conv.mensajes_no_leidos > 99
                                  ? "99+"
                                  : conv.mensajes_no_leidos}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* PANEL CHAT / DETALLE */}
            <div
              className={`rounded-2xl p-4 sm:p-5 flex flex-col ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              {!conversacionSeleccionada ? (
                <div className="flex flex-col items-center justify-center flex-1 py-12 text-center">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center mb-4`}
                  >
                    <Phone className="w-8 h-8 text-white" />
                  </div>
                  <p className={`text-sm sm:text-base ${tema.colores.texto}`}>
                    Selecciona una conversación para comenzar a escribir.
                  </p>
                  <p className={`text-xs mt-1 ${tema.colores.textoSecundario}`}>
                    Todos los mensajes se quedarán registrados en la ficha del paciente.
                  </p>
                </div>
              ) : (
                <>
                  {/* Header de conversación */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-sm font-bold text-white shadow-lg`}
                      >
                        {conversacionSeleccionada.nombre_contacto
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p
                            className={`text-sm sm:text-base font-black ${tema.colores.texto}`}
                          >
                            {conversacionSeleccionada.nombre_contacto}
                          </p>
                          {conversacionSeleccionada.centro?.nombre && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-black/10 uppercase tracking-wide">
                              {conversacionSeleccionada.centro.nombre}
                            </span>
                          )}
                        </div>
                        <p className={`text-[11px] ${tema.colores.textoSecundario}`}>
                          {conversacionSeleccionada.numero_telefono}
                        </p>
                        <p className={`text-[11px] ${tema.colores.textoSecundario}`}>
                          Último mensaje ·{" "}
                          {formatearFecha(
                            conversacionSeleccionada.fecha_ultimo_mensaje
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border ${obtenerColorEstadoConversacion(
                          conversacionSeleccionada.estado
                        )}`}
                      >
                        {conversacionSeleccionada.estado.toUpperCase()}
                      </span>
                      {conversacionSeleccionada.etiqueta_riesgo && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border ${obtenerColorRiesgo(
                            conversacionSeleccionada.etiqueta_riesgo
                          )}`}
                        >
                          {conversacionSeleccionada.etiqueta_riesgo.toUpperCase()}
                        </span>
                      )}
                      {conversacionSeleccionada.id_paciente && (
                        <Link
                          href={`/secretaria/pacientes/${conversacionSeleccionada.id_paciente}`}
                          className={`hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-semibold ${tema.colores.primario} text-white`}
                        >
                          <User className="w-3 h-3" />
                          Ver ficha
                        </Link>
                      )}
                      <button className="p-2 rounded-xl hover:bg-black/10">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Mensajes */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar mb-3 space-y-2 pr-1">
                    {cargandoMensajes ? (
                      <div className="flex items-center justify-center py-10">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                      </div>
                    ) : mensajesConversacion.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <MessageSquare className="w-8 h-8 mb-2 text-indigo-400" />
                        <p
                          className={`text-sm font-semibold ${tema.colores.texto}`}
                        >
                          Aún no hay mensajes en esta conversación
                        </p>
                        <p
                          className={`text-xs ${tema.colores.textoSecundario}`}
                        >
                          Escribe el primer SMS para iniciar el contacto.
                        </p>
                      </div>
                    ) : (
                      mensajesConversacion.map((msg) => {
                        const esSaliente = msg.direccion === "saliente";
                        return (
                          <div
                            key={msg.id_mensaje}
                            className={`flex ${
                              esSaliente ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs sm:text-sm shadow-md ${
                                esSaliente
                                  ? `bg-gradient-to-br ${tema.colores.gradiente} text-white`
                                  : `${tema.colores.secundario} ${tema.colores.texto}`
                              }`}
                            >
                              {msg.etiqueta_sistema && (
                                <p
                                  className={`text-[9px] mb-1 font-semibold uppercase tracking-wide ${
                                    esSaliente ? "text-white/80" : "opacity-70"
                                  }`}
                                >
                                  {msg.etiqueta_sistema.replace("_", " ")}
                                </p>
                              )}
                              <p className="whitespace-pre-wrap">{msg.contenido}</p>
                              <div className="flex items-center justify-end gap-2 mt-1">
                                <span
                                  className={`text-[9px] ${
                                    esSaliente ? "text-white/80" : "opacity-70"
                                  }`}
                                >
                                  {formatearHora(msg.fecha_envio)}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border ${obtenerColorEstadoEntrega(
                                    msg.estado_entrega
                                  )}`}
                                >
                                  {msg.estado_entrega.toUpperCase()}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Composer */}
                  <div
                    className={`rounded-2xl p-3 border ${tema.colores.borde} ${tema.colores.card}`}
                  >
                    <div className="flex flex-col sm:flex-row gap-2 mb-2">
                      <select
                        value={plantillaSeleccionadaId}
                        onChange={(e) => {
                          const value = e.target.value
                            ? Number(e.target.value)
                            : "";
                          setPlantillaSeleccionadaId(value);
                          if (value) {
                            const pl = plantillas.find(
                              (p) => p.id_plantilla === value
                            );
                            if (pl) {
                              setMensajeNuevo(pl.contenido);
                            }
                          }
                        }}
                        className={`flex-1 px-2 py-1.5 rounded-xl text-[11px] ${tema.colores.card} ${tema.colores.borde} border`}
                      >
                        <option value="">Sin plantilla</option>
                        {plantillas
                          .filter((p) => p.activo)
                          .map((p) => (
                            <option key={p.id_plantilla} value={p.id_plantilla}>
                              {p.nombre} ({p.idioma.toUpperCase()})
                            </option>
                          ))}
                      </select>

                      <button
                        type="button"
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold inline-flex items-center gap-1 ${tema.colores.hover}`}
                        onClick={() =>
                          alert(
                            "En la versión completa podrás generar texto sugerido por IA con contexto del paciente."
                          )
                        }
                      >
                        <Sparkles className="w-3 h-3" />
                        Sugerir texto IA
                      </button>
                    </div>

                    <div className="flex items-end gap-2">
                      <div className="flex-1 relative">
                        <textarea
                          value={mensajeNuevo}
                          onChange={(e) => setMensajeNuevo(e.target.value)}
                          rows={3}
                          className={`w-full rounded-2xl text-xs sm:text-sm resize-none pr-9 pl-3 py-2 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 custom-scrollbar`}
                          placeholder="Escribe el SMS al paciente..."
                        />
                        <div className="absolute right-2 bottom-2 flex items-center gap-1">
                          <button
                            type="button"
                            className="p-1 rounded-lg hover:bg-black/10"
                            title="Adjuntar enlace o documento"
                          >
                            <Paperclip className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            className="p-1 rounded-lg hover:bg-black/10"
                            title="Dictar por voz (futuro)"
                          >
                            <Mic className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={enviarSmsActual}
                        disabled={enviandoSms}
                        className={`flex items-center justify-center gap-1 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold text-white ${tema.colores.primario} ${tema.colores.sombra} disabled:opacity-60`}
                      >
                        {enviandoSms ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        Enviar
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <p className={`text-[10px] ${tema.colores.textoSecundario}`}>
                        Se enviará como SMS desde el dispositivo configurado del
                        centro.
                      </p>
                      <p className="text-[10px] text-right text-emerald-400">
                        Todos los SMS quedan auditados automáticamente.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* CAMPANÍAS */}
        {tabActiva === "campanias" && (
          <section
            className={`rounded-2xl p-4 sm:p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} grid grid-cols-1 lg:grid-cols-[minmax(0,0.6fr),minmax(0,0.4fr)] gap-6`}
          >
            <div>
              <h2 className={`text-base sm:text-lg font-black mb-1 ${tema.colores.texto}`}>
                Campañas masivas de SMS
              </h2>
              <p className={`text-xs sm:text-sm mb-4 ${tema.colores.textoSecundario}`}>
                Envía recordatorios, campañas de salud y comunicados importantes a
                cientos de pacientes con control total.
              </p>

              <div className="space-y-3">
                <div>
                  <label
                    className={`text-xs font-semibold ${tema.colores.texto}`}
                  >
                    Segmento de pacientes
                  </label>
                  <select
                    value={segmentoCampania}
                    onChange={(e) => setSegmentoCampania(e.target.value)}
                    className={`mt-1 w-full px-3 py-2 rounded-xl text-xs sm:text-sm ${tema.colores.card} ${tema.colores.borde} border`}
                  >
                    <option value="citas_manana">
                      Pacientes con cita mañana
                    </option>
                    <option value="citas_proximos_7">
                      Pacientes con cita en próximos 7 días
                    </option>
                    <option value="pacientes_sin_control">
                      Pacientes sin control Mayor a 6 meses
                    </option>
                    <option value="pacientes_cronicos">
                      Pacientes crónicos priorizados
                    </option>
                    <option value="todos_pacientes">
                      Todos los pacientes del centro
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    className={`text-xs font-semibold ${tema.colores.texto}`}
                  >
                    Plantilla de mensaje
                  </label>
                  <select
                    value={plantillaCampaniaId}
                    onChange={(e) =>
                      setPlantillaCampaniaId(
                        e.target.value ? Number(e.target.value) : ""
                      )
                    }
                    className={`mt-1 w-full px-3 py-2 rounded-xl text-xs sm:text-sm ${tema.colores.card} ${tema.colores.borde} border`}
                  >
                    <option value="">Selecciona una plantilla...</option>
                    {plantillas
                      .filter((p) => p.activo)
                      .map((p) => (
                        <option key={p.id_plantilla} value={p.id_plantilla}>
                          {p.nombre} [{p.categoria}]
                        </option>
                      ))}
                  </select>
                  <p className={`text-[10px] mt-1 ${tema.colores.textoSecundario}`}>
                    Puedes administrar plantillas en la pestaña "Plantillas".
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      className={`text-xs font-semibold ${tema.colores.texto}`}
                    >
                      Modo de envío
                    </label>
                    <div className="mt-1 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setProgramarEnvio("ahora")}
                        className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold ${
                          programarEnvio === "ahora"
                            ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                            : `${tema.colores.card} ${tema.colores.borde} border`
                        }`}
                      >
                        Enviar ahora
                      </button>
                      <button
                        type="button"
                        onClick={() => setProgramarEnvio("programado")}
                        className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold ${
                          programarEnvio === "programado"
                            ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                            : `${tema.colores.card} ${tema.colores.borde} border`
                        }`}
                      >
                        Programar
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      className={`text-xs font-semibold ${tema.colores.texto}`}
                    >
                      Fecha y hora
                    </label>
                    <div className="mt-1 grid grid-cols-[1.2fr,0.8fr] gap-2">
                      <input
                        type="date"
                        disabled={programarEnvio === "ahora"}
                        value={fechaProgramada}
                        onChange={(e) => setFechaProgramada(e.target.value)}
                        className={`px-3 py-2 rounded-xl text-xs ${tema.colores.card} ${tema.colores.borde} border disabled:opacity-60`}
                      />
                      <input
                        type="time"
                        disabled={programarEnvio === "ahora"}
                        value={horaProgramada}
                        onChange={(e) => setHoraProgramada(e.target.value)}
                        className={`px-3 py-2 rounded-xl text-xs ${tema.colores.card} ${tema.colores.borde} border disabled:opacity-60`}
                      />
                    </div>
                    <p className={`text-[10px] mt-1 ${tema.colores.textoSecundario}`}>
                      Hora del servidor · considera la jornada del centro.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={estimarDestinatariosCampania}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1 ${tema.colores.hover}`}
                  >
                    <Activity className="w-3 h-3" />
                    Estimar destinatarios
                  </button>
                  {estimacionDestinatarios !== null && (
                    <span
                      className={`text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30`}
                    >
                      Aproximadamente {estimacionDestinatarios} destinatarios
                    </span>
                  )}
                </div>

                <div className="pt-3 border-t border-black/10 flex items-center justify-between flex-wrap gap-3">
                  <p className={`text-[10px] ${tema.colores.textoSecundario}`}>
                    Las campañas quedan auditadas por usuario, fecha y segmento
                    utilizado.
                  </p>
                  <button
                    type="button"
                    onClick={programarCampaniaSms}
                    className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold text-white ${tema.colores.primario} ${tema.colores.sombra}`}
                  >
                    Confirmar campaña SMS
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div
                className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <h3 className={`text-sm font-bold ${tema.colores.texto}`}>
                    Buenas prácticas
                  </h3>
                </div>
                <ul className={`text-[11px] space-y-1 ${tema.colores.textoSecundario}`}>
                  <li>• Evita enviar campañas fuera del horario laboral.</li>
                  <li>• Respeta las preferencias de contacto de cada paciente.</li>
                  <li>• Usa plantillas cortas, claras y sin información sensible.</li>
                  <li>
                    • Para mensajes clínicos detallados, sugiere al paciente revisar
                    correo o agenda.
                  </li>
                </ul>
              </div>

              <div
                className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <h3 className={`text-sm font-bold ${tema.colores.texto}`}>
                    Resumen de cumplimiento
                  </h3>
                </div>
                <p className={`text-[11px] mb-2 ${tema.colores.textoSecundario}`}>
                  El sistema registra:
                </p>
                <ul className={`text-[11px] space-y-1 ${tema.colores.textoSecundario}`}>
                  <li>• Usuario que creó la campaña.</li>
                  <li>• Segmento de pacientes utilizado.</li>
                  <li>• Plantilla y contenido final del SMS.</li>
                  <li>• Fecha/hora de creación y ejecución.</li>
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* PLANTILLAS */}
        {tabActiva === "plantillas" && (
          <section
            className={`rounded-2xl p-4 sm:p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h2 className={`text-base sm:text-lg font-black ${tema.colores.texto}`}>
                  Plantillas de SMS
                </h2>
                <p className={`text-xs sm:text-sm ${tema.colores.textoSecundario}`}>
                  Mensajes reutilizables para citas, campañas y avisos.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  alert(
                    "En la versión completa podrás crear/editar plantillas con variables dinámicas (nombre, fecha, hora, centro, etc.)."
                  )
                }
                className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold ${tema.colores.primario} text-white`}
              >
                <PlusIcon />
                Nueva plantilla
              </button>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="text-[11px] uppercase tracking-wide opacity-70">
                  <tr>
                    <th className="pb-2 pr-3">Nombre</th>
                    <th className="pb-2 pr-3">Categoría</th>
                    <th className="pb-2 pr-3">Idioma</th>
                    <th className="pb-2 pr-3">Variables</th>
                    <th className="pb-2 pr-3">Activo</th>
                    <th className="pb-2 pr-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {plantillas.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className={`py-6 text-center text-xs ${tema.colores.textoSecundario}`}
                      >
                        Aún no hay plantillas configuradas.
                      </td>
                    </tr>
                  ) : (
                    plantillas.map((pl) => (
                      <tr key={pl.id_plantilla} className="border-t border-black/10">
                        <td className="py-2 pr-3">
                          <div className="flex flex-col">
                            <span
                              className={`font-semibold ${tema.colores.texto}`}
                            >
                              {pl.nombre}
                            </span>
                            <span
                              className={`text-[10px] line-clamp-1 ${tema.colores.textoSecundario}`}
                            >
                              {pl.contenido}
                            </span>
                          </div>
                        </td>
                        <td className="py-2 pr-3 text-[11px]">
                          {pl.categoria.replace("_", " ")}
                        </td>
                        <td className="py-2 pr-3 text-[11px]">
                          {pl.idioma.toUpperCase()}
                        </td>
                        <td className="py-2 pr-3 text-[11px]">
                          {pl.variables.length === 0 ? (
                            <span className={tema.colores.textoSecundario}>
                              (sin variables)
                            </span>
                          ) : (
                            pl.variables.map((v) => `{{${v}}}`).join(", ")
                          )}
                        </td>
                        <td className="py-2 pr-3 text-[11px]">
                          {pl.activo ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              Activo
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-500/15 text-slate-300 border border-slate-500/30">
                              Inactivo
                            </span>
                          )}
                        </td>
                        <td className="py-2 pr-3 text-right">
                          <button
                            type="button"
                            className="p-1.5 rounded-lg hover:bg-black/10 mr-1"
                            onClick={() =>
                              alert(
                                "Aquí podrás editar la plantilla completa en una ventana lateral."
                              )
                            }
                          >
                            <EditIcon />
                          </button>
                          <button
                            type="button"
                            className="p-1.5 rounded-lg hover:bg-black/10 text-red-400"
                            onClick={() =>
                              alert(
                                "En la versión completa podrás desactivar o eliminar plantillas."
                              )
                            }
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* DISPOSITIVOS */}
        {tabActiva === "dispositivos" && (
          <section
            className={`rounded-2xl p-4 sm:p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h2 className={`text-base sm:text-lg font-black ${tema.colores.texto}`}>
                  Dispositivos y pasarelas SMS
                </h2>
                <p className={`text-xs sm:text-sm ${tema.colores.textoSecundario}`}>
                  Teléfonos físicos, gateways SIM y APIs conectadas al centro.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  alert(
                    "En la versión completa podrás vincular nuevos dispositivos escaneando un QR desde tu teléfono."
                  )
                }
                className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold ${tema.colores.primario} text-white`}
              >
                <PlusIcon />
                Vincular dispositivo
              </button>
            </div>

            {dispositivos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <WifiOff className="w-8 h-8 mb-3 text-slate-400" />
                <p className={`text-sm font-semibold ${tema.colores.texto}`}>
                  No hay dispositivos conectados
                </p>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  Vincula un teléfono o gateway para empezar a enviar y recibir SMS.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dispositivos.map((d) => (
                  <div
                    key={d.id_dispositivo}
                    className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} flex flex-col gap-2`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p
                          className={`text-sm font-bold flex items-center gap-1 ${tema.colores.texto}`}
                        >
                          {d.nombre}
                          {d.tipo === "android_bridge" && (
                            <Phone className="w-3 h-3 text-emerald-400" />
                          )}
                          {d.tipo === "gateway_sim" && (
                            <Wifi className="w-3 h-3 text-sky-400" />
                          )}
                          {d.tipo === "api_directa" && (
                            <Zap className="w-3 h-3 text-yellow-400" />
                          )}
                        </p>
                        <p
                          className={`text-[11px] font-mono ${tema.colores.textoSecundario}`}
                        >
                          {d.numero_telefono}
                        </p>
                        <p className={`text-[11px] ${tema.colores.textoSecundario}`}>
                          {d.proveedor || "Proveedor interno AnyssaMed"}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border ${obtenerColorDispositivo(
                          d.estado
                        )}`}
                      >
                        {d.estado.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] mt-1">
                      <span className={tema.colores.textoSecundario}>
                        Último contacto:{" "}
                        {d.ultimo_contacto
                          ? formatearFecha(d.ultimo_contacto)
                          : "Sin datos"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className={tema.colores.textoSecundario}>
                        En cola: {d.mensajes_en_cola}
                      </span>
                      <span className={tema.colores.textoSecundario}>
                        Hoy enviados: {d.mensajes_enviados_hoy}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => sincronizarDispositivo(d.id_dispositivo)}
                        className={`flex-1 px-3 py-1.5 rounded-xl text-[11px] font-semibold ${tema.colores.hover}`}
                      >
                        Sincronizar ahora
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          alert(
                            "En la versión completa podrás ver el log detallado del dispositivo."
                          )
                        }
                        className="px-2 py-1.5 rounded-xl text-[11px] font-semibold hover:bg-black/10"
                      >
                        Ver log
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* AUDITORÍA */}
        {tabActiva === "auditoria" && (
          <section
            className={`rounded-2xl p-4 sm:p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h2 className={`text-base sm:text-lg font-black ${tema.colores.texto}`}>
                  Auditoría de SMS
                </h2>
                <p className={`text-xs sm:text-sm ${tema.colores.textoSecundario}`}>
                  Historial detallado de envíos, campañas y acciones de usuarios.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="text-[11px] uppercase tracking-wide opacity-70">
                  <tr>
                    <th className="pb-2 pr-3">Fecha</th>
                    <th className="pb-2 pr-3">Tipo</th>
                    <th className="pb-2 pr-3">Descripción</th>
                    <th className="pb-2 pr-3">Usuario</th>
                    <th className="pb-2 pr-3">Destino</th>
                    <th className="pb-2 pr-3">Resultado</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {auditoriaSms.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className={`py-6 text-center text-xs ${tema.colores.textoSecundario}`}
                      >
                        Aún no hay registros de auditoría.
                      </td>
                    </tr>
                  ) : (
                    auditoriaSms.slice(0, 200).map((ev) => (
                      <tr key={ev.id_evento} className="border-t border-black/10">
                        <td className="py-2 pr-3 text-[11px]">
                          {formatearFecha(ev.fecha_hora)}
                        </td>
                        <td className="py-2 pr-3 text-[11px]">{ev.tipo}</td>
                        <td className="py-2 pr-3 text-[11px]">{ev.descripcion}</td>
                        <td className="py-2 pr-3 text-[11px]">{ev.usuario}</td>
                        <td className="py-2 pr-3 text-[11px]">{ev.destino}</td>
                        <td className="py-2 pr-3 text-[11px]">{ev.resultado}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {/* ESTILOS GLOBALES */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${["dark", "blue", "purple", "green"].includes(
            temaActual
          )
            ? "rgba(31, 41, 55, 0.5)"
            : "rgba(243, 244, 246, 0.5)"};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${["dark", "blue", "purple", "green"].includes(
            temaActual
          )
            ? "rgba(129, 140, 248, 0.6)"
            : "rgba(79, 70, 229, 0.7)"};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${["dark", "blue", "purple", "green"].includes(
            temaActual
          )
            ? "rgba(129, 140, 248, 0.8)"
            : "rgba(79, 70, 229, 0.9)"};
        }
      `}</style>
    </div>
  );
}

// Iconitos pequeños reutilizables
function RefreshCwIcon({ loading }: { loading: boolean }) {
  return (
    <span className="inline-flex items-center justify-center">
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <RefreshCw className="w-3.5 h-3.5" />
      )}
    </span>
  );
}

function PlusIcon() {
  return <Plus className="w-3 h-3" />;
}

function EditIcon() {
  return (
    <svg
      className="w-3 h-3"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path d="M15.232 5.232 18.768 8.768" />
      <path d="M4 20h4l9.5-9.5-4-4L4 16v4z" />
    </svg>
  );
}
