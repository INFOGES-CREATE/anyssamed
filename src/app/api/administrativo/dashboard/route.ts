// app/api/administrativo/dashboard/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export const runtime = "nodejs";

// ========================================
// TIPOS
// ========================================

interface AdministrativoData {
  id_administrativo: number;
  id_usuario: number;
  id_centro: number;
  id_sucursal: number | null;
  id_departamento: number | null;
  cargo: string;
  extension_telefonica: string | null;
  nivel_acceso: "basico" | "intermedio" | "avanzado" | "administrador";
  estado: "activo" | "inactivo" | "suspendido" | "vacaciones";
  jornada: "completa" | "media" | "parcial";
  supervisor_id: number | null;
  fecha_inicio: string;
  fecha_termino: string | null;
}

interface EstadisticasAdmin {
  // PACIENTES
  total_pacientes: number;
  pacientes_activos: number;
  pacientes_nuevos_mes: number;
  pacientes_nuevos_semana: number;
  pacientes_por_atender_hoy: number;

  // CITAS
  total_citas_mes: number;
  citas_programadas_hoy: number;
  citas_confirmadas_hoy: number;
  citas_completadas_hoy: number;
  citas_canceladas_mes: number;
  citas_no_asistencia_mes: number;
  tasa_confirmacion_mes: number;
  tasa_no_asistencia: number;

  // MÉDICOS
  total_medicos: number;
  medicos_activos: number;
  medicos_disponibles_ahora: number;
  medicos_en_consulta: number;
  carga_promedio_medicos: number;

  // FACTURACIÓN
  total_facturado_mes: number;
  total_cobrado_mes: number;
  total_pendiente_cobro: number;
  numero_facturas_mes: number;
  facturas_pagadas: number;
  facturas_pendientes: number;
  tasa_cobranza: number;
  ingresos_hoy: number;

  // FARMACIA
  total_medicamentos: number;
  medicamentos_bajo_stock: number;
  medicamentos_vencidos: number;
  medicamentos_proximos_vencer: number;
  valor_inventario_total: number;
  transacciones_farmacia_mes: number;

  // EXÁMENES
  total_examenes_mes: number;
  examenes_pendientes: number;
  examenes_completados_mes: number;
  examenes_pendientes_resultado: number;

  // EMPLEADOS
  total_empleados: number;
  empleados_activos: number;
  empleados_en_vacaciones: number;
  empleados_suspendidos: number;

  // INFRAESTRUCTURA
  ocupacion_camas: number | null;
  salas_disponibles: number;
  salas_ocupadas: number;

  // COMUNICACIÓN
  llamadas_realizadas_hoy: number;
  mensajes_sin_leer: number;
  notificaciones_pendientes: number;
}

interface Factura {
  id_factura: number;
  numero_factura: string;
  fecha_emision: string;
  estado:
    | "emitida"
    | "pagada"
    | "anulada"
    | "vencida"
    | "parcial"
    | "en_revision"
    | "pendiente";
  subtotal: number;
  impuestos: number;
  total: number;
  pagado: number;
  saldo: number;
  dias_vencimiento: number;
  paciente: {
    id_paciente: number;
    nombre_completo: string;
    rut: string;
    email: string;
  };
  medico: {
    id_medico: number;
    nombre_completo: string;
  };
}

interface Medicamento {
  id_medicamento: number;
  nombre_generico: string;
  nombre_comercial: string | null;
  forma_farmaceutica: string;
  concentracion: string;
  stock_actual: number;
  stock_minimo: number;
  precio_unitario: number;
  valor_total: number;
  fecha_vencimiento: string;
  lote: string;
  proveedor: string;
  estado:
    | "disponible"
    | "bajo_stock"
    | "agotado"
    | "proximo_vencer"
    | "vencido";
}

interface Examen {
  id_examen: number;
  nombre_examen: string;
  tipo_examen: "laboratorio" | "imagenologia" | "procedimiento" | "otros";
  paciente: {
    id_paciente: number;
    nombre_completo: string;
  };
  medico: {
    id_medico: number;
    nombre_completo: string;
  };
  fecha_solicitud: string;
  estado_resultado:
    | "pendiente"
    | "en_proceso"
    | "listo"
    | "entregado"
    | "anulado";
}

interface Empleado {
  id_usuario: number;
  nombre_completo: string;
  cargo: string;
  departamento: string;
  estado: "activo" | "inactivo" | "suspendido" | "vacaciones";
  email: string;
  telefono: string;
  fecha_contratacion: string;
  jornada: "completa" | "media" | "parcial";
}

interface CentroMedicoInfo {
  id_centro: number;
  nombre: string;
  ciudad: string;
  region: string;
  rut: string;
  razon_social: string;
  telefono_principal: string;
  email_contacto: string;
  sitio_web: string | null;
  logo_url: string | null;
  especializacion_principal: string | null;
  nivel_complejidad: "baja" | "media" | "alta";
  capacidad_pacientes_dia: number | null;
  estado: "activo" | "inactivo" | "suspendido";
  plan: "basico" | "profesional" | "enterprise";
}

interface AlertaAdmin {
  id_alerta: number;
  tipo: "critica" | "alta" | "media" | "baja";
  titulo: string;
  descripcion: string;
  fecha_hora: string;
  leida: boolean;
  accion_requerida: string | null;
  url_accion?: string;
}

