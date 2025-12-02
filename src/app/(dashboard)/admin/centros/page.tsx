"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Power,
  Ban,
  CheckCircle,
  Users,
  Stethoscope,
  UserCheck,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  TrendingUp,
  AlertCircle,
  Sparkles,
  LayoutGrid,
  List,
  ArrowLeft,
  ChevronLeft,
  Star,
  Award,
  Zap,
  Activity,
  Shield,
  Heart,
  Crown,
  Flag,
  Clock,
  Briefcase,
  BarChart3,
  PieChart,
  LineChart,
  Settings,
  Bell,
  Search as SearchIcon,
  X,
  Copy,
  Share2,
  Download as DownloadIcon,
  FileText,
  Printer,
  Send,
  MessageSquare,
  ThumbsUp,
  TrendingDown,
  AlertTriangle,
  Info,
  HelpCircle,
  Maximize2,
  Minimize2,
  Grid3x3,
  Rows,
  Sun,
  Moon,
} from "lucide-react";

// ============================================================
// INTERFACES - Tipado completo según tabla
// ============================================================

type ThemeMode = "light" | "dark";

interface Centro {
  id_centro: number;
  nombre: string;
  pais: string | null;
  razon_social: string;
  rut: string;
  direccion: string;
  ciudad: string;
  region: string | null;
  comuna: string | null;
  codigo_postal: string | null;
  telefono_principal: string;
  telefono_secundario: string | null;
  email_contacto: string;
  email_secundario: string | null;
  sitio_web: string | null;
  logo_url: string | null;
  descripcion: string | null;
  horario_apertura: string;
  horario_cierre: string;
  dias_atencion: string | null;
  plan: "basico" | "profesional" | "enterprise";
  estado: "activo" | "inactivo" | "suspendido";
  fecha_inicio_operacion: string | null;
  capacidad_pacientes_dia: number | null;
  nivel_complejidad: "baja" | "media" | "alta" | null;
  especializacion_principal: string | null;
  tipo_establecimiento:
    | "hospital"
    | "clinica"
    | "consultorio"
    | "laboratorio"
    | "centro_salud"
    | "otro"
    | null;
  fecha_creacion: string;
  fecha_modificacion: string;
  created_by: number;
  id_pais: number | null;
  id_region: number | null;
  id_comuna: number | null;
}

interface Estadisticas {
  total_centros: number;
  centros_activos: number;
  centros_inactivos: number;
  centros_suspendidos: number;
  capacidad_promedio: number | null;
  capacidad_total: number | null;
  centros_alta_complejidad: number;
  centros_media_complejidad: number;
  centros_baja_complejidad: number;
}

interface DistribucionRegion {
  region: string;
  cantidad: number;
  activos: number;
}

// ============================================================
// COMPONENTE: Badge Estado Premium
// ============================================================
const EstadoBadge = ({ estado }: { estado: Centro["estado"] }) => {
  const configs = {
    activo: {
      bg: "bg-gradient-to-r from-emerald-400 to-teal-500",
      text: "text-white",
      icon: CheckCircle,
      label: "Activo",
      shadow: "shadow-lg shadow-emerald-500/50",
    },
    inactivo: {
      bg: "bg-gradient-to-r from-slate-400 to-slate-500",
      text: "text-white",
      icon: Ban,
      label: "Inactivo",
      shadow: "shadow-lg shadow-slate-500/50",
    },
    suspendido: {
      bg: "bg-gradient-to-r from-red-400 to-rose-500",
      text: "text-white",
      icon: AlertCircle,
      label: "Suspendido",
      shadow: "shadow-lg shadow-red-500/50",
    },
  };

  const config = configs[estado as keyof typeof configs] || configs.inactivo;
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${config.bg} ${config.text} text-[11px] font-bold uppercase tracking-wider ${config.shadow} backdrop-blur-xl border border-white/20`}
    >
      <Icon className="w-4 h-4 animate-pulse" />
      <span>{config.label}</span>
    </div>
  );
};

// ============================================================
// COMPONENTE: Badge Plan Premium
// ============================================================
const PlanBadge = ({ plan }: { plan: string }) => {
  const configs = {
    basico: {
      bg: "bg-gradient-to-r from-blue-400 to-cyan-500",
      text: "text-white",
      icon: "💎",
      label: "Básico",
      shadow: "shadow-lg shadow-blue-500/50",
    },
    profesional: {
      bg: "bg-gradient-to-r from-purple-400 to-pink-500",
      text: "text-white",
      icon: "👑",
      label: "Profesional",
      shadow: "shadow-lg shadow-purple-500/50",
    },
    enterprise: {
      bg: "bg-gradient-to-r from-amber-400 to-orange-500",
      text: "text-white",
      icon: "🏆",
      label: "Enterprise",
      shadow: "shadow-lg shadow-amber-500/50",
    },
  };

  const config =
    configs[plan?.toLowerCase() as keyof typeof configs] || configs.basico;

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${config.bg} ${config.text} text-[11px] font-bold uppercase tracking-wider ${config.shadow} backdrop-blur-xl border border-white/20`}
    >
      <span className="text-lg">{config.icon}</span>
      <span>{config.label}</span>
    </div>
  );
};

