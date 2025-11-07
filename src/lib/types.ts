// src/lib/types.ts
export type LoginInput = {
  identificador: string // username o email
  password: string
  otp?: string
}

export type Usuario = {
  id_usuario: number
  username: string
  email: string
  nombre: string
  apellido_paterno: string
  apellido_materno?: string
  password_hash: string
  estado: 'activo' | 'inactivo' | 'bloqueado' | 'pendiente_activacion'
  intentos_fallidos: number
  requiere_cambio_password: boolean
  autenticacion_doble_factor: boolean
  secret_2fa?: string
  id_centro_principal?: number
  id_sucursal_principal?: number
  ultimo_login?: Date
}

export type JWTPayload = {
  sub: number
  username: string
  email: string
  roles: string[]
  centro?: number
  sucursal?: number
}