interface MetricaFinanciera {
  nombre: string;
  valor_actual: number;
  valor_anterior: number;
  unidad: string;
  tendencia: "up" | "down" | "neutral";
  porcentaje_cambio: number;
  icono: string;
  color: string;
}

// ========================================
// CONSTANTES
// ========================================

const SESSION_COOKIE_CANDIDATES = [
  "session",
  "session_token",
  "medisalud_session",
  "auth_session",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

// ========================================
// FUNCIONES AUXILIARES
// ========================================

function getSessionToken(request: NextRequest): string | null {
  const cookieHeader = request.headers.get("cookie") || "";

  if (cookieHeader) {
    const cookies = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .filter(Boolean)
      .reduce((acc, c) => {
        const [k, ...rest] = c.split("=");
        acc[k] = rest.join("=");
        return acc;
      }, {} as Record<string, string>);

    for (const name of SESSION_COOKIE_CANDIDATES) {
      if (cookies[name]) {
        return decodeURIComponent(cookies[name]);
      }
    }
  }

  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    return auth.slice(7);
  }

  return null;
}

async function obtenerAdministrativoAutenticado(
  idUsuario: number
): Promise<AdministrativoData | null> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        a.id_administrativo,
        a.id_usuario,
        a.id_centro,
        a.id_sucursal,
        a.id_departamento,
        a.cargo,
        a.extension_telefonica,
        a.nivel_acceso,
        a.estado,
        a.jornada,
        a.supervisor_id,
        a.fecha_inicio,
        a.fecha_termino
      FROM administrativos a
      WHERE a.id_usuario = ? AND a.estado IN ('activo', 'suspendido')
      LIMIT 1
      `,
      [idUsuario]
    );

    return rows.length > 0 ? (rows[0] as AdministrativoData) : null;
  } catch (error) {
    console.error("Error al obtener administrativo:", error);
    throw error;
  }
}

async function obtenerCentroMedico(
  idCentro: number
): Promise<CentroMedicoInfo | null> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        cm.id_centro,
        cm.nombre,
        cm.ciudad,
        cm.region,
        cm.rut,
        cm.razon_social,
        cm.telefono_principal,
        cm.email_contacto,
        cm.sitio_web,
        cm.logo_url,
        cm.especializacion_principal,
        cm.nivel_complejidad,
        cm.capacidad_pacientes_dia,
        cm.estado,
        cm.plan
      FROM centros_medicos cm
      WHERE cm.id_centro = ? AND cm.estado = 'activo'
      LIMIT 1
      `,
      [idCentro]
    );

    return rows.length > 0 ? (rows[0] as CentroMedicoInfo) : null;
  } catch (error) {
    console.error("Error al obtener centro médico:", error);
    throw error;
  }
}

// ========================================
// ESTADÍSTICAS PRINCIPALES
// ========================================

