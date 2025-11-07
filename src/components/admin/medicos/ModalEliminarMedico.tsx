"use client";

import { X, Trash2, AlertTriangle } from "lucide-react";

interface MedicoPreview {
  usuario: {
    nombre: string;
    apellido_paterno: string;
  };
  numero_registro_medico: string;
}

interface Props {
  isOpen: boolean;
  darkMode: boolean;
  onClose: () => void;
  onConfirm: () => void;
  medico: MedicoPreview | null;
  guardando: boolean;
}

export default function ModalEliminarMedico({
  isOpen,
  darkMode,
  onClose,
  onConfirm,
  medico,
  guardando,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      {/* Fondo */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-md rounded-2xl shadow-2xl border ${
          darkMode
            ? "bg-gray-900 border-gray-700 text-gray-200"
            : "bg-white border-gray-200 text-gray-900"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle
              className={`w-5 h-5 ${
                darkMode ? "text-red-400" : "text-red-600"
              }`}
            />
            <h2
              className={`text-lg font-black ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Eliminar médico
            </h2>
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
        <div className="px-6 py-5 text-sm leading-relaxed">
          {medico ? (
            <>
              <p className="mb-3">
                ¿Seguro que deseas eliminar a{" "}
                <span className="font-bold">
                  Dr. {medico.usuario.nombre} {medico.usuario.apellido_paterno}
                </span>
                ?
              </p>
              <p
                className={`text-xs ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Registro Médico:{" "}
                <span className="font-mono">
                  {medico.numero_registro_medico}
                </span>
              </p>
              <p
                className={`text-xs mt-4 ${
                  darkMode ? "text-red-400" : "text-red-600"
                }`}
              >
                Esta acción no se puede deshacer.
              </p>
            </>
          ) : (
            <p>No hay médico seleccionado.</p>
          )}
        </div>

        {/* Footer */}
        <div
          className={`flex items-center justify-end gap-3 px-6 py-4 border-t ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <button
            onClick={onClose}
            disabled={guardando}
            className={`px-4 py-2 rounded-xl font-semibold text-sm ${
              darkMode
                ? "bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Cancelar
          </button>

          <button
            onClick={onConfirm}
            disabled={guardando}
            className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg ${
              darkMode
                ? "bg-red-600 hover:bg-red-500 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Trash2 className="w-4 h-4" />
            {guardando ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
