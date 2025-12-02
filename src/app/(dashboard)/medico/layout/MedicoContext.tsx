// MedicoContext.tsx
"use client";

import { createContext, useContext } from "react";

export interface UsuarioSesion {
  id_usuario: number;
  username: string;
  email: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  foto_perfil_url: string | null;
  rol?: {
    id_rol: number;
    nombre: string;
    nivel_jerarquia: number;
  };
  medico?: {
    id_profesional: number;
    id_centro_principal: number;
    centro_principal: {
      id_centro: number;
      nombre: string;
      plan: string;
      logo_url: string | null;
      ciudad: string;
      region: string;
    };
    especialidades: Array<{ id_especialidad: number; nombre: string; es_principal: boolean }>;
  };
}

interface MedicoContextType {
  usuario: UsuarioSesion | null;
  loading: boolean;
}

const MedicoContext = createContext<MedicoContextType>({
  usuario: null,
  loading: true,
});

export const useMedico = () => useContext(MedicoContext);

export default MedicoContext;