async function obtenerEstadisticas(
  idCentro: number
): Promise<EstadisticasAdmin> {
  try {
    const now = new Date();
    const hoy = now.toISOString().split("T")[0];

    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];

    const inicioSemanaDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - now.getDay()
    );
    const inicioSemana = inicioSemanaDate.toISOString().split("T")[0];

    const [
      // PACIENTES
      [rowsPacTotal],
      [rowsPacActivos],
      [rowsPacNuevosMes],
      [rowsPacNuevosSemana],
      [rowsCitasHoy],

      // CITAS
      [rowsCitasMes],
      [rowsCitasCompletadasHoy],
      [rowsCitasConfirmadasHoy],
      [rowsCancelacionesMes],
      [rowsNoAsistenciaMes],

      // MÉDICOS
      [rowsMedicosTotal],
      [rowsMedicosActivos],

      // FACTURACIÓN
      [rowsFacturacionTotalMes],
      [rowsFacturacionCobradoMes],
      [rowsFacturacionPendiente],
      [rowsFacturasMes],
      [rowsFacturasPagadasMes],
      [rowsFacturasPendientesMes],

      // FARMACIA
      [rowsMedicamentosTotal],
      [rowsMedicamentosBajoStock],
      [rowsMedicamentosVencidos],
      [rowsMedicamentosProxVencer],
      [rowsValorInventario],
      [rowsTransaccionesFarmaciaMes],

      // EXÁMENES
      [rowsExamenesMes],
      [rowsExamenesPendientes],
      [rowsExamenesCompletadosMes],

      // EMPLEADOS
      [rowsUsuariosTotal],
      [rowsUsuariosActivos],
      [rowsAdminVacaciones],
      [rowsAdminSuspendidos],

      // INFRAESTRUCTURA
      [rowsSalasDisponibles],
      [rowsSalasOcupadas],

      // COMUNICACIÓN
      [rowsLlamadasHoy],
      [rowsMensajesSinLeer],

      // INGRESOS HOY
      [rowsIngresosHoy],
    ] = await Promise.all([
      // PACIENTES
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(DISTINCT id_paciente) AS total 
         FROM pacientes 
         WHERE id_centro = ?`,
        [idCentro]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(DISTINCT id_paciente) AS total 
         FROM pacientes 
         WHERE id_centro = ? AND estado = 'activo'`,
        [idCentro]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(DISTINCT id_paciente) AS total 
         FROM pacientes 
         WHERE id_centro = ? AND DATE(fecha_creacion) >= ?`,
        [idCentro, inicioMes]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(DISTINCT id_paciente) AS total 
         FROM pacientes 
         WHERE id_centro = ? AND DATE(fecha_creacion) >= ?`,
        [idCentro, inicioSemana]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total 
         FROM citas 
         WHERE id_centro = ? AND DATE(fecha_hora_inicio) = ?`,
        [idCentro, hoy]
      ),

      // CITAS
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total 
         FROM citas 
         WHERE id_centro = ? AND DATE(fecha_hora_inicio) >= ?`,
        [idCentro, inicioMes]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total 
         FROM citas 
         WHERE id_centro = ? AND DATE(fecha_hora_inicio) = ? 
           AND estado = 'completada'`,
        [idCentro, hoy]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total 
         FROM citas 
         WHERE id_centro = ? AND DATE(fecha_hora_inicio) = ? 
           AND confirmado_por_paciente = 1`,
        [idCentro, hoy]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total 
         FROM cancelaciones 
         WHERE id_centro = ? AND DATE(fecha_cancelacion) >= ?`,
        [idCentro, inicioMes]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total 
         FROM citas 
         WHERE id_centro = ? 
           AND estado = 'no_asistio' 
           AND DATE(fecha_hora_inicio) >= ?`,
        [idCentro, inicioMes]
      ),

      // MÉDICOS
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total 
         FROM profesionales_salud 
         WHERE id_centro = ?`,
        [idCentro]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total 
         FROM profesionales_salud 
         WHERE id_centro = ? AND estado = 'activo'`,
        [idCentro]
      ),

      // FACTURACIÓN
      pool.query<RowDataPacket[]>(
        `SELECT COALESCE(SUM(total), 0) AS total 
         FROM facturacion 
         WHERE id_centro = ? AND DATE(fecha_emision) >= ?`,
        [idCentro, inicioMes]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COALESCE(SUM(pagado), 0) AS total 
         FROM facturacion 
         WHERE id_centro = ? AND DATE(fecha_emision) >= ?`,
        [idCentro, inicioMes]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COALESCE(SUM(total - pagado), 0) AS total 
         FROM facturacion 
         WHERE id_centro = ? 
           AND estado IN ('pendiente', 'parcial', 'vencida')`,
        [idCentro]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total 
         FROM facturacion 
         WHERE id_centro = ? AND DATE(fecha_emision) >= ?`,
        [idCentro, inicioMes]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total 
         FROM facturacion 
         WHERE id_centro = ? 
           AND estado = 'pagada' 
           AND DATE(fecha_emision) >= ?`,
        [idCentro, inicioMes]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total 
         FROM facturacion 
         WHERE id_centro = ? 
           AND estado IN ('pendiente', 'parcial', 'vencida') 
           AND DATE(fecha_emision) >= ?`,
        [idCentro, inicioMes]
      ),

      // FARMACIA
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total 
         FROM medicamentos 
         WHERE id_centro = ?`,
        [idCentro]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total 
         FROM medicamentos 
         WHERE id_centro = ? AND stock_actual < stock_minimo`,
        [idCentro]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total 
         FROM medicamentos 
         WHERE id_centro = ? AND fecha_vencimiento < CURDATE()`,
        [idCentro]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total 
         FROM medicamentos 
         WHERE id_centro = ? 
           AND fecha_vencimiento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)`,
        [idCentro]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COALESCE(SUM(stock_actual * precio_unitario), 0) AS total 
         FROM medicamentos 
         WHERE id_centro = ?`,
        [idCentro]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total 
         FROM farmacia_transacciones 
         WHERE id_centro = ? AND DATE(fecha_transaccion) >= ?`,
        [idCentro, inicioMes]
      ),

      // EXÁMENES
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total 
         FROM examenes_medicos 
         WHERE id_centro = ? AND DATE(fecha_solicitud) >= ?`,
        [idCentro, inicioMes]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total 
         FROM examenes_medicos 
         WHERE id_centro = ? AND estado_resultado = 'pendiente'`,
        [idCentro]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total 
         FROM examenes_medicos 
         WHERE id_centro = ? 
           AND estado_resultado = 'listo' 
           AND DATE(fecha_solicitud) >= ?`,
        [idCentro, inicioMes]
      ),

      // EMPLEADOS
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total 
         FROM usuarios 
         WHERE id_centro_principal = ?`,
        [idCentro]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total 
         FROM usuarios 
         WHERE id_centro_principal = ? AND estado = 'activo'`,
        [idCentro]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total 
         FROM administrativos 
         WHERE id_centro = ? AND estado = 'vacaciones'`,
        [idCentro]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total 
         FROM administrativos 
         WHERE id_centro = ? AND estado = 'suspendido'`,
        [idCentro]
      ),

      // INFRAESTRUCTURA
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total 
         FROM salas 
         WHERE id_centro = ? AND estado = 'disponible'`,
        [idCentro]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total 
         FROM salas 
         WHERE id_centro = ? AND estado = 'ocupada'`,
        [idCentro]
      ),

      // COMUNICACIÓN
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total 
         FROM registro_llamadas 
         WHERE id_centro = ? AND DATE(fecha_hora) = ?`,
        [idCentro, hoy]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total 
         FROM mensajes_chat 
         WHERE id_centro = ? AND leido = 0`,
        [idCentro]
      ),

      // INGRESOS HOY
      pool.query<RowDataPacket[]>(
        `SELECT COALESCE(SUM(pagado), 0) AS total 
         FROM facturacion 
         WHERE id_centro = ? AND DATE(fecha_emision) = ?`,
        [idCentro, hoy]
      ),
    ]);

    // Helpers para leer valores
    const getTotal = (rows: RowDataPacket[]) =>
      (rows[0]?.total as number | null) ?? 0;

    // PACIENTES
    const total_pacientes = getTotal(rowsPacTotal);
    const pacientes_activos = getTotal(rowsPacActivos);
    const pacientes_nuevos_mes = getTotal(rowsPacNuevosMes);
    const pacientes_nuevos_semana = getTotal(rowsPacNuevosSemana);
    const pacientes_por_atender_hoy = getTotal(rowsCitasHoy);

    // CITAS
    const total_citas_mes = getTotal(rowsCitasMes);
    const citas_programadas_hoy = getTotal(rowsCitasHoy);
    const citas_completadas_hoy = getTotal(rowsCitasCompletadasHoy);
    const citas_confirmadas_hoy = getTotal(rowsCitasConfirmadasHoy);
    const citas_canceladas_mes = getTotal(rowsCancelacionesMes);
    const citas_no_asistencia_mes = getTotal(rowsNoAsistenciaMes);

    // Tasas derivadas de datos reales del mes
    const tasa_confirmacion_mes =
      total_citas_mes > 0
        ? Number(
            (
              ((total_citas_mes -
                citas_canceladas_mes -
                citas_no_asistencia_mes) /
                total_citas_mes) *
              100
            ).toFixed(1)
          )
        : 0;

    const tasa_no_asistencia =
      total_citas_mes > 0
        ? Number(
            ((citas_no_asistencia_mes / total_citas_mes) * 100).toFixed(1)
          )
        : 0;

    // MÉDICOS
    const total_medicos = getTotal(rowsMedicosTotal);
    const medicos_activos = getTotal(rowsMedicosActivos);

    // Carga promedio mensual por médico (citas / médicos)
    const carga_promedio_medicos =
      total_medicos > 0
        ? Number((total_citas_mes / total_medicos).toFixed(1))
        : 0;

    // Estimación consistente de médicos en consulta vs disponibles (sin random)
    const medicos_en_consulta = medicos_activos
      ? Math.min(medicos_activos, Math.round(citas_programadas_hoy / 4)) // ~4 citas/día por médico
      : 0;

    const medicos_disponibles_ahora = Math.max(
      medicos_activos - medicos_en_consulta,
      0
    );

    // FACTURACIÓN
    const total_facturado_mes = getTotal(rowsFacturacionTotalMes);
    const total_cobrado_mes = getTotal(rowsFacturacionCobradoMes);
    const total_pendiente_cobro = getTotal(rowsFacturacionPendiente);
    const numero_facturas_mes = getTotal(rowsFacturasMes);
    const facturas_pagadas = getTotal(rowsFacturasPagadasMes);
    const facturas_pendientes = getTotal(rowsFacturasPendientesMes);

    const tasa_cobranza =
      numero_facturas_mes > 0
        ? Math.round((facturas_pagadas / numero_facturas_mes) * 100)
        : 0;

    const ingresos_hoy = getTotal(rowsIngresosHoy);

    // FARMACIA
    const total_medicamentos = getTotal(rowsMedicamentosTotal);
    const medicamentos_bajo_stock = getTotal(rowsMedicamentosBajoStock);
    const medicamentos_vencidos = getTotal(rowsMedicamentosVencidos);
    const medicamentos_proximos_vencer = getTotal(
      rowsMedicamentosProxVencer
    );
    const valor_inventario_total = getTotal(rowsValorInventario);
    const transacciones_farmacia_mes = getTotal(
      rowsTransaccionesFarmaciaMes
    );

    // EXÁMENES
    const total_examenes_mes = getTotal(rowsExamenesMes);
    const examenes_pendientes = getTotal(rowsExamenesPendientes);
    const examenes_completados_mes = getTotal(rowsExamenesCompletadosMes);
    const examenes_pendientes_resultado = examenes_pendientes;

    // EMPLEADOS
    const total_empleados = getTotal(rowsUsuariosTotal);
    const empleados_activos = getTotal(rowsUsuariosActivos);
    const empleados_en_vacaciones = getTotal(rowsAdminVacaciones);
    const empleados_suspendidos = getTotal(rowsAdminSuspendidos);

    // INFRAESTRUCTURA
    const salas_disponibles = getTotal(rowsSalasDisponibles);
    const salas_ocupadas = getTotal(rowsSalasOcupadas);
    const total_salas = salas_disponibles + salas_ocupadas;

    const ocupacion_camas =
      total_salas > 0
        ? Math.round((salas_ocupadas / total_salas) * 100)
        : null;

    // COMUNICACIÓN
    const llamadas_realizadas_hoy = getTotal(rowsLlamadasHoy);
    const mensajes_sin_leer = getTotal(rowsMensajesSinLeer);

    return {
      // PACIENTES
      total_pacientes,
      pacientes_activos,
      pacientes_nuevos_mes,
      pacientes_nuevos_semana,
      pacientes_por_atender_hoy,

      // CITAS
      total_citas_mes,
      citas_programadas_hoy,
      citas_confirmadas_hoy,
      citas_completadas_hoy,
      citas_canceladas_mes,
      citas_no_asistencia_mes,
      tasa_confirmacion_mes,
      tasa_no_asistencia,

      // MÉDICOS
      total_medicos,
      medicos_activos,
      medicos_disponibles_ahora,
      medicos_en_consulta,
      carga_promedio_medicos,

      // FACTURACIÓN
      total_facturado_mes,
      total_cobrado_mes,
      total_pendiente_cobro,
      numero_facturas_mes,
      facturas_pagadas,
      facturas_pendientes,
      tasa_cobranza,
      ingresos_hoy,

      // FARMACIA
      total_medicamentos,
      medicamentos_bajo_stock,
      medicamentos_vencidos,
      medicamentos_proximos_vencer,
      valor_inventario_total,
      transacciones_farmacia_mes,

      // EXÁMENES
      total_examenes_mes,
      examenes_pendientes,
      examenes_completados_mes,
      examenes_pendientes_resultado,

      // EMPLEADOS
      total_empleados,
      empleados_activos,
      empleados_en_vacaciones,
      empleados_suspendidos,

      // INFRAESTRUCTURA
      ocupacion_camas,
      salas_disponibles,
      salas_ocupadas,

      // COMUNICACIÓN
      llamadas_realizadas_hoy,
      mensajes_sin_leer,
      // se rellena luego con alertas reales
      notificaciones_pendientes: 0,
    };
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    throw error;
  }
}

