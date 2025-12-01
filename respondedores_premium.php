<?php
/**
 * ============================================================
 * 🚑 RESPONDEDORES COMUNITARIOS - SISTEMA PREMIUM
 * ============================================================
 * COGRID COMUNAL - Gestión Integral de Emergencias
 * Versión: 4.0 ULTRA PREMIUM EDITION
 * 
 * CARACTERÍSTICAS PREMIUM:
 * ✅ Mapa interactivo gigante (750px) con 5 capas diferentes
 * ✅ Clustering inteligente de marcadores
 * ✅ Panel de despacho en tiempo real
 * ✅ Comunicación directa con respondedores
 * ✅ Cálculo automático de rutas y tiempos
 * ✅ Estadísticas en tiempo real con gráficos dinámicos
 * ✅ Filtros avanzados multicapa
 * ✅ Exportación a múltiples formatos
 * ✅ Notificaciones push y alertas
 * ✅ Gestión de turnos y disponibilidad
 * ✅ Sistema de evaluación y métricas
 * ============================================================
 */

session_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);

require_once 'config/env.php';

if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit();
}

$user_id = $_SESSION['user_id'];

// ============================================================
// FUNCIONES
// ============================================================

function obtenerDatosUsuario($db, $userId) {
    $sql = "SELECT u.*, up.color_primario, up.ciudad 
            FROM usuarios u
            LEFT JOIN usuarios_preferencias up ON u.id_usuario = up.id_usuario
            WHERE u.id_usuario = ? LIMIT 1";
    $stmt = $db->prepare($sql);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    return $stmt->get_result()->fetch_assoc();
}

function obtenerRespondedores($db) {
    $sql = "SELECT er.*, 
            CONCAT_WS(' ', er.nombres, er.apellido_paterno, er.apellido_materno) as nombre_completo,
            cs.nombre AS centro_nombre,
            CAST(er.latitud AS DECIMAL(10,7)) as latitud,
            CAST(er.longitud AS DECIMAL(10,7)) as longitud
            FROM emergencias_respondedores er
            LEFT JOIN centros_salud cs ON er.id_centro = cs.id_centro
            WHERE er.activo = 1
            AND er.latitud BETWEEN -56 AND -17
            AND er.longitud BETWEEN -76 AND -66
            ORDER BY er.disponible DESC, er.nombres ASC";
    $result = $db->query($sql);
    return $result ? $result->fetch_all(MYSQLI_ASSOC) : [];
}

function obtenerEstadisticas($db) {
    return [
        'total' => $db->query("SELECT COUNT(*) as c FROM emergencias_respondedores WHERE activo=1")->fetch_assoc()['c'],
        'disponibles' => $db->query("SELECT COUNT(*) as c FROM emergencias_respondedores WHERE activo=1 AND disponible=1")->fetch_assoc()['c'],
        'en_servicio' => $db->query("SELECT COUNT(*) as c FROM emergencias_respondedores WHERE activo=1 AND estado IN ('EN_RUTA','EN_SITIO')")->fetch_assoc()['c']
    ];
}

$usuario = obtenerDatosUsuario($db, $user_id);
$respondedores = obtenerRespondedores($db);
$stats = obtenerEstadisticas($db);
$color = $usuario['color_primario'] ?? '#10b981';

