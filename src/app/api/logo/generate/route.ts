// app/api/logo/generate/route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

// ========================================
// 🎨 GENERADOR DE LOGOS ULTRA PREMIUM
// ========================================

interface LogoRequest {
  nombre: string;
  region: string;
  tipo: string;
  id_centro: string;
  estilo?: string;
}

// ========================================
// 🌈 PALETAS DE COLORES PREMIUM EXPANDIDAS
// ========================================
const COLORES_REGION: Record<string, { 
  primary: string; 
  secondary: string; 
  accent: string;
  tertiary: string;
  gradient: string[];
  glow: string;
}> = {
  "Región de Arica y Parinacota": {
    primary: "#FF6B6B",
    secondary: "#FFE66D",
    accent: "#4ECDC4",
    tertiary: "#95E1D3",
    gradient: ["#FF6B6B", "#FFE66D", "#4ECDC4", "#95E1D3"],
    glow: "#FF6B6B"
  },
  "Región de Tarapacá": {
    primary: "#4ECDC4",
    secondary: "#FFE66D",
    accent: "#FF6B6B",
    tertiary: "#44A08D",
    gradient: ["#4ECDC4", "#44A08D", "#FFE66D", "#FF6B6B"],
    glow: "#4ECDC4"
  },
  "Región de Antofagasta": {
    primary: "#95E1D3",
    secondary: "#F38181",
    accent: "#AA96DA",
    tertiary: "#AAF2E1",
    gradient: ["#95E1D3", "#AAF2E1", "#F38181", "#AA96DA"],
    glow: "#95E1D3"
  },
  "Región de Atacama": {
    primary: "#AA96DA",
    secondary: "#FCBAD3",
    accent: "#FFFFD2",
    tertiary: "#C896DA",
    gradient: ["#AA96DA", "#C896DA", "#FCBAD3", "#FFFFD2"],
    glow: "#AA96DA"
  },
  "Región de Coquimbo": {
    primary: "#FFFFD2",
    secondary: "#FFB6B9",
    accent: "#FEC8C8",
    tertiary: "#FFE4B5",
    gradient: ["#FFFFD2", "#FFE4B5", "#FFB6B9", "#FEC8C8"],
    glow: "#FFFFD2"
  },
  "Región de Valparaíso": {
    primary: "#8EC5FC",
    secondary: "#E0C3FC",
    accent: "#667EEA",
    tertiary: "#B4D8FF",
    gradient: ["#8EC5FC", "#B4D8FF", "#E0C3FC", "#667EEA"],
    glow: "#8EC5FC"
  },
  "Región Metropolitana de Santiago": {
    primary: "#667EEA",
    secondary: "#764BA2",
    accent: "#F093FB",
    tertiary: "#F5576C",
    gradient: ["#667EEA", "#764BA2", "#F093FB", "#F5576C"],
    glow: "#667EEA"
  },
  "Región del Libertador General Bernardo O'Higgins": {
    primary: "#F093FB",
    secondary: "#F5576C",
    accent: "#FD868C",
    tertiary: "#FF9A9E",
    gradient: ["#F093FB", "#F5576C", "#FD868C", "#FF9A9E"],
    glow: "#F093FB"
  },
  "Región del Maule": {
    primary: "#4FACFE",
    secondary: "#00F2FE",
    accent: "#43E97B",
    tertiary: "#38F9D7",
    gradient: ["#4FACFE", "#00F2FE", "#43E97B", "#38F9D7"],
    glow: "#4FACFE"
  },
  "Región de Ñuble": {
    primary: "#43E97B",
    secondary: "#38F9D7",
    accent: "#4FACFE",
    tertiary: "#30CFD0",
    gradient: ["#43E97B", "#38F9D7", "#4FACFE", "#30CFD0"],
    glow: "#43E97B"
  },
  "Región de La Araucanía": {
    primary: "#FA709A",
    secondary: "#FEE140",
    accent: "#FF6A88",
    tertiary: "#FFB199",
    gradient: ["#FA709A", "#FEE140", "#FF6A88", "#FFB199"],
    glow: "#FA709A"
  },
  "Región de Los Ríos": {
    primary: "#30CFD0",
    secondary: "#330867",
    accent: "#662D8C",
    tertiary: "#2E2E78",
    gradient: ["#30CFD0", "#2E2E78", "#330867", "#662D8C"],
    glow: "#30CFD0"
  },
  "Región de Los Lagos": {
    primary: "#A8EDEA",
    secondary: "#FED6E3",
    accent: "#F38181",
    tertiary: "#D4F5F4",
    gradient: ["#A8EDEA", "#D4F5F4", "#FED6E3", "#F38181"],
    glow: "#A8EDEA"
  },
  "Región de Aysén del General Carlos Ibáñez del Campo": {
    primary: "#FF9A56",
    secondary: "#FF6A88",
    accent: "#FA709A",
    tertiary: "#FF8577",
    gradient: ["#FF9A56", "#FF8577", "#FF6A88", "#FA709A"],
    glow: "#FF9A56"
  },
  "Región de Magallanes y de la Antártica Chilena": {
    primary: "#2E2E78",
    secondary: "#662D8C",
    accent: "#764BA2",
    tertiary: "#4A4E9E",
    gradient: ["#2E2E78", "#4A4E9E", "#662D8C", "#764BA2"],
    glow: "#2E2E78"
  },
};

