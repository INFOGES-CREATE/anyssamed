// frontend/src/app/(dashboard)/admin/centros/components/CentroCard.tsx
"use client";

import Link from "next/link";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Users,
  Stethoscope,
  UserCheck,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Power,
  Ban,
  CheckCircle,
  TrendingUp,
} from "lucide-react";

interface CentroCardProps {
  centro: {
    id_centro: number;
    nombre: string;
    razon_social: string;
    ciudad: string;
    region: string;
    telefono: string;
    email: string;
    estado: string;
    plan: string;
    usuarios_count: number;
    medicos_count: number;
    pacientes_count: number;
    consultas_mes: number;
    capacidad_pacientes_dia: number;
    fecha_creacion: string;
  };
  onActivar?: (id: number) => void;
  onSuspender?: (id: number) => void;
  onEliminar?: (id: number) => void;
}

export default function CentroCard({ centro, onActivar, onSuspender, onEliminar }: CentroCardProps) {
  const EstadoBadge = ({ estado }: { estado: string }) => {
    const estilos = {
      activo: "bg-green-100 text-green-800 border-green-200",
      inactivo: "bg-gray-100 text-gray-800 border-gray-200",
      suspendido: "bg-red-100 text-red-800 border-red-200",
    };

    const iconos = {
      activo: <CheckCircle className="w-3 h-3" />,
      inactivo: <Power className="w-3 h-3" />,
      suspendido: <Ban className="w-3 h-3" />,
    };

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${
          estilos[estado as keyof typeof estilos]
        }`}
      >
        {iconos[estado as keyof typeof iconos]}
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </span>
    );
  };

  const PlanBadge = ({ plan }: { plan: string }) => {
    const estilos = {
      basico: "bg-blue-100 text-blue-800 border-blue-200",
      profesional: "bg-purple-100 text-purple-800 border-purple-200",
      enterprise: "bg-orange-100 text-orange-800 border-orange-200",
      premium: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-orange-300",
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-1 text-xs font-bold rounded-full border ${
          estilos[plan as keyof typeof estilos]
        }`}
      >
        {plan === "premium" && "⭐ "}
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Header con Gradiente */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1 line-clamp-1">{centro.nombre}</h3>
              <p className="text-sm text-blue-100 line-clamp-1">{centro.razon_social}</p>
            </div>

            {/* Menú de Acciones */}
            <div className="relative group/menu">
              <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>

              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 hidden group-hover/menu:block z-20">
                <Link
                  href={`/admin/centros/${centro.id_centro}`}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm first:rounded-t-lg"
                >
                  <Eye className="w-4 h-4" />
                  Ver detalles
                </Link>

                <Link
                  href={`/admin/centros/${centro.id_centro}/editar`}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </Link>

                <Link
                  href={`/admin/centros/${centro.id_centro}/estadisticas`}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm"
                >
                  <TrendingUp className="w-4 h-4" />
                  Estadísticas
                </Link>

                <div className="border-t border-gray-200"></div>

                {centro.estado === "activo" && onSuspender && (
                  <button
                    onClick={() => onSuspender(centro.id_centro)}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 text-sm w-full text-left"
                  >
                    <Ban className="w-4 h-4" />
                    Suspender
                  </button>
                )}

                {centro.estado !== "activo" && onActivar && (
                  <button
                    onClick={() => onActivar(centro.id_centro)}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-green-50 text-green-600 text-sm w-full text-left"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Activar
                  </button>
                )}

                {onEliminar && (
                  <>
                    <div className="border-t border-gray-200"></div>
                    <button
                      onClick={() => onEliminar(centro.id_centro)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 text-sm w-full text-left last:rounded-b-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="flex gap-2">
            <EstadoBadge estado={centro.estado} />
            <PlanBadge plan={centro.plan} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        {/* Información de Contacto */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="line-clamp-1">
              {centro.ciudad}, {centro.region}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span>{centro.telefono}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="line-clamp-1">{centro.email}</span>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="group/stat hover:scale-105 transition-transform">
              <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                <Users className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold text-gray-900">{centro.usuarios_count}</p>
              <p className="text-xs text-gray-600">Usuarios</p>
            </div>
            <div className="group/stat hover:scale-105 transition-transform">
              <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                <Stethoscope className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold text-gray-900">{centro.medicos_count}</p>
              <p className="text-xs text-gray-600">Médicos</p>
            </div>
            <div className="group/stat hover:scale-105 transition-transform">
              <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                <UserCheck className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold text-gray-900">{centro.pacientes_count}</p>
              <p className="text-xs text-gray-600">Pacientes</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Consultas este mes:</span>
              <span className="font-bold text-blue-600">{centro.consultas_mes}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-600">Capacidad diaria:</span>
              <span className="font-bold text-green-600">{centro.capacidad_pacientes_dia}</span>
            </div>
          </div>
        </div>

        {/* Botón de Acción Principal */}
        <Link
          href={`/admin/centros/${centro.id_centro}`}
          className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center justify-center gap-2 font-medium transition-all duration-300 group-hover:shadow-lg"
        >
          <Eye className="w-4 h-4" />
          Ver Centro Completo
        </Link>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Creado: {new Date(centro.fecha_creacion).toLocaleDateString("es-CL")}</span>
          <span className="text-green-600 font-medium">● Activo</span>
        </div>
      </div>
    </div>
  );
}
