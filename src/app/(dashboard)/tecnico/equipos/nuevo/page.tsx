// src/app/(dashboard)/tecnico/equipos/nuevo/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import SidebarTecnico from "@/components/tecnico/SidebarTecnico";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import {
  Activity,
  AlertCircle,
  AlertTriangle,
  AlertOctagon,
  ArrowLeft,
  ArrowRight,
  Bell,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Cpu,
  Database,
  DollarSign,
  FileText,
  HardDrive,
  Home,
  Info,
  Loader2,
  LogOut,
  MapPin,
  Moon,
  Package,
  Plus,
  Save,
  Search,
  Settings,
  Shield,
  Sparkles,
  Sun,
  Tag,
  Target,
  TrendingUp,
  Upload,
  User,
  Wrench,
  X,
  Zap,
  Barcode,
  Layers,
  Radio,
  Gauge,
} from "lucide-react";

// ================================
// TIPOS
// ================================

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
  tecnico?: {
    id_tecnico: number;
    id_centro: number;
    id_sucursal: number | null;
    id_departamento: number | null;
    area_tecnica: string;
    tipo_tecnico: "soporte" | "mantenimiento" | "ingenieria" | "biomedico";
    extension_telefonica: string | null;
    estado: "activo" | "inactivo" | "suspendido" | "vacaciones";
    disponibilidad: "disponible" | "ocupado" | "fuera_servicio";
    turno: "matutino" | "vespertino" | "nocturno" | "rotativo";
    nivel_acceso: "basico" | "intermedio" | "avanzado" | "administrador";
    pais: string;
    region: string;
    zona_horaria: string;
    centro: {
      id_centro: number;
      nombre: string;
      logo_url: string | null;
      ciudad: string;
      region: string;
    };
    es_global: boolean;
  };
}

interface FormularioEquipo {
  // Identificación Básica
  codigo_interno: string;
  nombre: string;
  tipo_equipo: string;
  marca: string;
  modelo: string;
  numero_serie: string;
  
  // Ubicación
  id_centro: number;
  id_sucursal: number | null;
  ubicacion: string;
  piso: string;
  area: string;
  
  // Estado y Criticidad
  estado: "operativo" | "en_mantenimiento" | "fuera_servicio" | "critico";
  criticidad: "baja" | "media" | "alta" | "critica";
  riesgo_clinico: "bajo" | "medio" | "alto" | "critico";
  
  // Información Técnica
  fecha_adquisicion: string;
  fecha_instalacion: string;
  vida_util_anos: number;
  garantia_meses: number;
  proveedor: string;
  costo_adquisicion: number | null;
  
  // Mantenimiento
  frecuencia_mantenimiento_meses: number;
  ultima_mantencion: string | null;
  proxima_mantencion: string | null;
  requiere_calibracion: boolean;
  frecuencia_calibracion_meses: number | null;
  
  // Operación
  horas_uso_diario_promedio: number;
  consumo_energia_watts: number | null;
  requiere_ups: boolean;
  requiere_clima_controlado: boolean;
  temperatura_operacion_min: number | null;
  temperatura_operacion_max: number | null;
  
  // Responsables
  responsable_tecnico: string;
  telefono_responsable: string | null;
  email_responsable: string | null;
  
  // Documentación
  manual_url: string | null;
  ficha_tecnica_url: string | null;
  certificado_url: string | null;
  observaciones: string | null;
  
  // Conectividad
  tiene_conectividad: boolean;
  tipo_conectividad: string | null;
  ip_asignada: string | null;
  puerto_red: string | null;
}

interface Centro {
  id_centro: number;
  nombre: string;
  ciudad: string;
  region: string;
}

interface Sucursal {
  id_sucursal: number;
  id_centro: number;
  nombre: string;
  direccion: string;
}

interface EstadisticasTecnico {
  tickets_asignados_hoy: number;
  tickets_abiertos: number;
  tickets_en_progreso: number;
  tickets_resueltos_hoy: number;
  tickets_pendientes_confirmacion: number;
  tiempo_promedio_resolucion: number;
  mensajes_sin_leer: number;
  calificacion_promedio: number;
  disponibilidad_porcentaje: number;
  llamadas_realizadas_hoy: number;
  equipos_mantenidos_semana: number;
  tareas_pendientes: number;
  alertas_activas: number;
}

// ================================
// TEMAS PREMIUM ULTRA
// ================================

const TEMAS: Record<TemaColor, ConfiguracionTema> = {
  light: {
    nombre: "Claro Profesional",
    icono: Sun,
    colores: {
      fondo: "from-slate-50 via-blue-50 to-indigo-50",
      fondoSecundario: "bg-white",
      texto: "text-gray-900",
      textoSecundario: "text-gray-600",
      primario:
        "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700",
      secundario: "bg-gray-100 hover:bg-gray-200",
      acento: "text-indigo-600",
      borde: "border-gray-200",
      sombra: "shadow-2xl shadow-indigo-500/10",
      gradiente: "from-indigo-500 via-purple-500 to-pink-500",
      sidebar: "bg-white/95 backdrop-blur-2xl border-gray-200",
      header: "bg-white/90 backdrop-blur-2xl border-gray-200",
      card: "bg-white/80 backdrop-blur-sm border-gray-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10",
      hover: "hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50",
    },
  },
  dark: {
    nombre: "Oscuro Elite",
    icono: Moon,
    colores: {
      fondo: "from-slate-950 via-indigo-950 to-purple-950",
      fondoSecundario: "bg-gray-900",
      texto: "text-white",
      textoSecundario: "text-gray-400",
      primario:
        "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500",
      secundario: "bg-gray-800/50 hover:bg-gray-700/50 backdrop-blur-sm",
      acento: "text-indigo-400",
      borde: "border-gray-800",
      sombra: "shadow-2xl shadow-indigo-500/20",
      gradiente: "from-indigo-500 via-purple-500 to-pink-500",
      sidebar: "bg-gray-900/95 backdrop-blur-2xl border-gray-800",
      header: "bg-gray-900/90 backdrop-blur-2xl border-gray-800",
      card: "bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/20",
      hover: "hover:bg-gradient-to-r hover:from-gray-800/80 hover:to-indigo-900/30",
    },
  },
  blue: {
    nombre: "Azul Técnico Pro",
    icono: Cpu,
    colores: {
      fondo: "from-blue-950 via-cyan-950 to-teal-950",
      fondoSecundario: "bg-blue-900",
      texto: "text-white",
      textoSecundario: "text-cyan-300",
      primario:
        "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500",
      secundario: "bg-blue-800/50 hover:bg-blue-700/50 backdrop-blur-sm",
      acento: "text-cyan-400",
      borde: "border-cyan-800",
      sombra: "shadow-2xl shadow-cyan-500/20",
      gradiente: "from-cyan-500 via-blue-500 to-indigo-500",
      sidebar: "bg-blue-900/95 backdrop-blur-2xl border-cyan-800",
      header: "bg-blue-900/90 backdrop-blur-2xl border-cyan-800",
      card: "bg-blue-800/50 backdrop-blur-sm border-cyan-700 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/20",
      hover: "hover:bg-gradient-to-r hover:from-blue-800/80 hover:to-cyan-900/30",
    },
  },
  purple: {
    nombre: "Púrpura Industrial Elite",
    icono: Sparkles,
    colores: {
      fondo: "from-purple-950 via-fuchsia-950 to-pink-950",
      fondoSecundario: "bg-purple-900",
      texto: "text-white",
      textoSecundario: "text-purple-300",
      primario:
        "bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500",
      secundario: "bg-purple-800/50 hover:bg-purple-700/50 backdrop-blur-sm",
      acento: "text-fuchsia-400",
      borde: "border-purple-800",
      sombra: "shadow-2xl shadow-fuchsia-500/20",
      gradiente: "from-fuchsia-500 via-purple-500 to-pink-500",
      sidebar: "bg-purple-900/95 backdrop-blur-2xl border-purple-800",
      header: "bg-purple-900/90 backdrop-blur-2xl border-purple-800",
      card: "bg-purple-800/50 backdrop-blur-sm border-purple-700 hover:border-fuchsia-500/50 hover:shadow-2xl hover:shadow-fuchsia-500/20",
      hover:
        "hover:bg-gradient-to-r hover:from-purple-800/80 hover:to-fuchsia-900/30",
    },
  },
  green: {
    nombre: "Verde Operacional Pro",
    icono: AlertTriangle,
    colores: {
      fondo: "from-emerald-950 via-teal-950 to-cyan-950",
      fondoSecundario: "bg-emerald-900",
      texto: "text-white",
      textoSecundario: "text-emerald-300",
      primario:
        "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500",
      secundario: "bg-teal-800/50 hover:bg-teal-700/50 backdrop-blur-sm",
      acento: "text-emerald-400",
      borde: "border-emerald-800",
      sombra: "shadow-2xl shadow-emerald-500/20",
      gradiente: "from-emerald-500 via-teal-500 to-cyan-500",
      sidebar: "bg-emerald-900/95 backdrop-blur-2xl border-emerald-800",
      header: "bg-emerald-900/90 backdrop-blur-2xl border-emerald-800",
      card: "bg-emerald-800/50 backdrop-blur-sm border-emerald-700 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/20",
      hover:
        "hover:bg-gradient-to-r hover:from-emerald-800/80 hover:to-teal-900/30",
    },
  },
};

