// hooks/useAuth.ts
/**
 * 🪝 HOOK DE AUTENTICACIÓN
 * ========================
 * Hook personalizado para gestionar autenticación en componentes React
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LoginCredentials, 
  RegisterData, 
  ChangePasswordData, 
  SessionResponse,
  AuthResponse 
} from '@/types/auth';

/**
 * Estado del hook de autenticación
 */
interface UseAuthReturn {
  // Estado
  user: SessionResponse['user'] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Acciones
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook useAuth - Gestiona autenticación del usuario
 */
export function useAuth(): UseAuthReturn {
  const router = useRouter();
  
  const [user, setUser] = useState<SessionResponse['user'] | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Limpia el error actual
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  /**
   * Verifica y carga la sesión actual
   */
  const refreshUser = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      const data: SessionResponse = await response.json();
      
      if (data.authenticated && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        console.log('✅ Sesión verificada:', data.user.email);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err: any) {
      console.error('❌ Error al verificar sesión:', err);
      setUser(null);
      setIsAuthenticated(false);
      setError('Error al verificar la sesión');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Login de usuario
   */
  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.message || 'Error al iniciar sesión');
        throw new Error(data.message || 'Error al iniciar sesión');
      }
      
      if (data.success) {
        // Recargar información del usuario
        await refreshUser();
        
        console.log('✅ Login exitoso:', data.user.email);
        
        // Si requiere cambio de contraseña, redirigir
        if (data.requiere_cambio_password) {
          router.push('/cambiar-password?force=true');
        }
        
        // Si requiere 2FA, no redirigir aún
        if (data.requires_2fa) {
          // Aquí podrías redirigir a una página de verificación 2FA
          console.log('🔐 Requiere verificación 2FA');
        }
        
        return data as AuthResponse;
      } else {
        setError(data.message || 'Error desconocido');
        throw new Error(data.message || 'Error desconocido');
      }
    } catch (err: any) {
      console.error('❌ Error en login:', err);
      const errorMessage = err.message || 'Error al iniciar sesión';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [refreshUser, router]);
  
  /**
   * Registro de usuario
   */
  const register = useCallback(async (data: RegisterData): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        setError(result.message || 'Error al registrar usuario');
        throw new Error(result.message || 'Error al registrar usuario');
      }
      
      if (result.success) {
        // Recargar información del usuario
        await refreshUser();
        
        console.log('✅ Registro exitoso:', result.user.email);
        
        return result as AuthResponse;
      } else {
        setError(result.message || 'Error desconocido');
        throw new Error(result.message || 'Error desconocido');
      }
    } catch (err: any) {
      console.error('❌ Error en registro:', err);
      const errorMessage = err.message || 'Error al registrar usuario';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [refreshUser]);
  
  /**
   * Logout de usuario
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      // Limpiar estado
      setUser(null);
      setIsAuthenticated(false);
      
      console.log('✅ Logout exitoso');
      
      // Redirigir al login
      router.push('/login');
    } catch (err: any) {
      console.error('❌ Error en logout:', err);
      setError('Error al cerrar sesión');
      
      // Limpiar estado de todos modos
      setUser(null);
      setIsAuthenticated(false);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);
  
  /**
   * Cambiar contraseña
   */
  const changePassword = useCallback(async (data: ChangePasswordData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        setError(result.message || 'Error al cambiar contraseña');
        throw new Error(result.message || 'Error al cambiar contraseña');
      }
      
      if (result.success) {
        console.log('✅ Contraseña cambiada exitosamente');
      } else {
        setError(result.message || 'Error desconocido');
        throw new Error(result.message || 'Error desconocido');
      }
    } catch (err: any) {
      console.error('❌ Error al cambiar contraseña:', err);
      const errorMessage = err.message || 'Error al cambiar contraseña';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Effect: Verificar sesión al montar el componente
   */
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);
  
  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    register,
    changePassword,
    refreshUser,
    clearError,
  };
}

/**
 * Hook useRequireAuth - Redirige si el usuario no está autenticado
 * Útil para páginas que requieren autenticación
 */
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);
  
  return { isAuthenticated, isLoading };
}