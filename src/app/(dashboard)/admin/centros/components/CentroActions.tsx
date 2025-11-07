// frontend/src/app/(dashboard)/admin/centros/components/CentroActions.tsx
"use client";

import {
  Eye,
  Edit,
  Trash2,
  Power,
  Ban,
  CheckCircle,
  RefreshCw,
  TrendingUp,
  Users,
  Settings,
  MoreVertical,
} from "lucide-react";
import Link from "next/link";

interface CentroActionsProps {
  centroId: number;
  estado: string;
  onActivar?: () => void;
  onDesactivar?: () => void;
  onSuspender?: () => void;
  onRestaurar?: () => void;
  onEliminar?: () => void;
}

export default function CentroActions({
  centroId,
  estado,
  onActivar,
  onDesactivar,
  onSuspender,
  onRestaurar,
  onEliminar,
}: CentroActionsProps) {
  return (
    <div className="relative group">
      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
        <MoreVertical className="w-5 h-5 text-gray-600" />
      </button>

      {/* Dropdown Menu */}
      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 hidden group-hover:block z-50">
        {/* Ver y Editar */}
        <div className="p-1">
          <Link
            href={`/admin/centros/${centroId}`}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 text-gray-700 rounded-lg transition-colors group/item"
          >
            <Eye className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">Ver detalles</span>
          </Link>

          <Link
            href={`/admin/centros/${centroId}/editar`}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-green-50 text-gray-700 rounded-lg transition-colors group/item"
          >
            <Edit className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium">Editar centro</span>
          </Link>

          <Link
            href={`/admin/centros/${centroId}/estadisticas`}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-purple-50 text-gray-700 rounded-lg transition-colors group/item"
          >
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium">Estadísticas</span>
          </Link>
        </div>

        <div className="border-t border-gray-200 my-1"></div>

        {/* Gestión */}
        <div className="p-1">
          <Link
            href={`/admin/centros/${centroId}/usuarios`}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 text-gray-700 rounded-lg transition-colors group/item"
          >
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">Usuarios</span>
          </Link>

          <Link
            href={`/admin/centros/${centroId}/configuracion`}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors group/item"
          >
            <Settings className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium">Configuración</span>
          </Link>
        </div>

        <div className="border-t border-gray-200 my-1"></div>

        {/* Acciones de Estado */}
        <div className="p-1">
          {estado === "activo" && (
            <>
              {onDesactivar && (
                <button
                  onClick={onDesactivar}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors w-full text-left group/item"
                >
                  <Power className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium">Desactivar</span>
                </button>
              )}
              {onSuspender && (
                <button
                  onClick={onSuspender}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors w-full text-left group/item"
                >
                  <Ban className="w-4 h-4" />
                  <span className="text-sm font-medium">Suspender</span>
                </button>
              )}
            </>
          )}

          {estado === "inactivo" && onActivar && (
            <button
              onClick={onActivar}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-green-50 text-green-600 rounded-lg transition-colors w-full text-left group/item"
            >
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Activar centro</span>
            </button>
          )}

          {estado === "suspendido" && onRestaurar && (
            <button
              onClick={onRestaurar}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors w-full text-left group/item"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm font-medium">Restaurar centro</span>
            </button>
          )}
        </div>

        {/* Eliminar */}
        {onEliminar && (
          <>
            <div className="border-t border-gray-200 my-1"></div>
            <div className="p-1">
              <button
                onClick={onEliminar}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors w-full text-left group/item"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-medium">Eliminar centro</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
