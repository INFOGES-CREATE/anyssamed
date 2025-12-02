"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Search,
  Filter,
  Download,
  RefreshCw,
  Mail,
  Phone,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  X,
  MoreVertical,
  Lock,
  Unlock,
  FileText,
  Printer,
  Grid,
  List,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  UserCheck,
  UserX,
  Settings,
  Award,
  Briefcase,
  MapPin,
  Building,
  DollarSign,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
  Star,
  MessageSquare,
  Bell,
  Send,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  CheckCheck,
  AlertTriangle,
  Info,
  Plus,
  Minus,
  Upload,
  Image,
  FileSpreadsheet,
  SlidersHorizontal,
  ArrowUpDown,
  Archive,
  RotateCcw,
  Sparkles,
  Layers,
  Target,
  Crosshair,
} from "lucide-react";

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  email: string;
  telefono: string;
  estado: string;
  fecha_creacion: string;
  fecha_ultima_conexion?: string;
  rol: string;
  tipo_usuario: string;
  rut?: string;
  direccion?: string;
  ciudad?: string;
  especialidad?: string;
  departamento?: string;
  cargo?: string;
  salario?: number;
  fecha_contratacion?: string;
  num_pacientes_atendidos?: number;
  calificacion_promedio?: number;
  certificaciones?: string[];
  permisos?: string[];
  foto_perfil?: string;
}

interface Estadisticas {
  total: number;
  activos: number;
  inactivos: number;
  bloqueados: number;
  medicos: number;
  administrativos: number;
  secretarias: number;
  otros: number;
  nuevos_mes: number;
  conexiones_hoy: number;
}

interface FiltrosAvanzados {
  busqueda: string;
  estado: string;
  tipo: string;
  departamento: string;
  especialidad: string;
  fechaDesde: string;
  fechaHasta: string;
  ordenarPor: string;
  ordenDireccion: "asc" | "desc";
  soloActivos: boolean;
  soloConectadosHoy: boolean;
}