// ========================================
// LISTADOS PARA TARJETAS Y TABLAS
// ========================================

async function obtenerFacturas(idCentro: number): Promise<Factura[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        f.id_factura,
        f.numero_factura,
        f.fecha_emision,
        f.estado,
        f.subtotal,
        f.impuestos,
        f.total,
        f.pagado,
        (f.total - f.pagado) AS saldo,
        DATEDIFF(DATE_ADD(f.fecha_emision, INTERVAL 30 DAY), CURDATE()) AS dias_vencimiento,

        p.id_paciente,
        CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')) AS nombre_completo,
        p.rut,
        p.email,

        m.id_profesional AS id_medico,
        CONCAT(m.nombre, ' ', m.apellido_paterno) AS medico_nombre
      FROM facturacion f
      INNER JOIN pacientes p ON f.id_paciente = p.id_paciente
      INNER JOIN profesionales_salud m ON f.id_medico = m.id_profesional
      WHERE f.id_centro = ?
      ORDER BY f.fecha_emision DESC
      LIMIT 20
      `,
      [idCentro]
    );

    return rows.map((row) => ({
      id_factura: row.id_factura as number,
      numero_factura: row.numero_factura as string,
      fecha_emision: row.fecha_emision as string,
      estado: row.estado as Factura["estado"],
      subtotal: Number(row.subtotal || 0),
      impuestos: Number(row.impuestos || 0),
      total: Number(row.total || 0),
      pagado: Number(row.pagado || 0),
      saldo: Number(row.saldo || 0),
      dias_vencimiento: Number(row.dias_vencimiento || 0),
      paciente: {
        id_paciente: row.id_paciente as number,
        nombre_completo: row.nombre_completo as string,
        rut: row.rut as string,
        email: row.email as string,
      },
      medico: {
        id_medico: row.id_medico as number,
        nombre_completo: row.medico_nombre as string,
      },
    }));
  } catch (error) {
    console.error("Error al obtener facturas:", error);
    return [];
  }
}

async function obtenerMedicamentos(idCentro: number): Promise<Medicamento[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        id_medicamento,
        nombre_generico,
        nombre_comercial,
        forma_farmaceutica,
        concentracion,
        stock_actual,
        stock_minimo,
        precio_unitario,
        (stock_actual * precio_unitario) AS valor_total,
        fecha_vencimiento,
        lote,
        proveedor,
        CASE 
          WHEN stock_actual = 0 THEN 'agotado'
          WHEN stock_actual < stock_minimo THEN 'bajo_stock'
          WHEN fecha_vencimiento < CURDATE() THEN 'vencido'
          WHEN fecha_vencimiento < DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'proximo_vencer'
          ELSE 'disponible'
        END AS estado
      FROM medicamentos
      WHERE id_centro = ?
      ORDER BY stock_actual ASC
      LIMIT 20
      `,
      [idCentro]
    );

    return rows.map((row) => ({
      id_medicamento: row.id_medicamento as number,
      nombre_generico: row.nombre_generico as string,
      nombre_comercial: row.nombre_comercial as string | null,
      forma_farmaceutica: row.forma_farmaceutica as string,
      concentracion: row.concentracion as string,
      stock_actual: Number(row.stock_actual || 0),
      stock_minimo: Number(row.stock_minimo || 0),
      precio_unitario: Number(row.precio_unitario || 0),
      valor_total: Number(row.valor_total || 0),
      fecha_vencimiento: row.fecha_vencimiento as string,
      lote: row.lote as string,
      proveedor: row.proveedor as string,
      estado: row.estado as Medicamento["estado"],
    }));
  } catch (error) {
    console.error("Error al obtener medicamentos:", error);
    return [];
  }
}

