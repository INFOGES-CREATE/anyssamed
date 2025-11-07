// types/auth.ts
/**
 * 📝 TIPOS E INTERFACES DE AUTENTICACIÓN
 * ======================================
 * Definiciones de tipos TypeScript para el sistema de autenticación
 */

/**
 * Tipo de usuario en el sistema
 */
export type UserType = 'paciente' | 'medico' | 'administrativo' | 'tecnico' | 'secretaria';

/**
 * Estado de un usuario
 */
export type UserStatus = 'activo' | 'inactivo' | 'bloqueado' | 'pendiente';

/**
 * Interfaz de Usuario base
 */
export interface User {
  id: number;
  email: string;
  nombre: string;
  apellido?: string;
  telefono?: string;
  rut?: string;
  fecha_nacimiento?: string;
  tipo: UserType;
  estado: UserStatus;
  foto_perfil?: string;
  ultimo_acceso?: string;
  fecha_creacion: string;
  fecha_actualizacion?: string;
}

/**
 * Usuario de la tabla 'usuarios'
 */
export interface Usuario extends User {
  password: string;
  requiere_cambio_password: boolean;
  intentos_fallidos: number;
  bloqueado_hasta?: string;
  token_recuperacion?: string;
  token_expiracion?: string;
  telefono_verificado: boolean;
  email_verificado: boolean;
  two_factor_enabled: boolean;
  two_factor_secret?: string;
}

/**
 * Paciente (tabla 'pacientes')
 */
export interface Paciente {
  id: number;
  usuario_id: number;
  rut: string;
  nombre: string;
  apellidos: string;
  fecha_nacimiento: string;
  sexo: 'M' | 'F' | 'Otro';
  telefono: string;
  email: string;
  direccion?: string;
  comuna?: string;
  region?: string;
  prevision?: string;
  grupo_sanguineo?: string;
  contacto_emergencia?: string;
  telefono_emergencia?: string;
  foto?: string;
  estado: 'activo' | 'inactivo';
  fecha_registro: string;
  ultima_actualizacion?: string;
}

/**
 * Médico (tabla 'medicos')
 */
export interface Medico {
  id: number;
  usuario_id: number;
  rut: string;
  nombre: string;
  apellidos: string;
  especialidad_id?: number;
  numero_registro?: string;
  telefono: string;
  email: string;
  direccion?: string;
  foto?: string;
  estado: 'activo' | 'inactivo';
  fecha_ingreso: string;
  ultima_actualizacion?: string;
}

/**
 * Administrativo (tabla 'administrativos')
 */
export interface Administrativo {
  id: number;
  usuario_id: number;
  rut: string;
  nombre: string;
  apellidos: string;
  cargo?: string;
  departamento?: string;
  telefono: string;
  email: string;
  fecha_ingreso: string;
  estado: 'activo' | 'inactivo';
}

/**
 * Secretaria (tabla 'secretarias')
 */
export interface Secretaria {
  id: number;
  usuario_id: number;
  rut: string;
  nombre: string;
  apellidos: string;
  telefono: string;
  email: string;
  fecha_ingreso: string;
  estado: 'activo' | 'inactivo';
}

/**
 * Técnico (tabla 'tecnicos')
 */
export interface Tecnico {
  id: number;
  usuario_id: number;
  rut: string;
  nombre: string;
  apellidos: string;
  especialidad?: string;
  telefono: string;
  email: string;
  fecha_ingreso: string;
  estado: 'activo' | 'inactivo';
}

/**
 * Datos de login
 */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Datos de registro de usuario
 */
export interface RegisterData {
  email: string;
  password: string;
  nombre: string;
  apellido?: string;
  rut?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  tipo: UserType;
}

/**
 * Datos de registro específicos de paciente
 */
export interface RegisterPacienteData extends RegisterData {
  tipo: 'paciente';
  sexo: 'M' | 'F' | 'Otro';
  direccion?: string;
  comuna?: string;
  region?: string;
  prevision?: string;
  contacto_emergencia?: string;
  telefono_emergencia?: string;
}

/**
 * Datos de registro específicos de médico
 */
export interface RegisterMedicoData extends RegisterData {
  tipo: 'medico';
  especialidad_id?: number;
  numero_registro?: string;
}

/**
 * Respuesta de autenticación exitosa
 */
export interface AuthResponse {
  success: true;
  message: string;
  user: {
    id: number;
    email: string;
    nombre: string;
    tipo: UserType;
    estado: UserStatus;
  };
  token: string;
  expiresIn: string;
}

/**
 * Respuesta de error de autenticación
 */
export interface AuthErrorResponse {
  success: false;
  error: string;
  message: string;
  code?: string;
  details?: any;
}

/**
 * Respuesta de la sesión actual
 */
export interface SessionResponse {
  authenticated: boolean;
  user?: {
    id: number;
    email: string;
    nombre: string;
    tipo: UserType;
    estado: UserStatus;
    ultimo_acceso?: string;
  } | null;
}

/**
 * Datos para cambio de contraseña
 */
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Datos para recuperación de contraseña
 */
export interface ForgotPasswordData {
  email: string;
}

/**
 * Datos para resetear contraseña
 */
export interface ResetPasswordData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Opciones de verificación 2FA
 */
export interface TwoFactorData {
  code: string;
  userId: number;
}

/**
 * Respuesta genérica de API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Rol y permisos
 */
export interface Role {
  id: number;
  nombre: string;
  descripcion?: string;
  permisos: string[];
}

/**
 * Permiso específico
 */
export interface Permission {
  id: number;
  nombre: string;
  descripcion?: string;
  recurso: string;
  accion: 'crear' | 'leer' | 'actualizar' | 'eliminar';
}

/**
 * Auditoría de acceso
 */
export interface AuditLog {
  id: number;
  usuario_id: number;
  accion: string;
  descripcion?: string;
  ip_address?: string;
  user_agent?: string;
  fecha: string;
}

/**
 * Sesión de usuario
 */
export interface UserSession {
  id: string;
  usuario_id: number;
  token: string;
  ip_address?: string;
  user_agent?: string;
  fecha_creacion: string;
  fecha_expiracion: string;
  activa: boolean;
}

/**
 * Configuración de seguridad del usuario
 */
export interface SecuritySettings {
  two_factor_enabled: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  login_alerts: boolean;
  password_expires_at?: string;
  last_password_change?: string;
}

/**
 * Estadísticas de usuario
 */
export interface UserStats {
  total_logins: number;
  last_login?: string;
  failed_attempts: number;
  password_age_days: number;
  sessions_active: number;
}

/**
 * Token de autenticación decodificado
 */
export interface DecodedToken {
  userId: number;
  email: string;
  nombre?: string;
  tipo?: UserType;
  iat: number;
  exp: number;
}

/**
 * Contexto de autenticación para React
 */
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  refreshUser: () => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
}