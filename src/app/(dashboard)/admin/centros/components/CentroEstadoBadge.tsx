// frontend/src/app/(dashboard)/admin/centros/components/CentroEstadoBadge.tsx
"use client";

import { CheckCircle, XCircle, AlertCircle, Ban, Clock } from "lucide-react";

interface CentroEstadoBadgeProps {
  estado: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export default function CentroEstadoBadge({
  estado,
  size = "md",
  showIcon = true,
}: CentroEstadoBadgeProps) {
  const estilos = {
    activo: {
      bg: "bg-green-100",
      text: "text-green-800",
      border: "border-green-200",
      icon: <CheckCircle className="w-3 h-3" />,
      label: "Activo",
    },
    inactivo: {
      bg: "bg-gray-100",
      text: "text-gray-800",
      border: "border-gray-200",
      icon: <XCircle className="w-3 h-3" />,
      label: "Inactivo",
    },
    suspendido: {
      bg: "bg-red-100",
      text: "text-red-800",
      border: "border-red-200",
      icon: <Ban className="w-3 h-3" />,
      label: "Suspendido",
    },
    pendiente: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      border: "border-yellow-200",
      icon: <Clock className="w-3 h-3" />,
      label: "Pendiente",
    },
    bloqueado: {
      bg: "bg-red-100",
      text: "text-red-800",
      border: "border-red-200",
      icon: <AlertCircle className="w-3 h-3" />,
      label: "Bloqueado",
    },
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  const estadoConfig = estilos[estado as keyof typeof estilos] || estilos.inactivo;

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full border ${estadoConfig.bg} ${estadoConfig.text} ${estadoConfig.border} ${sizeClasses[size]}`}
    >
      {showIcon && estadoConfig.icon}
      {estadoConfig.label}
    </span>
  );
}