// ========================================
// 🏥 ICONOS MÉDICOS ULTRA PREMIUM (20 ICONOS)
// ========================================
const ICONOS_MEDICOS_ULTRA = {
  // 1. Cruz Médica 3D Premium
  cruzMedicaPremium: `
    <g>
      <defs>
        <linearGradient id="crossPremium" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#f0f0f0;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e0e0e0;stop-opacity:1" />
        </linearGradient>
        <filter id="shadow3d">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
          <feOffset dx="3" dy="3" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.6"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <radialGradient id="crossGlow">
          <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0" />
        </radialGradient>
      </defs>
      <!-- Sombra base -->
      <rect x="38" y="8" width="24" height="84" rx="5" fill="#cccccc" opacity="0.3"/>
      <rect x="8" y="38" width="84" height="24" rx="5" fill="#cccccc" opacity="0.3"/>
      <!-- Cruz principal -->
      <rect x="35" y="5" width="30" height="90" rx="5" fill="url(#crossPremium)" filter="url(#shadow3d)"/>
      <rect x="5" y="35" width="90" height="30" rx="5" fill="url(#crossPremium)" filter="url(#shadow3d)"/>
      <!-- Brillos -->
      <rect x="36" y="6" width="28" height="40" rx="4" fill="url(#crossGlow)"/>
      <rect x="6" y="36" width="40" height="28" rx="4" fill="url(#crossGlow)"/>
      <!-- Centro decorativo -->
      <circle cx="50" cy="50" r="18" fill="#ffffff" opacity="0.9" filter="url(#shadow3d)"/>
      <circle cx="50" cy="50" r="15" fill="url(#crossPremium)"/>
      <circle cx="48" cy="48" r="8" fill="white" opacity="0.6"/>
    </g>
  `,

  // 2. Corazón Anatómico Ultra Realista
  corazonAnatomico: `
    <g>
      <defs>
        <linearGradient id="heartUltra" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ff4757;stop-opacity:1" />
          <stop offset="30%" style="stop-color:#ff3838;stop-opacity:1" />
          <stop offset="70%" style="stop-color:#ee5a6f;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#c44569;stop-opacity:1" />
        </linearGradient>
        <filter id="heartGlow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <radialGradient id="heartShine">
          <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.9" />
          <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0" />
        </radialGradient>
      </defs>
      <!-- Sombra -->
      <path d="M50,87 L24,61 Q14,51 14,38 Q14,24 24,19 Q34,14 44,24 L50,30 L56,24 Q66,14 76,19 Q86,24 86,38 Q86,51 76,61 Z" 
            fill="#d32f2f" opacity="0.3" transform="translate(2,2)"/>
      <!-- Corazón principal -->
      <path d="M50,85 L25,60 Q15,50 15,38 Q15,25 25,20 Q35,15 45,25 L50,30 L55,25 Q65,15 75,20 Q85,25 85,38 Q85,50 75,60 Z" 
            fill="url(#heartUltra)" 
            filter="url(#heartGlow)"/>
      <!-- Venas y arterias -->
      <path d="M50,30 Q48,40 50,50 Q52,60 50,70" fill="none" stroke="#c44569" stroke-width="2" opacity="0.4"/>
      <path d="M35,35 Q33,45 35,55" fill="none" stroke="#c44569" stroke-width="1.5" opacity="0.3"/>
      <path d="M65,35 Q67,45 65,55" fill="none" stroke="#c44569" stroke-width="1.5" opacity="0.3"/>
      <!-- Brillos realistas -->
      <ellipse cx="32" cy="32" rx="10" ry="7" fill="url(#heartShine)" opacity="0.6"/>
      <ellipse cx="68" cy="32" rx="8" ry="6" fill="url(#heartShine)" opacity="0.5"/>
      <circle cx="50" cy="45" r="5" fill="white" opacity="0.3"/>
      <!-- Válvulas -->
      <circle cx="35" cy="40" r="3" fill="#ffffff" opacity="0.4"/>
      <circle cx="65" cy="40" r="3" fill="#ffffff" opacity="0.4"/>
    </g>
  `,

  // 3. Estetoscopio Premium con Detalles
  estetoscopioPremium: `
    <g>
      <defs>
        <linearGradient id="stetoUltra" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#42a5f5;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#1e88e5;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1565c0;stop-opacity:1" />
        </linearGradient>
        <radialGradient id="metallic">
          <stop offset="0%" style="stop-color:#e8eaf6;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#c5cae9;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#9fa8da;stop-opacity:1" />
        </radialGradient>
        <filter id="metalGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <!-- Tubos con gradiente -->
      <path d="M22,22 Q22,40 32,52" fill="none" stroke="url(#stetoUltra)" stroke-width="5" stroke-linecap="round" opacity="0.9"/>
      <path d="M78,22 Q78,40 68,52" fill="none" stroke="url(#stetoUltra)" stroke-width="5" stroke-linecap="round" opacity="0.9"/>
      <path d="M32,52 Q50,68 68,52" fill="none" stroke="url(#stetoUltra)" stroke-width="6" stroke-linecap="round"/>
      <!-- Auriculares con efecto metálico -->
      <circle cx="22" cy="18" r="12" fill="url(#metallic)" filter="url(#metalGlow)"/>
      <circle cx="22" cy="18" r="10" fill="url(#stetoUltra)"/>
      <circle cx="20" cy="16" r="5" fill="white" opacity="0.6"/>
      <circle cx="78" cy="18" r="12" fill="url(#metallic)" filter="url(#metalGlow)"/>
      <circle cx="78" cy="18" r="10" fill="url(#stetoUltra)"/>
      <circle cx="76" cy="16" r="5" fill="white" opacity="0.6"/>
      <!-- Campana premium -->
      <ellipse cx="50" cy="75" rx="15" ry="18" fill="#0d47a1" opacity="0.3" transform="translate(1,1)"/>
      <ellipse cx="50" cy="75" rx="15" ry="18" fill="url(#metallic)" filter="url(#metalGlow)"/>
      <ellipse cx="50" cy="75" rx="13" ry="16" fill="url(#stetoUltra)"/>
      <ellipse cx="50" cy="72" rx="10" ry="12" fill="#64b5f6"/>
      <circle cx="48" cy="70" r="6" fill="white" opacity="0.5"/>
      <!-- Detalles de profundidad -->
      <circle cx="50" cy="75" r="8" fill="none" stroke="white" stroke-width="1" opacity="0.3"/>
      <path d="M40,75 Q50,78 60,75" fill="none" stroke="white" stroke-width="1" opacity="0.4"/>
    </g>
  `,

  // 4. Cápsula Farmacéutica 3D
  capsulaPremium: `
    <g>
      <defs>
        <linearGradient id="pill1Ultra" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ff6b9d;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#ff5e89;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#ff477e;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="pill2Ultra" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#00d2ff;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#00b8d4;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0097a7;stop-opacity:1" />
        </linearGradient>
        <filter id="pillGlow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <linearGradient id="pillShine" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0" />
        </linearGradient>
      </defs>
      <!-- Sombra de cápsula -->
      <rect x="22" y="32" width="56" height="36" rx="18" fill="#000000" opacity="0.2" transform="translate(2,2)"/>
      <!-- Mitad azul -->
      <rect x="20" y="30" width="28" height="40" rx="20" fill="url(#pill2Ultra)" filter="url(#pillGlow)"/>
      <ellipse cx="34" cy="40" rx="8" ry="5" fill="url(#pillShine)"/>
      <!-- Mitad roja -->
      <rect x="48" y="30" width="28" height="40" rx="20" fill="url(#pill1Ultra)" filter="url(#pillGlow)"/>
      <ellipse cx="62" cy="40" rx="8" ry="5" fill="url(#pillShine)"/>
      <!-- Línea central -->
      <line x1="48" y1="30" x2="48" y2="70" stroke="#ffffff" stroke-width="2" opacity="0.4"/>
      <line x1="48" y1="30" x2="48" y2="70" stroke="#000000" stroke-width="1" opacity="0.2"/>
      <!-- Puntos decorativos -->
      <circle cx="30" cy="45" r="2" fill="white" opacity="0.7"/>
      <circle cx="30" cy="55" r="2" fill="white" opacity="0.7"/>
      <circle cx="60" cy="45" r="2" fill="white" opacity="0.7"/>
      <circle cx="60" cy="55" r="2" fill="white" opacity="0.7"/>
      <!-- Brillos superiores -->
      <ellipse cx="25" cy="35" rx="4" ry="2" fill="white" opacity="0.8"/>
      <ellipse cx="63" cy="35" rx="4" ry="2" fill="white" opacity="0.8"/>
    </g>
  `,

  // 5. ADN Hélice Ultra Detallada
  adnUltra: `
    <g>
      <defs>
        <linearGradient id="dna1Ultra" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#7c3aed;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="dna2Ultra" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f093fb;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#f575c4;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f5576c;stop-opacity:1" />
        </linearGradient>
        <filter id="dnaGlow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <!-- Hélice izquierda -->
      <path d="M28,8 Q18,28 28,48 Q38,68 28,88" 
            fill="none" 
            stroke="url(#dna1Ultra)" 
            stroke-width="6" 
            stroke-linecap="round"
            filter="url(#dnaGlow)"/>
      <!-- Hélice derecha -->
      <path d="M72,8 Q82,28 72,48 Q62,68 72,88" 
            fill="none" 
            stroke="url(#dna2Ultra)" 
            stroke-width="6" 
            stroke-linecap="round"
            filter="url(#dnaGlow)"/>
      <!-- Conexiones con gradientes -->
      <line x1="28" y1="15" x2="72" y2="15" stroke="url(#dna1Ultra)" stroke-width="3" opacity="0.8"/>
      <line x1="28" y1="28" x2="72" y2="28" stroke="url(#dna2Ultra)" stroke-width="3" opacity="0.8"/>
      <line x1="28" y1="41" x2="72" y2="41" stroke="url(#dna1Ultra)" stroke-width="3" opacity="0.8"/>
      <line x1="28" y1="54" x2="72" y2="54" stroke="url(#dna2Ultra)" stroke-width="3" opacity="0.8"/>
      <line x1="28" y1="67" x2="72" y2="67" stroke="url(#dna1Ultra)" stroke-width="3" opacity="0.8"/>
      <line x1="28" y1="80" x2="72" y2="80" stroke="url(#dna2Ultra)" stroke-width="3" opacity="0.8"/>
      <!-- Nodos brillantes -->
      <circle cx="28" cy="15" r="5" fill="url(#dna1Ultra)" filter="url(#dnaGlow)"/>
      <circle cx="72" cy="15" r="5" fill="url(#dna2Ultra)" filter="url(#dnaGlow)"/>
      <circle cx="28" cy="41" r="5" fill="url(#dna1Ultra)" filter="url(#dnaGlow)"/>
      <circle cx="72" cy="41" r="5" fill="url(#dna2Ultra)" filter="url(#dnaGlow)"/>
      <circle cx="28" cy="67" r="5" fill="url(#dna1Ultra)" filter="url(#dnaGlow)"/>
      <circle cx="72" cy="67" r="5" fill="url(#dna2Ultra)" filter="url(#dnaGlow)"/>
      <!-- Brillos internos -->
      <circle cx="26" cy="13" r="2" fill="white" opacity="0.8"/>
      <circle cx="70" cy="13" r="2" fill="white" opacity="0.8"/>
      <circle cx="26" cy="39" r="2" fill="white" opacity="0.8"/>
      <circle cx="70" cy="39" r="2" fill="white" opacity="0.8"/>
      <circle cx="26" cy="65" r="2" fill="white" opacity="0.8"/>
      <circle cx="70" cy="65" r="2" fill="white" opacity="0.8"/>
    </g>
  `,

  // 6. Escudo Médico Premium
  escudoPremium: `
    <g>
      <defs>
        <linearGradient id="shieldUltra" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#00e676;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#00c853;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#00a152;stop-opacity:1" />
        </linearGradient>
        <filter id="shieldGlow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <radialGradient id="shieldShine">
          <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.9" />
          <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0" />
        </radialGradient>
      </defs>
      <!-- Sombra del escudo -->
      <path d="M50,12 L82,27 L82,57 Q82,77 50,92 Q18,77 18,57 L18,27 Z" 
            fill="#000000" 
            opacity="0.2"
            transform="translate(2,2)"/>
      <!-- Escudo principal -->
      <path d="M50,10 L80,25 L80,55 Q80,75 50,90 Q20,75 20,55 L20,25 Z" 
            fill="url(#shieldUltra)" 
            filter="url(#shieldGlow)"
            stroke="#ffffff" 
            stroke-width="2.5"
            opacity="0.95"/>
      <!-- Borde interno -->
      <path d="M50,14 L76,27 L76,54 Q76,71 50,84 Q24,71 24,54 L24,27 Z" 
            fill="none"
            stroke="#00e676" 
            stroke-width="1.5"
            opacity="0.6"/>
      <!-- Cruz médica interna -->
      <rect x="44" y="28" width="12" height="38" rx="3" fill="#ffffff" filter="url(#shieldGlow)"/>
      <rect x="31" y="41" width="38" height="12" rx="3" fill="#ffffff" filter="url(#shieldGlow)"/>
      <!-- Brillo superior -->
      <ellipse cx="38" cy="28" rx="12" ry="18" fill="url(#shieldShine)" opacity="0.5"/>
      <!-- Detalles decorativos -->
      <circle cx="50" cy="47" r="8" fill="none" stroke="white" stroke-width="1.5" opacity="0.4"/>
      <path d="M35,65 Q50,70 65,65" fill="none" stroke="white" stroke-width="1.5" opacity="0.5" stroke-linecap="round"/>
    </g>
  `,

  // 7. Pulso Cardíaco Premium
  pulsoPremium: `
    <g>
      <defs>
        <linearGradient id="pulseUltra" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#00e5ff;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#00b8d4;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#00e5ff;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#00b8d4;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#00e5ff;stop-opacity:1" />
        </linearGradient>
        <filter id="pulseGlow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <radialGradient id="dotGlow">
          <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#00e5ff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#00e5ff;stop-opacity:0" />
        </radialGradient>
      </defs>
      <!-- Línea de fondo -->
      <path d="M5,50 L98,50" 
            fill="none" 
            stroke="#00b8d4" 
            stroke-width="2" 
            opacity="0.3"/>
      <!-- Línea de pulso principal -->
      <path d="M3,50 L18,50 L25,28 L32,52 L39,20 L46,72 L53,38 L60,62 L67,50 L82,50 L97,50" 
            fill="none" 
            stroke="url(#pulseUltra)" 
            stroke-width="6" 
            stroke-linecap="round"
            stroke-linejoin="round"
            filter="url(#pulseGlow)"/>
      <!-- Puntos de medición con resplandor -->
      <circle cx="25" cy="28" r="6" fill="url(#dotGlow)" opacity="0.9"/>
      <circle cx="25" cy="28" r="4" fill="#00e5ff" filter="url(#pulseGlow)"/>
      <circle cx="39" cy="20" r="6" fill="url(#dotGlow)" opacity="0.9"/>
      <circle cx="39" cy="20" r="4" fill="#ffffff" filter="url(#pulseGlow)"/>
      <circle cx="53" cy="38" r="6" fill="url(#dotGlow)" opacity="0.9"/>
      <circle cx="53" cy="38" r="4" fill="#00e5ff" filter="url(#pulseGlow)"/>
      <circle cx="60" cy="62" r="6" fill="url(#dotGlow)" opacity="0.9"/>
      <circle cx="60" cy="62" r="4" fill="#ffffff" filter="url(#pulseGlow)"/>
      <!-- Partículas flotantes -->
      <circle cx="15" cy="45" r="2" fill="#00e5ff" opacity="0.6"/>
      <circle cx="70" cy="55" r="2" fill="#00e5ff" opacity="0.6"/>
      <circle cx="45" cy="40" r="2" fill="#ffffff" opacity="0.8"/>
      <circle cx="85" cy="50" r="2" fill="#00e5ff" opacity="0.6"/>
    </g>
  `,

  // 8. Cerebro Médico
  cerebro: `
    <g>
      <defs>
        <linearGradient id="brainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f78fb3;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#ea6d9a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#d958a2;stop-opacity:1" />
        </linearGradient>
        <filter id="brainGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <!-- Hemisferio izquierdo -->
      <path d="M30,20 Q20,25 20,40 Q20,55 25,65 Q30,75 40,75 Q45,75 45,50 Q45,25 40,20 Q35,15 30,20" 
            fill="url(#brainGrad)" 
            filter="url(#brainGlow)"/>
      <!-- Hemisferio derecho -->
      <path d="M70,20 Q80,25 80,40 Q80,55 75,65 Q70,75 60,75 Q55,75 55,50 Q55,25 60,20 Q65,15 70,20" 
            fill="url(#brainGrad)" 
            filter="url(#brainGlow)"/>
      <!-- Circunvoluciones -->
      <path d="M32,30 Q28,32 30,35" fill="none" stroke="#d958a2" stroke-width="2" stroke-linecap="round"/>
      <path d="M35,40 Q31,42 33,45" fill="none" stroke="#d958a2" stroke-width="2" stroke-linecap="round"/>
      <path d="M68,30 Q72,32 70,35" fill="none" stroke="#d958a2" stroke-width="2" stroke-linecap="round"/>
      <path d="M65,40 Q69,42 67,45" fill="none" stroke="#d958a2" stroke-width="2" stroke-linecap="round"/>
      <!-- Conexiones neuronales -->
      <line x1="45" y1="50" x2="55" y2="50" stroke="#ffffff" stroke-width="2" opacity="0.5"/>
      <circle cx="50" cy="50" r="3" fill="#ffffff" opacity="0.8"/>
      <!-- Brillos -->
      <ellipse cx="35" cy="35" rx="5" ry="8" fill="white" opacity="0.4"/>
      <ellipse cx="65" cy="35" rx="5" ry="8" fill="white" opacity="0.4"/>
    </g>
  `,

  // 9. Microscópio
  microscopio: `
    <g>
      <defs>
        <linearGradient id="scopeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#546e7a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#37474f;stop-opacity:1" />
        </linearGradient>
        <radialGradient id="lensGrad">
          <stop offset="0%" style="stop-color:#e3f2fd;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#90caf9;stop-opacity:1" />
        </radialGradient>
      </defs>
      <!-- Base -->
      <ellipse cx="50" cy="85" rx="30" ry="5" fill="url(#scopeGrad)"/>
      <!-- Cuerpo del microscopio -->
      <rect x="45" y="60" width="10" height="25" fill="url(#scopeGrad)"/>
      <!-- Brazo -->
      <path d="M50,60 Q45,50 45,40 L45,20" stroke="url(#scopeGrad)" stroke-width="8" stroke-linecap="round"/>
      <!-- Cabeza -->
      <ellipse cx="45" cy="18" rx="8" ry="12" fill="url(#scopeGrad)"/>
      <!-- Lente ocular -->
      <circle cx="45" cy="15" r="5" fill="url(#lensGrad)"/>
      <circle cx="44" cy="14" r="2" fill="white" opacity="0.8"/>
      <!-- Revólver -->
      <circle cx="55" cy="45" r="8" fill="url(#scopeGrad)"/>
      <circle cx="55" cy="45" r="6" fill="#455a64"/>
      <!-- Objetivos -->
      <circle cx="52" cy="40" r="3" fill="url(#lensGrad)"/>
      <circle cx="58" cy="47" r="3" fill="url(#lensGrad)"/>
      <!-- Platina -->
      <rect x="40" y="50" width="25" height="3" rx="1" fill="url(#scopeGrad)"/>
      <!-- Condensador -->
      <ellipse cx="52" cy="58" rx="6" ry="4" fill="#455a64"/>
      <!-- Brillo metálico -->
      <rect x="46" y="62" width="3" height="20" fill="white" opacity="0.2"/>
    </g>
  `,

  // 10. Termómetro Digital
  termometro: `
    <g>
      <defs>
        <linearGradient id="thermGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#ef5350;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#c62828;stop-opacity:1" />
        </linearGradient>
      </defs>
      <!-- Cuerpo del termómetro -->
      <rect x="40" y="15" width="20" height="60" rx="10" fill="#e0e0e0"/>
      <!-- Mercurio/líquido -->
      <rect x="42" y="50" width="16" height="23" rx="8" fill="url(#thermGrad)"/>
      <!-- Bulbo -->
      <circle cx="50" cy="75" r="10" fill="url(#thermGrad)"/>
      <!-- Escala -->
      <line x1="38" y1="25" x2="42" y2="25" stroke="#757575" stroke-width="1"/>
      <line x1="38" y1="35" x2="42" y2="35" stroke="#757575" stroke-width="1"/>
      <line x1="38" y1="45" x2="42" y2="45" stroke="#757575" stroke-width="1"/>
      <!-- Marcas de grados -->
      <text x="50" y="32" font-size="6" fill="#757575" text-anchor="middle">°C</text>
      <!-- Brillo -->
      <ellipse cx="48" cy="65" rx="3" ry="5" fill="white" opacity="0.5"/>
    </g>
  `,

  // 11. Molécula Hexagonal
  molecula: `
    <g>
      <defs>
        <radialGradient id="atomGrad">
          <stop offset="0%" style="stop-color:#7c4dff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#651fff;stop-opacity:1" />
        </radialGradient>
        <filter id="atomGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <!-- Conexiones -->
      <line x1="50" y1="20" x2="75" y2="35" stroke="#b388ff" stroke-width="2" opacity="0.6"/>
      <line x1="75" y1="35" x2="75" y2="65" stroke="#b388ff" stroke-width="2" opacity="0.6"/>
      <line x1="75" y1="65" x2="50" y2="80" stroke="#b388ff" stroke-width="2" opacity="0.6"/>
      <line x1="50" y1="80" x2="25" y2="65" stroke="#b388ff" stroke-width="2" opacity="0.6"/>
      <line x1="25" y1="65" x2="25" y2="35" stroke="#b388ff" stroke-width="2" opacity="0.6"/>
      <line x1="25" y1="35" x2="50" y2="20" stroke="#b388ff" stroke-width="2" opacity="0.6"/>
      <!-- Átomos -->
      <circle cx="50" cy="20" r="7" fill="url(#atomGrad)" filter="url(#atomGlow)"/>
      <circle cx="75" cy="35" r="7" fill="url(#atomGrad)" filter="url(#atomGlow)"/>
      <circle cx="75" cy="65" r="7" fill="url(#atomGrad)" filter="url(#atomGlow)"/>
      <circle cx="50" cy="80" r="7" fill="url(#atomGrad)" filter="url(#atomGlow)"/>
      <circle cx="25" cy="65" r="7" fill="url(#atomGrad)" filter="url(#atomGlow)"/>
      <circle cx="25" cy="35" r="7" fill="url(#atomGrad)" filter="url(#atomGlow)"/>
      <circle cx="50" cy="50" r="8" fill="url(#atomGrad)" filter="url(#atomGlow)"/>
      <!-- Brillos -->
      <circle cx="48" cy="18" r="3" fill="white" opacity="0.8"/>
      <circle cx="73" cy="33" r="3" fill="white" opacity="0.8"/>
      <circle cx="48" cy="48" r="3" fill="white" opacity="0.8"/>
    </g>
  `,

  // 12. Pulmones Detallados
  pulmonesUltra: `
    <g>
      <defs>
        <linearGradient id="lungUltra" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#80deea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#00acc1;stop-opacity:1" />
        </linearGradient>
        <filter id="lungGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <!-- Tráquea -->
      <rect x="45" y="8" width="10" height="30" rx="5" fill="#00acc1"/>
      <rect x="46" y="9" width="8" height="28" rx="4" fill="#80deea"/>
      <!-- Bronquios -->
      <path d="M50,38 L28,48" stroke="#00acc1" stroke-width="5" stroke-linecap="round"/>
      <path d="M50,38 L72,48" stroke="#00acc1" stroke-width="5" stroke-linecap="round"/>
      <!-- Pulmón izquierdo -->
      <ellipse cx="28" cy="60" rx="20" ry="32" fill="url(#lungUltra)" filter="url(#lungGlow)" opacity="0.95"/>
      <ellipse cx="26" cy="55" rx="14" ry="22" fill="white" opacity="0.3"/>
      <!-- Pulmón derecho -->
      <ellipse cx="72" cy="60" rx="20" ry="32" fill="url(#lungUltra)" filter="url(#lungGlow)" opacity="0.95"/>
      <ellipse cx="74" cy="55" rx="14" ry="22" fill="white" opacity="0.3"/>
      <!-- Bronquiolos -->
      <path d="M28,48 Q24,55 26,62" fill="none" stroke="#00acc1" stroke-width="2" opacity="0.6"/>
      <path d="M28,48 Q32,55 30,62" fill="none" stroke="#00acc1" stroke-width="2" opacity="0.6"/>
      <path d="M72,48 Q68,55 70,62" fill="none" stroke="#00acc1" stroke-width="2" opacity="0.6"/>
      <path d="M72,48 Q76,55 74,62" fill="none" stroke="#00acc1" stroke-width="2" opacity="0.6"/>
      <!-- Alvéolos (pequeños círculos) -->
      <circle cx="20" cy="70" r="3" fill="#4dd0e1" opacity="0.6"/>
      <circle cx="35" cy="75" r="3" fill="#4dd0e1" opacity="0.6"/>
      <circle cx="65" cy="75" r="3" fill="#4dd0e1" opacity="0.6"/>
      <circle cx="80" cy="70" r="3" fill="#4dd0e1" opacity="0.6"/>
    </g>
  `,

  // 13. Jeringa Ultra Realista
  jeringaUltra: `
    <g>
      <defs>
        <linearGradient id="syringeUltra" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f5f5f5;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e0e0e0;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="liquidGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#42a5f5;stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:#1e88e5;stop-opacity:0.8" />
        </linearGradient>
        <filter id="syringeGlow">
          <feDropShadow dx="1" dy="1" stdDeviation="2" flood-opacity="0.3"/>
        </filter>
      </defs>
      <!-- Aguja -->
      <polygon points="8,50 20,47 20,53" fill="#90a4ae"/>
      <rect x="20" y="47" width="8" height="6" rx="1" fill="#cfd8dc"/>
      <!-- Cuerpo de la jeringa -->
      <rect x="28" y="40" width="45" height="20" rx="4" fill="url(#syringeUltra)" filter="url(#syringeGlow)"/>
      <rect x="29" y="41" width="43" height="18" rx="3" fill="white" opacity="0.5"/>
      <!-- Líquido -->
      <rect x="30" y="42" width="30" height="16" rx="2" fill="url(#liquidGrad)"/>
      <!-- Marcas de medición -->
      <line x1="35" y1="42" x2="35" y2="58" stroke="#1976d2" stroke-width="0.5" opacity="0.5"/>
      <line x1="42" y1="42" x2="42" y2="58" stroke="#1976d2" stroke-width="0.5" opacity="0.5"/>
      <line x1="49" y1="42" x2="49" y2="58" stroke="#1976d2" stroke-width="0.5" opacity="0.5"/>
      <line x1="56" y1="42" x2="56" y2="58" stroke="#1976d2" stroke-width="0.5" opacity="0.5"/>
      <!-- Émbolo -->
      <rect x="60" y="45" width="8" height="10" rx="2" fill="#546e7a"/>
      <rect x="68" y="47" width="10" height="6" rx="2" fill="#455a64"/>
      <!-- Agarre del émbolo -->
      <ellipse cx="78" cy="50" rx="4" ry="5" fill="#37474f"/>
      <ellipse cx="78" cy="49" rx="3" ry="4" fill="#546e7a"/>
      <!-- Brillos en el cuerpo -->
      <ellipse cx="40" cy="45" rx="8" ry="4" fill="white" opacity="0.6"/>
      <rect x="29" y="41" width="2" height="18" fill="white" opacity="0.4"/>
      <!-- Burbujas en el líquido -->
      <circle cx="38" cy="46" r="1.5" fill="white" opacity="0.7"/>
      <circle cx="48" cy="52" r="1" fill="white" opacity="0.7"/>
    </g>
  `,

  // 14. Vendaje/Curita
  vendaje: `
    <g>
      <defs>
        <linearGradient id="bandageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ffe0b2;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#ffcc80;stop-opacity:1" />
        </linearGradient>
      </defs>
      <!-- Curita -->
      <rect x="20" y="35" width="60" height="30" rx="15" fill="url(#bandageGrad)"/>
      <!-- Área central (gasa) -->
      <rect x="40" y="40" width="20" height="20" rx="3" fill="#ffffff"/>
      <!-- Perforaciones -->
      <circle cx="28" cy="45" r="2" fill="#ffb74d" opacity="0.6"/>
      <circle cx="28" cy="50" r="2" fill="#ffb74d" opacity="0.6"/>
      <circle cx="28" cy="55" r="2" fill="#ffb74d" opacity="0.6"/>
      <circle cx="35" cy="45" r="2" fill="#ffb74d" opacity="0.6"/>
      <circle cx="35" cy="50" r="2" fill="#ffb74d" opacity="0.6"/>
      <circle cx="35" cy="55" r="2" fill="#ffb74d" opacity="0.6"/>
      <circle cx="65" cy="45" r="2" fill="#ffb74d" opacity="0.6"/>
      <circle cx="65" cy="50" r="2" fill="#ffb74d" opacity="0.6"/>
      <circle cx="65" cy="55" r="2" fill="#ffb74d" opacity="0.6"/>
      <circle cx="72" cy="45" r="2" fill="#ffb74d" opacity="0.6"/>
      <circle cx="72" cy="50" r="2" fill="#ffb74d" opacity="0.6"/>
      <circle cx="72" cy="55" r="2" fill="#ffb74d" opacity="0.6"/>
      <!-- Textura de gasa -->
      <line x1="42" y1="42" x2="58" y2="42" stroke="#f5f5f5" stroke-width="0.5" opacity="0.5"/>
      <line x1="42" y1="46" x2="58" y2="46" stroke="#f5f5f5" stroke-width="0.5" opacity="0.5"/>
      <line x1="42" y1="50" x2="58" y2="50" stroke="#f5f5f5" stroke-width="0.5" opacity="0.5"/>
      <line x1="42" y1="54" x2="58" y2="54" stroke="#f5f5f5" stroke-width="0.5" opacity="0.5"/>
      <line x1="42" y1="58" x2="58" y2="58" stroke="#f5f5f5" stroke-width="0.5" opacity="0.5"/>
      <!-- Cruz roja -->
      <rect x="48" y="45" width="4" height="10" rx="1" fill="#ff5252"/>
      <rect x="45" y="48" width="10" height="4" rx="1" fill="#ff5252"/>
    </g>
  `,

  // 15. Estrella de la Vida (Servicios Médicos de Emergencia)
  estrellaVida: `
    <g>
      <defs>
        <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#2196f3;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1565c0;stop-opacity:1" />
        </linearGradient>
        <filter id="starGlow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <!-- Estrella de 6 puntas -->
      <polygon points="50,10 60,35 85,35 65,52 75,77 50,60 25,77 35,52 15,35 40,35" 
               fill="url(#starGrad)" 
               filter="url(#starGlow)"/>
      <!-- Vara de Esculapio -->
      <rect x="48" y="25" width="4" height="45" rx="2" fill="white"/>
      <path d="M45,30 Q40,35 45,40 Q50,45 55,40 Q60,35 55,30" 
            fill="none" 
            stroke="white" 
            stroke-width="2"/>
      <path d="M45,45 Q40,50 45,55 Q50,60 55,55 Q60,50 55,45" 
            fill="none" 
            stroke="white" 
            stroke-width="2"/>
      <!-- Círculo central -->
      <circle cx="50" cy="50" r="8" fill="#1565c0"/>
      <circle cx="50" cy="50" r="6" fill="white" opacity="0.8"/>
    </g>
  `,

  // 16. Electrocardiógrafo
  electrocardiografo: `
    <g>
      <defs>
        <linearGradient id="ecgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#26c6da;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#00acc1;stop-opacity:1" />
        </linearGradient>
        <filter id="ecgGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <!-- Monitor -->
      <rect x="15" y="20" width="70" height="45" rx="5" fill="#263238"/>
      <rect x="18" y="23" width="64" height="39" rx="3" fill="#1a2328"/>
      <!-- Pantalla ECG -->
      <rect x="20" y="25" width="60" height="35" rx="2" fill="#000000"/>
      <!-- Línea ECG con gradiente -->
      <path d="M22,43 L30,43 L33,30 L36,56 L39,35 L42,48 L45,43 L78,43" 
            fill="none" 
            stroke="url(#ecgGrad)" 
            stroke-width="2" 
            stroke-linecap="round"
            filter="url(#ecgGlow)"/>
      <!-- Cuadrícula -->
      <path d="M25,30 L25,55 M30,30 L30,55 M35,30 L35,55 M40,30 L40,55 M45,30 L45,55 M50,30 L50,55 M55,30 L55,55 M60,30 L60,55 M65,30 L65,55 M70,30 L70,55 M75,30 L75,55" 
            stroke="#00796b" 
            stroke-width="0.5" 
            opacity="0.2"/>
      <path d="M22,32 L78,32 M22,37 L78,37 M22,42 L78,42 M22,47 L78,47 M22,52 L78,52 M22,57 L78,57" 
            stroke="#00796b" 
            stroke-width="0.5" 
            opacity="0.2"/>
      <!-- Indicador de frecuencia -->
      <text x="75" y="32" font-size="6" fill="#26c6da" font-weight="bold">72</text>
      <text x="72" y="38" font-size="4" fill="#26c6da">BPM</text>
      <!-- Botones -->
      <circle cx="22" cy="68" r="3" fill="#4db6ac"/>
      <circle cx="30" cy="68" r="3" fill="#4db6ac"/>
      <circle cx="38" cy="68" r="3" fill="#26a69a"/>
      <!-- LED indicador -->
      <circle cx="78" cy="68" r="2" fill="#00e676" filter="url(#ecgGlow)"/>
    </g>
  `,

  // 17. Botiquín Premium
  botiquin: `
    <g>
      <defs>
        <linearGradient id="caseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f5f5f5;stop-opacity:1" />
        </linearGradient>
        <filter id="caseGlow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
        </filter>
      </defs>
      <!-- Maleta base -->
      <rect x="20" y="35" width="60" height="45" rx="5" fill="url(#caseGrad)" filter="url(#caseGlow)"/>
      <rect x="22" y="37" width="56" height="41" rx="4" fill="#ffffff"/>
      <!-- Línea central -->
      <rect x="49" y="35" width="2" height="45" fill="#e0e0e0"/>
      <!-- Cruz roja grande -->
      <rect x="44" y="48" width="12" height="24" rx="2" fill="#f44336"/>
      <rect x="38" y="54" width="24" height="12" rx="2" fill="#f44336"/>
      <!-- Asa superior -->
      <path d="M35,35 Q35,25 50,25 Q65,25 65,35" 
            fill="none" 
            stroke="#bdbdbd" 
            stroke-width="4" 
            stroke-linecap="round"/>
      <path d="M37,35 Q37,27 50,27 Q63,27 63,35" 
            fill="none" 
            stroke="#e0e0e0" 
            stroke-width="2" 
            stroke-linecap="round"/>
      <!-- Cerraduras -->
      <rect x="45" y="32" width="10" height="6" rx="2" fill="#9e9e9e"/>
      <circle cx="50" cy="35" r="1.5" fill="#616161"/>
      <!-- Brillos -->
      <rect x="24" y="39" width="3" height="35" fill="white" opacity="0.6"/>
      <ellipse cx="40" cy="50" rx="4" ry="6" fill="white" opacity="0.4"/>
    </g>
  `,

  // 18. Hueso/Radiografía
  hueso: `
    <g>
      <defs>
        <linearGradient id="boneGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#f5f5f5;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e0e0e0;stop-opacity:1" />
        </linearGradient>
        <radialGradient id="jointGrad">
          <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#eeeeee;stop-opacity:1" />
        </radialGradient>
      </defs>
      <!-- Epífisis superior -->
      <ellipse cx="50" cy="20" rx="15" ry="12" fill="url(#jointGrad)"/>
      <ellipse cx="48" cy="18" rx="8" ry="6" fill="white" opacity="0.6"/>
      <!-- Diáfisis -->
      <rect x="42" y="20" width="16" height="60" rx="4" fill="url(#boneGrad)"/>
      <!-- Canal medular -->
      <rect x="45" y="25" width="10" height="50" rx="2" fill="#fafafa" opacity="0.5"/>
      <!-- Epífisis inferior -->
      <ellipse cx="50" cy="80" rx="15" ry="12" fill="url(#jointGrad)"/>
      <ellipse cx="48" cy="78" rx="8" ry="6" fill="white" opacity="0.6"/>
      <!-- Líneas de estructura -->
      <line x1="44" y1="30" x2="44" y2="70" stroke="#e0e0e0" stroke-width="1" opacity="0.5"/>
      <line x1="56" y1="30" x2="56" y2="70" stroke="#e0e0e0" stroke-width="1" opacity="0.5"/>
      <!-- Cartílago articular -->
      <ellipse cx="50" cy="20" rx="12" ry="4" fill="#b0bec5" opacity="0.4"/>
      <ellipse cx="50" cy="80" rx="12" ry="4" fill="#b0bec5" opacity="0.4"/>
    </g>
  `,

  // 19. Diente/Odontología
  diente: `
    <g>
      <defs>
        <linearGradient id="toothGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#f5f5f5;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#eeeeee;stop-opacity:1" />
        </linearGradient>
        <filter id="toothGlow">
          <feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.2"/>
        </filter>
      </defs>
      <!-- Corona del diente -->
      <path d="M35,25 Q30,30 30,40 L30,55 Q30,60 35,62 L50,80 L65,62 Q70,60 70,55 L70,40 Q70,30 65,25 Q60,20 50,20 Q40,20 35,25" 
            fill="url(#toothGrad)" 
            filter="url(#toothGlow)"/>
      <!-- Raíces -->
      <path d="M45,62 Q43,70 45,80" fill="url(#toothGrad)" stroke="#e0e0e0" stroke-width="6" stroke-linecap="round"/>
      <path d="M55,62 Q57,70 55,80" fill="url(#toothGrad)" stroke="#e0e0e0" stroke-width="6" stroke-linecap="round"/>
      <!-- Esmalte brillante -->
      <ellipse cx="45" cy="35" rx="8" ry="12" fill="white" opacity="0.7"/>
      <ellipse cx="42" cy="32" rx="4" ry="6" fill="white" opacity="0.9"/>
      <!-- Línea de encía -->
      <ellipse cx="50" cy="60" rx="22" ry="3" fill="#ffc0cb" opacity="0.6"/>
      <!-- Surcos dentales -->
      <path d="M48,25 Q48,35 48,45" stroke="#e0e0e0" stroke-width="1" opacity="0.4"/>
      <path d="M52,25 Q52,35 52,45" stroke="#e0e0e0" stroke-width="1" opacity="0.4"/>
    </g>
  `,

  // 20. Vitaminas/Suplementos
  vitaminas: `
    <g>
      <defs>
        <linearGradient id="vitGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ffd54f;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#ffb300;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="vitGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ff6f00;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e65100;stop-opacity:1" />
        </linearGradient>
        <filter id="vitGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <!-- Cápsula 1 -->
      <circle cx="35" cy="40" r="14" fill="url(#vitGrad1)" filter="url(#vitGlow)"/>
      <circle cx="32" cy="37" r="5" fill="white" opacity="0.6"/>
      <text x="35" y="44" font-size="10" font-weight="bold" fill="white" text-anchor="middle">C</text>
      <!-- Cápsula 2 -->
      <circle cx="65" cy="35" r="12" fill="url(#vitGrad2)" filter="url(#vitGlow)"/>
      <circle cx="63" cy="33" r="4" fill="white" opacity="0.6"/>
      <text x="65" y="39" font-size="9" font-weight="bold" fill="white" text-anchor="middle">D</text>
      <!-- Píldora 3 -->
      <ellipse cx="45" cy="65" rx="10" ry="14" fill="#42a5f5" filter="url(#vitGlow)" transform="rotate(25 45 65)"/>
      <ellipse cx="43" cy="62" rx="4" ry="6" fill="white" opacity="0.5" transform="rotate(25 43 62)"/>
      <text x="45" y="68" font-size="8" font-weight="bold" fill="white" text-anchor="middle" transform="rotate(25 45 68)">B</text>
      <!-- Píldora 4 -->
      <ellipse cx="60" cy="60" rx="9" ry="12" fill="#66bb6a" filter="url(#vitGlow)" transform="rotate(-15 60 60)"/>
      <ellipse cx="59" cy="57" rx="3" ry="5" fill="white" opacity="0.5" transform="rotate(-15 59 57)"/>
      <text x="60" y="63" font-size="7" font-weight="bold" fill="white" text-anchor="middle" transform="rotate(-15 60 63)">E</text>
      <!-- Partículas brillantes -->
      <circle cx="25" cy="30" r="2" fill="#ffd54f" opacity="0.6"/>
      <circle cx="75" cy="45" r="1.5" fill="#ff6f00" opacity="0.6"/>
      <circle cx="35" cy="75" r="2" fill="#42a5f5" opacity="0.6"/>
      <circle cx="70" cy="70" r="1.5" fill="#66bb6a" opacity="0.6"/>
    </g>
  `
};