type VistaDisplay = "tabla" | "tarjetas";

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function UsuariosCentroPremiumPage() {
  const params = useParams();
  const router = useRouter();

  // Estados principales
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vistaActual, setVistaActual] = useState<VistaDisplay>("tabla");

  // Estados de filtros avanzados
  const [filtros, setFiltros] = useState<FiltrosAvanzados>({
    busqueda: "",
    estado: "todos",
    tipo: "todos",
    departamento: "todos",
    especialidad: "todos",
    fechaDesde: "",
    fechaHasta: "",
    ordenarPor: "fecha_creacion",
    ordenDireccion: "desc",
    soloActivos: false,
    soloConectadosHoy: false,
  });

  // Estados para modales
  const [modalVerUsuario, setModalVerUsuario] = useState<Usuario | null>(null);
  const [modalEditarUsuario, setModalEditarUsuario] = useState<Usuario | null>(null);
  const [modalEliminar, setModalEliminar] = useState<Usuario | null>(null);
  const [modalPermisos, setModalPermisos] = useState<Usuario | null>(null);
  const [modalEnviarMensaje, setModalEnviarMensaje] = useState<Usuario | null>(null);
  const [modalHistorial, setModalHistorial] = useState<Usuario | null>(null);
  const [modalFiltrosAvanzados, setModalFiltrosAvanzados] = useState(false);
  const [modalEstadisticas, setModalEstadisticas] = useState(false);
  const [modalExportar, setModalExportar] = useState(false);

  // Estados de acciones
  const [procesando, setProcesando] = useState(false);
  const [usuariosSeleccionados, setUsuariosSeleccionados] = useState<number[]>([]);
  const [mostrarAccionesMasivas, setMostrarAccionesMasivas] = useState(false);

  // Estados de UI
  const [notificacion, setNotificacion] = useState<{
    tipo: "success" | "error" | "info" | "warning";
    mensaje: string;
  } | null>(null);
  const [expandirFiltros, setExpandirFiltros] = useState(false);

  // ============================================================================
  // FUNCIONES DE CARGA DE DATOS
  // ============================================================================

  const cargarUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/centros/${params.id}/usuarios`);
      const data = await response.json();

      if (data.success) {
        setUsuarios(data.data);
        mostrarNotificacion("success", "Usuarios cargados exitosamente");
      } else {
        setError(data.error);
        mostrarNotificacion("error", data.error);
      }
    } catch (err: any) {
      setError(err.message);
      mostrarNotificacion("error", `Error al cargar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  // ============================================================================
  // CALCULAR ESTADÍSTICAS
  // ============================================================================

  const estadisticas = useMemo<Estadisticas>(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    return {
      total: usuarios.length,
      activos: usuarios.filter((u) => u.estado === "activo").length,
      inactivos: usuarios.filter((u) => u.estado === "inactivo").length,
      bloqueados: usuarios.filter((u) => u.estado === "bloqueado").length,
      medicos: usuarios.filter((u) => u.tipo_usuario === "medico").length,
      administrativos: usuarios.filter((u) => u.tipo_usuario === "administrativo").length,
      secretarias: usuarios.filter((u) => u.tipo_usuario === "secretaria").length,
      otros: usuarios.filter((u) => u.tipo_usuario === "otro").length,
      nuevos_mes: usuarios.filter(
        (u) => new Date(u.fecha_creacion) >= primerDiaMes
      ).length,
      conexiones_hoy: usuarios.filter(
        (u) =>
          u.fecha_ultima_conexion &&
          new Date(u.fecha_ultima_conexion) >= hoy
      ).length,
    };
  }, [usuarios]);

  // ============================================================================
  // FILTRADO Y ORDENAMIENTO AVANZADO
  // ============================================================================

  const usuariosFiltrados = useMemo(() => {
    let resultado = [...usuarios];

    // Filtro de búsqueda
    if (filtros.busqueda) {
      const busquedaLower = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(
        (u) =>
          u.nombre.toLowerCase().includes(busquedaLower) ||
          u.apellido_paterno.toLowerCase().includes(busquedaLower) ||
          u.apellido_materno.toLowerCase().includes(busquedaLower) ||
          u.email.toLowerCase().includes(busquedaLower) ||
          (u.rut && u.rut.toLowerCase().includes(busquedaLower)) ||
          (u.telefono && u.telefono.includes(filtros.busqueda))
      );
    }

    // Filtro de estado
    if (filtros.estado !== "todos") {
      resultado = resultado.filter((u) => u.estado === filtros.estado);
    }

    // Filtro de tipo
    if (filtros.tipo !== "todos") {
      resultado = resultado.filter((u) => u.tipo_usuario === filtros.tipo);
    }

    // Filtro de departamento
    if (filtros.departamento !== "todos") {
      resultado = resultado.filter(
        (u) => u.departamento === filtros.departamento
      );
    }

    // Filtro de especialidad
    if (filtros.especialidad !== "todos") {
      resultado = resultado.filter(
        (u) => u.especialidad === filtros.especialidad
      );
    }

    // Filtro de fecha desde
    if (filtros.fechaDesde) {
      const fechaDesde = new Date(filtros.fechaDesde);
      resultado = resultado.filter(
        (u) => new Date(u.fecha_creacion) >= fechaDesde
      );
    }

    // Filtro de fecha hasta
    if (filtros.fechaHasta) {
      const fechaHasta = new Date(filtros.fechaHasta);
      resultado = resultado.filter(
        (u) => new Date(u.fecha_creacion) <= fechaHasta
      );
    }

    // Filtro solo activos
    if (filtros.soloActivos) {
      resultado = resultado.filter((u) => u.estado === "activo");
    }

    // Filtro solo conectados hoy
    if (filtros.soloConectadosHoy) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      resultado = resultado.filter(
        (u) =>
          u.fecha_ultima_conexion &&
          new Date(u.fecha_ultima_conexion) >= hoy
      );
    }

    // Ordenamiento
    resultado.sort((a, b) => {
      let valorA: any = a[filtros.ordenarPor as keyof Usuario];
      let valorB: any = b[filtros.ordenarPor as keyof Usuario];

      // Manejo especial para fechas
      if (filtros.ordenarPor.includes("fecha")) {
        valorA = new Date(valorA || 0).getTime();
        valorB = new Date(valorB || 0).getTime();
      }

      // Manejo especial para strings
      if (typeof valorA === "string") {
        valorA = valorA.toLowerCase();
        valorB = valorB.toLowerCase();
      }

      if (filtros.ordenDireccion === "asc") {
        return valorA > valorB ? 1 : valorA < valorB ? -1 : 0;
      } else {
        return valorA < valorB ? 1 : valorA > valorB ? -1 : 0;
      }
    });

    return resultado;
  }, [usuarios, filtros]);

  // ============================================================================
  // FUNCIONES DE UTILIDAD
  // ============================================================================

  const mostrarNotificacion = (
    tipo: "success" | "error" | "info" | "warning",
    mensaje: string
  ) => {
    setNotificacion({ tipo, mensaje });
    setTimeout(() => setNotificacion(null), 5000);
  };

  const toggleSeleccionUsuario = (id: number) => {
    setUsuariosSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const seleccionarTodos = () => {
    if (usuariosSeleccionados.length === usuariosFiltrados.length) {
      setUsuariosSeleccionados([]);
    } else {
      setUsuariosSeleccionados(usuariosFiltrados.map((u) => u.id_usuario));
    }
  };

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: "",
      estado: "todos",
      tipo: "todos",
      departamento: "todos",
      especialidad: "todos",
      fechaDesde: "",
      fechaHasta: "",
      ordenarPor: "fecha_creacion",
      ordenDireccion: "desc",
      soloActivos: false,
      soloConectadosHoy: false,
    });
    mostrarNotificacion("info", "Filtros limpiados");
  };

  // ============================================================================
  // FUNCIONES DE ACCIONES
  // ============================================================================

  const handleVerUsuario = (usuario: Usuario) => {
    setModalVerUsuario(usuario);
  };

  const handleEditarUsuario = (usuario: Usuario) => {
    router.push(`/admin/usuarios/${usuario.id_usuario}/editar`);
  };

  const handleAbrirModalEliminar = (usuario: Usuario) => {
    setModalEliminar(usuario);
  };

  const handleEliminarUsuario = async () => {
    if (!modalEliminar) return;

    try {
      setProcesando(true);
      const response = await fetch(
        `/api/admin/usuarios/${modalEliminar.id_usuario}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        await cargarUsuarios();
        setModalEliminar(null);
        mostrarNotificacion("success", "Usuario eliminado exitosamente");
      } else {
        mostrarNotificacion("error", `Error: ${data.error}`);
      }
    } catch (err: any) {
      mostrarNotificacion("error", `Error al eliminar: ${err.message}`);
    } finally {
      setProcesando(false);
    }
  };

  const handleCambiarEstado = async (
    usuario: Usuario,
    nuevoEstado: string
  ) => {
    try {
      setProcesando(true);
      const response = await fetch(
        `/api/admin/usuarios/${usuario.id_usuario}/estado`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado: nuevoEstado }),
        }
      );

      const data = await response.json();

      if (data.success) {
        await cargarUsuarios();
        mostrarNotificacion(
          "success",
          `Estado cambiado a ${nuevoEstado} exitosamente`
        );
      } else {
        mostrarNotificacion("error", `Error: ${data.error}`);
      }
    } catch (err: any) {
      mostrarNotificacion("error", `Error al cambiar estado: ${err.message}`);
    } finally {
      setProcesando(false);
    }
  };

  const handleAccionesMasivas = async (accion: string) => {
    if (usuariosSeleccionados.length === 0) {
      mostrarNotificacion("warning", "No hay usuarios seleccionados");
      return;
    }

    const confirmacion = confirm(
      `¿Estás seguro de ${accion} ${usuariosSeleccionados.length} usuario(s)?`
    );
    if (!confirmacion) return;

    try {
      setProcesando(true);
      const response = await fetch(`/api/admin/usuarios/acciones-masivas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion,
          usuarios: usuariosSeleccionados,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await cargarUsuarios();
        setUsuariosSeleccionados([]);
        mostrarNotificacion("success", `Acción ${accion} aplicada exitosamente`);
      } else {
        mostrarNotificacion("error", `Error: ${data.error}`);
      }
    } catch (err: any) {
      mostrarNotificacion("error", `Error en acción masiva: ${err.message}`);
    } finally {
      setProcesando(false);
    }
  };

  const handleNuevoUsuario = () => {
    router.push(`/admin/centros/${params.id}/usuarios/nuevo`);
  };

  // ============================================================================
  // FUNCIONES DE EXPORTACIÓN
  // ============================================================================

  const exportarCSV = () => {
    try {
      const headers = [
        "ID",
        "RUT",
        "Nombre Completo",
        "Email",
        "Teléfono",
        "Rol",
        "Tipo",
        "Estado",
        "Departamento",
        "Especialidad",
        "Cargo",
        "Fecha Creación",
        "Última Conexión",
      ];

      const rows = usuariosFiltrados.map((u) => [
        u.id_usuario,
        u.rut || "",
        `${u.nombre} ${u.apellido_paterno} ${u.apellido_materno}`,
        u.email,
        u.telefono || "",
        u.rol || "",
        u.tipo_usuario,
        u.estado,
        u.departamento || "",
        u.especialidad || "",
        u.cargo || "",
        new Date(u.fecha_creacion).toLocaleDateString("es-CL"),
        u.fecha_ultima_conexion
          ? new Date(u.fecha_ultima_conexion).toLocaleDateString("es-CL")
          : "Nunca",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

      const blob = new Blob(["\ufeff" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `usuarios_centro_${params.id}_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      mostrarNotificacion("success", "Archivo CSV descargado exitosamente");
    } catch (err: any) {
      mostrarNotificacion("error", `Error al exportar: ${err.message}`);
    }
  };

  const exportarExcel = () => {
    try {
      // Crear estructura HTML para Excel
      let excelContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head>
          <meta charset="utf-8">
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            th { background-color: #4F46E5; color: white; font-weight: bold; }
            .activo { background-color: #D1FAE5; }
            .inactivo { background-color: #FEE2E2; }
            .bloqueado { background-color: #FECACA; }
          </style>
        </head>
        <body>
          <h1>Listado de Usuarios - Centro ${params.id}</h1>
          <p>Fecha de exportación: ${new Date().toLocaleString("es-CL")}</p>
          <p>Total de registros: ${usuariosFiltrados.length}</p>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>RUT</th>
                <th>Nombre Completo</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Rol</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Departamento</th>
                <th>Especialidad</th>
                <th>Fecha Creación</th>
              </tr>
            </thead>
            <tbody>
      `;

      usuariosFiltrados.forEach((u) => {
        excelContent += `
          <tr class="${u.estado}">
            <td>${u.id_usuario}</td>
            <td>${u.rut || ""}</td>
            <td>${u.nombre} ${u.apellido_paterno} ${u.apellido_materno}</td>
            <td>${u.email}</td>
            <td>${u.telefono || ""}</td>
            <td>${u.rol || ""}</td>
            <td>${u.tipo_usuario}</td>
            <td>${u.estado}</td>
            <td>${u.departamento || ""}</td>
            <td>${u.especialidad || ""}</td>
            <td>${new Date(u.fecha_creacion).toLocaleDateString("es-CL")}</td>
          </tr>
        `;
      });

      excelContent += `
            </tbody>
          </table>
        </body>
        </html>
      `;

      const blob = new Blob([excelContent], {
        type: "application/vnd.ms-excel",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `usuarios_centro_${params.id}_${new Date().toISOString().split("T")[0]}.xls`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      mostrarNotificacion("success", "Archivo Excel descargado exitosamente");
    } catch (err: any) {
      mostrarNotificacion("error", `Error al exportar Excel: ${err.message}`);
    }
  };

  const imprimirReporte = () => {
    const ventanaImpresion = window.open("", "_blank");
    if (!ventanaImpresion) return;

    const contenidoHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte de Usuarios - Centro ${params.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #1F2937; border-bottom: 3px solid #4F46E5; padding-bottom: 10px; }
          .info { background: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #D1D5DB; padding: 12px; text-align: left; }
          th { background: #4F46E5; color: white; font-weight: bold; }
          tr:nth-child(even) { background: #F9FAFB; }
          .estadisticas { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
          .stat-box { background: #EEF2FF; padding: 15px; border-radius: 8px; text-align: center; }
          .stat-value { font-size: 24px; font-weight: bold; color: #4F46E5; }
          .stat-label { font-size: 12px; color: #6B7280; margin-top: 5px; }
          .activo { color: #059669; font-weight: bold; }
          .inactivo { color: #DC2626; font-weight: bold; }
          .bloqueado { color: #B91C1C; font-weight: bold; }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>📊 Reporte de Usuarios - Centro Médico ${params.id}</h1>
        
        <div class="info">
          <p><strong>Fecha de generación:</strong> ${new Date().toLocaleString("es-CL")}</p>
          <p><strong>Total de usuarios:</strong> ${usuariosFiltrados.length}</p>
          <p><strong>Filtros aplicados:</strong> ${
            filtros.estado !== "todos" || filtros.tipo !== "todos"
              ? "Sí"
              : "No"
          }</p>
        </div>

        <div class="estadisticas">
          <div class="stat-box">
            <div class="stat-value">${estadisticas.activos}</div>
            <div class="stat-label">Usuarios Activos</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${estadisticas.medicos}</div>
            <div class="stat-label">Médicos</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${estadisticas.administrativos}</div>
            <div class="stat-label">Administrativos</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${estadisticas.nuevos_mes}</div>
            <div class="stat-label">Nuevos este mes</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre Completo</th>
              <th>Email</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Fecha Registro</th>
            </tr>
          </thead>
          <tbody>
            ${usuariosFiltrados
              .map(
                (u) => `
              <tr>
                <td>${u.id_usuario}</td>
                <td>${u.nombre} ${u.apellido_paterno} ${u.apellido_materno}</td>
                <td>${u.email}</td>
                <td>${u.tipo_usuario}</td>
                <td class="${u.estado}">${u.estado.toUpperCase()}</td>
                <td>${new Date(u.fecha_creacion).toLocaleDateString("es-CL")}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <div class="no-print" style="margin-top: 30px; text-align: center;">
          <button onclick="window.print()" style="background: #4F46E5; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
            🖨️ Imprimir Reporte
          </button>
          <button onclick="window.close()" style="background: #6B7280; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; margin-left: 10px;">
            ❌ Cerrar
          </button>
        </div>
      </body>
      </html>
    `;

    ventanaImpresion.document.write(contenidoHTML);
    ventanaImpresion.document.close();

    mostrarNotificacion("success", "Ventana de impresión abierta");
  };

  // ============================================================================
  // COMPONENTES DE UI
  // ============================================================================

  const EstadoBadge = ({ estado }: { estado: string }) => {
    const estilos = {
      activo:
        "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300 shadow-lg shadow-green-200/50",
      inactivo:
        "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-300 shadow-lg shadow-gray-200/50",
      bloqueado:
        "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-300 shadow-lg shadow-red-200/50",
    };

    const iconos = {
      activo: <CheckCircle className="w-4 h-4" />,
      inactivo: <AlertCircle className="w-4 h-4" />,
      bloqueado: <XCircle className="w-4 h-4" />,
    };

    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-full border-2 transition-all duration-300 hover:scale-105 ${
          estilos[estado as keyof typeof estilos]
        }`}
      >
        {iconos[estado as keyof typeof iconos]}
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </span>
    );
  };

  const TipoUsuarioBadge = ({ tipo }: { tipo: string }) => {
    const estilos = {
      medico:
        "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-300 shadow-lg shadow-blue-200/50",
      administrativo:
        "bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-300 shadow-lg shadow-purple-200/50",
      secretaria:
        "bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 border-pink-300 shadow-lg shadow-pink-200/50",
      otro: "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-300 shadow-lg shadow-gray-200/50",
    };

    return (
      <span
        className={`inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-full border-2 transition-all duration-300 hover:scale-105 ${
          estilos[tipo as keyof typeof estilos]
        }`}
      >
        {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
      </span>
    );
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center relative overflow-hidden">
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-30px) rotate(5deg); }
          }
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(79, 70, 229, 0.5); }
            50% { box-shadow: 0 0 40px rgba(79, 70, 229, 0.8); }
          }
          .animate-float { animation: float 4s ease-in-out infinite; }
          .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        `}</style>

        {/* Efectos de fondo animados */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-96 h-96 bg-blue-400/20 rounded-full blur-3xl top-0 left-0 animate-float"></div>
          <div
            className="absolute w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl bottom-0 right-0 animate-float"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute w-96 h-96 bg-purple-400/20 rounded-full blur-3xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-float"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="relative z-10 text-center">
          {/* Logo animado */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center animate-pulse-glow transform rotate-12">
                <Users className="w-12 h-12 text-white" />
              </div>
              <div className="absolute inset-0 w-24 h-24 border-4 border-blue-300 rounded-2xl animate-ping"></div>
            </div>
          </div>

          {/* Spinner premium */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <RefreshCw className="w-16 h-16 animate-spin text-blue-600" />
              <div className="absolute inset-0 w-16 h-16 border-4 border-blue-200 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-3 animate-pulse">
            Cargando Sistema de Usuarios
          </h2>
          <p className="text-lg text-gray-600 mb-4 font-semibold">
            Obteniendo información del centro médico...
          </p>

          {/* Barra de progreso animada */}
          <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full animate-pulse"></div>
          </div>

          {/* Indicadores de carga */}
          <div className="mt-8 flex justify-center gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER PRINCIPAL
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 relative overflow-hidden">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes slide-in {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-shimmer { animation: shimmer 2s ease-in-out infinite; }
        .animate-slide-in { animation: slide-in 0.5s ease-out; }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        .animate-gradient { 
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }
        .glassmorphism {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 2px solid rgba(255, 255, 255, 0.6);
        }
        .glassmorphism-dark {
          background: rgba(0, 0, 0, 0.05);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
      `}</style>

      {/* Efectos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] bg-blue-300/20 rounded-full blur-3xl top-0 left-0 animate-float"></div>
        <div
          className="absolute w-[500px] h-[500px] bg-indigo-300/20 rounded-full blur-3xl bottom-0 right-0 animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute w-[500px] h-[500px] bg-purple-300/20 rounded-full blur-3xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="max-w-[1800px] mx-auto relative z-10">
        {/* ====================================================================== */}
        {/* HEADER PREMIUM */}
        {/* ====================================================================== */}
        <div className="mb-8 animate-fade-in">
          <Link
            href={`/admin/centros/${params.id}`}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-bold transition-all duration-300 hover:translate-x-2 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="border-b-2 border-transparent group-hover:border-blue-600">
              Volver al Centro
            </span>
          </Link>

          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl shadow-2xl shadow-blue-500/50 animate-gradient">
                <Users className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-black text-gray-900 mb-2 flex items-center gap-3">
                  Gestión de Usuarios
                  <span className="text-2xl px-4 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-600 rounded-full font-bold border-2 border-blue-200">
                    {estadisticas.total}
                  </span>
                </h1>
                <p className="text-gray-600 font-bold text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  {usuariosFiltrados.length} de {usuarios.length} usuarios •
                  Centro #{params.id}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={cargarUsuarios}
                disabled={loading}
                className="px-6 py-3 glassmorphism rounded-xl hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 font-bold group"
              >
                <RefreshCw
                  className={`w-5 h-5 group-hover:rotate-180 transition-transform duration-500 ${
                    loading ? "animate-spin" : ""
                  }`}
                />
                Actualizar
              </button>

              <button
                onClick={() => setModalFiltrosAvanzados(true)}
                className="px-6 py-3 glassmorphism rounded-xl hover:shadow-xl flex items-center gap-2 transition-all duration-300 hover:scale-105 font-bold"
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filtros Avanzados
              </button>

              <button
                onClick={() => setModalExportar(true)}
                disabled={usuariosFiltrados.length === 0}
                className="px-6 py-3 glassmorphism rounded-xl hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 font-bold"
              >
                <Download className="w-5 h-5" />
                Exportar
              </button>

              <button
                onClick={() => setModalEstadisticas(true)}
                className="px-6 py-3 glassmorphism rounded-xl hover:shadow-xl flex items-center gap-2 transition-all duration-300 hover:scale-105 font-bold"
              >
                <BarChart3 className="w-5 h-5" />
                Estadísticas
              </button>

              <button
                onClick={handleNuevoUsuario}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-2xl flex items-center gap-2 transition-all duration-300 hover:scale-105 font-bold border-2 border-blue-400/50 animate-gradient"
              >
                <UserPlus className="w-5 h-5" />
                Nuevo Usuario
              </button>
            </div>
          </div>
        </div>

        {/* ====================================================================== */}
        {/* NOTIFICACIONES */}
        {/* ====================================================================== */}
        {notificacion && (
          <div
            className={`mb-6 p-5 rounded-xl shadow-xl animate-slide-in flex items-center gap-3 font-bold ${
              notificacion.tipo === "success"
                ? "bg-green-100 border-2 border-green-300 text-green-800"
                : notificacion.tipo === "error"
                ? "bg-red-100 border-2 border-red-300 text-red-800"
                : notificacion.tipo === "warning"
                ? "bg-yellow-100 border-2 border-yellow-300 text-yellow-800"
                : "bg-blue-100 border-2 border-blue-300 text-blue-800"
            }`}
          >
            {notificacion.tipo === "success" && (
              <CheckCircle className="w-6 h-6" />
            )}
            {notificacion.tipo === "error" && <XCircle className="w-6 h-6" />}
            {notificacion.tipo === "warning" && (
              <AlertTriangle className="w-6 h-6" />
            )}
            {notificacion.tipo === "info" && <Info className="w-6 h-6" />}
            <span className="flex-1">{notificacion.mensaje}</span>
            <button
              onClick={() => setNotificacion(null)}
              className="p-1 hover:bg-white/50 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* ====================================================================== */}
        {/* ESTADÍSTICAS RÁPIDAS PREMIUM */}
        {/* ====================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8 animate-fade-in">
          {/* Total Usuarios */}
          <div className="glassmorphism p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm text-gray-600 font-bold mb-1">
              Total Usuarios
            </p>
            <p className="text-4xl font-black text-gray-900">
              {estadisticas.total}
            </p>
            <p className="text-xs text-gray-500 font-semibold mt-2">
              100% del sistema
            </p>
          </div>

          {/* Usuarios Activos */}
          <div className="glassmorphism p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-200 rounded-xl">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <Activity className="w-5 h-5 text-green-500 animate-pulse" />
            </div>
            <p className="text-sm text-gray-600 font-bold mb-1">Activos</p>
            <p className="text-4xl font-black text-green-600">
              {estadisticas.activos}
            </p>
            <p className="text-xs text-gray-500 font-semibold mt-2">
              {((estadisticas.activos / estadisticas.total) * 100).toFixed(1)}%
              del total
            </p>
          </div>

          {/* Médicos */}
          <div className="glassmorphism p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-200 rounded-xl">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <Award className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-sm text-gray-600 font-bold mb-1">Médicos</p>
            <p className="text-4xl font-black text-blue-600">
              {estadisticas.medicos}
            </p>
            <p className="text-xs text-gray-500 font-semibold mt-2">
              Personal clínico
            </p>
          </div>

          {/* Administrativos */}
          <div className="glassmorphism p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-violet-200 rounded-xl">
                <Briefcase className="w-8 h-8 text-purple-600" />
              </div>
              <Settings className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-sm text-gray-600 font-bold mb-1">
              Administrativos
            </p>
            <p className="text-4xl font-black text-purple-600">
              {estadisticas.administrativos}
            </p>
            <p className="text-xs text-gray-500 font-semibold mt-2">
              Personal de gestión
            </p>
          </div>

          {/* Nuevos Este Mes */}
          <div className="glassmorphism p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-yellow-100 to-amber-200 rounded-xl">
                <Sparkles className="w-8 h-8 text-yellow-600" />
              </div>
              <Calendar className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-sm text-gray-600 font-bold mb-1">Nuevos/Mes</p>
            <p className="text-4xl font-black text-yellow-600">
              {estadisticas.nuevos_mes}
            </p>
            <p className="text-xs text-gray-500 font-semibold mt-2">
              Últimos 30 días
            </p>
          </div>

          {/* Conectados Hoy */}
          <div className="glassmorphism p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-200 rounded-xl">
                <Zap className="w-8 h-8 text-indigo-600" />
              </div>
              <Activity className="w-5 h-5 text-indigo-500 animate-pulse" />
            </div>
            <p className="text-sm text-gray-600 font-bold mb-1">Conectados</p>
            <p className="text-4xl font-black text-indigo-600">
              {estadisticas.conexiones_hoy}
            </p>
            <p className="text-xs text-gray-500 font-semibold mt-2">
              Activos hoy
            </p>
          </div>
        </div>

        {/* ====================================================================== */}
        {/* BARRA DE BÚSQUEDA Y FILTROS */}
        {/* ====================================================================== */}
        <div className="glassmorphism p-6 rounded-2xl shadow-xl mb-6 animate-fade-in">
          <div className="flex flex-col gap-4">
            {/* Primera fila: Búsqueda y acciones principales */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Búsqueda */}
              <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, apellido, RUT, email, teléfono..."
                  value={filtros.busqueda}
                  onChange={(e) =>
                    setFiltros({ ...filtros, busqueda: e.target.value })
                  }
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 font-semibold text-gray-900 placeholder-gray-400"
                />
                {filtros.busqueda && (
                  <button
                    onClick={() => setFiltros({ ...filtros, busqueda: "" })}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Selectores rápidos */}
              <div className="flex gap-3 flex-wrap">
                <select
                  value={filtros.estado}
                  onChange={(e) =>
                    setFiltros({ ...filtros, estado: e.target.value })
                  }
                  className="px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 font-bold bg-white hover:bg-gray-50"
                >
                  <option value="todos">📋 Todos los estados</option>
                  <option value="activo">✅ Activos</option>
                  <option value="inactivo">⚠️ Inactivos</option>
                  <option value="bloqueado">🚫 Bloqueados</option>
                </select>

                <select
                  value={filtros.tipo}
                  onChange={(e) =>
                    setFiltros({ ...filtros, tipo: e.target.value })
                  }
                  className="px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 font-bold bg-white hover:bg-gray-50"
                >
                  <option value="todos">👥 Todos los tipos</option>
                  <option value="medico">⚕️ Médicos</option>
                  <option value="administrativo">💼 Administrativos</option>
                  <option value="secretaria">📝 Secretarias</option>
                  <option value="otro">🔧 Otros</option>
                </select>

                <button
                  onClick={() => setExpandirFiltros(!expandirFiltros)}
                  className="px-5 py-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-300 font-bold flex items-center gap-2"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                  {expandirFiltros ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {(filtros.busqueda ||
                  filtros.estado !== "todos" ||
                  filtros.tipo !== "todos" ||
                  filtros.departamento !== "todos" ||
                  filtros.especialidad !== "todos" ||
                  filtros.fechaDesde ||
                  filtros.fechaHasta ||
                  filtros.soloActivos ||
                  filtros.soloConectadosHoy) && (
                  <button
                    onClick={limpiarFiltros}
                    className="px-5 py-4 bg-red-100 text-red-700 border-2 border-red-300 rounded-xl hover:bg-red-200 transition-all duration-300 font-bold flex items-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Limpiar
                  </button>
                )}
              </div>
            </div>

            {/* Filtros expandidos */}
            {expandirFiltros && (
              <div className="pt-4 border-t-2 border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    📅 Fecha Desde
                  </label>
                  <input
                    type="date"
                    value={filtros.fechaDesde}
                    onChange={(e) =>
                      setFiltros({ ...filtros, fechaDesde: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    📅 Fecha Hasta
                  </label>
                  <input
                    type="date"
                    value={filtros.fechaHasta}
                    onChange={(e) =>
                      setFiltros({ ...filtros, fechaHasta: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    📊 Ordenar Por
                  </label>
                  <select
                    value={filtros.ordenarPor}
                    onChange={(e) =>
                      setFiltros({ ...filtros, ordenarPor: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all font-bold"
                  >
                    <option value="fecha_creacion">Fecha Creación</option>
                    <option value="nombre">Nombre</option>
                    <option value="email">Email</option>
                    <option value="estado">Estado</option>
                    <option value="tipo_usuario">Tipo Usuario</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    🔄 Dirección
                  </label>
                  <select
                    value={filtros.ordenDireccion}
                    onChange={(e) =>
                      setFiltros({
                        ...filtros,
                        ordenDireccion: e.target.value as "asc" | "desc",
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all font-bold"
                  >
                    <option value="desc">Descendente (Z-A, 9-0)</option>
                    <option value="asc">Ascendente (A-Z, 0-9)</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="soloActivos"
                    checked={filtros.soloActivos}
                    onChange={(e) =>
                      setFiltros({
                        ...filtros,
                        soloActivos: e.target.checked,
                      })
                    }
                    className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-4 focus:ring-blue-200"
                  />
                  <label
                    htmlFor="soloActivos"
                    className="ml-3 text-sm font-bold text-gray-700"
                  >
                    ✅ Solo Activos
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="soloConectadosHoy"
                    checked={filtros.soloConectadosHoy}
                    onChange={(e) =>
                      setFiltros({
                        ...filtros,
                        soloConectadosHoy: e.target.checked,
                      })
                    }
                    className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-4 focus:ring-blue-200"
                  />
                  <label
                    htmlFor="soloConectadosHoy"
                    className="ml-3 text-sm font-bold text-gray-700"
                  >
                    ⚡ Conectados Hoy
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ====================================================================== */}
        {/* BARRA DE ACCIONES Y VISTA */}
        {/* ====================================================================== */}
        <div className="glassmorphism p-4 rounded-2xl shadow-xl mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {/* Selector de vista */}
            <div className="flex items-center gap-2 border-2 border-gray-200 rounded-xl p-1">
              <button
                onClick={() => setVistaActual("tabla")}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 font-bold ${
                  vistaActual === "tabla"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <List className="w-5 h-5" />
                Tabla
              </button>
              <button
                onClick={() => setVistaActual("tarjetas")}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 font-bold ${
                  vistaActual === "tarjetas"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Grid className="w-5 h-5" />
                Tarjetas
              </button>
            </div>

            {/* Contador de selección */}
            {usuariosSeleccionados.length > 0 && (
              <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-xl font-bold border-2 border-blue-300">
                {usuariosSeleccionados.length} seleccionado(s)
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {usuariosSeleccionados.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleAccionesMasivas("activar")
                  }
                  className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-300 font-bold flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Activar
                </button>
                <button
                  onClick={() =>
                    handleAccionesMasivas("desactivar")
                  }
                  className="px-4 py-2 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition-all duration-300 font-bold flex items-center gap-2"
                >
                  <AlertCircle className="w-5 h-5" />
                  Desactivar
                </button>
                <button
                  onClick={() =>
                    handleAccionesMasivas("bloquear")
                  }
                  className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 font-bold flex items-center gap-2"
                >
                  <Lock className="w-5 h-5" />
                  Bloquear
                </button>
                <button
                  onClick={() => setUsuariosSeleccionados([])}
                  className="px-4 py-2 border-2 border-gray-300 rounded-xl hover:bg-gray-100 transition-all duration-300 font-bold"
                >
                  Cancelar
                </button>
              </div>
            )}

            <button
              onClick={seleccionarTodos}
              className="px-4 py-2 border-2 border-gray-300 rounded-xl hover:bg-gray-100 transition-all duration-300 font-bold"
            >
              {usuariosSeleccionados.length === usuariosFiltrados.length
                ? "Deseleccionar Todos"
                : "Seleccionar Todos"}
            </button>
          </div>
        </div>

        {/* ====================================================================== */}
        {/* ERROR STATE */}
        {/* ====================================================================== */}
        {error && (
          <div className="glassmorphism p-6 rounded-2xl mb-6 border-l-4 border-red-500 shadow-xl animate-shimmer">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-xl">
                <XCircle className="w-7 h-7 text-red-600" />
              </div>
              <div>
                <p className="font-black text-xl text-red-800">
                  Error al Cargar Datos
                </p>
                <p className="text-sm text-red-600 font-semibold mt-1">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================== */}
        {/* VISTA DE TABLA */}
        {/* ====================================================================== */}
        {vistaActual === "tabla" && (
          <div className="glassmorphism rounded-2xl overflow-hidden shadow-2xl animate-fade-in">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
                  <tr>
                    <th className="px-6 py-5 text-left">
                      <input
                        type="checkbox"
                        checked={
                          usuariosSeleccionados.length ===
                          usuariosFiltrados.length &&
                          usuariosFiltrados.length > 0
                        }
                        onChange={seleccionarTodos}
                        className="w-5 h-5 rounded border-2 border-white"
                      />
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-black uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-black uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-black uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-black uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-black uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-black uppercase tracking-wider">
                      Fecha Registro
                    </th>
                    <th className="px-6 py-5 text-right text-sm font-black uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/95 backdrop-blur-xl divide-y divide-gray-200">
                  {usuariosFiltrados.map((usuario, index) => (
                    <tr
                      key={usuario.id_usuario}
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="px-6 py-5">
                        <input
                          type="checkbox"
                          checked={usuariosSeleccionados.includes(
                            usuario.id_usuario
                          )}
                          onChange={() =>
                            toggleSeleccionUsuario(usuario.id_usuario)
                          }
                          className="w-5 h-5 rounded border-2 border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-xl">
                              {usuario.nombre.charAt(0)}
                              {usuario.apellido_paterno.charAt(0)}
                            </div>
                            <div
                              className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-white shadow-lg ${
                                usuario.estado === "activo"
                                  ? "bg-green-500"
                                  : usuario.estado === "bloqueado"
                                  ? "bg-red-500"
                                  : "bg-gray-400"
                              }`}
                            ></div>
                          </div>
                          <div>
                            <div className="text-base font-black text-gray-900">
                              {usuario.nombre} {usuario.apellido_paterno}{" "}
                              {usuario.apellido_materno}
                            </div>
                            <div className="text-xs text-gray-500 font-bold flex items-center gap-2 mt-1">
                              <span className="px-2 py-1 bg-gray-100 rounded-md">
                                ID: {usuario.id_usuario}
                              </span>
                              {usuario.rut && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md">
                                  RUT: {usuario.rut}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex flex-col gap-2">
                          <div className="text-sm text-gray-900 flex items-center gap-2 font-bold">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {usuario.email}
                          </div>
                          {usuario.telefono && (
                            <div className="text-xs text-gray-600 flex items-center gap-2 font-bold">
                              <Phone className="w-4 h-4 text-gray-400" />
                              {usuario.telefono}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-bold">
                          {usuario.rol || "Sin rol"}
                        </div>
                        {usuario.especialidad && (
                          <div className="text-xs text-gray-500 font-semibold mt-1">
                            {usuario.especialidad}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <TipoUsuarioBadge tipo={usuario.tipo_usuario} />
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <EstadoBadge estado={usuario.estado} />
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-bold flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(usuario.fecha_creacion).toLocaleDateString(
                            "es-CL"
                          )}
                        </div>
                        {usuario.fecha_ultima_conexion && (
                          <div className="text-xs text-gray-500 font-semibold mt-1 flex items-center gap-2">
                            <Clock className="w-3 h-3 text-gray-400" />
                            Últ. conexión:{" "}
                            {new Date(
                              usuario.fecha_ultima_conexion
                            ).toLocaleDateString("es-CL")}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleVerUsuario(usuario)}
                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition-all duration-300 hover:scale-110 font-bold"
                            title="Ver detalles"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEditarUsuario(usuario)}
                            className="p-2 text-green-600 hover:text-green-900 hover:bg-green-100 rounded-lg transition-all duration-300 hover:scale-110 font-bold"
                            title="Editar"
                          >
                            <Edit className="w-5 h-5" />
                          </button>

                          {usuario.estado === "activo" ? (
                            <button
                              onClick={() =>
                                handleCambiarEstado(usuario, "inactivo")
                              }
                              className="p-2 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-100 rounded-lg transition-all duration-300 hover:scale-110 font-bold"
                              title="Desactivar"
                            >
                              <Lock className="w-5 h-5" />
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                handleCambiarEstado(usuario, "activo")
                              }
                              className="p-2 text-green-600 hover:text-green-900 hover:bg-green-100 rounded-lg transition-all duration-300 hover:scale-110 font-bold"
                              title="Activar"
                            >
                              <Unlock className="w-5 h-5" />
                            </button>
                          )}

                          <button
                            onClick={() => handleAbrirModalEliminar(usuario)}
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-lg transition-all duration-300 hover:scale-110 font-bold"
                            title="Eliminar"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {usuariosFiltrados.length === 0 && (
                <div className="text-center py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <div className="mb-6">
                    <Users className="w-24 h-24 text-gray-300 mx-auto" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-3">
                    No se encontraron usuarios
                  </h3>
                  <p className="text-gray-600 font-bold mb-6">
                    Intenta ajustar los filtros de búsqueda o crear un nuevo
                    usuario
                  </p>
                  <button
                    onClick={handleNuevoUsuario}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 font-bold inline-flex items-center gap-2"
                  >
                    <UserPlus className="w-5 h-5" />
                    Crear Nuevo Usuario
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ====================================================================== */}
        {/* VISTA DE TARJETAS */}
        {/* ====================================================================== */}
        {vistaActual === "tarjetas" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {usuariosFiltrados.map((usuario, index) => (
              <div
                key={usuario.id_usuario}
                className="glassmorphism p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 border-l-4 border-blue-500 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Header con checkbox */}
                <div className="flex items-start justify-between mb-4">
                  <input
                    type="checkbox"
                    checked={usuariosSeleccionados.includes(
                      usuario.id_usuario
                    )}
                    onChange={() =>
                      toggleSeleccionUsuario(usuario.id_usuario)
                    }
                    className="w-5 h-5 rounded border-2 border-gray-300"
                  />
                  <EstadoBadge estado={usuario.estado} />
                </div>

                {/* Avatar y nombre */}
                <div className="text-center mb-4">
                  <div className="relative inline-block mb-3">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-xl mx-auto">
                      {usuario.nombre.charAt(0)}
                      {usuario.apellido_paterno.charAt(0)}
                    </div>
                    <div
                      className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-3 border-white shadow-lg ${
                        usuario.estado === "activo"
                          ? "bg-green-500"
                          : usuario.estado === "bloqueado"
                          ? "bg-red-500"
                          : "bg-gray-400"
                      }`}
                    ></div>
                  </div>
                  <h3 className="text-lg font-black text-gray-900 mb-1">
                    {usuario.nombre} {usuario.apellido_paterno}
                  </h3>
                  <p className="text-sm text-gray-600 font-bold">
                    {usuario.apellido_materno}
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="px-2 py-1 bg-gray-100 rounded-md text-xs font-bold text-gray-700">
                      ID: {usuario.id_usuario}
                    </span>
                    {usuario.rut && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-bold">
                        {usuario.rut}
                      </span>
                    )}
                  </div>
                </div>

                {/* Tipo de usuario */}
                <div className="flex justify-center mb-4">
                  <TipoUsuarioBadge tipo={usuario.tipo_usuario} />
                </div>

                {/* Información de contacto */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 font-bold truncate">
                      {usuario.email}
                    </span>
                  </div>
                  {usuario.telefono && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 font-bold">
                        {usuario.telefono}
                      </span>
                    </div>
                  )}
                  {usuario.rol && (
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 font-bold">
                        {usuario.rol}
                      </span>
                    </div>
                  )}
                </div>

                {/* Fecha de registro */}
                <div className="text-xs text-gray-500 font-semibold mb-4 flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Registro:{" "}
                  {new Date(usuario.fecha_creacion).toLocaleDateString(
                    "es-CL"
                  )}
                </div>

                {/* Acciones */}
                <div className="flex items-center justify-center gap-2 pt-4 border-t-2 border-gray-200">
                  <button
                    onClick={() => handleVerUsuario(usuario)}
                    className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition-all duration-300 hover:scale-110"
                    title="Ver detalles"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleEditarUsuario(usuario)}
                    className="p-2 text-green-600 hover:text-green-900 hover:bg-green-100 rounded-lg transition-all duration-300 hover:scale-110"
                    title="Editar"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  {usuario.estado === "activo" ? (
                    <button
                      onClick={() =>
                        handleCambiarEstado(usuario, "inactivo")
                      }
                      className="p-2 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-100 rounded-lg transition-all duration-300 hover:scale-110"
                      title="Desactivar"
                    >
                      <Lock className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        handleCambiarEstado(usuario, "activo")
                      }
                      className="p-2 text-green-600 hover:text-green-900 hover:bg-green-100 rounded-lg transition-all duration-300 hover:scale-110"
                      title="Activar"
                    >
                      <Unlock className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleAbrirModalEliminar(usuario)}
                    className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-lg transition-all duration-300 hover:scale-110"
                    title="Eliminar"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}

            {usuariosFiltrados.length === 0 && (
              <div className="col-span-full text-center py-20 glassmorphism rounded-2xl">
                <div className="mb-6">
                  <Users className="w-24 h-24 text-gray-300 mx-auto" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">
                  No se encontraron usuarios
                </h3>
                <p className="text-gray-600 font-bold mb-6">
                  Intenta ajustar los filtros de búsqueda o crear un nuevo
                  usuario
                </p>
                <button
                  onClick={handleNuevoUsuario}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 font-bold inline-flex items-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  Crear Nuevo Usuario
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ======================================================================== */}
      {/* MODAL VER DETALLES COMPLETO */}
      {/* ======================================================================== */}
      {modalVerUsuario && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glassmorphism rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-gray-200">
                <h2 className="text-4xl font-black text-gray-900 flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                  Detalles del Usuario
                </h2>
                <button
                  onClick={() => setModalVerUsuario(null)}
                  className="text-gray-400 hover:text-gray-600 p-3 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:scale-110"
                >
                  <X className="w-7 h-7" />
                </button>
              </div>

              {/* Perfil del usuario */}
              <div className="flex items-center gap-6 mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
                <div className="relative">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-4xl shadow-2xl">
                    {modalVerUsuario.nombre.charAt(0)}
                    {modalVerUsuario.apellido_paterno.charAt(0)}
                  </div>
                  <div
                    className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-white shadow-lg ${
                      modalVerUsuario.estado === "activo"
                        ? "bg-green-500"
                        : modalVerUsuario.estado === "bloqueado"
                        ? "bg-red-500"
                        : "bg-gray-400"
                    }`}
                  ></div>
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-black text-gray-900 mb-2">
                    {modalVerUsuario.nombre}{" "}
                    {modalVerUsuario.apellido_paterno}{" "}
                    {modalVerUsuario.apellido_materno}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-white rounded-lg text-sm font-bold text-gray-700 shadow">
                      ID: {modalVerUsuario.id_usuario}
                    </span>
                    {modalVerUsuario.rut && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-bold">
                        RUT: {modalVerUsuario.rut}
                      </span>
                    )}
                    <EstadoBadge estado={modalVerUsuario.estado} />
                    <TipoUsuarioBadge tipo={modalVerUsuario.tipo_usuario} />
                  </div>
                </div>
              </div>

              {/* Grid de información */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Email */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border-2 border-blue-200 hover:shadow-lg transition-all">
                  <label className="text-xs font-black text-blue-700 uppercase tracking-wider flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <p className="text-gray-900 font-bold text-lg">
                    {modalVerUsuario.email}
                  </p>
                </div>

                {/* Teléfono */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border-2 border-green-200 hover:shadow-lg transition-all">
                  <label className="text-xs font-black text-green-700 uppercase tracking-wider flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4" />
                    Teléfono
                  </label>
                  <p className="text-gray-900 font-bold text-lg">
                    {modalVerUsuario.telefono || "No especificado"}
                  </p>
                </div>

                {/* Rol */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border-2 border-purple-200 hover:shadow-lg transition-all">
                  <label className="text-xs font-black text-purple-700 uppercase tracking-wider flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4" />
                    Rol
                  </label>
                  <p className="text-gray-900 font-bold text-lg">
                    {modalVerUsuario.rol || "Sin rol"}
                  </p>
                </div>

                {/* Cargo */}
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 rounded-xl border-2 border-indigo-200 hover:shadow-lg transition-all">
                  <label className="text-xs font-black text-indigo-700 uppercase tracking-wider flex items-center gap-2 mb-2">
                    <Briefcase className="w-4 h-4" />
                    Cargo
                  </label>
                  <p className="text-gray-900 font-bold text-lg">
                    {modalVerUsuario.cargo || "No especificado"}
                  </p>
                </div>

                {/* Departamento */}
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-5 rounded-xl border-2 border-pink-200 hover:shadow-lg transition-all">
                  <label className="text-xs font-black text-pink-700 uppercase tracking-wider flex items-center gap-2 mb-2">
                    <Building className="w-4 h-4" />
                    Departamento
                  </label>
                  <p className="text-gray-900 font-bold text-lg">
                    {modalVerUsuario.departamento || "No especificado"}
                  </p>
                </div>

                {/* Especialidad */}
                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-5 rounded-xl border-2 border-cyan-200 hover:shadow-lg transition-all">
                  <label className="text-xs font-black text-cyan-700 uppercase tracking-wider flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4" />
                    Especialidad
                  </label>
                  <p className="text-gray-900 font-bold text-lg">
                    {modalVerUsuario.especialidad || "No especificado"}
                  </p>
                </div>

                {/* Fecha Creación */}
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-5 rounded-xl border-2 border-yellow-200 hover:shadow-lg transition-all">
                  <label className="text-xs font-black text-yellow-700 uppercase tracking-wider flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4" />
                    Fecha de Registro
                  </label>
                  <p className="text-gray-900 font-bold text-lg">
                    {new Date(
                      modalVerUsuario.fecha_creacion
                    ).toLocaleDateString("es-CL", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                {/* Última Conexión */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-xl border-2 border-orange-200 hover:shadow-lg transition-all">
                  <label className="text-xs font-black text-orange-700 uppercase tracking-wider flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4" />
                    Última Conexión
                  </label>
                  <p className="text-gray-900 font-bold text-lg">
                    {modalVerUsuario.fecha_ultima_conexion
                      ? new Date(
                          modalVerUsuario.fecha_ultima_conexion
                        ).toLocaleDateString("es-CL", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Nunca"}
                  </p>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-4 justify-end pt-6 border-t-2 border-gray-200">
                <button
                  onClick={() => setModalVerUsuario(null)}
                  className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105 font-bold"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    setModalVerUsuario(null);
                    handleEditarUsuario(modalVerUsuario);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 font-bold border-2 border-blue-400/50 flex items-center gap-2 animate-gradient"
                >
                  <Edit className="w-5 h-5" />
                  Editar Usuario
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================== */}
      {/* MODAL ELIMINAR */}
      {/* ======================================================================== */}
      {modalEliminar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glassmorphism rounded-3xl max-w-md w-full shadow-2xl">
            <div className="p-8">
              <div className="flex items-center gap-5 mb-6">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center shadow-xl">
                  <AlertTriangle className="w-9 h-9 text-red-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-gray-900">
                    Confirmar Eliminación
                  </h2>
                  <p className="text-gray-600 text-sm font-bold">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>

              <div className="bg-red-50 p-6 rounded-2xl mb-6 border-2 border-red-200">
                <p className="text-sm text-gray-600 mb-4 font-bold">
                  ¿Estás completamente seguro de eliminar al usuario?
                </p>
                <div className="bg-white p-4 rounded-xl">
                  <p className="font-black text-gray-900 text-xl mb-2">
                    {modalEliminar.nombre} {modalEliminar.apellido_paterno}{" "}
                    {modalEliminar.apellido_materno}
                  </p>
                  <p className="text-sm text-gray-600 font-bold flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {modalEliminar.email}
                  </p>
                  <p className="text-xs text-gray-500 font-semibold mt-2">
                    ID: {modalEliminar.id_usuario}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setModalEliminar(null)}
                  disabled={procesando}
                  className="flex-1 px-4 py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all duration-300 hover:scale-105 font-black"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEliminarUsuario}
                  disabled={procesando}
                  className="flex-1 px-4 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:shadow-2xl disabled:opacity-50 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 font-black border-2 border-red-400/50"
                >
                  {procesando ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      Eliminar Definitivamente
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================== */}
      {/* MODAL EXPORTAR */}
      {/* ======================================================================== */}
      {modalExportar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glassmorphism rounded-3xl max-w-md w-full shadow-2xl">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                  <Download className="w-8 h-8 text-blue-600" />
                  Exportar Datos
                </h2>
                <button
                  onClick={() => setModalExportar(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <p className="text-gray-600 font-bold mb-6">
                Selecciona el formato en el que deseas exportar los{" "}
                {usuariosFiltrados.length} usuarios filtrados:
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    exportarCSV();
                    setModalExportar(false);
                  }}
                  className="w-full p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-4 group"
                >
                  <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-all">
                    <FileSpreadsheet className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-black text-gray-900 text-lg">
                      Exportar como CSV
                    </p>
                    <p className="text-sm text-gray-600 font-semibold">
                      Compatible con Excel y hojas de cálculo
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    exportarExcel();
                    setModalExportar(false);
                  }}
                  className="w-full p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-4 group"
                >
                  <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-all">
                    <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-black text-gray-900 text-lg">
                      Exportar como Excel
                    </p>
                    <p className="text-sm text-gray-600 font-semibold">
                      Archivo con formato y estilos
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    imprimirReporte();
                    setModalExportar(false);
                  }}
                  className="w-full p-5 bg-gradient-to-r from-purple-50 to-violet-50 border-2 border-purple-200 rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-4 group"
                >
                  <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-all">
                    <Printer className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-black text-gray-900 text-lg">
                      Imprimir Reporte
                    </p>
                    <p className="text-sm text-gray-600 font-semibold">
                      Genera un reporte imprimible
                    </p>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setModalExportar(false)}
                className="w-full mt-6 px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 font-bold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}