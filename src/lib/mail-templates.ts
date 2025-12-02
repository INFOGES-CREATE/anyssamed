//src\lib\mail-templates.ts

/**
 * PLANTILLAS DE EMAIL PROFESIONALES PARA ANYSSAMED
 * Diseño premium, responsive y compatible con todos los clientes de email
 */

// ============================================================================
// 🎉 PLANTILLA DE BIENVENIDA - USUARIO NUEVO
// ============================================================================
export function welcomeEmailTemplate(
  nombre: string,
  email: string,
  loginUrl: string
) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a AnyssaMed</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f7fa; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;">

  <!-- Tabla contenedora principal -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f7fa;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        
        <!-- Contenedor de contenido -->
        <table width="100%" max-width="600px" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:#ffffff; border-radius:12px; box-shadow:0 10px 40px rgba(0,0,0,0.1); overflow:hidden;">
          
          <!-- ENCABEZADO CON GRADIENTE -->
          <tr>
            <td style="background:linear-gradient(135deg, #2563EB 0%, #1E40AF 50%, #14B8A6 100%); padding:60px 40px; text-align:center;">
              
              <!-- Logo/Marca -->
              <div style="font-size:36px; font-weight:900; color:#ffffff; letter-spacing:-1px; margin-bottom:12px;">
                AnyssaMed
              </div>
              
              <!-- Subtítulo -->
              <div style="font-size:14px; color:rgba(255,255,255,0.9); letter-spacing:0.5px; font-weight:500;">
                Plataforma Médica de Clase Mundial
              </div>
              
              <!-- Icono decorativo -->
              <div style="margin-top:16px; font-size:48px;">🏥</div>
              
            </td>
          </tr>

          <!-- CONTENIDO PRINCIPAL -->
          <tr>
            <td style="padding:50px 40px;">
              
              <!-- Saludo personalizado -->
              <h1 style="margin:0 0 24px 0; font-size:28px; font-weight:700; color:#0F172A; line-height:1.3;">
                ¡Hola, <span style="background:linear-gradient(90deg, #2563EB, #14B8A6); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;">${nombre}</span>!
              </h1>

              <!-- Mensaje de bienvenida -->
              <p style="margin:0 0 20px 0; font-size:16px; color:#475569; line-height:1.6; font-weight:400;">
                Tu cuenta en <strong style="color:#2563EB;">AnyssaMed</strong> ha sido creada exitosamente. Nos complace darte la bienvenida a nuestra comunidad médica global.
              </p>

              <p style="margin:0 0 32px 0; font-size:15px; color:#64748B; line-height:1.6;">
                A partir de ahora, tendrás acceso a todas las herramientas y servicios que necesitas para optimizar tu práctica médica y mejorar la atención a tus pacientes.
              </p>

              <!-- TARJETA DE INFORMACIÓN DE ACCESO -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px; background:linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%); border-radius:12px; border:2px solid #BAE6FD; overflow:hidden;">
                <tr>
                  <td style="padding:28px 24px;">
                    
                    <!-- Título de la tarjeta -->
                    <div style="font-size:13px; font-weight:700; color:#0369A1; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:20px;">
                      🔐 Información de Acceso
                    </div>

                    <!-- Campo: Email -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                      <tr>
                        <td style="font-size:12px; color:#64748B; font-weight:600; margin-bottom:6px; display:block;">
                          📧 Correo Electrónico:
                        </td>
                      </tr>
                      <tr>
                        <td style="background-color:#ffffff; padding:12px 14px; border-radius:8px; border:1px solid #BAE6FD; font-size:14px; font-weight:600; color:#0369A1; font-family:'Courier New', monospace; word-break:break-all;">
                          ${email}
                        </td>
                      </tr>
                    </table>

                    <!-- Nota importante -->
                    <div style="background-color:rgba(220, 38, 38, 0.08); border-left:4px solid #DC2626; padding:12px 14px; border-radius:6px; font-size:12px; color:#7F1D1D; line-height:1.5;">
                      <strong>⚠️ Importante:</strong> Este correo es tu único medio de acceso. No podrás modificarlo. Si necesitas cambiar tu correo, contacta al administrador.
                    </div>

                  </td>
                </tr>
              </table>

              <!-- TARJETA DE PASOS SIGUIENTES -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px; background:#F8FAFC; border-radius:12px; border-left:5px solid #2563EB; overflow:hidden;">
                <tr>
                  <td style="padding:24px;">
                    
                    <div style="font-size:14px; font-weight:700; color:#0F172A; margin-bottom:16px; display:flex; align-items:center;">
                      📋 Próximos Pasos para Comenzar
                    </div>

                    <!-- Lista de pasos -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      
                      <!-- Paso 1 -->
                      <tr>
                        <td style="padding:10px 0; border-bottom:1px solid #E2E8F0;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="30" style="font-size:20px; text-align:center; padding-right:12px; vertical-align:top;">
                                1️⃣
                              </td>
                              <td style="font-size:14px; color:#334155; line-height:1.5;">
                                <strong>Accede a tu cuenta</strong><br>
                                <span style="font-size:12px; color:#64748B;">Usa tu correo y contraseña en el portal</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Paso 2 -->
                      <tr>
                        <td style="padding:10px 0; border-bottom:1px solid #E2E8F0;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="30" style="font-size:20px; text-align:center; padding-right:12px; vertical-align:top;">
                                2️⃣
                              </td>
                              <td style="font-size:14px; color:#334155; line-height:1.5;">
                                <strong>Completa tu perfil profesional</strong><br>
                                <span style="font-size:12px; color:#64748B;">Añade tu información médica y especialidades</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Paso 3 -->
                      <tr>
                        <td style="padding:10px 0; border-bottom:1px solid #E2E8F0;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="30" style="font-size:20px; text-align:center; padding-right:12px; vertical-align:top;">
                                3️⃣
                              </td>
                              <td style="font-size:14px; color:#334155; line-height:1.5;">
                                <strong>Configura tu seguridad</strong><br>
                                <span style="font-size:12px; color:#64748B;">Activa autenticación de dos factores</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Paso 4 -->
                      <tr>
                        <td style="padding:10px 0;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="30" style="font-size:20px; text-align:center; padding-right:12px; vertical-align:top;">
                                4️⃣
                              </td>
                              <td style="font-size:14px; color:#334155; line-height:1.5;">
                                <strong>Comienza a usar AnyssaMed</strong><br>
                                <span style="font-size:12px; color:#64748B;">Explora todas las funcionalidades disponibles</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                    </table>

                  </td>
                </tr>
              </table>

              <!-- BOTÓN DE ACCESO PRINCIPAL -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" style="display:inline-block; background:linear-gradient(135deg, #2563EB 0%, #1E40AF 100%); color:#ffffff; text-decoration:none; padding:16px 48px; font-size:16px; font-weight:700; border-radius:10px; box-shadow:0 8px 24px rgba(37, 99, 235, 0.3); transition:all 0.3s ease;">
                      🚀 Acceder a AnyssaMed
                    </a>
                  </td>
                </tr>
              </table>

              <!-- SECCIÓN DE CARACTERÍSTICAS -->
              <div style="background:#F1F5F9; border-radius:12px; padding:28px 24px; margin-bottom:32px;">
                
                <div style="font-size:14px; font-weight:700; color:#0F172A; margin-bottom:18px;">
                  ✨ Lo que puedes hacer en AnyssaMed:
                </div>

                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="50%" style="padding-right:12px; padding-bottom:12px;">
                      <div style="background:#ffffff; padding:14px; border-radius:8px; border-left:4px solid #14B8A6;">
                        <div style="font-size:13px; font-weight:700; color:#0D9488; margin-bottom:4px;">📊 Gestión de Pacientes</div>
                        <div style="font-size:12px; color:#64748B;">Historial médico completo</div>
                      </div>
                    </td>
                    <td width="50%" style="padding-left:12px; padding-bottom:12px;">
                      <div style="background:#ffffff; padding:14px; border-radius:8px; border-left:4px solid #3B82F6;">
                        <div style="font-size:13px; font-weight:700; color:#1E40AF; margin-bottom:4px;">📅 Citas Médicas</div>
                        <div style="font-size:12px; color:#64748B;">Agenda inteligente</div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td width="50%" style="padding-right:12px; padding-bottom:12px;">
                      <div style="background:#ffffff; padding:14px; border-radius:8px; border-left:4px solid #F59E0B;">
                        <div style="font-size:13px; font-weight:700; color:#B45309; margin-bottom:4px;">💊 Prescripciones</div>
                        <div style="font-size:12px; color:#64748B;">Gestión digital segura</div>
                      </div>
                    </td>
                    <td width="50%" style="padding-left:12px; padding-bottom:12px;">
                      <div style="background:#ffffff; padding:14px; border-radius:8px; border-left:4px solid #8B5CF6;">
                        <div style="font-size:13px; font-weight:700; color:#6D28D9; margin-bottom:4px;">📈 Reportes</div>
                        <div style="font-size:12px; color:#64748B;">Análisis y estadísticas</div>
                      </div>
                    </td>
                  </tr>
                </table>

              </div>

              <!-- MENSAJE DE SEGURIDAD -->
              <div style="background:linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(34, 197, 94, 0.04) 100%); border:1px solid #DCFCE7; border-radius:10px; padding:20px; text-align:center;">
                <div style="font-size:12px; color:#166534; line-height:1.6;">
                  🔒 <strong>Seguridad Garantizada:</strong> Tus datos están protegidos con encriptación de nivel militar. Nunca compartimos información personal sin tu consentimiento.
                </div>
              </div>

            </td>
          </tr>

          <!-- SEPARADOR -->
          <tr>
            <td style="height:1px; background-color:#E2E8F0;"></td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:32px 40px; background-color:#F8FAFC; text-align:center;">
              
              <!-- Redes sociales / Enlaces -->
              <div style="margin-bottom:20px;">
                <a href="https://anyssamed.com" style="display:inline-block; margin:0 10px; text-decoration:none; color:#2563EB; font-size:12px; font-weight:600;">
                  Sitio Web
                </a>
                <span style="color:#CBD5E1;">•</span>
                <a href="mailto:soporte@anyssamed.com" style="display:inline-block; margin:0 10px; text-decoration:none; color:#2563EB; font-size:12px; font-weight:600;">
                  Soporte
                </a>
                <span style="color:#CBD5E1;">•</span>
                <a href="https://anyssamed.com/ayuda" style="display:inline-block; margin:0 10px; text-decoration:none; color:#2563EB; font-size:12px; font-weight:600;">
                  Centro de Ayuda
                </a>
              </div>

              <!-- Copyright -->
              <div style="font-size:11px; color:#94A3B8; line-height:1.6; margin-bottom:12px;">
                © ${new Date().getFullYear()} AnyssaMed • Todos los derechos reservados<br>
                Innovación y tecnología al servicio de tu salud ✨
              </div>

              <!-- Aviso legal -->
              <div style="font-size:10px; color:#CBD5E1; line-height:1.5;">
                Este correo fue enviado a <strong>${email}</strong><br>
                <a href="#" style="color:#64748B; text-decoration:none;">Gestionar preferencias</a> • 
                <a href="#" style="color:#64748B; text-decoration:none;">Política de privacidad</a>
              </div>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `;
}

// ============================================================================
// 🔐 PLANTILLA DE RECUPERACIÓN DE CONTRASEÑA
// ============================================================================
export function recoveryEmailTemplate(
  nombre: string,
  code: string,
  url: string,
  minutos: number,
) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperar Contraseña - AnyssaMed</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f7fa; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f7fa;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        
        <table width="100%" max-width="600px" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:#ffffff; border-radius:12px; box-shadow:0 10px 40px rgba(0,0,0,0.1); overflow:hidden;">
          
          <!-- ENCABEZADO CON ICONO DE SEGURIDAD -->
          <tr>
            <td style="background:linear-gradient(135deg, #DC2626 0%, #991B1B 100%); padding:50px 40px; text-align:center;">
              
              <div style="font-size:56px; margin-bottom:16px;">
                🔐
              </div>
              
              <div style="font-size:28px; font-weight:900; color:#ffffff; letter-spacing:-1px; margin-bottom:8px;">
                Recuperar Acceso
              </div>
              
              <div style="font-size:14px; color:rgba(255,255,255,0.9);">
                Solicitud de Restablecimiento de Contraseña
              </div>
              
            </td>
          </tr>

          <!-- CONTENIDO PRINCIPAL -->
          <tr>
            <td style="padding:50px 40px;">
              
              <p style="margin:0 0 24px 0; font-size:16px; color:#0F172A; line-height:1.6;">
                Hola <strong>${nombre}</strong>,
              </p>

              <p style="margin:0 0 28px 0; font-size:15px; color:#475569; line-height:1.6;">
                Hemos recibido una solicitud para restablecer tu contraseña en AnyssaMed. Si no fuiste tú, puedes ignorar este mensaje de forma segura.
              </p>

              <!-- CÓDIGO DE VERIFICACIÓN -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:40px 0; background:linear-gradient(135deg, #FEF3C7 0%, #FEF08A 100%); border-radius:14px; border:2px solid #FCD34D; overflow:hidden;">
                <tr>
                  <td style="padding:40px; text-align:center;">
                    
                    <div style="font-size:12px; font-weight:700; color:#92400E; text-transform:uppercase; letter-spacing:1px; margin-bottom:16px;">
                      Código de Verificación
                    </div>

                    <div style="font-size:48px; font-weight:900; color:#B45309; letter-spacing:12px; font-family:'Courier New', monospace; margin-bottom:16px;">
                      ${code}
                    </div>

                  <div style="font-size:13px; color:#92400E; font-weight:600;">
                    ⏱️ Este código expirará en <strong>${minutos} minutos</strong>
                  </div>


                  </td>
                </tr>
              </table>

              <!-- INSTRUCCIONES -->
              <div style="background:#F3F4F6; border-radius:12px; padding:24px; margin-bottom:28px;">
                
                <div style="font-size:13px; font-weight:700; color:#0F172A; margin-bottom:14px;">
                  📝 Cómo proceder:
                </div>

                <ol style="margin:0; padding-left:20px; font-size:14px; color:#475569; line-height:1.8;">
                  <li style="margin-bottom:8px;">Copia el código de verificación anterior</li>
                  <li style="margin-bottom:8px;">Ingresa el código en el formulario de recuperación</li>
                  <li style="margin-bottom:8px;">Crea una nueva contraseña segura</li>
                  <li>Accede a tu cuenta con tus nuevas credenciales</li>
                </ol>

              </div>

              <!-- BOTÓN DE ACCESO DIRECTO -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center">
                    <a href="${url}" style="display:inline-block; background:linear-gradient(135deg, #DC2626 0%, #991B1B 100%); color:#ffffff; text-decoration:none; padding:16px 48px; font-size:16px; font-weight:700; border-radius:10px; box-shadow:0 8px 24px rgba(220, 38, 38, 0.3);">
                      🔄 Restablecer Contraseña
                    </a>
                  </td>
                </tr>
              </table>

              <!-- ADVERTENCIA DE SEGURIDAD -->
              <div style="background:linear-gradient(135deg, rgba(220, 38, 38, 0.08) 0%, rgba(220, 38, 38, 0.04) 100%); border:1px solid #FECACA; border-radius:10px; padding:16px; margin-bottom:28px;">
                <div style="font-size:12px; color:#7F1D1D; line-height:1.6;">
                  ⚠️ <strong>Importante:</strong> Nunca compartas este código con nadie. El equipo de AnyssaMed nunca te pedirá tu contraseña por correo.
                </div>
              </div>

              <!-- INFORMACIÓN DE SEGURIDAD -->
              <div style="background:#F0FDF4; border-left:4px solid #22C55E; padding:16px; border-radius:8px; font-size:12px; color:#166534; line-height:1.6;">
                🛡️ <strong>Tu seguridad es nuestra prioridad:</strong> Este enlace solo es válido por 10 minutos y es único para tu cuenta.
              </div>

            </td>
          </tr>

          <!-- SEPARADOR -->
          <tr>
            <td style="height:1px; background-color:#E2E8F0;"></td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:32px 40px; background-color:#F8FAFC; text-align:center;">
              
              <div style="margin-bottom:16px;">
                <a href="mailto:soporte@anyssamed.com" style="display:inline-block; margin:0 10px; text-decoration:none; color:#2563EB; font-size:12px; font-weight:600;">
                  Contactar Soporte
                </a>
                <span style="color:#CBD5E1;">•</span>
                <a href="https://anyssamed.com/seguridad" style="display:inline-block; margin:0 10px; text-decoration:none; color:#2563EB; font-size:12px; font-weight:600;">
                  Centro de Seguridad
                </a>
              </div>

              <div style="font-size:11px; color:#94A3B8; line-height:1.6;">
                © ${new Date().getFullYear()} AnyssaMed • Todos los derechos reservados<br>
                Innovación y tecnología al servicio de tu salud ✨
              </div>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `;
}

