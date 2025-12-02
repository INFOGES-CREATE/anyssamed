// ============================================================================
// DATASET GLOBAL DE COMUNAS / MUNICIPIOS
// ----------------------------------------------------------------------------
// - Pensado para usarse con /api/geo/comunas
// - No hace llamadas externas: solo se importa este array
// - Estructura simple y compatible con tu RegionGlobal
// - country_code + region_code + code permiten filtrar en cascada
// ============================================================================

export interface ComunaGlobal {
  /** Código ISO 3166-1 alpha-2 del país (CL, HT, AT, US, etc.) */
  country_code: string;
  /** Código de la región / estado (idealmente ISO 3166-2, si está disponible) */
  region_code: string;
  /** Código interno/legible de la comuna/municipio (puede ser oficial o propio) */
  code: string;
  /** Nombre legible de la comuna / municipio */
  name: string;
}

const comunasGlobal: ComunaGlobal[] = [
  // ==========================================================================
  // CHILE (CL) - EJEMPLOS (REGIÓN METROPOLITANA) 
  // ==========================================================================

  { country_code: "CL", region_code: "CL-RM", code: "CL-RM-SANTIAGO", name: "Santiago" },
  { country_code: "CL", region_code: "CL-RM", code: "CL-RM-MAIPU", name: "Maipú" },
  { country_code: "CL", region_code: "CL-RM", code: "CL-RM-LAS_CONDES", name: "Las Condes" },
  { country_code: "CL", region_code: "CL-RM", code: "CL-RM-PROVIDENCIA", name: "Providencia" },
  { country_code: "CL", region_code: "CL-RM", code: "CL-RM-PUENTE_ALTO", name: "Puente Alto" },
  { country_code: "CL", region_code: "CL-RM", code: "CL-RM-LA_FLORIDA", name: "La Florida" },

  // ==========================================================================
  // CHILE (CL) - REGIÓN DEL MAULE (CL-ML) - TODAS LAS COMUNAS
  // --------------------------------------------------------------------------
  // Provincia de Curicó
  // --------------------------------------------------------------------------

  { country_code: "CL", region_code: "CL-ML", code: "CL-ML-CURICO", name: "Curicó" },
  { country_code: "CL", region_code: "CL-ML", code: "CL-ML-HUALANE", name: "Hualañé" },
  { country_code: "CL", region_code: "CL-ML", code: "CL-ML-LICANTEN", name: "Licantén" },
  { country_code: "CL", region_code: "CL-ML", code: "CL-ML-MOLINA", name: "Molina" },
  { country_code: "CL", region_code: "CL-ML", code: "CL-ML-RAUCO", name: "Rauco" },
  { country_code: "CL", region_code: "CL-ML", code: "CL-ML-ROMERAL", name: "Romeral" },
  { country_code: "CL", region_code: "CL-ML", code: "CL-ML-SAGRADA_FAMILIA", name: "Sagrada Familia" },
  { country_code: "CL", region_code: "CL-ML", code: "CL-ML-TENO", name: "Teno" },
  { country_code: "CL", region_code: "CL-ML", code: "CL-ML-VICHUQUEN", name: "Vichuquén" },

  // --------------------------------------------------------------------------
  // Provincia de Talca
  // --------------------------------------------------------------------------

  { country_code: "CL", region_code: "CL-ML", code: "CL-ML-TALCA", name: "Talca" },
  { country_code: "CL", region_code: "CL-ML", code: "CL-ML-CONSTITUCION", name: "Constitución" },
  { country_code: "CL", region_code: "CL-ML", code: "CL-ML-CUREPTO", name: "Curepto" },
  { country_code: "CL", region_code: "CL-ML", code: "CL-ML-EMPEDRADO", name: "Empedrado" },
  { country_code: "CL", region_code: "CL-ML", code: "CL-ML-MAULE", name: "Maule" },
  { country_code: "CL", region_code: "CL-ML", code: "CL-ML-PELARCO", name: "Pelarco" },
  { country_code: "CL", region_code: "CL-ML", code: "CL-ML-PENCAHUE", name: "Pencahue" },
  { country_code: "CL", region_code: "CL-ML", code: "CL-ML-RIO_CLARO", name: "Río Claro" },
  { country_code: "CL", region_code: "CL-ML", code: "CL-ML-SAN_CLEMENTE", name: "San Clemente" },
  { country_code: "CL", region_code: "CL-ML", code: "CL-ML-SAN_RAFAEL", name: "San Rafael" },

  // --------------------------------------------------------------------------
  // Provincia de Linares
  // --------------------------------------------------------------------------

  { country_code: "CL", region_code: "CL-ML", code: "CL-ML-LINARES", name: "Linares" },
  { country_code: "CL", region_code: "CL-ML", code: "CL-ML-COLBUN", name: "Colbún" },
  { country_code: "CL", region_code: "CL-ML", code: "CL-ML-LONGAVI", name: "Longaví" },
  { country_code: "CL", region_code: "CL-ML", code: "CL-ML-PARRAL", name: "Parral" },
  { country_code: "CL", region_code: "CL-ML", code: "CL-ML-RETIRO", name: "Retiro" },
  { country_code: "CL", region_code: "CL-ML", code: "CL-ML-SAN_JAVIER", name: "San Javier" },
  { country_code: "CL", region_code: "CL-ML", code: "CL-ML-VILLA_ALEGRE", name: "Villa Alegre" },
  { country_code: "CL", region_code: "CL-ML", code: "CL-ML-YERBAS_BUENAS", name: "Yerbas Buenas" },

  // --------------------------------------------------------------------------
  // Provincia de Cauquenes
  // --------------------------------------------------------------------------

  { country_code: "CL", region_code: "CL-ML", code: "CL-ML-CAUQUENES", name: "Cauquenes" },
  { country_code: "CL", region_code: "CL-ML", code: "CL-ML-CHANCO", name: "Chanco" },
  { country_code: "CL", region_code: "CL-ML", code: "CL-ML-PELLUHUE", name: "Pelluhue" },

  // ==========================================================================
  // A PARTIR DE AQUÍ PUEDES EXTENDER:
  // - Resto de comunas de Chile (todas las regiones)
  // - Municipios de otros países (city / county / municipio / etc.)
  // Manteniendo SIEMPRE:
  //   country_code  -> "CL"
  //   region_code   -> p.ej. "CL-ML"
  //   code          -> identificador interno legible (SIN espacios)
  //   name          -> nombre oficial mostrado al usuario
  // ==========================================================================
];

export default comunasGlobal;
