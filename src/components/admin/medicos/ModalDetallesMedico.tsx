"use client";

import Image from "next/image";
import { X, Building2, Star, Video, Users, ClipboardList } from "lucide-react";

interface MedicoDetalle {
  usuario: {
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string | null;
    email: string;
    telefono: string | null;
    celular: string | null;
    foto_perfil_url: string | null;
    rut: string;
  };
  numero_registro_medico: string;
  estado: string;
  especialidades: Array<{
    id_especialidad: number;
    nombre: string;
    es_principal: boolean;
  }>;
  centro_principal: {
    nombre: string;
    ciudad: string;
    region: string;
  };
  acepta_nuevos_pacientes: boolean;
  consulta_telemedicina: boolean;
  total_pacientes: number;
  consultas_mes_actual: number;
  calificacion_promedio: number;
  total_resenas: number;
  biografia: string | null;
}

interface Props {
  isOpen: boolean;
  darkMode: boolean;
  medico: MedicoDetalle | null;
  onClose: () => void;
  obtenerColorEstado: (estado: string) => string;
  obtenerIconoEstado: (estado: string) => JSX.Element;
}

export default function ModalDetallesMedico({
  isOpen,
  darkMode,
  medico,
  onClose,
  obtenerColorEstado,
  obtenerIconoEstado,
}: Props) {
  if (!isOpen || !medico) return null;

  const nombreCompleto = `Dr. ${medico.usuario.nombre} ${medico.usuario.apellido_paterno}`;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      {/* Fondo */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border ${
          darkMode
            ? "bg-gray-900 border-gray-700 text-gray-200"
            : "bg-white border-gray-200 text-gray-900"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-start justify-between px-6 py-4 border-b ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-xl shadow-lg">
                {medico.usuario.foto_perfil_url ? (
                  <Image
                    src={medico.usuario.foto_perfil_url}
                    alt={medico.usuario.nombre}
                    width={56}
                    height={56}
                    className="rounded-xl object-cover"
                  />
                ) : (
                  `${medico.usuario.nombre[0]}${medico.usuario.apellido_paterno[0]}`
                )}
              </div>

              {/* chip estado */}
              <div
                className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${obtenerColorEstado(
                  medico.estado
                )} border-2 ${
                  darkMode ? "border-gray-900" : "border-white"
                }`}
              >
                {obtenerIconoEstado(medico.estado)}
              </div>
            </div>

            <div>
              <div
                className={`text-lg font-black leading-tight ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {nombreCompleto}
              </div>

              <div
                className={`text-xs font-semibold ${
                  darkMode ? "text-indigo-400" : "text-indigo-600"
                }`}
              >
                {medico.especialidades
                  .map((e) => e.nombre + (e.es_principal ? " (Principal)" : ""))
                  .join(" • ")}
              </div>

              <div
                className={`text-[11px] mt-1 font-mono ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Registro: {medico.numero_registro_medico}
              </div>

              <div
                className={`text-[11px] font-mono ${
                  darkMode ? "text-gray-500" : "text-gray-400"
                }`}
              >
                RUT: {medico.usuario.rut}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl ${
              darkMode
                ? "hover:bg-gray-800 text-gray-400 hover:text-white"
                : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-6 text-sm leading-relaxed">
          {/* Centro / contacto */}
          <section
            className={`rounded-xl p-4 border ${
              darkMode
                ? "bg-gray-800/50 border-gray-700"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Centro */}
              <div>
                <div className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wide">
                  <Building2
                    className={`w-4 h-4 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                  <span
                    className={
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }
                  >
                    Centro principal
                  </span>
                </div>
                <div className="mt-1 text-sm font-bold">
                  {medico.centro_principal.nombre}
                </div>
                <div
                  className={`text-xs ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {medico.centro_principal.ciudad},{" "}
                  {medico.centro_principal.region}
                </div>
              </div>

              {/* Contacto */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide mb-1">
                  Contacto
                </div>
                <div className="text-xs">
                  <div
                    className={
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }
                  >
                    {medico.usuario.email}
                  </div>
                  {medico.usuario.telefono && (
                    <div
                      className={`${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Tel: {medico.usuario.telefono}
                    </div>
                  )}
                  {medico.usuario.celular && (
                    <div
                      className={`${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Cel: {medico.usuario.celular}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Métricas */}
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div
              className={`rounded-xl p-4 border text-center ${
                darkMode
                  ? "bg-gray-800/50 border-gray-700"
                  : "bg-white border-gray-200 shadow-sm"
              }`}
            >
              <div className="flex justify-center mb-1">
                <Users
                  className={`w-4 h-4 ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                />
              </div>
              <div
                className={`text-xl font-black ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {medico.total_pacientes}
              </div>
              <div
                className={`text-[11px] font-semibold uppercase tracking-wide ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Pacientes
              </div>
            </div>

            <div
              className={`rounded-xl p-4 border text-center ${
                darkMode
                  ? "bg-gray-800/50 border-gray-700"
                  : "bg-white border-gray-200 shadow-sm"
              }`}
            >
              <div className="flex justify-center mb-1">
                <ClipboardList
                  className={`w-4 h-4 ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                />
              </div>
              <div
                className={`text-xl font-black ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {medico.consultas_mes_actual}
              </div>
              <div
                className={`text-[11px] font-semibold uppercase tracking-wide ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Consultas / mes
              </div>
            </div>

            <div
              className={`rounded-xl p-4 border text-center ${
                darkMode
                  ? "bg-gray-800/50 border-gray-700"
                  : "bg-white border-gray-200 shadow-sm"
              }`}
            >
              <div className="flex justify-center mb-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              </div>
              <div
                className={`text-xl font-black ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {medico.calificacion_promedio.toFixed(1)}
              </div>
              <div
                className={`text-[11px] font-semibold uppercase tracking-wide ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {medico.total_resenas} reseñas
              </div>
            </div>

            <div
              className={`rounded-xl p-4 border text-center ${
                darkMode
                  ? "bg-gray-800/50 border-gray-700"
                  : "bg-white border-gray-200 shadow-sm"
              }`}
            >
              <div className="flex justify-center mb-1">
                <Video
                  className={`w-4 h-4 ${
                    medico.consulta_telemedicina
                      ? "text-cyan-400"
                      : darkMode
                      ? "text-gray-600"
                      : "text-gray-400"
                  }`}
                />
              </div>
              <div
                className={`text-xl font-black ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {medico.consulta_telemedicina ? "Sí" : "No"}
              </div>
              <div
                className={`text-[11px] font-semibold uppercase tracking-wide ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Telemedicina
              </div>
            </div>
          </section>

          {/* Etiquetas rápidas */}
          <section className="flex flex-wrap gap-2 text-xs">
            {medico.acepta_nuevos_pacientes && (
              <span
                className={`px-2 py-1 rounded-lg font-bold ${
                  darkMode
                    ? "bg-green-500/20 text-green-400"
                    : "bg-green-100 text-green-700"
                }`}
              >
                Acepta nuevos pacientes
              </span>
            )}

            {medico.consulta_telemedicina && (
              <span
                className={`px-2 py-1 rounded-lg font-bold ${
                  darkMode
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                Telemedicina
              </span>
            )}
          </section>

          {/* Bio */}
          {medico.biografia && (
            <section>
              <h4
                className={`text-xs font-bold uppercase tracking-wide mb-1 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Biografía
              </h4>
              <p
                className={`text-sm leading-relaxed ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {medico.biografia}
              </p>
            </section>
          )}
        </div>

        {/* Footer */}
        <div
          className={`flex items-center justify-end px-6 py-4 border-t ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl font-semibold text-sm ${
              darkMode
                ? "bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
