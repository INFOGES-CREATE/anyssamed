"use client";

import { Dispatch, SetStateAction } from "react";
import { X, Save, User } from "lucide-react";

interface Especialidad {
  id_especialidad: number;
  nombre: string;
}

interface CentroMedico {
  id_centro: number;
  nombre: string;
}

interface FormularioMedico {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  rut: string;
  email: string;
  telefono: string;
  celular: string;
  fecha_nacimiento: string;
  genero: string;

  numero_registro_medico: string;
  titulo_profesional: string;
  universidad: string;
  ano_graduacion: number;
  biografia: string;
  id_centro_principal: number;
  especialidades: number[];
  especialidad_principal: number;
  anos_experiencia: { [key: number]: number };

  acepta_nuevos_pacientes: boolean;
  atiende_particular: boolean;
  atiende_fonasa: boolean;
  atiende_isapre: boolean;
  consulta_presencial: boolean;
  consulta_telemedicina: boolean;
  duracion_consulta_min: number;
  fecha_inicio_actividad: string;
  estado: string;
}

interface MedicoSeleccionadoPreview {
  usuario: {
    nombre: string;
    apellido_paterno: string;
    rut: string;
  };
  numero_registro_medico: string;
}

interface Props {
  isOpen: boolean;
  darkMode: boolean;
  medicoSeleccionado: MedicoSeleccionadoPreview | null;
  onClose: () => void;
  onUpdate: () => void;
  formulario: FormularioMedico;
  setFormulario: Dispatch<SetStateAction<FormularioMedico>>;
  errores: { [key: string]: string };
  guardando: boolean;
  especialidades: Especialidad[];
  centros: CentroMedico[];
}