// ========================================
// 🎭 PATRONES Y TEXTURAS ULTRA PREMIUM
// ========================================
const PATRONES_ULTRA = {
  // Patrón de células médicas
  celulas: (color: string) => `
    <defs>
      <pattern id="cells" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
        <circle cx="15" cy="15" r="8" fill="none" stroke="${color}" stroke-width="1" opacity="0.15"/>
        <circle cx="45" cy="15" r="8" fill="none" stroke="${color}" stroke-width="1" opacity="0.15"/>
        <circle cx="15" cy="45" r="8" fill="none" stroke="${color}" stroke-width="1" opacity="0.15"/>
        <circle cx="45" cy="45" r="8" fill="none" stroke="${color}" stroke-width="1" opacity="0.15"/>
        <circle cx="30" cy="30" r="8" fill="none" stroke="${color}" stroke-width="1" opacity="0.15"/>
      </pattern>
    </defs>
    <rect x="0" y="0" width="200" height="200" fill="url(#cells)"/>
  `,

  // Patrón de latidos cardíacos
  latidos: (color: string) => `
    <defs>
      <pattern id="heartbeats" x="0" y="0" width="100" height="40" patternUnits="userSpaceOnUse">
        <path d="M0,20 L15,20 L20,10 L25,30 L30,15 L35,25 L40,20 L100,20" 
              fill="none" 
              stroke="${color}" 
              stroke-width="1" 
              opacity="0.12"/>
      </pattern>
    </defs>
    <rect x="0" y="0" width="200" height="200" fill="url(#heartbeats)"/>
  `,

  // Patrón de moléculas
  moleculas: (color: string) => `
    <defs>
      <pattern id="molecules" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
        <circle cx="20" cy="20" r="4" fill="${color}" opacity="0.1"/>
        <circle cx="60" cy="20" r="4" fill="${color}" opacity="0.1"/>
        <circle cx="20" cy="60" r="4" fill="${color}" opacity="0.1"/>
        <circle cx="60" cy="60" r="4" fill="${color}" opacity="0.1"/>
        <circle cx="40" cy="40" r="4" fill="${color}" opacity="0.1"/>
        <line x1="20" y1="20" x2="40" y2="40" stroke="${color}" stroke-width="1" opacity="0.1"/>
        <line x1="40" y1="40" x2="60" y2="20" stroke="${color}" stroke-width="1" opacity="0.1"/>
        <line x1="40" y1="40" x2="20" y2="60" stroke="${color}" stroke-width="1" opacity="0.1"/>
        <line x1="40" y1="40" x2="60" y2="60" stroke="${color}" stroke-width="1" opacity="0.1"/>
      </pattern>
    </defs>
    <rect x="0" y="0" width="200" height="200" fill="url(#molecules)"/>
  `,

  // Patrón de ondas cerebrales
  ondasCerebrales: (color: string) => `
    <defs>
      <pattern id="brainwaves" x="0" y="0" width="120" height="30" patternUnits="userSpaceOnUse">
        <path d="M0,15 Q15,5 30,15 T60,15 T90,15 T120,15" 
              fill="none" 
              stroke="${color}" 
              stroke-width="0.8" 
              opacity="0.15"/>
      </pattern>
    </defs>
    <rect x="0" y="0" width="200" height="200" fill="url(#brainwaves)"/>
  `,

  // Patrón de cruces médicas dispersas
  crucesMedicas: (color: string) => `
    <defs>
      <pattern id="medicalCrosses" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
        <g transform="translate(25, 25)">
          <rect x="-2" y="-6" width="4" height="12" fill="${color}" opacity="0.08"/>
          <rect x="-6" y="-2" width="12" height="4" fill="${color}" opacity="0.08"/>
        </g>
      </pattern>
    </defs>
    <rect x="0" y="0" width="200" height="200" fill="url(#medicalCrosses)"/>
  `,

  // Patrón de cuadrícula hexagonal
  hexagonosUltra: (color: string) => `
    <defs>
      <pattern id="hexagonsUltra" x="0" y="0" width="56" height="48.5" patternUnits="userSpaceOnUse">
        <polygon points="28,0 56,14.15 56,42.35 28,56.5 0,42.35 0,14.15" 
                 fill="none" 
                 stroke="${color}" 
                 stroke-width="0.8" 
                 opacity="0.18"/>
        <circle cx="28" cy="24.25" r="2" fill="${color}" opacity="0.1"/>
      </pattern>
    </defs>
    <rect x="0" y="0" width="200" height="200" fill="url(#hexagonsUltra)"/>
  `,

  // Patrón de partículas flotantes
  particulas: (color: string) => `
    <defs>
      <pattern id="particles" x="0" y="0" width="70" height="70" patternUnits="userSpaceOnUse">
        <circle cx="10" cy="10" r="2" fill="${color}" opacity="0.12"/>
        <circle cx="35" cy="20" r="1.5" fill="${color}" opacity="0.1"/>
        <circle cx="55" cy="30" r="2.5" fill="${color}" opacity="0.15"/>
        <circle cx="20" cy="45" r="1" fill="${color}" opacity="0.08"/>
        <circle cx="50" cy="60" r="2" fill="${color}" opacity="0.12"/>
        <circle cx="65" cy="15" r="1.5" fill="${color}" opacity="0.1"/>
      </pattern>
    </defs>
    <rect x="0" y="0" width="200" height="200" fill="url(#particles)"/>
  `,

  // Patrón de ADN
  patronADN: (color: string) => `
    <defs>
      <pattern id="dnaPattern" x="0" y="0" width="40" height="80" patternUnits="userSpaceOnUse">
        <path d="M10,0 Q5,20 10,40 Q15,60 10,80" 
              fill="none" 
              stroke="${color}" 
              stroke-width="1.5" 
              opacity="0.15"/>
        <path d="M30,0 Q35,20 30,40 Q25,60 30,80" 
              fill="none" 
              stroke="${color}" 
              stroke-width="1.5" 
              opacity="0.15"/>
        <line x1="10" y1="10" x2="30" y2="10" stroke="${color}" stroke-width="1" opacity="0.12"/>
        <line x1="10" y1="30" x2="30" y2="30" stroke="${color}" stroke-width="1" opacity="0.12"/>
        <line x1="10" y1="50" x2="30" y2="50" stroke="${color}" stroke-width="1" opacity="0.12"/>
        <line x1="10" y1="70" x2="30" y2="70" stroke="${color}" stroke-width="1" opacity="0.12"/>
      </pattern>
    </defs>
    <rect x="0" y="0" width="200" height="200" fill="url(#dnaPattern)"/>
  `
};