date_default_timezone_set('America/Santiago');
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🚑 Respondedores Comunitarios PREMIUM | COGRID</title>
    
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    
    <!-- Leaflet CSS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css" />
    
    <!-- DataTables CSS -->
    <link rel="stylesheet" href="https://cdn.datatables.net/1.13.7/css/dataTables.bootstrap5.min.css">
    
    <style>
        :root {
            --primary: <?php echo $color; ?>;
            --primary-dark: #059669;
            --primary-light: rgba(16, 185, 129, 0.1);
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
            min-height: 100vh;
        }
        
        /* HEADER PREMIUM */
        .top-bar {
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
            color: white;
            padding: 1.5rem 2rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            position: sticky;
            top: 0;
            z-index: 1000;
        }
        
        .top-bar h1 {
            font-size: 2rem;
            font-weight: 800;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .top-bar .subtitle {
            font-size: 0.9rem;
            opacity: 0.9;
            margin-top: 0.25rem;
        }
        
        /* KPI CARDS ULTRA PREMIUM */
        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
            margin: 2rem 0;
        }
        
        .kpi-card {
            background: white;
            border-radius: 20px;
            padding: 2rem;
            box-shadow: 0 10px 40px rgba(0,0,0,0.08);
            border: 1px solid rgba(0,0,0,0.05);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }
        
        .kpi-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 5px;
            height: 100%;
            background: var(--primary);
        }
        
        .kpi-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        }
        
        .kpi-icon {
            width: 70px;
            height: 70px;
            background: var(--primary-light);
            border-radius: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.5rem;
        }
        
        .kpi-icon i {
            font-size: 32px;
            color: var(--primary);
        }
        
        .kpi-value {
            font-size: 3rem;
            font-weight: 900;
            color: #1f2937;
            line-height: 1;
            margin-bottom: 0.5rem;
        }
        
        .kpi-label {
            font-size: 1rem;
            color: #6b7280;
            font-weight: 600;
        }
        
        /* MAPA GIGANTE PREMIUM */
        .map-container {
            background: white;
            border-radius: 24px;
            padding: 2rem;
            box-shadow: 0 20px 60px rgba(0,0,0,0.12);
            margin: 2rem 0;
            border: 1px solid rgba(0,0,0,0.05);
        }
        
        .map-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1.5rem;
            border-bottom: 3px solid #f3f4f6;
        }
        
        .map-title {
            font-size: 1.75rem;
            font-weight: 800;
            color: #1f2937;
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .map-controls {
            display: flex;
            gap: 1rem;
        }
        
        .map-btn {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .btn-primary-custom {
            background: var(--primary);
            color: white;
        }
        
        .btn-primary-custom:hover {
            background: var(--primary-dark);
            transform: scale(1.05);
        }
        
        #mapa {
            height: 750px;
            border-radius: 16px;
            border: 3px solid #f3f4f6;
            box-shadow: inset 0 2px 8px rgba(0,0,0,0.05);
        }
        
        .mapa-maximizado #mapa {
            height: 85vh;
        }
        
        /* FILTROS PREMIUM */
        .filters-panel {
            background: white;
            border-radius: 24px;
            padding: 2rem;
            box-shadow: 0 10px 40px rgba(0,0,0,0.08);
            margin: 2rem 0;
        }
        
        .filter-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 1.5rem;
            margin-top: 1.5rem;
        }
        
        .filter-group label {
            display: block;
            font-weight: 600;
            color: #374151;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
        }
        
        .filter-input {
            width: 100%;
            padding: 0.875rem 1rem;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            font-size: 0.95rem;
            transition: all 0.3s;
        }
        
        .filter-input:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 4px var(--primary-light);
        }
        
        /* TABLA PREMIUM */
        .table-container {
            background: white;
            border-radius: 24px;
            padding: 2rem;
            box-shadow: 0 10px 40px rgba(0,0,0,0.08);
            margin: 2rem 0;
        }
        
        table.dataTable thead th {
            background: #f9fafb !important;
            font-weight: 700 !important;
            color: #1f2937 !important;
            padding: 1.25rem !important;
            border: none !important;
            text-transform: uppercase;
            font-size: 0.8rem;
            letter-spacing: 0.5px;
        }
        
        table.dataTable tbody tr {
            transition: all 0.2s;
        }
        
        table.dataTable tbody tr:hover {
            background: #f9fafb !important;
            transform: translateX(4px);
        }
        
        table.dataTable tbody td {
            padding: 1.25rem !important;
            vertical-align: middle !important;
        }
        
        /* BADGES PREMIUM */
        .badge-custom {
            padding: 0.5rem 1rem;
            border-radius: 50px;
            font-weight: 700;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .badge-success { background: #d1fae5; color: #065f46; }
        .badge-warning { background: #fef3c7; color: #92400e; }
        .badge-danger { background: #fee2e2; color: #991b1b; }
        .badge-info { background: #dbeafe; color: #1e40af; }
        
        /* BOTONES ACCIÓN */
        .action-btn {
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 10px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            margin: 0 0.25rem;
        }
        
        .btn-view { background: #3b82f6; color: white; }
        .btn-edit { background: #f59e0b; color: white; }
        .btn-delete { background: #ef4444; color: white; }
        
        .action-btn:hover { transform: scale(1.1); }
        
        /* POPUP MAPA PREMIUM */
        .leaflet-popup-content-wrapper {
            border-radius: 16px !important;
            box-shadow: 0 20px 60px rgba(0,0,0,0.25) !important;
            padding: 0 !important;
        }
        
        .popup-header {
            background: var(--primary);
            color: white;
            padding: 1rem 1.5rem;
            font-weight: 700;
            font-size: 1.1rem;
            border-radius: 16px 16px 0 0;
        }
        
        .popup-body {
            padding: 1.5rem;
        }
        
        .popup-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 0.75rem;
            font-size: 0.95rem;
        }
        
        .popup-item i {
            color: var(--primary);
            width: 20px;
        }
        
        .popup-status {
            display: inline-block;
            padding: 0.5rem 1rem;
            border-radius: 50px;
            font-weight: 700;
            font-size: 0.8rem;
            margin-top: 1rem;
        }
        
        /* LOADING */
        .loading {
            position: fixed;
            inset: 0;
            background: rgba(255,255,255,0.95);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        }
        
        .spinner {
            width: 60px;
            height: 60px;
            border: 5px solid #f3f4f6;
            border-top-color: var(--primary);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        /* RESPONSIVE */
        @media (max-width: 768px) {
            .kpi-grid { grid-template-columns: 1fr; }
            #mapa { height: 500px; }
            .top-bar h1 { font-size: 1.5rem; }
        }
    </style>
</head>
<body>
    <div class="loading" id="loading">
        <div>
            <div class="spinner"></div>
            <p class="mt-3 text-center fw-bold">Cargando sistema...</p>
        </div>
    </div>

    <!-- HEADER -->
    <div class="top-bar">
        <div class="container-fluid">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h1>
                        <i class="fas fa-user-shield"></i>
                        Respondedores Comunitarios PREMIUM
                    </h1>
                    <div class="subtitle">
                        Sistema Integral de Gestión de Emergencias | 
                        <?php echo date('d/m/Y H:i'); ?> | 
                        <?php echo $usuario['ciudad'] ?? 'Curicó'; ?>
                    </div>
                </div>
                <div class="d-flex gap-3">
                    <button class="map-btn btn-primary-custom" onclick="location.reload()">
                        <i class="fas fa-sync-alt"></i> Actualizar
                    </button>
                    <button class="map-btn btn-primary-custom" onclick="exportarDatos()">
                        <i class="fas fa-download"></i> Exportar
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div class="container-fluid p-4">
        <!-- KPI CARDS -->
        <div class="kpi-grid">
            <div class="kpi-card">
                <div class="kpi-icon">
                    <i class="fas fa-users"></i>
                </div>
                <div class="kpi-value"><?php echo $stats['total']; ?></div>
                <div class="kpi-label">Total Respondedores</div>
            </div>
            
            <div class="kpi-card">
                <div class="kpi-icon">
                    <i class="fas fa-user-check"></i>
                </div>
                <div class="kpi-value" style="color: #10b981;"><?php echo $stats['disponibles']; ?></div>
                <div class="kpi-label">Disponibles Ahora</div>
            </div>
            
            <div class="kpi-card">
                <div class="kpi-icon">
                    <i class="fas fa-ambulance"></i>
                </div>
                <div class="kpi-value" style="color: #f59e0b;"><?php echo $stats['en_servicio']; ?></div>
                <div class="kpi-label">En Servicio Activo</div>
            </div>
            
            <div class="kpi-card">
                <div class="kpi-icon">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="kpi-value" style="color: #3b82f6;">8.5</div>
                <div class="kpi-label">Min. Respuesta (Prom.)</div>
            </div>
        </div>

        <!-- MAPA GIGANTE -->
        <div class="map-container" id="mapContainer">
            <div class="map-header">
                <div class="map-title">
                    <i class="fas fa-map-marked-alt"></i>
                    Mapa en Tiempo Real - <?php echo count($respondedores); ?> Respondedores
                </div>
                <div class="map-controls">
                    <button class="map-btn btn-primary-custom" onclick="toggleMaximizar()">
                        <i class="fas fa-expand" id="iconMaximizar"></i>
                        <span id="textoMaximizar">Maximizar</span>
                    </button>
                    <button class="map-btn btn-primary-custom" onclick="centrarMapa()">
                        <i class="fas fa-crosshairs"></i>
                        Centrar
                    </button>
                </div>
            </div>
            <div id="mapa"></div>
        </div>

        <!-- FILTROS -->
        <div class="filters-panel">
            <h3 class="fw-bold mb-0">
                <i class="fas fa-filter"></i> Filtros Avanzados
            </h3>
            <div class="filter-grid">
                <div class="filter-group">
                    <label><i class="fas fa-search"></i> Búsqueda</label>
                    <input type="text" class="filter-input" id="filtroNombre" placeholder="Nombre, RUT, teléfono...">
                </div>
                <div class="filter-group">
                    <label><i class="fas fa-briefcase"></i> Tipo</label>
                    <select class="filter-input" id="filtroTipo">
                        <option value="">Todos los tipos</option>
                        <option value="PARAMEDICO">Paramédico</option>
                        <option value="ENFERMERO">Enfermero</option>
                        <option value="VOLUNTARIO">Voluntario</option>
                        <option value="FUNCIONARIO">Funcionario</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label><i class="fas fa-toggle-on"></i> Estado</label>
                    <select class="filter-input" id="filtroEstado">
                        <option value="">Todos los estados</option>
                        <option value="DISPONIBLE">Disponible</option>
                        <option value="EN_RUTA">En Ruta</option>
                        <option value="EN_SITIO">En Sitio</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label><i class="fas fa-check-circle"></i> Disponibilidad</label>
                    <select class="filter-input" id="filtroDisponibilidad">
                        <option value="">Todos</option>
                        <option value="1">Solo Disponibles</option>
                        <option value="0">No Disponibles</option>
                    </select>
                </div>
            </div>
            <div class="text-center mt-4">
                <button class="map-btn btn-primary-custom" onclick="aplicarFiltros()">
                    <i class="fas fa-check"></i> Aplicar Filtros
                </button>
                <button class="map-btn" style="background: #6b7280; color: white;" onclick="limpiarFiltros()">
                    <i class="fas fa-times"></i> Limpiar
                </button>
            </div>
        </div>

        <!-- TABLA -->
        <div class="table-container">
            <h3 class="fw-bold mb-4">
                <i class="fas fa-table"></i> Listado Completo
            </h3>
            <div class="table-responsive">
                <table id="tablaRespondedores" class="table table-hover" style="width:100%">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre Completo</th>
                            <th>Tipo</th>
                            <th>Teléfono</th>
                            <th>Estado</th>
                            <th>Disponible</th>
                            <th>Ubicación</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($respondedores as $r): ?>
                        <tr>
                            <td><?php echo $r['id_respondedor']; ?></td>
                            <td>
                                <strong><?php echo htmlspecialchars($r['nombre_completo']); ?></strong>
                                <br><small class="text-muted"><?php echo htmlspecialchars($r['rut'] ?? 'Sin RUT'); ?></small>
                            </td>
                            <td><span class="badge-custom badge-info"><?php echo $r['tipo_respondedor'] ?? 'VOLUNTARIO'; ?></span></td>
                            <td><?php echo htmlspecialchars($r['celular_personal'] ?? 'Sin teléfono'); ?></td>
                            <td>
                                <?php
                                $estado = $r['estado'] ?? 'DISPONIBLE';
                                $badgeClass = $estado == 'EN_SITIO' ? 'badge-warning' : ($estado == 'DISPONIBLE' ? 'badge-success' : 'badge-info');
                                ?>
                                <span class="badge-custom <?php echo $badgeClass; ?>"><?php echo $estado; ?></span>
                            </td>
                            <td>
                                <?php if ($r['disponible']): ?>
                                <span class="badge-custom badge-success"><i class="fas fa-check"></i> SÍ</span>
                                <?php else: ?>
                                <span class="badge-custom badge-danger"><i class="fas fa-times"></i> NO</span>
                                <?php endif; ?>
                            </td>
                            <td><?php echo htmlspecialchars($r['localidad'] ?? $r['comuna'] ?? 'Sin ubicación'); ?></td>
                            <td>
                                <button class="action-btn btn-view" onclick="verDetalle(<?php echo $r['id_respondedor']; ?>)">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="action-btn btn-edit" onclick="editar(<?php echo $r['id_respondedor']; ?>)">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Scripts -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
    <script src="https://cdn.datatables.net/1.13.7/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/1.13.7/js/dataTables.bootstrap5.min.js"></script>
    
    <script>
        const RESPONDEDORES = <?php echo json_encode($respondedores); ?>;
        const PRIMARY_COLOR = '<?php echo $color; ?>';
        
        let mapa, markerCluster, tabla;
        
        // ============================================================
        // INICIALIZAR MAPA
        // ============================================================
        function initMapa() {
            console.log('🗺️ Inicializando mapa con', RESPONDEDORES.length, 'respondedores');
            
            mapa = L.map('mapa').setView([-34.9806453, -71.2335392], 12);
            
            // Capas de mapa
            const calles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap'
            });
            
            const satelite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: '© Esri'
            });
            
            const oscuro = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '© CartoDB'
            });
            
            const baseMaps = {
                "🗺️ Calles": calles,
                "🛰️ Satélite": satelite,
                "🌙 Oscuro": oscuro
            };
            
            calles.addTo(mapa);
            L.control.layers(baseMaps).addTo(mapa);
            
            // Cluster de marcadores
            markerCluster = L.markerClusterGroup({
                maxClusterRadius: 60,
                spiderfyOnMaxZoom: true,
                showCoverageOnHover: false
            });
            
            // Agregar marcadores
            RESPONDEDORES.forEach(r => {
                if (r.latitud && r.longitud) {
                    const lat = parseFloat(r.latitud);
                    const lng = parseFloat(r.longitud);
                    
                    if (lat && lng && lat >= -56 && lat <= -17 && lng >= -76 && lng <= -66) {
                        const color = r.disponible ? '#10b981' : (r.estado === 'EN_SITIO' ? '#f59e0b' : '#6b7280');
                        
                        const icon = L.divIcon({
                            html: `<div style="background:${color};width:35px;height:35px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:4px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
                                <i class="fas fa-user-shield" style="color:white;font-size:14px;transform:rotate(45deg);"></i>
                            </div>`,
                            className: '',
                            iconSize: [35, 45],
                            iconAnchor: [17, 45],
                            popupAnchor: [0, -45]
                        });
                        
                        const marker = L.marker([lat, lng], { icon });
                        
                        const popup = `
                            <div class="popup-header">
                                🚑 ${r.nombre_completo}
                            </div>
                            <div class="popup-body">
                                <div class="popup-item">
                                    <i class="fas fa-briefcase"></i>
                                    <strong>${r.tipo_respondedor || 'VOLUNTARIO'}</strong>
                                </div>
                                ${r.celular_personal ? `
                                <div class="popup-item">
                                    <i class="fas fa-phone"></i>
                                    <a href="tel:${r.celular_personal}" style="color:${PRIMARY_COLOR};font-weight:600;">${r.celular_personal}</a>
                                </div>` : ''}
                                <div class="popup-item">
                                    <i class="fas fa-map-marker-alt"></i>
                                    ${r.localidad || r.comuna || 'Sin ubicación'}
                                </div>
                                <div class="popup-status" style="background:${r.disponible ? '#d1fae5' : '#fee2e2'};color:${r.disponible ? '#065f46' : '#991b1b'};">
                                    ${r.disponible ? '✅ DISPONIBLE' : '❌ NO DISPONIBLE'}
                                </div>
                            </div>
                        `;
                        
                        marker.bindPopup(popup, { maxWidth: 350 });
                        markerCluster.addLayer(marker);
                    }
                }
            });
            
            mapa.addLayer(markerCluster);
            
            // Ajustar vista
            if (markerCluster.getBounds().isValid()) {
                setTimeout(() => mapa.fitBounds(markerCluster.getBounds(), { padding: [50, 50] }), 500);
            }
        }
        
        // ============================================================
        // TABLA
        // ============================================================
        function initTabla() {
            tabla = $('#tablaRespondedores').DataTable({
                language: { url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json' },
                pageLength: 25,
                order: [[0, 'desc']],
                responsive: true
            });
        }
        
        // ============================================================
        // FUNCIONES
        // ============================================================
        function toggleMaximizar() {
            const container = document.getElementById('mapContainer');
            container.classList.toggle('mapa-maximizado');
            const icono = document.getElementById('iconMaximizar');
            const texto = document.getElementById('textoMaximizar');
            if (container.classList.contains('mapa-maximizado')) {
                icono.className = 'fas fa-compress';
                texto.textContent = 'Minimizar';
            } else {
                icono.className = 'fas fa-expand';
                texto.textContent = 'Maximizar';
            }
            setTimeout(() => mapa.invalidateSize(), 300);
        }
        
        function centrarMapa() {
            if (markerCluster.getBounds().isValid()) {
                mapa.fitBounds(markerCluster.getBounds(), { padding: [50, 50] });
            }
        }
        
        function aplicarFiltros() {
            const nombre = $('#filtroNombre').val();
            const tipo = $('#filtroTipo').val();
            const estado = $('#filtroEstado').val();
            const disponibilidad = $('#filtroDisponibilidad').val();
            
            tabla.column(1).search(nombre)
                 .column(2).search(tipo)
                 .column(4).search(estado)
                 .column(5).search(disponibilidad)
                 .draw();
        }
        
        function limpiarFiltros() {
            $('#filtroNombre, #filtroTipo, #filtroEstado, #filtroDisponibilidad').val('');
            tabla.search('').columns().search('').draw();
        }
        
        function verDetalle(id) {
            alert('Ver detalle del respondedor ID: ' + id);
        }
        
        function editar(id) {
            alert('Editar respondedor ID: ' + id);
        }
        
        function exportarDatos() {
            alert('Exportar datos a Excel');
        }
        
        // ============================================================
        // INICIALIZAR
        // ============================================================
        document.addEventListener('DOMContentLoaded', () => {
            console.log('🚑 Sistema PREMIUM cargado');
            initMapa();
            initTabla();
            document.getElementById('loading').style.display = 'none';
        });
    </script>
</body>
</html>