async function obtenerExamenes(idCentro: number): Promise<Examen[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        e.id_examen,
        e.nombre_examen,
        e.tipo_examen,
        e.fecha_solicitud,
        e.estado_resultado,

        p.id_paciente,
        CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')) AS nombre_completo,

        m.id_profesional AS id_medico,
        CONCAT(m.nombre, ' ', m.apellido_paterno) AS medico_nombre
      FROM examenes_medicos e
      INNER JOIN pacientes p ON e.id_paciente = p.id_paciente
      INNER JOIN profesionales_salud m ON e.id_medico = m.id_profesional
      WHERE e.id_centro = ?
      ORDER BY e.fecha_solicitud DESC
      LIMIT 20
      `,
      [idCentro]
    );

    return rows.map((row) => ({
      id_examen: row.id_examen as number,
      nombre_examen: row.nombre_examen as string,
      tipo_examen: row.tipo_examen as Examen["tipo_examen"],
      paciente: {
        id_paciente: row.id_paciente as number,
        nombre_completo: row.nombre_completo as string,
      },
      medico: {
        id_medico: row.id_medico as number,
        nombre_completo: row.medico_nombre as string,
      },
      fecha_solicitud: row.fecha_solicitud as string,
      estado_resultado: row.estado_resultado as Examen["estado_resultado"],
    }));
  } catch (error) {
    console.error("Error al obtener exámenes:", error);
    return [];
  }
}

async function obtenerEmpleados(idCentro: number): Promise<Empleado[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        u.id_usuario,
        CONCAT(u.nombre, ' ', u.apellido_paterno, ' ', COALESCE(u.apellido_materno, '')) AS nombre_completo,
        COALESCE(a.cargo, 'Sin especificar') AS cargo,
        COALESCE(d.nombre, 'Sin departamento') AS departamento,
        u.estado,
        u.email,
        u.telefono,
        u.fecha_creacion AS fecha_contratacion,
        COALESCE(a.jornada, 'completa') AS jornada
      FROM usuarios u
      LEFT JOIN administrativos a ON u.id_usuario = a.id_usuario
      LEFT JOIN departamentos d ON a.id_departamento = d.id_departamento
      WHERE u.id_centro_principal = ?
      ORDER BY u.nombre ASC
      LIMIT 50
      `,
      [idCentro]
    );

    return rows.map((row) => ({
      id_usuario: row.id_usuario as number,
      nombre_completo: row.nombre_completo as string,
      cargo: row.cargo as string,
      departamento: row.departamento as string,
      estado: row.estado as Empleado["estado"],
      email: row.email as string,
      telefono: row.telefono as string,
      fecha_contratacion: row.fecha_contratacion as string,
      jornada: row.jornada as Empleado["jornada"],
    }));
  } catch (error) {
    console.error("Error al obtener empleados:", error);
    return [];
  }
}

