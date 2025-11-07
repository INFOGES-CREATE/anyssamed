// frontend/src/app/api/admin/roles/opciones/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Puedes cambiar este catálogo a consulta DB si tienes tabla `permisos`.
 * Por ahora, estático (mínimo funcional).
 */
const CATALOGO_PERMISOS = [
  // Usuarios
  { value: "usuarios.ver",        label: "Usuarios · Ver" },
  { value: "usuarios.crear",      label: "Usuarios · Crear" },
  { value: "usuarios.editar",     label: "Usuarios · Editar" },
  { value: "usuarios.eliminar",   label: "Usuarios · Eliminar" },

  // Roles
  { value: "roles.ver",           label: "Roles · Ver" },
  { value: "roles.gestion",       label: "Roles · Gestionar" },

  // Recetas
  { value: "recetas.ver",         label: "Recetas · Ver" },
  { value: "recetas.crear",       label: "Recetas · Crear" },
  { value: "recetas.editar",      label: "Recetas · Editar" },
  { value: "recetas.anular",      label: "Recetas · Anular" },
  { value: "recetas.dispensar",   label: "Recetas · Dispensar" },

  // Catálogos
  { value: "catalogos.editar",    label: "Catálogos · Editar" },
];

export async function GET() {
  try {
    return NextResponse.json(
      { success: true, permisos: CATALOGO_PERMISOS, opciones: { permisos: CATALOGO_PERMISOS } },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e:any) {
    return NextResponse.json({ success:false, error:e?.message ?? "Error inesperado" }, { status:500 });
  }
}