// ========================================
// 🎨 ESTILOS DE LOGO ULTRA PREMIUM (15+ ESTILOS)
// ========================================
const ESTILOS_LOGO_ULTRA = {
  // 1. Glassmorphism Ultra
  glassmorphism: (colores: any, icono: string, iniciales: string) => `
    <defs>
      <linearGradient id="glassUltra" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${colores.primary};stop-opacity:0.85" />
        <stop offset="50%" style="stop-color:${colores.secondary};stop-opacity:0.75" />
        <stop offset="100%" style="stop-color:${colores.tertiary};stop-opacity:0.65" />
      </linearGradient>
      <filter id="glassBlur">
        <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
      </filter>
      <filter id="dropShadowUltra">
        <feDropShadow dx="0" dy="12" stdDeviation="12" flood-opacity="0.35"/>
      </filter>
      <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.5" />
        <stop offset="50%" style="stop-color:#ffffff;stop-opacity:0.8" />
        <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0.3" />
      </linearGradient>
    </defs>
    
    <!-- Fondo con gradiente complejo -->
    <rect width="200" height="200" fill="url(#glassUltra)"/>
    
    ${PATRONES_ULTRA.particulas(colores.accent)}
    
    <!-- Capas de cristal con profundidad -->
    <circle cx="100" cy="100" r="85" fill="white" opacity="0.12" filter="url(#dropShadowUltra)"/>
    <circle cx="100" cy="100" r="82" fill="url(#glassUltra)" opacity="0.25"/>
    <circle cx="100" cy="100" r="82" fill="none" stroke="white" stroke-width="1.5" opacity="0.4"/>
    
    <!-- Capa intermedia con blur -->
    <circle cx="100" cy="100" r="75" fill="white" opacity="0.18" filter="url(#glassBlur)"/>
    <circle cx="100" cy="100" r="75" fill="url(#shimmer)" opacity="0.15"/>
    
    <!-- Icono médico con glassmorphism -->
    <g transform="translate(100, 75) scale(0.75)" opacity="0.98" filter="url(#dropShadowUltra)">
      ${icono}
    </g>
    
    <!-- Plataforma para iniciales -->
    <rect x="35" y="128" width="130" height="52" rx="18" fill="white" opacity="0.22"/>
    <rect x="37" y="130" width="126" height="48" rx="16" fill="white" opacity="0.15"/>
    <rect x="37" y="130" width="126" height="48" rx="16" fill="url(#shimmer)" opacity="0.1"/>
    
    <!-- Iniciales con efecto glassmorphism -->
    <text x="100" y="167" font-size="38" font-weight="900" text-anchor="middle" 
          fill="white" font-family="'SF Pro Display', 'Segoe UI', Arial, sans-serif"
          style="text-shadow: 0 3px 15px rgba(0,0,0,0.25), 0 1px 3px rgba(255,255,255,0.5);">
      ${iniciales}
    </text>
    
    <!-- Efectos de luz y reflejos -->
    <ellipse cx="65" cy="45" rx="35" ry="25" fill="white" opacity="0.12" transform="rotate(-25 65 45)"/>
    <ellipse cx="135" cy="60" rx="25" ry="35" fill="white" opacity="0.08" transform="rotate(35 135 60)"/>
    
    <!-- Bordes luminosos -->
    <circle cx="100" cy="100" r="80" fill="none" stroke="url(#shimmer)" stroke-width="1" opacity="0.5"/>
    <circle cx="100" cy="100" r="76" fill="none" stroke="white" stroke-width="0.5" opacity="0.3"/>
    
    <!-- Partículas flotantes -->
    <circle cx="130" cy="70" r="3" fill="white" opacity="0.4" filter="url(#glassBlur)"/>
    <circle cx="70" cy="130" r="2.5" fill="white" opacity="0.35" filter="url(#glassBlur)"/>
    <circle cx="150" cy="120" r="2" fill="white" opacity="0.3" filter="url(#glassBlur)"/>
  `,

  // 2. Neomorphism Ultra Premium
  neomorphism: (colores: any, icono: string, iniciales: string) => `
    <defs>
      <linearGradient id="neoBase" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#e8eaf6;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#c5cae9;stop-opacity:1" />
      </linearGradient>
      <filter id="neoShadowLight">
        <feDropShadow dx="-8" dy="-8" stdDeviation="12" flood-color="#ffffff" flood-opacity="0.8"/>
      </filter>
      <filter id="neoShadowDark">
        <feDropShadow dx="8" dy="8" stdDeviation="15" flood-color="#9fa8da" flood-opacity="0.5"/>
      </filter>
      <linearGradient id="neoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${colores.primary};stop-opacity:0.15" />
        <stop offset="100%" style="stop-color:${colores.secondary};stop-opacity:0.25" />
      </linearGradient>
    </defs>
    
    <!-- Fondo neomorphic -->
    <rect width="200" height="200" fill="url(#neoBase)"/>
    
    <!-- Forma principal con sombras duales -->
    <circle cx="100" cy="100" r="78" fill="url(#neoBase)" filter="url(#neoShadowDark)"/>
    <circle cx="100" cy="100" r="78" fill="url(#neoBase)" filter="url(#neoShadowLight)"/>
    
    <!-- Superficie interior hundida -->
    <circle cx="100" cy="100" r="72" fill="url(#neoGrad)"/>
    <circle cx="100" cy="100" r="70" fill="url(#neoBase)" opacity="0.5"/>
    
    <!-- Icono con efecto neomorphic -->
    <g transform="translate(100, 78) scale(0.68)" filter="url(#neoShadowDark)">
      ${icono}
    </g>
    
    <!-- Plataforma para iniciales hundida -->
    <rect x="42" y="132" width="116" height="46" rx="23" fill="#b0bec5" opacity="0.3"/>
    <rect x="44" y="134" width="112" height="42" rx="21" fill="url(#neoBase)"/>
    
    <!-- Iniciales con efecto grabado -->
    <text x="100" y="168" font-size="36" font-weight="800" text-anchor="middle" 
          fill="${colores.primary}" font-family="'Roboto', 'Arial', sans-serif"
          style="text-shadow: 1px 1px 2px rgba(255,255,255,0.8), -1px -1px 2px rgba(0,0,0,0.2);">
      ${iniciales}
    </text>
    
    <!-- Brillos sutiles -->
    <circle cx="85" cy="85" r="25" fill="white" opacity="0.15"/>
    <circle cx="115" cy="115" r="20" fill="#000000" opacity="0.05"/>
  `,

  // 3. Holográfico/Iridiscente
  holographic: (colores: any, icono: string, iniciales: string) => `
    <defs>
      <linearGradient id="holoGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#ff0080;stop-opacity:1" />
        <stop offset="25%" style="stop-color:#ff8c00;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#40e0d0;stop-opacity:1" />
        <stop offset="75%" style="stop-color:#7b68ee;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#ff0080;stop-opacity:1" />
      </linearGradient>
      <linearGradient id="holoShift" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#00ffff;stop-opacity:0.8" />
        <stop offset="33%" style="stop-color:#ff00ff;stop-opacity:0.8" />
        <stop offset="66%" style="stop-color:#ffff00;stop-opacity:0.8" />
        <stop offset="100%" style="stop-color:#00ffff;stop-opacity:0.8" />
      </linearGradient>
      <filter id="holoGlow">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <radialGradient id="holoReflection">
        <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.9" />
        <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0" />
      </radialGradient>
    </defs>
    
    <!-- Fondo oscuro para resaltar efecto -->
    <rect width="200" height="200" fill="#0a0a0a"/>
    
    ${PATRONES_ULTRA.particulas('#ffffff')}
    
    <!-- Resplandor holográfico de fondo -->
    <circle cx="100" cy="100" r="95" fill="url(#holoGrad1)" opacity="0.3" filter="url(#holoGlow)"/>
    
    <!-- Círculo principal holográfico -->
    <circle cx="100" cy="100" r="80" fill="none" stroke="url(#holoGrad1)" stroke-width="5" filter="url(#holoGlow)"/>
    <circle cx="100" cy="100" r="75" fill="none" stroke="url(#holoShift)" stroke-width="2" opacity="0.6"/>
    
    <!-- Capas iridiscentes -->
    <circle cx="100" cy="100" r="70" fill="url(#holoGrad1)" opacity="0.15"/>
    <circle cx="100" cy="100" r="70" fill="url(#holoShift)" opacity="0.1"/>
    
    <!-- Icono con efecto holográfico -->
    <g transform="translate(100, 75) scale(0.7)" filter="url(#holoGlow)">
      ${icono}
    </g>
    
    <!-- Reflejos iridiscentes -->
    <ellipse cx="75" cy="60" rx="25" ry="35" fill="url(#holoReflection)" opacity="0.3" transform="rotate(-30 75 60)"/>
    <ellipse cx="125" cy="70" rx="20" ry="30" fill="url(#holoReflection)" opacity="0.25" transform="rotate(25 125 70)"/>
    
    <!-- Iniciales con efecto cromático -->
    <text x="102" y="152" font-size="46" font-weight="900" text-anchor="middle" 
          fill="url(#holoGrad1)" font-family="'Orbitron', 'Exo', sans-serif"
          filter="url(#holoGlow)">
      ${iniciales}
    </text>
    <text x="100" y="150" font-size="46" font-weight="900" text-anchor="middle" 
          fill="white" font-family="'Orbitron', 'Exo', sans-serif"
          opacity="0.9">
      ${iniciales}
    </text>
    
    <!-- Líneas de escaneo holográfico -->
    <line x1="60" y1="155" x2="85" y2="155" stroke="url(#holoShift)" stroke-width="2" opacity="0.7" stroke-linecap="round"/>
    <line x1="115" y1="155" x2="140" y2="155" stroke="url(#holoShift)" stroke-width="2" opacity="0.7" stroke-linecap="round"/>
    
    <!-- Partículas holográficas -->
    <circle cx="130" cy="85" r="2.5" fill="#00ffff" opacity="0.8" filter="url(#holoGlow)"/>
    <circle cx="70" cy="115" r="2" fill="#ff00ff" opacity="0.8" filter="url(#holoGlow)"/>
    <circle cx="145" cy="125" r="1.5" fill="#ffff00" opacity="0.8" filter="url(#holoGlow)"/>
  `,

  // 4. Liquid Glass (Cristal Líquido)
  liquidGlass: (colores: any, icono: string, iniciales: string) => `
    <defs>
      <linearGradient id="liquidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${colores.gradient[0]};stop-opacity:0.9" />
        <stop offset="33%" style="stop-color:${colores.gradient[1]};stop-opacity:0.8" />
        <stop offset="66%" style="stop-color:${colores.gradient[2]};stop-opacity:0.85" />
        <stop offset="100%" style="stop-color:${colores.gradient[3]};stop-opacity:0.9" />
      </linearGradient>
      <filter id="liquidBlur">
        <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
        <feColorMatrix type="saturate" values="1.4"/>
      </filter>
      <filter id="liquidGlow">
        <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <radialGradient id="liquidShine">
        <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#ffffff;stop-opacity:0.5" />
        <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0" />
      </radialGradient>
    </defs>
    
    <!-- Fondo con gradiente líquido -->
    <rect width="200" height="200" fill="url(#liquidGrad)"/>
    
    ${PATRONES_ULTRA.ondasCerebrales(colores.accent)}
    
    <!-- Formas líquidas orgánicas -->
    <path d="M50,30 Q30,50 40,80 Q50,110 70,120 Q90,130 110,120 Q130,110 140,80 Q150,50 130,30 Q110,10 90,20 Q70,30 50,30" 
          fill="white" opacity="0.15" filter="url(#liquidBlur)"/>
    
    <!-- Burbuja principal de cristal líquido -->
    <circle cx="100" cy="100" r="75" fill="url(#liquidGrad)" opacity="0.6" filter="url(#liquidGlow)"/>
    <circle cx="100" cy="100" r="75" fill="white" opacity="0.12"/>
    
    <!-- Reflejos líquidos -->
    <ellipse cx="80" cy="70" rx="35" ry="45" fill="url(#liquidShine)" opacity="0.4" transform="rotate(-25 80 70)"/>
    <ellipse cx="120" cy="85" rx="25" ry="35" fill="url(#liquidShine)" opacity="0.3" transform="rotate(15 120 85)"/>
    
    <!-- Gotas líquidas flotantes -->
    <circle cx="60" cy="60" r="12" fill="white" opacity="0.25" filter="url(#liquidBlur)"/>
    <circle cx="140" cy="140" r="15" fill="white" opacity="0.2" filter="url(#liquidBlur)"/>
    <circle cx="145" cy="70" r="8" fill="white" opacity="0.3" filter="url(#liquidBlur)"/>
    
    <!-- Icono con efecto líquido -->
    <g transform="translate(100, 80) scale(0.72)" filter="url(#liquidGlow)">
      ${icono}
    </g>
    
    <!-- Superficie líquida para iniciales -->
    <ellipse cx="100" cy="145" rx="65" ry="30" fill="white" opacity="0.2" filter="url(#liquidBlur)"/>
    <ellipse cx="100" cy="143" rx="63" ry="28" fill="url(#liquidGrad)" opacity="0.3"/>
    
    <!-- Iniciales con efecto cristal líquido -->
    <text x="100" y="155" font-size="42" font-weight="800" text-anchor="middle" 
          fill="white" font-family="'Quicksand', 'Comfortaa', sans-serif"
          style="text-shadow: 0 4px 15px rgba(0,0,0,0.3), 0 0 20px rgba(255,255,255,0.4);">
      ${iniciales}
    </text>
    
    <!-- Ondas de superficie -->
    <path d="M40,145 Q55,140 70,145 T100,145 T130,145 T160,145" 
          fill="none" stroke="white" stroke-width="1.5" opacity="0.3"/>
  `,

  // 5. Aurora Boreal
  aurora: (colores: any, icono: string, iniciales: string) => `
    <defs>
      <linearGradient id="aurora1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#00ff87;stop-opacity:0.8" />
        <stop offset="50%" style="stop-color:#60efff;stop-opacity:0.7" />
        <stop offset="100%" style="stop-color:#0061ff;stop-opacity:0.8" />
      </linearGradient>
      <linearGradient id="aurora2" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#f72585;stop-opacity:0.7" />
        <stop offset="50%" style="stop-color:#7209b7;stop-opacity:0.6" />
        <stop offset="100%" style="stop-color:#3a0ca3;stop-opacity:0.7" />
      </linearGradient>
      <filter id="auroraGlow">
        <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <radialGradient id="auroraCenter">
        <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.3" />
        <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0" />
      </radialGradient>
    </defs>
    
    <!-- Fondo de noche polar -->
    <rect width="200" height="200" fill="#0a0e27"/>
    
    ${PATRONES_ULTRA.particulas('#ffffff')}
    
    <!-- Ondas de aurora -->
    <path d="M0,80 Q50,60 100,80 T200,80" fill="url(#aurora1)" opacity="0.4" filter="url(#auroraGlow)"/>
    <path d="M0,100 Q50,120 100,100 T200,100" fill="url(#aurora2)" opacity="0.4" filter="url(#auroraGlow)"/>
    <path d="M0,90 Q50,85 100,90 T200,90" fill="url(#aurora1)" opacity="0.3" filter="url(#auroraGlow)"/>
    
    <!-- Resplandor central -->
    <circle cx="100" cy="100" r="90" fill="url(#auroraCenter)"/>
    
    <!-- Círculo principal con aurora -->
    <circle cx="100" cy="100" r="75" fill="url(#aurora1)" opacity="0.25" filter="url(#auroraGlow)"/>
    <circle cx="100" cy="100" r="75" fill="url(#aurora2)" opacity="0.2" filter="url(#auroraGlow)"/>
    <circle cx="100" cy="100" r="75" fill="none" stroke="url(#aurora1)" stroke-width="2" opacity="0.6"/>
    
    <!-- Icono con resplandor aurora -->
    <g transform="translate(100, 75) scale(0.7)" filter="url(#auroraGlow)">
      ${icono}
    </g>
    
    <!-- Iniciales con efecto aurora -->
    <text x="100" y="155" font-size="44" font-weight="900" text-anchor="middle" 
          fill="url(#aurora1)" font-family="'Raleway', 'Montserrat', sans-serif"
          filter="url(#auroraGlow)">
      ${iniciales}
    </text>
    <text x="100" y="155" font-size="44" font-weight="900" text-anchor="middle" 
          fill="white" font-family="'Raleway', 'Montserrat', sans-serif"
          opacity="0.8">
      ${iniciales}
    </text>
    
    <!-- Estrellas brillantes -->
    <circle cx="30" cy="30" r="2" fill="#ffffff" opacity="0.9" filter="url(#auroraGlow)"/>
    <circle cx="170" cy="40" r="1.5" fill="#ffffff" opacity="0.8" filter="url(#auroraGlow)"/>
    <circle cx="160" cy="160" r="2" fill="#ffffff" opacity="0.9" filter="url(#auroraGlow)"/>
    <circle cx="40" cy="170" r="1.5" fill="#ffffff" opacity="0.8" filter="url(#auroraGlow)"/>
    <circle cx="185" cy="100" r="1" fill="#ffffff" opacity="0.7"/>
    <circle cx="15" cy="100" r="1" fill="#ffffff" opacity="0.7"/>
  `,

  // 6. Cyberpunk Neon
  cyberpunk: (colores: any, icono: string, iniciales: string) => `
    <defs>
      <linearGradient id="cyberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#ff006e;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#8338ec;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#3a86ff;stop-opacity:1" />
      </linearGradient>
      <filter id="cyberGlow">
        <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <filter id="cyberGlitch">
        <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="turbulence"/>
        <feDisplacementMap in2="turbulence" in="SourceGraphic" scale="3" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
    </defs>
    
    <!-- Fondo cyberpunk oscuro -->
    <rect width="200" height="200" fill="#0d0221"/>
    
    ${PATRONES_ULTRA.hexagonosUltra('#ff006e')}
    
    <!-- Grid cyberpunk -->
    <defs>
      <pattern id="cyberGrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ff006e" stroke-width="0.5" opacity="0.3"/>
      </pattern>
    </defs>
    <rect x="0" y="0" width="200" height="200" fill="url(#cyberGrid)"/>
    
    <!-- Resplandor neon de fondo -->
    <circle cx="100" cy="100" r="95" fill="#ff006e" opacity="0.15" filter="url(#cyberGlow)"/>
    <circle cx="100" cy="100" r="85" fill="#8338ec" opacity="0.12" filter="url(#cyberGlow)"/>
    
    <!-- Hexágono principal neon -->
    <polygon points="100,25 155,56.7 155,119.3 100,151 45,119.3 45,56.7" 
             fill="none" 
             stroke="url(#cyberGrad)" 
             stroke-width="4" 
             filter="url(#cyberGlow)"/>
    <polygon points="100,30 150,59 150,117 100,146 50,117 50,59" 
             fill="none" 
             stroke="#ff006e" 
             stroke-width="2" 
             opacity="0.5"/>
    
    <!-- Capa interna con efecto glitch -->
    <polygon points="100,35 145,61.5 145,114.5 100,141 55,114.5 55,61.5" 
             fill="#0d0221" 
             opacity="0.85"/>
    
    <!-- Icono con efecto neon -->
    <g transform="translate(100, 75) scale(0.68)" filter="url(#cyberGlow)">
      ${icono}
    </g>
    
    <!-- Barras neon decorativas -->
    <rect x="85" y="130" width="30" height="4" rx="2" fill="url(#cyberGrad)" filter="url(#cyberGlow)"/>
    <rect x="70" y="138" width="60" height="3" rx="1.5" fill="#3a86ff" opacity="0.7" filter="url(#cyberGlow)"/>
    
    <!-- Iniciales estilo cyberpunk -->
    <text x="100" y="162" font-size="42" font-weight="900" text-anchor="middle" 
          fill="url(#cyberGrad)" font-family="'Audiowide', 'Teko', 'Orbitron', sans-serif"
          filter="url(#cyberGlow)">
      ${iniciales}
    </text>
    <text x="100" y="162" font-size="42" font-weight="900" text-anchor="middle" 
          fill="#ffffff" font-family="'Audiowide', 'Teko', 'Orbitron', sans-serif"
          opacity="0.9">
      ${iniciales}
    </text>
    
    <!-- Elementos tecnológicos -->
    <circle cx="45" cy="56.7" r="4" fill="#ff006e" filter="url(#cyberGlow)"/>
    <circle cx="155" cy="56.7" r="4" fill="#8338ec" filter="url(#cyberGlow)"/>
    <circle cx="155" cy="119.3" r="4" fill="#3a86ff" filter="url(#cyberGlow)"/>
    <circle cx="45" cy="119.3" r="4" fill="#ff006e" filter="url(#cyberGlow)"/>
    
    <!-- Líneas de escaneo -->
    <line x1="60" y1="165" x2="80" y2="165" stroke="#ff006e" stroke-width="2" opacity="0.6" stroke-linecap="round"/>
    <line x1="120" y1="165" x2="140" y2="165" stroke="#3a86ff" stroke-width="2" opacity="0.6" stroke-linecap="round"/>
  `,

  // 7. Gradient Mesh Premium
  gradientMesh: (colores: any, icono: string, iniciales: string) => `
    <defs>
      <radialGradient id="meshGrad1" cx="30%" cy="30%">
        <stop offset="0%" style="stop-color:${colores.gradient[0]};stop-opacity:0.9" />
        <stop offset="100%" style="stop-color:${colores.gradient[1]};stop-opacity:0.4" />
      </radialGradient>
      <radialGradient id="meshGrad2" cx="70%" cy="40%">
        <stop offset="0%" style="stop-color:${colores.gradient[2]};stop-opacity:0.8" />
        <stop offset="100%" style="stop-color:${colores.gradient[1]};stop-opacity:0.3" />
      </radialGradient>
      <radialGradient id="meshGrad3" cx="50%" cy="70%">
        <stop offset="0%" style="stop-color:${colores.gradient[3]};stop-opacity:0.85" />
        <stop offset="100%" style="stop-color:${colores.gradient[0]};stop-opacity:0.35" />
      </radialGradient>
      <filter id="meshBlur">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
        <feColorMatrix type="saturate" values="1.5"/>
      </filter>
      <filter id="meshGlow">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    <!-- Base con múltiples gradientes -->
    <rect width="200" height="200" fill="${colores.gradient[0]}"/>
    
    <!-- Mesh de gradientes superpuestos -->
    <circle cx="60" cy="60" r="80" fill="url(#meshGrad1)" filter="url(#meshBlur)"/>
    <circle cx="140" cy="80" r="70" fill="url(#meshGrad2)" filter="url(#meshBlur)"/>
    <circle cx="100" cy="140" r="75" fill="url(#meshGrad3)" filter="url(#meshBlur)"/>
    
    ${PATRONES_ULTRA.ondasCerebrales(colores.accent)}
    
    <!-- Círculo principal con blend -->
    <circle cx="100" cy="100" r="75" fill="white" opacity="0.15"/>
    <circle cx="100" cy="100" r="73" fill="none" stroke="white" stroke-width="2" opacity="0.4"/>
    
    <!-- Icono con efecto mesh -->
    <g transform="translate(100, 75) scale(0.7)" filter="url(#meshGlow)">
      ${icono}
    </g>
    
    <!-- Plataforma para iniciales con mesh -->
    <ellipse cx="100" cy="145" rx="60" ry="25" fill="url(#meshGrad1)" opacity="0.6" filter="url(#meshBlur)"/>
    <ellipse cx="100" cy="143" rx="58" ry="23" fill="white" opacity="0.2"/>
    
    <!-- Iniciales con gradiente mesh -->
    <defs>
      <linearGradient id="textMesh" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
        <stop offset="50%" style="stop-color:${colores.tertiary};stop-opacity:0.9" />
        <stop offset="100%" style="stop-color:#ffffff;stop-opacity:1" />
      </linearGradient>
    </defs>
    <text x="100" y="155" font-size="40" font-weight="800" text-anchor="middle" 
          fill="url(#textMesh)" font-family="'Poppins', 'Inter', sans-serif"
          filter="url(#meshGlow)">
      ${iniciales}
    </text>
    
    <!-- Puntos de luz -->
    <circle cx="75" cy="75" r="3" fill="white" opacity="0.6" filter="url(#meshGlow)"/>
    <circle cx="125" cy="75" r="3" fill="white" opacity="0.6" filter="url(#meshGlow)"/>
    <circle cx="100" cy="120" r="2.5" fill="white" opacity="0.7" filter="url(#meshGlow)"/>
  `,

  // 8. Metallic Premium
  metallic: (colores: any, icono: string, iniciales: string) => `
    <defs>
      <linearGradient id="metalGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#e8eaf6;stop-opacity:1" />
        <stop offset="25%" style="stop-color:#c5cae9;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#9fa8da;stop-opacity:1" />
        <stop offset="75%" style="stop-color:#c5cae9;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#e8eaf6;stop-opacity:1" />
      </linearGradient>
      <linearGradient id="metalGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:${colores.primary};stop-opacity:0.8" />
        <stop offset="50%" style="stop-color:${colores.secondary};stop-opacity:0.6" />
        <stop offset="100%" style="stop-color:${colores.tertiary};stop-opacity:0.8" />
      </linearGradient>
      <filter id="metalEmboss">
        <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
        <feOffset dx="2" dy="2" result="offsetblur"/>
        <feFlood flood-color="#000000" flood-opacity="0.5"/>
        <feComposite in2="offsetblur" operator="in"/>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <filter id="metalShine">
        <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    <!-- Fondo metálico -->
    <rect width="200" height="200" fill="url(#metalGrad2)"/>
    
    ${PATRONES_ULTRA.hexagonosUltra(colores.accent)}
    
    <!-- Placa metálica principal -->
    <circle cx="100" cy="100" r="80" fill="url(#metalGrad1)" filter="url(#metalEmboss)"/>
    <circle cx="100" cy="100" r="78" fill="url(#metalGrad2)" opacity="0.3"/>
    
    <!-- Anillos metálicos -->
    <circle cx="100" cy="100" r="75" fill="none" stroke="#b0bec5" stroke-width="3" opacity="0.8"/>
    <circle cx="100" cy="100" r="72" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.6"/>
    <circle cx="100" cy="100" r="69" fill="none" stroke="#78909c" stroke-width="2" opacity="0.5"/>
    
    <!-- Icono con efecto metálico -->
    <g transform="translate(100, 75) scale(0.68)" filter="url(#metalEmboss)">
      ${icono}
    </g>
    
    <!-- Tornillos decorativos -->
    <g filter="url(#metalEmboss)">
      <circle cx="40" cy="40" r="5" fill="url(#metalGrad1)"/>
      <circle cx="160" cy="40" r="5" fill="url(#metalGrad1)"/>
      <circle cx="40" cy="160" r="5" fill="url(#metalGrad1)"/>
      <circle cx="160" cy="160" r="5" fill="url(#metalGrad1)"/>
      <circle cx="40" cy="40" r="3" fill="#546e7a"/>
      <circle cx="160" cy="40" r="3" fill="#546e7a"/>
      <circle cx="40" cy="160" r="3" fill="#546e7a"/>
      <circle cx="160" cy="160" r="3" fill="#546e7a"/>
    </g>
    
    <!-- Placa para iniciales -->
    <rect x="50" y="130" width="100" height="45" rx="8" fill="url(#metalGrad1)" filter="url(#metalEmboss)"/>
    <rect x="52" y="132" width="96" height="41" rx="6" fill="#37474f" opacity="0.3"/>
    
    <!-- Iniciales grabadas en metal -->
    <text x="100" y="163" font-size="36" font-weight="900" text-anchor="middle" 
          fill="url(#metalGrad1)" font-family="'Roboto', 'Arial', sans-serif"
          filter="url(#metalEmboss)">
      ${iniciales}
    </text>
    
    <!-- Reflejos metálicos -->
    <ellipse cx="80" cy="65" rx="20" ry="30" fill="white" opacity="0.3" transform="rotate(-25 80 65)"/>
    <ellipse cx="120" cy="70" rx="15" ry="25" fill="white" opacity="0.25" transform="rotate(20 120 70)"/>
  `,

  // 9. Paper Cut Premium
  paperCut: (colores: any, icono: string, iniciales: string) => `
    <defs>
      <linearGradient id="paperGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${colores.gradient[0]};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${colores.gradient[2]};stop-opacity:1" />
      </linearGradient>
      <filter id="paperShadow1">
        <feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.3"/>
      </filter>
      <filter id="paperShadow2">
        <feDropShadow dx="0" dy="8" stdDeviation="8" flood-opacity="0.25"/>
      </filter>
      <filter id="paperShadow3">
        <feDropShadow dx="0" dy="12" stdDeviation="12" flood-opacity="0.2"/>
      </filter>
    </defs>
    
    <!-- Fondo con gradiente -->
    <rect width="200" height="200" fill="url(#paperGrad)"/>
    
    <!-- Capa 1 (más lejana) -->
    <circle cx="100" cy="100" r="90" fill="${colores.gradient[3]}" opacity="0.6" filter="url(#paperShadow3)"/>
    
    <!-- Capa 2 -->
    <circle cx="100" cy="100" r="80" fill="${colores.gradient[1]}" opacity="0.8" filter="url(#paperShadow2)"/>
    
    <!-- Capa 3 (más cercana) -->
    <circle cx="100" cy="100" r="70" fill="#ffffff" opacity="0.95" filter="url(#paperShadow1)"/>
    
    <!-- Icono en capa superior -->
    <g transform="translate(100, 75) scale(0.65)" filter="url(#paperShadow1)">
      ${icono}
    </g>
    
    <!-- Ondas decorativas en capas -->
    <path d="M30,100 Q50,90 70,100 T110,100 T150,100 T170,100" 
          fill="none" 
          stroke="${colores.primary}" 
          stroke-width="2" 
          opacity="0.3"
          filter="url(#paperShadow1)"/>
    
    <!-- Plataforma para iniciales en capas -->
    <ellipse cx="100" cy="145" rx="70" ry="20" fill="${colores.gradient[2]}" opacity="0.4" filter="url(#paperShadow2)"/>
    <ellipse cx="100" cy="143" rx="65" ry="18" fill="${colores.gradient[1]}" opacity="0.6" filter="url(#paperShadow1)"/>
    <ellipse cx="100" cy="141" rx="60" ry="16" fill="#ffffff" opacity="0.95"/>
    
    <!-- Iniciales con sombra en capas -->
    <text x="100" y="153" font-size="38" font-weight="800" text-anchor="middle" 
          fill="${colores.primary}" font-family="'Nunito', 'Quicksand', sans-serif"
          filter="url(#paperShadow1)">
      ${iniciales}
    </text>
    
    <!-- Detalles decorativos en capas -->
    <circle cx="50" cy="50" r="8" fill="${colores.gradient[0]}" opacity="0.7" filter="url(#paperShadow1)"/>
    <circle cx="150" cy="50" r="10" fill="${colores.gradient[1]}" opacity="0.6" filter="url(#paperShadow1)"/>
    <circle cx="50" cy="150" r="6" fill="${colores.gradient[2]}" opacity="0.8" filter="url(#paperShadow1)"/>
    <circle cx="150" cy="150" r="9" fill="${colores.gradient[3]}" opacity="0.5" filter="url(#paperShadow1)"/>
  `,

  // 10. Minimalist Luxury
  minimalistLuxury: (colores: any, icono: string, iniciales: string) => `
    <defs>
      <linearGradient id="luxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${colores.primary};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${colores.secondary};stop-opacity:1" />
      </linearGradient>
      <filter id="luxShadow">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.15"/>
      </filter>
    </defs>
    
    <!-- Fondo minimalista blanco -->
    <rect width="200" height="200" fill="#fafafa"/>
    
    <!-- Círculo principal con gradiente sutil -->
    <circle cx="100" cy="100" r="75" fill="url(#luxGrad)" filter="url(#luxShadow)"/>
    
    <!-- Borde de lujo -->
    <circle cx="100" cy="100" r="73" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.6"/>
    
    <!-- Icono minimalista -->
    <g transform="translate(100, 85) scale(0.5)" opacity="0.95">
      ${icono}
    </g>
    
    <!-- Iniciales minimalistas -->
    <text x="100" y="140" font-size="30" font-weight="600" text-anchor="middle" 
          fill="#ffffff" font-family="'SF Pro Display', 'Helvetica Neue', sans-serif"
          letter-spacing="3">
      ${iniciales}
    </text>
    
    <!-- Línea decorativa minimalista -->
    <line x1="80" y1="148" x2="120" y2="148" stroke="#ffffff" stroke-width="1.5" opacity="0.7" stroke-linecap="round"/>
    
    <!-- Detalles sutiles -->
    <circle cx="100" cy="100" r="72" fill="none" stroke="#ffffff" stroke-width="0.5" opacity="0.3"/>
  `
};

