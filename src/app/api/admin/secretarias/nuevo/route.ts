//  frontend/src/app/api/admin/secretarias/nuevo/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import bcrypt from "bcryptjs";
import { registrarLog } from "@/lib/logs";
import { sendMail } from "@/lib/mail";
import { welcomeEmailTemplate } from "@/lib/emailTemplates";
import { generateTemporaryPassword } from "@/lib/passwordGenerator";

// ============================================================================
// POST - CREAR NUEVA SECRETARIA (Usuario + Registro en 'secretarias')
// ============================================================================
export async function POST(request: NextRequest) {
  let connection;
  let nuevoUsuarioId: number | null = null;
  let nuevaSecretariaId: number | null = null;

  try {
    const body = await request.json();

    const {
      // ==========================
      // DATOS DE ACCESO
      // ==========================
      username,
      password,
      email,

      // ==========================
      // DATOS PERSONALES
      // ==========================
      rut,
      nombre,
      apellido_paterno,
      apellido_materno,
      fecha_nacimiento,
      genero,
      telefono,
      celular,

      // ==========================
      // UBICACIÓN
      // ==========================
      direccion,
      ciudad,
      region,

      // ==========================
      // ORGANIZACIONAL (USUARIO)
      // ==========================
      id_centro_principal,
      id_sucursal_principal,

      // ==========================
      // ROLES
      // ==========================
      roles, // IDs de roles (debe incluir el rol de secretaria)

      // ==========================
      // FOTO
      // ==========================
      foto_perfil_url,

      // ==========================
      // OPCIONES SEGURIDAD
      // ==========================
      requiere_cambio_password = true,
      autenticacion_doble_factor = false,
      enviar_email_bienvenida = true,

      // ==========================
      // DATOS ESPECÍFICOS SECRETARIA
      // ==========================
      estado_secretaria = "activo", // 'activo','inactivo','suspendido','vacaciones'
      jornada = "completa",         // 'completa','media','parcial'
      extension_telefonica_secretaria,
      fecha_inicio_secretaria,
      fecha_termino_secretaria,
      id_departamento,
      supervisor_id,
      numero_empleado,
      id_profesional_asignado,

      // Asignaciones opcionales a médicos
      // [{ id_profesional: number, es_principal?: boolean, permisos_especiales?: string }]
      medicos_asignados,
    } = body;

    // ============================================================================
    // ✅ VALIDACIONES INICIALES (IGUAL QUE USUARIOS + CAMPOS EXTRA SECRETARIA)
    // ============================================================================

    const camposObligatorios = {
      username,
      password,
      email,
      rut,
      nombre,
      apellido_paterno,
      id_centro_principal,
      fecha_inicio_secretaria,
    };

    const camposFaltantes = Object.entries(camposObligatorios)
      .filter(([, valor]) => !valor)
      .map(([campo]) => campo);

    if (camposFaltantes.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Faltan campos obligatorios: ${camposFaltantes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // username
    if (username.length < 4) {
      return NextResponse.json(
        { success: false, error: "El username debe tener al menos 4 caracteres" },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "El username solo puede contener letras, números, puntos, guiones y guiones bajos",
        },
        { status: 400 }
      );
    }

    // email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Formato de email inválido" },
        { status: 400 }
      );
    }

    // password
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "La contraseña debe tener al menos 8 caracteres" },
        { status: 400 }
      );
    }

    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        {
          success: false,
          error: "La contraseña debe contener al menos una mayúscula",
        },
        { status: 400 }
      );
    }

    if (!/[a-z]/.test(password)) {
      return NextResponse.json(
        {
          success: false,
          error: "La contraseña debe contener al menos una minúscula",
        },
        { status: 400 }
      );
    }

    if (!/[0-9]/.test(password)) {
      return NextResponse.json(
        {
          success: false,
          error: "La contraseña debe contener al menos un número",
        },
        { status: 400 }
      );
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "La contraseña debe contener al menos un carácter especial",
        },
        { status: 400 }
      );
    }

    // Validar RUT (mismo helper que en usuarios)
    const validarRUT = (rut: string): boolean => {
      const rutLimpio = rut.replace(/[^0-9kK]/g, "");
      if (rutLimpio.length < 2) return false;

      const cuerpo = rutLimpio.slice(0, -1);
      const dv = rutLimpio.slice(-1).toUpperCase();

      let suma = 0;
      let multiplicador = 2;

      for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo[i]) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
      }

      const dvEsperado = 11 - (suma % 11);
      const dvCalculado =
        dvEsperado === 11 ? "0" : dvEsperado === 10 ? "K" : dvEsperado.toString();

      return dv === dvCalculado;
    };

    if (!validarRUT(rut)) {
      return NextResponse.json(
        { success: false, error: "RUT inválido" },
        { status: 400 }
      );
    }

    // roles
    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Debe asignar al menos un rol (incluyendo rol de SECRETARIA)",
        },
        { status: 400 }
      );
    }

    // ============================================================================
    // 🔗 CONEXIÓN + TRANSACCIÓN
    // ============================================================================
    connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // ============================================================================
      // ✅ VERIFICAR DUPLICADOS USUARIO
      // ============================================================================
      const [existeUsername] = await connection.query<RowDataPacket[]>(
        "SELECT id_usuario FROM usuarios WHERE username = ?",
        [username]
      );

      if (existeUsername.length > 0) {
        await connection.rollback();
        return NextResponse.json(
          { success: false, error: "El nombre de usuario ya está registrado" },
          { status: 400 }
        );
      }

      const [existeEmail] = await connection.query<RowDataPacket[]>(
        "SELECT id_usuario FROM usuarios WHERE email = ?",
        [email]
      );

      if (existeEmail.length > 0) {
        await connection.rollback();
        return NextResponse.json(
          { success: false, error: "El email ya está registrado" },
          { status: 400 }
        );
      }

      const [existeRut] = await connection.query<RowDataPacket[]>(
        "SELECT id_usuario FROM usuarios WHERE rut = ?",
        [rut]
      );

      if (existeRut.length > 0) {
        await connection.rollback();
        return NextResponse.json(
          { success: false, error: "El RUT ya está registrado" },
          { status: 400 }
        );
      }

      // ============================================================================
      // ✅ VALIDAR REFERENCIAS EXTERNAS (CENTRO, SUCURSAL, ROLES)
      // ============================================================================

      // Centro principal (obligatorio para secretaria)
      const [centroExiste] = await connection.query<RowDataPacket[]>(
        "SELECT id_centro, nombre FROM centros_medicos WHERE id_centro = ? AND estado = 'activo'",
        [id_centro_principal]
      );

      if (centroExiste.length === 0) {
        await connection.rollback();
        return NextResponse.json(
          {
            success: false,
            error: "El centro médico seleccionado no existe o está inactivo",
          },
          { status: 400 }
        );
      }

      if (id_sucursal_principal) {
        const [sucursalExiste] = await connection.query<RowDataPacket[]>(
          "SELECT id_sucursal, id_centro, nombre FROM sucursales WHERE id_sucursal = ? AND estado = 'activo'",
          [id_sucursal_principal]
        );

        if (sucursalExiste.length === 0) {
          await connection.rollback();
          return NextResponse.json(
            {
              success: false,
              error: "La sucursal seleccionada no existe o está inactiva",
            },
            { status: 400 }
          );
        }

        if (sucursalExiste[0].id_centro !== id_centro_principal) {
          await connection.rollback();
          return NextResponse.json(
            {
              success: false,
              error: "La sucursal no pertenece al centro seleccionado",
            },
            { status: 400 }
          );
        }
      }

      // Validar roles activos
      const rolesValidos: any[] = [];
      for (const idRol of roles) {
        const [rolExiste] = await connection.query<RowDataPacket[]>(
          "SELECT id_rol, nombre FROM roles WHERE id_rol = ? AND estado = 'activo'",
          [idRol]
        );

        if (rolExiste.length === 0) {
          await connection.rollback();
          return NextResponse.json(
            {
              success: false,
              error: `El rol con ID ${idRol} no existe o está inactivo`,
            },
            { status: 400 }
          );
        }

        rolesValidos.push(rolExiste[0]);
      }

      // ============================================================================
      // 🔐 HASH PASSWORD
      // ============================================================================
      const passwordHash = await bcrypt.hash(password, 10);

      // ============================================================================
      // 💾 INSERTAR USUARIO
      // ============================================================================
      const [resultUsuario] = await connection.query<ResultSetHeader>(
        `INSERT INTO usuarios (
          username,
          password_hash,
          email,
          nombre,
          apellido_paterno,
          apellido_materno,
          rut,
          telefono,
          celular,
          direccion,
          ciudad,
          region,
          fecha_nacimiento,
          genero,
          id_centro_principal,
          id_sucursal_principal,
          foto_perfil_url,
          estado,
          requiere_cambio_password,
          autenticacion_doble_factor,
          fecha_creacion,
          created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,

        [
          username,
          passwordHash,
          email,
          nombre,
          apellido_paterno,
          apellido_materno || null,
          rut,
          telefono || null,
          celular || null,
          direccion || null,
          ciudad || null,
          region || null,
          fecha_nacimiento || null,
          genero || null,
          id_centro_principal || null,
          id_sucursal_principal || null,
          foto_perfil_url || null,
          "pendiente_activacion",
          requiere_cambio_password ? 1 : 0,
          autenticacion_doble_factor ? 1 : 0,
          1, // created_by (IDEAL: id del admin logueado)
        ]
      );

      nuevoUsuarioId = resultUsuario.insertId;

      // ============================================================================
      // 💾 INSERTAR SECRETARIA
      // ============================================================================

      // (Por diseño, 1 secretaria por usuario: UNIQUE idx_secretaria_usuario)
      const [resultSecretaria] = await connection.query<ResultSetHeader>(
        `
        INSERT INTO secretarias (
          id_usuario,
          id_centro,
          id_sucursal,
          id_departamento,
          estado,
          jornada,
          extension_telefonica,
          fecha_inicio,
          fecha_termino,
          supervisor_id,
          fecha_creacion,
          fecha_modificacion,
          numero_empleado,
          id_profesional_asignado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?, ?)
      `,
        [
          nuevoUsuarioId,
          id_centro_principal,
          id_sucursal_principal || null,
          id_departamento || null,
          estado_secretaria,
          jornada,
          extension_telefonica_secretaria || null,
          fecha_inicio_secretaria,
          fecha_termino_secretaria || null,
          supervisor_id || null,
          numero_empleado || null,
          id_profesional_asignado || null,
        ]
      );

      nuevaSecretariaId = resultSecretaria.insertId;

      // ============================================================================
      // 👩‍⚕️ RELACIONES SECRETARIA - MÉDICOS (secretarias_medicos)
      // ============================================================================
      if (Array.isArray(medicos_asignados) && medicos_asignados.length > 0) {
        for (const item of medicos_asignados) {
          if (!item || !item.id_profesional) continue;

          const esPrincipal = item.es_principal ? 1 : 0;
          const permisos = item.permisos_especiales || null;

          await connection.query(
            `
            INSERT INTO secretarias_medicos (
              id_secretaria,
              id_profesional,
              es_principal,
              fecha_asignacion,
              estado,
              permisos_especiales
            ) VALUES (?, ?, ?, CURDATE(), 'activo', ?)
          `,
            [nuevaSecretariaId, item.id_profesional, esPrincipal, permisos]
          );

          // Si marcamos uno como principal y no se definió id_profesional_asignado,
          // lo usamos como médico principal de la secretaria:
          if (esPrincipal && !id_profesional_asignado) {
            await connection.query(
              "UPDATE secretarias SET id_profesional_asignado = ? WHERE id_secretaria = ?",
              [item.id_profesional, nuevaSecretariaId]
            );
          }
        }
      } else if (id_profesional_asignado) {
        // Si no viene arreglo pero sí un médico principal, creamos una relación por defecto
        await connection.query(
          `
          INSERT INTO secretarias_medicos (
            id_secretaria,
            id_profesional,
            es_principal,
            fecha_asignacion,
            estado
          ) VALUES (?, ?, 1, CURDATE(), 'activo')
        `,
          [nuevaSecretariaId, id_profesional_asignado]
        );
      }

      // ============================================================================
      // 👥 ASIGNAR ROLES AL USUARIO
      // ============================================================================
      for (const idRol of roles) {
        await connection.query(
          `INSERT INTO usuarios_roles (
            id_usuario,
            id_rol,
            id_centro,
            id_sucursal,
            fecha_asignacion,
            asignado_por,
            activo
          ) VALUES (?, ?, ?, ?, NOW(), ?, 1)`,
          [
            nuevoUsuarioId,
            idRol,
            id_centro_principal || null,
            id_sucursal_principal || null,
            1,
          ]
        );
      }

      // ============================================================================
      // 📊 OBTENER USUARIO CREADO
      // ============================================================================
      const [usuarioCreado] = await connection.query<RowDataPacket[]>(
        `SELECT 
          u.id_usuario,
          u.username,
          u.email,
          u.nombre,
          u.apellido_paterno,
          u.apellido_materno,
          u.rut,
          u.telefono,
          u.celular,
          u.direccion,
          u.ciudad,
          u.region,
          u.fecha_nacimiento,
          u.genero,
          u.id_centro_principal,
          u.id_sucursal_principal,
          u.foto_perfil_url,
          u.estado,
          u.requiere_cambio_password,
          u.autenticacion_doble_factor,
          u.fecha_creacion,
          u.fecha_modificacion,
          c.nombre AS centro_nombre,
          s.nombre AS sucursal_nombre,
          GROUP_CONCAT(DISTINCT r.nombre SEPARATOR ', ') AS roles_nombres,
          GROUP_CONCAT(DISTINCT r.id_rol SEPARATOR ',') AS roles_ids
        FROM usuarios u
        LEFT JOIN centros_medicos c ON u.id_centro_principal = c.id_centro
        LEFT JOIN sucursales s ON u.id_sucursal_principal = s.id_sucursal
        LEFT JOIN usuarios_roles ur ON u.id_usuario = ur.id_usuario AND ur.activo = 1
        LEFT JOIN roles r ON ur.id_rol = r.id_rol AND r.estado = 'activo'
        WHERE u.id_usuario = ?
        GROUP BY u.id_usuario`,
        [nuevoUsuarioId]
      );

      // ============================================================================
      // 📊 OBTENER SECRETARIA CREADA
      // ============================================================================
      const [secretariaCreada] = await connection.query<RowDataPacket[]>(
        `
        SELECT
          sec.id_secretaria,
          sec.id_usuario,
          u.rut,
          u.nombre,
          u.apellido_paterno,
          u.apellido_materno,
          CONCAT(u.nombre, ' ', u.apellido_paterno, ' ', COALESCE(u.apellido_materno, '')) AS nombre_completo,
          u.email,
          u.telefono,

          sec.id_centro,
          sec.id_sucursal,
          sec.id_departamento,

          c.nombre AS centro_nombre,
          s.nombre AS sucursal_nombre,
          d.nombre AS departamento_nombre,

          sec.estado,
          sec.jornada,
          sec.extension_telefonica,

          DATE_FORMAT(sec.fecha_inicio, '%Y-%m-%d') AS fecha_inicio,
          DATE_FORMAT(sec.fecha_termino, '%Y-%m-%d') AS fecha_termino,

          sec.supervisor_id,
          CONCAT(u_sup.nombre, ' ', u_sup.apellido_paterno, ' ', COALESCE(u_sup.apellido_materno, '')) AS supervisor_nombre,

          sec.numero_empleado,
          sec.id_profesional_asignado,
          CONCAT(u_med.nombre, ' ', u_med.apellido_paterno, ' ', COALESCE(u_med.apellido_materno, '')) AS medico_principal_nombre,

          (
            SELECT COUNT(*)
            FROM secretarias_medicos sm
            WHERE sm.id_secretaria = sec.id_secretaria
              AND sm.estado = 'activo'
          ) AS total_medicos_asignados

        FROM secretarias sec
        INNER JOIN usuarios u ON sec.id_usuario = u.id_usuario
        LEFT JOIN centros_medicos c ON sec.id_centro = c.id_centro
        LEFT JOIN sucursales s ON sec.id_sucursal = s.id_sucursal
        LEFT JOIN departamentos d ON sec.id_departamento = d.id_departamento

        LEFT JOIN administrativos adm ON sec.supervisor_id = adm.id_administrativo
        LEFT JOIN usuarios u_sup ON adm.id_usuario = u_sup.id_usuario

        LEFT JOIN medicos med ON sec.id_profesional_asignado = med.id_profesional
        LEFT JOIN usuarios u_med ON med.id_usuario = u_med.id_usuario

        WHERE sec.id_secretaria = ?
        GROUP BY sec.id_secretaria
      `,
        [nuevaSecretariaId]
      );

      // ============================================================================
      // 📝 LOGS (USUARIO + SECRETARIA)
      // ============================================================================
      await registrarLog({
        id_usuario: 1,
        tipo: "audit",
        modulo: "secretarias",
        accion: "crear_secretaria",
        descripcion: `Nueva secretaria creada: ${nombre} ${apellido_paterno} (${email})`,
        objeto_tipo: "secretaria",
        objeto_id: nuevaSecretariaId!.toString(),
        datos_nuevos: {
          usuario: {
            username,
            email,
            nombre,
            apellido_paterno,
            rut,
            roles: rolesValidos.map((r) => r.nombre),
          },
          secretaria: {
            id_centro: id_centro_principal,
            id_sucursal: id_sucursal_principal,
            estado_secretaria,
            jornada,
            fecha_inicio_secretaria,
            fecha_termino_secretaria,
            numero_empleado,
            supervisor_id,
            id_profesional_asignado,
          },
        },
        ip_origen:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "unknown",
        agente_usuario: request.headers.get("user-agent") || "unknown",
        nivel_severidad: 5,
      });

      // ============================================================================
      // ✅ COMMIT TRANSACCIÓN
      // ============================================================================
      await connection.commit();

      // ============================================================================
      // 📧 ENVIAR EMAIL DE BIENVENIDA (DESPUÉS DEL COMMIT)
      // ============================================================================
      if (enviar_email_bienvenida) {
        try {
          const loginUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/login`;
          const emailHtml = welcomeEmailTemplate(
            nombre,
            email, // ✅ solo email, sin enviar password
            loginUrl
          );

          const emailEnviado = await sendMail({
            to: email,
            subject: "🎉 ¡Bienvenida a AnyssaMed! Tu cuenta de secretaria ha sido creada",
            html: emailHtml,
          });

          if (!emailEnviado) {
            console.warn(
              `⚠️ No se pudo enviar email de bienvenida a la secretaria ${email}`
            );
          }
        } catch (emailError) {
          console.error(
            "❌ Error al enviar email de bienvenida a secretaria:",
            emailError
          );
        }
      }

      // ============================================================================
      // 📤 RESPONSE
      // ============================================================================
      const roles_ids = usuarioCreado[0].roles_ids
        ? usuarioCreado[0].roles_ids.split(",").map(Number)
        : [];
      const roles_nombres = usuarioCreado[0].roles_nombres
        ? usuarioCreado[0].roles_nombres.split(", ")
        : [];

      return NextResponse.json(
        {
          success: true,
          message: "Secretaria creada exitosamente",
          data: {
            usuario: {
              ...usuarioCreado[0],
              roles_ids,
              roles_nombres,
            },
            secretaria: secretariaCreada[0],
          },
        },
        { status: 201 }
      );
    } catch (error: any) {
      await connection.rollback();
      throw error;
    }
  } catch (error: any) {
    console.error("❌ Error al crear secretaria:", error);

    try {
      await registrarLog({
        tipo: "error",
        modulo: "secretarias",
        accion: "crear_secretaria",
        descripcion: "Error al crear nueva secretaria",
        mensaje_error: error.message,
        exitoso: false,
        nivel_severidad: 8,
      });
    } catch (logError) {
      console.error("Error al registrar log de error:", logError);
    }

    let mensajeError = "Error al crear secretaria";
    let statusCode = 500;

    if (error.message?.includes("Duplicate entry")) {
      mensajeError =
        "El usuario, email, RUT o secretaria ya existe en el sistema";
      statusCode = 400;
    } else if (error.message?.includes("foreign key")) {
      mensajeError = "Referencia inválida (centro, sucursal, departamento o médico)";
      statusCode = 400;
    }

    return NextResponse.json(
      {
        success: false,
        error: mensajeError,
        detalles:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: statusCode }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