// ============================================================================
// 🎯 PLANTILLA DE NOTIFICACIÓN DE CAMBIO DE EMAIL
// ============================================================================
export function emailChangeNotificationTemplate(
  nombre: string,
  emailAnterior: string,
  emailNuevo: string
) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cambio de Email - AnyssaMed</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f7fa; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f7fa;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        
        <table width="100%" max-width="600px" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:#ffffff; border-radius:12px; box-shadow:0 10px 40px rgba(0,0,0,0.1); overflow:hidden;">
          
          <!-- ENCABEZADO -->
          <tr>
            <td style="background:linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%); padding:50px 40px; text-align:center;">
              
              <div style="font-size:48px; margin-bottom:16px;">
                📧
              </div>
              
              <div style="font-size:28px; font-weight:900; color:#ffffff; letter-spacing:-1px;">
                Cambio de Email Realizado
              </div>
              
            </td>
          </tr>

          <!-- CONTENIDO -->
          <tr>
            <td style="padding:50px 40px;">
              
              <p style="margin:0 0 28px 0; font-size:16px; color:#0F172A; line-height:1.6;">
                Hola <strong>${nombre}</strong>,
              </p>

              <p style="margin:0 0 28px 0; font-size:15px; color:#475569; line-height:1.6;">
                Tu correo electrónico ha sido actualizado exitosamente por un administrador de AnyssaMed.
              </p>

              <!-- INFORMACIÓN DE CAMBIO -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0; background:#F3F4F6; border-radius:12px; overflow:hidden;">
                <tr>
                  <td style="padding:24px;">
                    
                    <!-- Email Anterior -->
                    <div style="margin-bottom:20px; padding-bottom:20px; border-bottom:1px solid #E5E7EB;">
                      <div style="font-size:12px; font-weight:700; color:#64748B; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px;">
                        ❌ Email Anterior
                      </div>
                      <div style="font-size:14px; font-weight:600; color:#475569; font-family:'Courier New', monospace; word-break:break-all;">
                        ${emailAnterior}
                      </div>
                    </div>

                    <!-- Email Nuevo -->
                    <div>
                      <div style="font-size:12px; font-weight:700; color:#16A34A; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px;">
                        ✅ Email Nuevo
                      </div>
                      <div style="font-size:14px; font-weight:600; color:#15803D; font-family:'Courier New', monospace; word-break:break-all;">
                        ${emailNuevo}
                      </div>
                    </div>

                  </td>
                </tr>
              </table>

              <!-- NOTA IMPORTANTE -->
              <div style="background:linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(34, 197, 94, 0.04) 100%); border:1px solid #DCFCE7; border-radius:10px; padding:16px; margin-bottom:28px;">
                <div style="font-size:12px; color:#166534; line-height:1.6;">
                  ℹ️ <strong>Nota:</strong> Usa tu nuevo email para acceder a AnyssaMed a partir de ahora. El email anterior ya no será válido.
                </div>
              </div>

              <!-- ADVERTENCIA -->
              <div style="background:linear-gradient(135deg, rgba(220, 38, 38, 0.08) 0%, rgba(220, 38, 38, 0.04) 100%); border:1px solid #FECACA; border-radius:10px; padding:16px;">
                <div style="font-size:12px; color:#7F1D1D; line-height:1.6;">
                  ⚠️ <strong>Si no autorizaste este cambio,</strong> contacta inmediatamente al administrador de tu organización.
                </div>
              </div>

            </td>
          </tr>

          <!-- SEPARADOR -->
          <tr>
            <td style="height:1px; background-color:#E2E8F0;"></td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:32px 40px; background-color:#F8FAFC; text-align:center;">
              
              <div style="margin-bottom:16px;">
                <a href="mailto:soporte@anyssamed.com" style="display:inline-block; text-decoration:none; color:#2563EB; font-size:12px; font-weight:600;">
                  Contactar Soporte
                </a>
              </div>

              <div style="font-size:11px; color:#94A3B8;">
                © ${new Date().getFullYear()} AnyssaMed
              </div>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `;
}

// ============================================================================
// ✅ PLANTILLA DE CONFIRMACIÓN DE CUENTA ACTIVADA
// ============================================================================
export function accountActivatedTemplate(
  nombre: string,
  email: string,
  loginUrl: string
) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cuenta Activada - AnyssaMed</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f7fa; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f7fa;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        
        <table width="100%" max-width="600px" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:#ffffff; border-radius:12px; box-shadow:0 10px 40px rgba(0,0,0,0.1); overflow:hidden;">
          
          <!-- ENCABEZADO EXITOSO -->
          <tr>
            <td style="background:linear-gradient(135deg, #22C55E 0%, #16A34A 100%); padding:50px 40px; text-align:center;">
              
              <div style="font-size:56px; margin-bottom:16px; animation:bounce 1s;">
                ✅
              </div>
              
              <div style="font-size:28px; font-weight:900; color:#ffffff; letter-spacing:-1px;">
                ¡Cuenta Activada!
              </div>
              
            </td>
          </tr>

          <!-- CONTENIDO -->
          <tr>
            <td style="padding:50px 40px;">
              
              <p style="margin:0 0 24px 0; font-size:16px; color:#0F172A; line-height:1.6;">
                Hola <strong>${nombre}</strong>,
              </p>

              <p style="margin:0 0 28px 0; font-size:15px; color:#475569; line-height:1.6;">
                ¡Excelente! Tu cuenta en AnyssaMed ha sido activada y está lista para usar. Ya puedes acceder a todas las funcionalidades de la plataforma.
              </p>

              <!-- ESTADO DE CUENTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0; background:linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%); border-radius:12px; border:2px solid #86EFAC; overflow:hidden;">
                <tr>
                  <td style="padding:28px 24px; text-align:center;">
                    
                    <div style="font-size:14px; font-weight:700; color:#166534; margin-bottom:12px;">
                      🎉 Tu Cuenta Está Lista
                    </div>

                    <div style="font-size:12px; color:#16A34A; line-height:1.6;">
                      Correo: <strong>${email}</strong><br>
                      Estado: <strong style="color:#22C55E;">✓ Activo</strong>
                    </div>

                  </td>
                </tr>
              </table>

              <!-- BOTÓN PRINCIPAL -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" style="display:inline-block; background:linear-gradient(135deg, #22C55E 0%, #16A34A 100%); color:#ffffff; text-decoration:none; padding:16px 48px; font-size:16px; font-weight:700; border-radius:10px; box-shadow:0 8px 24px rgba(34, 197, 94, 0.3);">
                      🚀 Ir a AnyssaMed
                    </a>
                  </td>
                </tr>
              </table>

              <!-- BENEFICIOS -->
              <div style="background:#F8FAFC; border-radius:12px; padding:24px;">
                
                <div style="font-size:13px; font-weight:700; color:#0F172A; margin-bottom:16px;">
                  🌟 Ahora tienes acceso a:
                </div>

                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:8px 0; font-size:13px; color:#475569;">
                      ✓ Gestión completa de pacientes
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0; font-size:13px; color:#475569;">
                      ✓ Agenda de citas inteligente
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0; font-size:13px; color:#475569;">
                      ✓ Prescripciones digitales
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0; font-size:13px; color:#475569;">
                      ✓ Reportes y análisis
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0; font-size:13px; color:#475569;">
                      ✓ Soporte 24/7
                    </td>
                  </tr>
                </table>

              </div>

            </td>
          </tr>

          <!-- SEPARADOR -->
          <tr>
            <td style="height:1px; background-color:#E2E8F0;"></td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:32px 40px; background-color:#F8FAFC; text-align:center;">
              
              <div style="margin-bottom:16px;">
                <a href="https://anyssamed.com/ayuda" style="display:inline-block; margin:0 10px; text-decoration:none; color:#2563EB; font-size:12px; font-weight:600;">
                  Centro de Ayuda
                </a>
                <span style="color:#CBD5E1;">•</span>
                <a href="mailto:soporte@anyssamed.com" style="display:inline-block; margin:0 10px; text-decoration:none; color:#2563EB; font-size:12px; font-weight:600;">
                  Soporte
                </a>
              </div>

              <div style="font-size:11px; color:#94A3B8;">
                © ${new Date().getFullYear()} AnyssaMed • Todos los derechos reservados
              </div>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `;
}