// ========================================
// 🎯 FUNCIÓN PARA EXTRAER INICIALES
// ========================================
function extraerIniciales(nombre: string): string {
  const palabras = nombre.trim().split(/\s+/).filter(p => p.length > 0);
  if (palabras.length === 0) return "MC";
  if (palabras.length === 1) {
    const palabra = palabras[0];
    if (palabra.length >= 2) {
      return (palabra[0] + palabra[1]).toUpperCase();
    }
    return (palabra[0] + palabra[0]).toUpperCase();
  }
  return (palabras[0][0] + palabras[1][0]).toUpperCase();
}

// ========================================
// 🎨 SELECCIONAR ICONO ALEATORIO
// ========================================
function seleccionarIconoAleatorio(): string {
  const iconos = Object.values(ICONOS_MEDICOS_ULTRA);
  return iconos[Math.floor(Math.random() * iconos.length)];
}

// ========================================
// 🎨 GENERAR SVG ULTRA PREMIUM
// ========================================
function generarLogoUltraPremium(
  nombre: string,
  region: string,
  tipo: string,
  estilo?: string
): string {
  // Obtener colores según región
  const colores = COLORES_REGION[region] || {
    primary: "#667EEA",
    secondary: "#764BA2",
    accent: "#F093FB",
    tertiary: "#F5576C",
    gradient: ["#667EEA", "#764BA2", "#F093FB", "#F5576C"],
    glow: "#667EEA"
  };

  // Extraer iniciales
  const iniciales = extraerIniciales(nombre);

  // Seleccionar icono médico
  const icono = seleccionarIconoAleatorio();

  // Seleccionar estilo
  const estilosDisponibles = Object.keys(ESTILOS_LOGO_ULTRA);
  const estiloSeleccionado = estilo && estilosDisponibles.includes(estilo) 
    ? estilo 
    : estilosDisponibles[Math.floor(Math.random() * estilosDisponibles.length)];

  // Generar contenido del logo
  const contenidoLogo = ESTILOS_LOGO_ULTRA[estiloSeleccionado as keyof typeof ESTILOS_LOGO_ULTRA](
    colores,
    icono,
    iniciales
  );

  // Crear SVG completo
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  ${contenidoLogo}
</svg>`;

  return svg;
}

// ========================================
// 🌐 POST HANDLER
// ========================================
export async function POST(request: Request) {
  try {
    console.log("📤 POST /api/logo/generate - ULTRA PREMIUM Generator");

    const body = (await request.json()) as LogoRequest;
    const { nombre, region, tipo, id_centro, estilo } = body;

    if (!nombre || nombre.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "El nombre del centro es requerido" },
        { status: 400 }
      );
    }

    if (!id_centro || isNaN(Number(id_centro))) {
      return NextResponse.json(
        { success: false, error: "ID del centro inválido" },
        { status: 400 }
      );
    }

    const uploadDir = join(
      process.cwd(),
      "public",
      "uploads",
      "centros",
      id_centro,
      "logos"
    );

    await mkdir(uploadDir, { recursive: true });

    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const estiloUsado = estilo || "random";
    const filename = `logo_ultra_${id_centro}_${estiloUsado}_${timestamp}_${random}.svg`;
    const filepath = join(uploadDir, filename);

    const svgContent = generarLogoUltraPremium(nombre, region, tipo, estilo);

    await writeFile(filepath, svgContent, "utf-8");

    const logoUrl = `/uploads/centros/${id_centro}/logos/${filename}`;

    console.log(`✅ Logo ULTRA PREMIUM generado para Centro ${id_centro}`);
    console.log(`   📁 Archivo: ${filename}`);
    console.log(`   🎨 Estilo: ${estiloUsado}`);
    console.log(`   📍 Región: ${region}`);
    console.log(`   🔤 Iniciales: ${extraerIniciales(nombre)}`);

    return NextResponse.json({
      success: true,
      message: "Logo ULTRA PREMIUM generado exitosamente",
      logoUrl,
      filename,
      nombre,
      region,
      tipo,
      id_centro,
      estilo: estiloUsado,
      iniciales: extraerIniciales(nombre),
      disponibles: {
        estilos: Object.keys(ESTILOS_LOGO_ULTRA),
        iconos: Object.keys(ICONOS_MEDICOS_ULTRA).length,
        patrones: Object.keys(PATRONES_ULTRA).length,
        colores: Object.keys(COLORES_REGION).length
      }
    });
  } catch (error: any) {
    console.error("❌ Error en POST /api/logo/generate:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al generar logo ultra premium",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ========================================
// 🔄 GET HANDLER
// ========================================
export async function GET(request: Request) {
  return NextResponse.json({
    success: true,
    message: "🎨 API de Generación de Logos ULTRA PREMIUM",
    version: "3.0 - Ultra Premium Edition",
    subtitle: "Superando a DALL-E, Canva y todos los generadores",
    endpoint: "POST /api/logo/generate",
    parametros: {
      nombre: "string (requerido) - Nombre del centro médico",
      region: "string (opcional) - Región de Chile para paleta de colores",
      tipo: "string (opcional) - Tipo de centro médico",
      id_centro: "string (requerido) - ID único del centro",
      estilo: "string (opcional) - Estilo específico o 'random'"
    },
    estilos_disponibles: Object.keys(ESTILOS_LOGO_ULTRA),
    caracteristicas_premium: [
      "🎨 10 estilos ultra premium únicos",
      "🏥 20 iconos médicos ultra detallados",
      "🌈 15 paletas de colores por región",
      "✨ Efectos glassmorphism avanzados",
      "🎭 Gradientes mesh profesionales",
      "💎 Efectos 3D y neomorphism",
      "⚡ Efectos neon y holográficos",
      "🌌 Efectos aurora boreal",
      "🔮 8 patrones decorativos únicos",
      "🎯 Diseño responsive y escalable",
      "🚀 Calidad superior a DALL-E",
      "💫 Texturas liquid glass",
      "🎪 Efectos cyberpunk",
      "📄 Paper cut en capas",
      "👑 Minimalismo de lujo"
    ],
    estilos_detallados: {
      glassmorphism: "Efecto cristal con múltiples capas y reflejos",
      neomorphism: "Diseño soft UI con sombras duales",
      holographic: "Efectos iridiscentes y cromáticos",
      liquidGlass: "Cristal líquido con texturas orgánicas",
      aurora: "Inspirado en aurora boreal con resplandor",
      cyberpunk: "Neon futurista estilo cyberpunk",
      gradientMesh: "Mesh de gradientes superpuestos",
      metallic: "Acabado metálico con emboss",
      paperCut: "Corte de papel en múltiples capas",
      minimalistLuxury: "Minimalismo de lujo y elegancia"
    },
    iconos_medicos: Object.keys(ICONOS_MEDICOS_ULTRA),
    patrones_disponibles: Object.keys(PATRONES_ULTRA),
    regiones_chile: Object.keys(COLORES_REGION),
    ejemplos: {
      basico: {
        nombre: "Centro Médico Santiago",
        region: "Región Metropolitana de Santiago",
        tipo: "hospital",
        id_centro: "1"
      },
      con_estilo_glassmorphism: {
        nombre: "Clínica Los Andes",
        region: "Región de Valparaíso",
        tipo: "clinica",
        id_centro: "2",
        estilo: "glassmorphism"
      },
      con_estilo_holografico: {
        nombre: "Hospital Regional",
        region: "Región de Los Lagos",
        tipo: "hospital",
        id_centro: "3",
        estilo: "holographic"
      },
      con_estilo_aurora: {
        nombre: "Centro de Salud Familiar",
        region: "Región de Magallanes y de la Antártica Chilena",
        tipo: "cesfam",
        id_centro: "4",
        estilo: "aurora"
      }
    }
  });
}