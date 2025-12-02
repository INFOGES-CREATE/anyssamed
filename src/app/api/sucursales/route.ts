// app/api/centros/sucursales/route.ts
// Listar + crear sucursales de un centro médico
export const dynamic = "force-dynamic";


export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// ---------------------------------------------------------
// GET — Listar sucursales por centro
// ---------------------------------------------------------
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idCentro = Number(searchParams.get("id_centro"));

    if (!idCentro) {
      return NextResponse.json(
        { success: false, error: "Debe enviar id_centro" },
        { status: 400 }
      );
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        s.id_sucursal,
        s.nombre,
        s.direccion,
        s.ciudad,
        s.region,
        s.telefono,
        s.email,
        s.estado,
        s.fecha_creacion,
        s.fecha_modificacion
      FROM sucursales s
      WHERE s.id_centro = ?
      ORDER BY s.fecha_creacion DESC
      `,
      [idCentro]
    );

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (err: any) {
    console.error("❌ GET /api/centros/sucursales:", err);
    return NextResponse.json(
      { success: false, error: "Error interno", details: err.message },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------
// POST — Crear sucursal
// ---------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      id_centro,
      nombre,
      direccion,
      ciudad,
      region,
      telefono,
      email,
      estado,
    } = body;

    if (!id_centro || !nombre || !direccion || !ciudad || !region) {
      return NextResponse.json(
        { success: false, error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      `
      INSERT INTO sucursales
      (id_centro, nombre, direccion, ciudad, region, telefono, email, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id_centro,
        nombre,
        direccion,
        ciudad,
        region,
        telefono ?? null,
        email ?? null,
        estado ?? "activo",
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Sucursal creada correctamente",
        id_sucursal: result.insertId,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("❌ POST /api/centros/sucursales:", err);
    return NextResponse.json(
      { success: false, error: "Error interno", details: err.message },
      { status: 500 }
    );
  }
}