// ========================================
// ALERTAS Y MÉTRICAS
// ========================================

async function obtenerAlertasUrgentes(
  idCentro: number
): Promise<AlertaAdmin[]> {
  try {
    const alertas: AlertaAdmin[] = [];
    let idAlerta = 1;

    // 1. Facturas vencidas
    const [facturasVencidas] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        f.id_factura,
        f.numero_factura,
        f.total,
        f.saldo,
        DATEDIFF(CURDATE(), DATE_ADD(f.fecha_emision, INTERVAL 30 DAY)) AS dias_vencidos
      FROM facturacion f
      WHERE f.id_centro = ?
        AND f.estado IN ('vencida', 'pendiente')
        AND DATE_ADD(f.fecha_emision, INTERVAL 30 DAY) < CURDATE()
      ORDER BY dias_vencidos DESC
      LIMIT 5
      `,
      [idCentro]
    );

    for (const factura of facturasVencidas) {
      alertas.push({
        id_alerta: idAlerta++,
        tipo: "alta",
        titulo: "💳 Factura Vencida",
        descripcion: `Factura ${factura.numero_factura} vencida hace ${factura.dias_vencidos} días`,
        fecha_hora: new Date().toISOString(),
        leida: false,
        accion_requerida: "Cobrar factura",
        url_accion: `/administrativo/facturacion/${factura.id_factura}`,
      });
    }

    // 2. Medicamentos bajo stock
    const [medicamentosBajoStock] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        id_medicamento,
        nombre_generico,
        stock_actual,
        stock_minimo
      FROM medicamentos
      WHERE id_centro = ?
        AND stock_actual < stock_minimo
        AND stock_actual > 0
      ORDER BY stock_actual ASC
      LIMIT 5
      `,
      [idCentro]
    );

    for (const med of medicamentosBajoStock) {
      alertas.push({
        id_alerta: idAlerta++,
        tipo: "media",
        titulo: "⚠️ Stock Bajo",
        descripcion: `${med.nombre_generico}: ${med.stock_actual} unidades disponibles`,
        fecha_hora: new Date().toISOString(),
        leida: false,
        accion_requerida: "Reabastecer medicamento",
        url_accion: `/administrativo/farmacia/${med.id_medicamento}`,
      });
    }

    // 3. Medicamentos vencidos
    const [medicamentosVencidos] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        id_medicamento,
        nombre_generico,
        fecha_vencimiento,
        stock_actual
      FROM medicamentos
      WHERE id_centro = ?
        AND fecha_vencimiento < CURDATE()
      ORDER BY fecha_vencimiento ASC
      LIMIT 5
      `,
      [idCentro]
    );

    for (const med of medicamentosVencidos) {
      alertas.push({
        id_alerta: idAlerta++,
        tipo: "critica",
        titulo: "🚨 Medicamento Vencido",
        descripcion: `${med.nombre_generico}: ${med.stock_actual} unidades vencidas`,
        fecha_hora: new Date().toISOString(),
        leida: false,
        accion_requerida: "Descartar medicamento",
        url_accion: `/administrativo/farmacia/${med.id_medicamento}`,
      });
    }

    // 4. Exámenes pendientes de resultado (más de 3 días)
    const [examenesPendientes] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        e.id_examen,
        e.nombre_examen,
        p.nombre,
        p.apellido_paterno,
        e.fecha_solicitud
      FROM examenes_medicos e
      INNER JOIN pacientes p ON e.id_paciente = p.id_paciente
      WHERE e.id_centro = ?
        AND e.estado_resultado = 'pendiente'
        AND e.fecha_solicitud < DATE_SUB(CURDATE(), INTERVAL 3 DAY)
      ORDER BY e.fecha_solicitud ASC
      LIMIT 5
      `,
      [idCentro]
    );

    for (const exam of examenesPendientes) {
      alertas.push({
        id_alerta: idAlerta++,
        tipo: "media",
        titulo: "🔬 Examen Pendiente",
        descripcion: `${exam.nombre_examen} de ${exam.nombre} ${exam.apellido_paterno}`,
        fecha_hora: exam.fecha_solicitud as string,
        leida: false,
        accion_requerida: "Seguimiento de resultado",
        url_accion: `/administrativo/examenes/${exam.id_examen}`,
      });
    }

    // Ordenar: primero críticas, luego más recientes
    const ordenTipo: Record<AlertaAdmin["tipo"], number> = {
      critica: 1,
      alta: 2,
      media: 3,
      baja: 4,
    };

    alertas.sort((a, b) => {
      if (ordenTipo[a.tipo] !== ordenTipo[b.tipo]) {
        return ordenTipo[a.tipo] - ordenTipo[b.tipo];
      }
      return (
        new Date(b.fecha_hora).getTime() -
        new Date(a.fecha_hora).getTime()
      );
    });

    return alertas;
  } catch (error) {
    console.error("Error al obtener alertas urgentes:", error);
    return [];
  }
}

