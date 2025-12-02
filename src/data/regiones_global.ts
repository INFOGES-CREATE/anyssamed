// ============================================================================
// DATASET GLOBAL DE REGIONES / ESTADOS (BASE)
// ---------------------------------------------------------------------------
// - Pensado para usarse con /api/geo/regiones
// - No hace llamadas externas: solo se importa este array
// - Estructura pensada para ser simple y estable en el tiempo
// - Puedes extenderlo con más países sin romper nada
// ============================================================================

export interface RegionGlobal {
  /** Código ISO 3166-1 alpha-2 del país (CL, HT, AT, US, etc.) */
  country_code: string;
  /** Código de la subdivisión (idealmente ISO 3166-2, si está disponible) */
  code: string;
  /** Nombre legible de la región/estado/provincia */
  name: string;
}

const regionesGlobal: RegionGlobal[] = [
  // ==========================================================================
  // CHILE (CL) - 16 regiones
  // ==========================================================================
  { country_code: "CL", code: "CL-AP", name: "Arica y Parinacota" },
  { country_code: "CL", code: "CL-TA", name: "Tarapacá" },
  { country_code: "CL", code: "CL-AN", name: "Antofagasta" },
  { country_code: "CL", code: "CL-AT", name: "Atacama" },
  { country_code: "CL", code: "CL-CO", name: "Coquimbo" },
  { country_code: "CL", code: "CL-VS", name: "Valparaíso" },
  { country_code: "CL", code: "CL-RM", name: "Región Metropolitana de Santiago" },
  { country_code: "CL", code: "CL-LI", name: "Libertador General Bernardo O’Higgins" },
  { country_code: "CL", code: "CL-ML", name: "Maule" },
  { country_code: "CL", code: "CL-NB", name: "Ñuble" },
  { country_code: "CL", code: "CL-BI", name: "Biobío" },
  { country_code: "CL", code: "CL-AR", name: "La Araucanía" },
  { country_code: "CL", code: "CL-LR", name: "Los Ríos" },
  { country_code: "CL", code: "CL-LL", name: "Los Lagos" },
  { country_code: "CL", code: "CL-AI", name: "Aysén del General Carlos Ibáñez del Campo" },
  { country_code: "CL", code: "CL-MA", name: "Magallanes y de la Antártica Chilena" },

  // ==========================================================================
  // HAITÍ (HT) - 10 departamentos
  // ==========================================================================
  { country_code: "HT", code: "HT-AR", name: "Artibonite" },
  { country_code: "HT", code: "HT-CE", name: "Centre" },
  { country_code: "HT", code: "HT-GA", name: "Grand’Anse" },
  { country_code: "HT", code: "HT-ND", name: "Nord" },
  { country_code: "HT", code: "HT-NE", name: "Nord-Est" },
  { country_code: "HT", code: "HT-NO", name: "Nord-Ouest" },
  { country_code: "HT", code: "HT-OU", name: "Ouest" },
  { country_code: "HT", code: "HT-SD", name: "Sud" },
  { country_code: "HT", code: "HT-SE", name: "Sud-Est" },
  { country_code: "HT", code: "HT-NI", name: "Nippes" },

  // ==========================================================================
  // AUSTRIA (AT) - 9 estados federados (ejemplo de tu prueba AT)
  // ==========================================================================
  { country_code: "AT", code: "AT-1", name: "Burgenland" },
  { country_code: "AT", code: "AT-2", name: "Kärnten" },
  { country_code: "AT", code: "AT-3", name: "Niederösterreich" },
  { country_code: "AT", code: "AT-4", name: "Oberösterreich" },
  { country_code: "AT", code: "AT-5", name: "Salzburg" },
  { country_code: "AT", code: "AT-6", name: "Steiermark" },
  { country_code: "AT", code: "AT-7", name: "Tirol" },
  { country_code: "AT", code: "AT-8", name: "Vorarlberg" },
  { country_code: "AT", code: "AT-9", name: "Wien" },

  // ==========================================================================
  // ESPAÑA (ES) - Comunidades Autónomas (simplificado)
  // ==========================================================================
  { country_code: "ES", code: "ES-AN", name: "Andalucía" },
  { country_code: "ES", code: "ES-AR", name: "Aragón" },
  { country_code: "ES", code: "ES-AS", name: "Asturias" },
  { country_code: "ES", code: "ES-CN", name: "Canarias" },
  { country_code: "ES", code: "ES-CB", name: "Cantabria" },
  { country_code: "ES", code: "ES-CL", name: "Castilla y León" },
  { country_code: "ES", code: "ES-CM", name: "Castilla-La Mancha" },
  { country_code: "ES", code: "ES-CT", name: "Cataluña" },
  { country_code: "ES", code: "ES-EX", name: "Extremadura" },
  { country_code: "ES", code: "ES-GA", name: "Galicia" },
  { country_code: "ES", code: "ES-IB", name: "Islas Baleares" },
  { country_code: "ES", code: "ES-RI", name: "La Rioja" },
  { country_code: "ES", code: "ES-MD", name: "Comunidad de Madrid" },
  { country_code: "ES", code: "ES-MC", name: "Región de Murcia" },
  { country_code: "ES", code: "ES-NC", name: "Comunidad Foral de Navarra" },
  { country_code: "ES", code: "ES-PV", name: "País Vasco" },
  { country_code: "ES", code: "ES-VC", name: "Comunidad Valenciana" },
  { country_code: "ES", code: "ES-CE", name: "Ceuta" },
  { country_code: "ES", code: "ES-ML", name: "Melilla" },

  // ==========================================================================
  // ESTADOS UNIDOS (US) - 50 estados + DC (simplificado)
  // ==========================================================================
  { country_code: "US", code: "US-AL", name: "Alabama" },
  { country_code: "US", code: "US-AK", name: "Alaska" },
  { country_code: "US", code: "US-AZ", name: "Arizona" },
  { country_code: "US", code: "US-AR", name: "Arkansas" },
  { country_code: "US", code: "US-CA", name: "California" },
  { country_code: "US", code: "US-CO", name: "Colorado" },
  { country_code: "US", code: "US-CT", name: "Connecticut" },
  { country_code: "US", code: "US-DE", name: "Delaware" },
  { country_code: "US", code: "US-FL", name: "Florida" },
  { country_code: "US", code: "US-GA", name: "Georgia" },
  { country_code: "US", code: "US-HI", name: "Hawái" },
  { country_code: "US", code: "US-ID", name: "Idaho" },
  { country_code: "US", code: "US-IL", name: "Illinois" },
  { country_code: "US", code: "US-IN", name: "Indiana" },
  { country_code: "US", code: "US-IA", name: "Iowa" },
  { country_code: "US", code: "US-KS", name: "Kansas" },
  { country_code: "US", code: "US-KY", name: "Kentucky" },
  { country_code: "US", code: "US-LA", name: "Luisiana" },
  { country_code: "US", code: "US-ME", name: "Maine" },
  { country_code: "US", code: "US-MD", name: "Maryland" },
  { country_code: "US", code: "US-MA", name: "Massachusetts" },
  { country_code: "US", code: "US-MI", name: "Míchigan" },
  { country_code: "US", code: "US-MN", name: "Minnesota" },
  { country_code: "US", code: "US-MS", name: "Misisipi" },
  { country_code: "US", code: "US-MO", name: "Misuri" },
  { country_code: "US", code: "US-MT", name: "Montana" },
  { country_code: "US", code: "US-NE", name: "Nebraska" },
  { country_code: "US", code: "US-NV", name: "Nevada" },
  { country_code: "US", code: "US-NH", name: "Nuevo Hampshire" },
  { country_code: "US", code: "US-NJ", name: "Nueva Jersey" },
  { country_code: "US", code: "US-NM", name: "Nuevo México" },
  { country_code: "US", code: "US-NY", name: "Nueva York" },
  { country_code: "US", code: "US-NC", name: "Carolina del Norte" },
  { country_code: "US", code: "US-ND", name: "Dakota del Norte" },
  { country_code: "US", code: "US-OH", name: "Ohio" },
  { country_code: "US", code: "US-OK", name: "Oklahoma" },
  { country_code: "US", code: "US-OR", name: "Oregón" },
  { country_code: "US", code: "US-PA", name: "Pensilvania" },
  { country_code: "US", code: "US-RI", name: "Rhode Island" },
  { country_code: "US", code: "US-SC", name: "Carolina del Sur" },
  { country_code: "US", code: "US-SD", name: "Dakota del Sur" },
  { country_code: "US", code: "US-TN", name: "Tennessee" },
  { country_code: "US", code: "US-TX", name: "Texas" },
  { country_code: "US", code: "US-UT", name: "Utah" },
  { country_code: "US", code: "US-VT", name: "Vermont" },
  { country_code: "US", code: "US-VA", name: "Virginia" },
  { country_code: "US", code: "US-WA", name: "Washington" },
  { country_code: "US", code: "US-WV", name: "Virginia Occidental" },
  { country_code: "US", code: "US-WI", name: "Wisconsin" },
  { country_code: "US", code: "US-WY", name: "Wyoming" },
  { country_code: "US", code: "US-DC", name: "Distrito de Columbia" },

  // ==========================================================================
  // BRASIL (BR) - 26 estados + Distrito Federal
  // ==========================================================================
  { country_code: "BR", code: "BR-AC", name: "Acre" },
  { country_code: "BR", code: "BR-AL", name: "Alagoas" },
  { country_code: "BR", code: "BR-AM", name: "Amazonas" },
  { country_code: "BR", code: "BR-AP", name: "Amapá" },
  { country_code: "BR", code: "BR-BA", name: "Bahía" },
  { country_code: "BR", code: "BR-CE", name: "Ceará" },
  { country_code: "BR", code: "BR-DF", name: "Distrito Federal" },
  { country_code: "BR", code: "BR-ES", name: "Espírito Santo" },
  { country_code: "BR", code: "BR-GO", name: "Goiás" },
  { country_code: "BR", code: "BR-MA", name: "Maranhão" },
  { country_code: "BR", code: "BR-MG", name: "Minas Gerais" },
  { country_code: "BR", code: "BR-MS", name: "Mato Grosso do Sul" },
  { country_code: "BR", code: "BR-MT", name: "Mato Grosso" },
  { country_code: "BR", code: "BR-PA", name: "Pará" },
  { country_code: "BR", code: "BR-PB", name: "Paraíba" },
  { country_code: "BR", code: "BR-PE", name: "Pernambuco" },
  { country_code: "BR", code: "BR-PI", name: "Piauí" },
  { country_code: "BR", code: "BR-PR", name: "Paraná" },
  { country_code: "BR", code: "BR-RJ", name: "Río de Janeiro" },
  { country_code: "BR", code: "BR-RN", name: "Rio Grande do Norte" },
  { country_code: "BR", code: "BR-RO", name: "Rondônia" },
  { country_code: "BR", code: "BR-RR", name: "Roraima" },
  { country_code: "BR", code: "BR-RS", name: "Rio Grande do Sul" },
  { country_code: "BR", code: "BR-SC", name: "Santa Catarina" },
  { country_code: "BR", code: "BR-SE", name: "Sergipe" },
  { country_code: "BR", code: "BR-SP", name: "São Paulo" },
  { country_code: "BR", code: "BR-TO", name: "Tocantins" },

  // ==========================================================================
  // MÉXICO (MX) - 32 entidades federativas
  // ==========================================================================
  { country_code: "MX", code: "MX-AGU", name: "Aguascalientes" },
  { country_code: "MX", code: "MX-BCN", name: "Baja California" },
  { country_code: "MX", code: "MX-BCS", name: "Baja California Sur" },
  { country_code: "MX", code: "MX-CAM", name: "Campeche" },
  { country_code: "MX", code: "MX-CHP", name: "Chiapas" },
  { country_code: "MX", code: "MX-CHH", name: "Chihuahua" },
  { country_code: "MX", code: "MX-COA", name: "Coahuila" },
  { country_code: "MX", code: "MX-COL", name: "Colima" },
  { country_code: "MX", code: "MX-DUR", name: "Durango" },
  { country_code: "MX", code: "MX-GUA", name: "Guanajuato" },
  { country_code: "MX", code: "MX-GRO", name: "Guerrero" },
  { country_code: "MX", code: "MX-HID", name: "Hidalgo" },
  { country_code: "MX", code: "MX-JAL", name: "Jalisco" },
  { country_code: "MX", code: "MX-MEX", name: "Estado de México" },
  { country_code: "MX", code: "MX-MIC", name: "Michoacán" },
  { country_code: "MX", code: "MX-MOR", name: "Morelos" },
  { country_code: "MX", code: "MX-NAY", name: "Nayarit" },
  { country_code: "MX", code: "MX-NLE", name: "Nuevo León" },
  { country_code: "MX", code: "MX-OAX", name: "Oaxaca" },
  { country_code: "MX", code: "MX-PUE", name: "Puebla" },
  { country_code: "MX", code: "MX-QUE", name: "Querétaro" },
  { country_code: "MX", code: "MX-ROO", name: "Quintana Roo" },
  { country_code: "MX", code: "MX-SLP", name: "San Luis Potosí" },
  { country_code: "MX", code: "MX-SIN", name: "Sinaloa" },
  { country_code: "MX", code: "MX-SON", name: "Sonora" },
  { country_code: "MX", code: "MX-TAB", name: "Tabasco" },
  { country_code: "MX", code: "MX-TAM", name: "Tamaulipas" },
  { country_code: "MX", code: "MX-TLA", name: "Tlaxcala" },
  { country_code: "MX", code: "MX-VER", name: "Veracruz" },
  { country_code: "MX", code: "MX-YUC", name: "Yucatán" },
  { country_code: "MX", code: "MX-ZAC", name: "Zacatecas" },
  { country_code: "MX", code: "MX-CMX", name: "Ciudad de México" },

  // ==========================================================================
  // ⚠️ NOTA:
  // Aquí ya tienes varios países completos (CL, HT, AT, ES, US, BR, MX).
  // Puedes seguir agregando más países siguiendo esta misma estructura:
  //
  // { country_code: "PAIS", code: "PAIS-REGION", name: "Nombre de la región" },
  //
  // Si quieres, se puede generar automáticamente este archivo completo
  // a partir de un dataset ISO-3166-2 oficial con un script Node que
  // ejecutas UNA sola vez, y luego nunca más dependes de APIs externas.
  // ==========================================================================
];

export default regionesGlobal;
