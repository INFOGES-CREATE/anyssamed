# 🚑 Sistema de Respondedores Comunitarios

## Sistema Premium de Gestión de Emergencias para Centros de Salud Comunales

Sistema completo y profesional para la gestión, despacho y seguimiento de respondedores comunitarios en situaciones de emergencia. Diseñado específicamente para centros de emergencias comunales con todas las herramientas necesarias para una operación eficiente.

---

## ✨ Características Principales

### 🗺️ Mapa Interactivo de Gran Tamaño
- **Mapa de 75vh de altura** (maximizable a 85vh)
- **4 capas de visualización**: Calles, Satélite, Topográfico y Modo Oscuro
- **Clustering inteligente** de marcadores para mejor visualización
- **Iconos personalizados** con animaciones según estado del respondedor
- **Círculos de cobertura ajustables** (0.5km - 10km)
- **Geolocalización automática** del usuario
- **Popups informativos** con datos completos y acciones rápidas
- **Marcadores de emergencias** con niveles de severidad

### 📊 Panel de Estadísticas en Tiempo Real
- Total de respondedores activos
- Respondedores disponibles (con porcentaje)
- Respondedores en servicio activo
- Emergencias activas con contador
- Tiempo promedio de respuesta
- Evaluación promedio del equipo
- Respondedores fuera de servicio

### 🔍 Sistema de Filtros Avanzado
- Búsqueda por nombre, RUT o teléfono
- Filtro por tipo de respondedor (Paramédico, Enfermero, Médico, etc.)
- Filtro por estado (Disponible, En Ruta, En Sitio, etc.)
- Filtro por disponibilidad
- Filtro por nivel de experiencia
- Filtro por especialidad
- Filtros aplicables en tiempo real

### 📱 Tres Modos de Visualización
1. **Modo Mapa**: Vista completa del mapa
2. **Modo Lista**: Tabla detallada con toda la información
3. **Modo Dividido**: Mapa y lista simultáneos

### 🚨 Panel de Emergencias Activas
- Listado de emergencias en tiempo real
- Indicadores de severidad (Baja, Media, Alta, Crítica)
- Botón de despacho rápido al respondedor más cercano
- Notificaciones con contador animado

### 📞 Acciones Rápidas
- Llamada directa desde el mapa
- Envío de mensajes
- Asignación de emergencias
- Navegación a ubicación
- Actualización de estado

---

## 🎨 Diseño y Experiencia de Usuario

### Características de Diseño Premium
- **Gradientes modernos** en fondos y elementos
- **Animaciones suaves** en transiciones y estados
- **Iconos animados** con pulsos y efectos
- **Tarjetas con sombras** y efectos hover
- **Badges coloridos** según estado y tipo
- **Diseño responsive** para todos los dispositivos
- **Tema claro optimizado** con opción a tema oscuro