async function obtenerMetricasFinancieras(
  idCentro: number
): Promise<MetricaFinanciera[]> {
  try {
    const ahora = new Date();
    const inicioMesActual = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      1
    )
      .toISOString()
      .split("T")[0];
    const inicioMesAnterior = new Date(
      ahora.getFullYear(),
      ahora.getMonth() - 1,
      1
    )
      .toISOString()
      .split("T")[0];
    const finMesAnterior = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      0
    )
      .toISOString()
      .split("T")[0];

    const [
      [rowsFacturacionActual],
      [rowsFacturacionAnterior],
      [rowsCobradoActual],
      [rowsCobradoAnterior],
      [rowsFacturasPagadasActual],
      [rowsFacturasPagadasAnterior],
    ] = await Promise.all([
      pool.query<RowDataPacket[]>(
        `SELECT COALESCE(SUM(total), 0) AS total 
         FROM facturacion 
         WHERE id_centro = ? AND DATE(fecha_emision) >= ?`,
        [idCentro, inicioMesActual]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COALESCE(SUM(total), 0) AS total 
         FROM facturacion 
         WHERE id_centro = ? 
           AND DATE(fecha_emision) BETWEEN ? AND ?`,
        [idCentro, inicioMesAnterior, finMesAnterior]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COALESCE(SUM(pagado), 0) AS total 
         FROM facturacion 
         WHERE id_centro = ? AND DATE(fecha_emision) >= ?`,
        [idCentro, inicioMesActual]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COALESCE(SUM(pagado), 0) AS total 
         FROM facturacion 
         WHERE id_centro = ? 
           AND DATE(fecha_emision) BETWEEN ? AND ?`,
        [idCentro, inicioMesAnterior, finMesAnterior]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total 
         FROM facturacion 
         WHERE id_centro = ? 
           AND estado = 'pagada' 
           AND DATE(fecha_emision) >= ?`,
        [idCentro, inicioMesActual]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total 
         FROM facturacion 
         WHERE id_centro = ? 
           AND estado = 'pagada' 
           AND DATE(fecha_emision) BETWEEN ? AND ?`,
        [idCentro, inicioMesAnterior, finMesAnterior]
      ),
    ]);

    const val = (rows: RowDataPacket[]) =>
      (rows[0]?.total as number | null) ?? 0;

    const calcularMetrica = (
      actual: number,
      anterior: number,
      unidad: string,
      nombre: string,
      icono: string,
      color: string
    ): MetricaFinanciera => {
      const cambio =
        anterior > 0 ? ((actual - anterior) / anterior) * 100 : 0;
      const tendencia: "up" | "down" | "neutral" =
        cambio > 5 ? "up" : cambio < -5 ? "down" : "neutral";

      return {
        nombre,
        valor_actual: actual,
        valor_anterior: anterior,
        unidad,
        tendencia,
        porcentaje_cambio: Math.abs(Math.round(cambio)),
        icono,
        color,
      };
    };

    const facturacionActual = val(rowsFacturacionActual);
    const facturacionAnterior = val(rowsFacturacionAnterior);
    const cobradoActual = val(rowsCobradoActual);
    const cobradoAnterior = val(rowsCobradoAnterior);
    const facturasPagadasActual = val(rowsFacturasPagadasActual);
    const facturasPagadasAnterior = val(rowsFacturasPagadasAnterior);

    return [
      calcularMetrica(
        facturacionActual,
        facturacionAnterior,
        "CLP",
        "Facturación",
        "DollarSign",
        "from-green-500 to-emerald-500"
      ),
      calcularMetrica(
        cobradoActual,
        cobradoAnterior,
        "CLP",
        "Cobrado",
        "CheckCircle2",
        "from-blue-500 to-cyan-500"
      ),
      calcularMetrica(
        facturasPagadasActual,
        facturasPagadasAnterior,
        "",
        "Facturas Pagadas",
        "FileCheck",
        "from-purple-500 to-pink-500"
      ),
    ];
  } catch (error) {
    console.error("Error al calcular métricas financieras:", error);
    return [];
  }
}

// ========================================
// HANDLER GET
// ========================================

export async function GET(request: NextRequest) {
  try {
    const sessionToken = getSessionToken(request);

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

    const [sesiones] = await pool.query<RowDataPacket[]>(
      `
      SELECT su.id_usuario, u.nombre, u.apellido_paterno
      FROM sesiones_usuarios su
      INNER JOIN usuarios u ON su.id_usuario = u.id_usuario
      WHERE su.token = ?
        AND su.activa = 1
        AND su.fecha_expiracion > NOW()
        AND u.estado = 'activo'
      LIMIT 1
      `,
      [sessionToken]
    );

    if (sesiones.length === 0) {
      return NextResponse.json(
        { success: false, error: "Sesión inválida o expirada" },
        { status: 401 }
      );
    }

    const idUsuario = sesiones[0].id_usuario as number;

    const administrativo = await obtenerAdministrativoAutenticado(idUsuario);

    if (!administrativo) {
      return NextResponse.json(
        {
          success: false,
          error: "No tienes un registro administrativo activo",
        },
        { status: 403 }
      );
    }

    const centroMedico = await obtenerCentroMedico(administrativo.id_centro);

    if (!centroMedico) {
      return NextResponse.json(
        { success: false, error: "Centro médico no encontrado" },
        { status: 404 }
      );
    }

    // Refrescamos última actividad de la sesión
    await pool.query(
      `UPDATE sesiones_usuarios 
       SET ultima_actividad = NOW() 
       WHERE token = ?`,
      [sessionToken]
    );

    const [
      estadisticas,
      facturas,
      medicamentos,
      examenes,
      empleados,
      alertasUrgentes,
      metricasFinancieras,
    ] = await Promise.all([
      obtenerEstadisticas(administrativo.id_centro),
      obtenerFacturas(administrativo.id_centro),
      obtenerMedicamentos(administrativo.id_centro),
      obtenerExamenes(administrativo.id_centro),
      obtenerEmpleados(administrativo.id_centro),
      obtenerAlertasUrgentes(administrativo.id_centro),
      obtenerMetricasFinancieras(administrativo.id_centro),
    ]);

    // Actualizar notificaciones pendientes usando alertas reales
    if (estadisticas) {
      estadisticas.notificaciones_pendientes = alertasUrgentes.filter(
        (a) => !a.leida
      ).length;
    }

    return NextResponse.json(
      {
        success: true,
        administrativo: {
          id_administrativo: administrativo.id_administrativo,
          id_usuario: administrativo.id_usuario,
          id_centro: administrativo.id_centro,
          id_sucursal: administrativo.id_sucursal,
          id_departamento: administrativo.id_departamento,
          cargo: administrativo.cargo,
          extension_telefonica: administrativo.extension_telefonica,
          nivel_acceso: administrativo.nivel_acceso,
          estado: administrativo.estado,
          jornada: administrativo.jornada,
        },
        centro_medico: centroMedico,
        estadisticas,
        facturas,
        medicamentos,
        examenes,
        empleados,
        alertas_urgentes: alertasUrgentes,
        metricas_financieras: metricasFinancieras,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/administrativo/dashboard:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// ========================================
// MÉTODOS NO PERMITIDOS
// ========================================

export async function POST() {
  return NextResponse.json(
    { success: false, error: "Método no permitido" },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { success: false, error: "Método no permitido" },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: "Método no permitido" },
    { status: 405 }
  );
}
