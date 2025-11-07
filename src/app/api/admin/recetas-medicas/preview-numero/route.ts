// frontend/src/app/api/admin/recetas-medicas/preview-numero/route.ts
import { NextResponse } from "next/server";
import { previewRecetaNumber } from "../_utils";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id_centro = Number(searchParams.get("id_centro"));
    const tipo      = searchParams.get("tipo_receta");
    const fecha     = searchParams.get("fecha_emision");
    if (!id_centro) return NextResponse.json({ success:false, error:"id_centro requerido" }, { status:400 });
    const r = await previewRecetaNumber(id_centro, tipo, fecha || undefined);
    return NextResponse.json({ success:true, ...r });
  } catch (e:any) {
    return NextResponse.json({ success:false, error:e?.message || "Error" }, { status:500 });
  }
}