// ================================
// COMPONENTE PRINCIPAL
// ================================

export default function NuevoEquipoPage() {
  const router = useRouter();

  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loadingSesion, setLoadingSesion] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [temaActual, setTemaActual] = useState<TemaColor>("dark");
  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [perfilAbierto, setPerfilAbierto] = useState(false);

  const [disponibilidad, setDisponibilidad] = useState<
    "disponible" | "ocupado" | "fuera_servicio"
  >("disponible");

  const [estadisticas, setEstadisticas] = useState<EstadisticasTecnico | null>(
    null
  );

  // Estado del formulario
  const [pasoActual, setPasoActual] = useState(1);
  const totalPasos = 6;

  const [formulario, setFormulario] = useState<FormularioEquipo>({
    codigo_interno: "",
    nombre: "",
    tipo_equipo: "",
    marca: "",
    modelo: "",
    numero_serie: "",
    id_centro: 0,
    id_sucursal: null,
    ubicacion: "",
    piso: "",
    area: "",
    estado: "operativo",
    criticidad: "media",
    riesgo_clinico: "medio",
    fecha_adquisicion: "",
    fecha_instalacion: "",
    vida_util_anos: 10,
    garantia_meses: 12,
    proveedor: "",
    costo_adquisicion: null,
    frecuencia_mantenimiento_meses: 6,
    ultima_mantencion: null,
    proxima_mantencion: null,
    requiere_calibracion: false,
    frecuencia_calibracion_meses: null,
    horas_uso_diario_promedio: 8,
    consumo_energia_watts: null,
    requiere_ups: false,
    requiere_clima_controlado: false,
    temperatura_operacion_min: null,
    temperatura_operacion_max: null,
    responsable_tecnico: "",
    telefono_responsable: null,
    email_responsable: null,
    manual_url: null,
    ficha_tecnica_url: null,
    certificado_url: null,
    observaciones: null,
    tiene_conectividad: false,
    tipo_conectividad: null,
    ip_asignada: null,
    puerto_red: null,
  });

  const [errores, setErrores] = useState<Record<string, string>>({});
  const [centros, setCentros] = useState<Centro[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loadingCentros, setLoadingCentros] = useState(false);
  const [loadingSucursales, setLoadingSucursales] = useState(false);

  // ================================
  // EFECTOS: TEMA Y BODY
  // ================================

  useEffect(() => {
    if (typeof window !== "undefined") {
      const temaGuardado = localStorage.getItem(
        "tema_tecnico"
      ) as TemaColor | null;
      if (temaGuardado && TEMAS[temaGuardado]) {
        setTemaActual(temaGuardado);
      }
    }
  }, []);

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-700`;
  }, [tema]);

  // ================================
  // EFECTO: CARGAR SESIÓN
  // ================================

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        setLoadingSesion(true);
        const res = await fetch("/api/auth/session", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("No hay sesión activa");
        }

        const data = await res.json();
        if (!data.success || !data.usuario) {
          throw new Error("Sesión inválida");
        }

        const rolesUsuario: string[] = [];

        if (data.usuario.rol?.nombre) {
          rolesUsuario.push(
            data.usuario.rol.nombre
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .trim()
              .toUpperCase()
          );
        }

        const esTecnico = rolesUsuario.some((r) => r.includes("TECNICO"));

        if (!esTecnico) {
          alert(
            `Acceso denegado. Módulo exclusivo para TÉCNICOS.\nRoles actuales: ${rolesUsuario.join(
              ", "
            )}`
          );
          window.location.href = "/";
          return;
        }

        if (!data.usuario.tecnico) {
          alert(
            "Tu usuario tiene rol de TÉCNICO pero no está vinculado a un registro de técnico. Contacta al administrador."
          );
          window.location.href = "/";
          return;
        }

        setUsuario(data.usuario);
        setDisponibilidad(data.usuario.tecnico.disponibilidad);

        // Establecer centro por defecto
        if (data.usuario.tecnico.id_centro) {
          setFormulario((prev) => ({
            ...prev,
            id_centro: data.usuario.tecnico.id_centro,
            id_sucursal: data.usuario.tecnico.id_sucursal,
          }));
        }
      } catch (err) {
        console.error("Error sesión técnico:", err);
        alert("Error al verificar sesión. Serás redirigido al login.");
        window.location.href = "/login";
      } finally {
        setLoadingSesion(false);
      }
    };

    cargarUsuario();
  }, []);

  // ================================
  // CARGAR CENTROS Y SUCURSALES
  // ================================

  useEffect(() => {
    const cargarCentros = async () => {
      try {
        setLoadingCentros(true);
        const res = await fetch("/api/centros", {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.centros) {
            setCentros(data.centros);
          }
        }
      } catch (err) {
        console.error("Error al cargar centros:", err);
      } finally {
        setLoadingCentros(false);
      }
    };

    if (usuario) {
      cargarCentros();
    }
  }, [usuario]);

  useEffect(() => {
    const cargarSucursales = async () => {
      if (!formulario.id_centro) {
        setSucursales([]);
        return;
      }

      try {
        setLoadingSucursales(true);
        const res = await fetch(
          `/api/centros/${formulario.id_centro}/sucursales`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.sucursales) {
            setSucursales(data.sucursales);
          }
        }
      } catch (err) {
        console.error("Error al cargar sucursales:", err);
      } finally {
        setLoadingSucursales(false);
      }
    };

    cargarSucursales();
  }, [formulario.id_centro]);

  // ================================
  // FUNCIONES DE UTILIDAD
  // ================================

  const cambiarTema = async (nuevoTema: TemaColor) => {
    setTemaActual(nuevoTema);
    if (typeof window !== "undefined") {
      localStorage.setItem("tema_tecnico", nuevoTema);
    }

    try {
      await fetch("/api/users/preferencias/tema", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tema_color: nuevoTema }),
      });
    } catch (err) {
      console.error("No se pudo guardar el tema en BD:", err);
    }
  };

  const cambiarDisponibilidad = async (
    nuevoEstado: "disponible" | "ocupado" | "fuera_servicio"
  ) => {
    if (!usuario?.tecnico?.id_tecnico) return;

    try {
      const res = await fetch(
        `/api/tecnico/${usuario.tecnico.id_tecnico}/disponibilidad`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ disponibilidad: nuevoEstado }),
        }
      );

      if (!res.ok) {
        alert("No se pudo actualizar la disponibilidad.");
        return;
      }

      setDisponibilidad(nuevoEstado);
    } catch (err) {
      console.error("Error disponibilidad:", err);
      alert("Error al actualizar disponibilidad.");
    }
  };

  const cerrarSesion = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Error logout:", err);
    } finally {
      window.location.href = "/login";
    }
  };

  // ================================
  // MANEJO DEL FORMULARIO
  // ================================

  const actualizarCampo = (campo: keyof FormularioEquipo, valor: any) => {
    setFormulario((prev) => ({
      ...prev,
      [campo]: valor,
    }));

    // Limpiar error del campo
    if (errores[campo]) {
      setErrores((prev) => {
        const nuevosErrores = { ...prev };
        delete nuevosErrores[campo];
        return nuevosErrores;
      });
    }
  };

  const validarPaso = (paso: number): boolean => {
    const nuevosErrores: Record<string, string> = {};

    switch (paso) {
      case 1: // Identificación Básica
        if (!formulario.codigo_interno.trim())
          nuevosErrores.codigo_interno = "El código interno es obligatorio";
        if (!formulario.nombre.trim())
          nuevosErrores.nombre = "El nombre es obligatorio";
        if (!formulario.tipo_equipo.trim())
          nuevosErrores.tipo_equipo = "El tipo de equipo es obligatorio";
        if (!formulario.marca.trim())
          nuevosErrores.marca = "La marca es obligatoria";
        if (!formulario.modelo.trim())
          nuevosErrores.modelo = "El modelo es obligatorio";
        if (!formulario.numero_serie.trim())
          nuevosErrores.numero_serie = "El número de serie es obligatorio";
        break;

      case 2: // Ubicación
        if (!formulario.id_centro)
          nuevosErrores.id_centro = "Debe seleccionar un centro";
        if (!formulario.ubicacion.trim())
          nuevosErrores.ubicacion = "La ubicación es obligatoria";
        if (!formulario.area.trim())
          nuevosErrores.area = "El área es obligatoria";
        break;

      case 3: // Información Técnica
        if (!formulario.fecha_adquisicion)
          nuevosErrores.fecha_adquisicion = "La fecha de adquisición es obligatoria";
        if (!formulario.proveedor.trim())
          nuevosErrores.proveedor = "El proveedor es obligatorio";
        break;

      case 4: // Mantenimiento
        if (formulario.frecuencia_mantenimiento_meses <= 0)
          nuevosErrores.frecuencia_mantenimiento_meses =
            "La frecuencia debe ser mayor a 0";
        break;

      case 5: // Responsables
        if (!formulario.responsable_tecnico.trim())
          nuevosErrores.responsable_tecnico = "El responsable es obligatorio";
        break;

      case 6: // Documentación (opcional)
        break;
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const siguientePaso = () => {
    if (validarPaso(pasoActual)) {
      if (pasoActual < totalPasos) {
        setPasoActual(pasoActual + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const pasoAnterior = () => {
    if (pasoActual > 1) {
      setPasoActual(pasoActual - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const guardarEquipo = async () => {
    // Validar todos los pasos
    let todosValidos = true;
    for (let i = 1; i <= totalPasos; i++) {
      if (!validarPaso(i)) {
        todosValidos = false;
        setPasoActual(i);
        break;
      }
    }

    if (!todosValidos) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    try {
      setGuardando(true);

      const res = await fetch("/api/tecnico/equipos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formulario),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Error al guardar el equipo");
      }

      alert("✅ Equipo registrado exitosamente");
      router.push("/tecnico/equipos");
    } catch (err: any) {
      console.error("Error al guardar equipo:", err);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setGuardando(false);
    }
  };

  // ================================
  // ESTADOS DE CARGA
  // ================================

  if (loadingSesion) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}
      >
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 border-4 border-indigo-500/40 border-t-transparent rounded-full animate-spin" />
            <div
              className={`absolute inset-3 rounded-full bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-2xl`}
            >
              <Plus className="w-12 h-12 text-white animate-pulse" />
            </div>
          </div>
          <h2
            className={`text-4xl font-black mb-3 ${tema.colores.texto} animate-pulse`}
          >
            Cargando Formulario
          </h2>
          <p className={`text-sm ${tema.colores.textoSecundario}`}>
            Preparando el sistema de registro...
          </p>
        </div>
      </div>
    );
  }

  if (!usuario || !usuario.tecnico) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}
      >
        <div
          className={`max-w-md w-full p-10 rounded-3xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} transform hover:scale-105 transition-all duration-300`}
        >
          <div className="flex flex-col items-center text-center gap-5">
            <div
              className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center mb-2 shadow-2xl animate-pulse`}
            >
              <AlertOctagon className="w-12 h-12 text-white" />
            </div>
            <h2 className={`text-3xl font-black ${tema.colores.texto}`}>
              Acceso restringido
            </h2>
            <p className={`text-sm ${tema.colores.textoSecundario}`}>
              Este módulo es exclusivo para cuentas con rol <b>TÉCNICO</b>.
            </p>
            <Link
              href="/login"
              className={`mt-3 inline-flex items-center gap-2 px-8 py-4 rounded-2xl ${tema.colores.primario} text-white font-bold ${tema.colores.sombra} transform hover:scale-105 transition-all duration-300`}
            >
              <LogOut className="w-5 h-5" />
              Ir al login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ================================
  // RENDER PRINCIPAL ULTRA PREMIUM
  // ================================

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${tema.colores.fondo} transition-all duration-700 relative overflow-hidden`}
    >
      {/* Efectos de fondo animados */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* SIDEBAR */}
      <SidebarTecnico
        usuario={usuario}
        tema={tema}
        sidebarAbierto={sidebarAbierto}
        setSidebarAbierto={setSidebarAbierto}
        estadisticas={estadisticas}
      />

      {/* HEADER ULTRA PREMIUM */}
      <header
        className={`fixed top-0 right-0 z-40 transition-all duration-500 ${
          sidebarAbierto ? "left-72" : "left-20"
        } ${tema.colores.header} ${tema.colores.borde} border-b-2 ${
          tema.colores.sombra
        }`}
      >
        <div className="flex items-center justify-between px-8 py-5">
          {/* Título */}
          <div className="flex items-center gap-4">
            <Link
              href="/tecnico/equipos"
              className={`p-3 rounded-2xl ${tema.colores.secundario} ${tema.colores.texto} transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl`}
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className={`text-2xl font-black ${tema.colores.texto}`}>
                Nuevo Equipo
              </h1>
              <p className={`text-xs ${tema.colores.textoSecundario}`}>
                Paso {pasoActual} de {totalPasos}
              </p>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-3">
            {/* Temas */}
            <div className="relative group">
              <button
                className={`p-3 rounded-2xl ${tema.colores.secundario} ${tema.colores.texto} transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl`}
              >
                <Sparkles className="w-5 h-5 animate-pulse" />
              </button>
              <div
                className={`absolute right-0 mt-3 w-72 rounded-3xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} p-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    Temas Premium
                  </p>
                </div>
                <div className="space-y-2">
                  {Object.entries(TEMAS).map(([key, t]) => (
                    <button
                      key={key}
                      onClick={() => cambiarTema(key as TemaColor)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-300 transform hover:scale-105 ${
                        temaActual === key
                          ? `bg-gradient-to-r ${t.colores.gradiente} text-white shadow-xl`
                          : `${tema.colores.hover} ${tema.colores.texto}`
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <t.icono className="w-5 h-5" />
                        {t.nombre}
                      </span>
                      {temaActual === key && (
                        <Check className="w-5 h-5 animate-bounce" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Disponibilidad */}
            <div className="hidden md:flex items-center gap-2 p-1 rounded-2xl bg-black/10 backdrop-blur-sm">
              <button
                onClick={() => cambiarDisponibilidad("disponible")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 transform hover:scale-105 ${
                  disponibilidad === "disponible"
                    ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/50"
                    : `${tema.colores.texto} hover:bg-white/10`
                }`}
              >
                ✓ Disponible
              </button>
              <button
                onClick={() => cambiarDisponibilidad("ocupado")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 transform hover:scale-105 ${
                  disponibilidad === "ocupado"
                    ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/50"
                    : `${tema.colores.texto} hover:bg-white/10`
                }`}
              >
                ⏸ Ocupado
              </button>
              <button
                onClick={() => cambiarDisponibilidad("fuera_servicio")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 transform hover:scale-105 ${
                  disponibilidad === "fuera_servicio"
                    ? "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-500/50"
                    : `${tema.colores.texto} hover:bg-white/10`
                }`}
              >
                ⊗ Fuera
              </button>
            </div>

            {/* Perfil */}
            <div className="relative">
              <button
                onClick={() => setPerfilAbierto((v) => !v)}
                className={`flex items-center gap-3 px-4 py-2 rounded-2xl ${tema.colores.hover} transform hover:scale-105 transition-all duration-300 shadow-lg`}
              >
                <div className="hidden md:block text-right">
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    {usuario.nombre} {usuario.apellido_paterno}
                  </p>
                  <p className={`text-[10px] ${tema.colores.textoSecundario}`}>
                    Técnico {usuario.tecnico?.tipo_tecnico}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white text-sm font-bold shadow-xl ring-2 ring-white/20`}
                >
                  {usuario.foto_perfil_url ? (
                    <Image
                      src={usuario.foto_perfil_url}
                      alt={usuario.nombre}
                      width={40}
                      height={40}
                      className="rounded-2xl object-cover"
                    />
                  ) : (
                    `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                  )}
                </div>
                <ChevronDown
                  className={`w-4 h-4 ${
                    tema.colores.texto
                  } transition-transform duration-300 ${
                    perfilAbierto ? "rotate-180" : ""
                  }`}
                />
              </button>
              {perfilAbierto && (
                <div
                  className={`absolute right-0 mt-3 w-80 rounded-3xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} p-5 animate-fadeIn`}
                >
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/10">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white text-lg font-bold shadow-xl`}
                    >
                      {usuario.foto_perfil_url ? (
                        <Image
                          src={usuario.foto_perfil_url}
                          alt={usuario.nombre}
                          width={56}
                          height={56}
                          className="rounded-2xl object-cover"
                        />
                      ) : (
                        `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-base font-bold ${tema.colores.texto} truncate`}
                      >
                        {usuario.nombre} {usuario.apellido_paterno}
                      </p>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario} truncate`}
                      >
                        {usuario.tecnico?.centro?.nombre ?? "Sin centro"}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] text-emerald-400 font-semibold">
                          En línea
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <Link
                      href="/tecnico/perfil"
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${tema.colores.hover} ${tema.colores.texto} font-semibold transform hover:scale-105 transition-all duration-200`}
                    >
                      <User className="w-4 h-4" />
                      Mi perfil
                    </Link>
                    <Link
                      href="/tecnico/configuracion"
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${tema.colores.hover} ${tema.colores.texto} font-semibold transform hover:scale-105 transition-all duration-200`}
                    >
                      <Settings className="w-4 h-4" />
                      Configuración
                    </Link>
                    <button
                      onClick={cerrarSesion}
                      className="flex w-full items-center gap-3 px-4 py-3 rounded-2xl text-rose-400 hover:bg-rose-500/20 text-xs font-bold transform hover:scale-105 transition-all duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="px-8 pb-4">
          <div className="flex items-center justify-between mb-2">
            {Array.from({ length: totalPasos }, (_, i) => i + 1).map((paso) => (
              <div
                key={paso}
                className="flex items-center flex-1 last:flex-none"
              >
                <button
                  onClick={() => {
                    if (paso < pasoActual || validarPaso(pasoActual)) {
                      setPasoActual(paso);
                    }
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 transform hover:scale-110 ${
                    paso === pasoActual
                      ? `bg-gradient-to-r ${tema.colores.gradiente} text-white shadow-xl animate-pulse`
                      : paso < pasoActual
                      ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg"
                      : `${tema.colores.secundario} ${tema.colores.texto}`
                  }`}
                >
                  {paso < pasoActual ? <Check className="w-5 h-5" /> : paso}
                </button>
                {paso < totalPasos && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded-full transition-all duration-500 ${
                      paso < pasoActual
                        ? "bg-gradient-to-r from-emerald-600 to-green-600"
                        : "bg-gray-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className={tema.colores.textoSecundario}>Identificación</span>
            <span className={tema.colores.textoSecundario}>Ubicación</span>
            <span className={tema.colores.textoSecundario}>Info Técnica</span>
            <span className={tema.colores.textoSecundario}>Mantenimiento</span>
            <span className={tema.colores.textoSecundario}>Responsables</span>
            <span className={tema.colores.textoSecundario}>Documentación</span>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main
        className={`transition-all duration-500 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } pt-48 px-8 pb-12 relative z-10`}
      >
        {/* Contenedor del formulario */}
        <div className="max-w-5xl mx-auto">
          <div
            className={`rounded-3xl p-8 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} animate-fadeIn`}
          >
            {/* PASO 1: IDENTIFICACIÓN BÁSICA */}
            {pasoActual === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-2xl`}
                  >
                    <Barcode className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-black ${tema.colores.texto}`}>
                      Identificación Básica
                    </h2>
                    <p className={`text-sm ${tema.colores.textoSecundario}`}>
                      Información esencial para identificar el equipo
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Código Interno */}
                  <div>
                    <label
                      className={`block text-sm font-bold ${tema.colores.texto} mb-2`}
                    >
                      Código Interno *
                    </label>
                    <div className="relative">
                      <Tag className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`} />
                      <input
                        type="text"
                        value={formulario.codigo_interno}
                        onChange={(e) =>
                          actualizarCampo("codigo_interno", e.target.value)
                        }
                        placeholder="Ej: EQ-001"
                        className={`w-full pl-11 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border-2 text-sm ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300`}
                      />
                    </div>
                    {errores.codigo_interno && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errores.codigo_interno}
                      </p>
                    )}
                  </div>

                  {/* Nombre */}
                  <div>
                    <label
                      className={`block text-sm font-bold ${tema.colores.texto} mb-2`}
                    >
                      Nombre del Equipo *
                    </label>
                    <div className="relative">
                      <HardDrive className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`} />
                      <input
                        type="text"
                        value={formulario.nombre}
                        onChange={(e) => actualizarCampo("nombre", e.target.value)}
                        placeholder="Ej: Monitor Multiparámetro"
                        className={`w-full pl-11 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border-2 text-sm ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300`}
                      />
                    </div>
                    {errores.nombre && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errores.nombre}
                      </p>
                    )}
                  </div>

                  {/* Tipo de Equipo */}
                  <div>
                    <label
                      className={`block text-sm font-bold ${tema.colores.texto} mb-2`}
                    >
                      Tipo de Equipo *
                    </label>
                    <div className="relative">
                      <Layers className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`} />
                      <select
                        value={formulario.tipo_equipo}
                        onChange={(e) =>
                          actualizarCampo("tipo_equipo", e.target.value)
                        }
                        className={`w-full pl-11 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border-2 text-sm ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 cursor-pointer`}
                      >
                        <option value="">Seleccionar tipo</option>
                        <option value="Monitor biomédico">Monitor biomédico</option>
                        <option value="Equipo de diagnóstico">
                          Equipo de diagnóstico
                        </option>
                        <option value="Equipo de laboratorio">
                          Equipo de laboratorio
                        </option>
                        <option value="Equipo de imagen">Equipo de imagen</option>
                        <option value="Equipo quirúrgico">Equipo quirúrgico</option>
                        <option value="Equipo de terapia">Equipo de terapia</option>
                        <option value="Servidor">Servidor</option>
                        <option value="Computadora">Computadora</option>
                        <option value="Impresora">Impresora</option>
                        <option value="Red y comunicaciones">
                          Red y comunicaciones
                        </option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                    {errores.tipo_equipo && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errores.tipo_equipo}
                      </p>
                    )}
                  </div>

                  {/* Marca */}
                  <div>
                    <label
                      className={`block text-sm font-bold ${tema.colores.texto} mb-2`}
                    >
                      Marca *
                    </label>
                    <input
                      type="text"
                      value={formulario.marca}
                      onChange={(e) => actualizarCampo("marca", e.target.value)}
                      placeholder="Ej: Philips"
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border-2 text-sm ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300`}
                    />
                    {errores.marca && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errores.marca}
                      </p>
                    )}
                  </div>

                  {/* Modelo */}
                  <div>
                    <label
                      className={`block text-sm font-bold ${tema.colores.texto} mb-2`}
                    >
                      Modelo *
                    </label>
                    <input
                      type="text"
                      value={formulario.modelo}
                      onChange={(e) => actualizarCampo("modelo", e.target.value)}
                      placeholder="Ej: IntelliVue MX450"
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border-2 text-sm ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300`}
                    />
                    {errores.modelo && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errores.modelo}
                      </p>
                    )}
                  </div>

                  {/* Número de Serie */}
                  <div>
                    <label
                      className={`block text-sm font-bold ${tema.colores.texto} mb-2`}
                    >
                      Número de Serie *
                    </label>
                    <input
                      type="text"
                      value={formulario.numero_serie}
                      onChange={(e) =>
                        actualizarCampo("numero_serie", e.target.value)
                      }
                      placeholder="Ej: SN-123456789"
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border-2 text-sm ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300`}
                    />
                    {errores.numero_serie && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errores.numero_serie}
                      </p>
                    )}
                  </div>
                </div>

                {/* Estado y Criticidad */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  {/* Estado */}
                  <div>
                    <label
                      className={`block text-sm font-bold ${tema.colores.texto} mb-2`}
                    >
                      Estado Operacional
                    </label>
                    <select
                      value={formulario.estado}
                      onChange={(e) =>
                        actualizarCampo(
                          "estado",
                          e.target.value as FormularioEquipo["estado"]
                        )
                      }
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border-2 text-sm ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 cursor-pointer`}
                    >
                      <option value="operativo">✓ Operativo</option>
                      <option value="en_mantenimiento">⚙️ En Mantenimiento</option>
                      <option value="fuera_servicio">⊗ Fuera de Servicio</option>
                      <option value="critico">🚨 Crítico</option>
                    </select>
                  </div>

                  {/* Criticidad */}
                  <div>
                    <label
                      className={`block text-sm font-bold ${tema.colores.texto} mb-2`}
                    >
                      Nivel de Criticidad
                    </label>
                    <select
                      value={formulario.criticidad}
                      onChange={(e) =>
                        actualizarCampo(
                          "criticidad",
                          e.target.value as FormularioEquipo["criticidad"]
                        )
                      }
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border-2 text-sm ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 cursor-pointer`}
                    >
                      <option value="baja">🟢 Baja</option>
                      <option value="media">🟡 Media</option>
                      <option value="alta">🟠 Alta</option>
                      <option value="critica">🔴 Crítica</option>
                    </select>
                  </div>

                  {/* Riesgo Clínico */}
                  <div>
                    <label
                      className={`block text-sm font-bold ${tema.colores.texto} mb-2`}
                    >
                      Riesgo Clínico
                    </label>
                    <select
                      value={formulario.riesgo_clinico}
                      onChange={(e) =>
                        actualizarCampo(
                          "riesgo_clinico",
                          e.target.value as FormularioEquipo["riesgo_clinico"]
                        )
                      }
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border-2 text-sm ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 cursor-pointer`}
                    >
                      <option value="bajo">🟢 Bajo</option>
                      <option value="medio">🟡 Medio</option>
                      <option value="alto">🟠 Alto</option>
                      <option value="critico">🔴 Crítico</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* PASO 2: UBICACIÓN */}
            {pasoActual === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-2xl`}
                  >
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-black ${tema.colores.texto}`}>
                      Ubicación del Equipo
                    </h2>
                    <p className={`text-sm ${tema.colores.textoSecundario}`}>
                      Define dónde se encuentra instalado el equipo
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Centro */}
                  <div>
                    <label
                      className={`block text-sm font-bold ${tema.colores.texto} mb-2`}
                    >
                      Centro Médico *
                    </label>
                    <div className="relative">
                      <Building2 className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`} />
                      <select
                        value={formulario.id_centro}
                        onChange={(e) =>
                          actualizarCampo("id_centro", Number(e.target.value))
                        }
                        disabled={loadingCentros}
                        className={`w-full pl-11 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border-2 text-sm ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 cursor-pointer`}
                      >
                        <option value={0}>Seleccionar centro</option>
                        {centros.map((centro) => (
                          <option key={centro.id_centro} value={centro.id_centro}>
                            {centro.nombre} - {centro.ciudad}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errores.id_centro && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errores.id_centro}
                      </p>
                    )}
                  </div>

                  {/* Sucursal */}
                  <div>
                    <label
                      className={`block text-sm font-bold ${tema.colores.texto} mb-2`}
                    >
                      Sucursal (Opcional)
                    </label>
                    <div className="relative">
                      <Building2 className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`} />
                      <select
                        value={formulario.id_sucursal || ""}
                        onChange={(e) =>
                          actualizarCampo(
                            "id_sucursal",
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                        disabled={!formulario.id_centro || loadingSucursales}
                        className={`w-full pl-11 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border-2 text-sm ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 cursor-pointer`}
                      >
                        <option value="">Sin sucursal específica</option>
                        {sucursales.map((sucursal) => (
                          <option
                            key={sucursal.id_sucursal}
                            value={sucursal.id_sucursal}
                          >
                            {sucursal.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Ubicación Específica */}
                  <div>
                    <label
                      className={`block text-sm font-bold ${tema.colores.texto} mb-2`}
                    >
                      Ubicación Específica *
                    </label>
                    <input
                      type="text"
                      value={formulario.ubicacion}
                      onChange={(e) =>
                        actualizarCampo("ubicacion", e.target.value)
                      }
                      placeholder="Ej: Urgencias - Box 1"
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border-2 text-sm ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300`}
                    />
                    {errores.ubicacion && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errores.ubicacion}
                      </p>
                    )}
                  </div>

                  {/* Piso */}
                  <div>
                    <label
                      className={`block text-sm font-bold ${tema.colores.texto} mb-2`}
                    >
                      Piso
                    </label>
                    <input
                      type="text"
                      value={formulario.piso}
                      onChange={(e) => actualizarCampo("piso", e.target.value)}
                      placeholder="Ej: Piso 2, Planta Baja"
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border-2 text-sm ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300`}
                    />
                  </div>

                  {/* Área */}
                  <div className="md:col-span-2">
                    <label
                      className={`block text-sm font-bold ${tema.colores.texto} mb-2`}
                    >
                      Área o Departamento *
                    </label>
                    <input
                      type="text"
                      value={formulario.area}
                      onChange={(e) => actualizarCampo("area", e.target.value)}
                      placeholder="Ej: Unidad de Cuidados Intensivos"
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border-2 text-sm ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300`}
                    />
                    {errores.area && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errores.area}
                      </p>
                    )}
                  </div>
                </div>

                {/* Vista previa de ubicación */}
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-indigo-400 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-indigo-400 uppercase mb-1">
                        Vista Previa de Ubicación
                      </p>
                      <p className={`text-sm ${tema.colores.texto} font-semibold`}>
                        {centros.find((c) => c.id_centro === formulario.id_centro)
                          ?.nombre || "Centro no seleccionado"}
                        {formulario.id_sucursal &&
                          ` → ${
                            sucursales.find(
                              (s) => s.id_sucursal === formulario.id_sucursal
                            )?.nombre
                          }`}
                      </p>
                      <p className={`text-xs ${tema.colores.textoSecundario} mt-1`}>
                        {formulario.ubicacion || "Ubicación no especificada"}
                        {formulario.piso && ` • ${formulario.piso}`}
                        {formulario.area && ` • ${formulario.area}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PASO 3: INFORMACIÓN TÉCNICA */}
            {pasoActual === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-2xl`}
                  >
                    <Info className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-black ${tema.colores.texto}`}>
                      Información Técnica
                    </h2>
                    <p className={`text-sm ${tema.colores.textoSecundario}`}>
                      Detalles de adquisición y características técnicas
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Fecha de Adquisición */}
                  <div>
                    <label
                      className={`block text-sm font-bold ${tema.colores.texto} mb-2`}
                    >
                      Fecha de Adquisición *
                    </label>
                    <div className="relative">
                      <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`} />
                      <input
                        type="date"
                        value={formulario.fecha_adquisicion}
                        onChange={(e) =>
                          actualizarCampo("fecha_adquisicion", e.target.value)
                        }
                        className={`w-full pl-11 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border-2 text-sm ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300`}
                      />
                    </div>
                    {errores.fecha_adquisicion && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errores.fecha_adquisicion}
                      </p>
                    )}
                  </div>

                  {/* Fecha de Instalación */}
                  <div>
                    <label
                      className={`block text-sm font-bold ${tema.colores.texto} mb-2`}
                    >
                      Fecha de Instalación
                    </label>
                    <div className="relative">
                      <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`} />
                      <input
                        type="date"
                        value={formulario.fecha_instalacion}
                        onChange={(e) =>
                          actualizarCampo("fecha_instalacion", e.target.value)
                        }
                        className={`w-full pl-11 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border-2 text-sm ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300`}
                      />
                    </div>
                  </div>

                  {/* Proveedor */}
                  <div>
                    <label
                      className={`block text-sm font-bold ${tema.colores.texto} mb-2`}
                    >
                      Proveedor *
                    </label>
                    <div className="relative">
                      <Package className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`} />
                      <input
                        type="text"
                        value={formulario.proveedor}
                        onChange={(e) =>
                          actualizarCampo("proveedor", e.target.value)
                        }
                        placeholder="Nombre del proveedor"
                        className={`w-full pl-11 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border-2 text-sm ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300`}
                      />
                    </div>
                    {errores.proveedor && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errores.proveedor}
                      </p>
                    )}
                  </div>

                  {/* Costo de Adquisición */}
                  <div>
                    <label
                      className={`block text-sm font-bold ${tema.colores.texto} mb-2`}
                    >
                      Costo de Adquisición
                    </label>
                    <div className="relative">
                      <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`} />
                      <input
                        type="number"
                        value={formulario.costo_adquisicion || ""}
                        onChange={(e) =>
                          actualizarCampo(
                            "costo_adquisicion",
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                        placeholder="0.00"
                        className={`w-full pl-11 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border-2 text-sm ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300`}
                      />
                    </div>
                  </div>

                  {/* Vida Útil */}
                  <div>
                    <label
                      className={`block text-sm font-bold ${tema.colores.texto} mb-2`}
                    >
                      Vida Útil (años)
                    </label>
                    <input
                      type="number"
                      value={formulario.vida_util_anos}
                      onChange={(e) =>
                        actualizarCampo("vida_util_anos", Number(e.target.value))
                      }
                      min="1"
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border-2 text-sm ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300`}
                    />
                  </div>

                  {/* Garantía */}
                  <div>
                    <label
                      className={`block text-sm font-bold ${tema.colores.texto} mb-2`}
                    >
                      Garantía (meses)
                    </label>
                    <input
                      type="number"
                      value={formulario.garantia_meses}
                      onChange={(e) =>
                        actualizarCampo("garantia_meses", Number(e.target.value))
                      }
                      min="0"
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border-2 text-sm ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300`}
                    />
                  </div>

                  {/* Horas de Uso Diario */}
                  <div>
                    <label
                      className={`block text-sm font-bold ${tema.colores.texto} mb-2`}
                    >
                      Horas de Uso Diario Promedio
                    </label>
                    <div className="relative">
                      <Clock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`} />
                      <input
                        type="number"
                        value={formulario.horas_uso_diario_promedio}
                        onChange={(e) =>
                          actualizarCampo(
                            "horas_uso_diario_promedio",
                            Number(e.target.value)
                          )
                        }
                        min="0"
                        max="24"
                        className={`w-full pl-11 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border-2 text-sm ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300`}
                      />
                    </div>
                  </div>

                  {/* Consumo de Energía */}
                  <div>
                    <label
                      className={`block text-sm font-bold ${tema.colores.texto} mb-2`}
                    >
                      Consumo de Energía (Watts)
                    </label>
                    <div className="relative">
                      <Zap className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`} />
                      <input
                        type="number"
                        value={formulario.consumo_energia_watts || ""}
                        onChange={(e) =>
                          actualizarCampo(
                            "consumo_energia_watts",
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                        placeholder="0"
                        className={`w-full pl-11 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border-2 text-sm ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300`}
                      />
                    </div>
                  </div>
                </div>

                {/* Opciones Especiales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {/* Requiere UPS */}
                  <div
                    className={`flex items-center justify-between p-4 rounded-2xl ${
                      formulario.requiere_ups
                        ? "bg-indigo-500/20 border-2 border-indigo-500/50"
                        : "bg-black/5 border-2 border-transparent"
                    } transition-all duration-300`}
                  >
                    <div>
                      <label
                        className={`text-sm font-bold ${tema.colores.texto} block mb-1`}
                      >
                        ⚡ Requiere UPS
                      </label>
                      <p className="text-xs text-gray-400">
                        Sistema de alimentación ininterrumpida
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        actualizarCampo("requiere_ups", !formulario.requiere_ups)
                      }
                      className={`w-14 h-7 rounded-full flex items-center px-1 transition-all duration-300 ${
                        formulario.requiere_ups
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/50"
                          : "bg-slate-500/40"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-lg transform transition-transform duration-300 ${
                          formulario.requiere_ups ? "translate-x-7" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Requiere Clima Controlado */}
                  <div
                    className={`flex items-center justify-between p-4 rounded-2xl ${
                      formulario.requiere_clima_controlado
                        ? "bg-sky-500/20 border-2 border-sky-500/50"
                        : "bg-black/5 border-2 border-transparent"
                    } transition-all duration-300`}
                  >
                    <div>
                      <label
                        className={`text-sm font-bold ${tema.colores.texto} block mb-1`}
                      >
                        ❄️ Requiere Clima Controlado
                      </label>
                      <p className="text-xs text-gray-400">
                        Control de temperatura y humedad
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        actualizarCampo(
                          "requiere_clima_controlado",
                          !formulario.requiere_clima_controlado
                        )
                      }
                      className={`w-14 h-7 rounded-full flex items-center px-1 transition-all duration-300 ${
                        formulario.requiere_clima_controlado
                          ? "bg-gradient-to-r from-sky-600 to-blue-600 shadow-lg shadow-sky-500/50"
                          : "bg-slate-500/40"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-lg transform transition-transform duration-300 ${
                          formulario.requiere_clima_controlado
                            ? "translate-x-7"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Temperatura de Operación */}
                {formulario.requiere_clima_controlado && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 animate-fadeIn">
                    <div>
                      <label
                        className={`block text-sm font-bold ${tema.colores.texto} mb-2`}
                      >
                        Temperatura Mínima (°C)
                      </label>
                      <input
                        type="number"
                        value={formulario.temperatura_operacion_min || ""}
                        onChange={(e) =>
                          actualizarCampo(
                            "temperatura_operacion_min",
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                        placeholder="15"
                        className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border-2 text-sm ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all duration-300`}
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-bold ${tema.colores.texto} mb-2`}
                      >
                        Temperatura Máxima (°C)
                      </label>
                      <input
                        type="number"
                        value={formulario.temperatura_operacion_max || ""}
                        onChange={(e) =>
                          actualizarCampo(
                            "temperatura_operacion_max",
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                        placeholder="25"
                        className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border-2 text-sm ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all duration-300`}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PASO 4: MANTENIMIENTO */}
            {pasoActual === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-2xl`}
                  >
                    <Wrench className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-black ${tema.colores.texto}`}>
                      Plan de Mantenimiento
                    </h2>
                    <p className={`text-sm ${tema.colores.textoSecundario}`}>
                      Configuración de mantenimiento preventivo y correctivo
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Frecuencia de Mantenimiento */}
                  <div>
                    <label
                      className={`block text-sm font-bold ${tema.colores.texto} mb-2`}
                    >
                      Frecuencia de Mantenimiento (meses) *
                    </label>
                    <div className="relative">
                      <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`} />
                      <input
                        type="number"
                        value={formulario.frecuencia_mantenimiento_meses}
                        onChange={(e) =>
                          actualizarCampo(
                            "frecuencia_mantenimiento_meses",
                            Number(e.target.value)
                          )
                        }
                        min="1"
                        className={`w-full pl-11 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border-2 text-sm ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300`}
                      />
                    </div>
                    {errores.frecuencia_mantenimiento_meses && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errores.frecuencia_mantenimiento_meses}
                      </p>
                    )}
                  </div>

                  {/* Última Mantención */}
                  <div>
                    <label
                      className={`block text-sm font-bold ${tema.colores.texto} mb-2`}
                    >
                      Última Mantención
                    </label>
                    <div className="relative">
                      <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`} />
                      <input
                        type="date"
                        value={formulario.ultima_mantencion || ""}
                        onChange={(e) =>
                          actualizarCampo(
                            "ultima_mantencion",
                            e.target.value || null
                          )
                        }
                        className={`w-full pl-11 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border-2 text-sm ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300`}
                      />
                    </div>
                  </div>

                  {/* Próxima Mantención */}
                  <div>
                    <label
                      className={`block text-sm font-bold ${tema.colores.texto} mb-2`}
                    >
                      Próxima Mantención
                    </label>
                    <div className="relative">
                      <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`} />
                      <input
                        type="date"
                        value={formulario.proxima_mantencion || ""}
                        onChange={(e) =>
                          actualizarCampo(
                            "proxima_mantencion",
                            e.target.value || null
                          )
                        }
                        className={`w-full pl-11 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border-2 text-sm ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300`}
                      />
                    </div>
                  </div>
                </div>

                {/* Requiere Calibración */}
                <div
                  className={`flex items-center justify-between p-4 rounded-2xl ${
                    formulario.requiere_calibracion
                      ? "bg-purple-500/20 border-2 border-purple-500/50"
                      : "bg-black/5 border-2 border-transparent"
                  } transition-all duration-300`}
                >
                  <div>
                    <label
                      className={`text-sm font-bold ${tema.colores.texto} block mb-1`}
                    >
                      ⚖️ Requiere Calibración
                    </label>
                    <p className="text-xs text-gray-400">
                      El equipo necesita calibración periódica
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      actualizarCampo(
                        "requiere_calibracion",
                        !formulario.requiere_calibracion
                      )
                    }
                    className={`w-14 h-7 rounded-full flex items-center px-1 transition-all duration-300 ${
                      formulario.requiere_calibracion
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/50"
                        : "bg-slate-500/40"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-lg transform transition-transform duration-300 ${
                        formulario.requiere_calibracion
                          ? "translate-x-7"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Frecuencia de Calibración */}
                {formulario.requiere_calibracion && (
                  <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 animate-fadeIn">
                    <label
                      className={`block text-sm font-bold ${tema.colores.texto} mb-2`}
                    >
                      Frecuencia de Calibración (meses)
                    </label>
                    <input
                      type="number"
                      value={formulario.frecuencia_calibracion_meses || ""}
                      onChange={(e) =>
                        actualizarCampo(
                          "frecuencia_calibracion_meses",
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      min="1"
                      placeholder="12"
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border-2 text-sm ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300`}
                    />
                  </div>
                )}
              </div>
            )}

            {/* PASO 5: RESPONSABLES */}
            {pasoActual === 5 && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-2xl`}
                  >
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-black ${tema.colores.texto}`}>
                      Responsables del Equipo
                    </h2>
                    <p className={`text-sm ${tema.colores.textoSecundario}`}>
                      Información de contacto y responsabilidad
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {/* Responsable Técnico */}
                  <div>
                    <label
                      className={`block text-sm font-bold ${tema.colores.texto} mb-2`}
                    >
                      Responsable Técnico *
                    </label>
                    <div className="relative">
                      <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`} />
                      <input
                        type="text"
                        value={formulario.responsable_tecnico}
                        onChange={(e) =>
                          actualizarCampo("responsable_tecnico", e.target.value)
                        }
                        placeholder="Nombre completo del responsable"
                        className={`w-full pl-11 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border-2 text-sm ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300`}
                      />
                    </div>
                    {errores.responsable_tecnico && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errores.responsable_tecnico}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Teléfono */}
                    <div>
                      <label
                        className={`block text-sm font-bold ${tema.colores.texto} mb-2`}
                      >
                        Teléfono de Contacto
                      </label>
                      <input
                        type="tel"
                        value={formulario.telefono_responsable || ""}
                        onChange={(e) =>
                          actualizarCampo(
                            "telefono_responsable",
                            e.target.value || null
                          )
                        }
                        placeholder="+56 9 1234 5678"
                        className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border-2 text-sm ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300`}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        className={`block text-sm font-bold ${tema.colores.texto} mb-2`}
                      >
                        Email de Contacto
                      </label>
                      <input
                        type="email"
                        value={formulario.email_responsable || ""}
                        onChange={(e) =>
                          actualizarCampo(
                            "email_responsable",
                            e.target.value || null
                          )
                        }
                        placeholder="responsable@ejemplo.com"
                        className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border-2 text-sm ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300`}
                      />
                    </div>
                  </div>
                </div>

                {/* Vista previa del responsable */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white text-lg font-bold shadow-xl`}
                    >
                      {formulario.responsable_tecnico
                        ? formulario.responsable_tecnico
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)
                        : "??"}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-indigo-400 uppercase mb-1">
                        Responsable del Equipo
                      </p>
                      <p className={`text-lg font-black ${tema.colores.texto}`}>
                        {formulario.responsable_tecnico || "Sin asignar"}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        {formulario.telefono_responsable && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            📞 {formulario.telefono_responsable}
                          </span>
                        )}
                        {formulario.email_responsable && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            ✉️ {formulario.email_responsable}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PASO 6: DOCUMENTACIÓN Y CONECTIVIDAD */}
            {pasoActual === 6 && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-2xl`}
                  >
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-black ${tema.colores.texto}`}>
                      Documentación y Conectividad
                    </h2>
                    <p className={`text-sm ${tema.colores.textoSecundario}`}>
                      Información adicional y configuración de red
                    </p>
                  </div>
                </div>

                {/* Documentación */}
                <div className="space-y-4">
                  <h3 className={`text-lg font-bold ${tema.colores.texto}`}>
                    📄 Documentación (Opcional)
                  </h3>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label
                        className={`block text-sm font-bold ${tema.colores.texto} mb-2`}
                      >
                        URL del Manual
                      </label>
                      <input
                        type="url"
                        value={formulario.manual_url || ""}
                        onChange={(e) =>
                          actualizarCampo("manual_url", e.target.value || null)
                        }
                        placeholder="https://ejemplo.com/manual.pdf"
                        className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border-2 text-sm ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300`}
                      />
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-bold ${tema.colores.texto} mb-2`}
                      >
                        URL de Ficha Técnica
                      </label>
                      <input
                        type="url"
                        value={formulario.ficha_tecnica_url || ""}
                        onChange={(e) =>
                          actualizarCampo(
                            "ficha_tecnica_url",
                            e.target.value || null
                          )
                        }
                        placeholder="https://ejemplo.com/ficha-tecnica.pdf"
                        className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border-2 text-sm ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300`}
                      />
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-bold ${tema.colores.texto} mb-2`}
                      >
                        URL de Certificado
                      </label>
                      <input
                        type="url"
                        value={formulario.certificado_url || ""}
                        onChange={(e) =>
                          actualizarCampo(
                            "certificado_url",
                            e.target.value || null
                          )
                        }
                        placeholder="https://ejemplo.com/certificado.pdf"
                        className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border-2 text-sm ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300`}
                      />
                    </div>
                  </div>
                </div>

                {/* Conectividad */}
                <div className="space-y-4 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-lg font-bold ${tema.colores.texto}`}>
                      🌐 Conectividad de Red
                    </h3>
                    <button
                      onClick={() =>
                        actualizarCampo(
                          "tiene_conectividad",
                          !formulario.tiene_conectividad
                        )
                      }
                      className={`w-14 h-7 rounded-full flex items-center px-1 transition-all duration-300 ${
                        formulario.tiene_conectividad
                          ? "bg-gradient-to-r from-emerald-600 to-green-600 shadow-lg shadow-emerald-500/50"
                          : "bg-slate-500/40"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-lg transform transition-transform duration-300 ${
                          formulario.tiene_conectividad
                            ? "translate-x-7"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {formulario.tiene_conectividad && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 animate-fadeIn">
                      <div>
                        <label
                          className={`block text-sm font-bold ${tema.colores.texto} mb-2`}
                        >
                          Tipo de Conectividad
                        </label>
                        <select
                          value={formulario.tipo_conectividad || ""}
                          onChange={(e) =>
                            actualizarCampo(
                              "tipo_conectividad",
                              e.target.value || null
                            )
                          }
                          className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border-2 text-sm ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-300 cursor-pointer`}
                        >
                          <option value="">Seleccionar tipo</option>
                          <option value="ethernet">Ethernet</option>
                          <option value="wifi">WiFi</option>
                          <option value="bluetooth">Bluetooth</option>
                          <option value="serial">Serial</option>
                          <option value="usb">USB</option>
                          <option value="otro">Otro</option>
                        </select>
                      </div>

                      <div>
                        <label
                          className={`block text-sm font-bold ${tema.colores.texto} mb-2`}
                        >
                          Dirección IP
                        </label>
                        <input
                          type="text"
                          value={formulario.ip_asignada || ""}
                          onChange={(e) =>
                            actualizarCampo("ip_asignada", e.target.value || null)
                          }
                          placeholder="192.168.1.100"
                          className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border-2 text-sm ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-300`}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label
                          className={`block text-sm font-bold ${tema.colores.texto} mb-2`}
                        >
                          Puerto de Red
                        </label>
                        <input
                          type="text"
                          value={formulario.puerto_red || ""}
                          onChange={(e) =>
                            actualizarCampo("puerto_red", e.target.value || null)
                          }
                          placeholder="Ej: Switch 1 - Puerto 24"
                          className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border-2 text-sm ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-300`}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Observaciones */}
                <div>
                  <label
                    className={`block text-sm font-bold ${tema.colores.texto} mb-2`}
                  >
                    Observaciones Adicionales
                  </label>
                  <textarea
                    value={formulario.observaciones || ""}
                    onChange={(e) =>
                      actualizarCampo("observaciones", e.target.value || null)
                    }
                    placeholder="Información adicional relevante sobre el equipo..."
                    rows={4}
                    className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border-2 text-sm ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 resize-none`}
                  />
                </div>
              </div>
            )}

            {/* Botones de Navegación */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
              <button
                onClick={pasoAnterior}
                disabled={pasoActual === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                  pasoActual === 1
                    ? "opacity-50 cursor-not-allowed bg-gray-600"
                    : `${tema.colores.secundario} ${tema.colores.texto} shadow-lg hover:shadow-xl`
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
                Anterior
              </button>

              <div className="flex items-center gap-3">
                {pasoActual < totalPasos ? (
                  <button
                    onClick={siguientePaso}
                    className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-sm font-bold ${tema.colores.primario} text-white transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl`}
                  >
                    Siguiente
                    <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={guardarEquipo}
                    disabled={guardando}
                    className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl ${
                      guardando ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {guardando ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Guardar Equipo
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ESTILOS GLOBALES ULTRA PREMIUM */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        /* Transiciones suaves */
        input,
        select,
        textarea,
        button {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Efectos de enfoque mejorados */
        input:focus,
        select:focus,
        textarea:focus {
          transform: translateY(-1px);
        }

        /* Scrollbar personalizado */
        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(
            135deg,
            rgba(99, 102, 241, 0.8),
            rgba(168, 85, 247, 0.8)
          );
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(
            135deg,
            rgba(99, 102, 241, 1),
            rgba(168, 85, 247, 1)
          );
        }
      `}</style>
    </div>
  );
}