### Paleta de Colores
- **Verde Esmeralda** (#10b981): Disponibles y acciones principales
- **Azul** (#3b82f6): En ruta y acciones secundarias
- **Ámbar** (#f59e0b): En sitio y advertencias
- **Rojo** (#ef4444): Emergencias y ocupados
- **Gris** (#6b7280): Fuera de servicio

---

## 🚀 Instalación y Configuración

### 1. Dependencias Instaladas

```bash
npm install leaflet react-leaflet@^4.2.1 react-leaflet-cluster @types/leaflet --legacy-peer-deps
```

### 2. Archivos Creados

```
src/app/(dashboard)/admin/respondedores-comunitarios/
├── page.tsx                          # Página principal
├── components/
│   └── MapaRespondedores.tsx        # Componente del mapa
└── README.md                         # Esta documentación
```

### 3. Estructura de Datos

#### Respondedor
```typescript
type Respondedor = {
  id_respondedor: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string;
  nombre_completo?: string;
  rut?: string;
  celular_personal?: string;
  email_personal?: string;
  direccion_personal?: string;
  localidad?: string;
  comuna?: string;
  organizacion_pertenece?: string;
  tipo_respondedor: "FUNCIONARIO" | "VOLUNTARIO" | "PARAMEDICO" | "ENFERMERO" | "MEDICO" | "VEHICULO" | "OTRO";
  rol_respondedor?: string;
  especialidad?: string;
  nivel_experiencia?: "BASICO" | "INTERMEDIO" | "AVANZADO" | "EXPERTO";
  estado: "DISPONIBLE" | "EN_RUTA" | "EN_SITIO" | "OCUPADO" | "FUERA_DE_SERVICIO";
  disponible: boolean;
  latitud?: number;
  longitud?: number;
  centro_nombre?: string;
  emergencia_nombre?: string;
  emergencias_activas?: number;
  total_emergencias?: number;
  tiempo_promedio_respuesta?: number;
  evaluacion_promedio?: number;
  fecha_asignacion?: string;
};
```

#### Emergencia
```typescript
type Emergencia = {
  id: number;
  nombre: string;
  direccion: string;
  latitud: number;
  longitud: number;
  severidad: "BAJA" | "MEDIA" | "ALTA" | "CRITICA";
  estado: "ABIERTA" | "EN_PROCESO" | "CERRADA";
  respondedores_asignados?: number;
  tiempo_transcurrido?: number;
};
```

---

## 🔌 API Endpoints Necesarios

### GET /api/respondedores/listar
Obtiene el listado completo de respondedores con sus coordenadas

**Respuesta:**
```json
{
  "respondedores": [
    {
      "id_respondedor": 1,
      "nombre_completo": "Juan Pérez",
      "tipo_respondedor": "PARAMEDICO",
      "estado": "DISPONIBLE",
      "disponible": true,
      "latitud": -34.9806453,
      "longitud": -71.2335392,
      ...
    }
  ],
  "total": 15
}
```

### GET /api/respondedores/estadisticas
Obtiene estadísticas generales del sistema

**Respuesta:**
```json
{
  "total_respondedores": 15,
  "disponibles": 8,
  "en_servicio": 4,
  "fuera_servicio": 3,
  "tiempo_promedio_respuesta": 8.5,
  "evaluacion_promedio": 4.6,
  "emergencias_activas": 2
}
```

### GET /api/emergencias/activas
Obtiene las emergencias activas actualmente

**Respuesta:**
```json
{
  "emergencias": [
    {
      "id": 1,
      "nombre": "Accidente de tránsito",
      "direccion": "Av. Principal 1234",
      "latitud": -34.9856453,
      "longitud": -71.2385392,
      "severidad": "ALTA",
      "estado": "ABIERTA"
    }
  ]
}
```

### POST /api/respondedores/despachar
Despacha un respondedor a una emergencia

**Petición:**
```json
{
  "id_respondedor": 1,
  "id_emergencia": 5,
  "prioridad": "ALTA"
}
```

**Respuesta:**
```json
{
  "success": true,
  "mensaje": "Respondedor despachado exitosamente",
  "tiempo_estimado": 8
}
```

---

## 📱 Uso del Sistema

### Acceso
1. Iniciar sesión en el sistema
2. Navegar a: `/admin/respondedores-comunitarios`

### Visualización del Mapa
1. El mapa se carga automáticamente centrado en Curicó, Chile
2. Los marcadores muestran:
   - **Verde con pulso**: Respondedor disponible
   - **Azul**: Respondedor en ruta
   - **Ámbar**: Respondedor en sitio
   - **Rojo**: Emergencia activa
   - **Gris**: Fuera de servicio

### Interacción con Respondedores
1. **Click en marcador**: Ver información detallada
2. **Botón "Llamar"**: Iniciar llamada telefónica
3. **Botón "Despachar"**: Asignar a emergencia
4. Los círculos de cobertura muestran el alcance de cada respondedor

### Gestión de Emergencias
1. Las emergencias aparecen con marcadores rojos animados
2. El panel lateral muestra emergencias activas
3. **"Despachar Respondedor"**: Asigna automáticamente el más cercano

### Filtros
1. Usar la barra de filtros para buscar respondedores específicos
2. Los filtros se aplican tanto al mapa como a la lista
3. **"Limpiar"**: Restablecer todos los filtros

### Cambio de Vista
1. **Mapa**: Vista completa del mapa
2. **Lista**: Tabla con todos los datos
3. **Dividido**: Mapa y lista simultáneos

---

## 🔧 Configuración Avanzada

### Ajustar Centro Inicial del Mapa
Editar en `page.tsx`:
```typescript
const centroInicial: [number, number] = [-34.9806453, -71.2335392]; // Curicó
```

### Modificar Radio de Cobertura por Defecto
Editar en `MapaRespondedores.tsx`:
```typescript
const [radioCobertura, setRadioCobertura] = useState(3000); // metros
```

### Cambiar Altura del Mapa
Editar en `page.tsx`:
```typescript
<div style={{ height: '75vh' }}> // Ajustar según necesidad
```

### Auto-refresh
El sistema actualiza automáticamente cada 30 segundos:
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    cargarDatos(false);
  }, 30000); // 30 segundos
  return () => clearInterval(interval);
}, []);
```

---

## 🎯 Funcionalidades Clave para Emergencias

### 1. Despacho Rápido
- Cálculo automático del respondedor más cercano
- Consideración de disponibilidad y especialidad
- Notificación inmediata al respondedor

### 2. Seguimiento en Tiempo Real
- Actualización automática de posiciones
- Estados en tiempo real
- Historial de movimientos

### 3. Comunicación Directa
- Llamadas telefónicas con un click
- Envío de mensajes
- Notificaciones push (próximamente)

### 4. Métricas y Evaluación
- Tiempo de respuesta por respondedor
- Evaluaciones de desempeño
- Estadísticas de cobertura

---

## 🛡️ Consideraciones de Seguridad

1. **Autenticación**: Verificar sesión del usuario
2. **Autorización**: Solo personal autorizado puede despachar
3. **Validación**: Verificar coordenadas y datos antes de guardar
4. **Logs**: Registrar todas las acciones de despacho
5. **Privacidad**: Proteger datos personales de respondedores

---

## 📈 Próximas Mejoras

- [ ] Rutas optimizadas con algoritmos de pathfinding
- [ ] Predicción de tiempos de llegada con tráfico en tiempo real
- [ ] Chat interno entre respondedores y coordinación
- [ ] Notificaciones push y SMS
- [ ] Grabación de audio/video de emergencias
- [ ] Integración con drones y cámaras de seguridad
- [ ] Dashboard analítico con BI
- [ ] App móvil para respondedores
- [ ] Integración con servicios de emergencia nacionales
- [ ] Sistema de turnos y calendario

---

## 🐛 Solución de Problemas

### El mapa no se muestra
1. Verificar que las dependencias estén instaladas
2. Revisar console del navegador para errores
3. Verificar que el componente se importa con `dynamic` y `ssr: false`

### Los marcadores no aparecen
1. Verificar que los respondedores tengan coordenadas válidas
2. Las coordenadas deben estar en formato decimal (no grados/minutos/segundos)
3. Para Chile: latitud entre -56 y -17, longitud entre -76 y -66

### Errores de importación de Leaflet
1. Asegurarse de tener instalado `@types/leaflet`
2. Importar CSS: `import 'leaflet/dist/leaflet.css'`
3. Usar importación dinámica para el componente del mapa

---

## 📞 Soporte

Para soporte técnico o reportar problemas:
- Email: soporte@cogrid.cl
- Teléfono: +56 9 XXXX XXXX
- Documentación: https://docs.cogrid.cl

---

## 📝 Licencia

Sistema COGRID - Respondedores Comunitarios
© 2024 - Todos los derechos reservados

---

**Versión**: 1.0.0
**Última actualización**: Diciembre 2024
**Desarrollado para**: Centros de Emergencias Comunales de Chile