// ============================================================
// COMPONENTE: Badge País Premium
// ============================================================
const PaisBadge = ({ pais }: { pais: string | null }) => {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 text-[11px] font-bold text-blue-700 shadow-md backdrop-blur-xl">
      <Flag className="w-4 h-4 text-blue-600" />
      <span>{pais || "Sin país"}</span>
    </div>
  );
};

// ============================================================
// COMPONENTE: Modal Detalles Premium
// ============================================================
const ModalDetalles = ({
  centro,
  isOpen,
  onClose,
}: {
  centro: Centro | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen || !centro) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {centro.logo_url ? (
              <img
                src={centro.logo_url}
                alt={centro.nombre}
                className="w-12 h-12 rounded-xl shadow-lg"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Building2 className="w-7 h-7 text-white" />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-white">{centro.nombre}</h2>
              <p className="text-white/90 text-sm">{centro.razon_social}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-all"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Badges */}
          <div className="flex flex-wrap gap-3">
            <EstadoBadge estado={centro.estado} />
            <PlanBadge plan={centro.plan} />
            <PaisBadge pais={centro.pais} />
          </div>

          {/* Grid de información */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* RUT */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
              <p className="text-[11px] text-indigo-600 font-bold uppercase tracking-wider mb-1">
                RUT
              </p>
              <p className="text-lg font-bold text-gray-900 font-mono">
                {centro.rut}
              </p>
            </div>

            {/* Tipo de establecimiento */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
              <p className="text-[11px] text-emerald-600 font-bold uppercase tracking-wider mb-1">
                Tipo
              </p>
              <p className="text-lg font-bold text-gray-900 capitalize">
                {centro.tipo_establecimiento || "N/A"}
              </p>
            </div>

            {/* Dirección */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200 md:col-span-2">
              <p className="text-[11px] text-blue-600 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                Dirección
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {centro.direccion}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {centro.ciudad}
                {centro.region && `, ${centro.region}`}
                {centro.codigo_postal && ` - ${centro.codigo_postal}`}
              </p>
            </div>

            {/* Teléfono */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200">
              <p className="text-[11px] text-emerald-600 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Phone className="w-4 h-4" />
                Teléfono
              </p>
              <a
                href={`tel:${centro.telefono_principal}`}
                className="text-lg font-bold text-emerald-600 hover:text-emerald-700"
              >
                {centro.telefono_principal}
              </a>
              {centro.telefono_secundario && (
                <p className="text-xs text-gray-600 mt-1">
                  Secundario: {centro.telefono_secundario}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
              <p className="text-[11px] text-purple-600 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                Email
              </p>
              <a
                href={`mailto:${centro.email_contacto}`}
                className="text-sm font-bold text-purple-600 hover:text-purple-700 break-all"
              >
                {centro.email_contacto}
              </a>
            </div>

            {/* Horario */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
              <p className="text-[11px] text-orange-600 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                Horario
              </p>
              <p className="text-sm font-bold text-gray-900">
                {centro.horario_apertura} - {centro.horario_cierre}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {centro.dias_atencion || "Lunes a Viernes"}
              </p>
            </div>

            {/* Capacidad */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
              <p className="text-[11px] text-blue-600 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                Capacidad
              </p>
              <p className="text-3xl font-bold text-blue-600">
                {centro.capacidad_pacientes_dia || 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">Pacientes por día</p>
            </div>

            {/* Complejidad */}
            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 border border-red-200">
              <p className="text-[11px] text-red-600 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                Complejidad
              </p>
              <p className="text-lg font-bold text-red-600 capitalize">
                {centro.nivel_complejidad || "N/A"}
              </p>
            </div>

            {/* Especialización */}
            {centro.especializacion_principal && (
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-200 md:col-span-2">
                <p className="text-[11px] text-violet-600 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4" />
                  Especialización
                </p>
                <p className="text-sm font-bold text-gray-900">
                  {centro.especializacion_principal}
                </p>
              </div>
            )}

            {/* Sitio web */}
            {centro.sitio_web && (
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-200 md:col-span-2">
                <p className="text-[11px] text-cyan-600 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Globe className="w-4 h-4" />
                  Sitio Web
                </p>
                <a
                  href={centro.sitio_web}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-cyan-600 hover:text-cyan-700 break-all"
                >
                  {centro.sitio_web}
                </a>
              </div>
            )}

            {/* Descripción */}
            {centro.descripcion && (
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200 md:col-span-2">
                <p className="text-[11px] text-gray-600 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  Descripción
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {centro.descripcion}
                </p>
              </div>
            )}

            {/* Fechas */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-200">
              <p className="text-[11px] text-indigo-600 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Creado
              </p>
              <p className="text-sm font-bold text-gray-900">
                {new Date(centro.fecha_creacion).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
              <p className="text-[11px] text-purple-600 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4" />
                Modificado
              </p>
              <p className="text-sm font-bold text-gray-900">
                {new Date(centro.fecha_modificacion).toLocaleDateString(
                  "es-ES",
                  {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-900 rounded-xl font-semibold hover:bg-gray-400 transition-all"
          >
            Cerrar
          </button>
          <Link
            href={`/admin/centros/${centro.id_centro}/editar`}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Editar
          </Link>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// COMPONENTE: Card Centro Premium
// ============================================================
const CentroCard = ({
  centro,
  onViewDetails,
  onChangeStatus,
  onDelete,
}: {
  centro: Centro;
  onViewDetails: (centro: Centro) => void;
  onChangeStatus: (id: number, status: Centro["estado"]) => void;
  onDelete: (id: number) => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border-2 border-gray-100 hover:border-indigo-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

      {/* Header card */}
      <div className="relative h-32 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-4 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            {centro.logo_url ? (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-100 rounded-2xl blur-lg opacity-50"></div>
                <div className="relative w-14 h-14 rounded-2xl bg-white shadow-xl p-2 overflow-hidden ring-2 ring-white/60">
                  <img
                    src={centro.logo_url}
                    alt={centro.nombre}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-100 rounded-2xl blur-lg opacity-50"></div>
                <div className="relative w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xl shadow-xl flex items-center justify-center ring-2 ring-white/60">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onViewDetails(centro)}
              className="p-2.5 bg-white/20 backdrop-blur-xl rounded-xl hover:bg-white/30 transition-all ring-1 ring-white/40 hover:ring-white/60"
              title="Ver detalles"
            >
              <Eye className="w-5 h-5 text-white" />
            </button>
            <Link
              href={`/admin/centros/${centro.id_centro}/editar`}
              className="p-2.5 bg-white/20 backdrop-blur-xl rounded-xl hover:bg-white/30 transition-all ring-1 ring-white/40 hover:ring-white/60"
              title="Editar"
            >
              <Edit className="w-5 h-5 text-white" />
            </Link>
            <button
              onClick={() =>
                onChangeStatus(
                  centro.id_centro,
                  centro.estado === "activo" ? "inactivo" : "activo"
                )
              }
              className="p-2.5 bg-white/20 backdrop-blur-xl rounded-xl hover:bg-emerald-500/80 transition-all ring-1 ring-white/40 hover:ring-white/60"
              title={
                centro.estado === "activo"
                  ? "Marcar como inactivo"
                  : "Activar centro"
              }
            >
              <Power className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => onDelete(centro.id_centro)}
              className="p-2.5 bg-white/20 backdrop-blur-xl rounded-xl hover:bg-red-500 transition-all ring-1 ring-white/40 hover:ring-white/60"
              title="Eliminar"
            >
              <Trash2 className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Contenido card */}
      <div className="relative z-10 p-5">
        {/* Nombre y badges */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-indigo-600 transition-colors mb-2 line-clamp-2">
            {centro.nombre}
          </h3>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <EstadoBadge estado={centro.estado} />
            <PlanBadge plan={centro.plan} />
          </div>
          <p className="text-xs text-gray-600 font-semibold mb-1">
            {centro.razon_social}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-[10px] text-gray-500 font-mono bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">
              {centro.rut}
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(centro.rut);
                alert("RUT copiado al portapapeles");
              }}
              className="p-1 hover:bg-gray-100 rounded-lg transition-all"
              title="Copiar RUT"
            >
              <Copy className="w-3.5 h-3.5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Contacto */}
        <div className="space-y-2.5 mb-4 pb-4 border-b-2 border-gray-100">
          <div className="flex items-start gap-2">
            <div className="mt-0.5 p-1.5 bg-indigo-100 rounded-lg">
              <MapPin className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-900 font-bold leading-snug">
                {centro.direccion}
              </p>
              <p className="text-[11px] text-gray-600 font-semibold mt-1">
                {centro.ciudad}
                {centro.region && `, ${centro.region}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-100 rounded-lg">
              <Phone className="w-4 h-4 text-emerald-600" />
            </div>
            <a
              href={`tel:${centro.telefono_principal}`}
              className="text-xs text-gray-700 hover:text-emerald-600 font-bold transition-colors"
            >
              {centro.telefono_principal}
            </a>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Mail className="w-4 h-4 text-blue-600" />
            </div>
            <a
              href={`mailto:${centro.email_contacto}`}
              className="text-xs text-gray-700 hover:text-blue-600 font-bold transition-colors truncate"
            >
              {centro.email_contacto}
            </a>
          </div>
          {centro.sitio_web && (
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-100 rounded-lg">
                <Globe className="w-4 h-4 text-purple-600" />
              </div>
              <a
                href={centro.sitio_web}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-purple-600 hover:text-purple-700 font-bold truncate flex items-center gap-1"
              >
                {centro.sitio_web}
                <Sparkles className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="space-y-3">
          {/* Fila 1 */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-3 text-center border-2 border-blue-100 hover:border-blue-300 transition-all">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                  <Users className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-blue-600 mb-0.5">
                {centro.capacidad_pacientes_dia || 0}
              </p>
              <p className="text-[10px] text-blue-700 font-bold uppercase tracking-wider">
                Capacidad
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-3 text-center border-2 border-emerald-100 hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
                  <Zap className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-emerald-600 mb-0.5 capitalize">
                {centro.nivel_complejidad || "N/A"}
              </p>
              <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
                Complejidad
              </p>
            </div>
          </div>

          {/* Fila 2 */}
          <div className="space-y-2 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-3 border-2 border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-600 font-bold flex items-center gap-1.5 uppercase tracking-wider">
                <Clock className="w-4 h-4 text-indigo-600" />
                Horario
              </span>
              <span className="text-xs font-bold text-gray-900 bg-white px-2.5 py-1 rounded-lg border border-gray-300">
                {centro.horario_apertura}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-600 font-bold flex items-center gap-1.5 uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-emerald-600" />
                Creado
              </span>
              <span className="text-xs font-bold text-gray-900 bg-white px-2.5 py-1 rounded-lg border border-gray-300">
                {new Date(centro.fecha_creacion).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative px-5 py-3 bg-gradient-to-r from-gray-50 to-slate-50 border-t-2 border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              centro.estado === "activo"
                ? "bg-emerald-500 animate-pulse"
                : centro.estado === "suspendido"
                ? "bg-red-500 animate-pulse"
                : "bg-slate-400"
            }`}
          ></div>
          <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
            {centro.estado}
          </span>
        </div>
        <PaisBadge pais={centro.pais} />
      </div>
    </div>
  );
};

// ============================================================
// PÁGINA PRINCIPAL: CentrosPage PREMIUM
// ============================================================
export default function CentrosPage() {
  const router = useRouter();
  const [centros, setCentros] = useState<Centro[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [distribucion, setDistribucion] = useState<DistribucionRegion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [vistaActual, setVistaActual] = useState<"grid" | "list">("grid");

  // Modal
  const [selectedCentro, setSelectedCentro] = useState<Centro | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Paginación
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Tema
  const [theme, setTheme] = useState<ThemeMode>("light");
  const isDark = theme === "dark";

  // ============================================================
  // Cargar centros con filtros
  // ============================================================
  const cargarCentros = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        ...(estadoFiltro !== "todos" && { estado: estadoFiltro }),
        ...(busqueda && { busqueda }),
      });

      const response = await fetch(`/api/admin/centros?${params}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("No se pudo obtener la información de los centros");
      }

      const data = await response.json();

      if (data.success) {
        setCentros(data.data || []);
        setEstadisticas(data.estadisticas || null);
        setDistribucion(data.distribucion_region || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.pagination?.total || (data.data ? data.data.length : 0));
      } else {
        setError(data.error || "Error al cargar centros");
      }
    } catch (err: any) {
      setError(err.message || "Error inesperado");
      console.error("❌ Error al cargar centros:", err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // Efectos
  // ============================================================
  useEffect(() => {
    // Cargar tema desde localStorage
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(
        "centros-theme"
      ) as ThemeMode | null;
      if (stored === "dark" || stored === "light") {
        setTheme(stored);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("centros-theme", theme);
    }
  }, [theme]);

  useEffect(() => {
    cargarCentros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, estadoFiltro, busqueda]);

  // ============================================================
  // Cambiar estado del centro
  // ============================================================
  const cambiarEstado = async (
    idCentro: number,
    nuevoEstado: Centro["estado"]
  ) => {
    try {
      const response = await fetch(`/api/admin/centros/${idCentro}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Estado actualizado a: ${nuevoEstado}`);
        cargarCentros();
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    }
  };

  // ============================================================
  // Eliminar centro
  // ============================================================
  const eliminarCentro = async (idCentro: number) => {
    if (
      !confirm(
        "⚠️ ¿Estás seguro de eliminar este centro? Esta acción no se puede deshacer."
      )
    )
      return;

    try {
      const response = await fetch(`/api/admin/centros/${idCentro}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        alert("✅ Centro eliminado exitosamente");
        cargarCentros();
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    }
  };

  // ============================================================
  // Descargar reporte
  // ============================================================
  const descargarReporte = async () => {
    try {
      const params = new URLSearchParams({
        ...(estadoFiltro !== "todos" && { estado: estadoFiltro }),
        ...(busqueda && { busqueda }),
      });

      window.open(`/api/admin/centros/reporte?${params}`, "_blank");
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div
      className={
        isDark
          ? "min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden"
          : "min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50 relative overflow-hidden"
      }
    >
      {/* Fondo animado */}
      <div className="absolute inset-0 pointer-events-none">
        {isDark ? (
          <>
            <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-700/40 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-700/40 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-700/30 rounded-full blur-3xl animate-pulse"></div>
          </>
        ) : (
          <>
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-200 rounded-full blur-3xl animate-pulse"></div>
          </>
        )}
      </div>

      <div className="relative z-10 p-4 md:p-8">
        {/* Botón regresar */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className={
              isDark
                ? "inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-xl text-white rounded-2xl text-xs md:text-sm font-bold shadow-lg hover:shadow-xl hover:bg-white/20 transition-all border border-white/20"
                : "inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-2xl text-xs md:text-sm font-bold shadow shadow-sm hover:bg-gray-100 transition-all border border-gray-200"
            }
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Regresar</span>
          </button>
        </div>

        {/* Header Premium */}
        <div className="mb-8">
          <div
            className={
              isDark
                ? "relative overflow-hidden bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 rounded-3xl shadow-2xl border border-white/10"
                : "relative overflow-hidden bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-3xl shadow-xl border border-gray-200"
            }
          >
            <div
              className={
                isDark
                  ? "absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"
                  : "absolute inset-0 bg-gradient-to-br from-white/40 to-transparent"
              }
            ></div>
            <div className="absolute -right-20 -top-20 w-40 h-40 bg-white/30 rounded-full blur-3xl"></div>
            <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-white/30 rounded-full blur-3xl"></div>

            <div className="relative z-10 p-6 md:p-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={
                      isDark
                        ? "p-4 bg-white/20 backdrop-blur-xl rounded-2xl shadow-xl"
                        : "p-4 bg-white rounded-2xl shadow border border-gray-200"
                    }
                  >
                    <Building2
                      className={
                        isDark
                          ? "w-8 h-8 text-white"
                          : "w-8 h-8 text-indigo-600"
                      }
                    />
                  </div>
                  <div>
                    <h1
                      className={`text-3xl md:text-4xl font-black mb-1 tracking-tight ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Centros Médicos
                      <span className="inline-block ml-2 align-middle animate-bounce">
                        ✨
                      </span>
                    </h1>
                    <p
                      className={`text-sm md:text-base font-bold flex items-center gap-2 ${
                        isDark ? "text-white/95" : "text-gray-700"
                      }`}
                    >
                      <Shield className="w-5 h-5" />
                      Gestión Premium de Centros de Salud
                      <Heart
                        className={`w-5 h-5 ${
                          isDark ? "text-red-300" : "text-red-400"
                        }`}
                      />
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-center">
                  <button
                    onClick={() =>
                      setTheme(isDark ? "light" : "dark")
                    }
                    className={
                      isDark
                        ? "inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/10 border border-white/30 text-white text-xs font-semibold hover:bg-white/20 transition-all"
                        : "inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-100 transition-all"
                    }
                    title={
                      isDark
                        ? "Cambiar a modo claro"
                        : "Cambiar a modo oscuro"
                    }
                  >
                    {isDark ? (
                      <>
                        <Sun className="w-4 h-4" />
                        <span>Claro</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4" />
                        <span>Oscuro</span>
                      </>
                    )}
                  </button>

                  <Link
                    href="/admin/centros/nuevo"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-2xl text-xs md:text-sm font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Nuevo Centro</span>
                    <Sparkles className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas Premium */}
        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Total centros */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-cyan-500 to-sky-600 rounded-2xl p-6 shadow-xl text-white border border-white/20 hover:border-white/40 transition-all">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-xl rounded-xl">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <TrendingUp className="w-6 h-6 opacity-90" />
                </div>
                <p className="text-[12px] font-bold uppercase tracking-widest mb-2 opacity-90">
                  Total Centros
                </p>
                <p className="text-4xl font-black mb-2">
                  {estadisticas.total_centros}
                </p>
                <p className="text-xs font-bold flex items-center gap-1.5 opacity-90">
                  <Activity className="w-4 h-4" />
                  Registrados en el sistema
                </p>
              </div>
            </div>

            {/* Activos */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-green-600 rounded-2xl p-6 shadow-xl text-white border border-white/20 hover:border-white/40 transition-all">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-xl rounded-xl">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div className="px-3 py-1.5 bg-white/20 backdrop-blur-xl rounded-xl text-xs font-bold">
                    {estadisticas.total_centros > 0
                      ? Math.round(
                          (estadisticas.centros_activos /
                            estadisticas.total_centros) *
                            100
                        )
                      : 0}
                    %
                  </div>
                </div>
                <p className="text-[12px] font-bold uppercase tracking-widest mb-2 opacity-90">
                  Centros Activos
                </p>
                <p className="text-4xl font-black mb-2">
                  {estadisticas.centros_activos}
                </p>
                <p className="text-xs font-bold flex items-center gap-1.5 opacity-90">
                  <Award className="w-4 h-4" />
                  Operando actualmente
                </p>
              </div>
            </div>

            {/* Capacidad total */}
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-600 rounded-2xl p-6 shadow-xl text-white border border-white/20 hover:border-white/40 transition-all">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-xl rounded-xl">
                    <Users className="w-6 h-6" />
                  </div>
                  <Sparkles className="w-6 h-6 opacity-90" />
                </div>
                <p className="text-[12px] font-bold uppercase tracking-widest mb-2 opacity-90">
                  Capacidad Total
                </p>
                <p className="text-4xl font-black mb-2">
                  {estadisticas.capacidad_total?.toLocaleString() || 0}
                </p>
                <p className="text-xs font-bold flex items-center gap-1.5 opacity-90">
                  <Activity className="w-4 h-4" />
                  Pacientes por día
                </p>
              </div>
            </div>

            {/* Capacidad promedio */}
            <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 rounded-2xl p-6 shadow-xl text-white border border-white/20 hover:border-white/40 transition-all">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-xl rounded-xl">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div className="px-3 py-1.5 bg-white/20 backdrop-blur-xl rounded-xl text-xs font-bold">
                    AVG
                  </div>
                </div>
                <p className="text-[12px] font-bold uppercase tracking-widest mb-2 opacity-90">
                  Capacidad Promedio
                </p>
                <p className="text-4xl font-black mb-2">
                  {Math.round(estadisticas.capacidad_promedio || 0)}
                </p>
                <p className="text-xs font-bold flex items-center gap-1.5 opacity-90">
                  <Shield className="w-4 h-4" />
                  Por centro
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Barra de búsqueda / filtros Premium */}
        <div
          className={
            isDark
              ? "relative bg-white/10 backdrop-blur-2xl rounded-2xl shadow-xl p-5 mb-8 border border-white/20"
              : "relative bg-white rounded-2xl shadow p-5 mb-8 border border-gray-200"
          }
        >
          <div className="relative z-10 flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <SearchIcon
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  isDark ? "text-white/60" : "text-gray-400"
                }`}
              />
              <input
                type="text"
                placeholder="Buscar centros médicos..."
                value={busqueda}
                onChange={(e) => {
                  setPage(1);
                  setBusqueda(e.target.value);
                }}
                className={
                  isDark
                    ? "w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl focus:border-white/40 focus:ring-2 focus:ring-white/20 outline-none transition-all text-white placeholder-white/60 font-semibold"
                    : "w-full pl-12 pr-4 py-3 bg-gray-100 border border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-gray-800 placeholder-gray-400"
                }
              />
            </div>

            {/* Filtro estado */}
            <div className="relative">
              <Filter
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none ${
                  isDark ? "text-white/60" : "text-gray-400"
                }`}
              />
              <select
                value={estadoFiltro}
                onChange={(e) => {
                  setPage(1);
                  setEstadoFiltro(e.target.value);
                }}
                className={
                  isDark
                    ? "appearance-none pl-12 pr-10 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl focus:border-white/40 focus:ring-2 focus:ring-white/20 outline-none text-white font-semibold min-w-[200px]"
                    : "appearance-none pl-12 pr-10 py-3 bg-gray-100 border border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-gray-800 font-semibold min-w-[200px]"
                }
              >
                <option value="todos" className={isDark ? "bg-slate-900" : ""}>
                  Todos los estados
                </option>
                <option value="activo" className={isDark ? "bg-slate-900" : ""}>
                  Activos
                </option>
                <option
                  value="inactivo"
                  className={isDark ? "bg-slate-900" : ""}
                >
                  Inactivos
                </option>
                <option
                  value="suspendido"
                  className={isDark ? "bg-slate-900" : ""}
                >
                  Suspendidos
                </option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className={`w-5 h-5 ${
                    isDark ? "text-white/60" : "text-gray-400"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-2">
              {/* Toggle vista */}
              <div
                className={
                  isDark
                    ? "flex bg-white/10 rounded-xl p-1.5 shadow-lg border border-white/20"
                    : "flex bg-gray-100 rounded-xl p-1.5 shadow border border-gray-200"
                }
              >
                <button
                  onClick={() => setVistaActual("grid")}
                  className={`p-2.5 rounded-lg transition-all ${
                    vistaActual === "grid"
                      ? isDark
                        ? "bg-white/20 shadow text-white"
                        : "bg-white shadow text-indigo-600"
                      : isDark
                      ? "text-white/60 hover:text-white"
                      : "text-gray-400 hover:text-gray-700"
                  }`}
                  title="Vista Grid"
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setVistaActual("list")}
                  className={`p-2.5 rounded-lg transition-all ${
                    vistaActual === "list"
                      ? isDark
                        ? "bg-white/20 shadow text-white"
                        : "bg-white shadow text-indigo-600"
                      : isDark
                      ? "text-white/60 hover:text-white"
                      : "text-gray-400 hover:text-gray-700"
                  }`}
                  title="Vista Lista"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Actualizar */}
              <button
                onClick={() => cargarCentros()}
                disabled={loading}
                className="px-4 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-blue-400/50"
                title="Actualizar"
              >
                <RefreshCw
                  className={`w-5 h-5 ${
                    loading ? "animate-spin" : ""
                  } mx-auto`}
                />
              </button>

              {/* Descargar */}
              <button
                onClick={descargarReporte}
                className="px-4 py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg hover:bg-emerald-700 hover:shadow-xl transition-all border border-emerald-400/50"
                title="Descargar Reporte"
              >
                <Download className="w-5 h-5 mx-auto" />
              </button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div
                className={`w-20 h-20 border-4 rounded-full absolute ${
                  isDark ? "border-white/20" : "border-indigo-100"
                }`}
              ></div>
              <div className="w-20 h-20 border-4 border-indigo-500 rounded-full absolute animate-spin border-t-transparent"></div>
              <div className="w-12 h-12 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <p
              className={`mt-6 text-lg font-bold ${
                isDark ? "text-white" : "text-gray-700"
              }`}
            >
              Cargando centros médicos...
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="relative overflow-hidden bg-gradient-to-r from-red-500 via-rose-500 to-pink-600 text-white rounded-2xl p-6 shadow-xl mb-8 border border-red-400/50">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="p-4 bg-white/20 backdrop-blur-xl rounded-xl">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1">Error al cargar datos</h3>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* GRID VIEW */}
        {!loading && vistaActual === "grid" && centros.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {centros.map((centro, index) => (
              <div
                key={centro.id_centro}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: "fadeInUp 0.5s ease-out forwards",
                }}
              >
                <CentroCard
                  centro={centro}
                  onViewDetails={(c) => {
                    setSelectedCentro(c);
                    setShowModal(true);
                  }}
                  onChangeStatus={cambiarEstado}
                  onDelete={eliminarCentro}
                />
              </div>
            ))}
          </div>
        )}

        {/* LIST VIEW */}
        {!loading && vistaActual === "list" && centros.length > 0 && (
          <div
            className={
              isDark
                ? "relative bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 overflow-hidden shadow-xl mb-8"
                : "relative bg-white rounded-2xl border border-gray-200 overflow-hidden shadow mb-8"
            }
          >
            <div className="relative z-10 overflow-x-auto">
              <table className="w-full text-xs">
                <thead
                  className={
                    isDark
                      ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-[12px]"
                      : "bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 text-gray-800 text-[12px] border-b border-gray-200"
                  }
                >
                  <tr>
                    <th className="px-6 py-4 text-left font-bold uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        Centro
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left font-bold uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Ubicación
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left font-bold uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Phone className="w-5 h-5" />
                        Contacto
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left font-bold uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Estado
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left font-bold uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Crown className="w-5 h-5" />
                        Plan
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left font-bold uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Capacidad
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right font-bold uppercase tracking-wider">
                      <div className="flex items-center justify-end gap-2">
                        <Zap className="w-5 h-5" />
                        Acciones
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={
                    isDark
                      ? "divide-y divide-white/10"
                      : "divide-y divide-gray-100"
                  }
                >
                  {centros.map((centro, index) => (
                    <tr
                      key={centro.id_centro}
                      className={
                        isDark
                          ? `group transition-all hover:bg-white/10 ${
                              index % 2 === 0
                                ? "bg-white/5"
                                : "bg-white/[0.02]"
                            }`
                          : `group transition-all hover:bg-indigo-50/40 ${
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }`
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {centro.logo_url ? (
                            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 p-2 shadow-md ring-1 ring-indigo-200/50">
                              <img
                                src={centro.logo_url}
                                alt={centro.nombre}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          ) : (
                            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md ring-1 ring-indigo-400/50">
                              <Building2 className="w-6 h-6 text-white" />
                            </div>
                          )}
                          <div>
                            <div
                              className={`text-xs font-bold transition-colors ${
                                isDark
                                  ? "text-white group-hover:text-indigo-300"
                                  : "text-gray-900 group-hover:text-indigo-600"
                              }`}
                            >
                              {centro.nombre}
                            </div>
                            <div
                              className={`text-[11px] font-mono mt-0.5 px-2 py-0.5 rounded-md inline-block border ${
                                isDark
                                  ? "text-white/60 bg-white/10 border-white/20"
                                  : "text-gray-600 bg-gray-50 border-gray-200"
                              }`}
                            >
                              {centro.rut}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div
                            className={`text-xs font-bold flex items-center gap-1.5 ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            <MapPin
                              className={`w-4 h-4 ${
                                isDark ? "text-indigo-400" : "text-indigo-500"
                              }`}
                            />
                            {centro.ciudad}
                          </div>
                          <div
                            className={`text-[11px] mt-0.5 ${
                              isDark ? "text-white/60" : "text-gray-600"
                            }`}
                          >
                            {centro.direccion}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <a
                            href={`tel:${centro.telefono_principal}`}
                            className={`text-xs font-bold flex items-center gap-1.5 ${
                              isDark
                                ? "text-blue-400 hover:text-blue-300"
                                : "text-blue-600 hover:text-blue-500"
                            }`}
                          >
                            <Phone className="w-4 h-4" />
                            {centro.telefono_principal}
                          </a>
                          <a
                            href={`mailto:${centro.email_contacto}`}
                            className={`text-xs font-bold flex items-center gap-1.5 truncate ${
                              isDark
                                ? "text-purple-400 hover:text-purple-300"
                                : "text-purple-600 hover:text-purple-500"
                            }`}
                          >
                            <Mail className="w-4 h-4" />
                            {centro.email_contacto}
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <EstadoBadge estado={centro.estado} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PlanBadge plan={centro.plan} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-2 rounded-lg border ${
                              isDark
                                ? "bg-blue-500/20 border-blue-400/50"
                                : "bg-blue-50 border-blue-200"
                            }`}
                          >
                            <Users
                              className={`w-4 h-4 ${
                                isDark
                                  ? "text-blue-400"
                                  : "text-blue-600"
                              }`}
                            />
                          </div>
                          <span
                            className={`text-xs font-bold ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {centro.capacidad_pacientes_dia || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedCentro(centro);
                              setShowModal(true);
                            }}
                            className="p-2.5 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all border border-blue-400/50"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/admin/centros/${centro.id_centro}/editar`}
                            className="p-2.5 bg-emerald-600 text-white rounded-lg shadow-md hover:bg-emerald-700 transition-all border border-emerald-400/50"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() =>
                              cambiarEstado(
                                centro.id_centro,
                                centro.estado === "activo"
                                  ? "inactivo"
                                  : "activo"
                              )
                            }
                            className="p-2.5 bg-slate-600 text-white rounded-lg shadow-md hover:bg-slate-700 transition-all border border-slate-400/50"
                            title={
                              centro.estado === "activo"
                                ? "Marcar como inactivo"
                                : "Activar centro"
                            }
                          >
                            <Power className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => eliminarCentro(centro.id_centro)}
                            className="p-2.5 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-all border border-red-400/50"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sin resultados */}
        {!loading && centros.length === 0 && !error && (
          <div className="relative text-center py-32">
            <div className="relative z-10">
              <div
                className={`inline-flex p-8 rounded-3xl shadow-xl mb-6 border ${
                  isDark
                    ? "bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 border-white/20"
                    : "bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-gray-200"
                }`}
              >
                <Building2
                  className={`w-16 h-16 ${
                    isDark ? "text-indigo-400" : "text-indigo-500"
                  }`}
                />
              </div>
              <h3
                className={`text-3xl font-black mb-3 ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                No se encontraron centros
              </h3>
              <p
                className={`text-base mb-8 max-w-sm mx-auto font-semibold ${
                  isDark ? "text-white/80" : "text-gray-600"
                }`}
              >
                Intenta ajustar los filtros o crea un nuevo centro para
                comenzar.
              </p>
              <Link
                href="/admin/centros/nuevo"
                className={`inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all border ${
                  isDark
                    ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white border-white/20"
                    : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-transparent"
                }`}
              >
                <Plus className="w-5 h-5" />
                Crear primer centro
              </Link>
            </div>
          </div>
        )}

        {/* Paginación Premium */}
        {totalPages > 1 && centros.length > 0 && (
          <div
            className={
              isDark
                ? "mt-8 relative bg-white/10 backdrop-blur-2xl rounded-2xl shadow-xl p-6 border border-white/20"
                : "mt-8 relative bg-white rounded-2xl shadow p-6 border border-gray-200"
            }
          >
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
              <div
                className={`flex items-center gap-3 ${
                  isDark ? "text-white/90" : "text-gray-700"
                }`}
              >
                <div
                  className={`p-3 rounded-xl ${
                    isDark
                      ? "bg-indigo-500/30 border border-indigo-400/50"
                      : "bg-indigo-50 border border-indigo-200"
                  }`}
                >
                  <Activity
                    className={
                      isDark ? "w-5 h-5 text-indigo-400" : "w-5 h-5 text-indigo-600"
                    }
                  />
                </div>
                <span className="font-bold">
                  Mostrando{" "}
                  <span
                    className={
                      isDark
                        ? "text-indigo-400 font-black"
                        : "text-indigo-600 font-black"
                    }
                  >
                    {centros.length}
                  </span>{" "}
                  de{" "}
                  <span
                    className={
                      isDark
                        ? "text-purple-400 font-black"
                        : "text-purple-600 font-black"
                    }
                  >
                    {total}
                  </span>{" "}
                  centros
                </span>
              </div>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                  className={
                    isDark
                      ? "inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs font-bold text-white hover:border-indigo-400 hover:bg-indigo-500/20 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      : "inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  }
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                          page === pageNum
                            ? isDark
                              ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg border border-white/20"
                              : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow border border-transparent"
                            : isDark
                            ? "bg-white/10 border border-white/20 text-white hover:border-indigo-400 hover:bg-indigo-500/20"
                            : "bg-white border border-gray-300 text-gray-700 hover:border-indigo-400 hover:bg-indigo-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === totalPages}
                  className={
                    isDark
                      ? "inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs font-bold text-white hover:border-indigo-400 hover:bg-indigo-500/20 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      : "inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  }
                >
                  <span>Siguiente</span>
                  <ChevronLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Distribución por región */}
        {distribucion && distribucion.length > 0 && (
          <div
            className={
              isDark
                ? "mt-8 relative bg-white/10 backdrop-blur-2xl rounded-2xl shadow-xl p-6 border border-white/20"
                : "mt-8 relative bg-white rounded-2xl shadow p-6 border border-gray-200"
            }
          >
            <h3
              className={`text-xl font-black mb-6 flex items-center gap-2 ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              <PieChart
                className={`w-6 h-6 ${
                  isDark ? "text-indigo-400" : "text-indigo-600"
                }`}
              />
              Distribución por Región
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {distribucion.map((region, index) => (
                <div
                  key={index}
                  className={
                    isDark
                      ? "bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-4 border border-white/20 hover:border-white/40 transition-all"
                      : "bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200 hover:border-indigo-200 transition-all"
                  }
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4
                      className={`text-sm font-bold ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {region.region}
                    </h4>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-lg border ${
                        isDark
                          ? "text-indigo-400 bg-indigo-500/20 border-indigo-400/50"
                          : "text-indigo-600 bg-indigo-50 border-indigo-200"
                      }`}
                    >
                      {region.cantidad}
                    </span>
                  </div>
                  <div
                    className={`w-full rounded-full h-2 overflow-hidden border ${
                      isDark
                        ? "bg-white/10 border-white/20"
                        : "bg-gray-100 border-gray-200"
                    }`}
                  >
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                      style={{
                        width: `${
                          (region.activos / region.cantidad) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className={`text-[11px] font-semibold ${
                        isDark ? "text-white/70" : "text-gray-600"
                      }`}
                    >
                      Activos
                    </span>
                    <span
                      className={
                        isDark
                          ? "text-xs font-bold text-emerald-400"
                          : "text-xs font-bold text-emerald-600"
                      }
                    >
                      {region.activos}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <ModalDetalles
        centro={selectedCentro}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedCentro(null);
        }}
      />

      {/* Estilos */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        /* Scrollbar personalizado */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.5);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.8);
        }
      `}</style>
    </div>
  );
}