export default function ModalEditarMedico({
  isOpen,
  darkMode,
  medicoSeleccionado,
  onClose,
  onUpdate,
  formulario,
  setFormulario,
  errores,
  guardando,
  especialidades,
  centros,
}: Props) {
  if (!isOpen) return null;

  const setField = (field: keyof FormularioMedico, value: any) => {
    setFormulario((prev) => ({ ...prev, [field]: value }));
  };

  const handleEspecialidadesChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const values = Array.from(e.target.selectedOptions).map((o) =>
      Number(o.value)
    );
    setField("especialidades", values);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      {/* Fondo oscuro */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Contenido modal */}
      <div
        className={`relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border ${
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
          <div>
            <h2
              className={`text-xl font-black ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Editar Médico
            </h2>
            <p
              className={`text-sm font-medium ${
                darkMode ? "text-indigo-400" : "text-indigo-600"
              }`}
            >
              Actualiza la información existente
            </p>
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

        {/* Preview del médico */}
        {medicoSeleccionado && (
          <div
            className={`px-6 py-4 flex items-start gap-3 border-b ${
              darkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div
              className={`w-10 h-10 flex-shrink-0 rounded-lg flex items-center justify-center font-bold text-white bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg`}
            >
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="text-sm">
              <div
                className={`font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Dr. {medicoSeleccionado.usuario.nombre}{" "}
                {medicoSeleccionado.usuario.apellido_paterno}
              </div>
              <div
                className={`${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                RUT: {medicoSeleccionado.usuario.rut}
              </div>
              <div
                className={`text-xs font-mono ${
                  darkMode ? "text-indigo-400" : "text-indigo-600"
                }`}
              >
                Registro: {medicoSeleccionado.numero_registro_medico}
              </div>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-4 space-y-6">
          {/* Datos personales */}
          <section>
            <h3
              className={`text-sm font-bold uppercase tracking-wide mb-3 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Datos personales
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <label className="text-xs font-semibold block mb-1">
                  Nombre *
                </label>
                <input
                  className={`w-full rounded-xl border px-3 py-2 text-sm ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  value={formulario.nombre}
                  onChange={(e) => setField("nombre", e.target.value)}
                />
                {errores.nombre && (
                  <p className="text-red-500 text-xs mt-1">
                    {errores.nombre}
                  </p>
                )}
              </div>

              {/* Apellido paterno */}
              <div>
                <label className="text-xs font-semibold block mb-1">
                  Apellido paterno *
                </label>
                <input
                  className={`w-full rounded-xl border px-3 py-2 text-sm ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  value={formulario.apellido_paterno}
                  onChange={(e) =>
                    setField("apellido_paterno", e.target.value)
                  }
                />
                {errores.apellido_paterno && (
                  <p className="text-red-500 text-xs mt-1">
                    {errores.apellido_paterno}
                  </p>
                )}
              </div>

              {/* Apellido materno */}
              <div>
                <label className="text-xs font-semibold block mb-1">
                  Apellido materno
                </label>
                <input
                  className={`w-full rounded-xl border px-3 py-2 text-sm ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  value={formulario.apellido_materno}
                  onChange={(e) =>
                    setField("apellido_materno", e.target.value)
                  }
                />
              </div>

              {/* RUT */}
              <div>
                <label className="text-xs font-semibold block mb-1">
                  RUT *
                </label>
                <input
                  className={`w-full rounded-xl border px-3 py-2 text-sm ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  value={formulario.rut}
                  onChange={(e) => setField("rut", e.target.value)}
                />
                {errores.rut && (
                  <p className="text-red-500 text-xs mt-1">
                    {errores.rut}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-semibold block mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  className={`w-full rounded-xl border px-3 py-2 text-sm ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  value={formulario.email}
                  onChange={(e) => setField("email", e.target.value)}
                />
                {errores.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errores.email}
                  </p>
                )}
              </div>

              {/* Teléfono */}
              <div>
                <label className="text-xs font-semibold block mb-1">
                  Teléfono
                </label>
                <input
                  className={`w-full rounded-xl border px-3 py-2 text-sm ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  value={formulario.telefono}
                  onChange={(e) => setField("telefono", e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Info profesional */}
          <section>
            <h3
              className={`text-sm font-bold uppercase tracking-wide mb-3 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Información profesional
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Registro médico */}
              <div>
                <label className="text-xs font-semibold block mb-1">
                  Nº Registro Médico *
                </label>
                <input
                  className={`w-full rounded-xl border px-3 py-2 text-sm ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  value={formulario.numero_registro_medico}
                  onChange={(e) =>
                    setField("numero_registro_medico", e.target.value)
                  }
                />
                {errores.numero_registro_medico && (
                  <p className="text-red-500 text-xs mt-1">
                    {errores.numero_registro_medico}
                  </p>
                )}
              </div>

              {/* Título */}
              <div>
                <label className="text-xs font-semibold block mb-1">
                  Título profesional *
                </label>
                <input
                  className={`w-full rounded-xl border px-3 py-2 text-sm ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  value={formulario.titulo_profesional}
                  onChange={(e) =>
                    setField("titulo_profesional", e.target.value)
                  }
                />
                {errores.titulo_profesional && (
                  <p className="text-red-500 text-xs mt-1">
                    {errores.titulo_profesional}
                  </p>
                )}
              </div>

              {/* Universidad */}
              <div>
                <label className="text-xs font-semibold block mb-1">
                  Universidad *
                </label>
                <input
                  className={`w-full rounded-xl border px-3 py-2 text-sm ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  value={formulario.universidad}
                  onChange={(e) => setField("universidad", e.target.value)}
                />
                {errores.universidad && (
                  <p className="text-red-500 text-xs mt-1">
                    {errores.universidad}
                  </p>
                )}
              </div>

              {/* Año graduación */}
              <div>
                <label className="text-xs font-semibold block mb-1">
                  Año graduación
                </label>
                <input
                  type="number"
                  className={`w-full rounded-xl border px-3 py-2 text-sm ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  value={formulario.ano_graduacion}
                  onChange={(e) =>
                    setField("ano_graduacion", Number(e.target.value))
                  }
                />
              </div>

              {/* Bio */}
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold block mb-1">
                  Biografía / Resumen profesional
                </label>
                <textarea
                  rows={3}
                  className={`w-full rounded-xl border px-3 py-2 text-sm ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  value={formulario.biografia}
                  onChange={(e) => setField("biografia", e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Asignación */}
          <section>
            <h3
              className={`text-sm font-bold uppercase tracking-wide mb-3 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Asignación clínica
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Centro */}
              <div>
                <label className="text-xs font-semibold block mb-1">
                  Centro principal *
                </label>
                <select
                  className={`w-full rounded-xl border px-3 py-2 text-sm ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  value={formulario.id_centro_principal || ""}
                  onChange={(e) =>
                    setField("id_centro_principal", Number(e.target.value))
                  }
                >
                  <option value="">Seleccione...</option>
                  {centros.map((c) => (
                    <option key={c.id_centro} value={c.id_centro}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
                {errores.id_centro_principal && (
                  <p className="text-red-500 text-xs mt-1">
                    {errores.id_centro_principal}
                  </p>
                )}
              </div>

              {/* Estado */}
              <div>
                <label className="text-xs font-semibold block mb-1">
                  Estado
                </label>
                <select
                  className={`w-full rounded-xl border px-3 py-2 text-sm ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  value={formulario.estado}
                  onChange={(e) => setField("estado", e.target.value)}
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="vacaciones">Vacaciones</option>
                  <option value="suspendido">Suspendido</option>
                </select>
              </div>

              {/* Especialidades */}
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold block mb-1">
                  Especialidades (múltiple) *
                </label>
                <select
                  multiple
                  className={`w-full rounded-xl border px-3 py-2 text-sm h-28 ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  value={formulario.especialidades.map(String)}
                  onChange={handleEspecialidadesChange}
                >
                  {especialidades.map((esp) => (
                    <option
                      key={esp.id_especialidad}
                      value={esp.id_especialidad}
                    >
                      {esp.nombre}
                    </option>
                  ))}
                </select>
                {errores.especialidades && (
                  <p className="text-red-500 text-xs mt-1">
                    {errores.especialidades}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Modalidad */}
          <section>
            <h3
              className={`text-sm font-bold uppercase tracking-wide mb-3 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Disponibilidad / Modalidad
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formulario.acepta_nuevos_pacientes}
                  onChange={(e) =>
                    setField("acepta_nuevos_pacientes", e.target.checked)
                  }
                />
                <span>Acepta nuevos pacientes</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formulario.consulta_telemedicina}
                  onChange={(e) =>
                    setField("consulta_telemedicina", e.target.checked)
                  }
                />
                <span>Telemedicina</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formulario.atiende_fonasa}
                  onChange={(e) =>
                    setField("atiende_fonasa", e.target.checked)
                  }
                />
                <span>FONASA</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formulario.atiende_isapre}
                  onChange={(e) =>
                    setField("atiende_isapre", e.target.checked)
                  }
                />
                <span>ISAPRE</span>
              </label>
            </div>
          </section>
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
            onClick={onUpdate}
            disabled={guardando}
            className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg ${
              darkMode
                ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Save className="w-4 h-4" />
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
