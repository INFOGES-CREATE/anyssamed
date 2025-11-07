import { NextResponse } from "next/server";
import pool from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";

export const dynamic = "force-dynamic";

// Tipos de filas
interface CentroRow extends RowDataPacket {
  id_centro: number;
  nombre: string;
}
interface SucursalRow extends RowDataPacket {
  id_sucursal: number;
  id_centro: number;
  nombre: string;
}
interface EspecialidadRow extends RowDataPacket {
  id_especialidad: number;
  nombre: string;
}
interface MedicoRow extends RowDataPacket {
  id_medico: number;
  id_centro: number;
  nombre: string;
  apellido_paterno: string;
  apm: string;
}
interface PacienteRow extends RowDataPacket {
  id_paciente: number;
  rut: string;
  nombre: string;
  apellido_paterno: string;
  apm: string;
}
interface TipoAtencionRow extends RowDataPacket {
  codigo: string;
  nombre: string;
}

// GET /api/admin/historial-clinico/opciones
// Parámetros opcionales:
//   - id_centro: filtra médicos por centro
//   - q: filtra pacientes por nombre/apellidos/rut
//   - limit: límite de pacientes (por defecto 1000; máx 5000)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id_centro = searchParams.get("id_centro");
    const q = (searchParams.get("q") || "").trim();
    const limit = Math.min(
      5000,
      Math.max(50, Number(searchParams.get("limit")) || 1000)
    );

    const paramsCentro: (string | number)[] = [];
    if (id_centro) paramsCentro.push(id_centro);

    // Fallback seguro si 'tipos_atencion' no existe
    const tiposAtencionPromise = pool
      .query<TipoAtencionRow[]>(
        `SELECT codigo, nombre
         FROM tipos_atencion
         ORDER BY nombre`
      )
      .catch(() => [[], []] as [TipoAtencionRow[], any]);

    const [
      [centros],
      [sucursales],
      [especialidades],
      [medicos],
      [pacientes],
      [tipos_atencion],
    ] = await Promise.all([
      pool.query<CentroRow[]>(
        `SELECT id_centro, nombre
         FROM centros_medicos
         ORDER BY nombre`
      ),
      pool.query<SucursalRow[]>(
        `SELECT id_sucursal, id_centro, nombre
         FROM sucursales
         ORDER BY nombre`
      ),
      pool.query<EspecialidadRow[]>(
        `SELECT id_especialidad, nombre
         FROM especialidades
         ORDER BY nombre`
      ),
      pool.query<MedicoRow[]>(
        `SELECT m.id_medico, m.id_centro,
                u.nombre, u.apellido_paterno, IFNULL(u.apellido_materno,'') AS apm
         FROM medicos m
         JOIN usuarios u ON u.id_usuario = m.id_usuario
         ${id_centro ? "WHERE m.id_centro = ?" : ""}
         ORDER BY u.nombre, u.apellido_paterno`,
        paramsCentro
      ),
      pool.query<PacienteRow[]>(
        `SELECT p.id_paciente, p.rut, p.nombre, p.apellido_paterno, IFNULL(p.apellido_materno,'') AS apm
         FROM pacientes p
         ${q ? "WHERE (p.rut LIKE ? OR p.nombre LIKE ? OR p.apellido_paterno LIKE ? OR p.apellido_materno LIKE ?)" : ""}
         ORDER BY p.nombre, p.apellido_paterno
         LIMIT ?`,
        q ? [`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, limit] : [limit]
      ),
      tiposAtencionPromise,
    ]);

    const opCentros = (centros as CentroRow[]).map((c) => ({
      value: c.id_centro,
      label: c.nombre,
      id_centro: c.id_centro,
    }));

    const opSucursales = (sucursales as SucursalRow[]).map((s) => ({
      value: s.id_sucursal,
      label: s.nombre,
      id_centro: s.id_centro,
    }));

    const opEspecialidades = (especialidades as EspecialidadRow[]).map((e) => ({
      value: e.id_especialidad,
      label: e.nombre,
    }));

    const opMedicos = (medicos as MedicoRow[]).map((m) => ({
      value: m.id_medico,
      label: `${m.nombre} ${m.apellido_paterno} ${m.apm}`.replace(/\s+/g, " ").trim(),
      id_centro: m.id_centro,
    }));

    const opPacientes = (pacientes as PacienteRow[]).map((p) => ({
      value: p.id_paciente,
      label: `${p.nombre} ${p.apellido_paterno} ${p.apm} • ${p.rut}`.replace(/\s+/g, " ").trim(),
      rut: p.rut,
    }));

    const opTiposAtencion =
      (tipos_atencion as TipoAtencionRow[]).length > 0
        ? (tipos_atencion as TipoAtencionRow[]).map((t) => ({
            value: t.codigo,
            label: t.nombre,
          }))
        : [
            { value: "consulta", label: "Consulta" },
            { value: "control", label: "Control" },
            { value: "urgencia", label: "Urgencia" },
            { value: "procedimiento", label: "Procedimiento" },
            { value: "telemedicina", label: "Telemedicina" },
          ];

    return NextResponse.json({
      success: true,
      centros: opCentros,
      sucursales: opSucursales,
      medicos: opMedicos,
      pacientes: opPacientes,
      especialidades: opEspecialidades,
      tiposAtencion: opTiposAtencion,
      limit,
    });
  } catch (err: any) {
    console.error("GET /api/admin/historial-clinico/opciones error:", err);
    return NextResponse.json(
      { success: false, error: err?.message ?? "Error inesperado" },
      { status: 500 }
    );
  }
}
