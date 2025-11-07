-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: anyssamed
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `accesos_paciente_log`
--

DROP TABLE IF EXISTS `accesos_paciente_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `accesos_paciente_log` (
  `id_acceso` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente` int(10) unsigned NOT NULL,
  `id_usuario` int(10) unsigned NOT NULL,
  `tipo_acceso` enum('lectura','modificacion','exportacion','impresion') NOT NULL,
  `seccion_accedida` varchar(100) DEFAULT NULL COMMENT 'historial, recetas, examenes, etc',
  `id_centro` int(10) unsigned NOT NULL,
  `motivo_acceso` text DEFAULT NULL COMMENT 'Justificación del acceso',
  `ip_address` varchar(45) NOT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `detalles` text DEFAULT NULL,
  `dispositivo` varchar(100) DEFAULT NULL,
  `fecha_acceso` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_acceso`),
  KEY `idx_acceso_paciente` (`id_paciente`,`fecha_acceso`),
  KEY `idx_acceso_usuario` (`id_usuario`,`fecha_acceso`),
  KEY `idx_acceso_centro` (`id_centro`),
  CONSTRAINT `accesos_paciente_log_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE,
  CONSTRAINT `accesos_paciente_log_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `accesos_paciente_log_ibfk_3` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Log de accesos HIPAA-compliant';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accesos_paciente_log`
--

LOCK TABLES `accesos_paciente_log` WRITE;
/*!40000 ALTER TABLE `accesos_paciente_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `accesos_paciente_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `administrativos`
--

DROP TABLE IF EXISTS `administrativos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `administrativos` (
  `id_administrativo` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_usuario` int(10) unsigned NOT NULL,
  `id_centro` int(10) unsigned NOT NULL,
  `id_sucursal` int(10) unsigned DEFAULT NULL,
  `id_departamento` int(10) unsigned DEFAULT NULL,
  `cargo` varchar(100) NOT NULL,
  `extension_telefonica` varchar(10) DEFAULT NULL,
  `nivel_acceso` enum('basico','intermedio','avanzado','administrador') NOT NULL DEFAULT 'basico',
  `estado` enum('activo','inactivo','suspendido','vacaciones') NOT NULL DEFAULT 'activo',
  `jornada` enum('completa','media','parcial') NOT NULL DEFAULT 'completa',
  `supervisor_id` int(10) unsigned DEFAULT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_termino` date DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_administrativo`),
  UNIQUE KEY `idx_admin_usuario` (`id_usuario`),
  KEY `fk_admin_centro_idx` (`id_centro`),
  KEY `fk_admin_sucursal_idx` (`id_sucursal`),
  KEY `fk_admin_departamento_idx` (`id_departamento`),
  KEY `fk_admin_supervisor_idx` (`supervisor_id`),
  KEY `idx_admin_estado` (`estado`),
  KEY `idx_admin_cargo` (`cargo`),
  CONSTRAINT `fk_admin_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_admin_departamento` FOREIGN KEY (`id_departamento`) REFERENCES `departamentos` (`id_departamento`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_admin_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursales` (`id_sucursal`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_admin_supervisor` FOREIGN KEY (`supervisor_id`) REFERENCES `administrativos` (`id_administrativo`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_admin_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Personal administrativo';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `administrativos`
--

LOCK TABLES `administrativos` WRITE;
/*!40000 ALTER TABLE `administrativos` DISABLE KEYS */;
INSERT INTO `administrativos` VALUES (1,3,1,NULL,NULL,'Administrador General',NULL,'basico','activo','completa',NULL,'2023-01-10',NULL,'2025-10-27 02:20:37','2025-10-27 02:20:37');
/*!40000 ALTER TABLE `administrativos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alergias`
--

DROP TABLE IF EXISTS `alergias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `alergias` (
  `id_alergia` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente` int(10) unsigned NOT NULL,
  `tipo_alergia` enum('medicamento','alimento','ambiental','contacto','otro') NOT NULL,
  `alergeno` varchar(100) NOT NULL,
  `severidad` enum('leve','moderada','severa','fatal') NOT NULL,
  `reaccion` text NOT NULL,
  `fecha_diagnostico` date DEFAULT NULL,
  `fecha_ultima_reaccion` date DEFAULT NULL,
  `comentarios` text DEFAULT NULL,
  `verificado` tinyint(1) NOT NULL DEFAULT 0,
  `verificado_por` int(10) unsigned DEFAULT NULL,
  `fecha_verificacion` datetime DEFAULT NULL,
  `estado` enum('activa','inactiva','sospecha') NOT NULL DEFAULT 'activa',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_alergia`),
  KEY `fk_alergia_paciente_idx` (`id_paciente`),
  KEY `fk_alergia_verificador_idx` (`verificado_por`),
  KEY `fk_alergia_creador_idx` (`creado_por`),
  KEY `idx_alergia_tipo` (`tipo_alergia`),
  KEY `idx_alergia_severidad` (`severidad`),
  KEY `idx_alergia_estado` (`estado`),
  CONSTRAINT `fk_alergia_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_alergia_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_alergia_verificador` FOREIGN KEY (`verificado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro de alergias de pacientes';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alergias`
--

LOCK TABLES `alergias` WRITE;
/*!40000 ALTER TABLE `alergias` DISABLE KEYS */;
/*!40000 ALTER TABLE `alergias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alergias_pacientes`
--

DROP TABLE IF EXISTS `alergias_pacientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `alergias_pacientes` (
  `id_alergia` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente` int(10) unsigned NOT NULL,
  `tipo_alergia` enum('medicamento','alimento','ambiental','latex','otros') NOT NULL,
  `nombre_alergeno` varchar(200) NOT NULL,
  `severidad` enum('leve','moderada','severa','potencialmente_mortal') NOT NULL,
  `reaccion` text DEFAULT NULL COMMENT 'Descripción de la reacción',
  `fecha_diagnostico` date DEFAULT NULL,
  `diagnosticado_por` int(10) unsigned DEFAULT NULL COMMENT 'ID del médico',
  `estado` enum('activa','resuelta','en_investigacion') NOT NULL DEFAULT 'activa',
  `requiere_alerta` tinyint(1) NOT NULL DEFAULT 1,
  `notas` text DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `registrado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_alergia`),
  KEY `idx_alergia_paciente` (`id_paciente`,`estado`),
  KEY `idx_alergia_severidad` (`severidad`),
  CONSTRAINT `alergias_pacientes_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Alergias de pacientes - CRÍTICO';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alergias_pacientes`
--

LOCK TABLES `alergias_pacientes` WRITE;
/*!40000 ALTER TABLE `alergias_pacientes` DISABLE KEYS */;
/*!40000 ALTER TABLE `alergias_pacientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alertas_parametros`
--

DROP TABLE IF EXISTS `alertas_parametros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `alertas_parametros` (
  `id_alerta` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente` int(10) unsigned NOT NULL,
  `id_dispositivo_iot` int(10) unsigned DEFAULT NULL,
  `id_configuracion_monitorizacion` int(10) unsigned NOT NULL,
  `id_lectura` bigint(20) unsigned DEFAULT NULL,
  `tipo_parametro` varchar(50) NOT NULL,
  `valor_detectado` decimal(10,2) NOT NULL,
  `nivel_alerta` enum('informacion','advertencia','alerta','critica') NOT NULL,
  `fecha_deteccion` datetime NOT NULL,
  `mensaje` text NOT NULL,
  `estado` enum('nueva','en_revision','atendida','falsa_alarma','cerrada') NOT NULL DEFAULT 'nueva',
  `fecha_atencion` datetime DEFAULT NULL,
  `atendida_por` int(10) unsigned DEFAULT NULL,
  `comentarios` text DEFAULT NULL,
  `notificada_paciente` tinyint(1) NOT NULL DEFAULT 0,
  `notificada_medico` tinyint(1) NOT NULL DEFAULT 0,
  `id_medico` int(10) unsigned DEFAULT NULL,
  `accion_requerida` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_alerta`),
  KEY `fk_alerta_paciente_idx` (`id_paciente`),
  KEY `fk_alerta_dispositivo_idx` (`id_dispositivo_iot`),
  KEY `fk_alerta_config_idx` (`id_configuracion_monitorizacion`),
  KEY `fk_alerta_lectura_idx` (`id_lectura`),
  KEY `fk_alerta_atendedor_idx` (`atendida_por`),
  KEY `fk_alerta_medico_idx` (`id_medico`),
  KEY `idx_alerta_tipo` (`tipo_parametro`),
  KEY `idx_alerta_nivel` (`nivel_alerta`),
  KEY `idx_alerta_fecha` (`fecha_deteccion`),
  KEY `idx_alerta_estado` (`estado`),
  CONSTRAINT `fk_alerta_atendedor` FOREIGN KEY (`atendida_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_alerta_config` FOREIGN KEY (`id_configuracion_monitorizacion`) REFERENCES `configuraciones_monitorizacion` (`id_configuracion`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_alerta_dispositivo` FOREIGN KEY (`id_dispositivo_iot`) REFERENCES `dispositivos_iot` (`id_dispositivo_iot`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_alerta_lectura` FOREIGN KEY (`id_lectura`) REFERENCES `lecturas_dispositivos` (`id_lectura`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_alerta_medico` FOREIGN KEY (`id_medico`) REFERENCES `medicos` (`id_medico`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_alerta_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Configuración de alertas para parámetros monitorizados';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alertas_parametros`
--

LOCK TABLES `alertas_parametros` WRITE;
/*!40000 ALTER TABLE `alertas_parametros` DISABLE KEYS */;
INSERT INTO `alertas_parametros` VALUES (1,2,2,5,17,'glucosa_postprandial',152.00,'advertencia','2024-10-20 14:30:00','Glucosa postprandial ligeramente elevada (152 mg/dL). Se recomienda revisar dieta y medicación.','atendida',NULL,NULL,NULL,1,1,1,NULL,'2025-11-04 00:39:38','2025-11-04 00:39:38'),(2,14,7,11,24,'peso',90.00,'alerta','2024-10-01 06:00:00','Peso fuera del rango objetivo (90 kg). Se recomienda ajustar plan nutricional.','atendida',NULL,NULL,NULL,1,1,1,NULL,'2025-11-04 00:39:38','2025-11-04 00:39:38');
/*!40000 ALTER TABLE `alertas_parametros` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `antecedentes`
--

DROP TABLE IF EXISTS `antecedentes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `antecedentes` (
  `id_antecedente` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente` int(10) unsigned NOT NULL,
  `tipo` enum('patologico','quirurgico','familiar','alergico','farmacologico','social','ginecoobstetrico','vacunas') NOT NULL,
  `descripcion` text NOT NULL,
  `fecha_diagnostico` date DEFAULT NULL,
  `estado` enum('activo','inactivo','resuelto') NOT NULL DEFAULT 'activo',
  `nivel_importancia` enum('baja','media','alta','critica') NOT NULL DEFAULT 'media',
  `observaciones` text DEFAULT NULL,
  `validado` tinyint(1) NOT NULL DEFAULT 0,
  `validado_por` int(10) unsigned DEFAULT NULL,
  `fecha_validacion` datetime DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_antecedente`),
  KEY `fk_antecedente_paciente_idx` (`id_paciente`),
  KEY `fk_antecedente_validador_idx` (`validado_por`),
  KEY `fk_antecedente_creador_idx` (`creado_por`),
  KEY `idx_antecedente_tipo` (`tipo`),
  KEY `idx_antecedente_estado` (`estado`),
  KEY `idx_antecedente_importancia` (`nivel_importancia`),
  CONSTRAINT `fk_antecedente_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_antecedente_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_antecedente_validador` FOREIGN KEY (`validado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Antecedentes médicos de pacientes';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `antecedentes`
--

LOCK TABLES `antecedentes` WRITE;
/*!40000 ALTER TABLE `antecedentes` DISABLE KEYS */;
/*!40000 ALTER TABLE `antecedentes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `apis_configuracion`
--

DROP TABLE IF EXISTS `apis_configuracion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `apis_configuracion` (
  `id_api` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `url_base` varchar(255) NOT NULL,
  `version` varchar(20) NOT NULL,
  `documentacion_url` varchar(255) DEFAULT NULL,
  `estado` enum('desarrollo','produccion','mantenimiento','deprecada','inactiva') NOT NULL DEFAULT 'desarrollo',
  `tipo_autenticacion` varchar(50) NOT NULL,
  `requiere_oauth` tinyint(1) NOT NULL DEFAULT 0,
  `configuracion_oauth_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`configuracion_oauth_json`)),
  `limite_peticiones` int(10) unsigned DEFAULT NULL,
  `periodo_limite` varchar(20) DEFAULT NULL,
  `cors_permitido` tinyint(1) NOT NULL DEFAULT 0,
  `dominios_permitidos` text DEFAULT NULL,
  `metodos_permitidos` varchar(100) DEFAULT 'GET,POST,PUT,DELETE',
  `cabeceras_permitidas` varchar(255) DEFAULT NULL,
  `tiempo_cache_segundos` int(10) unsigned DEFAULT NULL,
  `requiere_https` tinyint(1) NOT NULL DEFAULT 1,
  `nivel_log` varchar(20) NOT NULL DEFAULT 'info',
  `notas_internas` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_api`),
  KEY `fk_api_centro_idx` (`id_centro`),
  KEY `fk_api_creador_idx` (`creado_por`),
  KEY `idx_api_estado` (`estado`),
  KEY `idx_api_version` (`version`),
  KEY `idx_api_auth` (`tipo_autenticacion`),
  KEY `idx_api_oauth` (`requiere_oauth`),
  KEY `idx_api_cors` (`cors_permitido`),
  KEY `idx_api_https` (`requiere_https`),
  CONSTRAINT `fk_api_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_api_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Configuración de APIs';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `apis_configuracion`
--

LOCK TABLES `apis_configuracion` WRITE;
/*!40000 ALTER TABLE `apis_configuracion` DISABLE KEYS */;
/*!40000 ALTER TABLE `apis_configuracion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `app_configuraciones`
--

DROP TABLE IF EXISTS `app_configuraciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `app_configuraciones` (
  `id_configuracion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_app_usuario` int(10) unsigned DEFAULT NULL,
  `id_centro` int(10) unsigned DEFAULT NULL,
  `tipo` enum('general','notificaciones','privacidad','apariencia','idioma') NOT NULL,
  `clave` varchar(50) NOT NULL,
  `valor` varchar(255) NOT NULL,
  `valor_predeterminado` varchar(255) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `nivel` enum('sistema','centro','usuario') NOT NULL DEFAULT 'usuario',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_configuracion`),
  KEY `fk_appconfig_appusuario_idx` (`id_app_usuario`),
  KEY `fk_appconfig_centro_idx` (`id_centro`),
  KEY `idx_appconfig_tipo` (`tipo`),
  KEY `idx_appconfig_nivel` (`nivel`),
  KEY `idx_appconfig_clave` (`clave`),
  CONSTRAINT `fk_appconfig_appusuario` FOREIGN KEY (`id_app_usuario`) REFERENCES `app_usuarios` (`id_app_usuario`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_appconfig_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Configuraciones personalizadas de la app';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `app_configuraciones`
--

LOCK TABLES `app_configuraciones` WRITE;
/*!40000 ALTER TABLE `app_configuraciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `app_configuraciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `app_datos_biometricos`
--

DROP TABLE IF EXISTS `app_datos_biometricos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `app_datos_biometricos` (
  `id_dato` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_app_usuario` int(10) unsigned NOT NULL,
  `id_paciente` int(10) unsigned NOT NULL,
  `tipo_dato` varchar(50) NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `unidad` varchar(20) NOT NULL,
  `fecha_medicion` datetime NOT NULL,
  `fuente` enum('manual','dispositivo','integracion') NOT NULL DEFAULT 'manual',
  `dispositivo` varchar(100) DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `id_dispositivo_iot` int(10) unsigned DEFAULT NULL,
  `validado` tinyint(1) NOT NULL DEFAULT 0,
  `validado_por` int(10) unsigned DEFAULT NULL,
  `fecha_validacion` datetime DEFAULT NULL,
  `compartido_con_medico` tinyint(1) NOT NULL DEFAULT 0,
  `id_medico` int(10) unsigned DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_dato`),
  KEY `fk_biometrico_appusuario_idx` (`id_app_usuario`),
  KEY `fk_biometrico_paciente_idx` (`id_paciente`),
  KEY `fk_biometrico_dispositivo_idx` (`id_dispositivo_iot`),
  KEY `fk_biometrico_validador_idx` (`validado_por`),
  KEY `fk_biometrico_medico_idx` (`id_medico`),
  KEY `idx_biometrico_tipo` (`tipo_dato`),
  KEY `idx_biometrico_fecha` (`fecha_medicion`),
  KEY `idx_biometrico_fuente` (`fuente`),
  KEY `idx_biometrico_validado` (`validado`),
  KEY `idx_biometrico_compartido` (`compartido_con_medico`),
  CONSTRAINT `fk_biometrico_appusuario` FOREIGN KEY (`id_app_usuario`) REFERENCES `app_usuarios` (`id_app_usuario`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_biometrico_medico` FOREIGN KEY (`id_medico`) REFERENCES `medicos` (`id_medico`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_biometrico_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_biometrico_validador` FOREIGN KEY (`validado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Datos biométricos registrados en la app';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `app_datos_biometricos`
--

LOCK TABLES `app_datos_biometricos` WRITE;
/*!40000 ALTER TABLE `app_datos_biometricos` DISABLE KEYS */;
/*!40000 ALTER TABLE `app_datos_biometricos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `app_notificaciones`
--

DROP TABLE IF EXISTS `app_notificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `app_notificaciones` (
  `id_notificacion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_app_usuario` int(10) unsigned NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `titulo` varchar(100) NOT NULL,
  `mensaje` text NOT NULL,
  `datos_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`datos_json`)),
  `fecha_envio` datetime NOT NULL,
  `fecha_lectura` datetime DEFAULT NULL,
  `leida` tinyint(1) NOT NULL DEFAULT 0,
  `accion` varchar(100) DEFAULT NULL,
  `url_accion` varchar(255) DEFAULT NULL,
  `id_referencia` varchar(50) DEFAULT NULL,
  `tipo_referencia` varchar(50) DEFAULT NULL,
  `prioridad` enum('baja','normal','alta','urgente') NOT NULL DEFAULT 'normal',
  `enviada` tinyint(1) NOT NULL DEFAULT 0,
  `envio_exitoso` tinyint(1) DEFAULT NULL,
  `error_envio` varchar(255) DEFAULT NULL,
  `fecha_expiracion` datetime DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_notificacion`),
  KEY `fk_notificacion_appusuario_idx` (`id_app_usuario`),
  KEY `idx_notificacion_tipo` (`tipo`),
  KEY `idx_notificacion_fecha` (`fecha_envio`),
  KEY `idx_notificacion_leida` (`leida`),
  KEY `idx_notificacion_prioridad` (`prioridad`),
  KEY `idx_notificacion_enviada` (`enviada`),
  KEY `idx_notificacion_expiracion` (`fecha_expiracion`),
  KEY `idx_notificacion_referencia` (`tipo_referencia`,`id_referencia`),
  CONSTRAINT `fk_notificacion_appusuario` FOREIGN KEY (`id_app_usuario`) REFERENCES `app_usuarios` (`id_app_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Notificaciones específicas de la app';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `app_notificaciones`
--

LOCK TABLES `app_notificaciones` WRITE;
/*!40000 ALTER TABLE `app_notificaciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `app_notificaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `app_recordatorios_medicacion`
--

DROP TABLE IF EXISTS `app_recordatorios_medicacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `app_recordatorios_medicacion` (
  `id_recordatorio` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_app_usuario` int(10) unsigned NOT NULL,
  `id_medicamento` int(10) unsigned DEFAULT NULL,
  `nombre_medicamento` varchar(100) NOT NULL,
  `dosis` varchar(50) NOT NULL,
  `unidad` varchar(20) NOT NULL,
  `via_administracion` varchar(50) NOT NULL,
  `frecuencia` varchar(50) NOT NULL,
  `hora_programada` time NOT NULL,
  `dias_semana` varchar(20) DEFAULT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `duracion_dias` int(10) unsigned DEFAULT NULL,
  `instrucciones` text DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_recordatorio`),
  KEY `fk_recordmed_appusuario_idx` (`id_app_usuario`),
  KEY `fk_recordmed_medicamento_idx` (`id_medicamento`),
  KEY `fk_recordmed_creador_idx` (`creado_por`),
  KEY `idx_recordmed_activo` (`activo`),
  KEY `idx_recordmed_fechas` (`fecha_inicio`,`fecha_fin`),
  CONSTRAINT `fk_recordmed_appusuario` FOREIGN KEY (`id_app_usuario`) REFERENCES `app_usuarios` (`id_app_usuario`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_recordmed_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Recordatorios de medicación en la app';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `app_recordatorios_medicacion`
--

LOCK TABLES `app_recordatorios_medicacion` WRITE;
/*!40000 ALTER TABLE `app_recordatorios_medicacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `app_recordatorios_medicacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `app_seguimiento`
--

DROP TABLE IF EXISTS `app_seguimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `app_seguimiento` (
  `id_seguimiento` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_app_usuario` int(10) unsigned NOT NULL,
  `id_paciente` int(10) unsigned NOT NULL,
  `tipo_seguimiento` varchar(50) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `objetivo` text DEFAULT NULL,
  `frecuencia_medicion` varchar(50) DEFAULT NULL,
  `unidad_medida` varchar(20) DEFAULT NULL,
  `valor_objetivo` decimal(10,2) DEFAULT NULL,
  `valor_inicial` decimal(10,2) DEFAULT NULL,
  `valor_actual` decimal(10,2) DEFAULT NULL,
  `progreso_porcentaje` decimal(5,2) DEFAULT NULL,
  `id_medico_supervisor` int(10) unsigned DEFAULT NULL,
  `notas_medico` text DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `completado` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_completado` date DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_seguimiento`),
  KEY `fk_seguimiento_appusuario_idx` (`id_app_usuario`),
  KEY `fk_seguimiento_paciente_idx` (`id_paciente`),
  KEY `fk_seguimiento_medico_idx` (`id_medico_supervisor`),
  KEY `fk_seguimiento_creador_idx` (`creado_por`),
  KEY `idx_seguimiento_tipo` (`tipo_seguimiento`),
  KEY `idx_seguimiento_fechas` (`fecha_inicio`,`fecha_fin`),
  KEY `idx_seguimiento_activo` (`activo`),
  KEY `idx_seguimiento_completado` (`completado`),
  CONSTRAINT `fk_seguimiento_appusuario` FOREIGN KEY (`id_app_usuario`) REFERENCES `app_usuarios` (`id_app_usuario`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_seguimiento_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_seguimiento_medico` FOREIGN KEY (`id_medico_supervisor`) REFERENCES `medicos` (`id_medico`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_seguimiento_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Seguimiento de actividades en la app';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `app_seguimiento`
--

LOCK TABLES `app_seguimiento` WRITE;
/*!40000 ALTER TABLE `app_seguimiento` DISABLE KEYS */;
/*!40000 ALTER TABLE `app_seguimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `app_usuarios`
--

DROP TABLE IF EXISTS `app_usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `app_usuarios` (
  `id_app_usuario` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_usuario` int(10) unsigned NOT NULL,
  `id_paciente` int(10) unsigned DEFAULT NULL,
  `token_dispositivo` varchar(255) DEFAULT NULL,
  `token_push` varchar(255) DEFAULT NULL,
  `ultimo_acceso` datetime DEFAULT NULL,
  `version_app` varchar(20) DEFAULT NULL,
  `plataforma` enum('android','ios','web') NOT NULL,
  `modelo_dispositivo` varchar(100) DEFAULT NULL,
  `sistema_operativo` varchar(50) DEFAULT NULL,
  `version_os` varchar(20) DEFAULT NULL,
  `idioma` varchar(10) NOT NULL DEFAULT 'es',
  `zona_horaria` varchar(50) DEFAULT NULL,
  `configuracion_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`configuracion_json`)),
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `bloqueado` tinyint(1) NOT NULL DEFAULT 0,
  `motivo_bloqueo` varchar(255) DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_app_usuario`),
  KEY `fk_appusu_usuario_idx` (`id_usuario`),
  KEY `fk_appusu_paciente_idx` (`id_paciente`),
  KEY `idx_appusu_plataforma` (`plataforma`),
  KEY `idx_appusu_activo` (`activo`),
  KEY `idx_appusu_bloqueado` (`bloqueado`),
  CONSTRAINT `fk_appusu_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_appusu_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Usuarios de la aplicación móvil';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `app_usuarios`
--

LOCK TABLES `app_usuarios` WRITE;
/*!40000 ALTER TABLE `app_usuarios` DISABLE KEYS */;
/*!40000 ALTER TABLE `app_usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auditoria_cambios`
--

DROP TABLE IF EXISTS `auditoria_cambios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auditoria_cambios` (
  `id_auditoria` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id_usuario` int(10) unsigned NOT NULL,
  `accion` varchar(50) NOT NULL COMMENT 'CREAR, ACTUALIZAR, ELIMINAR, CONSULTA, etc.',
  `tabla_afectada` varchar(100) NOT NULL,
  `id_registro` int(10) unsigned NOT NULL COMMENT 'ID del registro afectado',
  `detalles` text DEFAULT NULL COMMENT 'Descripción detallada del cambio',
  `valores_anteriores` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Valores antes del cambio' CHECK (json_valid(`valores_anteriores`)),
  `valores_nuevos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Valores después del cambio' CHECK (json_valid(`valores_nuevos`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `fecha_hora` timestamp NOT NULL DEFAULT current_timestamp(),
  `nivel_criticidad` enum('bajo','medio','alto','critico') NOT NULL DEFAULT 'medio',
  PRIMARY KEY (`id_auditoria`),
  KEY `idx_auditoria_usuario` (`id_usuario`),
  KEY `idx_auditoria_tabla` (`tabla_afectada`),
  KEY `idx_auditoria_fecha` (`fecha_hora`),
  KEY `idx_auditoria_accion` (`accion`),
  KEY `idx_auditoria_criticidad` (`nivel_criticidad`),
  CONSTRAINT `fk_auditoria_cambios_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro completo de auditoría para control de super admin';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auditoria_cambios`
--

LOCK TABLES `auditoria_cambios` WRITE;
/*!40000 ALTER TABLE `auditoria_cambios` DISABLE KEYS */;
/*!40000 ALTER TABLE `auditoria_cambios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auditoria_logs`
--

DROP TABLE IF EXISTS `auditoria_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auditoria_logs` (
  `id_auditoria` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `accion` varchar(50) NOT NULL COMMENT 'CREATE, UPDATE, DELETE, LOGIN, etc',
  `entidad` varchar(50) NOT NULL COMMENT 'pacientes, usuarios, citas, etc',
  `id_entidad` int(10) unsigned DEFAULT NULL COMMENT 'ID del registro afectado',
  `id_usuario` int(10) unsigned DEFAULT NULL,
  `id_centro` int(10) unsigned DEFAULT NULL COMMENT 'Centro desde donde se realizó',
  `datos_anteriores` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Estado antes del cambio' CHECK (json_valid(`datos_anteriores`)),
  `datos_nuevos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Estado después del cambio' CHECK (json_valid(`datos_nuevos`)),
  `detalles` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Información adicional' CHECK (json_valid(`detalles`)),
  `ip_address` varchar(45) NOT NULL,
  `user_agent` text DEFAULT NULL,
  `geolocation` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'País, ciudad, lat, lng' CHECK (json_valid(`geolocation`)),
  `severidad` enum('info','warning','error','critical') DEFAULT 'info',
  `fecha_accion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_auditoria`),
  KEY `idx_audit_entidad` (`entidad`,`id_entidad`),
  KEY `idx_audit_usuario` (`id_usuario`),
  KEY `idx_audit_fecha` (`fecha_accion`),
  KEY `idx_audit_accion` (`accion`),
  KEY `idx_audit_centro` (`id_centro`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Log de auditoría completo del sistema';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auditoria_logs`
--

LOCK TABLES `auditoria_logs` WRITE;
/*!40000 ALTER TABLE `auditoria_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `auditoria_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auditorias`
--

DROP TABLE IF EXISTS `auditorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auditorias` (
  `id_auditoria` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id_transaccion_global` varchar(100) DEFAULT NULL,
  `id_centro` int(10) unsigned DEFAULT NULL,
  `creado_en_servidor` varchar(100) DEFAULT NULL,
  `entorno` varchar(50) DEFAULT 'produccion',
  `id_usuario` int(10) unsigned DEFAULT NULL,
  `fecha_hora` timestamp NOT NULL DEFAULT current_timestamp(),
  `zona_horaria` varchar(50) DEFAULT NULL,
  `accion` varchar(50) NOT NULL,
  `modulo` varchar(50) NOT NULL,
  `servicio_origen` varchar(100) DEFAULT NULL,
  `tabla` varchar(100) DEFAULT NULL,
  `entidad_id` varchar(36) DEFAULT NULL,
  `entidad_tipo` varchar(100) DEFAULT NULL,
  `datos_antiguos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL CHECK (json_valid(`datos_antiguos`)),
  `datos_nuevos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL CHECK (json_valid(`datos_nuevos`)),
  `ip_origen` varchar(45) DEFAULT NULL,
  `origen_sistema` varchar(100) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `hash_integridad` char(64) DEFAULT NULL,
  `firma_digital` text DEFAULT NULL,
  `resultado` enum('exitoso','error','advertencia') NOT NULL DEFAULT 'exitoso',
  `mensaje_error` text DEFAULT NULL,
  `codigo_referencia` varchar(100) DEFAULT NULL,
  `nivel_criticidad` enum('bajo','medio','alto','critico') NOT NULL DEFAULT 'bajo',
  `severidad_numerica` tinyint(3) unsigned DEFAULT NULL,
  `afecta_datos_sensibles` tinyint(1) NOT NULL DEFAULT 0,
  `datos_anonimizados` tinyint(1) NOT NULL DEFAULT 0,
  `requiere_revision` tinyint(1) NOT NULL DEFAULT 0,
  `sincronizado_cloud` tinyint(1) NOT NULL DEFAULT 0,
  `revisado` tinyint(1) NOT NULL DEFAULT 0,
  `revisado_por` int(10) unsigned DEFAULT NULL,
  `fecha_revision` datetime DEFAULT NULL,
  `sesion_id` varchar(100) DEFAULT NULL,
  `token_id` varchar(255) DEFAULT NULL,
  `detalle_adicional` text DEFAULT NULL,
  PRIMARY KEY (`id_auditoria`),
  KEY `fk_auditoria_centro_idx` (`id_centro`),
  KEY `fk_auditoria_usuario_idx` (`id_usuario`),
  KEY `fk_auditoria_revisor_idx` (`revisado_por`),
  KEY `idx_auditoria_fecha` (`fecha_hora`),
  KEY `idx_auditoria_accion` (`accion`),
  KEY `idx_auditoria_modulo` (`modulo`),
  KEY `idx_auditoria_tabla` (`tabla`),
  KEY `idx_auditoria_entidad` (`entidad_tipo`,`entidad_id`),
  KEY `idx_auditoria_resultado` (`resultado`),
  KEY `idx_auditoria_criticidad` (`nivel_criticidad`),
  KEY `idx_auditoria_sensibles` (`afecta_datos_sensibles`),
  KEY `idx_auditoria_revision` (`requiere_revision`,`revisado`),
  KEY `idx_auditoria_sesion` (`sesion_id`),
  CONSTRAINT `fk_auditoria_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_auditoria_revisor` FOREIGN KEY (`revisado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_auditoria_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro de auditorías';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auditorias`
--

LOCK TABLES `auditorias` WRITE;
/*!40000 ALTER TABLE `auditorias` DISABLE KEYS */;
INSERT INTO `auditorias` VALUES (1,'d01922f6-d5ce-4627-a432-f7a5f36b69eb',1,NULL,'development',1,'2025-10-30 20:38:34',NULL,'desactivar_todas','facturacion','api-admin-facturacion','facturacion',NULL,NULL,NULL,'{\"total_desactivadas\":1,\"fecha\":\"2025-10-30T20:38:34.876Z\"}','::1',NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','12139a60621eca3d5a43e816456880aab966c70d1c3c9417c691f1303b6ab78f',NULL,'exitoso',NULL,NULL,'medio',2,0,0,0,0,0,NULL,NULL,NULL,NULL,'Desactivadas 1 facturas activas (emitida/pagada/parcial/vencida)'),(2,'2de19780-21bd-4261-8bc0-788777d49b74',1,NULL,'development',1,'2025-10-30 20:38:46',NULL,'reactivar_todas','facturacion','api-admin-facturacion','facturacion',NULL,NULL,NULL,'{\"total_reactivadas\":1,\"fecha\":\"2025-10-30T20:38:46.019Z\"}','::1',NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','9af890c0c4f148720bd47bcd4cd0fe82918b8c385bbe60c2d794b47bc693cac9',NULL,'exitoso',NULL,NULL,'medio',2,0,0,0,0,0,NULL,NULL,NULL,NULL,'Reactivadas 1 facturas anuladas o en revisión'),(3,'523013a3-d026-4333-a43c-c60773d8f60e',1,NULL,'development',1,'2025-10-30 20:43:39',NULL,'marcar_no_pagada','facturacion','api-admin-facturacion','facturacion','5','factura',NULL,'{\"id_factura\":5,\"nuevo_estado\":\"emitida\",\"saldo\":-60000,\"fecha\":\"2025-10-30T20:43:39.752Z\"}','::1',NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','2e3a190ff2c0f6304a07e629508e59d415b8f0c9a469de2aabd40d770263767e',NULL,'exitoso',NULL,NULL,'alto',3,0,0,0,0,0,NULL,NULL,NULL,NULL,'Factura #5 revertida de \"pagada\" a \"emitida\" por administrador.'),(4,'251d4021-33d0-4a4e-ba98-7af67ce39925',1,NULL,'development',1,'2025-10-30 20:48:29',NULL,'marcar_no_pagada','facturacion','api-admin-facturacion','facturacion','5','factura',NULL,'{\"id_factura\":5,\"nuevo_estado\":\"emitida\",\"saldo\":-113788,\"fecha\":\"2025-10-30T20:48:29.537Z\"}','::1',NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','d3effc5aa56a4fcb7f07c1c5752002db92b0a8a7053453f1e9670119ae44e748',NULL,'exitoso',NULL,NULL,'alto',3,0,0,0,0,0,NULL,NULL,NULL,NULL,'Factura #5 revertida de \"pagada\" a \"emitida\" por administrador.'),(5,'311eafcc-e64d-4b2f-8b65-59e255f3220e',1,NULL,'development',1,'2025-10-30 20:48:39',NULL,'reactivar_todas','facturacion','api-admin-facturacion','facturacion',NULL,NULL,NULL,'{\"total_reactivadas\":0,\"fecha\":\"2025-10-30T20:48:39.018Z\"}','::1',NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','b4ece5f1e442bfa9faf20ff56d9da53cf86a2e43a93158f1d04056a08aff4f76',NULL,'exitoso',NULL,NULL,'medio',2,0,0,0,0,0,NULL,NULL,NULL,NULL,'Reactivadas 0 facturas anuladas o en revisión'),(6,'ce1367a2-320a-445b-887a-cbf7c61e8208',1,NULL,'development',1,'2025-10-30 20:49:53',NULL,'marcar_no_pagada','facturacion','api-admin-facturacion','facturacion','5','factura',NULL,'{\"id_factura\":5,\"nuevo_estado\":\"emitida\",\"saldo\":-5260,\"fecha\":\"2025-10-30T20:49:53.619Z\"}','::1',NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','3ae580a2cc08074057ed4fe3409f96de9f81750dbdfe54219de2b5c5f08b3246',NULL,'exitoso',NULL,NULL,'alto',3,0,0,0,0,0,NULL,NULL,NULL,NULL,'Factura #5 revertida de \"pagada\" a \"emitida\" por administrador.'),(7,'14009e55-e251-4edf-82e4-0b07118fc6e0',1,'api.facturacion','development',NULL,'2025-10-31 00:16:18','America/Santiago','crear','facturacion','api:nextjs','facturacion','6','factura',NULL,'{\"id_factura\":6,\"id_centro\":1,\"id_paciente\":1,\"tipo_documento\":\"boleta\",\"fecha_emision\":\"2025-10-30\",\"fecha_vencimiento\":null,\"moneda\":\"CLP\",\"subtotal\":3000000000,\"impuestos\":570000000,\"descuentos\":0,\"total\":3570000000,\"saldo\":3570000000,\"notas\":null,\"numero_factura\":null,\"id_convenio\":null,\"id_aseguradora\":null,\"cobertura_seguro\":null,\"creado_por\":null,\"detalles_count\":1,\"require_review\":1}','::1','frontend','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','f3ffd4f8f34241035d07cecd55725cd872a05319d7bb5e5c6858d83950b19c0d',NULL,'exitoso',NULL,NULL,'bajo',NULL,0,0,1,0,0,NULL,NULL,NULL,NULL,'creación de factura (auto-inferida)');
/*!40000 ALTER TABLE `auditorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bi_configuraciones`
--

DROP TABLE IF EXISTS `bi_configuraciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bi_configuraciones` (
  `id_configuracion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `id_usuario` int(10) unsigned DEFAULT NULL,
  `tipo` varchar(50) NOT NULL,
  `clave` varchar(100) NOT NULL,
  `valor` text NOT NULL,
  `descripcion` text DEFAULT NULL,
  `nivel_acceso` enum('sistema','centro','usuario') NOT NULL DEFAULT 'centro',
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_configuracion`),
  KEY `fk_biconfig_centro_idx` (`id_centro`),
  KEY `fk_biconfig_usuario_idx` (`id_usuario`),
  KEY `fk_biconfig_creador_idx` (`creado_por`),
  KEY `idx_biconfig_tipo` (`tipo`),
  KEY `idx_biconfig_clave` (`clave`),
  KEY `idx_biconfig_nivel` (`nivel_acceso`),
  KEY `idx_biconfig_activo` (`activo`),
  CONSTRAINT `fk_biconfig_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_biconfig_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_biconfig_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Parámetros de análisis y configuración BI';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bi_configuraciones`
--

LOCK TABLES `bi_configuraciones` WRITE;
/*!40000 ALTER TABLE `bi_configuraciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `bi_configuraciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bi_dashboards`
--

DROP TABLE IF EXISTS `bi_dashboards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bi_dashboards` (
  `id_dashboard` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `tipo` enum('operativo','clinico','financiero','administrativo','ejecutivo','personalizado') NOT NULL,
  `configuracion_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`configuracion_json`)),
  `url_acceso` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `publico` tinyint(1) NOT NULL DEFAULT 0,
  `requiere_autenticacion` tinyint(1) NOT NULL DEFAULT 1,
  `periodicidad_actualizacion` varchar(50) DEFAULT NULL,
  `fecha_ultima_actualizacion` datetime DEFAULT NULL,
  `categorias` varchar(255) DEFAULT NULL,
  `version` varchar(20) NOT NULL DEFAULT '1.0',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_dashboard`),
  KEY `fk_dashboard_centro_idx` (`id_centro`),
  KEY `fk_dashboard_creador_idx` (`creado_por`),
  KEY `idx_dashboard_tipo` (`tipo`),
  KEY `idx_dashboard_activo` (`activo`),
  KEY `idx_dashboard_publico` (`publico`),
  CONSTRAINT `fk_dashboard_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_dashboard_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Configuración de dashboards';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bi_dashboards`
--

LOCK TABLES `bi_dashboards` WRITE;
/*!40000 ALTER TABLE `bi_dashboards` DISABLE KEYS */;
/*!40000 ALTER TABLE `bi_dashboards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bi_indicadores`
--

DROP TABLE IF EXISTS `bi_indicadores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bi_indicadores` (
  `id_indicador` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `tipo` enum('operativo','clinico','financiero','calidad','satisfaccion','personalizado') NOT NULL,
  `unidad` varchar(20) DEFAULT NULL,
  `formula` text NOT NULL,
  `query_sql` text DEFAULT NULL,
  `periodicidad` enum('diario','semanal','mensual','trimestral','anual') NOT NULL,
  `fecha_ultimo_calculo` datetime DEFAULT NULL,
  `valor_actual` decimal(15,4) DEFAULT NULL,
  `valor_anterior` decimal(15,4) DEFAULT NULL,
  `variacion_porcentual` decimal(8,2) DEFAULT NULL,
  `meta` decimal(15,4) DEFAULT NULL,
  `umbral_alerta` decimal(15,4) DEFAULT NULL,
  `umbral_critico` decimal(15,4) DEFAULT NULL,
  `tendencia_deseada` enum('aumento','disminucion','estabilidad') DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `visible` tinyint(1) NOT NULL DEFAULT 1,
  `prioridad` int(10) unsigned DEFAULT NULL,
  `categoria` varchar(50) DEFAULT NULL,
  `etiquetas` varchar(255) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_indicador`),
  KEY `fk_indicador_centro_idx` (`id_centro`),
  KEY `fk_indicador_creador_idx` (`creado_por`),
  KEY `idx_indicador_tipo` (`tipo`),
  KEY `idx_indicador_periodicidad` (`periodicidad`),
  KEY `idx_indicador_activo` (`activo`),
  KEY `idx_indicador_visible` (`visible`),
  KEY `idx_indicador_categoria` (`categoria`),
  CONSTRAINT `fk_indicador_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_indicador_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Indicadores de desempeño';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bi_indicadores`
--

LOCK TABLES `bi_indicadores` WRITE;
/*!40000 ALTER TABLE `bi_indicadores` DISABLE KEYS */;
/*!40000 ALTER TABLE `bi_indicadores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bi_predicciones`
--

DROP TABLE IF EXISTS `bi_predicciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bi_predicciones` (
  `id_prediccion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `tipo` varchar(50) NOT NULL,
  `modelo` varchar(100) NOT NULL,
  `parametros_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`parametros_json`)),
  `fecha_entrenamiento` datetime DEFAULT NULL,
  `fecha_ultima_ejecucion` datetime DEFAULT NULL,
  `frecuencia_actualizacion` varchar(50) DEFAULT NULL,
  `precision_modelo` decimal(5,2) DEFAULT NULL,
  `confianza_modelo` decimal(5,2) DEFAULT NULL,
  `dataset_entrenamiento` varchar(255) DEFAULT NULL,
  `variables_entrada` text DEFAULT NULL,
  `variables_salida` text DEFAULT NULL,
  `notas_metodologia` text DEFAULT NULL,
  `estado` enum('en_desarrollo','produccion','historico','inactivo') NOT NULL DEFAULT 'en_desarrollo',
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_prediccion`),
  KEY `fk_prediccion_centro_idx` (`id_centro`),
  KEY `fk_prediccion_creador_idx` (`creado_por`),
  KEY `idx_prediccion_tipo` (`tipo`),
  KEY `idx_prediccion_modelo` (`modelo`),
  KEY `idx_prediccion_estado` (`estado`),
  KEY `idx_prediccion_activo` (`activo`),
  CONSTRAINT `fk_prediccion_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_prediccion_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Modelos predictivos';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bi_predicciones`
--

LOCK TABLES `bi_predicciones` WRITE;
/*!40000 ALTER TABLE `bi_predicciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `bi_predicciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bi_reportes`
--

DROP TABLE IF EXISTS `bi_reportes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bi_reportes` (
  `id_reporte` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `tipo` enum('operativo','clinico','financiero','administrativo','auditoria','personalizado') NOT NULL,
  `periodicidad` enum('bajo_demanda','diario','semanal','mensual','trimestral','anual') NOT NULL,
  `formato` enum('pdf','excel','csv','json','html','texto') NOT NULL DEFAULT 'pdf',
  `plantilla_url` varchar(255) DEFAULT NULL,
  `query_sql` text DEFAULT NULL,
  `parametros_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`parametros_json`)),
  `programacion_cron` varchar(100) DEFAULT NULL,
  `destinatarios` text DEFAULT NULL,
  `ultima_ejecucion` datetime DEFAULT NULL,
  `proxima_ejecucion` datetime DEFAULT NULL,
  `resultado_ultima_ejecucion` varchar(100) DEFAULT NULL,
  `url_ultimo_reporte` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `categoria` varchar(50) DEFAULT NULL,
  `etiquetas` varchar(255) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_reporte`),
  KEY `fk_reporte_centro_idx` (`id_centro`),
  KEY `fk_reporte_creador_idx` (`creado_por`),
  KEY `idx_reporte_tipo` (`tipo`),
  KEY `idx_reporte_periodicidad` (`periodicidad`),
  KEY `idx_reporte_formato` (`formato`),
  KEY `idx_reporte_activo` (`activo`),
  KEY `idx_reporte_categoria` (`categoria`),
  CONSTRAINT `fk_reporte_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_reporte_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Configuración de reportes';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bi_reportes`
--

LOCK TABLES `bi_reportes` WRITE;
/*!40000 ALTER TABLE `bi_reportes` DISABLE KEYS */;
/*!40000 ALTER TABLE `bi_reportes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `biblioteca_profesional`
--

DROP TABLE IF EXISTS `biblioteca_profesional`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `biblioteca_profesional` (
  `id_documento` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `autor` varchar(200) DEFAULT NULL,
  `tipo_documento` enum('articulo','libro','guia_clinica','protocolo','investigacion','presentacion','curso','otro') NOT NULL,
  `descripcion` text DEFAULT NULL,
  `url_documento` varchar(255) DEFAULT NULL,
  `fecha_publicacion` date DEFAULT NULL,
  `editorial` varchar(100) DEFAULT NULL,
  `especialidades_relacionadas` varchar(255) DEFAULT NULL,
  `patologias_relacionadas` varchar(255) DEFAULT NULL,
  `palabras_clave` varchar(255) DEFAULT NULL,
  `idioma` varchar(20) NOT NULL DEFAULT 'Español',
  `categorias` varchar(255) DEFAULT NULL,
  `privado` tinyint(1) NOT NULL DEFAULT 0,
  `acceso_restringido` tinyint(1) NOT NULL DEFAULT 0,
  `roles_permitidos` varchar(255) DEFAULT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `destacado` tinyint(1) NOT NULL DEFAULT 0,
  `veces_descargado` int(10) unsigned NOT NULL DEFAULT 0,
  `tamano_kb` int(10) unsigned DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `subido_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_documento`),
  KEY `fk_biblio_centro_idx` (`id_centro`),
  KEY `fk_biblio_subidor_idx` (`subido_por`),
  KEY `idx_biblio_tipo` (`tipo_documento`),
  KEY `idx_biblio_fecha` (`fecha_publicacion`),
  KEY `idx_biblio_acceso` (`privado`,`acceso_restringido`),
  KEY `idx_biblio_activo` (`activo`),
  KEY `idx_biblio_destacado` (`destacado`),
  FULLTEXT KEY `idx_biblio_busqueda` (`titulo`,`autor`,`descripcion`,`especialidades_relacionadas`,`patologias_relacionadas`,`palabras_clave`),
  CONSTRAINT `fk_biblio_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_biblio_subidor` FOREIGN KEY (`subido_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Recursos para profesionales de la salud';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `biblioteca_profesional`
--

LOCK TABLES `biblioteca_profesional` WRITE;
/*!40000 ALTER TABLE `biblioteca_profesional` DISABLE KEYS */;
/*!40000 ALTER TABLE `biblioteca_profesional` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bloques_horarios`
--

DROP TABLE IF EXISTS `bloques_horarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bloques_horarios` (
  `id_bloque` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `id_sucursal` int(10) unsigned DEFAULT NULL,
  `id_medico` int(10) unsigned NOT NULL,
  `fecha_inicio` datetime NOT NULL,
  `fecha_fin` datetime NOT NULL,
  `duracion_minutos` int(10) unsigned NOT NULL,
  `estado` enum('disponible','reservado','bloqueado','completado','no_disponible') NOT NULL DEFAULT 'disponible',
  `tipo_atencion` enum('presencial','telemedicina','ambos') NOT NULL DEFAULT 'presencial',
  `id_sala` int(10) unsigned DEFAULT NULL,
  `cupo_maximo` int(10) unsigned DEFAULT NULL,
  `cupo_actual` int(10) unsigned NOT NULL DEFAULT 0,
  `motivo_bloqueo` varchar(255) DEFAULT NULL,
  `recurrente` tinyint(1) NOT NULL DEFAULT 0,
  `patron_recurrencia` varchar(50) DEFAULT NULL,
  `fecha_fin_recurrencia` date DEFAULT NULL,
  `visible_web` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned NOT NULL,
  `modificado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_bloque`),
  KEY `fk_bloque_centro_idx` (`id_centro`),
  KEY `fk_bloque_sucursal_idx` (`id_sucursal`),
  KEY `fk_bloque_medico_idx` (`id_medico`),
  KEY `fk_bloque_sala_idx` (`id_sala`),
  KEY `fk_bloque_creador_idx` (`creado_por`),
  KEY `fk_bloque_modificador_idx` (`modificado_por`),
  KEY `idx_bloque_fecha_inicio` (`fecha_inicio`),
  KEY `idx_bloque_fecha_fin` (`fecha_fin`),
  KEY `idx_bloque_estado` (`estado`),
  KEY `idx_bloque_tipo` (`tipo_atencion`),
  KEY `idx_bloque_visible` (`visible_web`),
  CONSTRAINT `fk_bloque_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_bloque_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON UPDATE CASCADE,
  CONSTRAINT `fk_bloque_medico` FOREIGN KEY (`id_medico`) REFERENCES `medicos` (`id_medico`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_bloque_modificador` FOREIGN KEY (`modificado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_bloque_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursales` (`id_sucursal`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=490 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bloques de horarios disponibles';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bloques_horarios`
--

LOCK TABLES `bloques_horarios` WRITE;
/*!40000 ALTER TABLE `bloques_horarios` DISABLE KEYS */;
INSERT INTO `bloques_horarios` VALUES (1,1,NULL,1,'2025-10-29 09:00:00','2025-10-29 09:30:00',30,'disponible','presencial',1,NULL,0,NULL,0,NULL,NULL,1,'2025-10-29 00:33:24','2025-10-29 00:33:24',1,NULL),(2,1,NULL,1,'2025-10-29 09:30:00','2025-10-29 10:00:00',30,'disponible','presencial',1,NULL,0,NULL,0,NULL,NULL,1,'2025-10-29 00:33:24','2025-10-29 00:33:24',1,NULL),(3,1,NULL,1,'2025-10-29 10:00:00','2025-10-29 10:30:00',30,'disponible','presencial',1,NULL,0,NULL,0,NULL,NULL,1,'2025-10-29 00:33:24','2025-10-29 00:33:24',1,NULL),(4,1,NULL,1,'2025-10-30 11:00:00','2025-10-30 11:30:00',30,'disponible','telemedicina',1,NULL,0,NULL,0,NULL,NULL,1,'2025-10-29 00:33:24','2025-10-29 00:33:24',1,NULL),(5,1,NULL,1,'2025-10-30 11:30:00','2025-10-30 12:00:00',30,'disponible','telemedicina',1,NULL,0,NULL,0,NULL,NULL,1,'2025-10-29 00:33:24','2025-10-29 00:58:36',1,NULL),(6,1,NULL,1,'2025-10-31 15:00:00','2025-10-31 15:30:00',30,'disponible','presencial',1,NULL,0,NULL,0,NULL,NULL,1,'2025-10-29 00:33:24','2025-10-29 00:33:24',1,NULL),(10,1,NULL,4,'2025-11-03 09:00:00','2025-11-03 09:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(11,1,NULL,9,'2025-11-03 09:00:00','2025-11-03 09:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(12,1,NULL,4,'2025-11-03 10:00:00','2025-11-03 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(13,1,NULL,9,'2025-11-03 10:00:00','2025-11-03 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(14,1,NULL,4,'2025-11-03 10:00:00','2025-11-03 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(15,1,NULL,9,'2025-11-03 10:00:00','2025-11-03 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(16,1,NULL,4,'2025-11-03 11:00:00','2025-11-03 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(17,1,NULL,9,'2025-11-03 11:00:00','2025-11-03 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(18,1,NULL,4,'2025-11-03 11:00:00','2025-11-03 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(19,1,NULL,9,'2025-11-03 11:00:00','2025-11-03 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(20,1,NULL,4,'2025-11-03 12:00:00','2025-11-03 12:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(21,1,NULL,9,'2025-11-03 12:00:00','2025-11-03 12:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(22,1,NULL,4,'2025-11-03 15:00:00','2025-11-03 15:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(23,1,NULL,9,'2025-11-03 15:00:00','2025-11-03 15:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(24,1,NULL,4,'2025-11-03 16:00:00','2025-11-03 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(25,1,NULL,9,'2025-11-03 16:00:00','2025-11-03 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(26,1,NULL,4,'2025-11-03 16:00:00','2025-11-03 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(27,1,NULL,9,'2025-11-03 16:00:00','2025-11-03 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(28,1,NULL,4,'2025-11-03 17:00:00','2025-11-03 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(29,1,NULL,9,'2025-11-03 17:00:00','2025-11-03 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(30,1,NULL,4,'2025-11-03 17:00:00','2025-11-03 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(31,1,NULL,9,'2025-11-03 17:00:00','2025-11-03 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(32,1,NULL,4,'2025-11-03 18:00:00','2025-11-03 18:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(33,1,NULL,9,'2025-11-03 18:00:00','2025-11-03 18:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(34,1,NULL,4,'2025-11-04 09:00:00','2025-11-04 09:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(35,1,NULL,9,'2025-11-04 09:00:00','2025-11-04 09:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(36,1,NULL,4,'2025-11-04 10:00:00','2025-11-04 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(37,1,NULL,9,'2025-11-04 10:00:00','2025-11-04 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(38,1,NULL,4,'2025-11-04 10:00:00','2025-11-04 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(39,1,NULL,9,'2025-11-04 10:00:00','2025-11-04 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(40,1,NULL,4,'2025-11-04 11:00:00','2025-11-04 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(41,1,NULL,9,'2025-11-04 11:00:00','2025-11-04 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(42,1,NULL,4,'2025-11-04 11:00:00','2025-11-04 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(43,1,NULL,9,'2025-11-04 11:00:00','2025-11-04 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(44,1,NULL,4,'2025-11-04 12:00:00','2025-11-04 12:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(45,1,NULL,9,'2025-11-04 12:00:00','2025-11-04 12:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(46,1,NULL,4,'2025-11-04 15:00:00','2025-11-04 15:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(47,1,NULL,9,'2025-11-04 15:00:00','2025-11-04 15:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(48,1,NULL,4,'2025-11-04 16:00:00','2025-11-04 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(49,1,NULL,9,'2025-11-04 16:00:00','2025-11-04 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(50,1,NULL,4,'2025-11-04 16:00:00','2025-11-04 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(51,1,NULL,9,'2025-11-04 16:00:00','2025-11-04 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(52,1,NULL,4,'2025-11-04 17:00:00','2025-11-04 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(53,1,NULL,9,'2025-11-04 17:00:00','2025-11-04 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(54,1,NULL,4,'2025-11-04 17:00:00','2025-11-04 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(55,1,NULL,9,'2025-11-04 17:00:00','2025-11-04 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(56,1,NULL,4,'2025-11-04 18:00:00','2025-11-04 18:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(57,1,NULL,9,'2025-11-04 18:00:00','2025-11-04 18:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(58,1,NULL,4,'2025-11-05 09:00:00','2025-11-05 09:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(59,1,NULL,9,'2025-11-05 09:00:00','2025-11-05 09:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(60,1,NULL,4,'2025-11-05 10:00:00','2025-11-05 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(61,1,NULL,9,'2025-11-05 10:00:00','2025-11-05 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(62,1,NULL,4,'2025-11-05 10:00:00','2025-11-05 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(63,1,NULL,9,'2025-11-05 10:00:00','2025-11-05 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(64,1,NULL,4,'2025-11-05 11:00:00','2025-11-05 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(65,1,NULL,9,'2025-11-05 11:00:00','2025-11-05 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(66,1,NULL,4,'2025-11-05 11:00:00','2025-11-05 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(67,1,NULL,9,'2025-11-05 11:00:00','2025-11-05 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(68,1,NULL,4,'2025-11-05 12:00:00','2025-11-05 12:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(69,1,NULL,9,'2025-11-05 12:00:00','2025-11-05 12:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(70,1,NULL,4,'2025-11-05 15:00:00','2025-11-05 15:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(71,1,NULL,9,'2025-11-05 15:00:00','2025-11-05 15:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(72,1,NULL,4,'2025-11-05 16:00:00','2025-11-05 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(73,1,NULL,9,'2025-11-05 16:00:00','2025-11-05 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(74,1,NULL,4,'2025-11-05 16:00:00','2025-11-05 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(75,1,NULL,9,'2025-11-05 16:00:00','2025-11-05 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(76,1,NULL,4,'2025-11-05 17:00:00','2025-11-05 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(77,1,NULL,9,'2025-11-05 17:00:00','2025-11-05 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(78,1,NULL,4,'2025-11-05 17:00:00','2025-11-05 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(79,1,NULL,9,'2025-11-05 17:00:00','2025-11-05 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(80,1,NULL,4,'2025-11-05 18:00:00','2025-11-05 18:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(81,1,NULL,9,'2025-11-05 18:00:00','2025-11-05 18:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(82,1,NULL,4,'2025-11-06 09:00:00','2025-11-06 09:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(83,1,NULL,9,'2025-11-06 09:00:00','2025-11-06 09:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(84,1,NULL,4,'2025-11-06 10:00:00','2025-11-06 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(85,1,NULL,9,'2025-11-06 10:00:00','2025-11-06 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(86,1,NULL,4,'2025-11-06 10:00:00','2025-11-06 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(87,1,NULL,9,'2025-11-06 10:00:00','2025-11-06 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(88,1,NULL,4,'2025-11-06 11:00:00','2025-11-06 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(89,1,NULL,9,'2025-11-06 11:00:00','2025-11-06 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(90,1,NULL,4,'2025-11-06 11:00:00','2025-11-06 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(91,1,NULL,9,'2025-11-06 11:00:00','2025-11-06 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(92,1,NULL,4,'2025-11-06 12:00:00','2025-11-06 12:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(93,1,NULL,9,'2025-11-06 12:00:00','2025-11-06 12:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(94,1,NULL,4,'2025-11-06 15:00:00','2025-11-06 15:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(95,1,NULL,9,'2025-11-06 15:00:00','2025-11-06 15:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(96,1,NULL,4,'2025-11-06 16:00:00','2025-11-06 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(97,1,NULL,9,'2025-11-06 16:00:00','2025-11-06 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(98,1,NULL,4,'2025-11-06 16:00:00','2025-11-06 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(99,1,NULL,9,'2025-11-06 16:00:00','2025-11-06 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(100,1,NULL,4,'2025-11-06 17:00:00','2025-11-06 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(101,1,NULL,9,'2025-11-06 17:00:00','2025-11-06 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(102,1,NULL,4,'2025-11-06 17:00:00','2025-11-06 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(103,1,NULL,9,'2025-11-06 17:00:00','2025-11-06 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(104,1,NULL,4,'2025-11-06 18:00:00','2025-11-06 18:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(105,1,NULL,9,'2025-11-06 18:00:00','2025-11-06 18:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(106,1,NULL,4,'2025-11-07 09:00:00','2025-11-07 09:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(107,1,NULL,9,'2025-11-07 09:00:00','2025-11-07 09:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(108,1,NULL,4,'2025-11-07 10:00:00','2025-11-07 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(109,1,NULL,9,'2025-11-07 10:00:00','2025-11-07 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(110,1,NULL,4,'2025-11-07 10:00:00','2025-11-07 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(111,1,NULL,9,'2025-11-07 10:00:00','2025-11-07 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(112,1,NULL,4,'2025-11-07 11:00:00','2025-11-07 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(113,1,NULL,9,'2025-11-07 11:00:00','2025-11-07 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(114,1,NULL,4,'2025-11-07 11:00:00','2025-11-07 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(115,1,NULL,9,'2025-11-07 11:00:00','2025-11-07 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(116,1,NULL,4,'2025-11-07 12:00:00','2025-11-07 12:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(117,1,NULL,9,'2025-11-07 12:00:00','2025-11-07 12:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(118,1,NULL,4,'2025-11-07 15:00:00','2025-11-07 15:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(119,1,NULL,9,'2025-11-07 15:00:00','2025-11-07 15:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(120,1,NULL,4,'2025-11-07 16:00:00','2025-11-07 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(121,1,NULL,9,'2025-11-07 16:00:00','2025-11-07 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(122,1,NULL,4,'2025-11-07 16:00:00','2025-11-07 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(123,1,NULL,9,'2025-11-07 16:00:00','2025-11-07 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(124,1,NULL,4,'2025-11-07 17:00:00','2025-11-07 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(125,1,NULL,9,'2025-11-07 17:00:00','2025-11-07 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(126,1,NULL,4,'2025-11-07 17:00:00','2025-11-07 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(127,1,NULL,9,'2025-11-07 17:00:00','2025-11-07 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(128,1,NULL,4,'2025-11-07 18:00:00','2025-11-07 18:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(129,1,NULL,9,'2025-11-07 18:00:00','2025-11-07 18:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(130,1,NULL,4,'2025-11-10 09:00:00','2025-11-10 09:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(131,1,NULL,9,'2025-11-10 09:00:00','2025-11-10 09:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(132,1,NULL,4,'2025-11-10 10:00:00','2025-11-10 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(133,1,NULL,9,'2025-11-10 10:00:00','2025-11-10 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(134,1,NULL,4,'2025-11-10 10:00:00','2025-11-10 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(135,1,NULL,9,'2025-11-10 10:00:00','2025-11-10 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(136,1,NULL,4,'2025-11-10 11:00:00','2025-11-10 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(137,1,NULL,9,'2025-11-10 11:00:00','2025-11-10 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(138,1,NULL,4,'2025-11-10 11:00:00','2025-11-10 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(139,1,NULL,9,'2025-11-10 11:00:00','2025-11-10 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(140,1,NULL,4,'2025-11-10 12:00:00','2025-11-10 12:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(141,1,NULL,9,'2025-11-10 12:00:00','2025-11-10 12:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(142,1,NULL,4,'2025-11-10 15:00:00','2025-11-10 15:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(143,1,NULL,9,'2025-11-10 15:00:00','2025-11-10 15:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(144,1,NULL,4,'2025-11-10 16:00:00','2025-11-10 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(145,1,NULL,9,'2025-11-10 16:00:00','2025-11-10 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(146,1,NULL,4,'2025-11-10 16:00:00','2025-11-10 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(147,1,NULL,9,'2025-11-10 16:00:00','2025-11-10 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(148,1,NULL,4,'2025-11-10 17:00:00','2025-11-10 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(149,1,NULL,9,'2025-11-10 17:00:00','2025-11-10 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(150,1,NULL,4,'2025-11-10 17:00:00','2025-11-10 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(151,1,NULL,9,'2025-11-10 17:00:00','2025-11-10 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(152,1,NULL,4,'2025-11-10 18:00:00','2025-11-10 18:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(153,1,NULL,9,'2025-11-10 18:00:00','2025-11-10 18:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(154,1,NULL,4,'2025-11-11 09:00:00','2025-11-11 09:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(155,1,NULL,9,'2025-11-11 09:00:00','2025-11-11 09:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(156,1,NULL,4,'2025-11-11 10:00:00','2025-11-11 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(157,1,NULL,9,'2025-11-11 10:00:00','2025-11-11 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(158,1,NULL,4,'2025-11-11 10:00:00','2025-11-11 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(159,1,NULL,9,'2025-11-11 10:00:00','2025-11-11 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(160,1,NULL,4,'2025-11-11 11:00:00','2025-11-11 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(161,1,NULL,9,'2025-11-11 11:00:00','2025-11-11 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(162,1,NULL,4,'2025-11-11 11:00:00','2025-11-11 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(163,1,NULL,9,'2025-11-11 11:00:00','2025-11-11 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(164,1,NULL,4,'2025-11-11 12:00:00','2025-11-11 12:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(165,1,NULL,9,'2025-11-11 12:00:00','2025-11-11 12:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(166,1,NULL,4,'2025-11-11 15:00:00','2025-11-11 15:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(167,1,NULL,9,'2025-11-11 15:00:00','2025-11-11 15:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(168,1,NULL,4,'2025-11-11 16:00:00','2025-11-11 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(169,1,NULL,9,'2025-11-11 16:00:00','2025-11-11 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(170,1,NULL,4,'2025-11-11 16:00:00','2025-11-11 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(171,1,NULL,9,'2025-11-11 16:00:00','2025-11-11 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(172,1,NULL,4,'2025-11-11 17:00:00','2025-11-11 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(173,1,NULL,9,'2025-11-11 17:00:00','2025-11-11 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(174,1,NULL,4,'2025-11-11 17:00:00','2025-11-11 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(175,1,NULL,9,'2025-11-11 17:00:00','2025-11-11 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(176,1,NULL,4,'2025-11-11 18:00:00','2025-11-11 18:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(177,1,NULL,9,'2025-11-11 18:00:00','2025-11-11 18:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(178,1,NULL,4,'2025-11-12 09:00:00','2025-11-12 09:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(179,1,NULL,9,'2025-11-12 09:00:00','2025-11-12 09:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(180,1,NULL,4,'2025-11-12 10:00:00','2025-11-12 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(181,1,NULL,9,'2025-11-12 10:00:00','2025-11-12 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(182,1,NULL,4,'2025-11-12 10:00:00','2025-11-12 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(183,1,NULL,9,'2025-11-12 10:00:00','2025-11-12 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(184,1,NULL,4,'2025-11-12 11:00:00','2025-11-12 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(185,1,NULL,9,'2025-11-12 11:00:00','2025-11-12 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(186,1,NULL,4,'2025-11-12 11:00:00','2025-11-12 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(187,1,NULL,9,'2025-11-12 11:00:00','2025-11-12 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(188,1,NULL,4,'2025-11-12 12:00:00','2025-11-12 12:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(189,1,NULL,9,'2025-11-12 12:00:00','2025-11-12 12:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(190,1,NULL,4,'2025-11-12 15:00:00','2025-11-12 15:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(191,1,NULL,9,'2025-11-12 15:00:00','2025-11-12 15:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(192,1,NULL,4,'2025-11-12 16:00:00','2025-11-12 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(193,1,NULL,9,'2025-11-12 16:00:00','2025-11-12 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(194,1,NULL,4,'2025-11-12 16:00:00','2025-11-12 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(195,1,NULL,9,'2025-11-12 16:00:00','2025-11-12 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(196,1,NULL,4,'2025-11-12 17:00:00','2025-11-12 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(197,1,NULL,9,'2025-11-12 17:00:00','2025-11-12 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(198,1,NULL,4,'2025-11-12 17:00:00','2025-11-12 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(199,1,NULL,9,'2025-11-12 17:00:00','2025-11-12 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(200,1,NULL,4,'2025-11-12 18:00:00','2025-11-12 18:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(201,1,NULL,9,'2025-11-12 18:00:00','2025-11-12 18:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(202,1,NULL,4,'2025-11-13 09:00:00','2025-11-13 09:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(203,1,NULL,9,'2025-11-13 09:00:00','2025-11-13 09:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(204,1,NULL,4,'2025-11-13 10:00:00','2025-11-13 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(205,1,NULL,9,'2025-11-13 10:00:00','2025-11-13 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(206,1,NULL,4,'2025-11-13 10:00:00','2025-11-13 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(207,1,NULL,9,'2025-11-13 10:00:00','2025-11-13 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(208,1,NULL,4,'2025-11-13 11:00:00','2025-11-13 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(209,1,NULL,9,'2025-11-13 11:00:00','2025-11-13 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(210,1,NULL,4,'2025-11-13 11:00:00','2025-11-13 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(211,1,NULL,9,'2025-11-13 11:00:00','2025-11-13 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(212,1,NULL,4,'2025-11-13 12:00:00','2025-11-13 12:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(213,1,NULL,9,'2025-11-13 12:00:00','2025-11-13 12:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(214,1,NULL,4,'2025-11-13 15:00:00','2025-11-13 15:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(215,1,NULL,9,'2025-11-13 15:00:00','2025-11-13 15:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(216,1,NULL,4,'2025-11-13 16:00:00','2025-11-13 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(217,1,NULL,9,'2025-11-13 16:00:00','2025-11-13 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(218,1,NULL,4,'2025-11-13 16:00:00','2025-11-13 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(219,1,NULL,9,'2025-11-13 16:00:00','2025-11-13 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(220,1,NULL,4,'2025-11-13 17:00:00','2025-11-13 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(221,1,NULL,9,'2025-11-13 17:00:00','2025-11-13 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(222,1,NULL,4,'2025-11-13 17:00:00','2025-11-13 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(223,1,NULL,9,'2025-11-13 17:00:00','2025-11-13 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(224,1,NULL,4,'2025-11-13 18:00:00','2025-11-13 18:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(225,1,NULL,9,'2025-11-13 18:00:00','2025-11-13 18:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(226,1,NULL,4,'2025-11-14 09:00:00','2025-11-14 09:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(227,1,NULL,9,'2025-11-14 09:00:00','2025-11-14 09:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(228,1,NULL,4,'2025-11-14 10:00:00','2025-11-14 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(229,1,NULL,9,'2025-11-14 10:00:00','2025-11-14 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(230,1,NULL,4,'2025-11-14 10:00:00','2025-11-14 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(231,1,NULL,9,'2025-11-14 10:00:00','2025-11-14 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(232,1,NULL,4,'2025-11-14 11:00:00','2025-11-14 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(233,1,NULL,9,'2025-11-14 11:00:00','2025-11-14 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(234,1,NULL,4,'2025-11-14 11:00:00','2025-11-14 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(235,1,NULL,9,'2025-11-14 11:00:00','2025-11-14 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(236,1,NULL,4,'2025-11-14 12:00:00','2025-11-14 12:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(237,1,NULL,9,'2025-11-14 12:00:00','2025-11-14 12:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(238,1,NULL,4,'2025-11-14 15:00:00','2025-11-14 15:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(239,1,NULL,9,'2025-11-14 15:00:00','2025-11-14 15:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(240,1,NULL,4,'2025-11-14 16:00:00','2025-11-14 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(241,1,NULL,9,'2025-11-14 16:00:00','2025-11-14 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(242,1,NULL,4,'2025-11-14 16:00:00','2025-11-14 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(243,1,NULL,9,'2025-11-14 16:00:00','2025-11-14 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(244,1,NULL,4,'2025-11-14 17:00:00','2025-11-14 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(245,1,NULL,9,'2025-11-14 17:00:00','2025-11-14 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(246,1,NULL,4,'2025-11-14 17:00:00','2025-11-14 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(247,1,NULL,9,'2025-11-14 17:00:00','2025-11-14 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(248,1,NULL,4,'2025-11-14 18:00:00','2025-11-14 18:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(249,1,NULL,9,'2025-11-14 18:00:00','2025-11-14 18:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(250,1,NULL,4,'2025-11-17 09:00:00','2025-11-17 09:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(251,1,NULL,9,'2025-11-17 09:00:00','2025-11-17 09:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(252,1,NULL,4,'2025-11-17 10:00:00','2025-11-17 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(253,1,NULL,9,'2025-11-17 10:00:00','2025-11-17 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(254,1,NULL,4,'2025-11-17 10:00:00','2025-11-17 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(255,1,NULL,9,'2025-11-17 10:00:00','2025-11-17 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(256,1,NULL,4,'2025-11-17 11:00:00','2025-11-17 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(257,1,NULL,9,'2025-11-17 11:00:00','2025-11-17 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(258,1,NULL,4,'2025-11-17 11:00:00','2025-11-17 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(259,1,NULL,9,'2025-11-17 11:00:00','2025-11-17 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(260,1,NULL,4,'2025-11-17 12:00:00','2025-11-17 12:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(261,1,NULL,9,'2025-11-17 12:00:00','2025-11-17 12:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(262,1,NULL,4,'2025-11-17 15:00:00','2025-11-17 15:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(263,1,NULL,9,'2025-11-17 15:00:00','2025-11-17 15:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(264,1,NULL,4,'2025-11-17 16:00:00','2025-11-17 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(265,1,NULL,9,'2025-11-17 16:00:00','2025-11-17 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(266,1,NULL,4,'2025-11-17 16:00:00','2025-11-17 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(267,1,NULL,9,'2025-11-17 16:00:00','2025-11-17 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(268,1,NULL,4,'2025-11-17 17:00:00','2025-11-17 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(269,1,NULL,9,'2025-11-17 17:00:00','2025-11-17 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(270,1,NULL,4,'2025-11-17 17:00:00','2025-11-17 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(271,1,NULL,9,'2025-11-17 17:00:00','2025-11-17 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(272,1,NULL,4,'2025-11-17 18:00:00','2025-11-17 18:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(273,1,NULL,9,'2025-11-17 18:00:00','2025-11-17 18:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(274,1,NULL,4,'2025-11-18 09:00:00','2025-11-18 09:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(275,1,NULL,9,'2025-11-18 09:00:00','2025-11-18 09:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(276,1,NULL,4,'2025-11-18 10:00:00','2025-11-18 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(277,1,NULL,9,'2025-11-18 10:00:00','2025-11-18 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(278,1,NULL,4,'2025-11-18 10:00:00','2025-11-18 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(279,1,NULL,9,'2025-11-18 10:00:00','2025-11-18 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(280,1,NULL,4,'2025-11-18 11:00:00','2025-11-18 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(281,1,NULL,9,'2025-11-18 11:00:00','2025-11-18 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(282,1,NULL,4,'2025-11-18 11:00:00','2025-11-18 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(283,1,NULL,9,'2025-11-18 11:00:00','2025-11-18 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(284,1,NULL,4,'2025-11-18 12:00:00','2025-11-18 12:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(285,1,NULL,9,'2025-11-18 12:00:00','2025-11-18 12:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(286,1,NULL,4,'2025-11-18 15:00:00','2025-11-18 15:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(287,1,NULL,9,'2025-11-18 15:00:00','2025-11-18 15:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(288,1,NULL,4,'2025-11-18 16:00:00','2025-11-18 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(289,1,NULL,9,'2025-11-18 16:00:00','2025-11-18 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(290,1,NULL,4,'2025-11-18 16:00:00','2025-11-18 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(291,1,NULL,9,'2025-11-18 16:00:00','2025-11-18 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(292,1,NULL,4,'2025-11-18 17:00:00','2025-11-18 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(293,1,NULL,9,'2025-11-18 17:00:00','2025-11-18 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(294,1,NULL,4,'2025-11-18 17:00:00','2025-11-18 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(295,1,NULL,9,'2025-11-18 17:00:00','2025-11-18 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(296,1,NULL,4,'2025-11-18 18:00:00','2025-11-18 18:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(297,1,NULL,9,'2025-11-18 18:00:00','2025-11-18 18:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(298,1,NULL,4,'2025-11-19 09:00:00','2025-11-19 09:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(299,1,NULL,9,'2025-11-19 09:00:00','2025-11-19 09:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(300,1,NULL,4,'2025-11-19 10:00:00','2025-11-19 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(301,1,NULL,9,'2025-11-19 10:00:00','2025-11-19 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(302,1,NULL,4,'2025-11-19 10:00:00','2025-11-19 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(303,1,NULL,9,'2025-11-19 10:00:00','2025-11-19 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(304,1,NULL,4,'2025-11-19 11:00:00','2025-11-19 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(305,1,NULL,9,'2025-11-19 11:00:00','2025-11-19 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(306,1,NULL,4,'2025-11-19 11:00:00','2025-11-19 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(307,1,NULL,9,'2025-11-19 11:00:00','2025-11-19 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(308,1,NULL,4,'2025-11-19 12:00:00','2025-11-19 12:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(309,1,NULL,9,'2025-11-19 12:00:00','2025-11-19 12:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(310,1,NULL,4,'2025-11-19 15:00:00','2025-11-19 15:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(311,1,NULL,9,'2025-11-19 15:00:00','2025-11-19 15:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(312,1,NULL,4,'2025-11-19 16:00:00','2025-11-19 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(313,1,NULL,9,'2025-11-19 16:00:00','2025-11-19 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(314,1,NULL,4,'2025-11-19 16:00:00','2025-11-19 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(315,1,NULL,9,'2025-11-19 16:00:00','2025-11-19 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(316,1,NULL,4,'2025-11-19 17:00:00','2025-11-19 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(317,1,NULL,9,'2025-11-19 17:00:00','2025-11-19 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(318,1,NULL,4,'2025-11-19 17:00:00','2025-11-19 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(319,1,NULL,9,'2025-11-19 17:00:00','2025-11-19 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(320,1,NULL,4,'2025-11-19 18:00:00','2025-11-19 18:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(321,1,NULL,9,'2025-11-19 18:00:00','2025-11-19 18:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(322,1,NULL,4,'2025-11-20 09:00:00','2025-11-20 09:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(323,1,NULL,9,'2025-11-20 09:00:00','2025-11-20 09:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(324,1,NULL,4,'2025-11-20 10:00:00','2025-11-20 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(325,1,NULL,9,'2025-11-20 10:00:00','2025-11-20 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(326,1,NULL,4,'2025-11-20 10:00:00','2025-11-20 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(327,1,NULL,9,'2025-11-20 10:00:00','2025-11-20 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(328,1,NULL,4,'2025-11-20 11:00:00','2025-11-20 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(329,1,NULL,9,'2025-11-20 11:00:00','2025-11-20 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(330,1,NULL,4,'2025-11-20 11:00:00','2025-11-20 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(331,1,NULL,9,'2025-11-20 11:00:00','2025-11-20 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(332,1,NULL,4,'2025-11-20 12:00:00','2025-11-20 12:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(333,1,NULL,9,'2025-11-20 12:00:00','2025-11-20 12:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(334,1,NULL,4,'2025-11-20 15:00:00','2025-11-20 15:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(335,1,NULL,9,'2025-11-20 15:00:00','2025-11-20 15:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(336,1,NULL,4,'2025-11-20 16:00:00','2025-11-20 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(337,1,NULL,9,'2025-11-20 16:00:00','2025-11-20 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(338,1,NULL,4,'2025-11-20 16:00:00','2025-11-20 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(339,1,NULL,9,'2025-11-20 16:00:00','2025-11-20 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(340,1,NULL,4,'2025-11-20 17:00:00','2025-11-20 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(341,1,NULL,9,'2025-11-20 17:00:00','2025-11-20 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(342,1,NULL,4,'2025-11-20 17:00:00','2025-11-20 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(343,1,NULL,9,'2025-11-20 17:00:00','2025-11-20 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(344,1,NULL,4,'2025-11-20 18:00:00','2025-11-20 18:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(345,1,NULL,9,'2025-11-20 18:00:00','2025-11-20 18:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(346,1,NULL,4,'2025-11-21 09:00:00','2025-11-21 09:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(347,1,NULL,9,'2025-11-21 09:00:00','2025-11-21 09:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(348,1,NULL,4,'2025-11-21 10:00:00','2025-11-21 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(349,1,NULL,9,'2025-11-21 10:00:00','2025-11-21 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(350,1,NULL,4,'2025-11-21 10:00:00','2025-11-21 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(351,1,NULL,9,'2025-11-21 10:00:00','2025-11-21 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(352,1,NULL,4,'2025-11-21 11:00:00','2025-11-21 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(353,1,NULL,9,'2025-11-21 11:00:00','2025-11-21 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(354,1,NULL,4,'2025-11-21 11:00:00','2025-11-21 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(355,1,NULL,9,'2025-11-21 11:00:00','2025-11-21 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(356,1,NULL,4,'2025-11-21 12:00:00','2025-11-21 12:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(357,1,NULL,9,'2025-11-21 12:00:00','2025-11-21 12:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(358,1,NULL,4,'2025-11-21 15:00:00','2025-11-21 15:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(359,1,NULL,9,'2025-11-21 15:00:00','2025-11-21 15:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(360,1,NULL,4,'2025-11-21 16:00:00','2025-11-21 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(361,1,NULL,9,'2025-11-21 16:00:00','2025-11-21 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(362,1,NULL,4,'2025-11-21 16:00:00','2025-11-21 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(363,1,NULL,9,'2025-11-21 16:00:00','2025-11-21 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(364,1,NULL,4,'2025-11-21 17:00:00','2025-11-21 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(365,1,NULL,9,'2025-11-21 17:00:00','2025-11-21 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(366,1,NULL,4,'2025-11-21 17:00:00','2025-11-21 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(367,1,NULL,9,'2025-11-21 17:00:00','2025-11-21 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(368,1,NULL,4,'2025-11-21 18:00:00','2025-11-21 18:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(369,1,NULL,9,'2025-11-21 18:00:00','2025-11-21 18:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(370,1,NULL,4,'2025-11-24 09:00:00','2025-11-24 09:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(371,1,NULL,9,'2025-11-24 09:00:00','2025-11-24 09:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(372,1,NULL,4,'2025-11-24 10:00:00','2025-11-24 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(373,1,NULL,9,'2025-11-24 10:00:00','2025-11-24 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(374,1,NULL,4,'2025-11-24 10:00:00','2025-11-24 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(375,1,NULL,9,'2025-11-24 10:00:00','2025-11-24 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(376,1,NULL,4,'2025-11-24 11:00:00','2025-11-24 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(377,1,NULL,9,'2025-11-24 11:00:00','2025-11-24 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(378,1,NULL,4,'2025-11-24 11:00:00','2025-11-24 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(379,1,NULL,9,'2025-11-24 11:00:00','2025-11-24 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(380,1,NULL,4,'2025-11-24 12:00:00','2025-11-24 12:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(381,1,NULL,9,'2025-11-24 12:00:00','2025-11-24 12:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(382,1,NULL,4,'2025-11-24 15:00:00','2025-11-24 15:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(383,1,NULL,9,'2025-11-24 15:00:00','2025-11-24 15:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(384,1,NULL,4,'2025-11-24 16:00:00','2025-11-24 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(385,1,NULL,9,'2025-11-24 16:00:00','2025-11-24 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(386,1,NULL,4,'2025-11-24 16:00:00','2025-11-24 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(387,1,NULL,9,'2025-11-24 16:00:00','2025-11-24 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(388,1,NULL,4,'2025-11-24 17:00:00','2025-11-24 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(389,1,NULL,9,'2025-11-24 17:00:00','2025-11-24 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(390,1,NULL,4,'2025-11-24 17:00:00','2025-11-24 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(391,1,NULL,9,'2025-11-24 17:00:00','2025-11-24 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(392,1,NULL,4,'2025-11-24 18:00:00','2025-11-24 18:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(393,1,NULL,9,'2025-11-24 18:00:00','2025-11-24 18:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(394,1,NULL,4,'2025-11-25 09:00:00','2025-11-25 09:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(395,1,NULL,9,'2025-11-25 09:00:00','2025-11-25 09:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(396,1,NULL,4,'2025-11-25 10:00:00','2025-11-25 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(397,1,NULL,9,'2025-11-25 10:00:00','2025-11-25 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(398,1,NULL,4,'2025-11-25 10:00:00','2025-11-25 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(399,1,NULL,9,'2025-11-25 10:00:00','2025-11-25 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(400,1,NULL,4,'2025-11-25 11:00:00','2025-11-25 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(401,1,NULL,9,'2025-11-25 11:00:00','2025-11-25 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(402,1,NULL,4,'2025-11-25 11:00:00','2025-11-25 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(403,1,NULL,9,'2025-11-25 11:00:00','2025-11-25 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(404,1,NULL,4,'2025-11-25 12:00:00','2025-11-25 12:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(405,1,NULL,9,'2025-11-25 12:00:00','2025-11-25 12:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(406,1,NULL,4,'2025-11-25 15:00:00','2025-11-25 15:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(407,1,NULL,9,'2025-11-25 15:00:00','2025-11-25 15:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(408,1,NULL,4,'2025-11-25 16:00:00','2025-11-25 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(409,1,NULL,9,'2025-11-25 16:00:00','2025-11-25 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(410,1,NULL,4,'2025-11-25 16:00:00','2025-11-25 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(411,1,NULL,9,'2025-11-25 16:00:00','2025-11-25 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(412,1,NULL,4,'2025-11-25 17:00:00','2025-11-25 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(413,1,NULL,9,'2025-11-25 17:00:00','2025-11-25 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(414,1,NULL,4,'2025-11-25 17:00:00','2025-11-25 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(415,1,NULL,9,'2025-11-25 17:00:00','2025-11-25 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(416,1,NULL,4,'2025-11-25 18:00:00','2025-11-25 18:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(417,1,NULL,9,'2025-11-25 18:00:00','2025-11-25 18:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(418,1,NULL,4,'2025-11-26 09:00:00','2025-11-26 09:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(419,1,NULL,9,'2025-11-26 09:00:00','2025-11-26 09:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(420,1,NULL,4,'2025-11-26 10:00:00','2025-11-26 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(421,1,NULL,9,'2025-11-26 10:00:00','2025-11-26 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(422,1,NULL,4,'2025-11-26 10:00:00','2025-11-26 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(423,1,NULL,9,'2025-11-26 10:00:00','2025-11-26 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(424,1,NULL,4,'2025-11-26 11:00:00','2025-11-26 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(425,1,NULL,9,'2025-11-26 11:00:00','2025-11-26 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(426,1,NULL,4,'2025-11-26 11:00:00','2025-11-26 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(427,1,NULL,9,'2025-11-26 11:00:00','2025-11-26 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(428,1,NULL,4,'2025-11-26 12:00:00','2025-11-26 12:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(429,1,NULL,9,'2025-11-26 12:00:00','2025-11-26 12:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(430,1,NULL,4,'2025-11-26 15:00:00','2025-11-26 15:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(431,1,NULL,9,'2025-11-26 15:00:00','2025-11-26 15:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(432,1,NULL,4,'2025-11-26 16:00:00','2025-11-26 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(433,1,NULL,9,'2025-11-26 16:00:00','2025-11-26 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(434,1,NULL,4,'2025-11-26 16:00:00','2025-11-26 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(435,1,NULL,9,'2025-11-26 16:00:00','2025-11-26 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(436,1,NULL,4,'2025-11-26 17:00:00','2025-11-26 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(437,1,NULL,9,'2025-11-26 17:00:00','2025-11-26 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(438,1,NULL,4,'2025-11-26 17:00:00','2025-11-26 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(439,1,NULL,9,'2025-11-26 17:00:00','2025-11-26 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(440,1,NULL,4,'2025-11-26 18:00:00','2025-11-26 18:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(441,1,NULL,9,'2025-11-26 18:00:00','2025-11-26 18:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(442,1,NULL,4,'2025-11-27 09:00:00','2025-11-27 09:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(443,1,NULL,9,'2025-11-27 09:00:00','2025-11-27 09:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(444,1,NULL,4,'2025-11-27 10:00:00','2025-11-27 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(445,1,NULL,9,'2025-11-27 10:00:00','2025-11-27 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(446,1,NULL,4,'2025-11-27 10:00:00','2025-11-27 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(447,1,NULL,9,'2025-11-27 10:00:00','2025-11-27 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(448,1,NULL,4,'2025-11-27 11:00:00','2025-11-27 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(449,1,NULL,9,'2025-11-27 11:00:00','2025-11-27 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(450,1,NULL,4,'2025-11-27 11:00:00','2025-11-27 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(451,1,NULL,9,'2025-11-27 11:00:00','2025-11-27 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(452,1,NULL,4,'2025-11-27 12:00:00','2025-11-27 12:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(453,1,NULL,9,'2025-11-27 12:00:00','2025-11-27 12:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(454,1,NULL,4,'2025-11-27 15:00:00','2025-11-27 15:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(455,1,NULL,9,'2025-11-27 15:00:00','2025-11-27 15:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(456,1,NULL,4,'2025-11-27 16:00:00','2025-11-27 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(457,1,NULL,9,'2025-11-27 16:00:00','2025-11-27 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(458,1,NULL,4,'2025-11-27 16:00:00','2025-11-27 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(459,1,NULL,9,'2025-11-27 16:00:00','2025-11-27 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(460,1,NULL,4,'2025-11-27 17:00:00','2025-11-27 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(461,1,NULL,9,'2025-11-27 17:00:00','2025-11-27 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(462,1,NULL,4,'2025-11-27 17:00:00','2025-11-27 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(463,1,NULL,9,'2025-11-27 17:00:00','2025-11-27 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(464,1,NULL,4,'2025-11-27 18:00:00','2025-11-27 18:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(465,1,NULL,9,'2025-11-27 18:00:00','2025-11-27 18:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(466,1,NULL,4,'2025-11-28 09:00:00','2025-11-28 09:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(467,1,NULL,9,'2025-11-28 09:00:00','2025-11-28 09:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(468,1,NULL,4,'2025-11-28 10:00:00','2025-11-28 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(469,1,NULL,9,'2025-11-28 10:00:00','2025-11-28 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(470,1,NULL,4,'2025-11-28 10:00:00','2025-11-28 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(471,1,NULL,9,'2025-11-28 10:00:00','2025-11-28 10:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(472,1,NULL,4,'2025-11-28 11:00:00','2025-11-28 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(473,1,NULL,9,'2025-11-28 11:00:00','2025-11-28 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(474,1,NULL,4,'2025-11-28 11:00:00','2025-11-28 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(475,1,NULL,9,'2025-11-28 11:00:00','2025-11-28 11:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(476,1,NULL,4,'2025-11-28 12:00:00','2025-11-28 12:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(477,1,NULL,9,'2025-11-28 12:00:00','2025-11-28 12:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(478,1,NULL,4,'2025-11-28 15:00:00','2025-11-28 15:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(479,1,NULL,9,'2025-11-28 15:00:00','2025-11-28 15:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(480,1,NULL,4,'2025-11-28 16:00:00','2025-11-28 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(481,1,NULL,9,'2025-11-28 16:00:00','2025-11-28 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(482,1,NULL,4,'2025-11-28 16:00:00','2025-11-28 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(483,1,NULL,9,'2025-11-28 16:00:00','2025-11-28 16:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(484,1,NULL,4,'2025-11-28 17:00:00','2025-11-28 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(485,1,NULL,9,'2025-11-28 17:00:00','2025-11-28 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(486,1,NULL,4,'2025-11-28 17:00:00','2025-11-28 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(487,1,NULL,9,'2025-11-28 17:00:00','2025-11-28 17:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(488,1,NULL,4,'2025-11-28 18:00:00','2025-11-28 18:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL),(489,1,NULL,9,'2025-11-28 18:00:00','2025-11-28 18:30:00',30,'disponible','presencial',NULL,1,0,NULL,0,NULL,NULL,1,'2025-11-03 16:50:04','2025-11-03 16:50:04',1,NULL);
/*!40000 ALTER TABLE `bloques_horarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `campanas_marketing`
--

DROP TABLE IF EXISTS `campanas_marketing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `campanas_marketing` (
  `id_campana` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `objetivo` text NOT NULL,
  `tipo_campana` varchar(50) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `estado` enum('planificacion','activa','pausada','finalizada','cancelada') NOT NULL DEFAULT 'planificacion',
  `presupuesto` decimal(12,2) DEFAULT NULL,
  `gasto_actual` decimal(12,2) DEFAULT NULL,
  `publico_objetivo` text DEFAULT NULL,
  `segmentacion_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`segmentacion_json`)),
  `canales` varchar(255) DEFAULT NULL,
  `materiales_url` varchar(255) DEFAULT NULL,
  `metricas_objetivo` text DEFAULT NULL,
  `resultados_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`resultados_json`)),
  `notas` text DEFAULT NULL,
  `responsable_id` int(10) unsigned DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_campana`),
  KEY `fk_campana_centro_idx` (`id_centro`),
  KEY `fk_campana_responsable_idx` (`responsable_id`),
  KEY `fk_campana_creador_idx` (`creado_por`),
  KEY `idx_campana_tipo` (`tipo_campana`),
  KEY `idx_campana_fechas` (`fecha_inicio`,`fecha_fin`),
  KEY `idx_campana_estado` (`estado`),
  FULLTEXT KEY `idx_campana_busqueda` (`nombre`,`descripcion`,`objetivo`,`publico_objetivo`),
  CONSTRAINT `fk_campana_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_campana_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_campana_responsable` FOREIGN KEY (`responsable_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Campañas de marketing';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campanas_marketing`
--

LOCK TABLES `campanas_marketing` WRITE;
/*!40000 ALTER TABLE `campanas_marketing` DISABLE KEYS */;
/*!40000 ALTER TABLE `campanas_marketing` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `canales_comunicacion`
--

DROP TABLE IF EXISTS `canales_comunicacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `canales_comunicacion` (
  `id_canal` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `tipo` enum('email','sms','whatsapp','push','telegram','voz') NOT NULL,
  `proveedor` varchar(100) NOT NULL,
  `configuracion_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`configuracion_json`)),
  `credenciales_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`credenciales_json`)),
  `url_api` varchar(255) DEFAULT NULL,
  `remitente` varchar(100) DEFAULT NULL,
  `max_caracteres` int(10) unsigned DEFAULT NULL,
  `costo_unitario` decimal(10,4) DEFAULT NULL,
  `estado` enum('activo','inactivo','pruebas','error') NOT NULL DEFAULT 'activo',
  `fecha_ultima_prueba` datetime DEFAULT NULL,
  `resultado_prueba` varchar(255) DEFAULT NULL,
  `prioridad` int(10) unsigned NOT NULL DEFAULT 1,
  `limite_diario` int(10) unsigned DEFAULT NULL,
  `uso_diario` int(10) unsigned NOT NULL DEFAULT 0,
  `notas` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_canal`),
  KEY `fk_canal_centro_idx` (`id_centro`),
  KEY `fk_canal_creador_idx` (`creado_por`),
  KEY `idx_canal_tipo` (`tipo`),
  KEY `idx_canal_proveedor` (`proveedor`),
  KEY `idx_canal_estado` (`estado`),
  KEY `idx_canal_prioridad` (`prioridad`),
  CONSTRAINT `fk_canal_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_canal_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Canales de comunicación disponibles';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `canales_comunicacion`
--

LOCK TABLES `canales_comunicacion` WRITE;
/*!40000 ALTER TABLE `canales_comunicacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `canales_comunicacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `canales_promocion`
--

DROP TABLE IF EXISTS `canales_promocion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `canales_promocion` (
  `id_canal` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `credenciales_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`credenciales_json`)),
  `metricas_disponibles` varchar(255) DEFAULT NULL,
  `costo_mensual` decimal(10,2) DEFAULT NULL,
  `costo_por_click` decimal(10,2) DEFAULT NULL,
  `costo_por_impresion` decimal(10,2) DEFAULT NULL,
  `notas_configuracion` text DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `alcance_estimado` int(10) unsigned DEFAULT NULL,
  `publico_objetivo` varchar(255) DEFAULT NULL,
  `categorias` varchar(255) DEFAULT NULL,
  `tipo_contenido` varchar(100) DEFAULT NULL,
  `frecuencia_publicacion` varchar(50) DEFAULT NULL,
  `responsable_id` int(10) unsigned DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_canal`),
  KEY `fk_canalpromo_centro_idx` (`id_centro`),
  KEY `fk_canalpromo_responsable_idx` (`responsable_id`),
  KEY `fk_canalpromo_creador_idx` (`creado_por`),
  KEY `idx_canalpromo_tipo` (`tipo`),
  KEY `idx_canalpromo_activo` (`activo`),
  CONSTRAINT `fk_canalpromo_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_canalpromo_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_canalpromo_responsable` FOREIGN KEY (`responsable_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Canales de promoción disponibles';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `canales_promocion`
--

LOCK TABLES `canales_promocion` WRITE;
/*!40000 ALTER TABLE `canales_promocion` DISABLE KEYS */;
/*!40000 ALTER TABLE `canales_promocion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cancelaciones`
--

DROP TABLE IF EXISTS `cancelaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cancelaciones` (
  `id_cancelacion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_cita` int(10) unsigned NOT NULL,
  `fecha_cancelacion` datetime NOT NULL,
  `motivo` enum('paciente_solicita','medico_no_disponible','error_programacion','reprogramacion','otro') NOT NULL,
  `detalle_motivo` text DEFAULT NULL,
  `cobro_aplicado` decimal(10,2) DEFAULT NULL,
  `politica_aplicada` varchar(100) DEFAULT NULL,
  `notificada` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_notificacion` datetime DEFAULT NULL,
  `cancelado_por` int(10) unsigned NOT NULL,
  `cancelado_por_tipo` enum('medico','secretaria','administrativo','paciente','sistema') NOT NULL,
  `observaciones` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_cancelacion`),
  KEY `fk_cancelacion_cita_idx` (`id_cita`),
  KEY `fk_cancelacion_usuario_idx` (`cancelado_por`),
  KEY `idx_cancelacion_fecha` (`fecha_cancelacion`),
  KEY `idx_cancelacion_motivo` (`motivo`),
  KEY `idx_cancelacion_tipo` (`cancelado_por_tipo`),
  CONSTRAINT `fk_cancelacion_cita` FOREIGN KEY (`id_cita`) REFERENCES `citas` (`id_cita`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cancelacion_usuario` FOREIGN KEY (`cancelado_por`) REFERENCES `usuarios` (`id_usuario`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro de citas canceladas';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cancelaciones`
--

LOCK TABLES `cancelaciones` WRITE;
/*!40000 ALTER TABLE `cancelaciones` DISABLE KEYS */;
INSERT INTO `cancelaciones` VALUES (1,3,'2025-10-30 10:20:16','reprogramacion','no va a antender',NULL,NULL,0,NULL,1,'administrativo',NULL,'2025-10-30 13:20:16');
/*!40000 ALTER TABLE `cancelaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `catalogo_items`
--

DROP TABLE IF EXISTS `catalogo_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `catalogo_items` (
  `id_item` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_catalogo` int(10) unsigned NOT NULL,
  `value` varchar(80) NOT NULL,
  `label` varchar(160) NOT NULL,
  `extra_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`extra_json`)),
  `orden` int(11) NOT NULL DEFAULT 100,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_item`),
  KEY `idx_items_catalogo` (`id_catalogo`),
  KEY `idx_items_orden` (`orden`),
  KEY `idx_items_activo` (`activo`),
  CONSTRAINT `fk_items_catalogo` FOREIGN KEY (`id_catalogo`) REFERENCES `catalogos` (`id_catalogo`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `catalogo_items`
--

LOCK TABLES `catalogo_items` WRITE;
/*!40000 ALTER TABLE `catalogo_items` DISABLE KEYS */;
INSERT INTO `catalogo_items` VALUES (1,1,'rut','RUT (Chile)',NULL,10,1,'2025-10-31 12:52:32','2025-10-31 12:52:32'),(2,1,'passport','Pasaporte',NULL,20,1,'2025-10-31 12:52:32','2025-10-31 12:52:32'),(3,2,'masculino','Masculino',NULL,10,1,'2025-10-31 12:52:32','2025-10-31 12:52:32'),(4,2,'femenino','Femenino',NULL,20,1,'2025-10-31 12:52:32','2025-10-31 12:52:32');
/*!40000 ALTER TABLE `catalogo_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `catalogos`
--

DROP TABLE IF EXISTS `catalogos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `catalogos` (
  `id_catalogo` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `slug` varchar(80) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_catalogo`),
  UNIQUE KEY `ux_catalogos_slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `catalogos`
--

LOCK TABLES `catalogos` WRITE;
/*!40000 ALTER TABLE `catalogos` DISABLE KEYS */;
INSERT INTO `catalogos` VALUES (1,'tipos_documento','Tipos de documento',NULL,1),(2,'generos','Géneros',NULL,1),(3,'estados_civiles','Estados civiles',NULL,1),(4,'grupos_sanguineos','Grupos sanguíneos',NULL,1),(5,'estados_paciente','Estados del paciente',NULL,1),(6,'preferencias_contacto','Preferencias de contacto',NULL,1),(7,'niveles_privacidad','Niveles de privacidad',NULL,1),(8,'clasificaciones_riesgo','Clasificaciones de riesgo',NULL,1),(9,'lateralidades','Lateralidad',NULL,1),(10,'niveles_educacion','Niveles de educación',NULL,1),(11,'idiomas','Idiomas',NULL,1),(12,'metodos_verificacion','Métodos de verificación',NULL,1);
/*!40000 ALTER TABLE `catalogos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias_recursos`
--

DROP TABLE IF EXISTS `categorias_recursos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categorias_recursos` (
  `id_categoria` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `id_categoria_padre` int(10) unsigned DEFAULT NULL,
  `nivel` int(10) unsigned NOT NULL DEFAULT 1,
  `icono_url` varchar(255) DEFAULT NULL,
  `color` varchar(7) DEFAULT '#3498db',
  `orden` int(10) unsigned DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_categoria`),
  KEY `fk_catrec_centro_idx` (`id_centro`),
  KEY `fk_catrec_padre_idx` (`id_categoria_padre`),
  KEY `fk_catrec_creador_idx` (`creado_por`),
  KEY `idx_catrec_nivel` (`nivel`),
  KEY `idx_catrec_orden` (`orden`),
  KEY `idx_catrec_activo` (`activo`),
  CONSTRAINT `fk_catrec_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_catrec_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_catrec_padre` FOREIGN KEY (`id_categoria_padre`) REFERENCES `categorias_recursos` (`id_categoria`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Categorización de recursos educativos';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias_recursos`
--

LOCK TABLES `categorias_recursos` WRITE;
/*!40000 ALTER TABLE `categorias_recursos` DISABLE KEYS */;
/*!40000 ALTER TABLE `categorias_recursos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `centros_medicos`
--

DROP TABLE IF EXISTS `centros_medicos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `centros_medicos` (
  `id_centro` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `pais` varchar(100) DEFAULT NULL,
  `razon_social` varchar(150) NOT NULL,
  `rut` varchar(12) NOT NULL,
  `direccion` varchar(200) NOT NULL,
  `ciudad` varchar(100) NOT NULL,
  `region` varchar(100) NOT NULL,
  `comuna` varchar(100) DEFAULT NULL,
  `codigo_postal` varchar(10) DEFAULT NULL,
  `telefono_principal` varchar(20) NOT NULL,
  `telefono_secundario` varchar(20) DEFAULT NULL,
  `email_contacto` varchar(100) NOT NULL,
  `email_secundario` varchar(100) DEFAULT NULL,
  `sitio_web` varchar(150) DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `horario_apertura` time NOT NULL,
  `horario_cierre` time NOT NULL,
  `dias_atencion` varchar(50) NOT NULL DEFAULT 'Lunes-Viernes',
  `plan` enum('basico','profesional','enterprise') DEFAULT 'basico',
  `estado` enum('activo','inactivo','suspendido') NOT NULL DEFAULT 'activo',
  `fecha_inicio_operacion` date NOT NULL,
  `capacidad_pacientes_dia` int(10) unsigned DEFAULT NULL,
  `nivel_complejidad` enum('baja','media','alta') NOT NULL DEFAULT 'media',
  `especializacion_principal` varchar(100) DEFAULT NULL,
  `tipo_establecimiento` enum('hospital','clinica','consultorio','laboratorio','centro_salud','otro') DEFAULT 'clinica',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` int(10) unsigned NOT NULL,
  `telefono` varchar(20) GENERATED ALWAYS AS (`telefono_principal`) VIRTUAL,
  PRIMARY KEY (`id_centro`),
  UNIQUE KEY `idx_centro_rut` (`rut`),
  KEY `idx_centro_region_ciudad` (`region`,`ciudad`),
  KEY `idx_centro_estado` (`estado`),
  KEY `idx_centro_especialidad` (`especializacion_principal`),
  FULLTEXT KEY `idx_centro_busqueda` (`nombre`,`razon_social`,`descripcion`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Información principal de los centros médicos';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `centros_medicos`
--

LOCK TABLES `centros_medicos` WRITE;
/*!40000 ALTER TABLE `centros_medicos` DISABLE KEYS */;
INSERT INTO `centros_medicos` VALUES (1,'Centro Médico AnyssaMed',NULL,'Hospital Regional de Curicó S.A.','76.543.210-9','Santa fe valles de don Felipe 167','Curicó','Región del Maule',NULL,'3340000','+56 75 2211222',NULL,'contacto@medisuite.cl',NULL,'https://infogessaludcurico.cl','/uploads/micrositios/1/logo-1761691032229.jpg','Centro de salud de alta complejidad que atiende a la provincia de Curicó y zonas aledañas.','08:00:00','20:00:00','Lunes a Domingo','basico','activo','2020-01-01',200,'alta','Medicina General','clinica','2025-10-27 02:19:33','2025-11-04 00:22:08',1,'+56 75 2211222'),(2,'Centro Médico Las Condes...',NULL,'Centro Médico Las Condes S.A.','76.123.456-7','Av. Las Condes 12345','Santiago','Región Metropolitana',NULL,'','+56912345678',NULL,'contacto@cmlascondes.cl',NULL,'','','','08:00:00','20:00:00','Lunes-Viernes','basico','activo','2020-01-15',15000,'alta','Medicina General','clinica','2025-10-27 15:43:12','2025-10-28 20:06:25',0,'+56912345678'),(3,'Clínica Alemana',NULL,'Clínica Alemana de Santiago S.A.','76.234.567-8','Av. Vitacura 5951','Santiago','Región Metropolitana',NULL,NULL,'+56922345678',NULL,'info@alemana.cl',NULL,NULL,NULL,NULL,'00:00:00','23:59:59','Lunes-Viernes','basico','activo','2018-03-20',200,'alta','Todas las Especialidades','clinica','2025-10-27 15:43:12','2025-10-27 15:43:12',0,'+56922345678'),(4,'Hospital Regional Valparaíso',NULL,'Hospital Regional Valparaíso','61.345.678-9','Av. Argentina 2085','Valparaíso','Región de Valparaíso',NULL,NULL,'+56932345678',NULL,'contacto@hospitalvalpo.cl',NULL,NULL,NULL,NULL,'00:00:00','23:59:59','Lunes-Viernes','basico','activo','2015-06-10',100,'media','Urgencias','clinica','2025-10-27 15:43:12','2025-10-27 15:43:12',0,'+56932345678'),(5,'Centro Médico Providencia',NULL,'Centro Médico Providencia Ltda.','76.456.789-0','Av. Providencia 2222','Santiago','Región Metropolitana',NULL,NULL,'+56942345678',NULL,'info@cmprov.cl',NULL,NULL,NULL,NULL,'08:30:00','19:00:00','Lunes-Viernes','basico','activo','2021-09-01',80,'media','Pediatría','clinica','2025-10-27 15:43:12','2025-10-27 15:43:12',0,'+56942345678'),(6,'Clínica Santa María',NULL,'Clínica Santa María S.A.','76.567.890-1','Av. Santa María 0500','Santiago','Región Metropolitana',NULL,NULL,'+56952345678',NULL,'contacto@clinicasantamaria.cl',NULL,NULL,NULL,NULL,'00:00:00','23:59:59','Lunes-Viernes','basico','activo','2017-11-15',180,'alta','Cardiología','clinica','2025-10-27 15:43:12','2025-10-27 15:43:12',0,'+56952345678'),(8,'Clínica Santa María Curicó',NULL,'Clínica Santa María Curicó Ltda.','77.234.567-8','Calle Peña 456','Curicó','Región del Maule',NULL,'3340000','+56752345679',NULL,'info@clinicasantamaria.cl',NULL,'https://clinicasantamaria.cl',NULL,'Clínica privada con especialidades médicas y quirúrgicas.','08:00:00','22:00:00','Lunes a Sábado','basico','activo','2018-03-15',150,'media','Medicina General','clinica','2025-11-04 00:22:19','2025-11-04 00:22:19',1,'+56752345679'),(9,'Centro Médico Familiar',NULL,'Centro Médico Familiar SpA','78.345.678-9','Av. Manso de Velasco 789','Curicó','Región del Maule',NULL,'3340000','+56752345680',NULL,'contacto@centrofamiliar.cl',NULL,'https://centrofamiliar.cl',NULL,'Centro médico ambulatorio con atención familiar integral.','09:00:00','19:00:00','Lunes a Viernes','basico','activo','2019-06-01',80,'baja','Medicina Familiar','clinica','2025-11-04 00:22:19','2025-11-04 00:22:19',1,'+56752345680'),(10,'CESFAM Norte Curicó',NULL,'Centro de Salud Familiar Norte','79.456.789-0','Calle Los Aromos 321','Curicó','Región del Maule',NULL,'3340000','+56752345681',NULL,'cesfamnorte@curico.cl',NULL,NULL,NULL,'Centro de atención primaria de salud municipal.','08:30:00','17:00:00','Lunes a Viernes','basico','activo','2015-01-10',120,'baja','Atención Primaria','clinica','2025-11-04 00:22:19','2025-11-04 00:22:19',1,'+56752345681');
/*!40000 ALTER TABLE `centros_medicos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `centros_planes`
--

DROP TABLE IF EXISTS `centros_planes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `centros_planes` (
  `id_plan` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `nombre_plan` enum('BÁSICO','PROFESIONAL','ENTERPRISE') NOT NULL DEFAULT 'BÁSICO',
  `fecha_inicio` date NOT NULL DEFAULT curdate(),
  `fecha_expiracion` date DEFAULT NULL,
  `estado` enum('activo','inactivo','expirado','suspendido') NOT NULL DEFAULT 'activo',
  `caracteristicas` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`caracteristicas`)),
  `precio_mensual` decimal(10,2) DEFAULT 0.00,
  `limite_usuarios` int(10) unsigned DEFAULT 5,
  `limite_pacientes` int(10) unsigned DEFAULT 500,
  `soporte_prioritario` tinyint(1) NOT NULL DEFAULT 0,
  `backup_diario` tinyint(1) NOT NULL DEFAULT 1,
  `ia_avanzada` tinyint(1) NOT NULL DEFAULT 0,
  `creado_por` int(10) unsigned DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_plan`),
  KEY `idx_centro_planes_centro` (`id_centro`),
  KEY `idx_centro_planes_estado` (`estado`),
  KEY `fk_centroplanes_creador` (`creado_por`),
  CONSTRAINT `fk_centroplanes_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_centroplanes_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Planes comerciales o de licencia asignados a centros médicos';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `centros_planes`
--

LOCK TABLES `centros_planes` WRITE;
/*!40000 ALTER TABLE `centros_planes` DISABLE KEYS */;
INSERT INTO `centros_planes` VALUES (1,1,'ENTERPRISE','2025-10-27',NULL,'activo',NULL,99000.00,100,10000,1,1,1,1,'2025-10-27 12:30:31','2025-10-27 12:30:31');
/*!40000 ALTER TABLE `centros_planes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `certificados_medicos`
--

DROP TABLE IF EXISTS `certificados_medicos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `certificados_medicos` (
  `id_certificado` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `id_paciente` int(10) unsigned NOT NULL,
  `id_medico` int(10) unsigned NOT NULL,
  `id_plantilla` int(10) unsigned DEFAULT NULL,
  `tipo_certificado` varchar(100) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `contenido` text NOT NULL,
  `diagnostico` varchar(255) DEFAULT NULL,
  `codigo_cie10` varchar(10) DEFAULT NULL,
  `fecha_emision` date NOT NULL,
  `estado` enum('emitido','anulado','reemplazado') NOT NULL DEFAULT 'emitido',
  `motivo_anulacion` text DEFAULT NULL,
  `numero_certificado` varchar(50) DEFAULT NULL,
  `url_documento` varchar(255) DEFAULT NULL,
  `codigo_verificacion` varchar(50) DEFAULT NULL,
  `id_historial` int(10) unsigned DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_certificado`),
  KEY `fk_certificado_centro_idx` (`id_centro`),
  KEY `fk_certificado_paciente_idx` (`id_paciente`),
  KEY `fk_certificado_medico_idx` (`id_medico`),
  KEY `fk_certificado_plantilla_idx` (`id_plantilla`),
  KEY `fk_certificado_historial_idx` (`id_historial`),
  KEY `idx_certificado_tipo` (`tipo_certificado`),
  KEY `idx_certificado_fecha` (`fecha_emision`),
  KEY `idx_certificado_estado` (`estado`),
  KEY `idx_certificado_numero` (`numero_certificado`),
  KEY `idx_certificado_verificacion` (`codigo_verificacion`),
  CONSTRAINT `fk_certificado_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_certificado_historial` FOREIGN KEY (`id_historial`) REFERENCES `historial_clinico` (`id_historial`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_certificado_medico` FOREIGN KEY (`id_medico`) REFERENCES `medicos` (`id_medico`) ON UPDATE CASCADE,
  CONSTRAINT `fk_certificado_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_certificado_plantilla` FOREIGN KEY (`id_plantilla`) REFERENCES `plantillas_documentos` (`id_plantilla`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Certificados médicos emitidos';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `certificados_medicos`
--

LOCK TABLES `certificados_medicos` WRITE;
/*!40000 ALTER TABLE `certificados_medicos` DISABLE KEYS */;
/*!40000 ALTER TABLE `certificados_medicos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_telemedicina`
--

DROP TABLE IF EXISTS `chat_telemedicina`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `chat_telemedicina` (
  `id_mensaje` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id_sesion` int(10) unsigned NOT NULL,
  `id_usuario` int(10) unsigned NOT NULL,
  `tipo_usuario` enum('medico','paciente','sistema') NOT NULL,
  `mensaje` text NOT NULL,
  `tipo_mensaje` enum('texto','archivo','imagen','sistema','alerta') NOT NULL DEFAULT 'texto',
  `archivo_url` varchar(500) DEFAULT NULL,
  `archivo_nombre` varchar(255) DEFAULT NULL,
  `archivo_tamano` int(10) unsigned DEFAULT NULL,
  `leido` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_lectura` datetime DEFAULT NULL,
  `fecha_envio` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_mensaje`),
  KEY `fk_chat_sesion_idx` (`id_sesion`),
  KEY `fk_chat_usuario_idx` (`id_usuario`),
  KEY `idx_chat_fecha` (`fecha_envio`),
  KEY `idx_chat_leido` (`leido`),
  CONSTRAINT `fk_chat_sesion` FOREIGN KEY (`id_sesion`) REFERENCES `sesiones_telemedicina` (`id_sesion`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_chat_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Chat de sesiones de telemedicina';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_telemedicina`
--

LOCK TABLES `chat_telemedicina` WRITE;
/*!40000 ALTER TABLE `chat_telemedicina` DISABLE KEYS */;
/*!40000 ALTER TABLE `chat_telemedicina` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `citas`
--

DROP TABLE IF EXISTS `citas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `citas` (
  `id_cita` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente` int(10) unsigned NOT NULL,
  `id_medico` int(10) unsigned NOT NULL,
  `id_centro` int(10) unsigned NOT NULL,
  `id_sucursal` int(10) unsigned DEFAULT NULL,
  `fecha_hora_inicio` datetime NOT NULL,
  `fecha_hora_fin` datetime NOT NULL,
  `duracion_minutos` int(10) unsigned NOT NULL,
  `tipo_cita` enum('primera_vez','control','procedimiento','urgencia','telemedicina') NOT NULL,
  `motivo` text DEFAULT NULL,
  `estado` enum('programada','confirmada','en_sala_espera','en_atencion','completada','cancelada','no_asistio','reprogramada') NOT NULL DEFAULT 'programada',
  `prioridad` enum('normal','alta','urgente') NOT NULL DEFAULT 'normal',
  `id_especialidad` int(10) unsigned DEFAULT NULL,
  `origen` enum('presencial','telefono','web','whatsapp','chatbot','app_movil') NOT NULL,
  `pagada` tinyint(1) NOT NULL DEFAULT 0,
  `monto` decimal(10,2) DEFAULT NULL,
  `id_sala` int(10) unsigned DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `notas_previas` text DEFAULT NULL,
  `notas_privadas` text DEFAULT NULL,
  `recordatorio_enviado` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_recordatorio` datetime DEFAULT NULL,
  `confirmacion_enviada` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_confirmacion` datetime DEFAULT NULL,
  `confirmado_por_paciente` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned NOT NULL,
  `modificado_por` int(10) unsigned DEFAULT NULL,
  `id_cita_anterior` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_cita`),
  KEY `fk_cita_paciente_idx` (`id_paciente`),
  KEY `fk_cita_medico_idx` (`id_medico`),
  KEY `fk_cita_centro_idx` (`id_centro`),
  KEY `fk_cita_sucursal_idx` (`id_sucursal`),
  KEY `fk_cita_especialidad_idx` (`id_especialidad`),
  KEY `fk_cita_sala_idx` (`id_sala`),
  KEY `fk_cita_creador_idx` (`creado_por`),
  KEY `fk_cita_modificador_idx` (`modificado_por`),
  KEY `fk_cita_anterior_idx` (`id_cita_anterior`),
  KEY `idx_cita_fecha_inicio` (`fecha_hora_inicio`),
  KEY `idx_cita_fecha_fin` (`fecha_hora_fin`),
  KEY `idx_cita_estado` (`estado`),
  KEY `idx_cita_tipo` (`tipo_cita`),
  KEY `idx_cita_prioridad` (`prioridad`),
  KEY `idx_cita_origen` (`origen`),
  KEY `idx_cita_pagada` (`pagada`),
  CONSTRAINT `fk_cita_anterior` FOREIGN KEY (`id_cita_anterior`) REFERENCES `citas` (`id_cita`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_cita_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cita_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON UPDATE CASCADE,
  CONSTRAINT `fk_cita_especialidad` FOREIGN KEY (`id_especialidad`) REFERENCES `especialidades` (`id_especialidad`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_cita_medico` FOREIGN KEY (`id_medico`) REFERENCES `medicos` (`id_medico`) ON UPDATE CASCADE,
  CONSTRAINT `fk_cita_modificador` FOREIGN KEY (`modificado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_cita_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cita_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursales` (`id_sucursal`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro de citas médicas';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `citas`
--

LOCK TABLES `citas` WRITE;
/*!40000 ALTER TABLE `citas` DISABLE KEYS */;
INSERT INTO `citas` VALUES (1,1,1,1,NULL,'2025-10-29 15:30:00','2025-10-29 16:00:00',30,'primera_vez','tood bien','programada','normal',NULL,'web',0,0.00,NULL,'',NULL,NULL,0,NULL,0,NULL,0,'2025-10-29 11:54:41','2025-10-30 16:23:49',1,1,NULL),(2,2,1,1,NULL,'2025-10-29 09:00:00','2025-10-29 09:30:00',30,'primera_vez','hola, ','programada','normal',NULL,'web',0,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,0,'2025-10-29 13:04:34','2025-10-29 13:04:34',1,NULL,NULL),(3,2,1,1,1,'2025-10-29 13:00:00','2025-10-29 13:30:00',30,'procedimiento','tood, bien...','reprogramada','normal',NULL,'web',0,0.00,NULL,'',NULL,NULL,0,NULL,0,NULL,0,'2025-10-29 13:24:51','2025-10-30 16:31:37',1,1,NULL),(4,2,1,1,1,'2025-10-29 16:00:00','2025-10-29 16:30:00',30,'procedimiento','tood, bien...','programada','normal',NULL,'web',0,0.00,NULL,'',NULL,NULL,0,NULL,0,NULL,0,'2025-10-30 16:31:37','2025-10-30 16:31:37',1,1,3),(5,2,9,1,NULL,'2025-11-05 09:00:00','2025-11-05 09:30:00',30,'primera_vez','quieor, ver el medico','programada','normal',NULL,'web',0,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,0,'2025-11-03 16:51:09','2025-11-03 16:51:09',1,NULL,NULL),(6,19,9,1,NULL,'2025-11-04 12:01:43','2025-11-04 12:31:43',30,'telemedicina','Control de presión arterial y ajuste de medicación','confirmada','normal',NULL,'presencial',0,NULL,NULL,NULL,'Paciente reporta mareos ocasionales',NULL,0,NULL,0,NULL,0,'2025-11-04 14:51:43','2025-11-04 14:51:43',0,NULL,NULL),(7,20,9,1,NULL,'2025-11-04 12:51:44','2025-11-04 13:21:44',30,'telemedicina','Consulta por síntomas respiratorios','confirmada','normal',NULL,'presencial',0,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,0,'2025-11-04 14:51:44','2025-11-04 14:51:44',0,NULL,NULL),(8,21,9,1,NULL,'2025-11-04 09:51:44','2025-11-04 10:21:44',30,'telemedicina','Control post-operatorio','completada','normal',NULL,'presencial',0,NULL,NULL,NULL,'Cirugía menor hace 2 semanas',NULL,0,NULL,0,NULL,0,'2025-11-04 14:51:44','2025-11-04 14:51:44',0,NULL,NULL),(9,22,9,1,NULL,'2025-11-04 13:51:44','2025-11-04 14:21:44',30,'telemedicina','Revisión de exámenes de laboratorio','confirmada','normal',NULL,'presencial',0,NULL,NULL,NULL,'Exámenes realizados hace 3 días',NULL,0,NULL,0,NULL,0,'2025-11-04 14:51:44','2025-11-04 14:51:44',0,NULL,NULL),(10,23,9,1,NULL,'2025-11-04 14:51:44','2025-11-04 15:21:44',30,'telemedicina','Control mensual de presión arterial','completada','normal',NULL,'presencial',0,NULL,NULL,NULL,'Paciente estable, última consulta hace 30 días',NULL,0,NULL,0,NULL,0,'2025-11-04 14:51:44','2025-11-05 15:48:59',0,NULL,NULL),(11,19,9,1,NULL,'2025-11-03 11:51:44','2025-11-03 12:21:44',30,'telemedicina','Control de rutina','completada','normal',NULL,'presencial',0,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,0,'2025-11-04 14:51:44','2025-11-04 14:51:44',0,NULL,NULL),(12,20,9,1,NULL,'2025-11-03 11:51:44','2025-11-03 12:21:44',30,'telemedicina','Seguimiento tratamiento','completada','normal',NULL,'presencial',0,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,0,'2025-11-04 14:51:44','2025-11-04 14:51:44',0,NULL,NULL),(13,20,9,1,NULL,'2025-11-03 11:53:35','2025-11-03 12:23:35',30,'telemedicina','Seguimiento tratamiento','completada','normal',NULL,'presencial',0,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,0,'2025-11-04 14:53:35','2025-11-04 14:53:35',5,NULL,NULL),(14,19,9,1,NULL,'2025-11-03 11:54:17','2025-11-03 12:24:17',30,'telemedicina','Control de rutina','completada','normal',NULL,'presencial',0,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,0,'2025-11-04 14:54:17','2025-11-04 14:54:17',5,NULL,NULL),(15,23,9,1,NULL,'2025-11-04 14:54:49','2025-11-04 15:24:49',30,'telemedicina','Control mensual de presión arterial','confirmada','normal',NULL,'presencial',0,NULL,NULL,NULL,'Paciente estable, última consulta hace 30 días',NULL,0,NULL,0,NULL,0,'2025-11-04 14:54:49','2025-11-04 14:54:49',5,NULL,NULL),(16,22,9,1,NULL,'2025-11-04 13:55:28','2025-11-04 14:25:28',30,'telemedicina','Revisión de exámenes de laboratorio','confirmada','normal',NULL,'presencial',0,NULL,NULL,NULL,'Exámenes realizados hace 3 días',NULL,0,NULL,0,NULL,0,'2025-11-04 14:55:28','2025-11-04 14:55:28',5,NULL,NULL),(17,23,9,1,NULL,'2025-11-04 14:56:14','2025-11-04 15:26:14',30,'telemedicina','Control mensual de presión arterial','confirmada','normal',NULL,'presencial',0,NULL,NULL,NULL,'Paciente estable, última consulta hace 30 días',NULL,0,NULL,0,NULL,0,'2025-11-04 14:56:14','2025-11-04 14:56:14',5,NULL,NULL),(18,22,9,1,NULL,'2025-11-04 13:56:45','2025-11-04 14:26:45',30,'telemedicina','Revisión de exámenes de laboratorio','confirmada','normal',NULL,'presencial',0,NULL,NULL,NULL,'Exámenes realizados hace 3 días',NULL,0,NULL,0,NULL,0,'2025-11-04 14:56:45','2025-11-04 14:56:45',5,NULL,NULL),(19,21,9,1,NULL,'2025-11-04 09:57:17','2025-11-04 10:27:17',30,'telemedicina','Control post-operatorio','completada','normal',NULL,'presencial',0,NULL,NULL,NULL,'Cirugía menor hace 2 semanas',NULL,0,NULL,0,NULL,0,'2025-11-04 14:57:17','2025-11-04 14:57:17',5,NULL,NULL),(32,22,9,1,NULL,'2025-11-07 09:00:00','2025-11-07 09:30:00',30,'telemedicina','dolor de cabeza','completada','urgente',NULL,'web',0,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,0,'2025-11-07 01:08:22','2025-11-07 01:26:11',5,NULL,NULL);
/*!40000 ALTER TABLE `citas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cobros_aseguradoras`
--

DROP TABLE IF EXISTS `cobros_aseguradoras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cobros_aseguradoras` (
  `id_cobro` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `id_aseguradora` int(10) unsigned NOT NULL,
  `numero_lote` varchar(50) DEFAULT NULL,
  `fecha_envio` date NOT NULL,
  `periodo_inicio` date NOT NULL,
  `periodo_fin` date NOT NULL,
  `estado` enum('pendiente','enviado','pagado','rechazado','parcial') NOT NULL DEFAULT 'pendiente',
  `monto_total` decimal(12,2) NOT NULL,
  `monto_pagado` decimal(12,2) NOT NULL DEFAULT 0.00,
  `fecha_pago` date DEFAULT NULL,
  `referencia_pago` varchar(100) DEFAULT NULL,
  `tipo_aseguradora` enum('FONASA','ISAPRE','OTRO') NOT NULL,
  `responsable_id` int(10) unsigned DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `documento_url` varchar(255) DEFAULT NULL,
  `cantidad_prestaciones` int(10) unsigned NOT NULL DEFAULT 0,
  `cantidad_prestaciones_aceptadas` int(10) unsigned NOT NULL DEFAULT 0,
  `cantidad_prestaciones_rechazadas` int(10) unsigned NOT NULL DEFAULT 0,
  `motivos_rechazo` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_cobro`),
  KEY `fk_cobro_centro_idx` (`id_centro`),
  KEY `fk_cobro_responsable_idx` (`responsable_id`),
  KEY `fk_cobro_creador_idx` (`creado_por`),
  KEY `idx_cobro_numero` (`numero_lote`),
  KEY `idx_cobro_fechas` (`fecha_envio`,`periodo_inicio`,`periodo_fin`),
  KEY `idx_cobro_estado` (`estado`),
  KEY `idx_cobro_tipo` (`tipo_aseguradora`),
  KEY `idx_cobro_pago` (`fecha_pago`),
  CONSTRAINT `fk_cobro_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cobro_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_cobro_responsable` FOREIGN KEY (`responsable_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Cobros a aseguradoras';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cobros_aseguradoras`
--

LOCK TABLES `cobros_aseguradoras` WRITE;
/*!40000 ALTER TABLE `cobros_aseguradoras` DISABLE KEYS */;
/*!40000 ALTER TABLE `cobros_aseguradoras` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comunas`
--

DROP TABLE IF EXISTS `comunas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `comunas` (
  `id_comuna` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_region` int(10) unsigned NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `codigo` varchar(10) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_comuna`),
  UNIQUE KEY `ux_comunas_codigo` (`codigo`),
  KEY `idx_comunas_region` (`id_region`),
  KEY `idx_comunas_codigo` (`codigo`),
  KEY `idx_comunas_activo` (`activo`),
  CONSTRAINT `fk_comunas_region` FOREIGN KEY (`id_region`) REFERENCES `regiones` (`id_region`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comunas`
--

LOCK TABLES `comunas` WRITE;
/*!40000 ALTER TABLE `comunas` DISABLE KEYS */;
INSERT INTO `comunas` VALUES (1,7,'Yerbas Buenas','07408',1,'2025-10-31 19:35:43','2025-10-31 19:35:43'),(2,7,'Villa Alegre','07407',1,'2025-10-31 19:35:43','2025-10-31 19:35:43'),(3,7,'San Javier','07406',1,'2025-10-31 19:35:43','2025-10-31 19:35:43'),(4,7,'Retiro','07405',1,'2025-10-31 19:35:43','2025-10-31 19:35:43'),(5,7,'Parral','07404',1,'2025-10-31 19:35:43','2025-10-31 19:35:43'),(6,7,'Longaví','07403',1,'2025-10-31 19:35:43','2025-10-31 19:35:43'),(7,7,'Colbún','07402',1,'2025-10-31 19:35:43','2025-10-31 19:35:43'),(8,7,'Linares','07401',1,'2025-10-31 19:35:43','2025-10-31 19:35:43'),(9,7,'Vichuquén','07309',1,'2025-10-31 19:35:43','2025-10-31 19:35:43'),(10,7,'Teno','07308',1,'2025-10-31 19:35:43','2025-10-31 19:35:43'),(11,7,'Sagrada Familia','07307',1,'2025-10-31 19:35:43','2025-10-31 19:35:43'),(12,7,'Romeral','07306',1,'2025-10-31 19:35:43','2025-10-31 19:35:43'),(13,7,'Rauco','07305',1,'2025-10-31 19:35:43','2025-10-31 19:35:43'),(14,7,'Molina','07304',1,'2025-10-31 19:35:43','2025-10-31 19:35:43'),(15,7,'Licantén','07303',1,'2025-10-31 19:35:43','2025-10-31 19:35:43'),(16,7,'Hualañé','07302',1,'2025-10-31 19:35:43','2025-10-31 19:35:43'),(17,7,'Curicó','07301',1,'2025-10-31 19:35:43','2025-10-31 19:35:43'),(18,7,'Pelluhue','07203',1,'2025-10-31 19:35:43','2025-10-31 19:35:43'),(19,7,'Chanco','07202',1,'2025-10-31 19:35:43','2025-10-31 19:35:43'),(20,7,'Cauquenes','07201',1,'2025-10-31 19:35:43','2025-10-31 19:35:43'),(21,7,'San Rafael','07110',1,'2025-10-31 19:35:43','2025-10-31 19:35:43'),(22,7,'San Clemente','07109',1,'2025-10-31 19:35:43','2025-10-31 19:35:43'),(23,7,'Río Claro','07108',1,'2025-10-31 19:35:43','2025-10-31 19:35:43'),(24,7,'Pencahue','07107',1,'2025-10-31 19:35:43','2025-10-31 19:35:43'),(25,7,'Pelarco','07106',1,'2025-10-31 19:35:43','2025-10-31 19:35:43'),(26,7,'Maule','07105',1,'2025-10-31 19:35:43','2025-10-31 19:35:43'),(27,7,'Empedrado','07104',1,'2025-10-31 19:35:43','2025-10-31 19:35:43'),(28,7,'Curepto','07103',1,'2025-10-31 19:35:43','2025-10-31 19:35:43'),(29,7,'Constitución','07102',1,'2025-10-31 19:35:43','2025-10-31 19:35:43'),(30,7,'Talca','07101',1,'2025-10-31 19:35:43','2025-10-31 19:35:43');
/*!40000 ALTER TABLE `comunas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comunas_bak_20251031`
--

DROP TABLE IF EXISTS `comunas_bak_20251031`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `comunas_bak_20251031` (
  `id_comuna` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_region` int(10) unsigned NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `codigo` varchar(10) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_comuna`),
  UNIQUE KEY `ux_comunas_codigo` (`codigo`),
  KEY `idx_comunas_region` (`id_region`),
  KEY `idx_comunas_codigo` (`codigo`),
  KEY `idx_comunas_activo` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comunas_bak_20251031`
--

LOCK TABLES `comunas_bak_20251031` WRITE;
/*!40000 ALTER TABLE `comunas_bak_20251031` DISABLE KEYS */;
/*!40000 ALTER TABLE `comunas_bak_20251031` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comunidades_pacientes`
--

DROP TABLE IF EXISTS `comunidades_pacientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `comunidades_pacientes` (
  `id_comunidad` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text NOT NULL,
  `tipo` enum('grupo_apoyo','foro','taller','curso','comunidad_virtual') NOT NULL,
  `enfoque` varchar(100) DEFAULT NULL,
  `patologia_relacionada` varchar(100) DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `es_permanente` tinyint(1) NOT NULL DEFAULT 1,
  `periodicidad` varchar(50) DEFAULT NULL,
  `horario` varchar(100) DEFAULT NULL,
  `ubicacion` varchar(255) DEFAULT NULL,
  `es_virtual` tinyint(1) NOT NULL DEFAULT 0,
  `url_virtual` varchar(255) DEFAULT NULL,
  `moderador_id` int(10) unsigned DEFAULT NULL,
  `profesional_responsable_id` int(10) unsigned DEFAULT NULL,
  `capacidad_maxima` int(10) unsigned DEFAULT NULL,
  `capacidad_actual` int(10) unsigned NOT NULL DEFAULT 0,
  `requisitos` text DEFAULT NULL,
  `estado` enum('planificacion','activa','pausada','finalizada') NOT NULL DEFAULT 'planificacion',
  `reglas` text DEFAULT NULL,
  `recursos_url` varchar(255) DEFAULT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_comunidad`),
  KEY `fk_comunidad_centro_idx` (`id_centro`),
  KEY `fk_comunidad_moderador_idx` (`moderador_id`),
  KEY `fk_comunidad_responsable_idx` (`profesional_responsable_id`),
  KEY `fk_comunidad_creador_idx` (`creado_por`),
  KEY `idx_comunidad_tipo` (`tipo`),
  KEY `idx_comunidad_patologia` (`patologia_relacionada`),
  KEY `idx_comunidad_fechas` (`fecha_inicio`,`fecha_fin`),
  KEY `idx_comunidad_permanente` (`es_permanente`),
  KEY `idx_comunidad_virtual` (`es_virtual`),
  KEY `idx_comunidad_estado` (`estado`),
  CONSTRAINT `fk_comunidad_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_comunidad_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_comunidad_moderador` FOREIGN KEY (`moderador_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_comunidad_responsable` FOREIGN KEY (`profesional_responsable_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Comunidades de apoyo para pacientes';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comunidades_pacientes`
--

LOCK TABLES `comunidades_pacientes` WRITE;
/*!40000 ALTER TABLE `comunidades_pacientes` DISABLE KEYS */;
/*!40000 ALTER TABLE `comunidades_pacientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `condiciones_cronicas`
--

DROP TABLE IF EXISTS `condiciones_cronicas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `condiciones_cronicas` (
  `id_condicion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente` int(10) unsigned NOT NULL,
  `nombre_condicion` varchar(200) NOT NULL,
  `codigo_cie10` varchar(10) DEFAULT NULL,
  `fecha_diagnostico` date NOT NULL,
  `diagnosticado_por` int(10) unsigned DEFAULT NULL,
  `severidad` enum('leve','moderada','severa','critica') DEFAULT NULL,
  `estado` enum('activa','controlada','resuelta','en_tratamiento') NOT NULL DEFAULT 'activa',
  `requiere_monitoreo` tinyint(1) NOT NULL DEFAULT 1,
  `tratamiento_actual` text DEFAULT NULL,
  `medicamentos_asociados` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`medicamentos_asociados`)),
  `frecuencia_control` varchar(50) DEFAULT NULL COMMENT 'mensual, trimestral, etc',
  `ultima_evaluacion` date DEFAULT NULL,
  `proxima_evaluacion` date DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_condicion`),
  KEY `idx_condicion_paciente` (`id_paciente`,`estado`),
  KEY `idx_condicion_cie10` (`codigo_cie10`),
  CONSTRAINT `condiciones_cronicas_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Condiciones crónicas del paciente';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `condiciones_cronicas`
--

LOCK TABLES `condiciones_cronicas` WRITE;
/*!40000 ALTER TABLE `condiciones_cronicas` DISABLE KEYS */;
/*!40000 ALTER TABLE `condiciones_cronicas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configuraciones_centro`
--

DROP TABLE IF EXISTS `configuraciones_centro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `configuraciones_centro` (
  `id_configuracion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `clave` varchar(100) NOT NULL,
  `valor` text NOT NULL,
  `tipo_dato` enum('string','integer','float','boolean','json','datetime') NOT NULL DEFAULT 'string',
  `descripcion` varchar(255) DEFAULT NULL,
  `grupo` varchar(50) DEFAULT NULL,
  `modificable_por_centro` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `modificado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_configuracion`),
  UNIQUE KEY `idx_config_centro_clave` (`id_centro`,`clave`),
  UNIQUE KEY `uniq_centro_clave` (`id_centro`,`clave`),
  KEY `fk_config_centro_idx` (`id_centro`),
  KEY `fk_config_modificador_idx` (`modificado_por`),
  KEY `idx_config_grupo` (`grupo`),
  CONSTRAINT `fk_config_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_config_modificador` FOREIGN KEY (`modificado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=286 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Configuraciones personalizadas por centro médico';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuraciones_centro`
--

LOCK TABLES `configuraciones_centro` WRITE;
/*!40000 ALTER TABLE `configuraciones_centro` DISABLE KEYS */;
INSERT INTO `configuraciones_centro` VALUES (1,1,'banner_url','/uploads/micrositios/1/banner-1761752637623.jpg','string',NULL,'micrositio',1,'2025-10-28 21:54:17','2025-10-29 15:45:35',NULL),(2,1,'colores_tema','{\"primario\":\"#17b030\",\"secundario\":\"#281dc9\",\"acento\":\"#9e4a2e\"}','json',NULL,'micrositio',1,'2025-10-28 21:54:17','2025-10-29 15:45:35',NULL),(3,1,'mostrar_servicios','1','boolean',NULL,'micrositio',1,'2025-10-28 21:54:17','2025-10-29 15:45:35',NULL),(4,1,'mostrar_profesionales','1','boolean',NULL,'micrositio',1,'2025-10-28 21:54:17','2025-10-29 15:45:35',NULL),(5,1,'mostrar_promociones','1','boolean',NULL,'micrositio',1,'2025-10-28 21:54:17','2025-10-29 15:45:35',NULL),(6,1,'mostrar_resenas','1','boolean',NULL,'micrositio',1,'2025-10-28 21:54:17','2025-10-29 15:45:35',NULL),(7,1,'mostrar_galeria','1','boolean',NULL,'micrositio',1,'2025-10-28 21:54:17','2025-10-29 15:45:35',NULL),(8,1,'mostrar_blog','1','boolean',NULL,'micrositio',1,'2025-10-28 21:54:17','2025-10-29 15:45:35',NULL),(9,1,'facebook_url','https://www.facebook.com/?locale=es_LA','string',NULL,'micrositio',1,'2025-10-28 21:54:17','2025-10-29 15:45:35',NULL),(10,1,'instagram_url','https://www.facebook.com/?locale=es_LA','string',NULL,'micrositio',1,'2025-10-28 21:54:17','2025-10-29 15:45:35',NULL),(11,1,'twitter_url','https://www.facebook.com/?locale=es_LA','string',NULL,'micrositio',1,'2025-10-28 21:54:17','2025-10-29 15:45:35',NULL),(12,1,'linkedin_url','https://www.facebook.com/?locale=es_LA','string',NULL,'micrositio',1,'2025-10-28 21:54:17','2025-10-29 15:45:35',NULL),(13,1,'youtube_url','https://www.youtube.com/','string',NULL,'micrositio',1,'2025-10-28 21:54:17','2025-10-29 15:45:35',NULL),(14,1,'meta_titulo','Centro Médico AnyssaMed','string',NULL,'micrositio',1,'2025-10-28 21:54:17','2025-10-29 15:46:10',NULL),(15,1,'meta_descripcion','Centro Médico AnyssamEd es un espacio dedicado al bienestar integral de las personas, ofreciendo atención médica de calidad, con un equipo de profesionales comp','string',NULL,'micrositio',1,'2025-10-28 21:54:17','2025-10-29 15:46:10',NULL),(16,1,'meta_keywords','','string',NULL,'micrositio',1,'2025-10-28 21:54:17','2025-10-28 21:54:17',NULL),(17,1,'analytics_id','','string',NULL,'micrositio',1,'2025-10-28 21:54:17','2025-10-28 21:54:17',NULL),(18,1,'chat_widget_enabled','1','boolean',NULL,'micrositio',1,'2025-10-28 21:54:17','2025-10-29 15:45:35',NULL),(19,1,'booking_widget_enabled','1','boolean',NULL,'micrositio',1,'2025-10-28 21:54:17','2025-10-29 15:45:35',NULL);
/*!40000 ALTER TABLE `configuraciones_centro` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configuraciones_monitorizacion`
--

DROP TABLE IF EXISTS `configuraciones_monitorizacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `configuraciones_monitorizacion` (
  `id_configuracion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente` int(10) unsigned NOT NULL,
  `id_dispositivo_iot` int(10) unsigned DEFAULT NULL,
  `tipo_parametro` varchar(50) NOT NULL,
  `valor_minimo` decimal(10,2) DEFAULT NULL,
  `valor_maximo` decimal(10,2) DEFAULT NULL,
  `valor_objetivo` decimal(10,2) DEFAULT NULL,
  `umbral_alerta_bajo` decimal(10,2) DEFAULT NULL,
  `umbral_alerta_alto` decimal(10,2) DEFAULT NULL,
  `umbral_alerta_critico_bajo` decimal(10,2) DEFAULT NULL,
  `umbral_alerta_critico_alto` decimal(10,2) DEFAULT NULL,
  `frecuencia_lectura_minutos` int(10) unsigned DEFAULT NULL,
  `ventana_promedio_minutos` int(10) unsigned DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `notificar_paciente` tinyint(1) NOT NULL DEFAULT 1,
  `notificar_medico` tinyint(1) NOT NULL DEFAULT 1,
  `id_medico` int(10) unsigned DEFAULT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id_configuracion`),
  KEY `fk_config_monit_paciente_idx` (`id_paciente`),
  KEY `fk_config_monit_dispositivo_idx` (`id_dispositivo_iot`),
  KEY `fk_config_monit_medico_idx` (`id_medico`),
  KEY `fk_config_monit_creador_idx` (`creado_por`),
  KEY `idx_config_monit_tipo` (`tipo_parametro`),
  KEY `idx_config_monit_activo` (`activo`),
  KEY `idx_config_monit_fechas` (`fecha_inicio`,`fecha_fin`),
  CONSTRAINT `fk_config_monit_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON UPDATE CASCADE,
  CONSTRAINT `fk_config_monit_dispositivo` FOREIGN KEY (`id_dispositivo_iot`) REFERENCES `dispositivos_iot` (`id_dispositivo_iot`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_config_monit_medico` FOREIGN KEY (`id_medico`) REFERENCES `medicos` (`id_medico`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_config_monit_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Parámetros de monitoreo para dispositivos IoT';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuraciones_monitorizacion`
--

LOCK TABLES `configuraciones_monitorizacion` WRITE;
/*!40000 ALTER TABLE `configuraciones_monitorizacion` DISABLE KEYS */;
INSERT INTO `configuraciones_monitorizacion` VALUES (1,1,1,'presion_sistolica',90.00,140.00,120.00,100.00,135.00,90.00,160.00,60,180,1,1,1,1,'2024-01-15',NULL,NULL,'2025-11-04 00:39:07','2025-11-04 00:39:07',1),(2,1,1,'presion_diastolica',60.00,90.00,80.00,65.00,85.00,60.00,100.00,60,180,1,1,1,1,'2024-01-15',NULL,NULL,'2025-11-04 00:39:07','2025-11-04 00:39:07',1),(3,1,1,'frecuencia_cardiaca',60.00,100.00,75.00,65.00,95.00,50.00,120.00,60,180,1,1,1,1,'2024-01-15',NULL,NULL,'2025-11-04 00:39:07','2025-11-04 00:39:07',1),(4,2,2,'glucosa_ayunas',70.00,130.00,100.00,80.00,125.00,70.00,180.00,30,60,1,1,1,1,'2024-01-20',NULL,NULL,'2025-11-04 00:39:07','2025-11-04 00:39:07',1),(5,2,2,'glucosa_postprandial',70.00,180.00,140.00,100.00,170.00,70.00,250.00,30,60,1,1,1,1,'2024-01-20',NULL,NULL,'2025-11-04 00:39:07','2025-11-04 00:39:07',1),(6,5,3,'presion_sistolica',90.00,140.00,120.00,100.00,135.00,90.00,160.00,60,180,1,1,1,1,'2024-02-18',NULL,NULL,'2025-11-04 00:39:07','2025-11-04 00:39:07',1),(7,5,3,'presion_diastolica',60.00,90.00,80.00,65.00,85.00,60.00,100.00,60,180,1,1,1,1,'2024-02-18',NULL,NULL,'2025-11-04 00:39:07','2025-11-04 00:39:07',1),(8,8,5,'saturacion_oxigeno',92.00,100.00,98.00,93.00,100.00,88.00,100.00,120,240,1,1,1,1,'2024-03-15',NULL,NULL,'2025-11-04 00:39:07','2025-11-04 00:39:07',1),(9,8,5,'frecuencia_respiratoria',12.00,20.00,16.00,14.00,18.00,10.00,30.00,120,240,1,1,1,1,'2024-03-15',NULL,NULL,'2025-11-04 00:39:07','2025-11-04 00:39:07',1),(10,14,7,'peso',70.00,85.00,78.00,75.00,82.00,65.00,95.00,1440,10080,1,1,1,1,'2024-05-01',NULL,NULL,'2025-11-04 00:39:07','2025-11-04 00:39:07',1),(11,14,7,'imc',20.00,27.00,24.00,22.00,26.00,18.00,30.00,1440,10080,1,1,1,1,'2024-05-01',NULL,NULL,'2025-11-04 00:39:07','2025-11-04 00:39:07',1);
/*!40000 ALTER TABLE `configuraciones_monitorizacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configuraciones_sistema`
--

DROP TABLE IF EXISTS `configuraciones_sistema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `configuraciones_sistema` (
  `id_configuracion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned DEFAULT NULL,
  `id_sucursal` int(10) unsigned DEFAULT NULL,
  `id_usuario` int(10) unsigned DEFAULT NULL,
  `clave` varchar(100) NOT NULL,
  `valor` text NOT NULL,
  `tipo_dato` enum('string','integer','float','boolean','json','array','date','datetime') NOT NULL DEFAULT 'string',
  `descripcion` text DEFAULT NULL,
  `categoria` varchar(50) NOT NULL,
  `nivel` enum('sistema','centro','sucursal','usuario') NOT NULL DEFAULT 'sistema',
  `visible` tinyint(1) NOT NULL DEFAULT 1,
  `editable` tinyint(1) NOT NULL DEFAULT 1,
  `es_sensible` tinyint(1) NOT NULL DEFAULT 0,
  `valor_defecto` text DEFAULT NULL,
  `validacion` varchar(255) DEFAULT NULL,
  `rango_minimo` varchar(50) DEFAULT NULL,
  `rango_maximo` varchar(50) DEFAULT NULL,
  `opciones` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `modificado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_configuracion`),
  KEY `fk_confsis_centro_idx` (`id_centro`),
  KEY `fk_confsis_sucursal_idx` (`id_sucursal`),
  KEY `fk_confsis_usuario_idx` (`id_usuario`),
  KEY `fk_confsis_modificador_idx` (`modificado_por`),
  KEY `idx_confsis_clave` (`clave`),
  KEY `idx_confsis_tipo` (`tipo_dato`),
  KEY `idx_confsis_categoria` (`categoria`),
  KEY `idx_confsis_nivel` (`nivel`),
  KEY `idx_confsis_visible` (`visible`),
  KEY `idx_confsis_editable` (`editable`),
  KEY `idx_confsis_sensible` (`es_sensible`),
  CONSTRAINT `fk_confsis_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_confsis_modificador` FOREIGN KEY (`modificado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_confsis_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursales` (`id_sucursal`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_confsis_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Configuraciones globales del sistema';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuraciones_sistema`
--

LOCK TABLES `configuraciones_sistema` WRITE;
/*!40000 ALTER TABLE `configuraciones_sistema` DISABLE KEYS */;
INSERT INTO `configuraciones_sistema` VALUES (1,NULL,NULL,NULL,'uptime_sistema','99.97','string',NULL,'','sistema',1,1,0,NULL,NULL,NULL,NULL,NULL,'2025-10-27 12:13:20','2025-10-27 12:13:20',NULL),(2,NULL,NULL,NULL,'espacio_usado_gb','32.5','string',NULL,'','sistema',1,1,0,NULL,NULL,NULL,NULL,NULL,'2025-10-27 12:13:20','2025-10-27 12:13:20',NULL),(3,NULL,NULL,NULL,'espacio_total_gb','256','string',NULL,'','sistema',1,1,0,NULL,NULL,NULL,NULL,NULL,'2025-10-27 12:13:20','2025-10-27 12:13:20',NULL),(4,NULL,NULL,NULL,'usuarios_conectados','4','string',NULL,'','sistema',1,1,0,NULL,NULL,NULL,NULL,NULL,'2025-10-27 12:13:20','2025-10-27 12:13:20',NULL),(5,NULL,NULL,NULL,'uptime_sistema','99.97','string',NULL,'rendimiento','sistema',1,1,0,NULL,NULL,NULL,NULL,NULL,'2025-10-27 12:14:03','2025-10-27 12:14:03',NULL),(6,NULL,NULL,NULL,'espacio_usado_gb','32.5','string',NULL,'almacenamiento','sistema',1,1,0,NULL,NULL,NULL,NULL,NULL,'2025-10-27 12:14:03','2025-10-27 12:14:03',NULL),(7,NULL,NULL,NULL,'espacio_total_gb','256','string',NULL,'almacenamiento','sistema',1,1,0,NULL,NULL,NULL,NULL,NULL,'2025-10-27 12:14:03','2025-10-27 12:14:03',NULL),(8,NULL,NULL,NULL,'usuarios_conectados','4','string',NULL,'sesiones','sistema',1,1,0,NULL,NULL,NULL,NULL,NULL,'2025-10-27 12:14:03','2025-10-27 12:14:03',NULL);
/*!40000 ALTER TABLE `configuraciones_sistema` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `confirmaciones`
--

DROP TABLE IF EXISTS `confirmaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `confirmaciones` (
  `id_confirmacion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_cita` int(10) unsigned NOT NULL,
  `tipo_confirmacion` enum('email','sms','whatsapp','llamada','presencial','app_movil') NOT NULL,
  `fecha_envio_solicitud` datetime NOT NULL,
  `fecha_confirmacion` datetime DEFAULT NULL,
  `confirmada` tinyint(1) DEFAULT NULL,
  `respuesta` text DEFAULT NULL,
  `canal_respuesta` varchar(50) DEFAULT NULL,
  `confirmado_por` int(10) unsigned DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_confirmacion`),
  KEY `fk_confirmacion_cita_idx` (`id_cita`),
  KEY `fk_confirmacion_usuario_idx` (`confirmado_por`),
  KEY `idx_confirmacion_tipo` (`tipo_confirmacion`),
  KEY `idx_confirmacion_confirmada` (`confirmada`),
  CONSTRAINT `fk_confirmacion_cita` FOREIGN KEY (`id_cita`) REFERENCES `citas` (`id_cita`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_confirmacion_usuario` FOREIGN KEY (`confirmado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Confirmaciones de asistencia a citas';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `confirmaciones`
--

LOCK TABLES `confirmaciones` WRITE;
/*!40000 ALTER TABLE `confirmaciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `confirmaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consentimientos`
--

DROP TABLE IF EXISTS `consentimientos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `consentimientos` (
  `id_consentimiento` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente` int(10) unsigned NOT NULL,
  `tipo_consentimiento` varchar(100) NOT NULL,
  `descripcion` text NOT NULL,
  `fecha_aceptacion` datetime NOT NULL,
  `ip_aceptacion` varchar(45) DEFAULT NULL,
  `documento_url` varchar(255) DEFAULT NULL,
  `estado` enum('activo','revocado','vencido') NOT NULL DEFAULT 'activo',
  `fecha_revocacion` datetime DEFAULT NULL,
  `motivo_revocacion` text DEFAULT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `version_documento` varchar(20) DEFAULT NULL,
  `testigo_id` int(10) unsigned DEFAULT NULL,
  `firma_paciente_url` varchar(255) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `registrado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_consentimiento`),
  KEY `fk_consentimiento_paciente_idx` (`id_paciente`),
  KEY `fk_consentimiento_testigo_idx` (`testigo_id`),
  KEY `fk_consentimiento_registrador_idx` (`registrado_por`),
  KEY `idx_consentimiento_tipo` (`tipo_consentimiento`),
  KEY `idx_consentimiento_estado` (`estado`),
  KEY `idx_consentimiento_vencimiento` (`fecha_vencimiento`),
  CONSTRAINT `fk_consentimiento_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_consentimiento_registrador` FOREIGN KEY (`registrado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_consentimiento_testigo` FOREIGN KEY (`testigo_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro de consentimientos firmados';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consentimientos`
--

LOCK TABLES `consentimientos` WRITE;
/*!40000 ALTER TABLE `consentimientos` DISABLE KEYS */;
/*!40000 ALTER TABLE `consentimientos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consentimientos_informados`
--

DROP TABLE IF EXISTS `consentimientos_informados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `consentimientos_informados` (
  `id_consentimiento_informado` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `id_paciente` int(10) unsigned NOT NULL,
  `id_medico` int(10) unsigned NOT NULL,
  `id_plantilla` int(10) unsigned DEFAULT NULL,
  `tipo_consentimiento` varchar(100) NOT NULL,
  `procedimiento` varchar(255) NOT NULL,
  `contenido` text NOT NULL,
  `fecha_firma` datetime NOT NULL,
  `ip_firma` varchar(45) DEFAULT NULL,
  `url_documento` varchar(255) DEFAULT NULL,
  `estado` enum('firmado','revocado','expirado','anulado') NOT NULL DEFAULT 'firmado',
  `motivo_revocacion` text DEFAULT NULL,
  `fecha_revocacion` datetime DEFAULT NULL,
  `id_procedimiento` int(10) unsigned DEFAULT NULL,
  `testigo1_nombre` varchar(200) DEFAULT NULL,
  `testigo1_identificacion` varchar(50) DEFAULT NULL,
  `testigo2_nombre` varchar(200) DEFAULT NULL,
  `testigo2_identificacion` varchar(50) DEFAULT NULL,
  `representante_legal` varchar(200) DEFAULT NULL,
  `representante_identificacion` varchar(50) DEFAULT NULL,
  `relacion_representante` varchar(50) DEFAULT NULL,
  `firma_paciente_url` varchar(255) DEFAULT NULL,
  `firma_medico_url` varchar(255) DEFAULT NULL,
  `firma_representante_url` varchar(255) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_consentimiento_informado`),
  KEY `fk_consinf_centro_idx` (`id_centro`),
  KEY `fk_consinf_paciente_idx` (`id_paciente`),
  KEY `fk_consinf_medico_idx` (`id_medico`),
  KEY `fk_consinf_plantilla_idx` (`id_plantilla`),
  KEY `fk_consinf_procedimiento_idx` (`id_procedimiento`),
  KEY `idx_consinf_tipo` (`tipo_consentimiento`),
  KEY `idx_consinf_fecha` (`fecha_firma`),
  KEY `idx_consinf_estado` (`estado`),
  CONSTRAINT `fk_consinf_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_consinf_medico` FOREIGN KEY (`id_medico`) REFERENCES `medicos` (`id_medico`) ON UPDATE CASCADE,
  CONSTRAINT `fk_consinf_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_consinf_plantilla` FOREIGN KEY (`id_plantilla`) REFERENCES `plantillas_documentos` (`id_plantilla`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_consinf_procedimiento` FOREIGN KEY (`id_procedimiento`) REFERENCES `procedimientos` (`id_procedimiento`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Formularios de consentimiento informado';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consentimientos_informados`
--

LOCK TABLES `consentimientos_informados` WRITE;
/*!40000 ALTER TABLE `consentimientos_informados` DISABLE KEYS */;
/*!40000 ALTER TABLE `consentimientos_informados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contactos_emergencia`
--

DROP TABLE IF EXISTS `contactos_emergencia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contactos_emergencia` (
  `id_contacto` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente` int(10) unsigned NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `relacion` varchar(50) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `celular` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `es_contacto_principal` tinyint(1) NOT NULL DEFAULT 0,
  `notas` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `registrado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_contacto`),
  KEY `fk_contacto_paciente_idx` (`id_paciente`),
  KEY `fk_contacto_registrador_idx` (`registrado_por`),
  KEY `idx_contacto_principal` (`es_contacto_principal`),
  CONSTRAINT `fk_contacto_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_contacto_registrador` FOREIGN KEY (`registrado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Contactos de emergencia de pacientes';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contactos_emergencia`
--

LOCK TABLES `contactos_emergencia` WRITE;
/*!40000 ALTER TABLE `contactos_emergencia` DISABLE KEYS */;
INSERT INTO `contactos_emergencia` VALUES (1,1,'Juan','González','Esposo','+56945678902','+56945678902','juan.gonzalez@email.com',NULL,1,NULL,'2025-11-04 00:24:32','2025-11-04 00:24:32',1),(2,2,'Carmen','Silva','Madre','+56956789013','+56956789013','carmen.silva@email.com',NULL,1,NULL,'2025-11-04 00:24:32','2025-11-04 00:24:32',1),(3,3,'Luis','Rodríguez','Hermano','+56967890124','+56967890124','luis.rodriguez@email.com',NULL,1,NULL,'2025-11-04 00:24:32','2025-11-04 00:24:32',1),(4,4,'Ana','Muñoz','Madre','+56978901235','+56978901235','ana.munoz@email.com',NULL,1,NULL,'2025-11-04 00:24:32','2025-11-04 00:24:32',1),(5,5,'Carlos','López','Esposo','+56989012346','+56989012346','carlos.lopez@email.com',NULL,1,NULL,'2025-11-04 00:24:32','2025-11-04 00:24:32',1),(6,6,'Patricia','Vargas','Esposa','+56990123457','+56990123457','patricia.vargas@email.com',NULL,1,NULL,'2025-11-04 00:24:32','2025-11-04 00:24:32',1),(7,7,'Jorge','Morales','Hijo','+56901234568','+56901234568','jorge.morales@email.com',NULL,1,NULL,'2025-11-04 00:24:32','2025-11-04 00:24:32',1),(8,8,'Rosa','Díaz','Madre','+56912345679','+56912345679','rosa.diaz@email.com',NULL,1,NULL,'2025-11-04 00:24:32','2025-11-04 00:24:32',1),(9,9,'Manuel','Pizarro','Esposo','+56923456790','+56923456790','manuel.pizarro@email.com',NULL,1,NULL,'2025-11-04 00:24:32','2025-11-04 00:24:32',1),(10,10,'Elena','Rojas','Hermana','+56934567891','+56934567891','elena.rojas@email.com',NULL,1,NULL,'2025-11-04 00:24:32','2025-11-04 00:24:32',1),(11,11,'Ricardo','Vega','Esposo','+56945678903','+56945678903','ricardo.vega@email.com',NULL,1,NULL,'2025-11-04 00:24:32','2025-11-04 00:24:32',1),(12,12,'Sofía','Espinoza','Hermana','+56956789014','+56956789014','sofia.espinoza@email.com',NULL,1,NULL,'2025-11-04 00:24:32','2025-11-04 00:24:32',1),(13,13,'Diego','Reyes','Pareja','+56967890125','+56967890125','diego.reyes@email.com',NULL,1,NULL,'2025-11-04 00:24:32','2025-11-04 00:24:32',1),(14,14,'Laura','Flores','Madre','+56978901236','+56978901236','laura.flores@email.com',NULL,1,NULL,'2025-11-04 00:24:32','2025-11-04 00:24:32',1),(15,15,'Andrés','Navarro','Esposo','+56989012347','+56989012347','andres.navarro@email.com',NULL,1,NULL,'2025-11-04 00:24:32','2025-11-04 00:24:32',1);
/*!40000 ALTER TABLE `contactos_emergencia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `convenios_institucionales`
--

DROP TABLE IF EXISTS `convenios_institucionales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `convenios_institucionales` (
  `id_convenio` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `id_institucion` int(10) unsigned DEFAULT NULL,
  `nombre_institucion` varchar(200) DEFAULT NULL,
  `tipo_institucion` varchar(50) NOT NULL,
  `tipo_convenio` varchar(50) NOT NULL,
  `descripcion` text NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `renovacion_automatica` tinyint(1) NOT NULL DEFAULT 0,
  `periodo_renovacion` varchar(20) DEFAULT NULL,
  `estado` enum('vigente','pendiente','vencido','cancelado','en_negociacion') NOT NULL DEFAULT 'vigente',
  `servicios_incluidos` text DEFAULT NULL,
  `condiciones_economicas` text DEFAULT NULL,
  `beneficios_pacientes` text DEFAULT NULL,
  `restricciones` text DEFAULT NULL,
  `contacto_institucion` varchar(100) DEFAULT NULL,
  `contacto_email` varchar(100) DEFAULT NULL,
  `contacto_telefono` varchar(20) DEFAULT NULL,
  `documentos_url` varchar(255) DEFAULT NULL,
  `responsable_id` int(10) unsigned DEFAULT NULL,
  `aprobador_id` int(10) unsigned DEFAULT NULL,
  `fecha_aprobacion` date DEFAULT NULL,
  `notas_internas` text DEFAULT NULL,
  `numero_convenio` varchar(50) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_convenio`),
  KEY `fk_convenioins_centro_idx` (`id_centro`),
  KEY `fk_convenioins_institucion_idx` (`id_institucion`),
  KEY `fk_convenioins_responsable_idx` (`responsable_id`),
  KEY `fk_convenioins_aprobador_idx` (`aprobador_id`),
  KEY `fk_convenioins_creador_idx` (`creado_por`),
  KEY `idx_convenioins_tipo_inst` (`tipo_institucion`),
  KEY `idx_convenioins_tipo_conv` (`tipo_convenio`),
  KEY `idx_convenioins_fechas` (`fecha_inicio`,`fecha_fin`),
  KEY `idx_convenioins_estado` (`estado`),
  KEY `idx_convenioins_renovacion` (`renovacion_automatica`),
  KEY `idx_convenioins_numero` (`numero_convenio`),
  FULLTEXT KEY `idx_convenioins_busqueda` (`nombre_institucion`,`descripcion`,`servicios_incluidos`,`beneficios_pacientes`),
  CONSTRAINT `fk_convenioins_aprobador` FOREIGN KEY (`aprobador_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_convenioins_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_convenioins_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_convenioins_institucion` FOREIGN KEY (`id_institucion`) REFERENCES `proveedores_externos` (`id_proveedor`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_convenioins_responsable` FOREIGN KEY (`responsable_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Convenios con otras instituciones';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `convenios_institucionales`
--

LOCK TABLES `convenios_institucionales` WRITE;
/*!40000 ALTER TABLE `convenios_institucionales` DISABLE KEYS */;
/*!40000 ALTER TABLE `convenios_institucionales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversaciones_chatbot`
--

DROP TABLE IF EXISTS `conversaciones_chatbot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `conversaciones_chatbot` (
  `id_conversacion` varchar(100) NOT NULL,
  `id_paciente` int(10) unsigned DEFAULT NULL,
  `id_usuario` int(10) unsigned DEFAULT NULL,
  `canal` enum('web','whatsapp','app','facebook','telegram') NOT NULL,
  `identificador_contacto` varchar(100) NOT NULL,
  `fecha_inicio` datetime NOT NULL,
  `fecha_ultima_interaccion` datetime NOT NULL,
  `fecha_fin` datetime DEFAULT NULL,
  `estado` enum('activa','en_espera','transferida','finalizada','abandonada') NOT NULL DEFAULT 'activa',
  `contexto_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`contexto_json`)),
  `intenciones_detectadas` text DEFAULT NULL,
  `entidades_detectadas` text DEFAULT NULL,
  `sentimiento` enum('positivo','neutral','negativo') DEFAULT NULL,
  `transferida_humano` tinyint(1) NOT NULL DEFAULT 0,
  `id_usuario_transferencia` int(10) unsigned DEFAULT NULL,
  `motivo_transferencia` text DEFAULT NULL,
  `puntuacion` int(10) unsigned DEFAULT NULL,
  `comentario_usuario` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_conversacion`),
  KEY `fk_chatbot_paciente_idx` (`id_paciente`),
  KEY `fk_chatbot_usuario_idx` (`id_usuario`),
  KEY `fk_chatbot_transferencia_idx` (`id_usuario_transferencia`),
  KEY `idx_chatbot_canal` (`canal`),
  KEY `idx_chatbot_contacto` (`identificador_contacto`),
  KEY `idx_chatbot_fechas` (`fecha_inicio`,`fecha_ultima_interaccion`),
  KEY `idx_chatbot_estado` (`estado`),
  KEY `idx_chatbot_transferida` (`transferida_humano`),
  KEY `idx_chatbot_sentimiento` (`sentimiento`),
  CONSTRAINT `fk_chatbot_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_chatbot_transferencia` FOREIGN KEY (`id_usuario_transferencia`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_chatbot_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro de interacciones con el chatbot';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversaciones_chatbot`
--

LOCK TABLES `conversaciones_chatbot` WRITE;
/*!40000 ALTER TABLE `conversaciones_chatbot` DISABLE KEYS */;
/*!40000 ALTER TABLE `conversaciones_chatbot` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `copias_seguridad`
--

DROP TABLE IF EXISTS `copias_seguridad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `copias_seguridad` (
  `id_copia` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned DEFAULT NULL,
  `fecha_hora` datetime NOT NULL,
  `nombre_archivo` varchar(255) NOT NULL,
  `ruta_almacenamiento` varchar(255) NOT NULL,
  `tipo` enum('completa','incremental','diferencial','parcial') NOT NULL,
  `tamano_bytes` bigint(20) unsigned DEFAULT NULL,
  `duracion_segundos` int(10) unsigned DEFAULT NULL,
  `estado` enum('completada','en_proceso','error','cancelada','restaurada') NOT NULL,
  `resultado` varchar(255) DEFAULT NULL,
  `mensaje_error` text DEFAULT NULL,
  `tablas_incluidas` text DEFAULT NULL,
  `hash_verificacion` varchar(255) DEFAULT NULL,
  `verificada` tinyint(1) NOT NULL DEFAULT 0,
  `resultado_verificacion` varchar(255) DEFAULT NULL,
  `retention_dias` int(10) unsigned NOT NULL DEFAULT 30,
  `expirada` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_expiracion` date DEFAULT NULL,
  `eliminada` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_eliminacion` datetime DEFAULT NULL,
  `automatica` tinyint(1) NOT NULL DEFAULT 1,
  `usuario_id` int(10) unsigned DEFAULT NULL,
  `version_sistema` varchar(50) DEFAULT NULL,
  `configuracion_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`configuracion_json`)),
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_copia`),
  KEY `fk_copia_centro_idx` (`id_centro`),
  KEY `fk_copia_usuario_idx` (`usuario_id`),
  KEY `idx_copia_fecha` (`fecha_hora`),
  KEY `idx_copia_tipo` (`tipo`),
  KEY `idx_copia_estado` (`estado`),
  KEY `idx_copia_verificada` (`verificada`),
  KEY `idx_copia_expirada` (`expirada`,`fecha_expiracion`),
  KEY `idx_copia_eliminada` (`eliminada`,`fecha_eliminacion`),
  KEY `idx_copia_automatica` (`automatica`),
  CONSTRAINT `fk_copia_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_copia_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Gestión de copias de seguridad';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `copias_seguridad`
--

LOCK TABLES `copias_seguridad` WRITE;
/*!40000 ALTER TABLE `copias_seguridad` DISABLE KEYS */;
/*!40000 ALTER TABLE `copias_seguridad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `costos_procedimientos`
--

DROP TABLE IF EXISTS `costos_procedimientos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `costos_procedimientos` (
  `id_costo` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `codigo_procedimiento` varchar(30) NOT NULL,
  `nombre_procedimiento` varchar(200) NOT NULL,
  `costo_base` decimal(12,2) NOT NULL,
  `impuesto_porcentaje` decimal(5,2) NOT NULL DEFAULT 19.00,
  `honorarios_profesionales` decimal(12,2) DEFAULT NULL,
  `insumos` decimal(12,2) DEFAULT NULL,
  `equipamiento` decimal(12,2) DEFAULT NULL,
  `precio_venta` decimal(12,2) NOT NULL,
  `precio_fonasa` decimal(12,2) DEFAULT NULL,
  `codigo_fonasa` varchar(20) DEFAULT NULL,
  `precio_isapre` decimal(12,2) DEFAULT NULL,
  `codigo_isapre` varchar(20) DEFAULT NULL,
  `moneda` varchar(3) NOT NULL DEFAULT 'CLP',
  `fecha_vigencia` date NOT NULL,
  `fecha_actualizacion` date NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `notas` text DEFAULT NULL,
  `id_especialidad` int(10) unsigned DEFAULT NULL,
  `duracion_estimada_minutos` int(10) unsigned DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_costo`),
  UNIQUE KEY `idx_costo_centro_codigo` (`id_centro`,`codigo_procedimiento`),
  KEY `fk_costo_centro_idx` (`id_centro`),
  KEY `fk_costo_especialidad_idx` (`id_especialidad`),
  KEY `fk_costo_creador_idx` (`creado_por`),
  KEY `idx_costo_codigo` (`codigo_procedimiento`),
  KEY `idx_costo_codigos` (`codigo_fonasa`,`codigo_isapre`),
  KEY `idx_costo_fechas` (`fecha_vigencia`,`fecha_actualizacion`),
  KEY `idx_costo_activo` (`activo`),
  CONSTRAINT `fk_costo_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_costo_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_costo_especialidad` FOREIGN KEY (`id_especialidad`) REFERENCES `especialidades` (`id_especialidad`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Costos por procedimiento';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `costos_procedimientos`
--

LOCK TABLES `costos_procedimientos` WRITE;
/*!40000 ALTER TABLE `costos_procedimientos` DISABLE KEYS */;
/*!40000 ALTER TABLE `costos_procedimientos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `credenciales_profesionales`
--

DROP TABLE IF EXISTS `credenciales_profesionales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `credenciales_profesionales` (
  `id_credencial` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_usuario` int(10) unsigned NOT NULL,
  `tipo_credencial` varchar(100) NOT NULL,
  `numero_credencial` varchar(100) NOT NULL,
  `entidad_emisora` varchar(100) NOT NULL,
  `fecha_emision` date NOT NULL,
  `fecha_expiracion` date DEFAULT NULL,
  `documento_url` varchar(255) DEFAULT NULL,
  `estado` enum('activo','inactivo','pendiente_verificacion','rechazado','expirado') NOT NULL DEFAULT 'pendiente_verificacion',
  `observaciones` text DEFAULT NULL,
  `verificado_por` int(10) unsigned DEFAULT NULL,
  `fecha_verificacion` datetime DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_credencial`),
  KEY `fk_credencial_usuario_idx` (`id_usuario`),
  KEY `fk_credencial_verificador_idx` (`verificado_por`),
  KEY `idx_credencial_tipo` (`tipo_credencial`),
  KEY `idx_credencial_estado` (`estado`),
  KEY `idx_credencial_expiracion` (`fecha_expiracion`),
  CONSTRAINT `fk_credencial_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_credencial_verificador` FOREIGN KEY (`verificado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Credenciales y certificaciones profesionales';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `credenciales_profesionales`
--

LOCK TABLES `credenciales_profesionales` WRITE;
/*!40000 ALTER TABLE `credenciales_profesionales` DISABLE KEYS */;
/*!40000 ALTER TABLE `credenciales_profesionales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departamentos`
--

DROP TABLE IF EXISTS `departamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `departamentos` (
  `id_departamento` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `id_sucursal` int(10) unsigned DEFAULT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `id_jefe_departamento` int(10) unsigned DEFAULT NULL,
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `telefono_contacto` varchar(20) DEFAULT NULL,
  `email_contacto` varchar(100) DEFAULT NULL,
  `codigo_departamento` varchar(10) NOT NULL,
  PRIMARY KEY (`id_departamento`),
  UNIQUE KEY `idx_departamento_codigo` (`id_centro`,`codigo_departamento`),
  KEY `fk_departamento_centro_idx` (`id_centro`),
  KEY `fk_departamento_sucursal_idx` (`id_sucursal`),
  KEY `fk_departamento_jefe_idx` (`id_jefe_departamento`),
  KEY `idx_departamento_estado` (`estado`),
  CONSTRAINT `fk_departamento_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_departamento_jefe` FOREIGN KEY (`id_jefe_departamento`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_departamento_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursales` (`id_sucursal`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Departamentos dentro de cada centro médico';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departamentos`
--

LOCK TABLES `departamentos` WRITE;
/*!40000 ALTER TABLE `departamentos` DISABLE KEYS */;
INSERT INTO `departamentos` VALUES (1,1,NULL,'Administración General','Gestión interna y coordinación de áreas del centro médico',NULL,'activo','2025-10-27 02:20:37','2025-10-27 02:20:37',NULL,NULL,'ADM01');
/*!40000 ALTER TABLE `departamentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `diagnosticos`
--

DROP TABLE IF EXISTS `diagnosticos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `diagnosticos` (
  `id_diagnostico` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente` int(10) unsigned NOT NULL,
  `id_historial` int(10) unsigned DEFAULT NULL,
  `id_medico` int(10) unsigned NOT NULL,
  `diagnostico` varchar(255) NOT NULL,
  `codigo_cie10` varchar(10) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_diagnostico` date NOT NULL,
  `tipo` enum('principal','secundario','presuntivo','definitivo','complicacion') NOT NULL DEFAULT 'principal',
  `estado` enum('activo','resuelto','cronico','recurrente','en_tratamiento') NOT NULL DEFAULT 'activo',
  `es_ges` tinyint(1) NOT NULL DEFAULT 0,
  `es_notificacion_obligatoria` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_notificacion` date DEFAULT NULL,
  `fecha_resolucion` date DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `modificado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_diagnostico`),
  KEY `fk_diagnostico_paciente_idx` (`id_paciente`),
  KEY `fk_diagnostico_historial_idx` (`id_historial`),
  KEY `fk_diagnostico_medico_idx` (`id_medico`),
  KEY `fk_diagnostico_modificador_idx` (`modificado_por`),
  KEY `idx_diagnostico_cie10` (`codigo_cie10`),
  KEY `idx_diagnostico_fecha` (`fecha_diagnostico`),
  KEY `idx_diagnostico_tipo` (`tipo`),
  KEY `idx_diagnostico_estado` (`estado`),
  KEY `idx_diagnostico_ges` (`es_ges`),
  KEY `idx_diagnostico_notificacion` (`es_notificacion_obligatoria`),
  CONSTRAINT `fk_diagnostico_historial` FOREIGN KEY (`id_historial`) REFERENCES `historial_clinico` (`id_historial`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_diagnostico_medico` FOREIGN KEY (`id_medico`) REFERENCES `medicos` (`id_medico`) ON UPDATE CASCADE,
  CONSTRAINT `fk_diagnostico_modificador` FOREIGN KEY (`modificado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_diagnostico_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Diagnósticos médicos de pacientes';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `diagnosticos`
--

LOCK TABLES `diagnosticos` WRITE;
/*!40000 ALTER TABLE `diagnosticos` DISABLE KEYS */;
/*!40000 ALTER TABLE `diagnosticos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `disponibilidad_medicos`
--

DROP TABLE IF EXISTS `disponibilidad_medicos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `disponibilidad_medicos` (
  `id_disponibilidad` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_medico` int(10) unsigned NOT NULL,
  `id_centro` int(10) unsigned NOT NULL,
  `id_sucursal` int(10) unsigned DEFAULT NULL,
  `dia_semana` enum('lunes','martes','miercoles','jueves','viernes','sabado','domingo') NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `fecha_especifica` date DEFAULT NULL,
  `es_recurrente` tinyint(1) NOT NULL DEFAULT 1,
  `tipo_atencion` enum('presencial','telemedicina','ambos') NOT NULL DEFAULT 'presencial',
  `max_pacientes` int(10) unsigned DEFAULT NULL,
  `estado` enum('activo','inactivo','bloqueado','vacaciones','capacitacion') NOT NULL DEFAULT 'activo',
  `motivo_bloqueo` varchar(255) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `modificado_por` int(10) unsigned DEFAULT NULL,
  `notas` text DEFAULT NULL,
  PRIMARY KEY (`id_disponibilidad`),
  KEY `fk_disponibilidad_medico_idx` (`id_medico`),
  KEY `fk_disponibilidad_centro_idx` (`id_centro`),
  KEY `fk_disponibilidad_sucursal_idx` (`id_sucursal`),
  KEY `fk_disponibilidad_modificador_idx` (`modificado_por`),
  KEY `idx_disponibilidad_dia` (`dia_semana`),
  KEY `idx_disponibilidad_fecha` (`fecha_especifica`),
  KEY `idx_disponibilidad_estado` (`estado`),
  KEY `idx_disponibilidad_tipo` (`tipo_atencion`),
  CONSTRAINT `fk_disponibilidad_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_disponibilidad_medico` FOREIGN KEY (`id_medico`) REFERENCES `medicos` (`id_medico`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_disponibilidad_modificador` FOREIGN KEY (`modificado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_disponibilidad_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursales` (`id_sucursal`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Disponibilidad horaria de médicos';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disponibilidad_medicos`
--

LOCK TABLES `disponibilidad_medicos` WRITE;
/*!40000 ALTER TABLE `disponibilidad_medicos` DISABLE KEYS */;
/*!40000 ALTER TABLE `disponibilidad_medicos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dispositivos_iot`
--

DROP TABLE IF EXISTS `dispositivos_iot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dispositivos_iot` (
  `id_dispositivo_iot` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned DEFAULT NULL,
  `id_paciente` int(11) DEFAULT NULL,
  `codigo_dispositivo` varchar(50) NOT NULL,
  `tipo_dispositivo` varchar(50) NOT NULL,
  `marca` varchar(50) NOT NULL,
  `modelo` varchar(50) NOT NULL,
  `numero_serie` varchar(50) DEFAULT NULL,
  `fecha_asignacion` date DEFAULT NULL,
  `estado` enum('activo','inactivo','en_reparacion','retirado') DEFAULT 'activo',
  `version_firmware` varchar(20) DEFAULT NULL,
  `identificador_unico` varchar(100) NOT NULL,
  `protocolo_comunicacion` varchar(50) NOT NULL,
  `conectividad` enum('bluetooth','wifi','lte','ethernet') DEFAULT 'bluetooth',
  `frecuencia_sincronizacion` int(10) unsigned DEFAULT NULL COMMENT 'Frecuencia en minutos',
  `ultima_sincronizacion` datetime DEFAULT NULL,
  `url_api` varchar(255) DEFAULT NULL,
  `token_api` varchar(255) DEFAULT NULL,
  `parametros_configuracion` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`parametros_configuracion`)),
  `ultima_conexion` datetime DEFAULT NULL,
  `estado_conexion` enum('conectado','desconectado','error','mantenimiento') NOT NULL DEFAULT 'desconectado',
  `estado_dispositivo` enum('activo','inactivo','baja_bateria','error','calibracion_pendiente') NOT NULL DEFAULT 'activo',
  `nivel_bateria` int(10) unsigned DEFAULT NULL,
  `bateria_porcentaje` tinyint(3) unsigned DEFAULT NULL,
  `fecha_ultima_calibracion` date DEFAULT NULL,
  `fecha_proxima_calibracion` date DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `registrado_por` int(10) unsigned DEFAULT NULL,
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_dispositivo_iot`),
  UNIQUE KEY `idx_iot_identificador` (`identificador_unico`),
  UNIQUE KEY `codigo_dispositivo` (`codigo_dispositivo`),
  KEY `fk_iot_centro_idx` (`id_centro`),
  KEY `fk_iot_registrador_idx` (`registrado_por`),
  KEY `idx_iot_tipo` (`tipo_dispositivo`),
  KEY `idx_iot_marca_modelo` (`marca`,`modelo`),
  KEY `idx_iot_conexion` (`estado_conexion`),
  KEY `idx_iot_estado` (`estado_dispositivo`),
  KEY `idx_iot_calibracion` (`fecha_proxima_calibracion`),
  CONSTRAINT `fk_iot_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_iot_registrador` FOREIGN KEY (`registrado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Catálogo de dispositivos IoT compatibles';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dispositivos_iot`
--

LOCK TABLES `dispositivos_iot` WRITE;
/*!40000 ALTER TABLE `dispositivos_iot` DISABLE KEYS */;
INSERT INTO `dispositivos_iot` VALUES (9,1,1,'TENS-001','tensiometro','Omron','HEM-7120','OM7120-2024-001','2024-01-15','activo','v2.1.0','IOT-TENS-001','','bluetooth',60,'2024-11-03 08:00:00',NULL,NULL,NULL,NULL,'desconectado','activo',NULL,85,NULL,NULL,'2025-11-04 00:38:54','2025-11-04 00:38:54',NULL,1),(10,1,2,'GLUC-001','glucometro','Accu-Chek','Guide','AC-GD-2024-001','2024-01-20','activo','v1.5.2','IOT-GLUC-001','','bluetooth',30,'2024-11-03 07:30:00',NULL,NULL,NULL,NULL,'desconectado','activo',NULL,92,NULL,NULL,'2025-11-04 00:38:54','2025-11-04 00:38:54',NULL,1),(11,1,5,'TENS-002','tensiometro','Omron','HEM-7120','OM7120-2024-002','2024-02-18','activo','v2.1.0','IOT-TENS-002','','bluetooth',60,'2024-11-03 06:45:00',NULL,NULL,NULL,NULL,'desconectado','activo',NULL,78,NULL,NULL,'2025-11-04 00:38:54','2025-11-04 00:38:54',NULL,1),(12,1,6,'TENS-003','tensiometro','Beurer','BM-27','BE-BM27-2024-001','2024-03-01','activo','v1.8.3','IOT-TENS-003','','bluetooth',60,'2024-11-03 09:15:00',NULL,NULL,NULL,NULL,'desconectado','activo',NULL,88,NULL,NULL,'2025-11-04 00:38:54','2025-11-04 00:38:54',NULL,1),(13,1,8,'OXI-001','oximetro','Beurer','PO-30','BE-PO30-2024-001','2024-03-15','activo','v1.2.0','IOT-OXI-001','','bluetooth',120,'2024-11-03 10:00:00',NULL,NULL,NULL,NULL,'desconectado','activo',NULL,95,NULL,NULL,'2025-11-04 00:38:54','2025-11-04 00:38:54',NULL,1),(14,2,2,'GLUC-002','glucometro','OneTouch','Verio Flex','OT-VF-2024-001','2024-04-01','activo','v2.0.1','IOT-GLUC-002','','bluetooth',30,'2024-11-03 08:30:00',NULL,NULL,NULL,NULL,'desconectado','activo',NULL,80,NULL,NULL,'2025-11-04 00:38:54','2025-11-04 00:38:54',NULL,1),(15,1,14,'BAS-001','bascula','Xiaomi','Mi Body Composition Scale 2','XM-BC2-2024-001','2024-05-01','activo','v3.1.5','IOT-BAS-001','','wifi',1440,'2024-11-03 06:00:00',NULL,NULL,NULL,NULL,'desconectado','activo',NULL,90,NULL,NULL,'2025-11-04 00:38:54','2025-11-04 00:38:54',NULL,1),(16,1,15,'MON-001','monitor_cardiaco','Polar','H10','PL-H10-2024-001','2024-05-10','activo','v4.2.1','IOT-MON-001','','bluetooth',60,'2024-11-03 07:00:00',NULL,NULL,NULL,NULL,'desconectado','activo',NULL,75,NULL,NULL,'2025-11-04 00:38:54','2025-11-04 00:38:54',NULL,1);
/*!40000 ALTER TABLE `dispositivos_iot` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documentos_adjuntos`
--

DROP TABLE IF EXISTS `documentos_adjuntos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `documentos_adjuntos` (
  `id_documento` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente` int(10) unsigned NOT NULL,
  `id_historial` int(10) unsigned DEFAULT NULL,
  `tipo_documento` varchar(100) NOT NULL,
  `nombre_archivo` varchar(255) NOT NULL,
  `url_archivo` varchar(255) NOT NULL,
  `tamano_bytes` int(10) unsigned DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `es_publico` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_documento` date DEFAULT NULL,
  `origen` enum('externo','interno','paciente') NOT NULL DEFAULT 'interno',
  `entidad_origen` varchar(100) DEFAULT NULL,
  `subido_por` int(10) unsigned NOT NULL,
  `fecha_subida` timestamp NOT NULL DEFAULT current_timestamp(),
  `etiquetas` varchar(255) DEFAULT NULL,
  `estado` enum('activo','archivado','eliminado') NOT NULL DEFAULT 'activo',
  PRIMARY KEY (`id_documento`),
  KEY `fk_documento_paciente_idx` (`id_paciente`),
  KEY `fk_documento_historial_idx` (`id_historial`),
  KEY `fk_documento_subidor_idx` (`subido_por`),
  KEY `idx_documento_tipo` (`tipo_documento`),
  KEY `idx_documento_fecha` (`fecha_documento`),
  KEY `idx_documento_origen` (`origen`),
  KEY `idx_documento_estado` (`estado`),
  FULLTEXT KEY `idx_documento_texto` (`nombre_archivo`,`descripcion`,`etiquetas`),
  CONSTRAINT `fk_documento_historial` FOREIGN KEY (`id_historial`) REFERENCES `historial_clinico` (`id_historial`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_documento_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_documento_subidor` FOREIGN KEY (`subido_por`) REFERENCES `usuarios` (`id_usuario`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Documentos adjuntos a fichas médicas';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documentos_adjuntos`
--

LOCK TABLES `documentos_adjuntos` WRITE;
/*!40000 ALTER TABLE `documentos_adjuntos` DISABLE KEYS */;
/*!40000 ALTER TABLE `documentos_adjuntos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documentos_compartidos`
--

DROP TABLE IF EXISTS `documentos_compartidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `documentos_compartidos` (
  `id_documento_compartido` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_documento` int(10) unsigned NOT NULL,
  `id_usuario_origen` int(10) unsigned NOT NULL,
  `id_usuario_destino` int(10) unsigned NOT NULL,
  `estado` enum('pendiente','revisado','firmado','rechazado') DEFAULT 'pendiente',
  `requiere_firma` tinyint(1) DEFAULT 0,
  `fecha_firma` datetime DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_documento_compartido`),
  KEY `idx_doc_comp_destino` (`id_usuario_destino`,`estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documentos_compartidos`
--

LOCK TABLES `documentos_compartidos` WRITE;
/*!40000 ALTER TABLE `documentos_compartidos` DISABLE KEYS */;
/*!40000 ALTER TABLE `documentos_compartidos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documentos_legales`
--

DROP TABLE IF EXISTS `documentos_legales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `documentos_legales` (
  `id_documento_legal` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `tipo_documento` varchar(100) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `contenido` text NOT NULL,
  `version` varchar(20) NOT NULL,
  `fecha_efectiva` date NOT NULL,
  `fecha_expiracion` date DEFAULT NULL,
  `url_documento` varchar(255) DEFAULT NULL,
  `estado` enum('vigente','obsoleto','borrador','en_revision') NOT NULL DEFAULT 'vigente',
  `es_publico` tinyint(1) NOT NULL DEFAULT 1,
  `requiere_aceptacion` tinyint(1) NOT NULL DEFAULT 0,
  `responsable_id` int(10) unsigned DEFAULT NULL,
  `aprobado_por_id` int(10) unsigned DEFAULT NULL,
  `fecha_aprobacion` date DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_documento_legal`),
  KEY `fk_doclegal_centro_idx` (`id_centro`),
  KEY `fk_doclegal_responsable_idx` (`responsable_id`),
  KEY `fk_doclegal_aprobador_idx` (`aprobado_por_id`),
  KEY `fk_doclegal_creador_idx` (`creado_por`),
  KEY `idx_doclegal_tipo` (`tipo_documento`),
  KEY `idx_doclegal_fechas` (`fecha_efectiva`,`fecha_expiracion`),
  KEY `idx_doclegal_estado` (`estado`),
  KEY `idx_doclegal_publico` (`es_publico`),
  KEY `idx_doclegal_aceptacion` (`requiere_aceptacion`),
  CONSTRAINT `fk_doclegal_aprobador` FOREIGN KEY (`aprobado_por_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_doclegal_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_doclegal_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_doclegal_responsable` FOREIGN KEY (`responsable_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Documentación legal de la institución';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documentos_legales`
--

LOCK TABLES `documentos_legales` WRITE;
/*!40000 ALTER TABLE `documentos_legales` DISABLE KEYS */;
/*!40000 ALTER TABLE `documentos_legales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dosis_medicamentos`
--

DROP TABLE IF EXISTS `dosis_medicamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dosis_medicamentos` (
  `id_dosis` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_medicamento` int(10) unsigned NOT NULL,
  `tipo_paciente` enum('adulto','pediatrico','geriatrico','neonato','embarazo','general') NOT NULL,
  `dosis_minima` decimal(10,3) NOT NULL,
  `dosis_maxima` decimal(10,3) NOT NULL,
  `unidad_dosis` varchar(20) NOT NULL,
  `frecuencia_minima` int(10) unsigned NOT NULL,
  `frecuencia_maxima` int(10) unsigned DEFAULT NULL,
  `unidad_frecuencia` varchar(20) NOT NULL,
  `duracion_minima` int(10) unsigned DEFAULT NULL,
  `duracion_maxima` int(10) unsigned DEFAULT NULL,
  `unidad_duracion` varchar(20) DEFAULT NULL,
  `peso_minimo` decimal(5,2) DEFAULT NULL,
  `peso_maximo` decimal(5,2) DEFAULT NULL,
  `edad_minima` int(10) unsigned DEFAULT NULL,
  `edad_maxima` int(10) unsigned DEFAULT NULL,
  `unidad_edad` varchar(10) DEFAULT NULL,
  `indicaciones_especificas` text DEFAULT NULL,
  `ajuste_insuficiencia_renal` text DEFAULT NULL,
  `ajuste_insuficiencia_hepatica` text DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_dosis`),
  KEY `fk_dosis_medicamento_idx` (`id_medicamento`),
  KEY `fk_dosis_creador_idx` (`creado_por`),
  KEY `idx_dosis_tipo` (`tipo_paciente`),
  KEY `idx_dosis_activo` (`activo`),
  CONSTRAINT `fk_dosis_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_dosis_medicamento` FOREIGN KEY (`id_medicamento`) REFERENCES `medicamentos` (`id_medicamento`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Esquemas de dosificación de medicamentos';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dosis_medicamentos`
--

LOCK TABLES `dosis_medicamentos` WRITE;
/*!40000 ALTER TABLE `dosis_medicamentos` DISABLE KEYS */;
/*!40000 ALTER TABLE `dosis_medicamentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `encuestas_satisfaccion`
--

DROP TABLE IF EXISTS `encuestas_satisfaccion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `encuestas_satisfaccion` (
  `id_encuesta` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `id_paciente` int(10) unsigned DEFAULT NULL,
  `id_cita` int(10) unsigned DEFAULT NULL,
  `id_medico` int(10) unsigned DEFAULT NULL,
  `tipo_encuesta` varchar(50) NOT NULL,
  `fecha_encuesta` datetime NOT NULL,
  `canal` enum('email','sms','web','app','telefono','presencial') NOT NULL,
  `valoracion_general` int(10) unsigned DEFAULT NULL,
  `escala_valoracion` varchar(20) DEFAULT '1-5',
  `tiempo_espera` int(10) unsigned DEFAULT NULL,
  `atencion_medica` int(10) unsigned DEFAULT NULL,
  `instalaciones` int(10) unsigned DEFAULT NULL,
  `limpieza` int(10) unsigned DEFAULT NULL,
  `trato_personal` int(10) unsigned DEFAULT NULL,
  `claridad_informacion` int(10) unsigned DEFAULT NULL,
  `resolucion_problema` int(10) unsigned DEFAULT NULL,
  `recomendaria` int(10) unsigned DEFAULT NULL,
  `comentarios` text DEFAULT NULL,
  `areas_mejora` text DEFAULT NULL,
  `estado` enum('completa','parcial','cancelada','invalida') NOT NULL DEFAULT 'completa',
  `respuestas_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`respuestas_json`)),
  `ip_respuesta` varchar(45) DEFAULT NULL,
  `dispositivo` varchar(100) DEFAULT NULL,
  `tiempo_respuesta_segundos` int(10) unsigned DEFAULT NULL,
  `analizada` tinyint(1) NOT NULL DEFAULT 0,
  `codigo_encuesta` varchar(50) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_encuesta`),
  KEY `fk_encuesta_centro_idx` (`id_centro`),
  KEY `fk_encuesta_paciente_idx` (`id_paciente`),
  KEY `fk_encuesta_cita_idx` (`id_cita`),
  KEY `fk_encuesta_medico_idx` (`id_medico`),
  KEY `idx_encuesta_tipo` (`tipo_encuesta`),
  KEY `idx_encuesta_fecha` (`fecha_encuesta`),
  KEY `idx_encuesta_canal` (`canal`),
  KEY `idx_encuesta_valoracion` (`valoracion_general`),
  KEY `idx_encuesta_estado` (`estado`),
  KEY `idx_encuesta_analizada` (`analizada`),
  KEY `idx_encuesta_codigo` (`codigo_encuesta`),
  CONSTRAINT `fk_encuesta_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_encuesta_cita` FOREIGN KEY (`id_cita`) REFERENCES `citas` (`id_cita`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_encuesta_medico` FOREIGN KEY (`id_medico`) REFERENCES `medicos` (`id_medico`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_encuesta_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Encuestas a pacientes';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `encuestas_satisfaccion`
--

LOCK TABLES `encuestas_satisfaccion` WRITE;
/*!40000 ALTER TABLE `encuestas_satisfaccion` DISABLE KEYS */;
/*!40000 ALTER TABLE `encuestas_satisfaccion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `equipos_trabajo`
--

DROP TABLE IF EXISTS `equipos_trabajo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `equipos_trabajo` (
  `id_equipo` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `id_sucursal` int(10) unsigned DEFAULT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `id_lider` int(10) unsigned NOT NULL,
  `fecha_creacion` date NOT NULL,
  `fecha_disolucion` date DEFAULT NULL,
  `estado` enum('activo','inactivo','temporal','disuelto') NOT NULL DEFAULT 'activo',
  `proposito` text DEFAULT NULL,
  `area_especialidad` varchar(100) DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_equipo`),
  KEY `fk_equipo_centro_idx` (`id_centro`),
  KEY `fk_equipo_sucursal_idx` (`id_sucursal`),
  KEY `fk_equipo_lider_idx` (`id_lider`),
  KEY `idx_equipo_estado` (`estado`),
  KEY `idx_equipo_especialidad` (`area_especialidad`),
  CONSTRAINT `fk_equipo_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_equipo_lider` FOREIGN KEY (`id_lider`) REFERENCES `usuarios` (`id_usuario`) ON UPDATE CASCADE,
  CONSTRAINT `fk_equipo_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursales` (`id_sucursal`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Equipos multidisciplinarios de trabajo';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equipos_trabajo`
--

LOCK TABLES `equipos_trabajo` WRITE;
/*!40000 ALTER TABLE `equipos_trabajo` DISABLE KEYS */;
/*!40000 ALTER TABLE `equipos_trabajo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `equipos_usuarios`
--

DROP TABLE IF EXISTS `equipos_usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `equipos_usuarios` (
  `id_equipo` int(10) unsigned NOT NULL,
  `id_usuario` int(10) unsigned NOT NULL,
  `rol_equipo` varchar(50) NOT NULL,
  `fecha_incorporacion` date NOT NULL,
  `fecha_salida` date DEFAULT NULL,
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo',
  `notas` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_equipo`,`id_usuario`),
  KEY `fk_equusu_usuario_idx` (`id_usuario`),
  KEY `idx_equusu_estado` (`estado`),
  CONSTRAINT `fk_equusu_equipo` FOREIGN KEY (`id_equipo`) REFERENCES `equipos_trabajo` (`id_equipo`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_equusu_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Miembros de equipos multidisciplinarios';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equipos_usuarios`
--

LOCK TABLES `equipos_usuarios` WRITE;
/*!40000 ALTER TABLE `equipos_usuarios` DISABLE KEYS */;
/*!40000 ALTER TABLE `equipos_usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `especialidades`
--

DROP TABLE IF EXISTS `especialidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `especialidades` (
  `id_especialidad` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `codigo` varchar(20) NOT NULL,
  `area_medica` varchar(50) DEFAULT NULL,
  `requiere_certificacion` tinyint(1) NOT NULL DEFAULT 1,
  `descripcion_pacientes` text DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `icono_url` varchar(255) DEFAULT NULL,
  `color` varchar(7) DEFAULT '#3498db',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_especialidad`),
  UNIQUE KEY `idx_especialidad_codigo` (`codigo`),
  UNIQUE KEY `idx_especialidad_nombre` (`nombre`),
  KEY `idx_especialidad_area` (`area_medica`),
  KEY `idx_especialidad_activo` (`activo`)
) ENGINE=InnoDB AUTO_INCREMENT=87 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Catálogo de especialidades médicas';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `especialidades`
--

LOCK TABLES `especialidades` WRITE;
/*!40000 ALTER TABLE `especialidades` DISABLE KEYS */;
INSERT INTO `especialidades` VALUES (44,'Medicina General','Atención médica integral básica para todas las edades.','MG001','Atención Primaria',0,'Para chequeos generales, controles y enfermedades comunes.',1,'fa-user-md','#3498db','2025-10-29 22:12:55'),(45,'Medicina Familiar','Seguimiento integral y continuo del grupo familiar.','MF001','Atención Primaria',1,'Ideal para familias que buscan atención médica continua.',1,'fa-users','#2980b9','2025-10-29 22:12:55'),(46,'Medicina Interna','Diagnóstico y tratamiento de enfermedades en adultos.','MI001','Clínica Médica',1,'Para adultos con enfermedades complejas o crónicas.',1,'fa-stethoscope','#2ecc71','2025-10-29 22:12:55'),(47,'Geriatría','Atención especializada a adultos mayores.','GE001','Clínica Médica',1,'Para pacientes mayores de 60 años.',1,'fa-blind','#16a085','2025-10-29 22:12:55'),(48,'Cardiología','Enfermedades del corazón y sistema circulatorio.','CA001','Clínica Médica',1,'Para control de presión, arritmias o chequeos cardíacos.',1,'fa-heartbeat','#e74c3c','2025-10-29 22:12:55'),(49,'Cirugía Cardiovascular','Cirugía del corazón y grandes vasos.','CC001','Cirugía',1,'Para intervenciones de corazón o bypass.',1,'fa-procedures','#c0392b','2025-10-29 22:12:55'),(50,'Neurología','Trastornos del sistema nervioso.','NE001','Clínica Médica',1,'Para dolores de cabeza, epilepsia, Parkinson, etc.',1,'fa-brain','#8e44ad','2025-10-29 22:12:55'),(51,'Psiquiatría','Diagnóstico y tratamiento de trastornos mentales.','PSQ001','Salud Mental',1,'Para depresión, ansiedad, trastorno bipolar, etc.',1,'fa-user-injured','#9b59b6','2025-10-29 22:12:55'),(52,'Neurocirugía','Cirugía del cerebro, médula espinal y nervios.','NC001','Cirugía',1,'Para tumores cerebrales o lesiones del sistema nervioso.',1,'fa-microscope','#7d3c98','2025-10-29 22:12:55'),(53,'Pediatría','Atención médica integral de niños y adolescentes.','PE001','Atención Infantil',1,'Para controles y enfermedades de niños.',1,'fa-baby','#f39c12','2025-10-29 22:12:55'),(54,'Neonatología','Atención de recién nacidos y prematuros.','NEO001','Atención Infantil',1,'Para bebés recién nacidos o prematuros.',1,'fa-seedling','#e67e22','2025-10-29 22:12:55'),(55,'Ginecología','Salud del sistema reproductor femenino.','GI001','Salud de la Mujer',1,'Para controles femeninos y salud reproductiva.',1,'fa-venus','#ff69b4','2025-10-29 22:12:55'),(56,'Obstetricia','Embarazo, parto y puerperio.','OB001','Salud de la Mujer',1,'Para control prenatal y parto.',1,'fa-baby-carriage','#ff85a2','2025-10-29 22:12:55'),(57,'Medicina Reproductiva','Fertilidad y tratamientos de reproducción asistida.','MR001','Salud de la Mujer',1,'Para estudios de fertilidad y embarazos planificados.',1,'fa-heart','#f06292','2025-10-29 22:12:55'),(58,'Urología','Sistema urinario y salud masculina.','UR001','Clínica Médica',1,'Para problemas urinarios o próstata.',1,'fa-toilet','#1abc9c','2025-10-29 22:12:55'),(59,'Andrología','Disfunciones sexuales y fertilidad masculina.','AN001','Clínica Médica',1,'Para control de fertilidad y salud sexual masculina.',1,'fa-mars','#16a085','2025-10-29 22:12:55'),(60,'Traumatología','Lesiones óseas y musculares.','TR001','Trauma y Rehabilitación',1,'Para fracturas o lesiones deportivas.',1,'fa-bone','#2c3e50','2025-10-29 22:12:55'),(61,'Ortopedia','Corrección de deformidades o lesiones del sistema músculo-esquelético.','OR001','Trauma y Rehabilitación',1,'Para tratamientos de columna, rodilla, cadera.',1,'fa-running','#34495e','2025-10-29 22:12:55'),(62,'Medicina Deportiva','Prevención y tratamiento de lesiones deportivas.','MD001','Trauma y Rehabilitación',1,'Para deportistas o actividad física intensa.',1,'fa-dumbbell','#27ae60','2025-10-29 22:12:55'),(63,'Dermatología','Piel, uñas y cabello.','DE001','Clínica Médica',1,'Para acné, alergias cutáneas o lunares.',1,'fa-allergies','#e67e22','2025-10-29 22:12:55'),(64,'Oftalmología','Vista y enfermedades oculares.','OF001','Clínica Médica',1,'Para control visual o cirugías oculares.',1,'fa-eye','#2980b9','2025-10-29 22:12:55'),(65,'Otorrinolaringología','Oído, nariz y garganta.','OT001','Clínica Médica',1,'Para sinusitis, pérdida auditiva o ronquidos.',1,'fa-ear-listen','#1abc9c','2025-10-29 22:12:55'),(66,'Odontología','Salud bucal general.','OD001','Odontología',1,'Para limpieza dental, caries y tratamientos.',1,'fa-tooth','#f1c40f','2025-10-29 22:12:55'),(67,'Cirugía Maxilofacial','Cirugía facial y bucal avanzada.','CMF001','Odontología',1,'Para fracturas faciales o implantes complejos.',1,'fa-user-nurse','#d35400','2025-10-29 22:12:55'),(68,'Gastroenterología','Tracto digestivo y enfermedades hepáticas.','GA001','Clínica Médica',1,'Para gastritis, colon irritable o hígado graso.',1,'fa-utensils','#27ae60','2025-10-29 22:12:55'),(69,'Hepatología','Especialización en enfermedades del hígado.','HE001','Clínica Médica',1,'Para hepatitis, cirrosis, hígado graso.',1,'fa-vial','#16a085','2025-10-29 22:12:55'),(70,'Nefrología','Riñones y vías urinarias.','NEF001','Clínica Médica',1,'Para insuficiencia renal o diálisis.',1,'fa-water','#2980b9','2025-10-29 22:12:55'),(71,'Endocrinología','Glándulas y metabolismo.','EN001','Clínica Médica',1,'Para diabetes, tiroides, obesidad.',1,'fa-apple-alt','#f39c12','2025-10-29 22:12:55'),(72,'Hematología','Enfermedades de la sangre.','HA001','Clínica Médica',1,'Para anemia o trastornos de coagulación.',1,'fa-tint','#c0392b','2025-10-29 22:12:55'),(73,'Oncología','Diagnóstico y tratamiento del cáncer.','ON001','Clínica Médica',1,'Para prevención o tratamiento de cáncer.',1,'fa-ribbon','#9b59b6','2025-10-29 22:12:55'),(74,'Inmunología','Sistema inmunitario y alergias.','IM001','Clínica Médica',1,'Para alergias, autoinmunes, inmunodeficiencias.',1,'fa-shield-virus','#8e44ad','2025-10-29 22:12:55'),(75,'Kinesiología','Rehabilitación física y funcional.','KI001','Rehabilitación',1,'Para terapias físicas o postoperatorias.',1,'fa-walking','#27ae60','2025-10-29 22:12:55'),(76,'Fisiatría','Recuperación funcional tras lesiones o enfermedades.','FI001','Rehabilitación',1,'Para rehabilitación integral.',1,'fa-person-walking','#1abc9c','2025-10-29 22:12:55'),(77,'Medicina de Urgencias','Atención inmediata a pacientes críticos.','MU001','Emergencias',1,'Para accidentes o emergencias médicas.',1,'fa-ambulance','#e74c3c','2025-10-29 22:12:55'),(78,'Anestesiología','Control del dolor y sedación en procedimientos.','ANES001','Cirugía',1,'Antes y durante cirugías o procedimientos invasivos.',1,'fa-syringe','#c0392b','2025-10-29 22:12:55'),(79,'Radiología','Diagnóstico por imágenes médicas.','RA001','Diagnóstico',1,'Para radiografías, TAC, resonancias.',1,'fa-x-ray','#3498db','2025-10-29 22:12:55'),(80,'Medicina Nuclear','Diagnóstico y tratamiento con isótopos radiactivos.','MN001','Diagnóstico',1,'Para estudios PET o gammagrafías.',1,'fa-radiation','#2980b9','2025-10-29 22:12:55'),(81,'Patología','Estudio de tejidos y análisis de laboratorio.','PA001','Laboratorio',1,'Análisis de biopsias o muestras.',1,'fa-vials','#8e44ad','2025-10-29 22:12:55'),(82,'Medicina del Trabajo','Prevención y control de enfermedades laborales.','MT001','Salud Ocupacional',1,'Para exámenes pre y post ocupacionales.',1,'fa-helmet-safety','#95a5a6','2025-10-29 22:12:55'),(83,'Salud Pública','Control epidemiológico y promoción de la salud.','SP001','Salud Comunitaria',1,'Para campañas y programas de salud.',1,'fa-globe','#27ae60','2025-10-29 22:12:55'),(84,'Infectología','Tratamiento de enfermedades infecciosas.','IN001','Clínica Médica',1,'Para VIH, COVID-19, hepatitis, etc.',1,'fa-virus','#e67e22','2025-10-29 22:12:55'),(85,'Toxicología','Diagnóstico y tratamiento de intoxicaciones.','TX001','Emergencias',1,'Para intoxicaciones o sobredosis.',1,'fa-skull-crossbones','#e74c3c','2025-10-29 22:12:55');
/*!40000 ALTER TABLE `especialidades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estadisticas_operativas`
--

DROP TABLE IF EXISTS `estadisticas_operativas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `estadisticas_operativas` (
  `id_estadistica` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `id_sucursal` int(10) unsigned DEFAULT NULL,
  `id_departamento` int(10) unsigned DEFAULT NULL,
  `tipo_estadistica` varchar(50) NOT NULL,
  `periodo` varchar(20) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `valor` decimal(15,4) NOT NULL,
  `unidad` varchar(20) DEFAULT NULL,
  `detalles_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`detalles_json`)),
  `notas` text DEFAULT NULL,
  `fecha_calculo` datetime NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_estadistica`),
  KEY `fk_estadistica_centro_idx` (`id_centro`),
  KEY `fk_estadistica_sucursal_idx` (`id_sucursal`),
  KEY `fk_estadistica_departamento_idx` (`id_departamento`),
  KEY `idx_estadistica_tipo` (`tipo_estadistica`),
  KEY `idx_estadistica_periodo` (`periodo`),
  KEY `idx_estadistica_fechas` (`fecha_inicio`,`fecha_fin`),
  CONSTRAINT `fk_estadistica_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_estadistica_departamento` FOREIGN KEY (`id_departamento`) REFERENCES `departamentos` (`id_departamento`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_estadistica_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursales` (`id_sucursal`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Estadísticas de operación pre-calculadas';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estadisticas_operativas`
--

LOCK TABLES `estadisticas_operativas` WRITE;
/*!40000 ALTER TABLE `estadisticas_operativas` DISABLE KEYS */;
/*!40000 ALTER TABLE `estadisticas_operativas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estadisticas_sesiones_telemedicina`
--

DROP TABLE IF EXISTS `estadisticas_sesiones_telemedicina`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `estadisticas_sesiones_telemedicina` (
  `id_estadistica` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id_sesion` int(10) unsigned NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `calidad_video` int(10) unsigned DEFAULT NULL COMMENT 'Porcentaje 0-100',
  `calidad_audio` int(10) unsigned DEFAULT NULL COMMENT 'Porcentaje 0-100',
  `latencia_ms` int(10) unsigned DEFAULT NULL,
  `ancho_banda_kbps` int(10) unsigned DEFAULT NULL,
  `fps_video` int(10) unsigned DEFAULT NULL,
  `resolucion_video` varchar(20) DEFAULT NULL COMMENT '1280x720, 1920x1080, etc.',
  `paquetes_perdidos` decimal(5,2) DEFAULT NULL COMMENT 'Porcentaje',
  `jitter_ms` int(10) unsigned DEFAULT NULL,
  `cpu_uso_porcentaje` decimal(5,2) DEFAULT NULL,
  `memoria_uso_mb` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_estadistica`),
  KEY `fk_estadistica_sesion_idx` (`id_sesion`),
  KEY `idx_estadistica_timestamp` (`timestamp`),
  CONSTRAINT `fk_estadistica_sesion` FOREIGN KEY (`id_sesion`) REFERENCES `sesiones_telemedicina` (`id_sesion`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Estadísticas técnicas de sesiones de telemedicina';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estadisticas_sesiones_telemedicina`
--

LOCK TABLES `estadisticas_sesiones_telemedicina` WRITE;
/*!40000 ALTER TABLE `estadisticas_sesiones_telemedicina` DISABLE KEYS */;
/*!40000 ALTER TABLE `estadisticas_sesiones_telemedicina` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `eventos`
--

DROP TABLE IF EXISTS `eventos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `eventos` (
  `id_evento` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `id_campana` int(10) unsigned DEFAULT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text NOT NULL,
  `tipo_evento` varchar(50) NOT NULL,
  `fecha_inicio` datetime NOT NULL,
  `fecha_fin` datetime NOT NULL,
  `ubicacion` varchar(255) DEFAULT NULL,
  `url_virtual` varchar(255) DEFAULT NULL,
  `es_virtual` tinyint(1) NOT NULL DEFAULT 0,
  `es_hibrido` tinyint(1) NOT NULL DEFAULT 0,
  `capacidad_maxima` int(10) unsigned DEFAULT NULL,
  `inscritos` int(10) unsigned NOT NULL DEFAULT 0,
  `costo` decimal(10,2) DEFAULT NULL,
  `moneda` varchar(3) NOT NULL DEFAULT 'CLP',
  `es_gratuito` tinyint(1) NOT NULL DEFAULT 1,
  `requiere_registro` tinyint(1) NOT NULL DEFAULT 1,
  `publico_objetivo` varchar(255) DEFAULT NULL,
  `ponentes` text DEFAULT NULL,
  `agenda` text DEFAULT NULL,
  `url_imagen` varchar(255) DEFAULT NULL,
  `url_registro` varchar(255) DEFAULT NULL,
  `estado` enum('planificado','publicado','en_curso','finalizado','cancelado') NOT NULL DEFAULT 'planificado',
  `responsable_id` int(10) unsigned DEFAULT NULL,
  `categoria` varchar(50) DEFAULT NULL,
  `etiquetas` varchar(255) DEFAULT NULL,
  `destacado` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_evento`),
  KEY `fk_evento_centro_idx` (`id_centro`),
  KEY `fk_evento_campana_idx` (`id_campana`),
  KEY `fk_evento_responsable_idx` (`responsable_id`),
  KEY `fk_evento_creador_idx` (`creado_por`),
  KEY `idx_evento_tipo` (`tipo_evento`),
  KEY `idx_evento_fechas` (`fecha_inicio`,`fecha_fin`),
  KEY `idx_evento_virtual` (`es_virtual`,`es_hibrido`),
  KEY `idx_evento_estado` (`estado`),
  KEY `idx_evento_gratuito` (`es_gratuito`),
  KEY `idx_evento_categoria` (`categoria`),
  KEY `idx_evento_destacado` (`destacado`),
  FULLTEXT KEY `idx_evento_busqueda` (`nombre`,`descripcion`,`publico_objetivo`,`etiquetas`),
  CONSTRAINT `fk_evento_campana` FOREIGN KEY (`id_campana`) REFERENCES `campanas_marketing` (`id_campana`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_evento_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_evento_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_evento_responsable` FOREIGN KEY (`responsable_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Eventos programados';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `eventos`
--

LOCK TABLES `eventos` WRITE;
/*!40000 ALTER TABLE `eventos` DISABLE KEYS */;
/*!40000 ALTER TABLE `eventos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `examenes_medicos`
--

DROP TABLE IF EXISTS `examenes_medicos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `examenes_medicos` (
  `id_examen` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente` int(10) unsigned NOT NULL,
  `id_tipo_examen` int(10) unsigned NOT NULL,
  `id_medico_solicitante` int(10) unsigned NOT NULL,
  `id_centro` int(10) unsigned NOT NULL,
  `fecha_solicitud` datetime NOT NULL,
  `fecha_programada` datetime DEFAULT NULL,
  `fecha_realizacion` datetime DEFAULT NULL,
  `estado` enum('solicitado','programado','realizado','cancelado','resultados_disponibles','anulado') NOT NULL DEFAULT 'solicitado',
  `prioridad` enum('normal','urgente','critica') NOT NULL DEFAULT 'normal',
  `motivo_solicitud` text DEFAULT NULL,
  `diagnostico` varchar(255) DEFAULT NULL,
  `codigo_cie10` varchar(10) DEFAULT NULL,
  `instrucciones_especificas` text DEFAULT NULL,
  `notas_tecnicas` text DEFAULT NULL,
  `id_profesional_realiza` int(10) unsigned DEFAULT NULL,
  `id_laboratorio` int(10) unsigned DEFAULT NULL,
  `numero_orden` varchar(50) DEFAULT NULL,
  `requiere_preparacion` tinyint(1) NOT NULL DEFAULT 0,
  `confirmacion_preparacion` tinyint(1) NOT NULL DEFAULT 0,
  `lugar_realizacion` varchar(100) DEFAULT NULL,
  `id_cita` int(10) unsigned DEFAULT NULL,
  `id_historial` int(10) unsigned DEFAULT NULL,
  `id_orden` int(10) unsigned DEFAULT NULL,
  `pagado` tinyint(1) NOT NULL DEFAULT 0,
  `costo` decimal(10,2) DEFAULT NULL,
  `cubierto_seguro` tinyint(1) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_examen`),
  KEY `fk_examen_paciente_idx` (`id_paciente`),
  KEY `fk_examen_tipo_idx` (`id_tipo_examen`),
  KEY `fk_examen_medico_idx` (`id_medico_solicitante`),
  KEY `fk_examen_centro_idx` (`id_centro`),
  KEY `fk_examen_profesional_idx` (`id_profesional_realiza`),
  KEY `fk_examen_laboratorio_idx` (`id_laboratorio`),
  KEY `fk_examen_cita_idx` (`id_cita`),
  KEY `fk_examen_historial_idx` (`id_historial`),
  KEY `fk_examen_orden_idx` (`id_orden`),
  KEY `idx_examen_fechas` (`fecha_solicitud`,`fecha_programada`,`fecha_realizacion`),
  KEY `idx_examen_estado` (`estado`),
  KEY `idx_examen_prioridad` (`prioridad`),
  KEY `idx_examen_numero` (`numero_orden`),
  KEY `idx_examen_pagado` (`pagado`),
  KEY `idx_examen_preparacion` (`requiere_preparacion`,`confirmacion_preparacion`),
  KEY `idx_examen_diagnostico` (`codigo_cie10`),
  CONSTRAINT `fk_examen_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_examen_cita` FOREIGN KEY (`id_cita`) REFERENCES `citas` (`id_cita`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_examen_historial` FOREIGN KEY (`id_historial`) REFERENCES `historial_clinico` (`id_historial`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_examen_medico` FOREIGN KEY (`id_medico_solicitante`) REFERENCES `medicos` (`id_medico`) ON UPDATE CASCADE,
  CONSTRAINT `fk_examen_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_examen_profesional` FOREIGN KEY (`id_profesional_realiza`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_examen_tipo` FOREIGN KEY (`id_tipo_examen`) REFERENCES `tipos_examenes` (`id_tipo_examen`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Exámenes solicitados';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `examenes_medicos`
--

LOCK TABLES `examenes_medicos` WRITE;
/*!40000 ALTER TABLE `examenes_medicos` DISABLE KEYS */;
INSERT INTO `examenes_medicos` VALUES (1,1,8,1,1,'2025-11-02 03:34:00','2025-11-08 00:34:00',NULL,'','normal',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'ORD-20251102-003527-D530',0,0,'aleluya',NULL,NULL,NULL,0,NULL,0,'2025-11-02 03:35:28','2025-11-02 03:35:28'),(2,22,1,9,1,'2025-11-06 22:20:27',NULL,NULL,'solicitado','normal','xficsjhdvcoiu',NULL,NULL,NULL,NULL,NULL,NULL,'ORD-1-20251106-59F47D',0,0,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-07 01:20:27','2025-11-07 01:20:27'),(3,22,1,9,1,'2025-11-06 22:25:27',NULL,NULL,'solicitado','normal','todo bien, taomar en ayuda',NULL,NULL,NULL,NULL,NULL,NULL,'ORD-1-20251106-83F540',0,0,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-07 01:25:27','2025-11-07 01:25:27');
/*!40000 ALTER TABLE `examenes_medicos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `examenes_solicitados`
--

DROP TABLE IF EXISTS `examenes_solicitados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `examenes_solicitados` (
  `id_examen` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente` int(10) unsigned NOT NULL,
  `id_medico` int(10) unsigned NOT NULL,
  `id_cita` int(10) unsigned DEFAULT NULL,
  `id_centro` int(10) unsigned NOT NULL,
  `id_sucursal` int(10) unsigned DEFAULT NULL,
  `tipo_examen` enum('laboratorio','imagenologia','procedimiento','otros') NOT NULL DEFAULT 'laboratorio',
  `nombre_examen` varchar(150) NOT NULL,
  `prioridad` enum('baja','normal','alta','urgente') NOT NULL DEFAULT 'normal',
  `indicaciones` text DEFAULT NULL,
  `estado_resultado` enum('pendiente','en_proceso','listo','entregado','anulado') NOT NULL DEFAULT 'pendiente',
  `fecha_solicitud` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_resultado` datetime DEFAULT NULL,
  `url_resultado` varchar(255) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_examen`),
  KEY `idx_examsol_paciente` (`id_paciente`),
  KEY `idx_examsol_medico` (`id_medico`),
  KEY `idx_examsol_centro` (`id_centro`),
  KEY `idx_examsol_sucursal` (`id_sucursal`),
  KEY `idx_examsol_cita` (`id_cita`),
  KEY `idx_examsol_estado` (`estado_resultado`),
  KEY `idx_examsol_fecha` (`fecha_solicitud`),
  KEY `idx_examsol_tipo` (`tipo_examen`),
  CONSTRAINT `fk_examsol_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_examsol_cita` FOREIGN KEY (`id_cita`) REFERENCES `citas` (`id_cita`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_examsol_medico` FOREIGN KEY (`id_medico`) REFERENCES `medicos` (`id_medico`) ON UPDATE CASCADE,
  CONSTRAINT `fk_examsol_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_examsol_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursales` (`id_sucursal`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Exámenes o estudios solicitados al paciente';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `examenes_solicitados`
--

LOCK TABLES `examenes_solicitados` WRITE;
/*!40000 ALTER TABLE `examenes_solicitados` DISABLE KEYS */;
/*!40000 ALTER TABLE `examenes_solicitados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `facturacion`
--

DROP TABLE IF EXISTS `facturacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `facturacion` (
  `id_factura` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `id_paciente` int(10) unsigned NOT NULL,
  `numero_factura` varchar(30) DEFAULT NULL,
  `tipo_documento` enum('factura','boleta','presupuesto','nota_credito','nota_debito') NOT NULL,
  `fecha_emision` date NOT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `estado` enum('emitida','pagada','anulada','vencida','parcial','en_revision') NOT NULL DEFAULT 'emitida',
  `subtotal` decimal(12,2) NOT NULL,
  `impuestos` decimal(12,2) NOT NULL DEFAULT 0.00,
  `descuentos` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total` decimal(12,2) NOT NULL,
  `pagado` decimal(12,2) NOT NULL DEFAULT 0.00,
  `saldo` decimal(12,2) NOT NULL,
  `metodo_pago` varchar(50) DEFAULT NULL,
  `fecha_pago` datetime DEFAULT NULL,
  `referencia_pago` varchar(100) DEFAULT NULL,
  `moneda` enum('CLP','USD','EUR') NOT NULL DEFAULT 'CLP',
  `notas` text DEFAULT NULL,
  `datos_facturacion` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`datos_facturacion`)),
  `id_convenio` int(10) unsigned DEFAULT NULL,
  `id_aseguradora` int(10) unsigned DEFAULT NULL,
  `cobertura_seguro` decimal(5,2) DEFAULT 0.00,
  `emitida_electronica` tinyint(1) NOT NULL DEFAULT 1,
  `url_documento` varchar(255) DEFAULT NULL,
  `enviada_paciente` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_envio` datetime DEFAULT NULL,
  `creado_por` int(10) unsigned DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_factura`),
  KEY `fk_factura_centro_idx` (`id_centro`),
  KEY `fk_factura_paciente_idx` (`id_paciente`),
  KEY `fk_factura_convenio_idx` (`id_convenio`),
  KEY `fk_factura_creador_idx` (`creado_por`),
  KEY `idx_factura_numero` (`numero_factura`),
  KEY `idx_factura_tipo` (`tipo_documento`),
  KEY `idx_factura_fechas` (`fecha_emision`,`fecha_vencimiento`),
  KEY `idx_factura_estado` (`estado`),
  KEY `idx_factura_pago` (`fecha_pago`),
  KEY `idx_factura_electronica` (`emitida_electronica`),
  CONSTRAINT `fk_factura_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_factura_convenio` FOREIGN KEY (`id_convenio`) REFERENCES `farmacia_convenios` (`id_convenio`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_factura_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_factura_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro de facturación';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `facturacion`
--

LOCK TABLES `facturacion` WRITE;
/*!40000 ALTER TABLE `facturacion` DISABLE KEYS */;
INSERT INTO `facturacion` VALUES (5,1,1,NULL,'factura','2025-10-27',NULL,'parcial',4000000.00,760000.00,0.00,4760000.00,124260.00,4635740.00,NULL,'2025-10-30 23:42:00','alekuyya','CLP','todo bien',NULL,NULL,NULL,10.00,0,NULL,0,NULL,NULL,'2025-10-27 12:18:30','2025-10-31 00:39:02'),(6,1,1,NULL,'boleta','2025-10-30',NULL,'en_revision',3000000000.00,570000000.00,0.00,3570000000.00,0.00,3570000000.00,NULL,NULL,NULL,'CLP',NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,'2025-10-31 00:16:18','2025-10-31 00:38:33');
/*!40000 ALTER TABLE `facturacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `facturacion_detalles`
--

DROP TABLE IF EXISTS `facturacion_detalles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `facturacion_detalles` (
  `id_detalle` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_factura` int(10) unsigned NOT NULL,
  `tipo_item` varchar(50) NOT NULL,
  `codigo_item` varchar(100) DEFAULT NULL,
  `descripcion` varchar(255) NOT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `precio_unitario` decimal(12,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `descuento` decimal(12,2) NOT NULL DEFAULT 0.00,
  `impuesto` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total` decimal(12,2) NOT NULL,
  `id_cita` int(10) unsigned DEFAULT NULL,
  `id_procedimiento` int(10) unsigned DEFAULT NULL,
  `id_examen` int(10) unsigned DEFAULT NULL,
  `id_producto` int(10) unsigned DEFAULT NULL,
  `notas` varchar(500) DEFAULT NULL,
  `fecha_servicio` date DEFAULT NULL,
  PRIMARY KEY (`id_detalle`),
  KEY `fk_detalle_factura_idx` (`id_factura`),
  KEY `fk_detalle_cita_idx` (`id_cita`),
  KEY `fk_detalle_procedimiento_idx` (`id_procedimiento`),
  KEY `fk_detalle_examen_idx` (`id_examen`),
  KEY `idx_detalle_tipo` (`tipo_item`),
  KEY `idx_detalle_codigo` (`codigo_item`),
  KEY `idx_detalle_fecha` (`fecha_servicio`),
  CONSTRAINT `fk_detalle_cita` FOREIGN KEY (`id_cita`) REFERENCES `citas` (`id_cita`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_detalle_examen` FOREIGN KEY (`id_examen`) REFERENCES `examenes_medicos` (`id_examen`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_detalle_factura` FOREIGN KEY (`id_factura`) REFERENCES `facturacion` (`id_factura`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_detalle_procedimiento` FOREIGN KEY (`id_procedimiento`) REFERENCES `procedimientos` (`id_procedimiento`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Detalles de facturación';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `facturacion_detalles`
--

LOCK TABLES `facturacion_detalles` WRITE;
/*!40000 ALTER TABLE `facturacion_detalles` DISABLE KEYS */;
INSERT INTO `facturacion_detalles` VALUES (7,6,'servicio',NULL,'kit dental',100.00,30000000.00,3000000000.00,0.00,570000000.00,3570000000.00,NULL,NULL,NULL,NULL,NULL,NULL),(9,5,'servicio',NULL,'Examenes',4.00,1000000.00,4000000.00,0.00,760000.00,4760000.00,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `facturacion_detalles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `facturacion_electronica`
--

DROP TABLE IF EXISTS `facturacion_electronica`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `facturacion_electronica` (
  `id_factura_electronica` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_factura` int(10) unsigned NOT NULL,
  `id_centro` int(10) unsigned NOT NULL,
  `folio` varchar(20) NOT NULL,
  `tipo_dte` varchar(20) NOT NULL,
  `fecha_emision` datetime NOT NULL,
  `estado_sii` varchar(50) DEFAULT NULL,
  `fecha_recepcion_sii` datetime DEFAULT NULL,
  `track_id` varchar(50) DEFAULT NULL,
  `pdf_url` varchar(255) DEFAULT NULL,
  `xml_url` varchar(255) DEFAULT NULL,
  `xml_data` mediumtext DEFAULT NULL,
  `contenido_timbre` text DEFAULT NULL,
  `resultado_envio` text DEFAULT NULL,
  `intentos_envio` int(10) unsigned NOT NULL DEFAULT 0,
  `error_envio` text DEFAULT NULL,
  `proveedor_fe` varchar(100) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_factura_electronica`),
  UNIQUE KEY `idx_factelec_folio_tipo` (`folio`,`tipo_dte`),
  KEY `fk_factelec_factura_idx` (`id_factura`),
  KEY `fk_factelec_centro_idx` (`id_centro`),
  KEY `idx_factelec_fecha` (`fecha_emision`),
  KEY `idx_factelec_estado` (`estado_sii`),
  KEY `idx_factelec_track` (`track_id`),
  CONSTRAINT `fk_factelec_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_factelec_factura` FOREIGN KEY (`id_factura`) REFERENCES `facturacion` (`id_factura`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Facturación electrónica';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `facturacion_electronica`
--

LOCK TABLES `facturacion_electronica` WRITE;
/*!40000 ALTER TABLE `facturacion_electronica` DISABLE KEYS */;
/*!40000 ALTER TABLE `facturacion_electronica` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `farmacia_convenios`
--

DROP TABLE IF EXISTS `farmacia_convenios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `farmacia_convenios` (
  `id_convenio` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `id_proveedor` int(10) unsigned DEFAULT NULL,
  `nombre_convenio` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `descuento_porcentaje` decimal(5,2) DEFAULT NULL,
  `tipo_descuento` enum('porcentaje','monto_fijo') NOT NULL DEFAULT 'porcentaje',
  `monto_descuento` decimal(10,2) DEFAULT NULL,
  `tope_mensual` decimal(10,2) DEFAULT NULL,
  `condiciones` text DEFAULT NULL,
  `restricciones` text DEFAULT NULL,
  `estado` enum('activo','inactivo','pendiente','vencido') NOT NULL DEFAULT 'activo',
  `prioridad` tinyint(3) unsigned NOT NULL DEFAULT 3,
  `documentos_url` varchar(255) DEFAULT NULL,
  `codigo_convenio` varchar(50) DEFAULT NULL,
  `contacto_convenio` varchar(100) DEFAULT NULL,
  `contacto_telefono` varchar(20) DEFAULT NULL,
  `contacto_email` varchar(100) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_convenio`),
  KEY `fk_convenio_centro_idx` (`id_centro`),
  KEY `fk_convenio_proveedor_idx` (`id_proveedor`),
  KEY `fk_convenio_creador_idx` (`creado_por`),
  KEY `idx_convenio_fechas` (`fecha_inicio`,`fecha_fin`),
  KEY `idx_convenio_estado` (`estado`),
  KEY `idx_convenio_codigo` (`codigo_convenio`),
  KEY `idx_convenio_nombre` (`nombre_convenio`),
  CONSTRAINT `fk_convenio_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_convenio_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_convenio_proveedor` FOREIGN KEY (`id_proveedor`) REFERENCES `farmacia_proveedores` (`id_proveedor`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Convenios con laboratorios farmacéuticos';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `farmacia_convenios`
--

LOCK TABLES `farmacia_convenios` WRITE;
/*!40000 ALTER TABLE `farmacia_convenios` DISABLE KEYS */;
INSERT INTO `farmacia_convenios` VALUES (1,1,NULL,'Convenio Laboratorio Andino','Descuento en antibióticos y antiinflamatorios.','2024-07-01',NULL,15.00,'porcentaje',NULL,NULL,'Válido para pacientes inscritos.','No aplica a medicamentos de alto costo.','activo',3,'https://docs.example.com/andino.pdf','CONV-2025-001','María Torres','+56 9 5555 0001','m.torres@andino.cl','2025-10-31 00:24:41','2025-10-31 00:24:41',1),(2,1,NULL,'Red Salud Colectivo','Acuerdo de precios preferentes en genéricos.','2025-01-01','2025-12-31',10.00,'porcentaje',NULL,NULL,'Aplicable con credencial del centro.',NULL,'activo',3,NULL,'CONV-2025-002','Carlos Muñoz','+56 75 2123456','c.munoz@redsalud.cl','2025-10-31 00:24:41','2025-10-31 00:24:41',1),(3,2,NULL,'Programa Adulto Mayor','Descuentos especiales para mayores de 65.','2025-11-14','2026-10-30',20.00,'porcentaje',NULL,NULL,'Requiere acreditación de edad.',NULL,'pendiente',3,NULL,'CONV-2025-003','Paula Reyes','+56 9 5555 0003','paula.reyes@proveedor.cl','2025-10-31 00:24:41','2025-10-31 00:24:41',1),(4,2,NULL,'Plan Crónicos Respiratorios','Beneficio para pacientes con EPOC/Asma.','2023-06-01','2025-09-30',18.50,'porcentaje',NULL,NULL,'Se solicita resolución médica.','No acumula con otros convenios.','vencido',3,NULL,'CONV-2025-004','Jorge Silva','+56 75 2987654','jorge.silva@farmacia.cl','2025-10-31 00:24:41','2025-10-31 00:24:41',1),(5,1,NULL,'Pediatría Esencial','Descuento en antitérmicos y vitaminas pediátricas.','2024-10-01',NULL,8.00,'porcentaje',NULL,NULL,'Sólo presentando receta pediátrica.',NULL,'inactivo',3,NULL,'CONV-2025-005','Dra. Andrea Soto','+56 9 5555 0005','a.soto@pediatria.cl','2025-10-31 00:24:41','2025-10-31 00:24:41',1),(6,1,NULL,'Campaña Invierno 2025','Antigripales y jarabes con precio preferente.','2025-05-01','2025-09-30',12.00,'porcentaje',NULL,NULL,'Stock limitado por paciente.',NULL,'activo',3,NULL,'CONV-2025-006','Felipe Araya','+56 75 2654321','felipe.araya@andino.cl','2025-10-31 00:24:41','2025-10-31 00:24:41',1),(7,2,NULL,'Acuerdo Insumos Clínicos','Gazas, vendas y alcohol gel con descuento.','2024-11-15','2025-11-14',5.00,'porcentaje',NULL,NULL,'Topes por compra mensual.','Excluye equipos médicos.','activo',3,'https://docs.example.com/insumos.pdf','CONV-2025-007','Lorena Pizarro','+56 9 5555 0007','lorena.pizarro@insumos.cl','2025-10-31 00:24:41','2025-10-31 00:24:41',1),(8,1,NULL,'Convenio Urgencias 24/7','Descuentos en analgésicos y sueros.','2024-01-01',NULL,12.50,'porcentaje',NULL,NULL,'Aplica en turnos nocturnos.',NULL,'activo',3,NULL,'CONV-2025-008','Rodrigo Díaz','+56 75 2777000','r.diaz@urgencias.cl','2025-10-31 00:24:41','2025-10-31 00:24:41',1),(9,1,1,'Convenio Medicamentos Genéricos 2024','Descuento especial en medicamentos genéricos','2024-01-01','2024-12-31',15.00,'porcentaje',NULL,NULL,'Descuento aplicable a compras superiores a $500.000. Pago a 30 días.',NULL,'activo',3,NULL,'CONV-GEN-2024',NULL,NULL,NULL,'2025-11-04 00:40:21','2025-11-04 00:40:21',1),(10,1,2,'Convenio Distribución Preferente','Prioridad en entregas y descuentos','2024-01-01','2024-12-31',10.00,'porcentaje',NULL,NULL,'Entrega prioritaria en 24 horas. Descuento en compras mensuales.',NULL,'activo',3,NULL,'CONV-DIST-2024',NULL,NULL,NULL,'2025-11-04 00:40:21','2025-11-04 00:40:21',1);
/*!40000 ALTER TABLE `farmacia_convenios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `farmacia_inventario`
--

DROP TABLE IF EXISTS `farmacia_inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `farmacia_inventario` (
  `id_inventario` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `id_sucursal` int(10) unsigned DEFAULT NULL,
  `id_medicamento` int(10) unsigned NOT NULL,
  `lote` varchar(50) NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  `stock_actual` int(11) NOT NULL,
  `stock_minimo` int(11) NOT NULL DEFAULT 5,
  `stock_maximo` int(11) DEFAULT NULL,
  `ubicacion` varchar(100) DEFAULT NULL,
  `costo_unitario` decimal(10,2) DEFAULT NULL,
  `precio_venta` decimal(10,2) DEFAULT NULL,
  `proveedor` varchar(100) DEFAULT NULL,
  `fecha_entrada` date NOT NULL,
  `estado` enum('disponible','bajo_stock','agotado','proximo_vencer','vencido','retirado') NOT NULL DEFAULT 'disponible',
  `notas` text DEFAULT NULL,
  `ultima_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  `modificado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_inventario`),
  KEY `fk_inventario_centro_idx` (`id_centro`),
  KEY `fk_inventario_sucursal_idx` (`id_sucursal`),
  KEY `fk_inventario_medicamento_idx` (`id_medicamento`),
  KEY `fk_inventario_creador_idx` (`creado_por`),
  KEY `fk_inventario_modificador_idx` (`modificado_por`),
  KEY `idx_inventario_lote` (`lote`),
  KEY `idx_inventario_vencimiento` (`fecha_vencimiento`),
  KEY `idx_inventario_estado` (`estado`),
  CONSTRAINT `fk_inventario_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_inventario_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_inventario_modificador` FOREIGN KEY (`modificado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_inventario_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursales` (`id_sucursal`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Inventario de medicamentos en farmacia';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `farmacia_inventario`
--

LOCK TABLES `farmacia_inventario` WRITE;
/*!40000 ALTER TABLE `farmacia_inventario` DISABLE KEYS */;
INSERT INTO `farmacia_inventario` VALUES (1,1,NULL,1,'PAR-2024-001','2026-01-15',750,100,2000,'Estante A1',1500.00,2500.00,'Laboratorio Chile S.A.','2024-02-01','disponible',NULL,'2025-11-04 00:40:10',1,NULL),(2,1,NULL,2,'IBU-2024-001','2026-02-20',520,80,1500,'Estante A2',2200.00,3500.00,'Farmacéutica Andina Ltda.','2024-03-01','disponible',NULL,'2025-11-04 00:40:10',1,NULL),(3,1,NULL,6,'AMO-2024-001','2025-09-15',320,50,800,'Estante B1',5500.00,8900.00,'Laboratorio Chile S.A.','2024-04-01','disponible',NULL,'2025-11-04 00:40:10',1,NULL),(4,1,NULL,20,'OME-2024-001','2026-04-10',450,60,1000,'Estante C1',3500.00,5600.00,'Droguería Central','2024-05-01','disponible',NULL,'2025-11-04 00:40:10',1,NULL),(5,1,NULL,11,'ENA-2024-001','2026-05-05',980,120,2000,'Estante D1',2000.00,3200.00,'Laboratorio Chile S.A.','2024-06-01','disponible',NULL,'2025-11-04 00:40:10',1,NULL),(6,1,NULL,16,'MET-2024-001','2026-06-20',1200,150,2500,'Estante D2',2800.00,4500.00,'Farmacéutica Andina Ltda.','2024-07-01','disponible',NULL,'2025-11-04 00:40:10',1,NULL),(7,1,NULL,12,'LOS-2024-001','2026-07-15',650,80,1500,'Estante D3',3000.00,4800.00,'Laboratorio Chile S.A.','2024-08-01','disponible',NULL,'2025-11-04 00:40:10',1,NULL),(8,1,NULL,33,'ATO-2024-001','2026-08-10',480,60,1000,'Estante E1',5500.00,8900.00,'Droguería Central','2024-09-01','disponible',NULL,'2025-11-04 00:40:10',1,NULL),(9,1,NULL,23,'SAL-2024-001','2025-09-05',165,20,300,'Refrigerador A',5500.00,8900.00,'Laboratorio Chile S.A.','2024-10-01','disponible',NULL,'2025-11-04 00:40:10',1,NULL);
/*!40000 ALTER TABLE `farmacia_inventario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `farmacia_lotes`
--

DROP TABLE IF EXISTS `farmacia_lotes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `farmacia_lotes` (
  `id_lote` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `id_medicamento` int(10) unsigned NOT NULL,
  `numero_lote` varchar(50) NOT NULL,
  `id_proveedor` int(10) unsigned DEFAULT NULL,
  `fecha_fabricacion` date DEFAULT NULL,
  `fecha_vencimiento` date NOT NULL,
  `cantidad_inicial` int(10) unsigned NOT NULL,
  `cantidad_actual` int(10) unsigned NOT NULL,
  `costo_unitario` decimal(10,2) DEFAULT NULL,
  `precio_venta` decimal(10,2) DEFAULT NULL,
  `fecha_ingreso` date NOT NULL,
  `numero_factura` varchar(50) DEFAULT NULL,
  `estado` enum('activo','bajo_stock','agotado','proximo_vencer','vencido','retirado') NOT NULL DEFAULT 'activo',
  `ubicacion_almacen` varchar(100) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `alerta_vencimiento_dias` int(10) unsigned NOT NULL DEFAULT 60,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_lote`),
  KEY `fk_lote_centro_idx` (`id_centro`),
  KEY `fk_lote_medicamento_idx` (`id_medicamento`),
  KEY `fk_lote_proveedor_idx` (`id_proveedor`),
  KEY `fk_lote_creador_idx` (`creado_por`),
  KEY `idx_lote_numero` (`numero_lote`),
  KEY `idx_lote_vencimiento` (`fecha_vencimiento`),
  KEY `idx_lote_estado` (`estado`),
  CONSTRAINT `fk_lote_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_lote_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_lote_proveedor` FOREIGN KEY (`id_proveedor`) REFERENCES `farmacia_proveedores` (`id_proveedor`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Control de lotes de medicamentos';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `farmacia_lotes`
--

LOCK TABLES `farmacia_lotes` WRITE;
/*!40000 ALTER TABLE `farmacia_lotes` DISABLE KEYS */;
INSERT INTO `farmacia_lotes` VALUES (1,1,1,'PAR-2024-001',1,'2024-01-15','2026-01-15',1000,750,1500.00,2500.00,'2024-02-01','FC-001-2024','activo','Estante A1',NULL,60,'2025-11-04 00:40:10','2025-11-04 00:40:10',1),(2,1,1,'PAR-2024-002',1,'2024-06-10','2026-06-10',1000,980,1500.00,2500.00,'2024-07-01','FC-045-2024','activo','Estante A1',NULL,60,'2025-11-04 00:40:10','2025-11-04 00:40:10',1),(3,1,2,'IBU-2024-001',2,'2024-02-20','2026-02-20',800,520,2200.00,3500.00,'2024-03-01','FC-008-2024','activo','Estante A2',NULL,60,'2025-11-04 00:40:10','2025-11-04 00:40:10',1),(4,1,6,'AMO-2024-001',1,'2024-03-15','2025-09-15',500,320,5500.00,8900.00,'2024-04-01','FC-015-2024','activo','Estante B1',NULL,60,'2025-11-04 00:40:10','2025-11-04 00:40:10',1),(5,1,20,'OME-2024-001',3,'2024-04-10','2026-04-10',600,450,3500.00,5600.00,'2024-05-01','FC-022-2024','activo','Estante C1',NULL,60,'2025-11-04 00:40:10','2025-11-04 00:40:10',1),(6,1,11,'ENA-2024-001',1,'2024-05-05','2026-05-05',1200,980,2000.00,3200.00,'2024-06-01','FC-030-2024','activo','Estante D1',NULL,60,'2025-11-04 00:40:10','2025-11-04 00:40:10',1),(7,1,16,'MET-2024-001',2,'2024-06-20','2026-06-20',1500,1200,2800.00,4500.00,'2024-07-01','FC-038-2024','activo','Estante D2',NULL,60,'2025-11-04 00:40:10','2025-11-04 00:40:10',1),(8,1,12,'LOS-2024-001',1,'2024-07-15','2026-07-15',800,650,3000.00,4800.00,'2024-08-01','FC-045-2024','activo','Estante D3',NULL,60,'2025-11-04 00:40:10','2025-11-04 00:40:10',1),(9,1,33,'ATO-2024-001',3,'2024-08-10','2026-08-10',600,480,5500.00,8900.00,'2024-09-01','FC-052-2024','activo','Estante E1',NULL,60,'2025-11-04 00:40:10','2025-11-04 00:40:10',1),(10,1,23,'SAL-2024-001',1,'2024-09-05','2025-09-05',200,165,5500.00,8900.00,'2024-10-01','FC-060-2024','activo','Refrigerador A',NULL,60,'2025-11-04 00:40:10','2025-11-04 00:40:10',1);
/*!40000 ALTER TABLE `farmacia_lotes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `farmacia_precios`
--

DROP TABLE IF EXISTS `farmacia_precios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `farmacia_precios` (
  `id_precio` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `id_medicamento` int(10) unsigned NOT NULL,
  `precio_venta` decimal(10,2) NOT NULL,
  `precio_costo` decimal(10,2) DEFAULT NULL,
  `margen` decimal(5,2) DEFAULT NULL,
  `incluye_impuestos` tinyint(1) NOT NULL DEFAULT 1,
  `porcentaje_impuesto` decimal(5,2) DEFAULT NULL,
  `fecha_vigencia` date NOT NULL,
  `fecha_fin_vigencia` date DEFAULT NULL,
  `motivo_cambio` varchar(255) DEFAULT NULL,
  `es_precio_actual` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_precio`),
  KEY `fk_precio_centro_idx` (`id_centro`),
  KEY `fk_precio_medicamento_idx` (`id_medicamento`),
  KEY `fk_precio_creador_idx` (`creado_por`),
  KEY `idx_precio_fechas` (`fecha_vigencia`,`fecha_fin_vigencia`),
  KEY `idx_precio_actual` (`es_precio_actual`),
  CONSTRAINT `fk_precio_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_precio_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Historial de precios de medicamentos';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `farmacia_precios`
--

LOCK TABLES `farmacia_precios` WRITE;
/*!40000 ALTER TABLE `farmacia_precios` DISABLE KEYS */;
INSERT INTO `farmacia_precios` VALUES (1,1,1,2500.00,1500.00,66.67,1,19.00,'2024-01-01',NULL,NULL,1,'2025-11-04 00:40:29','2025-11-04 00:40:29',1),(2,1,2,3500.00,2200.00,59.09,1,19.00,'2024-01-01',NULL,NULL,1,'2025-11-04 00:40:29','2025-11-04 00:40:29',1),(3,1,6,8900.00,5500.00,61.82,1,19.00,'2024-01-01',NULL,NULL,1,'2025-11-04 00:40:29','2025-11-04 00:40:29',1),(4,1,20,5600.00,3500.00,60.00,1,19.00,'2024-01-01',NULL,NULL,1,'2025-11-04 00:40:29','2025-11-04 00:40:29',1),(5,1,11,3200.00,2000.00,60.00,1,19.00,'2024-01-01',NULL,NULL,1,'2025-11-04 00:40:29','2025-11-04 00:40:29',1),(6,1,16,4500.00,2800.00,60.71,1,19.00,'2024-01-01',NULL,NULL,1,'2025-11-04 00:40:29','2025-11-04 00:40:29',1),(7,1,12,4800.00,3000.00,60.00,1,19.00,'2024-01-01',NULL,NULL,1,'2025-11-04 00:40:29','2025-11-04 00:40:29',1),(8,1,33,8900.00,5500.00,61.82,1,19.00,'2024-01-01',NULL,NULL,1,'2025-11-04 00:40:29','2025-11-04 00:40:29',1),(9,1,23,8900.00,5500.00,61.82,1,19.00,'2024-01-01',NULL,NULL,1,'2025-11-04 00:40:29','2025-11-04 00:40:29',1);
/*!40000 ALTER TABLE `farmacia_precios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `farmacia_prescripciones`
--

DROP TABLE IF EXISTS `farmacia_prescripciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `farmacia_prescripciones` (
  `id_prescripcion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `id_paciente` int(10) unsigned NOT NULL,
  `id_medico` int(10) unsigned NOT NULL,
  `id_historial` int(10) unsigned DEFAULT NULL,
  `fecha_prescripcion` date NOT NULL,
  `estado` enum('activa','dispensada','parcial','anulada','vencida') NOT NULL DEFAULT 'activa',
  `es_cronica` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `notas_privadas` text DEFAULT NULL,
  `contraindicaciones` text DEFAULT NULL,
  `alergias_verificadas` tinyint(1) NOT NULL DEFAULT 0,
  `interacciones_verificadas` tinyint(1) NOT NULL DEFAULT 0,
  `dispensaciones_programadas` int(10) unsigned DEFAULT NULL,
  `dispensaciones_realizadas` int(10) unsigned NOT NULL DEFAULT 0,
  `fecha_proxima_dispensacion` date DEFAULT NULL,
  `fecha_ultima_dispensacion` date DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_prescripcion`),
  KEY `fk_prescripcion_centro_idx` (`id_centro`),
  KEY `fk_prescripcion_paciente_idx` (`id_paciente`),
  KEY `fk_prescripcion_medico_idx` (`id_medico`),
  KEY `fk_prescripcion_historial_idx` (`id_historial`),
  KEY `idx_prescripcion_fecha` (`fecha_prescripcion`),
  KEY `idx_prescripcion_estado` (`estado`),
  KEY `idx_prescripcion_cronica` (`es_cronica`),
  KEY `idx_prescripcion_fechas` (`fecha_inicio`,`fecha_fin`),
  KEY `idx_prescripcion_proxima` (`fecha_proxima_dispensacion`),
  CONSTRAINT `fk_prescripcion_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_prescripcion_historial` FOREIGN KEY (`id_historial`) REFERENCES `historial_clinico` (`id_historial`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_prescripcion_medico` FOREIGN KEY (`id_medico`) REFERENCES `medicos` (`id_medico`) ON UPDATE CASCADE,
  CONSTRAINT `fk_prescripcion_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro de prescripciones médicas';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `farmacia_prescripciones`
--

LOCK TABLES `farmacia_prescripciones` WRITE;
/*!40000 ALTER TABLE `farmacia_prescripciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `farmacia_prescripciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `farmacia_proveedores`
--

DROP TABLE IF EXISTS `farmacia_proveedores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `farmacia_proveedores` (
  `id_proveedor` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `rut` varchar(12) NOT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT NULL,
  `region` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `contacto_nombre` varchar(100) DEFAULT NULL,
  `contacto_telefono` varchar(20) DEFAULT NULL,
  `contacto_email` varchar(100) DEFAULT NULL,
  `tipo` enum('laboratorio','distribuidor','farmacia','otro') NOT NULL,
  `especialidad` varchar(100) DEFAULT NULL,
  `condiciones_pago` varchar(100) DEFAULT NULL,
  `tiempo_entrega_dias` int(10) unsigned DEFAULT NULL,
  `calificacion` int(10) unsigned DEFAULT NULL,
  `estado` enum('activo','inactivo','suspendido') NOT NULL DEFAULT 'activo',
  `notas` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_proveedor`),
  KEY `fk_proveedor_centro_idx` (`id_centro`),
  KEY `fk_proveedor_creador_idx` (`creado_por`),
  KEY `idx_proveedor_rut` (`rut`),
  KEY `idx_proveedor_tipo` (`tipo`),
  KEY `idx_proveedor_estado` (`estado`),
  CONSTRAINT `fk_proveedor_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_proveedor_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Proveedores de farmacia';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `farmacia_proveedores`
--

LOCK TABLES `farmacia_proveedores` WRITE;
/*!40000 ALTER TABLE `farmacia_proveedores` DISABLE KEYS */;
INSERT INTO `farmacia_proveedores` VALUES (1,1,'Laboratorio Chile S.A.','76.123.456-7','Av. Providencia 1234','Santiago','Región Metropolitana','+56223456789','ventas@labchile.cl','Juan Pérez','+56987654321','jperez@labchile.cl','laboratorio','Medicamentos Genéricos','30 días',3,5,'activo',NULL,'2025-11-04 00:39:57','2025-11-04 00:39:57',1),(2,1,'Farmacéutica Andina Ltda.','77.234.567-8','Calle Comercio 567','Curicó','Región del Maule','+56752345678','contacto@farmandina.cl','María González','+56945678901','mgonzalez@farmandina.cl','distribuidor','Distribución General','45 días',1,4,'activo',NULL,'2025-11-04 00:39:57','2025-11-04 00:39:57',1),(3,1,'Droguería Central','78.345.678-9','Av. Libertador 890','Talca','Región del Maule','+56713456789','ventas@drogueriacentral.cl','Carlos Rojas','+56956789012','crojas@drogueriacentral.cl','distribuidor','Medicamentos Controlados','30 días',2,5,'activo',NULL,'2025-11-04 00:39:57','2025-11-04 00:39:57',1);
/*!40000 ALTER TABLE `farmacia_proveedores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `farmacia_transacciones`
--

DROP TABLE IF EXISTS `farmacia_transacciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `farmacia_transacciones` (
  `id_transaccion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `id_sucursal` int(10) unsigned DEFAULT NULL,
  `tipo_transaccion` enum('entrada','salida','ajuste','vencimiento','traslado','devolucion') NOT NULL,
  `fecha_transaccion` datetime NOT NULL,
  `id_paciente` int(10) unsigned DEFAULT NULL,
  `id_receta` int(10) unsigned DEFAULT NULL,
  `id_usuario_responsable` int(10) unsigned NOT NULL,
  `id_proveedor` int(10) unsigned DEFAULT NULL,
  `numero_documento` varchar(50) DEFAULT NULL,
  `tipo_documento` varchar(50) DEFAULT NULL,
  `total_items` int(10) unsigned NOT NULL,
  `total_unidades` int(10) unsigned NOT NULL,
  `valor_total` decimal(10,2) DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `estado` enum('pendiente','completada','cancelada','parcial') NOT NULL DEFAULT 'pendiente',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_transaccion`),
  KEY `fk_transaccion_centro_idx` (`id_centro`),
  KEY `fk_transaccion_sucursal_idx` (`id_sucursal`),
  KEY `fk_transaccion_paciente_idx` (`id_paciente`),
  KEY `fk_transaccion_receta_idx` (`id_receta`),
  KEY `fk_transaccion_responsable_idx` (`id_usuario_responsable`),
  KEY `fk_transaccion_proveedor_idx` (`id_proveedor`),
  KEY `idx_transaccion_tipo` (`tipo_transaccion`),
  KEY `idx_transaccion_fecha` (`fecha_transaccion`),
  KEY `idx_transaccion_estado` (`estado`),
  CONSTRAINT `fk_transaccion_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_transaccion_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_transaccion_proveedor` FOREIGN KEY (`id_proveedor`) REFERENCES `farmacia_proveedores` (`id_proveedor`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_transaccion_responsable` FOREIGN KEY (`id_usuario_responsable`) REFERENCES `usuarios` (`id_usuario`) ON UPDATE CASCADE,
  CONSTRAINT `fk_transaccion_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursales` (`id_sucursal`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Movimientos de inventario de farmacia';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `farmacia_transacciones`
--

LOCK TABLES `farmacia_transacciones` WRITE;
/*!40000 ALTER TABLE `farmacia_transacciones` DISABLE KEYS */;
INSERT INTO `farmacia_transacciones` VALUES (1,1,NULL,'entrada','2024-02-01 10:00:00',NULL,NULL,1,1,'FC-001-2024','Factura',1,1000,1500000.00,NULL,'completada','2025-11-04 00:40:21','2025-11-04 00:40:21'),(2,1,NULL,'entrada','2024-03-01 10:00:00',NULL,NULL,1,2,'FC-008-2024','Factura',1,800,1760000.00,NULL,'completada','2025-11-04 00:40:21','2025-11-04 00:40:21'),(3,1,NULL,'salida','2024-01-15 11:00:00',1,1,1,NULL,'REC-2024-001-0001','Receta',2,270,864000.00,NULL,'completada','2025-11-04 00:40:21','2025-11-04 00:40:21'),(4,1,NULL,'salida','2024-01-20 10:30:00',2,2,1,NULL,'REC-2024-001-0002','Receta',2,270,1242000.00,NULL,'completada','2025-11-04 00:40:21','2025-11-04 00:40:21'),(5,1,NULL,'salida','2024-02-05 14:00:00',3,3,1,NULL,'REC-2024-001-0003','Receta',2,35,177150.00,NULL,'completada','2025-11-04 00:40:21','2025-11-04 00:40:21'),(6,1,NULL,'salida','2024-02-12 16:00:00',4,4,1,NULL,'REC-2024-001-0004','Receta',2,72,639200.00,NULL,'completada','2025-11-04 00:40:21','2025-11-04 00:40:21'),(7,1,NULL,'salida','2024-02-18 09:00:00',5,5,1,NULL,'REC-2024-002-0001','Receta',1,180,1170000.00,NULL,'completada','2025-11-04 00:40:21','2025-11-04 00:40:21'),(8,1,NULL,'salida','2024-03-01 11:30:00',6,6,1,NULL,'REC-2024-001-0005','Receta',1,180,1602000.00,NULL,'completada','2025-11-04 00:40:21','2025-11-04 00:40:21'),(9,1,NULL,'salida','2024-03-10 15:00:00',7,7,1,NULL,'REC-2024-002-0002','Receta',1,60,288000.00,NULL,'completada','2025-11-04 00:40:21','2025-11-04 00:40:21'),(10,1,NULL,'salida','2024-03-15 10:00:00',8,8,1,NULL,'REC-2024-001-0006','Receta',2,4,71200.00,NULL,'completada','2025-11-04 00:40:21','2025-11-04 00:40:21');
/*!40000 ALTER TABLE `farmacia_transacciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fichas_medicas`
--

DROP TABLE IF EXISTS `fichas_medicas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `fichas_medicas` (
  `id_ficha` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente` int(10) unsigned NOT NULL,
  `id_centro` int(10) unsigned NOT NULL,
  `estado` enum('activa','inactiva','bloqueada','archivada') NOT NULL DEFAULT 'activa',
  `codigo_ficha` varchar(20) NOT NULL,
  `fecha_apertura` date NOT NULL,
  `fecha_cierre` date DEFAULT NULL,
  `motivo_cierre` text DEFAULT NULL,
  `nivel_acceso` enum('basico','completo','restringido') NOT NULL DEFAULT 'completo',
  `notas_administrativas` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  `ultima_revision` datetime DEFAULT NULL,
  `revisado_por` int(10) unsigned DEFAULT NULL,
  `version` int(10) unsigned NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_ficha`),
  UNIQUE KEY `idx_ficha_codigo` (`codigo_ficha`),
  KEY `fk_ficha_paciente_idx` (`id_paciente`),
  KEY `fk_ficha_centro_idx` (`id_centro`),
  KEY `fk_ficha_creador_idx` (`creado_por`),
  KEY `fk_ficha_revisor_idx` (`revisado_por`),
  KEY `idx_ficha_estado` (`estado`),
  KEY `idx_ficha_acceso` (`nivel_acceso`),
  CONSTRAINT `fk_ficha_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ficha_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_ficha_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ficha_revisor` FOREIGN KEY (`revisado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Fichas médicas principales';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fichas_medicas`
--

LOCK TABLES `fichas_medicas` WRITE;
/*!40000 ALTER TABLE `fichas_medicas` DISABLE KEYS */;
/*!40000 ALTER TABLE `fichas_medicas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `firmas_electronicas`
--

DROP TABLE IF EXISTS `firmas_electronicas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `firmas_electronicas` (
  `id_firma` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_usuario` int(10) unsigned NOT NULL,
  `tipo_firma` enum('imagen','certificado_digital') NOT NULL,
  `url_firma` varchar(255) DEFAULT NULL,
  `certificado_data` blob DEFAULT NULL,
  `fecha_emision` date NOT NULL,
  `fecha_expiracion` date DEFAULT NULL,
  `entidad_emisora` varchar(100) DEFAULT NULL,
  `nivel_seguridad` varchar(50) DEFAULT NULL,
  `estado` enum('activo','inactivo','expirado','revocado') NOT NULL DEFAULT 'activo',
  `password_hash` varchar(255) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `ip_registro` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id_firma`),
  KEY `fk_firma_usuario_idx` (`id_usuario`),
  KEY `idx_firma_estado` (`estado`),
  KEY `idx_firma_tipo` (`tipo_firma`),
  CONSTRAINT `fk_firma_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Firmas electrónicas de profesionales';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `firmas_electronicas`
--

LOCK TABLES `firmas_electronicas` WRITE;
/*!40000 ALTER TABLE `firmas_electronicas` DISABLE KEYS */;
/*!40000 ALTER TABLE `firmas_electronicas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_cambios_citas`
--

DROP TABLE IF EXISTS `historial_cambios_citas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `historial_cambios_citas` (
  `id_cambio` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_cita` int(10) unsigned NOT NULL,
  `id_usuario` int(10) unsigned DEFAULT NULL,
  `campo_modificado` varchar(100) NOT NULL,
  `valor_anterior` text DEFAULT NULL,
  `valor_nuevo` text DEFAULT NULL,
  `tipo_cambio` enum('creacion','modificacion','cancelacion','confirmacion','inicio_atencion','finalizacion') NOT NULL,
  `observaciones` text DEFAULT NULL,
  `fecha_cambio` timestamp NOT NULL DEFAULT current_timestamp(),
  `ip_address` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id_cambio`),
  KEY `idx_cita` (`id_cita`),
  KEY `idx_usuario` (`id_usuario`),
  KEY `idx_fecha` (`fecha_cambio`),
  CONSTRAINT `fk_historial_cita` FOREIGN KEY (`id_cita`) REFERENCES `citas` (`id_cita`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_historial_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_cambios_citas`
--

LOCK TABLES `historial_cambios_citas` WRITE;
/*!40000 ALTER TABLE `historial_cambios_citas` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_cambios_citas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_cambios_pacientes`
--

DROP TABLE IF EXISTS `historial_cambios_pacientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `historial_cambios_pacientes` (
  `id_historial` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente` int(10) unsigned NOT NULL,
  `version_anterior` int(11) NOT NULL,
  `datos_anteriores` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'Snapshot completo del paciente' CHECK (json_valid(`datos_anteriores`)),
  `campos_modificados` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Lista de campos que cambiaron' CHECK (json_valid(`campos_modificados`)),
  `modificado_por` int(10) unsigned DEFAULT NULL,
  `ip_modificacion` varchar(45) DEFAULT NULL,
  `razon_cambio` text DEFAULT NULL,
  `fecha_cambio` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_historial`),
  KEY `idx_histcambio_paciente` (`id_paciente`),
  KEY `idx_histcambio_fecha` (`fecha_cambio`),
  CONSTRAINT `historial_cambios_pacientes_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_cambios_pacientes`
--

LOCK TABLES `historial_cambios_pacientes` WRITE;
/*!40000 ALTER TABLE `historial_cambios_pacientes` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_cambios_pacientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_clinico`
--

DROP TABLE IF EXISTS `historial_clinico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `historial_clinico` (
  `id_historial` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_ficha` int(10) unsigned NOT NULL,
  `id_paciente` int(10) unsigned NOT NULL,
  `fecha_atencion` datetime NOT NULL,
  `id_medico` int(10) unsigned NOT NULL,
  `id_especialidad` int(10) unsigned DEFAULT NULL,
  `id_centro` int(10) unsigned NOT NULL,
  `id_sucursal` int(10) unsigned DEFAULT NULL,
  `motivo_consulta` text NOT NULL,
  `anamnesis` text DEFAULT NULL,
  `examen_fisico` text DEFAULT NULL,
  `diagnostico_principal` varchar(255) DEFAULT NULL,
  `codigo_cie10` varchar(10) DEFAULT NULL,
  `plan_tratamiento` text DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `estado_registro` enum('borrador','completo','revisado','anulado') NOT NULL DEFAULT 'borrador',
  `tipo_atencion` enum('consulta','control','urgencia','procedimiento','hospitalizacion','telemedicina') NOT NULL,
  `duracion_minutos` int(10) unsigned DEFAULT NULL,
  `es_ges` tinyint(1) NOT NULL DEFAULT 0,
  `es_cronica` tinyint(1) NOT NULL DEFAULT 0,
  `proximo_control` date DEFAULT NULL,
  `id_cita` int(10) unsigned DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `modificado_por` int(10) unsigned DEFAULT NULL,
  `version` int(10) unsigned NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_historial`),
  KEY `fk_historial_ficha_idx` (`id_ficha`),
  KEY `fk_historial_paciente_idx` (`id_paciente`),
  KEY `fk_historial_medico_idx` (`id_medico`),
  KEY `fk_historial_especialidad_idx` (`id_especialidad`),
  KEY `fk_historial_centro_idx` (`id_centro`),
  KEY `fk_historial_sucursal_idx` (`id_sucursal`),
  KEY `fk_historial_cita_idx` (`id_cita`),
  KEY `fk_historial_modificador_idx` (`modificado_por`),
  KEY `idx_historial_fecha` (`fecha_atencion`),
  KEY `idx_historial_estado` (`estado_registro`),
  KEY `idx_historial_tipo` (`tipo_atencion`),
  KEY `idx_historial_cie10` (`codigo_cie10`),
  KEY `idx_historial_ges` (`es_ges`),
  KEY `idx_historial_cronica` (`es_cronica`),
  CONSTRAINT `fk_historial_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON UPDATE CASCADE,
  CONSTRAINT `fk_historial_especialidad` FOREIGN KEY (`id_especialidad`) REFERENCES `especialidades` (`id_especialidad`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_historial_ficha` FOREIGN KEY (`id_ficha`) REFERENCES `fichas_medicas` (`id_ficha`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_historial_medico` FOREIGN KEY (`id_medico`) REFERENCES `medicos` (`id_medico`) ON UPDATE CASCADE,
  CONSTRAINT `fk_historial_modificador` FOREIGN KEY (`modificado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_historial_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_historial_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursales` (`id_sucursal`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro histórico de atenciones médicas';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_clinico`
--

LOCK TABLES `historial_clinico` WRITE;
/*!40000 ALTER TABLE `historial_clinico` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_clinico` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_demografico`
--

DROP TABLE IF EXISTS `historial_demografico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `historial_demografico` (
  `id_historial_demografico` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente` int(10) unsigned NOT NULL,
  `campo_modificado` varchar(50) NOT NULL,
  `valor_anterior` varchar(255) DEFAULT NULL,
  `valor_nuevo` varchar(255) DEFAULT NULL,
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `modificado_por` int(10) unsigned DEFAULT NULL,
  `motivo_cambio` varchar(255) DEFAULT NULL,
  `ip_modificacion` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id_historial_demografico`),
  KEY `fk_histdem_paciente_idx` (`id_paciente`),
  KEY `fk_histdem_modificador_idx` (`modificado_por`),
  KEY `idx_histdem_campo` (`campo_modificado`),
  CONSTRAINT `fk_histdem_modificador` FOREIGN KEY (`modificado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_histdem_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Historial de cambios en datos demográficos';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_demografico`
--

LOCK TABLES `historial_demografico` WRITE;
/*!40000 ALTER TABLE `historial_demografico` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_demografico` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historico_lecturas`
--

DROP TABLE IF EXISTS `historico_lecturas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `historico_lecturas` (
  `id_historico` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente` int(10) unsigned NOT NULL,
  `tipo_parametro` varchar(50) NOT NULL,
  `fecha` date NOT NULL,
  `promedio_diario` decimal(10,2) DEFAULT NULL,
  `minimo_diario` decimal(10,2) DEFAULT NULL,
  `maximo_diario` decimal(10,2) DEFAULT NULL,
  `desviacion_estandar` decimal(10,4) DEFAULT NULL,
  `tendencia` enum('estable','ascendente','descendente','fluctuante') DEFAULT NULL,
  `cantidad_lecturas` int(10) unsigned NOT NULL DEFAULT 0,
  `cantidad_alertas` int(10) unsigned NOT NULL DEFAULT 0,
  `dentro_objetivo` tinyint(1) DEFAULT NULL,
  `porcentaje_dentro_rango` decimal(5,2) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_historico`),
  UNIQUE KEY `idx_historico_unico` (`id_paciente`,`tipo_parametro`,`fecha`),
  KEY `fk_historico_paciente_idx` (`id_paciente`),
  KEY `idx_historico_tipo` (`tipo_parametro`),
  KEY `idx_historico_fecha` (`fecha`),
  KEY `idx_historico_tendencia` (`tendencia`),
  CONSTRAINT `fk_historico_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Histórico agregado de lecturas de dispositivos';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historico_lecturas`
--

LOCK TABLES `historico_lecturas` WRITE;
/*!40000 ALTER TABLE `historico_lecturas` DISABLE KEYS */;
INSERT INTO `historico_lecturas` VALUES (1,1,'presion_sistolica','2024-10-15',125.00,125.00,125.00,0.0000,'estable',1,0,1,100.00,'2025-11-04 00:39:47'),(2,1,'presion_sistolica','2024-10-20',128.00,128.00,128.00,0.0000,'ascendente',1,0,1,100.00,'2025-11-04 00:39:47'),(3,1,'presion_sistolica','2024-10-25',122.00,122.00,122.00,0.0000,'descendente',1,0,1,100.00,'2025-11-04 00:39:47'),(4,2,'glucosa_ayunas','2024-10-15',105.00,105.00,105.00,0.0000,'estable',1,0,1,100.00,'2025-11-04 00:39:47'),(5,2,'glucosa_ayunas','2024-10-20',98.00,98.00,98.00,0.0000,'descendente',1,0,1,100.00,'2025-11-04 00:39:47'),(6,2,'glucosa_ayunas','2024-10-25',112.00,112.00,112.00,0.0000,'ascendente',1,0,1,100.00,'2025-11-04 00:39:47');
/*!40000 ALTER TABLE `historico_lecturas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `horarios_atencion`
--

DROP TABLE IF EXISTS `horarios_atencion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `horarios_atencion` (
  `id_horario` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `id_sucursal` int(10) unsigned DEFAULT NULL,
  `dia_semana` enum('lunes','martes','miercoles','jueves','viernes','sabado','domingo') NOT NULL,
  `hora_apertura` time NOT NULL,
  `hora_cierre` time NOT NULL,
  `es_festivo` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_especifica` date DEFAULT NULL,
  `nota` varchar(255) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `modificado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_horario`),
  KEY `fk_horario_centro_idx` (`id_centro`),
  KEY `fk_horario_sucursal_idx` (`id_sucursal`),
  KEY `fk_horario_modificador_idx` (`modificado_por`),
  KEY `idx_horario_dia` (`dia_semana`),
  KEY `idx_horario_fecha_especifica` (`fecha_especifica`),
  CONSTRAINT `fk_horario_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_horario_modificador` FOREIGN KEY (`modificado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_horario_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursales` (`id_sucursal`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Horarios de atención de los centros médicos';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `horarios_atencion`
--

LOCK TABLES `horarios_atencion` WRITE;
/*!40000 ALTER TABLE `horarios_atencion` DISABLE KEYS */;
/*!40000 ALTER TABLE `horarios_atencion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hospitalizaciones`
--

DROP TABLE IF EXISTS `hospitalizaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hospitalizaciones` (
  `id_hospitalizacion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente` int(10) unsigned NOT NULL,
  `id_centro` int(10) unsigned NOT NULL,
  `id_medico_tratante` int(10) unsigned DEFAULT NULL,
  `fecha_ingreso` datetime NOT NULL,
  `fecha_egreso` datetime DEFAULT NULL,
  `motivo_ingreso` text NOT NULL,
  `diagnostico_ingreso` varchar(255) DEFAULT NULL,
  `codigo_cie10_ingreso` varchar(10) DEFAULT NULL,
  `diagnostico_egreso` varchar(255) DEFAULT NULL,
  `codigo_cie10_egreso` varchar(10) DEFAULT NULL,
  `tipo_alta` enum('medica','voluntaria','fuga','defuncion','traslado') DEFAULT NULL,
  `resumen_clinico` text DEFAULT NULL,
  `recomendaciones_alta` text DEFAULT NULL,
  `servicio` varchar(100) DEFAULT NULL COMMENT 'UCI, Urgencias, Medicina Interna, etc.',
  `cama_asignada` varchar(50) DEFAULT NULL,
  `dias_hospitalizacion` int(10) unsigned DEFAULT NULL,
  `estado` enum('activa','finalizada','cancelada') NOT NULL DEFAULT 'activa',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_hospitalizacion`),
  KEY `fk_hosp_paciente_idx` (`id_paciente`),
  KEY `fk_hosp_centro_idx` (`id_centro`),
  KEY `fk_hosp_medico_idx` (`id_medico_tratante`),
  KEY `idx_hosp_fechas` (`fecha_ingreso`,`fecha_egreso`),
  KEY `idx_hosp_estado` (`estado`),
  CONSTRAINT `fk_hosp_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON UPDATE CASCADE,
  CONSTRAINT `fk_hosp_medico` FOREIGN KEY (`id_medico_tratante`) REFERENCES `medicos` (`id_medico`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_hosp_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro de hospitalizaciones de pacientes';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hospitalizaciones`
--

LOCK TABLES `hospitalizaciones` WRITE;
/*!40000 ALTER TABLE `hospitalizaciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `hospitalizaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ia_configuraciones`
--

DROP TABLE IF EXISTS `ia_configuraciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ia_configuraciones` (
  `id_configuracion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `id_usuario` int(10) unsigned DEFAULT NULL,
  `tipo_configuracion` varchar(50) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `valor` text NOT NULL,
  `descripcion` text DEFAULT NULL,
  `nivel_acceso` enum('centro','departamento','usuario') NOT NULL DEFAULT 'centro',
  `id_departamento` int(10) unsigned DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_configuracion`),
  KEY `fk_iaconfig_centro_idx` (`id_centro`),
  KEY `fk_iaconfig_usuario_idx` (`id_usuario`),
  KEY `fk_iaconfig_departamento_idx` (`id_departamento`),
  KEY `fk_iaconfig_creador_idx` (`creado_por`),
  KEY `idx_iaconfig_tipo` (`tipo_configuracion`),
  KEY `idx_iaconfig_nivel` (`nivel_acceso`),
  KEY `idx_iaconfig_activo` (`activo`),
  CONSTRAINT `fk_iaconfig_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_iaconfig_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_iaconfig_departamento` FOREIGN KEY (`id_departamento`) REFERENCES `departamentos` (`id_departamento`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_iaconfig_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Configuraciones de los modelos de IA';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ia_configuraciones`
--

LOCK TABLES `ia_configuraciones` WRITE;
/*!40000 ALTER TABLE `ia_configuraciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `ia_configuraciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ia_interacciones_medicamentosas`
--

DROP TABLE IF EXISTS `ia_interacciones_medicamentosas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ia_interacciones_medicamentosas` (
  `id_interaccion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `medicamento1` varchar(100) NOT NULL,
  `medicamento2` varchar(100) NOT NULL,
  `nivel_riesgo` enum('bajo','medio','alto','contraindicado') NOT NULL,
  `descripcion` text NOT NULL,
  `recomendacion` text DEFAULT NULL,
  `fuente` varchar(255) DEFAULT NULL,
  `fecha_actualizacion` date NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `codigo_atc1` varchar(10) DEFAULT NULL,
  `codigo_atc2` varchar(10) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_interaccion`),
  UNIQUE KEY `idx_interaccion_medicamentos` (`medicamento1`,`medicamento2`),
  KEY `idx_interaccion_med1` (`medicamento1`),
  KEY `idx_interaccion_med2` (`medicamento2`),
  KEY `idx_interaccion_riesgo` (`nivel_riesgo`),
  KEY `idx_interaccion_activo` (`activo`),
  KEY `idx_interaccion_atc1` (`codigo_atc1`),
  KEY `idx_interaccion_atc2` (`codigo_atc2`),
  KEY `fk_interaccion_creador_idx` (`creado_por`),
  CONSTRAINT `fk_interaccion_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Base de interacciones medicamentosas';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ia_interacciones_medicamentosas`
--

LOCK TABLES `ia_interacciones_medicamentosas` WRITE;
/*!40000 ALTER TABLE `ia_interacciones_medicamentosas` DISABLE KEYS */;
/*!40000 ALTER TABLE `ia_interacciones_medicamentosas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ia_modelos_diagnostico`
--

DROP TABLE IF EXISTS `ia_modelos_diagnostico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ia_modelos_diagnostico` (
  `id_modelo` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `version` varchar(20) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `proveedor` varchar(100) DEFAULT NULL,
  `fecha_entrenamiento` date DEFAULT NULL,
  `dataset_entrenamiento` varchar(255) DEFAULT NULL,
  `precision` decimal(5,2) DEFAULT NULL,
  `sensibilidad` decimal(5,2) DEFAULT NULL,
  `especificidad` decimal(5,2) DEFAULT NULL,
  `url_api` varchar(255) DEFAULT NULL,
  `configuracion_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`configuracion_json`)),
  `especialidades_aplicables` varchar(255) DEFAULT NULL,
  `limite_uso_diario` int(10) unsigned DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_modelo`),
  KEY `idx_modelo_tipo` (`tipo`),
  KEY `idx_modelo_activo` (`activo`),
  KEY `fk_modelo_creador_idx` (`creado_por`),
  CONSTRAINT `fk_modelo_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Modelos de IA para diagnóstico';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ia_modelos_diagnostico`
--

LOCK TABLES `ia_modelos_diagnostico` WRITE;
/*!40000 ALTER TABLE `ia_modelos_diagnostico` DISABLE KEYS */;
/*!40000 ALTER TABLE `ia_modelos_diagnostico` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ia_patrones_riesgo`
--

DROP TABLE IF EXISTS `ia_patrones_riesgo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ia_patrones_riesgo` (
  `id_patron` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `categoria` varchar(50) NOT NULL,
  `descripcion` text NOT NULL,
  `condiciones_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`condiciones_json`)),
  `nivel_riesgo` enum('bajo','medio','alto','critico') NOT NULL,
  `accion_recomendada` text NOT NULL,
  `tiempo_deteccion` enum('inmediato','diario','semanal','mensual') NOT NULL DEFAULT 'inmediato',
  `especialidades_aplicables` varchar(255) DEFAULT NULL,
  `edad_minima` int(10) unsigned DEFAULT NULL,
  `edad_maxima` int(10) unsigned DEFAULT NULL,
  `genero_aplicable` enum('todos','masculino','femenino') NOT NULL DEFAULT 'todos',
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_patron`),
  KEY `idx_patron_categoria` (`categoria`),
  KEY `idx_patron_riesgo` (`nivel_riesgo`),
  KEY `idx_patron_tiempo` (`tiempo_deteccion`),
  KEY `idx_patron_activo` (`activo`),
  KEY `fk_patron_creador_idx` (`creado_por`),
  CONSTRAINT `fk_patron_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Patrones de riesgo identificados';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ia_patrones_riesgo`
--

LOCK TABLES `ia_patrones_riesgo` WRITE;
/*!40000 ALTER TABLE `ia_patrones_riesgo` DISABLE KEYS */;
/*!40000 ALTER TABLE `ia_patrones_riesgo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ia_sugerencias_tratamientos`
--

DROP TABLE IF EXISTS `ia_sugerencias_tratamientos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ia_sugerencias_tratamientos` (
  `id_sugerencia` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_diagnostico` int(10) unsigned NOT NULL,
  `id_paciente` int(10) unsigned NOT NULL,
  `id_modelo` int(10) unsigned NOT NULL,
  `tratamiento_sugerido` text NOT NULL,
  `justificacion` text NOT NULL,
  `nivel_confianza` decimal(5,2) NOT NULL,
  `fuentes_referencia` text DEFAULT NULL,
  `contraindicaciones` text DEFAULT NULL,
  `alternativas` text DEFAULT NULL,
  `estado` enum('pendiente_revision','aprobada','modificada','rechazada','aplicada') NOT NULL DEFAULT 'pendiente_revision',
  `comentarios_medico` text DEFAULT NULL,
  `revisado_por` int(10) unsigned DEFAULT NULL,
  `fecha_revision` datetime DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_sugerencia`),
  KEY `fk_sugerencia_diagnostico_idx` (`id_diagnostico`),
  KEY `fk_sugerencia_paciente_idx` (`id_paciente`),
  KEY `fk_sugerencia_modelo_idx` (`id_modelo`),
  KEY `fk_sugerencia_revisor_idx` (`revisado_por`),
  KEY `idx_sugerencia_estado` (`estado`),
  KEY `idx_sugerencia_confianza` (`nivel_confianza`),
  CONSTRAINT `fk_sugerencia_diagnostico` FOREIGN KEY (`id_diagnostico`) REFERENCES `diagnosticos` (`id_diagnostico`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_sugerencia_modelo` FOREIGN KEY (`id_modelo`) REFERENCES `ia_modelos_diagnostico` (`id_modelo`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_sugerencia_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_sugerencia_revisor` FOREIGN KEY (`revisado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Sugerencias de tratamientos basadas en IA';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ia_sugerencias_tratamientos`
--

LOCK TABLES `ia_sugerencias_tratamientos` WRITE;
/*!40000 ALTER TABLE `ia_sugerencias_tratamientos` DISABLE KEYS */;
/*!40000 ALTER TABLE `ia_sugerencias_tratamientos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ia_transcripciones`
--

DROP TABLE IF EXISTS `ia_transcripciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ia_transcripciones` (
  `id_transcripcion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_sesion` int(10) unsigned DEFAULT NULL,
  `id_grabacion` int(10) unsigned DEFAULT NULL,
  `id_paciente` int(10) unsigned NOT NULL,
  `id_medico` int(10) unsigned NOT NULL,
  `texto_transcrito` text NOT NULL,
  `duracion_segundos` int(10) unsigned DEFAULT NULL,
  `idioma` varchar(10) NOT NULL DEFAULT 'es',
  `calidad_transcripcion` enum('baja','media','alta') DEFAULT NULL,
  `modelo_usado` varchar(100) DEFAULT NULL,
  `precision_estimada` decimal(5,2) DEFAULT NULL,
  `fecha_consulta` datetime NOT NULL,
  `ha_sido_editada` tinyint(1) NOT NULL DEFAULT 0,
  `editor_id` int(10) unsigned DEFAULT NULL,
  `fecha_edicion` datetime DEFAULT NULL,
  `incorporada_historial` tinyint(1) NOT NULL DEFAULT 0,
  `id_historial` int(10) unsigned DEFAULT NULL,
  `estado` enum('pendiente','procesada','revisada','incorporada','descartada') NOT NULL DEFAULT 'pendiente',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_transcripcion`),
  KEY `fk_trans_sesion_idx` (`id_sesion`),
  KEY `fk_trans_grabacion_idx` (`id_grabacion`),
  KEY `fk_trans_paciente_idx` (`id_paciente`),
  KEY `fk_trans_medico_idx` (`id_medico`),
  KEY `fk_trans_editor_idx` (`editor_id`),
  KEY `fk_trans_historial_idx` (`id_historial`),
  KEY `idx_trans_estado` (`estado`),
  KEY `idx_trans_fecha` (`fecha_consulta`),
  KEY `idx_trans_incorporada` (`incorporada_historial`),
  FULLTEXT KEY `idx_trans_texto` (`texto_transcrito`),
  CONSTRAINT `fk_trans_editor` FOREIGN KEY (`editor_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_trans_grabacion` FOREIGN KEY (`id_grabacion`) REFERENCES `telemedicina_grabaciones` (`id_grabacion`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_trans_historial` FOREIGN KEY (`id_historial`) REFERENCES `historial_clinico` (`id_historial`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_trans_medico` FOREIGN KEY (`id_medico`) REFERENCES `medicos` (`id_medico`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_trans_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_trans_sesion` FOREIGN KEY (`id_sesion`) REFERENCES `telemedicina_sesiones` (`id_sesion`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Transcripciones automáticas';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ia_transcripciones`
--

LOCK TABLES `ia_transcripciones` WRITE;
/*!40000 ALTER TABLE `ia_transcripciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `ia_transcripciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `id_sequences`
--

DROP TABLE IF EXISTS `id_sequences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `id_sequences` (
  `scope` varchar(64) NOT NULL,
  `last_value` bigint(20) NOT NULL,
  PRIMARY KEY (`scope`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `id_sequences`
--

LOCK TABLES `id_sequences` WRITE;
/*!40000 ALTER TABLE `id_sequences` DISABLE KEYS */;
/*!40000 ALTER TABLE `id_sequences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `informes_medicos`
--

DROP TABLE IF EXISTS `informes_medicos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `informes_medicos` (
  `id_informe` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `id_paciente` int(10) unsigned NOT NULL,
  `id_medico` int(10) unsigned NOT NULL,
  `id_plantilla` int(10) unsigned DEFAULT NULL,
  `tipo_informe` varchar(100) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `contenido` text NOT NULL,
  `fecha_emision` date NOT NULL,
  `diagnosticos` text DEFAULT NULL,
  `procedimientos` text DEFAULT NULL,
  `estado` enum('emitido','anulado','actualizado') NOT NULL DEFAULT 'emitido',
  `numero_informe` varchar(50) DEFAULT NULL,
  `url_documento` varchar(255) DEFAULT NULL,
  `id_historial` int(10) unsigned DEFAULT NULL,
  `es_confidencial` tinyint(1) NOT NULL DEFAULT 0,
  `nivel_acceso` enum('publico','medico','restringido') NOT NULL DEFAULT 'medico',
  `destinatario` varchar(255) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_informe`),
  KEY `fk_informe_centro_idx` (`id_centro`),
  KEY `fk_informe_paciente_idx` (`id_paciente`),
  KEY `fk_informe_medico_idx` (`id_medico`),
  KEY `fk_informe_plantilla_idx` (`id_plantilla`),
  KEY `fk_informe_historial_idx` (`id_historial`),
  KEY `idx_informe_tipo` (`tipo_informe`),
  KEY `idx_informe_fecha` (`fecha_emision`),
  KEY `idx_informe_estado` (`estado`),
  KEY `idx_informe_numero` (`numero_informe`),
  KEY `idx_informe_confidencial` (`es_confidencial`),
  KEY `idx_informe_acceso` (`nivel_acceso`),
  CONSTRAINT `fk_informe_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_informe_historial` FOREIGN KEY (`id_historial`) REFERENCES `historial_clinico` (`id_historial`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_informe_medico` FOREIGN KEY (`id_medico`) REFERENCES `medicos` (`id_medico`) ON UPDATE CASCADE,
  CONSTRAINT `fk_informe_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_informe_plantilla` FOREIGN KEY (`id_plantilla`) REFERENCES `plantillas_documentos` (`id_plantilla`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Informes médicos generados';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `informes_medicos`
--

LOCK TABLES `informes_medicos` WRITE;
/*!40000 ALTER TABLE `informes_medicos` DISABLE KEYS */;
/*!40000 ALTER TABLE `informes_medicos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `integracion_fonasa`
--

DROP TABLE IF EXISTS `integracion_fonasa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `integracion_fonasa` (
  `id_integracion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `id_paciente` int(10) unsigned NOT NULL,
  `rut_paciente` varchar(12) NOT NULL,
  `fecha_consulta` datetime NOT NULL,
  `tipo_consulta` enum('beneficiario','cotizante','derechos','certificado') NOT NULL,
  `resultado_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`resultado_json`)),
  `resultado_estado` varchar(20) DEFAULT NULL,
  `tramo_fonasa` varchar(2) DEFAULT NULL,
  `prevision_salud` varchar(50) DEFAULT NULL,
  `certificado_url` varchar(255) DEFAULT NULL,
  `estado` enum('ok','error','pendiente') NOT NULL,
  `mensaje_error` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_integracion`),
  KEY `fk_fonasa_centro_idx` (`id_centro`),
  KEY `fk_fonasa_paciente_idx` (`id_paciente`),
  KEY `idx_fonasa_rut` (`rut_paciente`),
  KEY `idx_fonasa_fecha` (`fecha_consulta`),
  KEY `idx_fonasa_tipo` (`tipo_consulta`),
  KEY `idx_fonasa_estado` (`estado`),
  KEY `idx_fonasa_tramo` (`tramo_fonasa`),
  CONSTRAINT `fk_fonasa_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_fonasa_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Integración con FONASA';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `integracion_fonasa`
--

LOCK TABLES `integracion_fonasa` WRITE;
/*!40000 ALTER TABLE `integracion_fonasa` DISABLE KEYS */;
/*!40000 ALTER TABLE `integracion_fonasa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `integracion_isapre`
--

DROP TABLE IF EXISTS `integracion_isapre`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `integracion_isapre` (
  `id_integracion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `id_paciente` int(10) unsigned NOT NULL,
  `rut_paciente` varchar(12) NOT NULL,
  `nombre_isapre` varchar(100) NOT NULL,
  `codigo_isapre` varchar(20) DEFAULT NULL,
  `fecha_consulta` datetime NOT NULL,
  `tipo_consulta` enum('afiliacion','cobertura','bonos','autorizacion') NOT NULL,
  `resultado_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`resultado_json`)),
  `resultado_estado` varchar(20) DEFAULT NULL,
  `numero_contrato` varchar(50) DEFAULT NULL,
  `plan_salud` varchar(100) DEFAULT NULL,
  `estado_afiliacion` varchar(50) DEFAULT NULL,
  `codigo_autorizacion` varchar(50) DEFAULT NULL,
  `bono_url` varchar(255) DEFAULT NULL,
  `estado` enum('ok','error','pendiente') NOT NULL,
  `mensaje_error` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_integracion`),
  KEY `fk_isapre_centro_idx` (`id_centro`),
  KEY `fk_isapre_paciente_idx` (`id_paciente`),
  KEY `idx_isapre_rut` (`rut_paciente`),
  KEY `idx_isapre_nombre` (`nombre_isapre`),
  KEY `idx_isapre_fecha` (`fecha_consulta`),
  KEY `idx_isapre_tipo` (`tipo_consulta`),
  KEY `idx_isapre_estado` (`estado`),
  KEY `idx_isapre_codigo` (`codigo_autorizacion`),
  CONSTRAINT `fk_isapre_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_isapre_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Integración con ISAPREs';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `integracion_isapre`
--

LOCK TABLES `integracion_isapre` WRITE;
/*!40000 ALTER TABLE `integracion_isapre` DISABLE KEYS */;
/*!40000 ALTER TABLE `integracion_isapre` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `integracion_laboratorios`
--

DROP TABLE IF EXISTS `integracion_laboratorios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `integracion_laboratorios` (
  `id_integracion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `nombre_laboratorio` varchar(100) NOT NULL,
  `codigo_laboratorio` varchar(20) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `url_api` varchar(255) DEFAULT NULL,
  `metodo_autenticacion` varchar(50) DEFAULT NULL,
  `credenciales_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`credenciales_json`)),
  `formato_datos` varchar(50) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_ultima_sincronizacion` datetime DEFAULT NULL,
  `estado_conexion` enum('activo','inactivo','error','mantenimiento') NOT NULL DEFAULT 'activo',
  `mensaje_estado` varchar(255) DEFAULT NULL,
  `mapeo_examenes_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`mapeo_examenes_json`)),
  `contacto_tecnico` varchar(255) DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_integracion`),
  KEY `fk_integlab_centro_idx` (`id_centro`),
  KEY `fk_integlab_creador_idx` (`creado_por`),
  KEY `idx_integlab_nombre` (`nombre_laboratorio`),
  KEY `idx_integlab_codigo` (`codigo_laboratorio`),
  KEY `idx_integlab_activo` (`activo`),
  KEY `idx_integlab_estado` (`estado_conexion`),
  CONSTRAINT `fk_integlab_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_integlab_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Conexión con laboratorios externos';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `integracion_laboratorios`
--

LOCK TABLES `integracion_laboratorios` WRITE;
/*!40000 ALTER TABLE `integracion_laboratorios` DISABLE KEYS */;
/*!40000 ALTER TABLE `integracion_laboratorios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `integraciones_externas`
--

DROP TABLE IF EXISTS `integraciones_externas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `integraciones_externas` (
  `id_integracion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `url_api` varchar(255) DEFAULT NULL,
  `metodo_autenticacion` varchar(50) DEFAULT NULL,
  `credenciales_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`credenciales_json`)),
  `configuracion_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`configuracion_json`)),
  `estado` enum('activa','inactiva','error','mantenimiento','configuracion') NOT NULL DEFAULT 'configuracion',
  `ultima_sincronizacion` datetime DEFAULT NULL,
  `resultado_ultima_sincronizacion` varchar(255) DEFAULT NULL,
  `intervalo_sincronizacion` varchar(50) DEFAULT NULL,
  `proxima_sincronizacion` datetime DEFAULT NULL,
  `version_api` varchar(20) DEFAULT NULL,
  `limite_peticiones_diarias` int(10) unsigned DEFAULT NULL,
  `contador_peticiones_diarias` int(10) unsigned NOT NULL DEFAULT 0,
  `fecha_ultimo_reset_contador` date DEFAULT NULL,
  `timeout_segundos` int(10) unsigned NOT NULL DEFAULT 30,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `responsable_id` int(10) unsigned DEFAULT NULL,
  `contacto_soporte` varchar(255) DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_integracion`),
  KEY `fk_integext_centro_idx` (`id_centro`),
  KEY `fk_integext_responsable_idx` (`responsable_id`),
  KEY `fk_integext_creador_idx` (`creado_por`),
  KEY `idx_integext_tipo` (`tipo`),
  KEY `idx_integext_estado` (`estado`),
  KEY `idx_integext_sincronizacion` (`ultima_sincronizacion`,`proxima_sincronizacion`),
  KEY `idx_integext_fechas` (`fecha_inicio`,`fecha_vencimiento`),
  CONSTRAINT `fk_integext_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_integext_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_integext_responsable` FOREIGN KEY (`responsable_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Configuración de integraciones externas';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `integraciones_externas`
--

LOCK TABLES `integraciones_externas` WRITE;
/*!40000 ALTER TABLE `integraciones_externas` DISABLE KEYS */;
/*!40000 ALTER TABLE `integraciones_externas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `interacciones`
--

DROP TABLE IF EXISTS `interacciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `interacciones` (
  `id_interaccion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_medicamento1` int(10) unsigned NOT NULL,
  `id_medicamento2` int(10) unsigned NOT NULL,
  `severidad` enum('leve','moderada','grave','contraindicada') NOT NULL,
  `descripcion` text NOT NULL,
  `mecanismo` text DEFAULT NULL,
  `manejo` text DEFAULT NULL,
  `referencia` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_interaccion`),
  UNIQUE KEY `idx_interaccion_meds` (`id_medicamento1`,`id_medicamento2`),
  KEY `idx_interaccion_med1` (`id_medicamento1`),
  KEY `idx_interaccion_med2` (`id_medicamento2`),
  KEY `idx_interaccion_creador` (`creado_por`),
  KEY `idx_interaccion_severidad` (`severidad`),
  KEY `idx_interaccion_activo` (`activo`),
  CONSTRAINT `fk_interacciones_creado_por` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_interacciones_medicamento1` FOREIGN KEY (`id_medicamento1`) REFERENCES `medicamentos` (`id_medicamento`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_interacciones_medicamento2` FOREIGN KEY (`id_medicamento2`) REFERENCES `medicamentos` (`id_medicamento`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro de interacciones medicamentosas';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `interacciones`
--

LOCK TABLES `interacciones` WRITE;
/*!40000 ALTER TABLE `interacciones` DISABLE KEYS */;
INSERT INTO `interacciones` VALUES (1,11,2,'moderada','Los AINEs pueden reducir el efecto antihipertensivo de los IECAs','Los AINEs inhiben la síntesis de prostaglandinas vasodilatadoras','Monitorear presión arterial. Considerar analgésico alternativo.',NULL,1,'2025-11-04 00:40:41','2025-11-04 00:40:41',1),(2,16,9,'leve','Ciprofloxacino puede alterar los niveles de glucosa','Mecanismo no completamente establecido','Monitorear glucemia durante tratamiento antibiótico.',NULL,1,'2025-11-04 00:40:41','2025-11-04 00:40:41',1),(3,33,43,'grave','Fluconazol aumenta niveles de atorvastatina, riesgo de miopatía','Inhibición del CYP3A4','Reducir dosis de estatina o suspender temporalmente. Monitorear CPK.',NULL,1,'2025-11-04 00:40:41','2025-11-04 00:40:41',1),(4,35,37,'moderada','Fluoxetina puede aumentar niveles de alprazolam','Inhibición del CYP3A4','Ajustar dosis de alprazolam. Monitorear sedación excesiva.',NULL,1,'2025-11-04 00:40:41','2025-11-04 00:40:41',1),(5,39,38,'grave','Riesgo de síndrome serotoninérgico','Ambos aumentan niveles de serotonina','Evitar combinación si es posible. Monitorear síntomas de síndrome serotoninérgico.',NULL,1,'2025-11-04 00:40:41','2025-11-04 00:40:41',1),(6,31,2,'moderada','Ibuprofeno puede reducir efecto antiagregante de aspirina','Competencia por sitio de unión en COX-1','Tomar aspirina al menos 2 horas antes de ibuprofeno.',NULL,1,'2025-11-04 00:40:41','2025-11-04 00:40:41',1);
/*!40000 ALTER TABLE `interacciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `interconsultas`
--

DROP TABLE IF EXISTS `interconsultas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `interconsultas` (
  `id_interconsulta` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `id_paciente` int(10) unsigned NOT NULL,
  `id_medico_solicitante` int(10) unsigned NOT NULL,
  `id_medico_destinatario` int(10) unsigned DEFAULT NULL,
  `id_especialidad_destinatario` int(10) unsigned DEFAULT NULL,
  `id_centro_destinatario` int(10) unsigned DEFAULT NULL,
  `fecha_solicitud` datetime NOT NULL,
  `tipo_interconsulta` enum('opinion','evaluacion','seguimiento','tratamiento','procedimiento') NOT NULL,
  `motivo` text NOT NULL,
  `diagnostico` varchar(255) DEFAULT NULL,
  `codigo_cie10` varchar(10) DEFAULT NULL,
  `datos_clinicos` text DEFAULT NULL,
  `examenes_realizados` text DEFAULT NULL,
  `tratamiento_actual` text DEFAULT NULL,
  `prioridad` enum('normal','preferente','urgente') NOT NULL DEFAULT 'normal',
  `estado` enum('solicitada','recibida','en_proceso','respondida','cancelada','rechazada') NOT NULL DEFAULT 'solicitada',
  `respuesta` text DEFAULT NULL,
  `recomendaciones` text DEFAULT NULL,
  `fecha_respuesta` datetime DEFAULT NULL,
  `respondido_por` int(10) unsigned DEFAULT NULL,
  `tiempo_respuesta_horas` int(10) unsigned DEFAULT NULL,
  `adjuntos_url` varchar(255) DEFAULT NULL,
  `id_historial` int(10) unsigned DEFAULT NULL,
  `notas_adicionales` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_interconsulta`),
  KEY `fk_interconsulta_centro_idx` (`id_centro`),
  KEY `fk_interconsulta_paciente_idx` (`id_paciente`),
  KEY `fk_interconsulta_solicitante_idx` (`id_medico_solicitante`),
  KEY `fk_interconsulta_destinatario_idx` (`id_medico_destinatario`),
  KEY `fk_interconsulta_especialidad_idx` (`id_especialidad_destinatario`),
  KEY `fk_interconsulta_centro_dest_idx` (`id_centro_destinatario`),
  KEY `fk_interconsulta_respondedor_idx` (`respondido_por`),
  KEY `fk_interconsulta_historial_idx` (`id_historial`),
  KEY `idx_interconsulta_fecha` (`fecha_solicitud`),
  KEY `idx_interconsulta_tipo` (`tipo_interconsulta`),
  KEY `idx_interconsulta_prioridad` (`prioridad`),
  KEY `idx_interconsulta_estado` (`estado`),
  KEY `idx_interconsulta_diagnostico` (`codigo_cie10`),
  KEY `idx_interconsulta_respuesta` (`fecha_respuesta`),
  CONSTRAINT `fk_interconsulta_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_interconsulta_centro_dest` FOREIGN KEY (`id_centro_destinatario`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_interconsulta_destinatario` FOREIGN KEY (`id_medico_destinatario`) REFERENCES `medicos` (`id_medico`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_interconsulta_especialidad` FOREIGN KEY (`id_especialidad_destinatario`) REFERENCES `especialidades` (`id_especialidad`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_interconsulta_historial` FOREIGN KEY (`id_historial`) REFERENCES `historial_clinico` (`id_historial`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_interconsulta_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_interconsulta_respondedor` FOREIGN KEY (`respondido_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_interconsulta_solicitante` FOREIGN KEY (`id_medico_solicitante`) REFERENCES `medicos` (`id_medico`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Sistema de interconsultas';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `interconsultas`
--

LOCK TABLES `interconsultas` WRITE;
/*!40000 ALTER TABLE `interconsultas` DISABLE KEYS */;
/*!40000 ALTER TABLE `interconsultas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lecturas_dispositivos`
--

DROP TABLE IF EXISTS `lecturas_dispositivos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lecturas_dispositivos` (
  `id_lectura` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id_dispositivo_iot` int(10) unsigned NOT NULL,
  `id_paciente` int(10) unsigned NOT NULL,
  `fecha_lectura` datetime NOT NULL,
  `tipo_lectura` varchar(50) NOT NULL,
  `valor` decimal(10,4) NOT NULL,
  `unidad` varchar(20) NOT NULL,
  `precisión` decimal(5,2) DEFAULT NULL,
  `latitud` decimal(10,6) DEFAULT NULL,
  `longitud` decimal(10,6) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `validada` tinyint(1) NOT NULL DEFAULT 0,
  `validada_por` int(10) unsigned DEFAULT NULL,
  `fecha_validacion` datetime DEFAULT NULL,
  `id_historial` int(10) unsigned DEFAULT NULL,
  `fuera_de_rango` tinyint(1) NOT NULL DEFAULT 0,
  `genero_alerta` tinyint(1) NOT NULL DEFAULT 0,
  `id_alerta` int(10) unsigned DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_lectura`),
  KEY `fk_lectura_dispositivo_idx` (`id_dispositivo_iot`),
  KEY `fk_lectura_paciente_idx` (`id_paciente`),
  KEY `fk_lectura_validador_idx` (`validada_por`),
  KEY `fk_lectura_historial_idx` (`id_historial`),
  KEY `idx_lectura_fecha` (`fecha_lectura`),
  KEY `idx_lectura_tipo` (`tipo_lectura`),
  KEY `idx_lectura_validada` (`validada`),
  KEY `idx_lectura_rango` (`fuera_de_rango`),
  KEY `idx_lectura_alerta` (`genero_alerta`),
  CONSTRAINT `fk_lectura_dispositivo` FOREIGN KEY (`id_dispositivo_iot`) REFERENCES `dispositivos_iot` (`id_dispositivo_iot`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_lectura_historial` FOREIGN KEY (`id_historial`) REFERENCES `historial_clinico` (`id_historial`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_lectura_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_lectura_validador` FOREIGN KEY (`validada_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Lecturas de dispositivos IoT';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lecturas_dispositivos`
--

LOCK TABLES `lecturas_dispositivos` WRITE;
/*!40000 ALTER TABLE `lecturas_dispositivos` DISABLE KEYS */;
INSERT INTO `lecturas_dispositivos` VALUES (1,1,1,'2024-10-15 08:00:00','presion_sistolica',125.0000,'mmHg',2.00,NULL,NULL,NULL,1,1,'2024-10-15 09:00:00',NULL,0,0,NULL,NULL,'2025-11-04 00:39:15'),(2,1,1,'2024-10-15 08:00:00','presion_diastolica',82.0000,'mmHg',2.00,NULL,NULL,NULL,1,1,'2024-10-15 09:00:00',NULL,0,0,NULL,NULL,'2025-11-04 00:39:15'),(3,1,1,'2024-10-15 08:00:00','frecuencia_cardiaca',72.0000,'bpm',1.00,NULL,NULL,NULL,1,1,'2024-10-15 09:00:00',NULL,0,0,NULL,NULL,'2025-11-04 00:39:15'),(4,1,1,'2024-10-20 08:15:00','presion_sistolica',128.0000,'mmHg',2.00,NULL,NULL,NULL,1,1,'2024-10-20 09:00:00',NULL,0,0,NULL,NULL,'2025-11-04 00:39:15'),(5,1,1,'2024-10-20 08:15:00','presion_diastolica',84.0000,'mmHg',2.00,NULL,NULL,NULL,1,1,'2024-10-20 09:00:00',NULL,0,0,NULL,NULL,'2025-11-04 00:39:15'),(6,1,1,'2024-10-25 08:30:00','presion_sistolica',122.0000,'mmHg',2.00,NULL,NULL,NULL,1,1,'2024-10-25 09:00:00',NULL,0,0,NULL,NULL,'2025-11-04 00:39:15'),(7,1,1,'2024-10-25 08:30:00','presion_diastolica',80.0000,'mmHg',2.00,NULL,NULL,NULL,1,1,'2024-10-25 09:00:00',NULL,0,0,NULL,NULL,'2025-11-04 00:39:15'),(8,1,1,'2024-11-01 08:00:00','presion_sistolica',130.0000,'mmHg',2.00,NULL,NULL,NULL,1,1,'2024-11-01 09:00:00',NULL,0,0,NULL,NULL,'2025-11-04 00:39:15'),(9,1,1,'2024-11-01 08:00:00','presion_diastolica',85.0000,'mmHg',2.00,NULL,NULL,NULL,1,1,'2024-11-01 09:00:00',NULL,0,0,NULL,NULL,'2025-11-04 00:39:15'),(10,1,1,'2024-11-02 08:00:00','presion_sistolica',118.0000,'mmHg',2.00,NULL,NULL,NULL,1,1,'2024-11-02 09:00:00',NULL,0,0,NULL,NULL,'2025-11-04 00:39:15'),(11,1,1,'2024-11-02 08:00:00','presion_diastolica',78.0000,'mmHg',2.00,NULL,NULL,NULL,1,1,'2024-11-02 09:00:00',NULL,0,0,NULL,NULL,'2025-11-04 00:39:15'),(12,1,1,'2024-11-03 08:00:00','presion_sistolica',124.0000,'mmHg',2.00,NULL,NULL,NULL,0,NULL,NULL,NULL,0,0,NULL,NULL,'2025-11-04 00:39:15'),(13,1,1,'2024-11-03 08:00:00','presion_diastolica',82.0000,'mmHg',2.00,NULL,NULL,NULL,0,NULL,NULL,NULL,0,0,NULL,NULL,'2025-11-04 00:39:15'),(14,2,2,'2024-10-15 07:00:00','glucosa_ayunas',105.0000,'mg/dL',5.00,NULL,NULL,'{\"momento\": \"ayunas\", \"horas_ayuno\": 8}',1,1,'2024-10-15 08:00:00',NULL,0,0,NULL,NULL,'2025-11-04 00:39:30'),(15,2,2,'2024-10-15 14:00:00','glucosa_postprandial',145.0000,'mg/dL',5.00,NULL,NULL,'{\"momento\": \"postprandial\", \"horas_post_comida\": 2}',1,1,'2024-10-15 15:00:00',NULL,0,0,NULL,NULL,'2025-11-04 00:39:30'),(16,2,2,'2024-10-20 07:15:00','glucosa_ayunas',98.0000,'mg/dL',5.00,NULL,NULL,'{\"momento\": \"ayunas\", \"horas_ayuno\": 10}',1,1,'2024-10-20 08:00:00',NULL,0,0,NULL,NULL,'2025-11-04 00:39:30'),(17,2,2,'2024-10-20 14:30:00','glucosa_postprandial',152.0000,'mg/dL',5.00,NULL,NULL,'{\"momento\": \"postprandial\", \"horas_post_comida\": 2}',1,1,'2024-10-20 15:00:00',NULL,0,0,NULL,NULL,'2025-11-04 00:39:30'),(18,2,2,'2024-10-25 07:00:00','glucosa_ayunas',112.0000,'mg/dL',5.00,NULL,NULL,'{\"momento\": \"ayunas\", \"horas_ayuno\": 9}',1,1,'2024-10-25 08:00:00',NULL,0,0,NULL,NULL,'2025-11-04 00:39:30'),(19,2,2,'2024-11-01 07:00:00','glucosa_ayunas',108.0000,'mg/dL',5.00,NULL,NULL,'{\"momento\": \"ayunas\", \"horas_ayuno\": 8}',1,1,'2024-11-01 08:00:00',NULL,0,0,NULL,NULL,'2025-11-04 00:39:30'),(20,2,2,'2024-11-01 14:00:00','glucosa_postprandial',148.0000,'mg/dL',5.00,NULL,NULL,'{\"momento\": \"postprandial\", \"horas_post_comida\": 2}',1,1,'2024-11-01 15:00:00',NULL,0,0,NULL,NULL,'2025-11-04 00:39:30'),(21,2,2,'2024-11-02 07:00:00','glucosa_ayunas',102.0000,'mg/dL',5.00,NULL,NULL,'{\"momento\": \"ayunas\", \"horas_ayuno\": 8}',1,1,'2024-11-02 08:00:00',NULL,0,0,NULL,NULL,'2025-11-04 00:39:30'),(22,2,2,'2024-11-03 07:30:00','glucosa_ayunas',110.0000,'mg/dL',5.00,NULL,NULL,'{\"momento\": \"ayunas\", \"horas_ayuno\": 8}',0,NULL,NULL,NULL,0,0,NULL,NULL,'2025-11-04 00:39:30'),(23,5,8,'2024-10-15 10:00:00','saturacion_oxigeno',97.0000,'%',1.00,NULL,NULL,NULL,1,NULL,NULL,NULL,0,0,NULL,NULL,'2025-11-04 00:39:30'),(24,5,8,'2024-10-15 10:00:00','frecuencia_respiratoria',16.0000,'rpm',1.00,NULL,NULL,NULL,1,NULL,NULL,NULL,0,0,NULL,NULL,'2025-11-04 00:39:30'),(25,5,8,'2024-10-20 10:00:00','saturacion_oxigeno',96.0000,'%',1.00,NULL,NULL,NULL,1,NULL,NULL,NULL,0,0,NULL,NULL,'2025-11-04 00:39:30'),(26,5,8,'2024-10-20 10:00:00','frecuencia_respiratoria',17.0000,'rpm',1.00,NULL,NULL,NULL,1,NULL,NULL,NULL,0,0,NULL,NULL,'2025-11-04 00:39:30'),(27,5,8,'2024-11-01 10:00:00','saturacion_oxigeno',98.0000,'%',1.00,NULL,NULL,NULL,1,NULL,NULL,NULL,0,0,NULL,NULL,'2025-11-04 00:39:30'),(28,5,8,'2024-11-01 10:00:00','frecuencia_respiratoria',15.0000,'rpm',1.00,NULL,NULL,NULL,1,NULL,NULL,NULL,0,0,NULL,NULL,'2025-11-04 00:39:30'),(29,5,8,'2024-11-03 10:00:00','saturacion_oxigeno',97.0000,'%',1.00,NULL,NULL,NULL,0,NULL,NULL,NULL,0,0,NULL,NULL,'2025-11-04 00:39:30'),(30,7,14,'2024-10-01 06:00:00','peso',90.0000,'kg',0.10,NULL,NULL,NULL,1,NULL,NULL,NULL,1,0,NULL,NULL,'2025-11-04 00:39:30'),(31,7,14,'2024-10-08 06:00:00','peso',89.2000,'kg',0.10,NULL,NULL,NULL,1,NULL,NULL,NULL,1,0,NULL,NULL,'2025-11-04 00:39:30'),(32,7,14,'2024-10-15 06:00:00','peso',88.5000,'kg',0.10,NULL,NULL,NULL,1,NULL,NULL,NULL,1,0,NULL,NULL,'2025-11-04 00:39:30'),(33,7,14,'2024-10-22 06:00:00','peso',87.8000,'kg',0.10,NULL,NULL,NULL,1,NULL,NULL,NULL,1,0,NULL,NULL,'2025-11-04 00:39:30'),(34,7,14,'2024-10-29 06:00:00','peso',87.2000,'kg',0.10,NULL,NULL,NULL,1,NULL,NULL,NULL,1,0,NULL,NULL,'2025-11-04 00:39:30'),(35,7,14,'2024-11-03 06:00:00','peso',86.5000,'kg',0.10,NULL,NULL,NULL,0,NULL,NULL,NULL,1,0,NULL,NULL,'2025-11-04 00:39:30');
/*!40000 ALTER TABLE `lecturas_dispositivos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `licencias_medicas`
--

DROP TABLE IF EXISTS `licencias_medicas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `licencias_medicas` (
  `id_licencia` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `id_paciente` int(10) unsigned NOT NULL,
  `id_medico` int(10) unsigned NOT NULL,
  `id_historial` int(10) unsigned DEFAULT NULL,
  `numero_licencia` varchar(50) DEFAULT NULL,
  `tipo_licencia` enum('enfermedad_comun','maternal','paternal','accidente_laboral','enfermedad_profesional') NOT NULL,
  `diagnostico` varchar(255) NOT NULL,
  `codigo_cie10` varchar(10) DEFAULT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_termino` date NOT NULL,
  `dias_totales` int(10) unsigned NOT NULL,
  `tipo_reposo` enum('total','parcial') NOT NULL DEFAULT 'total',
  `lugar_reposo` varchar(100) DEFAULT NULL,
  `es_continuacion` tinyint(1) NOT NULL DEFAULT 0,
  `licencia_anterior` varchar(50) DEFAULT NULL,
  `estado` enum('emitida','enviada','aprobada','rechazada','reconsideracion','apelacion') NOT NULL DEFAULT 'emitida',
  `url_documento` varchar(255) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `fecha_emision` datetime NOT NULL,
  `fecha_envio` datetime DEFAULT NULL,
  `fecha_respuesta` datetime DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_licencia`),
  KEY `fk_licencia_centro_idx` (`id_centro`),
  KEY `fk_licencia_paciente_idx` (`id_paciente`),
  KEY `fk_licencia_medico_idx` (`id_medico`),
  KEY `fk_licencia_historial_idx` (`id_historial`),
  KEY `idx_licencia_numero` (`numero_licencia`),
  KEY `idx_licencia_tipo` (`tipo_licencia`),
  KEY `idx_licencia_fechas` (`fecha_inicio`,`fecha_termino`),
  KEY `idx_licencia_estado` (`estado`),
  KEY `idx_licencia_diagnostico` (`codigo_cie10`),
  CONSTRAINT `fk_licencia_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_licencia_historial` FOREIGN KEY (`id_historial`) REFERENCES `historial_clinico` (`id_historial`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_licencia_medico` FOREIGN KEY (`id_medico`) REFERENCES `medicos` (`id_medico`) ON UPDATE CASCADE,
  CONSTRAINT `fk_licencia_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Licencias médicas emitidas';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `licencias_medicas`
--

LOCK TABLES `licencias_medicas` WRITE;
/*!40000 ALTER TABLE `licencias_medicas` DISABLE KEYS */;
/*!40000 ALTER TABLE `licencias_medicas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `logs_sistema`
--

DROP TABLE IF EXISTS `logs_sistema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `logs_sistema` (
  `id_log` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id_usuario` int(10) unsigned DEFAULT NULL,
  `fecha_hora` timestamp NOT NULL DEFAULT current_timestamp(),
  `tipo` enum('info','warning','error','security','audit') NOT NULL,
  `modulo` varchar(50) NOT NULL,
  `accion` varchar(100) NOT NULL,
  `descripcion` text NOT NULL,
  `ip_origen` varchar(45) DEFAULT NULL,
  `agente_usuario` varchar(255) DEFAULT NULL,
  `objeto_tipo` varchar(50) DEFAULT NULL,
  `objeto_id` varchar(100) DEFAULT NULL,
  `datos_antiguos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`datos_antiguos`)),
  `datos_nuevos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`datos_nuevos`)),
  `exitoso` tinyint(1) NOT NULL DEFAULT 1,
  `mensaje_error` text DEFAULT NULL,
  `nivel_severidad` tinyint(3) unsigned NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_log`),
  KEY `fk_log_usuario_idx` (`id_usuario`),
  KEY `idx_log_fecha` (`fecha_hora`),
  KEY `idx_log_tipo` (`tipo`),
  KEY `idx_log_modulo` (`modulo`),
  KEY `idx_log_accion` (`accion`),
  KEY `idx_log_objeto` (`objeto_tipo`,`objeto_id`(50)),
  KEY `idx_log_severidad` (`nivel_severidad`),
  CONSTRAINT `fk_log_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro de actividades y eventos del sistema';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logs_sistema`
--

LOCK TABLES `logs_sistema` WRITE;
/*!40000 ALTER TABLE `logs_sistema` DISABLE KEYS */;
INSERT INTO `logs_sistema` VALUES (6,1,'2025-10-28 13:42:12','audit','centros','Crear Centro','Se creó el centro médico ID 1','192.168.1.100','Mozilla/5.0 (Windows NT 10.0; Win64; x64)','centro','1',NULL,NULL,1,NULL,3),(7,1,'2025-10-28 12:42:12','info','centros','Editar Centro','Se actualizó la información del centro ID 1','192.168.1.100','Mozilla/5.0 (Windows NT 10.0; Win64; x64)','centro','1',NULL,NULL,1,NULL,2),(8,2,'2025-10-28 11:42:12','warning','centros','Suspender Centro','Se suspendió temporalmente el centro ID 1','192.168.1.101','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)','centro','1',NULL,NULL,1,NULL,5),(9,1,'2025-10-28 10:42:12','audit','centros','Activar Centro','Se activó el centro médico ID 1','192.168.1.100','Mozilla/5.0 (Windows NT 10.0; Win64; x64)','centro','1',NULL,NULL,1,NULL,3),(10,3,'2025-10-28 09:42:12','error','centros','Error al Actualizar','Falló la actualización del centro ID 1 por timeout','192.168.1.102','Mozilla/5.0 (X11; Linux x86_64)','centro','1',NULL,NULL,0,NULL,7),(11,1,'2025-10-28 08:42:12','info','centros','Editar Configuración','Se modificó la configuración del centro ID 1','192.168.1.100','Mozilla/5.0 (Windows NT 10.0; Win64; x64)','centro','1',NULL,NULL,1,NULL,2),(12,2,'2025-10-28 07:42:12','security','centros','Acceso Administrativo','Acceso administrativo al centro ID 1','192.168.1.101','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)','centro','1',NULL,NULL,1,NULL,6),(13,1,'2025-10-28 06:42:12','audit','centros','Actualizar Datos','Se actualizaron los datos del centro ID 1','192.168.1.100','Mozilla/5.0 (Windows NT 10.0; Win64; x64)','centro','1',NULL,NULL,1,NULL,3),(14,NULL,'2025-10-28 15:19:15','audit','usuarios','crear_usuario','Usuario creado: DULIANISE  SAINT AMOUR (peterly.infoges@gmail.com)','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','usuario','17',NULL,'{\"username\":\"duli\",\"password\":\"[OCULTO]\",\"confirmPassword\":\"Aplw2019$$\",\"rut\":\"26.399.128-1\",\"nombre\":\"DULIANISE\",\"apellido_paterno\":\" SAINT AMOUR\",\"apellido_materno\":\"BRENORD\",\"email\":\"peterly.infoges@gmail.com\",\"telefono\":\"+56949306385\",\"celular\":\"984150439\",\"fecha_nacimiento\":\"2004-03-26\",\"genero\":\"femenino\",\"direccion\":\"Valles de Don Felipe, pje 7 , #167 Curico\",\"ciudad\":\"curico\",\"region\":\"Región Metropolitana\",\"id_centro_principal\":\"1\",\"id_sucursal_principal\":\"1\",\"roles\":[5,6,4,1,2,3],\"foto_perfil_url\":\"data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxISEhUSExMVFRUVFx0aGBUXFxcXFxoaFxUXFxYWGBcYHiggGBolGxgYITEhJSkrLi4uGB8zODMsNygtLisBCgoKDg0OGxAQGy0mICUwLS0tLy0vLS0vLS0vLS0rLS0tLS0tLS0tLS0tMi0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAQMAwgMBIgACEQEDEQH/xAAcAAAABwEBAAAAAAAAAAAAAAAAAgMEBQYHAQj/xABGEAACAQIEAgcFBQUHAgYDAAABAhEAAwQSITEFQQYTIlFhcZEHMoGhwSNCUrHRFGJykvAzU4KistLhFSRDRGNzwvEWF7P/xAAaAQACAwEBAAAAAAAAAAAAAAADBAABAgUG/8QAMhEAAgIBBAAFAgMHBQAAAAAAAAECEQMEEiExBRMiQVFhcYGRsQYyUsHh8PEUYqGy0f/aAAwDAQACEQMRAD8A2Ph2toeRHoTS1jf4fpSXC/cI7ifoaVtbigfwhH7i9NSblHZ3lgoWB3kzsDyoZrv4U/mP6eVEMJ0J57nd8qVsMxPaFBb5Kq0atGhO0idTXDcb8I/m8/DyqJFuV+wvTW8EkyT4+g8KVtXSTBEGJ3nupnxe5as27l+4+VEUsx02A/Or6KVe4bqbZ5n0/wCKUt2lnRuY5dxkb15j6WdOsXi7pPWPbtg9i0pKgDX3svvNB1NQuC6QYq0wa3fuow5h2/XWpcjflxPXl3EZTEGiHFjuNZH7MPaZcxNxcJjGQ3G/srzLBZp/s3ywJjYxrtvvrQVx91PUj9a0qMNUHTFAmI3pYKBypsrHOqsiiQSCCT7scoHfTi4DyqNFAKgmYEjY0AoGw3ogzzsseZn8qUbas0iCJsrObLJ76F62H94HSukk+FFNv4+tTy41VEDZFnNBn40rSQJH9TSimptS6IR3G1uFVFsa5tdYgQfrFRljDXOsHZcCdzljfWfnt31YmSa4LVRNUWHiixR64BQyzkVyj0KhBnws+8PEH1H/ABSybj+uRpDh2QEhWkkDSI2J/WjC8Osy8wajaSRprlivWKrNJAmDqY5H9KOL6fiX1FJriCderaO/sf7v6iuNe77T+in60SzG1iYYdWhnQEa8tyKTOJEzIjzFLjEqQRlYZYkFfxbQOdInEp+Fv5G8PCsqdF1XYtauS41+6fzFUH23cSVMCbCuOsv3EGSe1kBLEgcxKAfGr9hr1smF0MfhIPLvHlWWdPvtMfcVlkWxbYE+CgiPI8v3jWZz9zeKNyKJwfgIUQydonWeXhTnHdF0fdIjmNPyqXw+NVXJMkT3HYRJ8hI18anGvoVkEa0Ll8sc64Md4lwO7YOcTlUzmGhXXQ6bedeoeh/FTisHh8Q3vXbSlv4oh/8AMDWJ8cuk2rltVlrsW1A5m4wVR6mtj6PcDXC4azh8hJtW1UsLhEkDtHQjcyaPjk2uRbPFLonHP2qfwP8A6rdLh9YpphEUN7rBgu7MW0JExJMagelMuI4t0clNwNjrry+taclYuPMLxVbj5ArecCOZ3mnl06VAdHixusW00mIEe6g7p7x8KnHMmO6rVN8EFIo2WgK7VkORTTihItkgxBHOOcfWozDYtL2J7V63EZUw5YZ5UsLjMh3OYRIkDJpuakuKkdUw8NvISPLarZRGPiLoCjNMnQg/Df0omPxN4XGyEwIGmsaGTFNuB2yQM4Uw8DnoIkz5/lSnUS7Mdy0+jH6ZfShykky0S/Cr7svb33n6RT+o/g9qAxkmT/z9akKq0+iwUKFcq9pCJ4bpcH8J+ZB+lLHD5b2YfeImm2DMXV8yPkak7u/9eFAq4fiGl+9+Aaw0KPMj5kUZnpvlcSAFIkkSSNyTyU99IYvEtbQ3LmRVXc52/wBupnlTKkgTj7nLjfaXPK0f87fpTuqFxDprJZrVsjMoWXnTKxM5N+Y0MHSoG90sxl1wvWMgOkiFEn3TK8jtr4UWGCbsxPJE1PGYu3adGuOiAK2rMqj7veaz3phxTC37puWGV9Mr3F1DFdoOxABiRVNx2J643M4Lsm7NLMxzBR94QIJME1Fpd6kkbKuUsO4MsZtPFWqtRp9kN1mtNPdkos+JVCvZ3OmkVH4nDszhCNkMAyO1GjEDeJqR4Hw/D3CwvM659VuK3umAIK8x5a/SM4lNjENkvi8g+9lZSvcIPh3TSO19nSUlyiS6K8Ea/iVVlhUuLdOx7No5gCQACxbKNh5VsRfWql0C4a64YYhoD3pOoJ7EjKNDodCY8YO1WLLc/EnofDx86LB0hPM90h1Zf7Q/wj/U1LPhLbmWWSfE00sIwYs0bAaTyJ7/ADp7beo3bBUJjBomqyCdNyfHnS1pIpLHoWVQDHaB9DJH0rMOjftXduziLIdQxUvbZEdSsZsyuQjrroyNJA92iJpIpRbdI1sGiYjNlOSM0aSYE+cH8qieHdKMHey5L6BmEhHORyPBGgn4VMVpUU01wypJ0ft4ULeui0tvD21l1Ui4Ew4DIHftNd7QOkidN9qQ6OdMbOObEMEZbdtlChozsSHlyJ0BCiByjxMV32y9Mra2xgLLhrrMrXspnIiEOEYjZmIBj8IM7iqx7PeI9Vir1oxGIYqi97WkLBjHd2l8/Wo3ZpR9Nmy4G/YM5AwgZttNZ+e9dTAkjMGGvfIpjYxTdVd7AByGOewyqIpDD8RurbnQhROmukAk76c9PCsbVJlexZcFaKrBiZO1L0lhWJRSdyoJ+ImlapcEBQrtCt7iiFuaXF8HHzMfWpHEHX4VF426JLDvDfAMDUlitx5Uu3ww77Qe+xER361TPaE5bLakxo5HlovzmrpdcBddqo3T7N1gK/hG/nRdLFPPy+uft2gGV1AqXafsAy6aNPMHQEA6SGgfFj3Col8QVGggwdt8w5a/Dyp/cPbLEwDIkaRmEEEnmOXkKY8R1BfZZ5n4nUwIknvHpXZoST9hkmL+1uGZTsDUATnzMwk6adWP5qTxWAJzXwM1tkCuYiJLQxH4d+14+IkYHij20VUZWW5mGqzz7Pjqq7baCp7oBdc3L4OWVytlVVAytM7RrmzfMHlGNTj3Y2gmDIoTTRXMLxS/YXq2tC6g911YSRykHeKjOIYx7tu9obeUSBz5k6jlAI0rYsT0Y4dd1NpFJ3yu9rxMqjAD0rNOPWbYxt0IFWwYUagIEROqMAkfhJnuk99I6fD6rl7D2bUJxqNk50T6UXsMZDB0Yy1uY27JI7m7JM+Ima1nh+Nt37a3bZlW+BHeCORFYDbDWyyvoV3HeY/Ln8a1L2U8Q66xdXXsON+8gg/6RRs+JVuQtCbui7GlLB1pIiuO+VWPcpPoJpGb4DpFQ4p05f8A6di8UbQtm2pW00lpe4clswQARmOu+1Yd0Vtm4TZ6zIRqswBPOZ57b1rWJAu8GtKwlWxeHSCJ7P7RbkEcxqfOazHpHgTaxV+4ZDXL11rKg/cZr5RvIt1fwbxq1H00NalRx6maiqSdV9iw4vtL1eOtqwY5VeNN+zB3QzzB1mJ1IMLe4gmGV7eHNwzoQXJUR90bADw1OgomP4Y4ch7zPBEQMv5HlT/inBDgcEMVdy9ZePV2LR3AIOe8RzgaDkC6k8qwmm6RbVR3MqXDTDG65/enwGp0+EfGtOPQLFYaxhOIJLNbVXu2Nmtlrmdnn74yNDjkRO0xA+yPo/8AtONBuCbdgC4+mhKkG2v80H/Aa9FWb0j6eHd5UehWUqZD4jh7pacSCXgdmZjXN+dRZtXhCQcrQDofIa8qtGOvKhUNrm0Ex9fMUTht+25JQRl02A5CPgQRQdiS7M2O3uhdBypA4lqS3JoFaIkg8YJC37We4V2om5xJQSIOhjbuoVvYXsiTNzA2yIK6eZouNHu07NQfSTigs5ABmMmd9BpvG1LZmowbBY7lJIkoDCOcemm9Uzp6y5kBMCInxBPqDU9geMWbiIwuBSQJUmCI5GfSq77QSCttkGcEkNBHMipo5XmT4/voxni1BplJx99YJIErpMiNPPf41W+EjM12BMNGsxqGY76/en0q33MIChMkAg6GBPp8aqK2nt3HKk5YLON+yConbcFwNNe0K76Zzhpi7vVZokBcrqT3pAcDkeyT86tfQQsMSW+6yEGO8ZSOcazVP4pis1m4AJEmdSDIBB96fTQ1N+z26C9spLMUysCx97Rg7CNAIYA/umhZp0mvoFhDpmu3WyqWMHKuxHhtPKsX4tiXa6LOhzKGuMR22zMbpQzsMrDTnz5Vp3HuNJbgL2iVnQ6TGnw5+lZ3xnG4a/eL2lFpwgV2zglmneOR0iY7u6ldNkvK40MZcbWPfYzS5IKssuI1ncAkCJ1kf1tWoeyvBi3YuxtKqPGAzE/HMKzJrqG8DGXIuvMkmCdiSfXSa072XYjPhrzkiTiGETJGW3b0Pr6RRtVJLGL4Lci60W66hWLRlAOadojWfhRRcqrdO+M9XaFkTNw9ogGAo1gnkT3dwNcqc1R0IRbdED0k6S2f2J7PVC0Fu2mtsgCqMuIR5ZViIA3FRvS/oy1y5avkFAtrDWlQjRnJQMATvlVSZE86iuMBrts2ba5nuQqqOZYwBWr28ILtm0l0BntEQxEkMFKFge+CwnxrWKbkuTeeG1p/JF/9AwVhbmMa2S9pMx95xnCjKVt7FpjlvEbmsU6XcZu47GPdcMArdXatEzkVTAXTTNoSSN2+Fbp0lxv7PYS2LgR8Re6tXP3BlZmu66SirmAOhKgc6yz2a9HxiOJKxGWzZHXQdezmAsp/FOUEn+7Yb1qH2Bbr7Zq3s66MnCYWLml6+Q9392BCWR/CNO6Zq5ogA0EUnb122pwBRAQ3x2FW4mV5jfQkH5U24Vwu3ZLFM3aABkzttFO8bdVUMmNJ+AIoYNgUUgyDr60OTNI6+HBMjSuLYFL03xl7LGoE8zsABJPpQp9Gk5PgZXeHgsTI1J/OhRy9jndE/wAdcrPkP+EOpy+X+RKGmmLwoeDsR4U6Jopo04qSpi8W07RFvwyfwmoHpTgRbsg5VEsAY0/KrgarPTm99iqcy2adoCx+tY0+nhHKpRReXLJwaZRntQpiOciaoHSDHPZullhlaA6kmSBrGhGnyMajarfxDHKisJ5b/d8Nf62rL+PYzrrpYCRsMpn+t67EpOKtCWJbpEpxHHB0Zskvl0fSRJUjtCCSI28TM1P9DcIwtqy3Etv1mVVIGeBbJZlJOnZLiANdNedV7gfRjFX026q2Y7VyRpM9lYk6+Q8avXR2wFQQ7Oo92TpOoL5eRMk8yA0TS2pyJY792O6aC318CfEELOoeCZneoXF4bD2rbKqkmD2lnQ66m4f1NWvHoCCdJjc1TekOKjDsHaM0qoURmOhyk77FZ8Grm4pS3KvxHpqKhyRdnFkWyVGrAACTqddZ860rorjMRh8Fh0s2w6lCzHQEs5LFpJkyTHKIHwyOzdaCfQR4xyHdXojoxwdRgcLnBDmxbLancoCfzpnxF5ZxXl137iOmUIt7iFxHSm7aSXt5WJIExE5ZBEEk89I+7VZ4jxRr+DVdTcF4lmbc6t+cgR3Ul0+djjDbHu2SFVdSSXVWLTz3AjlFR1jiFpXazcfK2cKQVeAZAkwDzrmw38bu/odFQik2i1dBra2bovXZ0HYPVu8E7nszGkjX9K0DB3AwkHckzEbknY7VB4g2cMgXrMxURCr3d5mPrTGx0qBOXqiB3hh+UfWt4MsozamqXsL5ob1cTvS7Cm+zKyqQbRsWp7WW5ib6pcu5f/TthWB7s1WHg/DrVtbVq1IWyhQT97MysWfvbMsz3s3fUTZxqNdYtIBVShYCM+oaDPcF18TrUbgemfVYu4hQPaWFJB7QYe8RyI1iDzXenFkS7F/Kk+kahYWl6h+G9IcLeErdUHubsn57/CpZHBEggjvBmt2mDprsieLWLdx4dc0ADcjnm5Hy9Kc2sRbtqqAgAAAAn4bneorG8Lz3HeHkncMw8Bse6k24QCIJux/G/Lzrnz1Mt1beLGViVdk9+3JDEGcok91EWwXGZ9yNB3A+fOoW5wxmABu3IBmCQQY2mRr5Gni27o/8ZviE/wBtV5258p0W8aS9LH/UP/eP6J/toUw+2/vf8ooUT/Vf3SMeW/oTBNFmu1ymwQUms56ccRD4h7X3UVVEa9tmHL/EdfCtCxN0IrMdlBJ+Amscx+MJdrm7MZ20zT3d2sUxpo3KwWV0qFhw1JgrMGCd9R3dw+lRnHMZYsdg9l2BAhZjWJaNQI7ge+p7B40MCSVHOC23ry2qtcQ4al68HR7dxjC+8Gklj2QFntGQNaciueRd9cFgtW89oZCYMFTAWQQuXRgdNRr5GRVJ4R0mt27SIFYsqDMI2iBJJPM1ernCMcozpYts+XKVN4Jlgwh9whtI5j61TOj3QG9Zf/ubS6+92laF7wBuZ8Rt4EUtlhDK1b4QfDlliTrtkj0nxNyyiDszcVyNZIyWWuTGx1EVS+N3Yw2CQsSbou4h5mS73jh1JnSMmHEebd9XL2kQSrD3US8JnctZKgDy7/hVNx9nMcIoJ7GDSecF7l25Ef45+NVhxxjSS7ZueWUuZMT4Pwx7961YBIa7cVBPLM0ZozDQAztyr08VCgKNlAA8gIFY57LcBOOQ6/Zq7mZ5LlXl3sK2N6FqXzRMXVmc9IuBXcRxXIPs7b2lfrcpIzpA0j70DYke5M60ztcLv4K69u4cPce4M3XhC18ZjyuNrbmD2RMToRTj2tcUv2Gw3UX7lnMLuYoQNB1caxI3NU3o70pCl/2q4xJJPWuS7NGhzbtyG/5RSjw5JQcoK/mh6GRcKXRcjh53pJrEa0zwPSjC3jFtySPAiphcpEmlHiadPhjEZr2H3Cb6sVS57mxP5VWuP9HP2K/lVs9u4M9tzuQTqrfvA8+4ip62QNqL0pvZ1w681D+jFI+ammIO40wL4nx7jDgmEa4yoolmMD+u6tXwWCWxbW2vIanvJ3NQXQzhIsp1r/2jjQc1U/U1aL3KjxjSsXyTt0gq0otJKaOGqA2KihFJ567nrRgNlHcKFFz0KhYWaBrk0CaoshulmIyYZ+9oUfHX6Vkb3N9NuXkefwq6e0ziZlMMu4AuHxnOAB/KfXwrPb14CFjUnXYd/fttXQ0qqItm7Dg53A30gwCSAdhpz8PCrB0Pt4Sw/XX8RYDkdhDcQ5RzPvSDHeNB3SRVRvOil7YvKj5CzZ822X+zULrmYggbRpPKo3B3URsyqWyhlUSCs5VA0K7QxG9FyNy4iDxxUeWbwnEsOwlb1ltY7NxTqdIEbmeVQHHuN4NCTcukGNAQyqYM6FhBIkbTvWXcBxNvD3ibgY5rZQXChhSxWS8xCkAqWG2bmKHFOKi8RZACLbHbYp1YkF1AFqTlIlyT7zEiQMopHbPftoa9G3dYXpdxRL5OV1cHNlyEtE2rmhb3eY0EnTkNKjuGjOq3Jy9m2vwt21tjfTUqx+NROJQWryBWLW1ZSCRHMTvuKsuEshbdsAwQokDUEgc431o+KLTd+wHLLhV7mieybDdvEXe4Kg25ks3+la0NzVV9nvDXs4cs+91swER2QIU/HU+UVZWNJ5ZXJjEFSKx7Q+A28VhZckG2ey3LtEAg+GgrJuk3R5bGEZkK3XLK9xwJaBIOm4WWmtm6XOThsqZWJdZUndQSWGmx0qpI9tXygOAds6/LMCR89flQHknF0nxwxzFFShT+pjPCMM737aoGksPdEmBqdPIGtki2qqerggQRncA+YDf1rXcLg7Fglrdm2jEEZlUAweQI2HlUfxDFgc6zqMqnLgLgwuK5FcPavM7FLogsMtrL2VURIzMSxMc5iTsNquHC+EG/f61wBZthQs7uQJPwDEz6d9UrhIvG9aSAgvEIrMCN0Z9DzMA6QNhrWu4TDhEVFmFEa6nzJ76vBFt2+gepkoKk+RzaInTU08v7CmlgcvWneIO1MS6EkJTSGIuUsaa3qGzZ3B4POM7O250Bgd3nTn/pw/G/836ilMCIRR/WpmnE1pJUZbdjP/pw/vLnqv8AtoU5N9fxD1rlXSK5E64TXDXCao2UX2ncKLIuLQkGyCtwcuqJ9/8AwGTPcW+GZXcDcfPetZXthe0ZnUkQSRtLQJ5anlr6BuCQQdQdxyqr8b4RYsYXENZtKhfK75BE5WkkjwBY0fFncVtBzxp8mQ4bgjlAcyOWOaXBzSeYI27qXXAsukT6n+uWu+gqZs4J+pa6o+yUwSDOUnUmBsPHxFM7iPuCfT6nSm1IUmmyH4hiERWJXMeS7knlG8axTLEWQl3YTkAJjQZVA3OwMDbvo/Fi4KGVlnUAjnBnX0n4U5wWDQczmPOSSe4Sd/Wrrc7KvaqIzF4bOVPYAzDTmRIJk+QNWHhXCWxAyJbL6EmNpM7g6CDzPfUhwLoBir95bt0PYsKRJcfaXAdwlsyFGg7TAb6TWv8ADuDWbVsW7SBFH3ROviZ1LeM0KeXhpBIw6bG9olVVANFVRPwAFIcRY5GIO3zpv0ouPg7Qu2VXN1oU5wSMrWyTp5iJ8ar3/wCd3SYbDYcjeIYfWpg0OXLDekvzMZ9fixT2Sf8AwLdIsWtiwLj/AIgI85qqXOkducoVpidRGnI+X6VYb3TK1dUpd4facbQLpA9CmmhqKvtwe8c17hlxWUZQbd+5oBygMo50tq9N5TqfD/kdfwyGbVY3kwR3RTrtJ3w+m0/ci73GTyqucSxjE5iYA3NW/HYXgfVO1tMZaYLIBeZPcCWYT51W7+E4beAtLiMYrToDZS6CfDq2k1znFJnSnDJiVTi0/qOOguPu43iuG36rDjMByAQAsx8TEeleguHjNbzHfw8hWY9EOjIwMdW+YvbUnsZLjZjml1MlQFKAJpBzEyTpYsbxjFqrLbXqknW4dXOnL7qd3M89KdlkjCCv9DjeXLJN0WbHcUw+HGe9dVRyBPaJ/dUat8BTKx0wwd58i3IMaFwUB8AW51lPEbDyb1xjcuMwUZmJ1J/EeQE+lNHU2zB7dw6kclHee4cgKUlqX7IbjpI1y+TeCaLVB6HdILttDbu/aIomCRmTyJ5Ry8Ktd3i6rcsgLmt3yVW6pBCsEL5XHKQrajTSjY5b1wLZIODpkot4ghRER/8AX19KZ9IOL9RaJEZ20UfmfhUX0t6SJw/DXMSwDEdm2hMZ3JgL5bk+E1k3Dunj4vFH9tdEDAC2wGW3bgkwZJ0afeP4RWvVtbRUIpvkspk6lZPfQqVXh4IkFT4yKFK7WPb0X9TP3j8v0pQW/E/L9KpqdPsPKrkuAt35d+6QTThumqja0T5tH0roxhv/AHTmSuPZajhx+I/KmOJse9beCGEeasCDpy5imPCOkBxOYBcjLymZB2M0+gk671UsdOiKRSOj9nEYUvYOGZ0zH7T7rCIG51kQNP1pnh+jd86FFHgWWN9gO4VoQFKqAdxRFJoG0mUNfZrh7rK+Ie4xUzkQ5Ek97Dtk+RWrNwzorhrDZrVlQw2JZ2Yd8FmMGprJrB+B5124muhqWyUjthY0kj906ilMmU6bGiG4Y1rvWaRVUUyD6d28+DuEbplb0YA/ImsluXK2DE2mvWr1sx20ZR5lSAfyrGjcBru+EyvHKPw/1/wcDxfHWSMvlfp/kMjdoHwo4YSfHerDw7oW+Iw9vEWryS09hgywVYqRmEzqO6mWL6H463LMqZVA1FxTMmBA31PhSHi04TmnF3Vp/Sj2f7HZ4abBkjnkoriStpJ2uf0RDWOGftF1cOCB1py5jMDnJjfbatF4XwGxgEy2VDXDANxgMzE8vBf3az/hl0pirR2KXlB+DgEfnWn2vtLpJ91TA8W5nyG3rXHglbfudr9onJzxu/S4/nz/AFJHhnDAjG4TmYjU0/xmHV1hhoNfjXLYA7/nRXxC7a+hpmrVM8pbTtFQxXRZncgkhJLI3cTqAw57kUjZ6I3MzMWXU7a7AD4d9XRda7dTQnuFLvS42HWqyIqfE0TCBBeBVLgOVwrMsjUqxUGDGuu+uulULE8b/wC4U2bjJbsvnUHQs5EEwfdGUle/tHatS43hBew723EgiVG/aGojuP61Q8Hwa1bMxmblOsDuFdLw/DpsT3yTbX5CuqzZZw2p1ZV/aNxO9ieoZ4NrqwFyzHWffJB5kZY8jvBqihda2u9w21f+yupnQkSskHQ6QQQQfEVWunPsqv4VHxGGfrrCgsyHS7bUak6aXFAmSIMcudDzxUZenoJhyXHnsziF/CPShSDXF5FvlQpewhpq2dbZOhZhlHPvMfAE/Cp9VqV4pwE3MjI4R0kSVzCGiRHI6b+dcw/BHHv3FYfuoVPqWP5VWkz48cPU+TephPJL0rgkOhqfauf3P/kI/I1cbq7Gq1wlbeHBIzF2Ou0QJiPWpZOLod2+BBomTNCUrTF1jkl0PeQNAConE9IrdtSxzQvcv5TUDhvaRZd2RbN8hR7w6uRM+8pfsg8jOutSLUlaI4tdl5z6Uhi76W7Ze46oo+8zBQPAk1SuH9Mb2Ia+FVLVu04tgEhrmYDM7MZy/eUQBpB1PLOOkF25cxjLiLz3StzsFmnKrQQFUaJoQNByqY5RlNwXaJKDjFSfua9Z6V2bl+3YtZrmfNNyMqLlUtHahmJjkI8e+Ue/WZ28CbeQ5gQWy5gxJkEggZRG4Ox09ak1tsNnf+dv1pXUZ9kqGMOHerNDwKmMx57eXfWI8ctdXibyQQFuuAPAOY+Vbbwp5sWuf2a+fuisW6VXJxmI/wDdf/UZru+Dv1Ovg4ni0fSvuW/o3xrqcBYj3TiHtuYJIBl+yBqW7QOxqNbFX8NfazeuXLlsuLlssGM5SSQc2qHYnxWdSalvZmi3MKwYBjbxJZZ5Hq7cEfOozjHR7FftV6/c+0thCyuxUwAR2QqgQwUNMLGu5JNK6xPflSaXvz783wH0qj5aeS2qpV7Oqt/SyrcTHV33APuvIPxma1DhbiEA2/5/Osu43/b3f4vpWkcAuzbsk7m2p9VFczF2e18UW7Q6eX+1f9UXGw9KvcpnYfSjs9M2eWaDNHKkzcBkchv40w4rxJbKFmMDbQEmTsIG/wDxReCY5L6whkg6jn3gx/W1Y8xbtpry3tsdZZ5VXOK4V7LuyKGVwQTlzZCdyPwnuNW24kCk1Qc6LCdMxJWisdG+GlmF1hop7I/Ee/yFXKxbDAqQCCIIPMHQikVAG3OlbZy61qc3N2YjHaeRcT0dxYdgmHvuoYhWFpyGUHRgQIII1mhXq67YYsSGaJMe73+VCl6fwH4IMii0dqI9c1jwjfPOuIsD86K8me4f0flSgrUukyl20NsfbzW3H7p/Ksqw+PuLmCvAMyI7z8AT4kTy20rXTWKcfwxs4i4on3jHlTmjdpxAahdMuPs0u64q3vDI/wAWDqfkgqF9oL9XjwYPbtLt45l+WSnnstugX8Qp3a2jfyO4P+sU49qeDkWL4HulkJ8DDD8m9a1B7dV9/wDwqS3YRLgmPEDzG5J2q5m0Ky7h79pV7yATyAJArWerofiEeUXo3wy18Cb/ALe34Aj0YisT6TPOKxHjfuf/ANGrbODiLKDz+bGsG4vdzYi83fdc+rsa7vgvv9kcfxVXX3Y1W6VMgkEcwYPqKl8J0oxiABb7sO54uDmCO3Mad1QN061201G8cko6dfNr+Z0v2UwRyaxqatbXw+V2iRvXi7Fm3O/oBz8q0rohdzWrPggHoIrL1rROgrfYWz3Fh/mNeawv1HsvHIRjpIqKpJpL8mX3lSFy73H40gXnwFJ2yWYAbU0zxtDDpGJ6tI3BadNdcvyj/NUOML4Vauk9oZLDdxZf5oP5qKiVWuVqYXkdj2GXoQnhcbeQ/wBo5HcxLD/NMfCp3AcSVxDkBth3GdvI1D5aPYHaXzn01+lbw5ZxfZnJCMl0WdV50W9c0qDs32XYny5VzHcQuZTED4etOR1MX2LPA/YdtxSCRO1Cqz1poUfeD2E6bDfhPpRbmFeNFM1LzXaU8hB/NZDLgWgiPukbjWQfz+tNipGjaEb+cVPPVF4jxC8WMDIWdiupabY91iCBlkctdt6zkxpKkahO3bJlqy32kJkxIMjtoDB2nYkelaUoJ1zH5fpVS9o+AZ7C3FVmKNBKwCFbc+IkD1qaSe3Kr9+DWaNwKV0cu5cdhYuZXNwAlQScpBlCJ2bb4zyq8e0x/wDtBqAOtWZjXstAE+NZzZBs3Ld4HLkcPBaJykGO8yAR8T41oHTdmuYUnsyChTtECWYb93Z8fvUxmdaiDBY1eKRRw0iAwCkRM6iRBM8238BPOtw4Db60jNp2c0eOmnz+VYvwLgl7E3lsrbIJ1La5Qo95i55COR10rfuF4NbQEQW7/oJ5UXUx3yj9AeGWxSJSyvZAqCx/RHA3SS+HQMTqyE2zPechAPxqZW9mGmneOYNJl4rcJyg7i6+wOcVLtWUbiPs0wxJNu7dSeRyuB5aA/OoPF+zbEJrbu27kd8ofqPnWoEzRSZq9Rklnio5HaQfRZ5aObnhpN8MxbGcHxFj+1tMo/FEr/MJFXn2foP2Wf/UbX0q13wIg+lNAgGigDwAgeO1LRxKLtHU1Xi8tVg8ucadp2uvy/qKXH5UthNCDzpuBUhgrBJAG5rZyGF482awo+9nMfAT+ZFQqaiRT/itw5yvJNB9T8aYWdiO4x9R8jXPzPdOxvGqiHFdU9oeX6f8ANdikkst1mYxEQO/y8qxHhlsdijdXOnKggpwiVaRTZGHhY7/lQqX6o0KNun8mKQ4oTXJojXQKaFhLH3IRvER66VUL9sFrhA0QBR3fiMR4k1Y+L3CygKCYk/ECAPmfSojB4ZsjZlILEkg+P/3QMt8h8YXA3JtqfCPTT6VH9J8aLWHdiM2ghebEkBVHmYHxpzw7MFKkEQx5d+v1qt9PLx6kRydSfKTHzilor1DK5KZjMU85DGtsz2SZKkswgnUFc2h7h5VLcXxbXcJbtSMxE9ysbSr2RPgGInuqtXSzS4MFRA8yZj0B/o13iXFSVW2phEAAHfA1JPjTuLA8rXwjGaaxPjs2b2XhDguuATrXdkcrrlyGFtgmTGWGjvYmrUGrDPZj0uGDvmzebLh75GYna3cGi3D+6dm8IP3a3PLP9flTMoKDpCLk5csUt3NZ58x3/vD60vE7UwvW/Oe8b0Q38QF7Kox7zKn4xOvwqih9cEU1u3YpknGEy5nBUfiAzoY0MMk6Ag7xTexxnDXWKpftM3NQ65h/hmaqiDuSTJo8U3bE2xpnWf4hpQbFoNz8ifyqmaQ7tLrVg4cqqpY7xJqrW8UzMBbHxbT07qsC27q2XzjlpqDuQDWXwrL7K9cUsxYk9ok+pmk1tw0ZjqPDl8PH5U+6qk7lqIPcf+D8jXOaHLEuqP4vlQyP3j0P60+FmjdRV7TO4YqH8PnTvDs3cPX/AIpQWaacbxPUYe7c1BCELGhzNosfEz8K3CLbpFSkqI3E9PeH23a2+JthkYqwk6FTBG3eK7Xnm5wW5JllOu5Jk+JrlPf6WfwLedE9UE02uUsTSbCsEEoroSjRXVFQsUAot3CW30e2jA8mVT+YpjxfjeHwi5791U7gdWP8KDU/AVVeE+02zfxa2BbNuy/ZW65AYuT2ZUaKDtudSNq2oOXSKplovdF8Cwg4SxG8C2q77+6B3Co2/wCzrhbf+VC/w3Lq/INFWoCuxVJtdFPnsoGK9knDW93r7f8ADcn/AFqas3R7gpwlkWBeuXUTRDcyllXkmZQJUcpGm20ATUUIq9zKEstQ3S/DYu7hns4NkS5c7Jd2ZcqEdoqVUnMduUSTuBU8aTNS2SitdBuEXsLgreGxGUvbLgFTmBVnLjUgfiIjwo54XadyQgJUxOX/AIqwGm9zEgHKAWPMCNPMmAPLepZdEdZ4Yq6hBPlTvD4Esac28SB7wK+JiPiQTHxpw9RMg+wXCwo8adYwnKQdjA+tQYnkSPjR5f8AEfU1UnaIlTHYwwrpwgIg0hbuMPvE104lhsfrQfLCbx7aw+gpZcKO6mNvGuO70pwvEDzA+dbUEYcmKtg18qpvtUw4XBq0+7cGg1J7LAQBqfId9WXiF3rQFOi8xuD3A+HhVQ4x0VvX1y/tAgCFBUwo10Gvl6UTGkpplSbaMYdxJ7D/AOf/AG0K0P8A/WV/+/sfyP8ArQp/zcfyA2M0OaJccASf68POmnEuIpYttduEhUEmASd4EAeNZl0h9oV+72cOvUoD7xg3DpE9ybnaT40hCDl0NJWX7jXHrWGXNfuran3UAz3W8lH6EeNZ5xv2mYh5TDDql/vGCm6fgJVfmfGqk+a4xJJZjqzM3zZmPzNH6iyNM/W3DoqrItA6wGcwW1jaBr7xpiOKK75LVDO+9y6xuOzO33rjtJ+LH8qPg8N1jBLatcc7BQfUAa6d5irJ0V6INxBybl8IlvdABIncKuw8T+da1wPgOHwaZbFsL3udWbzbc+VallUePcjkR3s86SnE2upvEjEWRDToWCmM0ciNAR5VcKyjpnd6jHW8Tg2U3P8AxVmFkCJYjYkEgjetSw13Oiv+JQ3qAfrQMkepL3MMVoE1wmuE0MoBNENGrlUQLULb4lZtWw9y4lsEmTcdUlpOfViNc01NmsW9pHDbd+8GMq2wYaiN9V23JM6fGrLXJreExlu8me1cS4p5oyuPVTSnDzoVGytAnxAaB4DNHwrDOhXCbti8LiX8pJghQdRvDAmCDroQfhW88MsBLagT3knck6knxNQg5FqgyRSyNFEvXJMdwqzIQCm2FuFi8/dcj4QCKcNpTTCCLjr3gH8wf/jVFj4LQNGorVCjk1ya4TRCahA00KSzUKhZCdIkDYa6CJGX6isSsoDcg7UKFMYOmbRtHQzg+HODsubFpmde0WRW5kaBgQNByrLfaPw61h8fetWUW3bGUhF90ZkVjA5CSdBQoVWJ+tkXYt0UxLrj8NDEdYi5/wB6VMz6Crb7ROJ3kIto5VTEgaTJMyd6FCiRXqX2I+yh4tyI8TW7cIP/AG9n/wBpP9ArlCq1H7qMsdVxhQoUqUdFChQqEOVifG7hLuCZhyB+ddoVaNRO8DYg1pGHx9wQA2gA5A/nQoVUuy0WHC3SyyTTa6YumO4fShQqzA9J0FNP/ML/AAN+duuUKpkJE0ma7QqyhNqSahQqiwk0KFCqIf/Z\",\"requiere_cambio_password\":true,\"autenticacion_doble_factor\":false,\"enviar_email_bienvenida\":true,\"password_hash\":\"[OCULTO]\"}',1,NULL,5),(15,NULL,'2025-10-28 15:22:15','error','usuarios','obtener_usuario','Error al obtener usuario ID 12: Unknown column \'c.telefono\' in \'field list\'','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',NULL,NULL,NULL,NULL,1,NULL,7),(16,NULL,'2025-10-28 15:22:17','error','usuarios','obtener_usuario','Error al obtener usuario ID 12: Unknown column \'c.telefono\' in \'field list\'','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',NULL,NULL,NULL,NULL,1,NULL,7),(18,NULL,'2025-10-29 11:49:14','audit','usuarios','activar_usuario','Usuario activado: DULIANISE  SAINT AMOUR','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','usuario','17','{\"estado\":\"bloqueado\",\"bloqueado_hasta\":null}','{\"estado\":\"activo\"}',1,NULL,5),(19,NULL,'2025-10-29 11:59:17','audit','usuarios','activar_usuario','Usuario activado: DULIANISE  SAINT AMOUR','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','usuario','17','{\"estado\":\"bloqueado\",\"bloqueado_hasta\":null}','{\"estado\":\"activo\"}',1,NULL,5),(20,1,'2025-10-29 12:50:05','audit','usuarios','editar_usuario','Usuario editado: DULIANISE  SAINT AMOUR (ID: 17)','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','usuario','17','{\"id_usuario\":17,\"username\":\"duli\",\"email\":\"peterly.infoges@gmail.com\",\"nombre\":\"DULIANISE\",\"apellido_paterno\":\" SAINT AMOUR\",\"apellido_materno\":\"BRENORD\",\"rut\":\"26.399.128-1\",\"telefono\":\"+56949306385\",\"celular\":\"984150439\",\"direccion\":\"Valles de Don Felipe, pje 7 , #167 Curico\",\"ciudad\":\"curico\",\"region\":\"Región Metropolitana\",\"fecha_nacimiento\":\"2004-03-26T04:00:00.000Z\",\"genero\":\"femenino\",\"id_centro_principal\":1,\"id_sucursal_principal\":1,\"ultimo_login\":null,\"intentos_fallidos\":0,\"bloqueado_hasta\":null,\"reset_token_expiry\":null,\"estado\":\"bloqueado\",\"requiere_cambio_password\":1,\"autenticacion_doble_factor\":0,\"fecha_creacion\":\"2025-10-28T15:19:15.000Z\",\"ultimo_acceso\":null,\"fecha_modificacion\":\"2025-10-29T12:05:21.000Z\",\"created_by\":null,\"foto_perfil_url\":\"data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxISEhUSExMVFRUVFx0aGBUXFxcXFxoaFxUXFxYWGBcYHiggGBolGxgYITEhJSkrLi4uGB8zODMsNygtLisBCgoKDg0OGxAQGy0mICUwLS0tLy0vLS0vLS0vLS0rLS0tLS0tLS0tLS0tMi0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAQMAwgMBIgACEQEDEQH/\"}','{\"username\":\"duli\",\"email\":\"peterly.infoges@gmail.com\",\"nombre\":\"DULIANISE\",\"apellido_paterno\":\" SAINT AMOUR\",\"apellido_materno\":\"BRENORD\",\"rut\":\"26.399.128-1\",\"telefono\":\"+56949306385\",\"celular\":\"984150439\",\"fecha_nacimiento\":\"2004-03-26\",\"genero\":\"femenino\",\"direccion\":\"Valles de Don Felipe, pje 7 , #167 Curico\",\"ciudad\":\"curico\",\"region\":\"Región Metropolitana\",\"id_centro_principal\":1,\"id_sucursal_principal\":1,\"roles\":[1,2,3,5,4,6],\"requiere_cambio_password\":1,\"autenticacion_doble_factor\":false,\"estado\":\"activo\"}',1,NULL,5),(28,NULL,'2025-10-29 14:56:43','error','usuarios','generar_reset_password_token','Error al generar token de reseteo para usuario ID 1: Lock wait timeout exceeded; try restarting transaction','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',NULL,NULL,NULL,NULL,1,NULL,10),(29,1,'2025-10-29 15:34:37','security','usuarios','activar_2fa','2FA activado para usuario ID 17','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','usuario','17','{\"id_usuario\":17,\"username\":\"duli\",\"email\":\"peterly.infoges@gmail.com\",\"nombre\":\"DULIANISE\",\"apellido_paterno\":\" SAINT AMOUR\",\"apellido_materno\":\"BRENORD\",\"rut\":\"26.399.128-1\",\"telefono\":\"+56949306385\",\"celular\":\"984150439\",\"direccion\":\"Valles de Don Felipe, pje 7 , #167 Curico\",\"ciudad\":\"curico\",\"region\":\"Región Metropolitana\",\"fecha_nacimiento\":\"2004-03-26T04:00:00.000Z\",\"genero\":\"femenino\",\"id_centro_principal\":1,\"id_sucursal_principal\":1,\"ultimo_login\":null,\"intentos_fallidos\":0,\"bloqueado_hasta\":null,\"estado\":\"activo\",\"requiere_cambio_password\":1,\"autenticacion_doble_factor\":0,\"fecha_creacion\":\"2025-10-28T15:19:15.000Z\",\"ultimo_acceso\":null,\"fecha_modificacion\":\"2025-10-29T12:50:05.000Z\",\"created_by\":null,\"foto_perfil_url\":null}','{\"autenticacion_doble_factor\":1}',1,NULL,7),(30,1,'2025-10-29 15:34:48','security','usuarios','generar_reset_password_token','Generado token de reseteo de contraseña para usuario ID 17','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','usuario','17','{\"id_usuario\":17,\"username\":\"duli\",\"email\":\"peterly.infoges@gmail.com\",\"nombre\":\"DULIANISE\",\"apellido_paterno\":\" SAINT AMOUR\",\"apellido_materno\":\"BRENORD\",\"rut\":\"26.399.128-1\",\"telefono\":\"+56949306385\",\"celular\":\"984150439\",\"direccion\":\"Valles de Don Felipe, pje 7 , #167 Curico\",\"ciudad\":\"curico\",\"region\":\"Región Metropolitana\",\"fecha_nacimiento\":\"2004-03-26T04:00:00.000Z\",\"genero\":\"femenino\",\"id_centro_principal\":1,\"id_sucursal_principal\":1,\"ultimo_login\":null,\"intentos_fallidos\":0,\"bloqueado_hasta\":null,\"estado\":\"activo\",\"requiere_cambio_password\":1,\"autenticacion_doble_factor\":1,\"fecha_creacion\":\"2025-10-28T15:19:15.000Z\",\"ultimo_acceso\":null,\"fecha_modificacion\":\"2025-10-29T15:34:37.000Z\",\"created_by\":null,\"foto_perfil_url\":null}','{\"reset_token\":\"[GENERATED]\",\"reset_token_expiry\":\"2025-10-29T16:34:48.701Z\"}',1,NULL,8),(31,1,'2025-10-29 15:35:03','security','usuarios','bloquear_usuario','Cuenta bloqueada manualmente. Usuario afectado: duli (ID 17)','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','usuario','17','{\"id_usuario\":17,\"username\":\"duli\",\"nombre\":\"DULIANISE\",\"apellido_paterno\":\" SAINT AMOUR\",\"rut\":\"26.399.128-1\",\"estado\":\"activo\",\"intentos_fallidos\":0,\"autenticacion_doble_factor\":1,\"ultimo_login\":null}','{\"id_usuario\":17,\"username\":\"duli\",\"nombre\":\"DULIANISE\",\"apellido_paterno\":\" SAINT AMOUR\",\"rut\":\"26.399.128-1\",\"estado\":\"bloqueado\",\"intentos_fallidos\":0,\"autenticacion_doble_factor\":1,\"ultimo_login\":null,\"fecha_modificacion\":\"2025-10-29T15:35:03.000Z\"}',1,NULL,9),(32,1,'2025-10-29 15:35:17','security','usuarios','desbloquear_usuario','Cuenta reactivada manualmente. Usuario afectado: duli (ID 17)','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','usuario','17','{\"id_usuario\":17,\"username\":\"duli\",\"nombre\":\"DULIANISE\",\"apellido_paterno\":\" SAINT AMOUR\",\"rut\":\"26.399.128-1\",\"estado\":\"bloqueado\",\"intentos_fallidos\":0,\"autenticacion_doble_factor\":1,\"ultimo_login\":null}','{\"id_usuario\":17,\"username\":\"duli\",\"nombre\":\"DULIANISE\",\"apellido_paterno\":\" SAINT AMOUR\",\"rut\":\"26.399.128-1\",\"estado\":\"activo\",\"intentos_fallidos\":0,\"autenticacion_doble_factor\":1,\"ultimo_login\":null,\"fecha_modificacion\":\"2025-10-29T15:35:17.000Z\"}',1,NULL,8),(33,1,'2025-10-29 15:53:08','audit','usuarios','editar_usuario','Usuario editado: DULIANISE  SAINT AMOUR (ID: 17)','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','usuario','17','{\"id_usuario\":17,\"username\":\"duli\",\"email\":\"peterly.infoges@gmail.com\",\"nombre\":\"DULIANISE\",\"apellido_paterno\":\" SAINT AMOUR\",\"apellido_materno\":\"BRENORD\",\"rut\":\"26.399.128-1\",\"telefono\":\"+56949306385\",\"celular\":\"984150439\",\"direccion\":\"Valles de Don Felipe, pje 7 , #167 Curico\",\"ciudad\":\"curico\",\"region\":\"Región Metropolitana\",\"fecha_nacimiento\":\"2004-03-26T04:00:00.000Z\",\"genero\":\"femenino\",\"id_centro_principal\":1,\"id_sucursal_principal\":1,\"ultimo_login\":null,\"intentos_fallidos\":0,\"bloqueado_hasta\":null,\"estado\":\"activo\",\"requiere_cambio_password\":1,\"autenticacion_doble_factor\":1,\"fecha_creacion\":\"2025-10-28T15:19:15.000Z\",\"ultimo_acceso\":null,\"fecha_modificacion\":\"2025-10-29T15:35:17.000Z\",\"created_by\":null,\"foto_perfil_url\":null}','{\"username\":\"duli\",\"email\":\"peterly.infoges@gmail.com\",\"nombre\":\"DULIANISE\",\"apellido_paterno\":\" SAINT AMOUR\",\"apellido_materno\":\"BRENORD\",\"rut\":\"26.399.128-1\",\"telefono\":\"+56949306385\",\"celular\":\"984150439\",\"fecha_nacimiento\":\"2004-03-26\",\"genero\":\"femenino\",\"direccion\":\"Valles de Don Felipe, pje 7 , #167 Curico\",\"ciudad\":\"curico\",\"region\":\"Región del Maule\",\"id_centro_principal\":1,\"id_sucursal_principal\":1,\"roles\":[1,2,3,5,4,6],\"requiere_cambio_password\":1,\"autenticacion_doble_factor\":1,\"estado\":\"activo\"}',1,NULL,5),(34,1,'2025-10-29 17:29:14','audit','usuarios','editar_usuario','Usuario editado: DULIANISE  SAINT AMOUR (ID: 17)','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','usuario','17','{\"id_usuario\":17,\"username\":\"duli\",\"email\":\"peterly.infoges@gmail.com\",\"nombre\":\"DULIANISE\",\"apellido_paterno\":\" SAINT AMOUR\",\"apellido_materno\":\"BRENORD\",\"rut\":\"26.399.128-1\",\"telefono\":\"+56949306385\",\"celular\":\"984150439\",\"direccion\":\"Valles de Don Felipe, pje 7 , #167 Curico\",\"ciudad\":\"curico\",\"region\":\"Región del Maule\",\"fecha_nacimiento\":\"2004-03-26T04:00:00.000Z\",\"genero\":\"femenino\",\"id_centro_principal\":1,\"id_sucursal_principal\":1,\"ultimo_login\":null,\"intentos_fallidos\":0,\"bloqueado_hasta\":null,\"estado\":\"activo\",\"requiere_cambio_password\":1,\"autenticacion_doble_factor\":1,\"fecha_creacion\":\"2025-10-28T15:19:15.000Z\",\"ultimo_acceso\":null,\"fecha_modificacion\":\"2025-10-29T15:53:08.000Z\",\"created_by\":null,\"foto_perfil_url\":null}','{\"username\":\"duli\",\"email\":\"peterly.infoges@gmail.com\",\"nombre\":\"DULIANISE\",\"apellido_paterno\":\" SAINT AMOUR\",\"apellido_materno\":\"BRENORD\",\"rut\":\"26.399.128-1\",\"telefono\":\"+56949306385\",\"celular\":\"984150439\",\"fecha_nacimiento\":\"2004-03-26\",\"genero\":\"femenino\",\"direccion\":\"Valles de Don Felipe, pje 7 , #167 Curico\",\"ciudad\":\"curico\",\"region\":\"Región del Maule\",\"id_centro_principal\":1,\"id_sucursal_principal\":null,\"roles\":[1,2,3,4,5,6],\"requiere_cambio_password\":true,\"autenticacion_doble_factor\":true,\"estado\":\"activo\"}',1,NULL,5),(35,NULL,'2025-10-29 23:41:16','error','medicos','crear_medico','Error al crear médico',NULL,NULL,NULL,NULL,NULL,NULL,0,'You have an error in your SQL syntax; check the manual that corresponds to your MariaDB server version for the right syntax to use near \' 0.00, 0, NULL, NOW(), NOW(), NOW()\n        )\' at line 32',8),(36,NULL,'2025-10-29 23:41:23','error','medicos','crear_medico','Error al crear médico',NULL,NULL,NULL,NULL,NULL,NULL,0,'You have an error in your SQL syntax; check the manual that corresponds to your MariaDB server version for the right syntax to use near \' 0.00, 0, NULL, NOW(), NOW(), NOW()\n        )\' at line 32',8),(37,NULL,'2025-10-29 23:47:34','error','medicos','crear_medico','Error al crear médico',NULL,NULL,NULL,NULL,NULL,NULL,0,'Cannot add or update a child row: a foreign key constraint fails (`anyssamed`.`medicos`, CONSTRAINT `fk_medico_especialidad` FOREIGN KEY (`id_especialidad_principal`) REFERENCES `especialidades` (`id_especialidad`) ON DELETE SET NULL ON UPDATE CASCADE)',8),(38,NULL,'2025-10-29 23:54:54','error','medicos','crear_medico','Error al crear médico',NULL,NULL,NULL,NULL,NULL,NULL,0,'Cannot add or update a child row: a foreign key constraint fails (`anyssamed`.`medicos`, CONSTRAINT `fk_medico_especialidad` FOREIGN KEY (`id_especialidad_principal`) REFERENCES `especialidades` (`id_especialidad`) ON DELETE SET NULL ON UPDATE CASCADE)',8),(39,NULL,'2025-10-29 23:54:57','error','medicos','crear_medico','Error al crear médico',NULL,NULL,NULL,NULL,NULL,NULL,0,'Cannot add or update a child row: a foreign key constraint fails (`anyssamed`.`medicos`, CONSTRAINT `fk_medico_especialidad` FOREIGN KEY (`id_especialidad_principal`) REFERENCES `especialidades` (`id_especialidad`) ON DELETE SET NULL ON UPDATE CASCADE)',8),(40,NULL,'2025-10-30 00:02:00','audit','medicos','crear_medico','Médico creado ID 8 (usuario base NULL)','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','medico','8',NULL,'{\"id_usuario\":null,\"id_centro_principal\":1,\"id_especialidad_principal\":null,\"especialidad_principal\":\"\",\"numero_registro_medico\":\"1\",\"titulo_profesional\":\"SSSSS\",\"universidad\":\"SSS\",\"ano_graduacion\":2025,\"biografia\":\"SSSSS\",\"acepta_nuevos_pacientes\":true,\"atiende_particular\":true,\"atiende_fonasa\":false,\"atiende_isapre\":false,\"estado\":\"activo\",\"consulta_presencial\":true,\"consulta_telemedicina\":false,\"firma_digital_url\":null,\"duracion_consulta_min\":30,\"anos_experiencia\":0,\"fecha_inicio_actividad\":null,\"id_centro\":null,\"id_sucursal\":null}',1,NULL,5),(45,1,'2025-11-03 00:54:30','audit','usuarios','editar_usuario','Usuario editado: DULIANISE  SAINT AMOUR (ID: 17)','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','usuario','17','{\"id_usuario\":17,\"username\":\"duli\",\"email\":\"peterly.infoges@gmail.com\",\"nombre\":\"DULIANISE\",\"apellido_paterno\":\" SAINT AMOUR\",\"apellido_materno\":\"BRENORD\",\"rut\":\"26.399.128-1\",\"telefono\":\"+56949306385\",\"celular\":\"984150439\",\"direccion\":\"Valles de Don Felipe, pje 7 , #167 Curico\",\"ciudad\":\"curico\",\"region\":\"Región del Maule\",\"fecha_nacimiento\":\"2004-03-26T04:00:00.000Z\",\"genero\":\"femenino\",\"id_centro_principal\":1,\"id_sucursal_principal\":null,\"ultimo_login\":null,\"intentos_fallidos\":0,\"bloqueado_hasta\":null,\"estado\":\"activo\",\"requiere_cambio_password\":1,\"autenticacion_doble_factor\":1,\"fecha_creacion\":\"2025-10-28T15:19:15.000Z\",\"ultimo_acceso\":null,\"fecha_modificacion\":\"2025-10-29T17:29:14.000Z\",\"created_by\":null,\"foto_perfil_url\":null,\"apellido\":\" SAINT AMOUR BRENORD\"}','{\"username\":\"duli\",\"email\":\"peterly.infoges@gmail.com\",\"nombre\":\"DULIANISE\",\"apellido_paterno\":\" SAINT AMOUR\",\"apellido_materno\":\"BRENORD\",\"rut\":\"26.399.128-1\",\"telefono\":\"+56949306385\",\"celular\":\"984150439\",\"fecha_nacimiento\":\"2004-03-26\",\"genero\":\"femenino\",\"direccion\":\"Valles de Don Felipe, pje 7 , #167 Curico\",\"ciudad\":\"curico\",\"region\":\"Región del Maule\",\"id_centro_principal\":1,\"id_sucursal_principal\":null,\"roles\":[1,2,3,4,6,5],\"requiere_cambio_password\":true,\"autenticacion_doble_factor\":true,\"estado\":\"activo\"}',1,NULL,5),(46,1,'2025-11-03 11:23:58','audit','usuarios','editar_usuario','Usuario editado: Macarena Espinoza (ID: 5)','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','usuario','5','{\"id_usuario\":5,\"username\":\"secretaria1\",\"email\":\"secretaria@medisuite.cl\",\"nombre\":\"Macarena\",\"apellido_paterno\":\"Espinoza\",\"apellido_materno\":null,\"rut\":\"21.555.999-3\",\"telefono\":\"+56 9 5555 5555\",\"celular\":null,\"direccion\":null,\"ciudad\":\"Curicó\",\"region\":\"Región del Maule\",\"fecha_nacimiento\":null,\"genero\":null,\"id_centro_principal\":1,\"id_sucursal_principal\":null,\"ultimo_login\":null,\"intentos_fallidos\":0,\"bloqueado_hasta\":null,\"estado\":\"activo\",\"requiere_cambio_password\":0,\"autenticacion_doble_factor\":0,\"fecha_creacion\":\"2025-10-27T02:19:55.000Z\",\"ultimo_acceso\":null,\"fecha_modificacion\":\"2025-10-27T02:19:55.000Z\",\"created_by\":null,\"foto_perfil_url\":null,\"apellido\":\"Espinoza\",\"es_premium\":0,\"fecha_inicio_premium\":null,\"fecha_expiracion_premium\":null}','{\"username\":\"secretaria1\",\"email\":\"secretaria@medisuite.cl\",\"nombre\":\"Macarena\",\"apellido_paterno\":\"Espinoza\",\"apellido_materno\":\"\",\"rut\":\"10.005.725-5\",\"telefono\":\"+56 9 5555 5555\",\"celular\":\"\",\"fecha_nacimiento\":\"2025-10-29\",\"genero\":\"femenino\",\"direccion\":\"\",\"ciudad\":\"Curicó\",\"region\":\"Región del Maule\",\"id_centro_principal\":1,\"id_sucursal_principal\":null,\"roles\":[5],\"requiere_cambio_password\":false,\"autenticacion_doble_factor\":false,\"estado\":\"activo\"}',1,NULL,5),(47,1,'2025-11-03 23:45:41','audit','usuarios','editar_usuario','Usuario editado: DULIANISE  SAINT AMOUR (ID: 17)','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','usuario','17','{\"id_usuario\":17,\"username\":\"duli\",\"email\":\"peterly.infoges@gmail.com\",\"nombre\":\"DULIANISE\",\"apellido_paterno\":\" SAINT AMOUR\",\"apellido_materno\":\"BRENORD\",\"rut\":\"26.399.128-1\",\"telefono\":\"+56949306385\",\"celular\":\"984150439\",\"direccion\":\"Valles de Don Felipe, pje 7 , #167 Curico\",\"ciudad\":\"curico\",\"region\":\"Región del Maule\",\"fecha_nacimiento\":\"2004-03-26T04:00:00.000Z\",\"genero\":\"femenino\",\"id_centro_principal\":1,\"id_sucursal_principal\":null,\"ultimo_login\":null,\"intentos_fallidos\":0,\"bloqueado_hasta\":null,\"estado\":\"activo\",\"requiere_cambio_password\":1,\"autenticacion_doble_factor\":1,\"fecha_creacion\":\"2025-10-28T15:19:15.000Z\",\"ultimo_acceso\":null,\"fecha_modificacion\":\"2025-11-03T00:54:30.000Z\",\"created_by\":null,\"foto_perfil_url\":null,\"apellido\":\" SAINT AMOUR BRENORD\",\"es_premium\":0,\"fecha_inicio_premium\":null,\"fecha_expiracion_premium\":null}','{\"username\":\"duli\",\"email\":\"peterly.infoges@gmail.com\",\"nombre\":\"DULIANISE\",\"apellido_paterno\":\" SAINT AMOUR\",\"apellido_materno\":\"BRENORD\",\"rut\":\"26.399.128-1\",\"telefono\":\"+56949306385\",\"celular\":\"984150439\",\"fecha_nacimiento\":\"2004-03-26\",\"genero\":\"femenino\",\"direccion\":\"Valles de Don Felipe, pje 7 , #167 Curico\",\"ciudad\":\"curico\",\"region\":\"Región del Maule\",\"id_centro_principal\":1,\"id_sucursal_principal\":null,\"roles\":[5],\"requiere_cambio_password\":true,\"autenticacion_doble_factor\":true,\"estado\":\"activo\"}',1,NULL,5),(48,1,'2025-11-04 15:36:28','audit','usuarios','editar_usuario','Usuario editado: Dulianise Saint Amour (ID: 4)','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','usuario','4','{\"id_usuario\":4,\"username\":\"medico1\",\"email\":\"saintamourdulianise@gmail.com\",\"nombre\":\"Dulianise\",\"apellido_paterno\":\"Saint Amour\",\"apellido_materno\":\"BRENORD\",\"rut\":\"26399128-1\",\"telefono\":\"+56 9 49306385\",\"celular\":null,\"direccion\":null,\"ciudad\":\"Curicó\",\"region\":\"Región del Maule\",\"fecha_nacimiento\":null,\"genero\":\"masculino\",\"id_centro_principal\":1,\"id_sucursal_principal\":null,\"ultimo_login\":null,\"intentos_fallidos\":0,\"bloqueado_hasta\":null,\"estado\":\"activo\",\"requiere_cambio_password\":0,\"autenticacion_doble_factor\":0,\"fecha_creacion\":\"2025-10-27T02:19:55.000Z\",\"ultimo_acceso\":null,\"fecha_modificacion\":\"2025-10-29T23:42:50.000Z\",\"created_by\":null,\"foto_perfil_url\":null,\"apellido\":\"Saint Amour BRENORD\",\"es_premium\":0,\"fecha_inicio_premium\":null,\"fecha_expiracion_premium\":null}','{\"username\":\"medico1\",\"email\":\"saintamourdulianise@gmail.com\",\"nombre\":\"Dulianise\",\"apellido_paterno\":\"Saint Amour\",\"apellido_materno\":\"BRENORD\",\"rut\":\"26399128-1\",\"telefono\":\"+56 9 49306385\",\"celular\":\"\",\"fecha_nacimiento\":\"\",\"genero\":\"masculino\",\"direccion\":\"\",\"ciudad\":\"Curicó\",\"region\":\"Región del Maule\",\"id_centro_principal\":1,\"id_sucursal_principal\":null,\"roles\":[5],\"requiere_cambio_password\":false,\"autenticacion_doble_factor\":false,\"estado\":\"activo\"}',1,NULL,5);
/*!40000 ALTER TABLE `logs_sistema` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mapeo_datos`
--

DROP TABLE IF EXISTS `mapeo_datos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mapeo_datos` (
  `id_mapeo` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `id_integracion` int(10) unsigned NOT NULL,
  `entidad_origen` varchar(100) NOT NULL,
  `campo_origen` varchar(100) NOT NULL,
  `entidad_destino` varchar(100) NOT NULL,
  `campo_destino` varchar(100) NOT NULL,
  `tipo_mapeo` enum('directo','conversion','transformacion','condicional','multiple') NOT NULL DEFAULT 'directo',
  `regla_conversion` text DEFAULT NULL,
  `condicion` text DEFAULT NULL,
  `valor_defecto` varchar(255) DEFAULT NULL,
  `obligatorio` tinyint(1) NOT NULL DEFAULT 1,
  `validacion` varchar(255) DEFAULT NULL,
  `direccion` enum('entrada','salida','bidireccional') NOT NULL DEFAULT 'bidireccional',
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `orden` int(10) unsigned DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_mapeo`),
  KEY `fk_mapeo_centro_idx` (`id_centro`),
  KEY `fk_mapeo_integracion_idx` (`id_integracion`),
  KEY `fk_mapeo_creador_idx` (`creado_por`),
  KEY `idx_mapeo_entidades` (`entidad_origen`,`entidad_destino`),
  KEY `idx_mapeo_campos` (`campo_origen`,`campo_destino`),
  KEY `idx_mapeo_tipo` (`tipo_mapeo`),
  KEY `idx_mapeo_obligatorio` (`obligatorio`),
  KEY `idx_mapeo_direccion` (`direccion`),
  KEY `idx_mapeo_activo` (`activo`),
  KEY `idx_mapeo_orden` (`orden`),
  CONSTRAINT `fk_mapeo_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_mapeo_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_mapeo_integracion` FOREIGN KEY (`id_integracion`) REFERENCES `integraciones_externas` (`id_integracion`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Mapeo de datos entre sistemas';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mapeo_datos`
--

LOCK TABLES `mapeo_datos` WRITE;
/*!40000 ALTER TABLE `mapeo_datos` DISABLE KEYS */;
/*!40000 ALTER TABLE `mapeo_datos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicamentos`
--

DROP TABLE IF EXISTS `medicamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `medicamentos` (
  `id_medicamento` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `codigo_isa` varchar(20) DEFAULT NULL,
  `nombre_generico` varchar(100) NOT NULL,
  `nombre_comercial` varchar(100) DEFAULT NULL,
  `forma_farmaceutica` varchar(50) NOT NULL,
  `concentracion` varchar(50) NOT NULL,
  `unidad_medida` varchar(20) NOT NULL,
  `presentacion` varchar(100) NOT NULL,
  `via_administracion` varchar(50) NOT NULL,
  `laboratorio` varchar(100) DEFAULT NULL,
  `requiere_receta` tinyint(1) NOT NULL DEFAULT 0,
  `controlado` tinyint(1) NOT NULL DEFAULT 0,
  `tipo_control` varchar(50) DEFAULT NULL,
  `codigo_atc` varchar(10) DEFAULT NULL,
  `grupo_terapeutico` varchar(100) DEFAULT NULL,
  `principio_activo` varchar(100) NOT NULL,
  `bioequivalente` tinyint(1) DEFAULT NULL,
  `generico` tinyint(1) NOT NULL DEFAULT 0,
  `ges` tinyint(1) NOT NULL DEFAULT 0,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `indicaciones` text DEFAULT NULL,
  `contraindicaciones` text DEFAULT NULL,
  `efectos_adversos` text DEFAULT NULL,
  `precauciones` text DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `registrado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_medicamento`),
  KEY `idx_medicamento_codigo` (`codigo_isa`),
  KEY `idx_medicamento_nombre_gen` (`nombre_generico`),
  KEY `idx_medicamento_nombre_com` (`nombre_comercial`),
  KEY `idx_medicamento_forma` (`forma_farmaceutica`),
  KEY `idx_medicamento_via` (`via_administracion`),
  KEY `idx_medicamento_atc` (`codigo_atc`),
  KEY `idx_medicamento_receta` (`requiere_receta`),
  KEY `idx_medicamento_control` (`controlado`),
  KEY `idx_medicamento_principio` (`principio_activo`),
  KEY `idx_medicamento_activo` (`activo`),
  KEY `fk_medicamento_registrador_idx` (`registrado_por`),
  CONSTRAINT `fk_medicamento_registrador` FOREIGN KEY (`registrado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Catálogo de medicamentos';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicamentos`
--

LOCK TABLES `medicamentos` WRITE;
/*!40000 ALTER TABLE `medicamentos` DISABLE KEYS */;
/*!40000 ALTER TABLE `medicamentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicos`
--

DROP TABLE IF EXISTS `medicos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `medicos` (
  `id_medico` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_usuario` int(10) unsigned DEFAULT NULL,
  `id_centro` int(10) unsigned DEFAULT NULL,
  `id_sucursal` int(10) unsigned DEFAULT NULL,
  `id_centro_principal` int(10) unsigned DEFAULT NULL,
  `id_especialidad_principal` int(10) unsigned DEFAULT NULL,
  `numero_registro_medico` varchar(50) DEFAULT NULL,
  `especialidad_principal` varchar(100) NOT NULL DEFAULT '',
  `titulo_profesional` varchar(100) DEFAULT NULL,
  `universidad` varchar(100) DEFAULT NULL,
  `ano_graduacion` year(4) DEFAULT NULL,
  `biografia` text DEFAULT NULL,
  `acepta_nuevos_pacientes` tinyint(1) NOT NULL DEFAULT 1,
  `atiende_particular` tinyint(1) NOT NULL DEFAULT 1,
  `atiende_fonasa` tinyint(1) NOT NULL DEFAULT 0,
  `atiende_isapre` tinyint(1) NOT NULL DEFAULT 0,
  `estado` enum('activo','inactivo','suspendido','vacaciones') NOT NULL DEFAULT 'activo',
  `verificado_por_admin` tinyint(1) DEFAULT 0,
  `consulta_presencial` tinyint(1) NOT NULL DEFAULT 1,
  `consulta_telemedicina` tinyint(1) NOT NULL DEFAULT 0,
  `firma_digital` tinyint(1) NOT NULL DEFAULT 0,
  `requiere_revision_credenciales` tinyint(1) NOT NULL DEFAULT 1,
  `firma_digital_url` varchar(255) DEFAULT NULL,
  `duracion_consulta_min` int(10) unsigned NOT NULL DEFAULT 30,
  `anos_experiencia` int(10) unsigned NOT NULL DEFAULT 0,
  `calificacion_promedio` decimal(3,2) DEFAULT 0.00,
  `numero_opiniones` int(10) unsigned DEFAULT 0,
  `fecha_inicio_actividad` date DEFAULT NULL,
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_medico`),
  UNIQUE KEY `idx_medico_usuario` (`id_usuario`),
  UNIQUE KEY `idx_medico_registro` (`numero_registro_medico`),
  KEY `fk_medico_centro_idx` (`id_centro_principal`),
  KEY `idx_medico_estado` (`estado`),
  KEY `idx_medico_particular` (`atiende_particular`),
  KEY `idx_medico_fonasa` (`atiende_fonasa`),
  KEY `idx_medico_isapre` (`atiende_isapre`),
  KEY `idx_medico_telemedicina` (`consulta_telemedicina`),
  KEY `fk_medico_especialidad` (`id_especialidad_principal`),
  KEY `idx_medico_centro` (`id_centro`),
  KEY `idx_medico_sucursal` (`id_sucursal`),
  KEY `idx_medico_especialidad_principal` (`especialidad_principal`),
  KEY `idx_medico_experiencia` (`anos_experiencia`),
  KEY `idx_medico_fecha_actualizacion` (`fecha_actualizacion`),
  CONSTRAINT `fk_medico_centro` FOREIGN KEY (`id_centro_principal`) REFERENCES `centros_medicos` (`id_centro`) ON UPDATE CASCADE,
  CONSTRAINT `fk_medico_centro_nuevo` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_medico_especialidad` FOREIGN KEY (`id_especialidad_principal`) REFERENCES `especialidades` (`id_especialidad`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_medico_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursales` (`id_sucursal`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_medico_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Información específica de médicos';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicos`
--

LOCK TABLES `medicos` WRITE;
/*!40000 ALTER TABLE `medicos` DISABLE KEYS */;
INSERT INTO `medicos` VALUES (1,4,1,NULL,1,NULL,'RM-2024-001','Medicina General','Médico Cirujano','Universidad de Chile',2018,'Médico general con 6 años de experiencia en atención primaria y medicina familiar. Especializada en atención integral del paciente con enfoque preventivo.',1,1,1,1,'activo',0,1,1,0,1,NULL,30,6,0.00,0,'2018-07-01','2025-11-04 00:23:06','2025-10-27 02:20:37','2025-11-04 00:23:06'),(8,NULL,NULL,NULL,1,NULL,'RM-2024-008','Medicina Interna','Médico Cirujano','Universidad de Talca',2015,'Especialista en medicina interna con enfoque en enfermedades crónicas y manejo integral del paciente adulto.',1,1,1,1,'activo',0,1,1,0,1,NULL,45,9,0.00,0,'2015-08-01','2025-11-04 00:23:13','2025-10-30 00:02:00','2025-11-04 00:23:13'),(9,5,NULL,NULL,1,NULL,'RM-2024-009','Medicina General','Médico Cirujano','Universidad Católica del Maule',2020,'Médico recién egresado con especialización en atención primaria y medicina preventiva.',1,1,1,0,'activo',0,1,1,0,1,NULL,30,8,4.80,0,'2020-03-01','2025-11-04 14:48:43','2025-11-03 02:07:54','2025-11-04 14:48:43');
/*!40000 ALTER TABLE `medicos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicos_especialidades`
--

DROP TABLE IF EXISTS `medicos_especialidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `medicos_especialidades` (
  `id_medico` int(10) unsigned NOT NULL,
  `id_especialidad` int(10) unsigned NOT NULL,
  `es_principal` tinyint(1) NOT NULL DEFAULT 0,
  `certificado_url` varchar(255) DEFAULT NULL,
  `fecha_certificacion` date DEFAULT NULL,
  `institucion_certificadora` varchar(100) DEFAULT NULL,
  `anos_experiencia` int(10) unsigned DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_medico`,`id_especialidad`),
  KEY `fk_medesp_especialidad_idx` (`id_especialidad`),
  KEY `idx_medesp_principal` (`es_principal`),
  CONSTRAINT `fk_medesp_especialidad` FOREIGN KEY (`id_especialidad`) REFERENCES `especialidades` (`id_especialidad`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_medesp_medico` FOREIGN KEY (`id_medico`) REFERENCES `medicos` (`id_medico`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Especialidades de cada médico';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicos_especialidades`
--

LOCK TABLES `medicos_especialidades` WRITE;
/*!40000 ALTER TABLE `medicos_especialidades` DISABLE KEYS */;
INSERT INTO `medicos_especialidades` VALUES (1,1,1,NULL,'2018-07-15','Universidad de Chile',6,'2025-11-04 00:23:25'),(1,3,0,NULL,'2020-03-10','Sociedad Chilena de Pediatría',4,'2025-11-04 00:23:25'),(1,63,0,NULL,NULL,NULL,0,'2025-10-29 23:42:51'),(8,1,1,NULL,'2015-08-20','Universidad de Talca',9,'2025-11-04 00:23:25'),(8,10,0,NULL,'2018-06-15','Sociedad Chilena de Endocrinología',6,'2025-11-04 00:23:25'),(9,1,1,NULL,'2020-03-25','Universidad Católica del Maule',4,'2025-11-04 00:23:25');
/*!40000 ALTER TABLE `medicos_especialidades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mensajes_automaticos`
--

DROP TABLE IF EXISTS `mensajes_automaticos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mensajes_automaticos` (
  `id_mensaje_auto` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `evento_disparador` varchar(100) NOT NULL,
  `condicion_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`condicion_json`)),
  `id_plantilla` int(10) unsigned NOT NULL,
  `id_canal` int(10) unsigned NOT NULL,
  `programacion` varchar(100) DEFAULT NULL,
  `retraso_minutos` int(10) unsigned DEFAULT NULL,
  `max_intentos` int(10) unsigned NOT NULL DEFAULT 3,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `horario_permitido_inicio` time DEFAULT NULL,
  `horario_permitido_fin` time DEFAULT NULL,
  `dias_semana` varchar(20) DEFAULT NULL,
  `categorias_destinatarios` varchar(255) DEFAULT NULL,
  `parametros_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`parametros_json`)),
  `fecha_ultima_ejecucion` datetime DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_mensaje_auto`),
  KEY `fk_mensajeauto_centro_idx` (`id_centro`),
  KEY `fk_mensajeauto_plantilla_idx` (`id_plantilla`),
  KEY `fk_mensajeauto_canal_idx` (`id_canal`),
  KEY `fk_mensajeauto_creador_idx` (`creado_por`),
  KEY `idx_mensajeauto_evento` (`evento_disparador`),
  KEY `idx_mensajeauto_activo` (`activo`),
  KEY `idx_mensajeauto_fechas` (`fecha_inicio`,`fecha_fin`),
  CONSTRAINT `fk_mensajeauto_canal` FOREIGN KEY (`id_canal`) REFERENCES `canales_comunicacion` (`id_canal`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_mensajeauto_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_mensajeauto_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_mensajeauto_plantilla` FOREIGN KEY (`id_plantilla`) REFERENCES `plantillas_mensajes` (`id_plantilla`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Mensajes programados automáticos';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mensajes_automaticos`
--

LOCK TABLES `mensajes_automaticos` WRITE;
/*!40000 ALTER TABLE `mensajes_automaticos` DISABLE KEYS */;
/*!40000 ALTER TABLE `mensajes_automaticos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mensajes_chat`
--

DROP TABLE IF EXISTS `mensajes_chat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mensajes_chat` (
  `id_mensaje` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id_usuario_emisor` int(10) unsigned NOT NULL,
  `id_usuario_receptor` int(10) unsigned NOT NULL,
  `contenido` text NOT NULL,
  `fecha_envio` datetime NOT NULL,
  `fecha_lectura` datetime DEFAULT NULL,
  `leido` tinyint(1) NOT NULL DEFAULT 0,
  `eliminado_emisor` tinyint(1) NOT NULL DEFAULT 0,
  `eliminado_receptor` tinyint(1) NOT NULL DEFAULT 0,
  `archivos_adjuntos` tinyint(1) NOT NULL DEFAULT 0,
  `id_conversacion` varchar(100) NOT NULL,
  `id_mensaje_respuesta` bigint(20) unsigned DEFAULT NULL,
  `tipo_mensaje` enum('texto','imagen','archivo','sistema','ubicacion') NOT NULL DEFAULT 'texto',
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `estado_envio` enum('enviado','entregado','leido','fallido') NOT NULL DEFAULT 'enviado',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_mensaje`),
  KEY `fk_mensaje_emisor_idx` (`id_usuario_emisor`),
  KEY `fk_mensaje_receptor_idx` (`id_usuario_receptor`),
  KEY `fk_mensaje_respuesta_idx` (`id_mensaje_respuesta`),
  KEY `idx_mensaje_fecha` (`fecha_envio`),
  KEY `idx_mensaje_leido` (`leido`),
  KEY `idx_mensaje_conversacion` (`id_conversacion`),
  KEY `idx_mensaje_tipo` (`tipo_mensaje`),
  KEY `idx_mensaje_estado` (`estado_envio`),
  CONSTRAINT `fk_mensaje_emisor` FOREIGN KEY (`id_usuario_emisor`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_mensaje_receptor` FOREIGN KEY (`id_usuario_receptor`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_mensaje_respuesta` FOREIGN KEY (`id_mensaje_respuesta`) REFERENCES `mensajes_chat` (`id_mensaje`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Mensajes de chat interno';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mensajes_chat`
--

LOCK TABLES `mensajes_chat` WRITE;
/*!40000 ALTER TABLE `mensajes_chat` DISABLE KEYS */;
/*!40000 ALTER TABLE `mensajes_chat` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `metas_tratamiento`
--

DROP TABLE IF EXISTS `metas_tratamiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `metas_tratamiento` (
  `id_meta` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente_programa` int(10) unsigned NOT NULL,
  `id_paciente` int(10) unsigned NOT NULL,
  `id_programa` int(10) unsigned NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `tipo_meta` varchar(50) NOT NULL,
  `valor_inicial` decimal(10,2) DEFAULT NULL,
  `valor_objetivo` decimal(10,2) DEFAULT NULL,
  `unidad_medida` varchar(20) DEFAULT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_objetivo` date DEFAULT NULL,
  `valor_actual` decimal(10,2) DEFAULT NULL,
  `fecha_ultima_medicion` date DEFAULT NULL,
  `porcentaje_cumplimiento` decimal(5,2) DEFAULT NULL,
  `estado` enum('pendiente','en_progreso','lograda','ajustada','cancelada') NOT NULL DEFAULT 'pendiente',
  `prioridad` enum('baja','media','alta','critica') NOT NULL DEFAULT 'media',
  `intervenciones` text DEFAULT NULL,
  `frecuencia_evaluacion` varchar(50) DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `validada_por` int(10) unsigned DEFAULT NULL,
  `fecha_validacion` datetime DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_meta`),
  KEY `fk_meta_pacprog_idx` (`id_paciente_programa`),
  KEY `fk_meta_paciente_idx` (`id_paciente`),
  KEY `fk_meta_programa_idx` (`id_programa`),
  KEY `fk_meta_validador_idx` (`validada_por`),
  KEY `fk_meta_creador_idx` (`creado_por`),
  KEY `idx_meta_tipo` (`tipo_meta`),
  KEY `idx_meta_fechas` (`fecha_inicio`,`fecha_objetivo`),
  KEY `idx_meta_estado` (`estado`),
  KEY `idx_meta_prioridad` (`prioridad`),
  CONSTRAINT `fk_meta_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_meta_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_meta_pacprog` FOREIGN KEY (`id_paciente_programa`) REFERENCES `pacientes_programas` (`id_paciente_programa`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_meta_programa` FOREIGN KEY (`id_programa`) REFERENCES `programas_especiales` (`id_programa`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_meta_validador` FOREIGN KEY (`validada_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Metas por paciente/programa';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `metas_tratamiento`
--

LOCK TABLES `metas_tratamiento` WRITE;
/*!40000 ALTER TABLE `metas_tratamiento` DISABLE KEYS */;
/*!40000 ALTER TABLE `metas_tratamiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `metodos_pago`
--

DROP TABLE IF EXISTS `metodos_pago`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `metodos_pago` (
  `id_metodo_pago` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `tipo` enum('efectivo','debito','credito','transferencia','cheque','webpay','otro') NOT NULL,
  `procesador` varchar(100) DEFAULT NULL,
  `requiere_confirmacion` tinyint(1) NOT NULL DEFAULT 0,
  `comision_porcentaje` decimal(5,2) DEFAULT NULL,
  `comision_fija` decimal(10,2) DEFAULT NULL,
  `configuracion_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`configuracion_json`)),
  `credenciales_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`credenciales_json`)),
  `permite_cuotas` tinyint(1) NOT NULL DEFAULT 0,
  `plazo_dias` int(10) unsigned DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `disponible_web` tinyint(1) NOT NULL DEFAULT 0,
  `disponible_presencial` tinyint(1) NOT NULL DEFAULT 1,
  `imagen_url` varchar(255) DEFAULT NULL,
  `orden` int(10) unsigned DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_metodo_pago`),
  KEY `fk_metpago_centro_idx` (`id_centro`),
  KEY `fk_metpago_creador_idx` (`creado_por`),
  KEY `idx_metpago_tipo` (`tipo`),
  KEY `idx_metpago_activo` (`activo`),
  KEY `idx_metpago_disponible` (`disponible_web`,`disponible_presencial`),
  KEY `idx_metpago_orden` (`orden`),
  CONSTRAINT `fk_metpago_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_metpago_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Métodos de pago disponibles';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `metodos_pago`
--

LOCK TABLES `metodos_pago` WRITE;
/*!40000 ALTER TABLE `metodos_pago` DISABLE KEYS */;
INSERT INTO `metodos_pago` VALUES (1,1,'Efectivo','Pago directo en caja o recepción.','efectivo',NULL,0,0.00,0.00,NULL,NULL,0,0,1,0,1,'/img/metodos/efectivo.png',1,'2025-10-30 20:02:35','2025-10-30 20:02:35',1),(2,1,'Tarjeta Débito','Pago mediante tarjeta bancaria con chip o contacto.','debito','RedCompra',1,0.80,0.00,NULL,NULL,0,1,1,1,1,'/img/metodos/debito.png',2,'2025-10-30 20:02:35','2025-10-30 20:02:35',1),(3,1,'Tarjeta Crédito','Pago con tarjeta de crédito en cuotas o una sola vez.','credito','Transbank',1,2.50,0.00,'{\"max_cuotas\":12}',NULL,1,3,1,1,1,'/img/metodos/credito.png',3,'2025-10-30 20:02:35','2025-10-30 20:02:35',1),(4,1,'Transferencia Bancaria','Pago por transferencia directa a la cuenta del centro médico.','transferencia','BancoEstado',0,0.00,0.00,'{\"cuenta\":\"12345678\",\"banco\":\"BancoEstado\",\"titular\":\"Centro Médico Curicó\"}',NULL,0,1,1,1,1,'/img/metodos/transferencia.png',4,'2025-10-30 20:02:35','2025-10-30 20:02:35',1),(5,1,'Pago Web (WebPay / Flow)','Pago en línea mediante plataforma segura de terceros.','webpay','Transbank',1,2.90,0.00,'{\"api_mode\":\"production\"}','{\"api_key\":\"XXXXXX\"}',1,1,1,1,1,'/img/metodos/webpay.png',5,'2025-10-30 20:02:35','2025-10-30 20:02:35',1),(6,1,'Convenio Empresa','Facturación y cobro gestionado a través de convenio empresarial.','otro','Interno',0,0.00,0.00,'{\"tipo\":\"corporativo\"}',NULL,0,7,1,0,1,'/img/metodos/convenio.png',6,'2025-10-30 20:02:35','2025-10-30 20:02:35',1),(7,1,'Cheque','Pago mediante cheque nominativo o postfechado.','cheque',NULL,0,0.00,0.00,NULL,NULL,0,3,1,0,1,'/img/metodos/cheque.png',7,'2025-10-30 20:02:35','2025-10-30 20:02:35',1);
/*!40000 ALTER TABLE `metodos_pago` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `normativas_sanitarias`
--

DROP TABLE IF EXISTS `normativas_sanitarias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `normativas_sanitarias` (
  `id_normativa` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descripcion` text NOT NULL,
  `tipo` enum('ley','decreto','resolucion','norma','circular','reglamento') NOT NULL,
  `fecha_publicacion` date NOT NULL,
  `fecha_vigencia` date NOT NULL,
  `entidad_emisora` varchar(100) NOT NULL,
  `url_documento` varchar(255) DEFAULT NULL,
  `ambito` varchar(100) NOT NULL,
  `aplicacion` text DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `estado` enum('vigente','derogada','modificada','suspendida') NOT NULL DEFAULT 'vigente',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `registrado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_normativa`),
  UNIQUE KEY `idx_normativa_codigo` (`codigo`),
  KEY `fk_normativa_registrador_idx` (`registrado_por`),
  KEY `idx_normativa_tipo` (`tipo`),
  KEY `idx_normativa_fechas` (`fecha_publicacion`,`fecha_vigencia`),
  KEY `idx_normativa_entidad` (`entidad_emisora`),
  KEY `idx_normativa_ambito` (`ambito`),
  KEY `idx_normativa_estado` (`estado`),
  FULLTEXT KEY `idx_normativa_texto` (`titulo`,`descripcion`,`aplicacion`),
  CONSTRAINT `fk_normativa_registrador` FOREIGN KEY (`registrado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Normativas sanitarias actualizadas';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `normativas_sanitarias`
--

LOCK TABLES `normativas_sanitarias` WRITE;
/*!40000 ALTER TABLE `normativas_sanitarias` DISABLE KEYS */;
/*!40000 ALTER TABLE `normativas_sanitarias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notas_clinicas`
--

DROP TABLE IF EXISTS `notas_clinicas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notas_clinicas` (
  `id_nota` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente` int(10) unsigned NOT NULL,
  `id_cita` int(10) unsigned DEFAULT NULL,
  `id_medico` int(10) unsigned DEFAULT NULL,
  `id_historial` int(10) unsigned DEFAULT NULL,
  `id_usuario` int(10) unsigned NOT NULL,
  `fecha_nota` datetime NOT NULL,
  `tipo_nota` enum('evolucion','interconsulta','procedimiento','enfermeria','administrativo','otro') NOT NULL,
  `contenido` text NOT NULL,
  `nivel_privacidad` enum('normal','restringido','confidencial') NOT NULL DEFAULT 'normal',
  `estado` enum('activo','corregido','anulado') NOT NULL DEFAULT 'activo',
  `etiquetas` varchar(255) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `modificado_por` int(10) unsigned DEFAULT NULL,
  `version` int(10) unsigned NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_nota`),
  KEY `fk_nota_paciente_idx` (`id_paciente`),
  KEY `fk_nota_historial_idx` (`id_historial`),
  KEY `fk_nota_usuario_idx` (`id_usuario`),
  KEY `fk_nota_modificador_idx` (`modificado_por`),
  KEY `idx_nota_fecha` (`fecha_nota`),
  KEY `idx_nota_tipo` (`tipo_nota`),
  KEY `idx_nota_privacidad` (`nivel_privacidad`),
  KEY `idx_nota_estado` (`estado`),
  KEY `idx_cita` (`id_cita`),
  KEY `idx_medico` (`id_medico`),
  FULLTEXT KEY `idx_nota_contenido` (`contenido`),
  CONSTRAINT `fk_nota_historial` FOREIGN KEY (`id_historial`) REFERENCES `historial_clinico` (`id_historial`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_nota_modificador` FOREIGN KEY (`modificado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_nota_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_nota_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON UPDATE CASCADE,
  CONSTRAINT `fk_notas_clinicas_cita` FOREIGN KEY (`id_cita`) REFERENCES `citas` (`id_cita`) ON DELETE CASCADE,
  CONSTRAINT `fk_notas_clinicas_medico` FOREIGN KEY (`id_medico`) REFERENCES `medicos` (`id_medico`) ON DELETE CASCADE,
  CONSTRAINT `fk_notas_clinicas_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Notas de evolución clínica';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notas_clinicas`
--

LOCK TABLES `notas_clinicas` WRITE;
/*!40000 ALTER TABLE `notas_clinicas` DISABLE KEYS */;
/*!40000 ALTER TABLE `notas_clinicas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificaciones`
--

DROP TABLE IF EXISTS `notificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notificaciones` (
  `id_notificacion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_usuario_destino` int(10) unsigned NOT NULL,
  `id_usuario_origen` int(10) unsigned DEFAULT NULL,
  `tipo` varchar(50) NOT NULL,
  `titulo` varchar(100) NOT NULL,
  `mensaje` text NOT NULL,
  `fecha_generacion` datetime NOT NULL,
  `fecha_lectura` datetime DEFAULT NULL,
  `fecha_programada` datetime DEFAULT NULL,
  `leida` tinyint(1) NOT NULL DEFAULT 0,
  `urgente` tinyint(1) NOT NULL DEFAULT 0,
  `accion` varchar(100) DEFAULT NULL,
  `url_accion` varchar(255) DEFAULT NULL,
  `parametros_accion` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`parametros_accion`)),
  `tipo_objeto` varchar(50) DEFAULT NULL,
  `id_objeto` int(10) unsigned DEFAULT NULL,
  `estado` enum('pendiente','enviada','leida','eliminada','caducada') NOT NULL DEFAULT 'pendiente',
  `enviada_email` tinyint(1) NOT NULL DEFAULT 0,
  `enviada_sms` tinyint(1) NOT NULL DEFAULT 0,
  `enviada_push` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_notificacion`),
  KEY `fk_notificacion_destino_idx` (`id_usuario_destino`),
  KEY `fk_notificacion_origen_idx` (`id_usuario_origen`),
  KEY `idx_notificacion_tipo` (`tipo`),
  KEY `idx_notificacion_fecha` (`fecha_generacion`),
  KEY `idx_notificacion_leida` (`leida`),
  KEY `idx_notificacion_urgente` (`urgente`),
  KEY `idx_notificacion_estado` (`estado`),
  KEY `idx_notificacion_objeto` (`tipo_objeto`,`id_objeto`),
  CONSTRAINT `fk_notificacion_destino` FOREIGN KEY (`id_usuario_destino`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_notificacion_origen` FOREIGN KEY (`id_usuario_origen`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Sistema de notificaciones internas';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificaciones`
--

LOCK TABLES `notificaciones` WRITE;
/*!40000 ALTER TABLE `notificaciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `notificaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificaciones_admin`
--

DROP TABLE IF EXISTS `notificaciones_admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notificaciones_admin` (
  `id_notificacion` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id_usuario_destino` int(10) unsigned NOT NULL COMMENT 'Super admin destinatario',
  `tipo` enum('info','alerta','critico','exito') NOT NULL DEFAULT 'info',
  `titulo` varchar(255) NOT NULL,
  `mensaje` text NOT NULL,
  `datos_adicionales` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`datos_adicionales`)),
  `leida` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_lectura` datetime DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `accion_requerida` tinyint(1) NOT NULL DEFAULT 0,
  `url_accion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_notificacion`),
  KEY `idx_notif_usuario` (`id_usuario_destino`),
  KEY `idx_notif_leida` (`leida`),
  KEY `idx_notif_fecha` (`fecha_creacion`),
  CONSTRAINT `fk_notif_usuario` FOREIGN KEY (`id_usuario_destino`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Sistema de notificaciones para super administradores';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificaciones_admin`
--

LOCK TABLES `notificaciones_admin` WRITE;
/*!40000 ALTER TABLE `notificaciones_admin` DISABLE KEYS */;
/*!40000 ALTER TABLE `notificaciones_admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ordenes_examenes`
--

DROP TABLE IF EXISTS `ordenes_examenes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ordenes_examenes` (
  `id_orden` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `tipo_examen` varchar(100) DEFAULT NULL,
  `id_centro` int(10) unsigned NOT NULL,
  `id_paciente` int(10) unsigned NOT NULL,
  `id_medico` int(10) unsigned NOT NULL,
  `numero_orden` varchar(50) DEFAULT NULL,
  `fecha_emision` datetime NOT NULL,
  `estado` enum('emitida','en_proceso','completada','cancelada','anulada') NOT NULL DEFAULT 'emitida',
  `tipo_orden` enum('laboratorio','imagen','procedimiento','multidisciplinaria','externa') NOT NULL,
  `prioridad` enum('normal','urgente','critica') NOT NULL DEFAULT 'normal',
  `diagnostico` varchar(255) DEFAULT NULL,
  `codigo_cie10` varchar(10) DEFAULT NULL,
  `comentarios` text DEFAULT NULL,
  `id_laboratorio` int(10) unsigned DEFAULT NULL,
  `id_historial` int(10) unsigned DEFAULT NULL,
  `id_cita` int(10) unsigned DEFAULT NULL,
  `fecha_entrega_estimada` date DEFAULT NULL,
  `url_documento` varchar(255) DEFAULT NULL,
  `cantidad_examenes` int(10) unsigned NOT NULL DEFAULT 0,
  `pagada` tinyint(1) NOT NULL DEFAULT 0,
  `valor_total` decimal(10,2) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_orden`),
  KEY `fk_orden_centro_idx` (`id_centro`),
  KEY `fk_orden_paciente_idx` (`id_paciente`),
  KEY `fk_orden_medico_idx` (`id_medico`),
  KEY `fk_orden_laboratorio_idx` (`id_laboratorio`),
  KEY `fk_orden_historial_idx` (`id_historial`),
  KEY `fk_orden_cita_idx` (`id_cita`),
  KEY `idx_orden_numero` (`numero_orden`),
  KEY `idx_orden_fecha` (`fecha_emision`),
  KEY `idx_orden_estado` (`estado`),
  KEY `idx_orden_tipo` (`tipo_orden`),
  KEY `idx_orden_prioridad` (`prioridad`),
  KEY `idx_orden_diagnostico` (`codigo_cie10`),
  KEY `idx_orden_pagada` (`pagada`),
  CONSTRAINT `fk_orden_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_orden_cita` FOREIGN KEY (`id_cita`) REFERENCES `citas` (`id_cita`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_orden_historial` FOREIGN KEY (`id_historial`) REFERENCES `historial_clinico` (`id_historial`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_orden_laboratorio` FOREIGN KEY (`id_laboratorio`) REFERENCES `integracion_laboratorios` (`id_integracion`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_orden_medico` FOREIGN KEY (`id_medico`) REFERENCES `medicos` (`id_medico`) ON UPDATE CASCADE,
  CONSTRAINT `fk_orden_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Órdenes de exámenes emitidas';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ordenes_examenes`
--

LOCK TABLES `ordenes_examenes` WRITE;
/*!40000 ALTER TABLE `ordenes_examenes` DISABLE KEYS */;
/*!40000 ALTER TABLE `ordenes_examenes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pacientes`
--

DROP TABLE IF EXISTS `pacientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pacientes` (
  `id_paciente` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `uuid_global` char(36) DEFAULT NULL COMMENT 'UUID para sincronización entre sistemas',
  `sincronizado_externamente` tinyint(1) NOT NULL DEFAULT 0,
  `sistema_origen` varchar(100) DEFAULT NULL COMMENT 'Sistema externo de origen',
  `id_externo` varchar(100) DEFAULT NULL COMMENT 'ID en sistema externo',
  `ultima_sincronizacion` timestamp NULL DEFAULT NULL,
  `id_usuario` int(10) unsigned DEFAULT NULL,
  `documento_tipo` enum('rut','dni','passport','ssn','nif','nie','cedula','curp','otros') DEFAULT 'rut',
  `rut` varchar(12) NOT NULL,
  `pasaporte` varchar(20) DEFAULT NULL,
  `documento_pais_emision` varchar(3) DEFAULT NULL COMMENT 'Código ISO 3166-1 alpha-3',
  `nombre` varchar(100) NOT NULL,
  `segundo_nombre` varchar(100) DEFAULT NULL,
  `apellido_paterno` varchar(100) NOT NULL,
  `apellido_materno` varchar(100) DEFAULT NULL,
  `apellido_casada` varchar(100) DEFAULT NULL COMMENT 'Para registros internacionales',
  `nombre_preferido` varchar(100) DEFAULT NULL COMMENT 'Nombre social o preferido',
  `pronombres` varchar(50) DEFAULT NULL COMMENT 'él/ella/elle/otros',
  `fecha_nacimiento` date NOT NULL,
  `genero` enum('masculino','femenino','no_binario','prefiero_no_decir') NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `email_verificado` tinyint(1) NOT NULL DEFAULT 0,
  `telefono` varchar(20) DEFAULT NULL,
  `telefono_verificado` tinyint(1) NOT NULL DEFAULT 0,
  `celular` varchar(20) DEFAULT NULL,
  `celular_verificado` tinyint(1) NOT NULL DEFAULT 0,
  `whatsapp` varchar(20) DEFAULT NULL,
  `telegram` varchar(50) DEFAULT NULL,
  `red_social_preferida` varchar(50) DEFAULT NULL,
  `url_red_social` varchar(255) DEFAULT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT NULL,
  `region` varchar(100) DEFAULT NULL,
  `pais` varchar(3) DEFAULT NULL COMMENT 'Código ISO 3166-1 alpha-3',
  `codigo_postal` varchar(10) DEFAULT NULL,
  `coordenadas_lat` decimal(10,8) DEFAULT NULL,
  `coordenadas_lng` decimal(11,8) DEFAULT NULL,
  `zona_horaria` varchar(50) DEFAULT 'America/Santiago',
  `idioma_preferido` varchar(10) DEFAULT 'es-CL' COMMENT 'Código ISO 639-1 + ISO 3166-1',
  `idiomas_adicionales` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array de códigos de idioma' CHECK (json_valid(`idiomas_adicionales`)),
  `nacionalidad` varchar(50) DEFAULT 'Chilena',
  `estado_civil` enum('soltero','casado','viudo','divorciado','separado','conviviente') DEFAULT NULL,
  `ocupacion` varchar(100) DEFAULT NULL,
  `nivel_educacion` varchar(50) DEFAULT NULL,
  `grupo_sanguineo` enum('A+','A-','B+','B-','AB+','AB-','O+','O-','desconocido') NOT NULL DEFAULT 'desconocido',
  `alergias` text DEFAULT NULL COMMENT 'JSON array de alergias',
  `condiciones_cronicas` text DEFAULT NULL COMMENT 'JSON array de condiciones crónicas',
  `peso_kg` decimal(5,2) DEFAULT NULL,
  `altura_cm` decimal(5,2) DEFAULT NULL,
  `imc` decimal(4,2) DEFAULT NULL COMMENT 'Calculado automáticamente',
  `lateralidad` enum('diestro','zurdo','ambidiestro') DEFAULT NULL,
  `religion` varchar(50) DEFAULT NULL,
  `etnia` varchar(50) DEFAULT NULL,
  `discapacidades` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array de discapacidades' CHECK (json_valid(`discapacidades`)),
  `alergias_criticas` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Alergias de alto riesgo' CHECK (json_valid(`alergias_criticas`)),
  `clasificacion_riesgo` enum('bajo','medio','alto','critico') DEFAULT NULL,
  `es_vip` tinyint(1) NOT NULL DEFAULT 0,
  `categoria_especial` varchar(50) DEFAULT NULL COMMENT 'Diplomático, Empleado, Familiar, etc.',
  `numero_historia_clinica` varchar(50) DEFAULT NULL COMMENT 'Número único de historia clínica',
  `codigo_barra_historia` varchar(100) DEFAULT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Etiquetas personalizadas del centro' CHECK (json_valid(`tags`)),
  `es_donante_organos` tinyint(1) DEFAULT NULL,
  `estado` enum('activo','inactivo','bloqueado','fallecido') NOT NULL DEFAULT 'activo',
  `bloqueado_por` int(10) unsigned DEFAULT NULL,
  `fecha_bloqueo` timestamp NULL DEFAULT NULL,
  `razon_bloqueo` text DEFAULT NULL,
  `verificado` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Identidad verificada',
  `fecha_verificacion` timestamp NULL DEFAULT NULL,
  `verificado_por` int(10) unsigned DEFAULT NULL,
  `metodo_verificacion` enum('presencial','video_llamada','documento_digital','biometrico','terceros') DEFAULT NULL,
  `documento_verificacion_url` varchar(500) DEFAULT NULL COMMENT 'Documento de identidad escaneado (encriptado)',
  `hash_huella_digital` varchar(255) DEFAULT NULL COMMENT 'Hash de huella dactilar',
  `hash_facial` varchar(255) DEFAULT NULL COMMENT 'Hash de reconocimiento facial',
  `requiere_2fa` tinyint(1) NOT NULL DEFAULT 0,
  `foto_url` varchar(255) DEFAULT NULL,
  `preferencia_contacto` enum('email','telefono','sms','whatsapp','ninguno') DEFAULT 'telefono',
  `token_notificaciones_push` text DEFAULT NULL,
  `dispositivos_registrados` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Dispositivos móviles registrados' CHECK (json_valid(`dispositivos_registrados`)),
  `acepta_notificaciones_push` tinyint(1) NOT NULL DEFAULT 1,
  `horario_no_molestar_inicio` time DEFAULT NULL,
  `horario_no_molestar_fin` time DEFAULT NULL,
  `acepta_comunicaciones_marketing` tinyint(1) NOT NULL DEFAULT 0,
  `acepta_telemedicina` tinyint(1) NOT NULL DEFAULT 0,
  `prevision_salud` varchar(100) DEFAULT NULL,
  `consentimiento_datos` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_consentimiento_datos` timestamp NULL DEFAULT NULL,
  `consentimiento_investigacion` tinyint(1) NOT NULL DEFAULT 0,
  `consentimiento_compartir_centros` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Compartir datos entre centros asociados',
  `nivel_privacidad` enum('publico','restringido','confidencial','ultra_confidencial') NOT NULL DEFAULT 'restringido',
  `excluir_estadisticas` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_eliminacion_solicitada` timestamp NULL DEFAULT NULL COMMENT 'Derecho al olvido GDPR',
  `motivo_eliminacion` text DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `version` int(11) NOT NULL DEFAULT 1 COMMENT 'Control de versiones del registro',
  `modificado_por` int(10) unsigned DEFAULT NULL,
  `ip_ultima_modificacion` varchar(45) DEFAULT NULL,
  `user_agent_modificacion` text DEFAULT NULL,
  `cambios_pendientes_aprobacion` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Cambios que requieren autorización' CHECK (json_valid(`cambios_pendientes_aprobacion`)),
  `id_centro_registro` int(10) unsigned DEFAULT NULL,
  `id_sucursal_registro` int(10) unsigned DEFAULT NULL,
  `es_paciente_compartido` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Paciente en múltiples centros',
  `centros_autorizados` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array de id_centro con acceso' CHECK (json_valid(`centros_autorizados`)),
  `centro_principal` int(10) unsigned DEFAULT NULL COMMENT 'Centro que tiene control maestro',
  `registrado_por` int(10) unsigned DEFAULT NULL,
  `ip_registro` varchar(45) DEFAULT NULL,
  `user_agent_registro` text DEFAULT NULL,
  `notas_administrativas` text DEFAULT NULL,
  PRIMARY KEY (`id_paciente`),
  UNIQUE KEY `idx_paciente_rut` (`rut`),
  UNIQUE KEY `idx_paciente_pasaporte` (`pasaporte`),
  UNIQUE KEY `uuid_global` (`uuid_global`),
  UNIQUE KEY `numero_historia_clinica` (`numero_historia_clinica`),
  KEY `fk_paciente_usuario_idx` (`id_usuario`),
  KEY `fk_paciente_centro_idx` (`id_centro_registro`),
  KEY `fk_paciente_sucursal_idx` (`id_sucursal_registro`),
  KEY `fk_paciente_registrador_idx` (`registrado_por`),
  KEY `idx_paciente_estado` (`estado`),
  KEY `idx_paciente_nombre_completo` (`nombre`,`apellido_paterno`,`apellido_materno`),
  KEY `idx_paciente_fechanac` (`fecha_nacimiento`),
  KEY `idx_paciente_contacto` (`preferencia_contacto`),
  KEY `idx_paciente_sangre` (`grupo_sanguineo`),
  KEY `idx_paciente_uuid` (`uuid_global`),
  KEY `idx_paciente_verificado` (`verificado`),
  KEY `idx_paciente_compartido` (`es_paciente_compartido`),
  KEY `idx_paciente_centro_principal` (`centro_principal`),
  KEY `idx_paciente_historia_clinica` (`numero_historia_clinica`),
  KEY `idx_paciente_documento` (`documento_tipo`,`rut`),
  KEY `idx_paciente_pais` (`pais`),
  KEY `idx_paciente_zona_horaria` (`zona_horaria`),
  KEY `idx_paciente_vip` (`es_vip`),
  KEY `idx_paciente_riesgo` (`clasificacion_riesgo`),
  KEY `idx_paciente_idioma` (`idioma_preferido`),
  KEY `idx_paciente_email_verificado` (`email`,`email_verificado`),
  KEY `idx_paciente_sync` (`sincronizado_externamente`,`ultima_sincronizacion`),
  KEY `fk_paciente_verificador` (`verificado_por`),
  KEY `fk_paciente_modificador` (`modificado_por`),
  KEY `fk_paciente_bloqueador` (`bloqueado_por`),
  KEY `idx_prevision_salud` (`prevision_salud`),
  FULLTEXT KEY `idx_paciente_busqueda_completa` (`nombre`,`apellido_paterno`,`apellido_materno`,`segundo_nombre`,`nombre_preferido`,`rut`,`pasaporte`,`email`),
  CONSTRAINT `fk_paciente_bloqueador` FOREIGN KEY (`bloqueado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_paciente_centro` FOREIGN KEY (`id_centro_registro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_paciente_centro_principal` FOREIGN KEY (`centro_principal`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_paciente_modificador` FOREIGN KEY (`modificado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_paciente_registrador` FOREIGN KEY (`registrado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_paciente_sucursal` FOREIGN KEY (`id_sucursal_registro`) REFERENCES `sucursales` (`id_sucursal`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_paciente_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_paciente_verificador` FOREIGN KEY (`verificado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pacientes_prevision_salud` FOREIGN KEY (`prevision_salud`) REFERENCES `previsiones_salud` (`codigo`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Información básica de pacientes';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pacientes`
--

LOCK TABLES `pacientes` WRITE;
/*!40000 ALTER TABLE `pacientes` DISABLE KEYS */;
INSERT INTO `pacientes` VALUES (1,NULL,0,NULL,NULL,NULL,NULL,'passport','26.235.507-1','ab1234566',NULL,'Ana','','Torres','',NULL,'','','1998-05-22','femenino','paciente@medisuite.cl',0,'+56 9 1234 5678',0,NULL,0,NULL,NULL,NULL,NULL,'Av. San Martín 1234, Curicó','','','CHL','',NULL,NULL,'America/Santiago','es-CL',NULL,'Chilena','','',NULL,'desconocido',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,'activo',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'telefono',NULL,NULL,1,NULL,NULL,0,0,'DIPR',0,NULL,0,0,'restringido',0,NULL,NULL,'2025-10-27 12:18:26','2025-11-01 03:31:19',4,NULL,NULL,NULL,NULL,1,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL),(2,NULL,0,NULL,NULL,NULL,NULL,'rut','26235507-1','',NULL,'Ana','PETERLY','Torres',NULL,NULL,'Aleluya','El','1998-05-22','femenino','paciente@medisuite.cl',0,'+56 9 1234 5678',0,'949306385',0,NULL,NULL,NULL,NULL,'Av. San Martín 1234, Curicó',NULL,NULL,'CHL',NULL,NULL,NULL,'America/Santiago','es-CL',NULL,'Chilena',NULL,NULL,NULL,'desconocido',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,'activo',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'telefono',NULL,NULL,1,NULL,NULL,0,0,'BANM',0,NULL,0,0,'restringido',0,NULL,NULL,'2025-10-29 12:55:41','2025-11-03 16:50:40',11,NULL,NULL,NULL,NULL,1,NULL,0,NULL,NULL,1,NULL,NULL,NULL),(3,'eef687b8-b6d2-11f0-add2-6c0b5e7bf4a8',0,NULL,NULL,NULL,NULL,'passport','263991281','262355071',NULL,'Anyssa ','Karryne','BRENORD','Saint-Amour',NULL,'ALEUYA','Ella','2025-09-12','femenino','brenordpeterly2018@gmail.com',0,'+56949306385',0,'949306385',0,NULL,NULL,NULL,NULL,'Valles de Don Felipe, pje 7 , #167 Curico','','07','CHL','3340000',NULL,NULL,'America/Santiago','es-CL',NULL,'Chilena','soltero','Alumna',NULL,'AB-',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,0,'activo',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'telefono',NULL,NULL,0,NULL,NULL,0,0,'FON',0,NULL,0,0,'restringido',0,NULL,NULL,'2025-11-01 03:29:06','2025-11-01 03:38:17',3,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL),(4,'9e2ecedf-b914-11f0-9ed0-6c0b5e7bf4a8',0,NULL,NULL,NULL,NULL,'rut','15.234.567-8',NULL,NULL,'María','Isabel','González','Pérez',NULL,NULL,NULL,'1985-05-15','femenino','maria.gonzalez@email.com',0,'+56945678901',0,'+56945678901',0,'+56945678901',NULL,NULL,NULL,'Av. Central 123','Curicó','Región del Maule','CHL','3340000',NULL,NULL,'America/Santiago','es-CL',NULL,'Chilena','casado','Profesora',NULL,'O+',NULL,NULL,65.50,165.00,24.06,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,'activo',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'whatsapp',NULL,NULL,1,NULL,NULL,0,1,NULL,1,'2025-11-04 00:24:25',0,0,'restringido',0,NULL,NULL,'2025-11-04 00:24:25','2025-11-04 00:24:25',1,NULL,NULL,NULL,NULL,1,NULL,0,NULL,NULL,1,NULL,NULL,NULL),(5,'9e47c623-b914-11f0-9ed0-6c0b5e7bf4a8',0,NULL,NULL,NULL,NULL,'rut','16.345.678-9',NULL,NULL,'Pedro','Antonio','Martínez','Silva',NULL,NULL,NULL,'1990-08-22','masculino','pedro.martinez@email.com',0,'+56956789012',0,'+56956789012',0,'+56956789012',NULL,NULL,NULL,'Calle Los Aromos 456','Curicó','Región del Maule','CHL','3340000',NULL,NULL,'America/Santiago','es-CL',NULL,'Chilena','soltero','Ingeniero',NULL,'A+',NULL,NULL,78.00,175.00,25.47,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,'activo',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'email',NULL,NULL,1,NULL,NULL,0,1,NULL,1,'2025-11-04 00:24:25',0,0,'restringido',0,NULL,NULL,'2025-11-04 00:24:25','2025-11-04 00:24:25',1,NULL,NULL,NULL,NULL,1,NULL,0,NULL,NULL,1,NULL,NULL,NULL),(6,'9e47cd82-b914-11f0-9ed0-6c0b5e7bf4a8',0,NULL,NULL,NULL,NULL,'rut','17.456.789-0',NULL,NULL,'Carmen','Rosa','Rodríguez','Torres',NULL,NULL,NULL,'1978-03-10','femenino','carmen.rodriguez@email.com',0,'+56967890123',0,'+56967890123',0,'+56967890123',NULL,NULL,NULL,'Pasaje Las Rosas 789','Curicó','Región del Maule','CHL','3340000',NULL,NULL,'America/Santiago','es-CL',NULL,'Chilena','divorciado','Comerciante',NULL,'B+',NULL,NULL,70.00,160.00,27.34,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,'activo',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'telefono',NULL,NULL,1,NULL,NULL,0,0,NULL,1,'2025-11-04 00:24:25',0,0,'restringido',0,NULL,NULL,'2025-11-04 00:24:25','2025-11-04 00:24:25',1,NULL,NULL,NULL,NULL,1,NULL,0,NULL,NULL,1,NULL,NULL,NULL),(7,'9e48513b-b914-11f0-9ed0-6c0b5e7bf4a8',0,NULL,NULL,NULL,NULL,'rut','18.567.890-1',NULL,NULL,'Luis','Fernando','Fernández','Muñoz',NULL,NULL,NULL,'1995-11-30','masculino','luis.fernandez@email.com',0,'+56978901234',0,'+56978901234',0,'+56978901234',NULL,NULL,NULL,'Av. Manso de Velasco 321','Curicó','Región del Maule','CHL','3340000',NULL,NULL,'America/Santiago','es-CL',NULL,'Chilena','soltero','Estudiante',NULL,'AB+',NULL,NULL,72.50,180.00,22.38,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,'activo',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'whatsapp',NULL,NULL,1,NULL,NULL,0,1,NULL,1,'2025-11-04 00:24:25',0,0,'restringido',0,NULL,NULL,'2025-11-04 00:24:25','2025-11-04 00:24:25',1,NULL,NULL,NULL,NULL,1,NULL,0,NULL,NULL,1,NULL,NULL,NULL),(8,'9e493faa-b914-11f0-9ed0-6c0b5e7bf4a8',0,NULL,NULL,NULL,NULL,'rut','19.678.901-2',NULL,NULL,'Ana','María','López','Ramírez',NULL,NULL,NULL,'1982-07-18','femenino','ana.lopez@email.com',0,'+56989012345',0,'+56989012345',0,'+56989012345',NULL,NULL,NULL,'Calle Peña 654','Curicó','Región del Maule','CHL','3340000',NULL,NULL,'America/Santiago','es-CL',NULL,'Chilena','casado','Enfermera',NULL,'O-',NULL,NULL,58.00,162.00,22.10,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,'activo',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'email',NULL,NULL,1,NULL,NULL,0,1,NULL,1,'2025-11-04 00:24:25',0,0,'restringido',0,NULL,NULL,'2025-11-04 00:24:25','2025-11-04 00:24:25',1,NULL,NULL,NULL,NULL,2,NULL,0,NULL,NULL,1,NULL,NULL,NULL),(9,'9e4947ad-b914-11f0-9ed0-6c0b5e7bf4a8',0,NULL,NULL,NULL,NULL,'rut','20.789.012-3',NULL,NULL,'Carlos','Andrés','Sánchez','Vargas',NULL,NULL,NULL,'1988-12-05','masculino','carlos.sanchez@email.com',0,'+56990123456',0,'+56990123456',0,'+56990123456',NULL,NULL,NULL,'Av. Balmaceda 987','Curicó','Región del Maule','CHL','3340000',NULL,NULL,'America/Santiago','es-CL',NULL,'Chilena','conviviente','Contador',NULL,'A-',NULL,NULL,85.00,178.00,26.83,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,'activo',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'whatsapp',NULL,NULL,1,NULL,NULL,0,1,NULL,1,'2025-11-04 00:24:25',0,0,'restringido',0,NULL,NULL,'2025-11-04 00:24:25','2025-11-04 00:24:25',1,NULL,NULL,NULL,NULL,1,NULL,0,NULL,NULL,1,NULL,NULL,NULL),(10,'9e495ca2-b914-11f0-9ed0-6c0b5e7bf4a8',0,NULL,NULL,NULL,NULL,'rut','21.890.123-4',NULL,NULL,'Patricia','Elena','Morales','Castro',NULL,NULL,NULL,'1975-04-25','femenino','patricia.morales@email.com',0,'+56901234567',0,'+56901234567',0,'+56901234567',NULL,NULL,NULL,'Pasaje Los Olivos 147','Curicó','Región del Maule','CHL','3340000',NULL,NULL,'America/Santiago','es-CL',NULL,'Chilena','viudo','Dueña de Casa',NULL,'B-',NULL,NULL,68.00,158.00,27.24,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,'activo',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'telefono',NULL,NULL,1,NULL,NULL,0,0,NULL,1,'2025-11-04 00:24:25',0,0,'restringido',0,NULL,NULL,'2025-11-04 00:24:25','2025-11-04 00:24:25',1,NULL,NULL,NULL,NULL,2,NULL,0,NULL,NULL,1,NULL,NULL,NULL),(11,'9e49629c-b914-11f0-9ed0-6c0b5e7bf4a8',0,NULL,NULL,NULL,NULL,'rut','22.901.234-5',NULL,NULL,'Jorge','Luis','Herrera','Díaz',NULL,NULL,NULL,'1992-09-14','masculino','jorge.herrera@email.com',0,'+56912345678',0,'+56912345678',0,'+56912345678',NULL,NULL,NULL,'Calle Carmen 258','Curicó','Región del Maule','CHL','3340000',NULL,NULL,'America/Santiago','es-CL',NULL,'Chilena','soltero','Técnico',NULL,'O+',NULL,NULL,75.00,172.00,25.35,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,'activo',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'whatsapp',NULL,NULL,1,NULL,NULL,0,1,NULL,1,'2025-11-04 00:24:25',0,0,'restringido',0,NULL,NULL,'2025-11-04 00:24:25','2025-11-04 00:24:25',1,NULL,NULL,NULL,NULL,1,NULL,0,NULL,NULL,1,NULL,NULL,NULL),(12,'9e49668e-b914-11f0-9ed0-6c0b5e7bf4a8',0,NULL,NULL,NULL,NULL,'rut','23.012.345-6',NULL,NULL,'Rosa','María','Pizarro','Núñez',NULL,NULL,NULL,'1980-06-08','femenino','rosa.pizarro@email.com',0,'+56923456789',0,'+56923456789',0,'+56923456789',NULL,NULL,NULL,'Av. Los Héroes 369','Curicó','Región del Maule','CHL','3340000',NULL,NULL,'America/Santiago','es-CL',NULL,'Chilena','casado','Secretaria',NULL,'A+',NULL,NULL,62.00,165.00,22.77,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,'activo',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'email',NULL,NULL,1,NULL,NULL,0,1,NULL,1,'2025-11-04 00:24:25',0,0,'restringido',0,NULL,NULL,'2025-11-04 00:24:25','2025-11-04 00:24:25',1,NULL,NULL,NULL,NULL,1,NULL,0,NULL,NULL,1,NULL,NULL,NULL),(13,'9e4969e5-b914-11f0-9ed0-6c0b5e7bf4a8',0,NULL,NULL,NULL,NULL,'rut','24.123.456-7',NULL,NULL,'Manuel','Jesús','Contreras','Rojas',NULL,NULL,NULL,'1987-01-20','masculino','manuel.contreras@email.com',0,'+56934567890',0,'+56934567890',0,'+56934567890',NULL,NULL,NULL,'Pasaje San Martín 741','Curicó','Región del Maule','CHL','3340000',NULL,NULL,'America/Santiago','es-CL',NULL,'Chilena','divorciado','Vendedor',NULL,'B+',NULL,NULL,80.00,176.00,25.83,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,'activo',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'whatsapp',NULL,NULL,1,NULL,NULL,0,1,NULL,1,'2025-11-04 00:24:25',0,0,'restringido',0,NULL,NULL,'2025-11-04 00:24:25','2025-11-04 00:24:25',1,NULL,NULL,NULL,NULL,2,NULL,0,NULL,NULL,1,NULL,NULL,NULL),(14,'9e496d01-b914-11f0-9ed0-6c0b5e7bf4a8',0,NULL,NULL,NULL,NULL,'rut','25.234.567-8',NULL,NULL,'Elena','Patricia','Vega','Campos',NULL,NULL,NULL,'1983-10-12','femenino','elena.vega@email.com',0,'+56945678902',0,'+56945678902',0,'+56945678902',NULL,NULL,NULL,'Calle Estado 852','Curicó','Región del Maule','CHL','3340000',NULL,NULL,'America/Santiago','es-CL',NULL,'Chilena','casado','Psicóloga',NULL,'AB-',NULL,NULL,60.00,163.00,22.58,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,'activo',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'email',NULL,NULL,1,NULL,NULL,0,1,NULL,1,'2025-11-04 00:24:25',0,0,'restringido',0,NULL,NULL,'2025-11-04 00:24:25','2025-11-04 00:24:25',1,NULL,NULL,NULL,NULL,1,NULL,0,NULL,NULL,1,NULL,NULL,NULL),(15,'9e496ff1-b914-11f0-9ed0-6c0b5e7bf4a8',0,NULL,NULL,NULL,NULL,'rut','26.345.678-9',NULL,NULL,'Ricardo','Alberto','Bravo','Espinoza',NULL,NULL,NULL,'1991-02-28','masculino','ricardo.bravo@email.com',0,'+56956789013',0,'+56956789013',0,'+56956789013',NULL,NULL,NULL,'Av. Prat 963','Curicó','Región del Maule','CHL','3340000',NULL,NULL,'America/Santiago','es-CL',NULL,'Chilena','soltero','Programador',NULL,'O+',NULL,NULL,73.00,174.00,24.11,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,'activo',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'whatsapp',NULL,NULL,1,NULL,NULL,0,1,NULL,1,'2025-11-04 00:24:25',0,0,'restringido',0,NULL,NULL,'2025-11-04 00:24:25','2025-11-04 00:24:25',1,NULL,NULL,NULL,NULL,1,NULL,0,NULL,NULL,1,NULL,NULL,NULL),(16,'9e4972dd-b914-11f0-9ed0-6c0b5e7bf4a8',0,NULL,NULL,NULL,NULL,'rut','27.456.789-0',NULL,NULL,'Sofía','Valentina','Reyes','Gutiérrez',NULL,NULL,NULL,'1986-08-17','femenino','sofia.reyes@email.com',0,'+56967890124',0,'+56967890124',0,'+56967890124',NULL,NULL,NULL,'Pasaje Independencia 159','Curicó','Región del Maule','CHL','3340000',NULL,NULL,'America/Santiago','es-CL',NULL,'Chilena','conviviente','Diseñadora',NULL,'A-',NULL,NULL,55.00,160.00,21.48,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,'activo',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'email',NULL,NULL,1,NULL,NULL,0,1,NULL,1,'2025-11-04 00:24:25',0,0,'restringido',0,NULL,NULL,'2025-11-04 00:24:25','2025-11-04 00:24:25',1,NULL,NULL,NULL,NULL,2,NULL,0,NULL,NULL,1,NULL,NULL,NULL),(17,'9e4975cf-b914-11f0-9ed0-6c0b5e7bf4a8',0,NULL,NULL,NULL,NULL,'rut','28.567.890-1',NULL,NULL,'Diego','Alejandro','Muñoz','Flores',NULL,NULL,NULL,'1994-05-03','masculino','diego.munoz@email.com',0,'+56978901235',0,'+56978901235',0,'+56978901235',NULL,NULL,NULL,'Calle Maipú 357','Curicó','Región del Maule','CHL','3340000',NULL,NULL,'America/Santiago','es-CL',NULL,'Chilena','soltero','Chef',NULL,'B+',NULL,NULL,90.00,182.00,27.17,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,'activo',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'whatsapp',NULL,NULL,1,NULL,NULL,0,1,NULL,1,'2025-11-04 00:24:25',0,0,'restringido',0,NULL,NULL,'2025-11-04 00:24:25','2025-11-04 00:24:25',1,NULL,NULL,NULL,NULL,1,NULL,0,NULL,NULL,1,NULL,NULL,NULL),(18,'9e4978be-b914-11f0-9ed0-6c0b5e7bf4a8',0,NULL,NULL,NULL,NULL,'rut','29.678.901-2',NULL,NULL,'Laura','Francisca','Navarro','Soto',NULL,NULL,NULL,'1979-11-22','femenino','laura.navarro@email.com',0,'+56989012346',0,'+56989012346',0,'+56989012346',NULL,NULL,NULL,'Av. O\'Higgins 468','Curicó','Región del Maule','CHL','3340000',NULL,NULL,'America/Santiago','es-CL',NULL,'Chilena','casado','Abogada',NULL,'O-',NULL,NULL,64.00,167.00,22.95,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,'activo',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'email',NULL,NULL,1,NULL,NULL,0,1,NULL,1,'2025-11-04 00:24:25',0,0,'restringido',0,NULL,NULL,'2025-11-04 00:24:25','2025-11-04 00:24:25',1,NULL,NULL,NULL,NULL,1,NULL,0,NULL,NULL,1,NULL,NULL,NULL),(19,'98fc093e-b98d-11f0-9ed0-6c0b5e7bf4a8',0,NULL,NULL,NULL,26,'rut','12345678-9',NULL,NULL,'María',NULL,'González','Pérez',NULL,NULL,NULL,'1978-05-15','femenino','maria.gonzalez@email.com',0,'+56912345678',0,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'America/Santiago','es-CL',NULL,'Chilena',NULL,NULL,NULL,'O+','[\"Penicilina\", \"Polen\"]','[\"Hipertensión\", \"Diabetes Tipo 2\"]',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,'activo',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'telefono',NULL,NULL,1,NULL,NULL,0,0,NULL,0,NULL,0,0,'restringido',0,NULL,NULL,'2025-11-04 14:50:25','2025-11-04 14:50:25',1,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL),(20,'990814bb-b98d-11f0-9ed0-6c0b5e7bf4a8',0,NULL,NULL,NULL,26,'rut','23456789-0',NULL,NULL,'Carlos',NULL,'Ramírez','Silva',NULL,NULL,NULL,'1991-08-22','masculino','carlos.ramirez@email.com',0,'+56987654321',0,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'America/Santiago','es-CL',NULL,'Chilena',NULL,NULL,NULL,'A+','[]','[\"Asma\"]',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,'activo',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'telefono',NULL,NULL,1,NULL,NULL,0,0,NULL,0,NULL,0,0,'restringido',0,NULL,NULL,'2025-11-04 14:50:25','2025-11-04 14:50:25',1,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL),(21,'99143ae9-b98d-11f0-9ed0-6c0b5e7bf4a8',0,NULL,NULL,NULL,26,'rut','34567890-1',NULL,NULL,'Ana',NULL,'Martínez','López',NULL,NULL,NULL,'1995-12-10','femenino','ana.martinez@email.com',0,'+56923456789',0,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'America/Santiago','es-CL',NULL,'Chilena',NULL,NULL,NULL,'B+','[\"Lactosa\"]','[]',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,'activo',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'telefono',NULL,NULL,1,NULL,NULL,0,0,NULL,0,NULL,0,0,'restringido',0,NULL,NULL,'2025-11-04 14:50:25','2025-11-04 14:50:25',1,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL),(22,'991f940a-b98d-11f0-9ed0-6c0b5e7bf4a8',0,NULL,NULL,NULL,26,'rut','45678901-2',NULL,NULL,'Pedro',NULL,'Sánchez','Rojas',NULL,NULL,NULL,'1965-03-28','masculino','pedro.sanchez@email.com',0,'+56934567890',0,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'America/Santiago','es-CL',NULL,'Chilena',NULL,NULL,NULL,'AB-','[\"Sulfas\", \"Mariscos\"]','[\"Diabetes Tipo 2\", \"Colesterol Alto\"]',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,'activo',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'telefono',NULL,NULL,1,NULL,NULL,0,0,NULL,0,NULL,0,0,'restringido',0,NULL,NULL,'2025-11-04 14:50:25','2025-11-04 14:50:25',1,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL),(23,'9929d312-b98d-11f0-9ed0-6c0b5e7bf4a8',0,NULL,NULL,NULL,26,'rut','56789012-3',NULL,NULL,'Isabel',NULL,'Torres','Vargas',NULL,NULL,NULL,'1956-07-18','femenino','isabel.torres@email.com',0,'+56945678901',0,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'America/Santiago','es-CL',NULL,'Chilena',NULL,NULL,NULL,'O-','[\"Aspirina\"]','[\"Hipertensión\", \"Artritis\"]',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,'activo',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'telefono',NULL,NULL,1,NULL,NULL,0,0,NULL,0,NULL,0,0,'restringido',0,NULL,NULL,'2025-11-04 14:50:25','2025-11-04 14:50:25',1,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `pacientes` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `before_insert_paciente_uuid`
BEFORE INSERT ON `pacientes`
FOR EACH ROW
BEGIN
  IF NEW.uuid_global IS NULL THEN
    SET NEW.uuid_global = UUID();
  END IF;
  
  -- Calcular IMC si peso y altura están disponibles
  IF NEW.peso_kg IS NOT NULL AND NEW.altura_cm IS NOT NULL AND NEW.altura_cm > 0 THEN
    SET NEW.imc = NEW.peso_kg / POWER(NEW.altura_cm / 100, 2);
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `before_update_paciente_version`
BEFORE UPDATE ON `pacientes`
FOR EACH ROW
BEGIN
  SET NEW.version = OLD.version + 1;
  
  -- Recalcular IMC si cambió peso o altura
  IF (NEW.peso_kg != OLD.peso_kg OR NEW.altura_cm != OLD.altura_cm) 
     AND NEW.peso_kg IS NOT NULL AND NEW.altura_cm IS NOT NULL AND NEW.altura_cm > 0 THEN
    SET NEW.imc = NEW.peso_kg / POWER(NEW.altura_cm / 100, 2);
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `pacientes_dispositivos`
--

DROP TABLE IF EXISTS `pacientes_dispositivos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pacientes_dispositivos` (
  `id_asignacion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente` int(10) unsigned NOT NULL,
  `id_dispositivo_iot` int(10) unsigned NOT NULL,
  `fecha_asignacion` date NOT NULL,
  `fecha_devolucion` date DEFAULT NULL,
  `estado` enum('asignado','devuelto','perdido','dañado') NOT NULL DEFAULT 'asignado',
  `notas_asignacion` text DEFAULT NULL,
  `motivo_asignacion` text DEFAULT NULL,
  `id_medico_solicitante` int(10) unsigned DEFAULT NULL,
  `responsable_entrega` int(10) unsigned NOT NULL,
  `responsable_recepcion` int(10) unsigned DEFAULT NULL,
  `configuracion_especifica` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`configuracion_especifica`)),
  `instrucciones_paciente` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_asignacion`),
  KEY `fk_asignacion_paciente_idx` (`id_paciente`),
  KEY `fk_asignacion_dispositivo_idx` (`id_dispositivo_iot`),
  KEY `fk_asignacion_medico_idx` (`id_medico_solicitante`),
  KEY `fk_asignacion_entrega_idx` (`responsable_entrega`),
  KEY `fk_asignacion_recepcion_idx` (`responsable_recepcion`),
  KEY `idx_asignacion_estado` (`estado`),
  KEY `idx_asignacion_fechas` (`fecha_asignacion`,`fecha_devolucion`),
  CONSTRAINT `fk_asignacion_dispositivo` FOREIGN KEY (`id_dispositivo_iot`) REFERENCES `dispositivos_iot` (`id_dispositivo_iot`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_asignacion_entrega` FOREIGN KEY (`responsable_entrega`) REFERENCES `usuarios` (`id_usuario`) ON UPDATE CASCADE,
  CONSTRAINT `fk_asignacion_medico` FOREIGN KEY (`id_medico_solicitante`) REFERENCES `medicos` (`id_medico`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_asignacion_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_asignacion_recepcion` FOREIGN KEY (`responsable_recepcion`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Asignación de dispositivos IoT a pacientes';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pacientes_dispositivos`
--

LOCK TABLES `pacientes_dispositivos` WRITE;
/*!40000 ALTER TABLE `pacientes_dispositivos` DISABLE KEYS */;
/*!40000 ALTER TABLE `pacientes_dispositivos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pacientes_medico`
--

DROP TABLE IF EXISTS `pacientes_medico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pacientes_medico` (
  `id_paciente` int(10) unsigned NOT NULL,
  `id_medico` int(10) unsigned NOT NULL,
  `fecha_asignacion` date NOT NULL,
  `fecha_desasignacion` date DEFAULT NULL,
  `es_principal` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1 = médico tratante principal',
  `activo` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1 = relación vigente',
  `notas` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_paciente`,`id_medico`),
  KEY `fk_pm_medico_idx` (`id_medico`),
  KEY `idx_pm_activo` (`activo`),
  CONSTRAINT `fk_pm_medico` FOREIGN KEY (`id_medico`) REFERENCES `medicos` (`id_medico`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_pm_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Asignación de pacientes a médicos tratantes (para métricas de carga de pacientes)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pacientes_medico`
--

LOCK TABLES `pacientes_medico` WRITE;
/*!40000 ALTER TABLE `pacientes_medico` DISABLE KEYS */;
/*!40000 ALTER TABLE `pacientes_medico` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pacientes_programas`
--

DROP TABLE IF EXISTS `pacientes_programas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pacientes_programas` (
  `id_paciente_programa` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente` int(10) unsigned NOT NULL,
  `id_programa` int(10) unsigned NOT NULL,
  `id_plan_ges` int(10) unsigned DEFAULT NULL,
  `id_medico_tratante` int(10) unsigned NOT NULL,
  `fecha_ingreso` date NOT NULL,
  `fecha_egreso` date DEFAULT NULL,
  `motivo_egreso` varchar(255) DEFAULT NULL,
  `cumple_criterios` tinyint(1) NOT NULL DEFAULT 1,
  `detalles_criterios` text DEFAULT NULL,
  `consentimiento_firmado` tinyint(1) NOT NULL DEFAULT 0,
  `id_consentimiento` int(10) unsigned DEFAULT NULL,
  `estado` enum('ingresado','activo','suspendido','completado','abandono','excluido') NOT NULL DEFAULT 'ingresado',
  `motivo_suspension` text DEFAULT NULL,
  `porcentaje_cumplimiento` decimal(5,2) DEFAULT NULL,
  `resultado_final` text DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `notificaciones_activas` tinyint(1) NOT NULL DEFAULT 1,
  `seguimiento_telefono` tinyint(1) NOT NULL DEFAULT 0,
  `seguimiento_app` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_proxima_evaluacion` date DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `ingresado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_paciente_programa`),
  UNIQUE KEY `idx_pacprog_unico` (`id_paciente`,`id_programa`,`fecha_ingreso`),
  KEY `fk_pacprog_paciente_idx` (`id_paciente`),
  KEY `fk_pacprog_programa_idx` (`id_programa`),
  KEY `fk_pacprog_ges_idx` (`id_plan_ges`),
  KEY `fk_pacprog_medico_idx` (`id_medico_tratante`),
  KEY `fk_pacprog_consentimiento_idx` (`id_consentimiento`),
  KEY `fk_pacprog_ingresador_idx` (`ingresado_por`),
  KEY `idx_pacprog_fechas` (`fecha_ingreso`,`fecha_egreso`),
  KEY `idx_pacprog_estado` (`estado`),
  KEY `idx_pacprog_proxima` (`fecha_proxima_evaluacion`),
  CONSTRAINT `fk_pacprog_consentimiento` FOREIGN KEY (`id_consentimiento`) REFERENCES `consentimientos_informados` (`id_consentimiento_informado`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pacprog_ges` FOREIGN KEY (`id_plan_ges`) REFERENCES `planes_ges` (`id_plan_ges`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pacprog_ingresador` FOREIGN KEY (`ingresado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pacprog_medico` FOREIGN KEY (`id_medico_tratante`) REFERENCES `medicos` (`id_medico`) ON UPDATE CASCADE,
  CONSTRAINT `fk_pacprog_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_pacprog_programa` FOREIGN KEY (`id_programa`) REFERENCES `programas_especiales` (`id_programa`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Asignación de pacientes a programas';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pacientes_programas`
--

LOCK TABLES `pacientes_programas` WRITE;
/*!40000 ALTER TABLE `pacientes_programas` DISABLE KEYS */;
/*!40000 ALTER TABLE `pacientes_programas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `paises`
--

DROP TABLE IF EXISTS `paises`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `paises` (
  `id_pais` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(120) NOT NULL,
  `capital` varchar(100) DEFAULT NULL,
  `continente` varchar(50) DEFAULT NULL,
  `moneda` varchar(50) DEFAULT NULL,
  `codigo_moneda` char(3) DEFAULT NULL,
  `idioma_oficial` varchar(50) DEFAULT NULL,
  `dominio_internet` char(5) DEFAULT NULL,
  `bandera_url` varchar(255) DEFAULT NULL,
  `prioridad` int(10) unsigned NOT NULL DEFAULT 100,
  `codigo_iso2` char(2) NOT NULL,
  `codigo_iso3` char(3) DEFAULT NULL,
  `phone_code` varchar(10) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_pais`),
  UNIQUE KEY `ux_paises_iso2` (`codigo_iso2`),
  KEY `idx_paises_activo` (`activo`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paises`
--

LOCK TABLES `paises` WRITE;
/*!40000 ALTER TABLE `paises` DISABLE KEYS */;
INSERT INTO `paises` VALUES (1,'Chile','Santiago','América del Sur','Peso Chileno','CLP','Español','.cl','https://flagsapi.com/CL/flat/64.png',1,'CL','CHL','+56',1,'2025-11-01 03:44:50','2025-11-01 03:44:50'),(2,'Argentina','Buenos Aires','América del Sur','Peso Argentino','ARS','Español','.ar','https://flagsapi.com/AR/flat/64.png',2,'AR','ARG','+54',1,'2025-11-01 03:44:50','2025-11-01 03:44:50'),(3,'Brasil','Brasilia','América del Sur','Real Brasileño','BRL','Portugués','.br','https://flagsapi.com/BR/flat/64.png',3,'BR','BRA','+55',1,'2025-11-01 03:44:50','2025-11-01 03:44:50'),(4,'Perú','Lima','América del Sur','Sol Peruano','PEN','Español','.pe','https://flagsapi.com/PE/flat/64.png',4,'PE','PER','+51',1,'2025-11-01 03:44:50','2025-11-01 03:44:50'),(5,'Haití','Puerto Príncipe','América del Norte','Gourde Haitiano','HTG','Criollo Haitiano','.ht','https://flagsapi.com/HT/flat/64.png',5,'HT','HTI','+509',1,'2025-11-01 03:44:50','2025-11-01 03:44:50'),(6,'Francia','París','Europa','Euro','EUR','Francés','.fr','https://flagsapi.com/FR/flat/64.png',6,'FR','FRA','+33',1,'2025-11-01 03:44:50','2025-11-01 03:44:50'),(7,'Estados Unidos','Washington D.C.','América del Norte','Dólar Estadounidense','USD','Inglés','.us','https://flagsapi.com/US/flat/64.png',7,'US','USA','+1',1,'2025-11-01 03:44:50','2025-11-01 03:44:50'),(8,'España','Madrid','Europa','Euro','EUR','Español','.es','https://flagsapi.com/ES/flat/64.png',8,'ES','ESP','+34',1,'2025-11-01 03:44:50','2025-11-01 03:44:50'),(9,'México','Ciudad de México','América del Norte','Peso Mexicano','MXN','Español','.mx','https://flagsapi.com/MX/flat/64.png',9,'MX','MEX','+52',1,'2025-11-01 03:44:50','2025-11-01 03:44:50'),(10,'Canadá','Ottawa','América del Norte','Dólar Canadiense','CAD','Inglés / Francés','.ca','https://flagsapi.com/CA/flat/64.png',10,'CA','CAN','+1',1,'2025-11-01 03:44:50','2025-11-01 03:44:50'),(11,'Japón','Tokio','Asia','Yen Japonés','JPY','Japonés','.jp','https://flagsapi.com/JP/flat/64.png',11,'JP','JPN','+81',1,'2025-11-01 03:44:50','2025-11-01 03:44:50'),(12,'Alemania','Berlín','Europa','Euro','EUR','Alemán','.de','https://flagsapi.com/DE/flat/64.png',12,'DE','DEU','+49',1,'2025-11-01 03:44:50','2025-11-01 03:44:50'),(13,'Reino Unido','Londres','Europa','Libra Esterlina','GBP','Inglés','.uk','https://flagsapi.com/GB/flat/64.png',13,'GB','GBR','+44',1,'2025-11-01 03:44:50','2025-11-01 03:44:50'),(14,'Italia','Roma','Europa','Euro','EUR','Italiano','.it','https://flagsapi.com/IT/flat/64.png',14,'IT','ITA','+39',1,'2025-11-01 03:44:50','2025-11-01 03:44:50'),(15,'Australia','Canberra','Oceanía','Dólar Australiano','AUD','Inglés','.au','https://flagsapi.com/AU/flat/64.png',15,'AU','AUS','+61',1,'2025-11-01 03:44:50','2025-11-01 03:44:50'),(16,'Colombia','Bogotá','América del Sur','Peso Colombiano','COP','Español','.co','https://flagsapi.com/CO/flat/64.png',16,'CO','COL','+57',1,'2025-11-01 03:44:50','2025-11-01 03:44:50'),(17,'Ecuador','Quito','América del Sur','Dólar Estadounidense','USD','Español','.ec','https://flagsapi.com/EC/flat/64.png',17,'EC','ECU','+593',1,'2025-11-01 03:44:50','2025-11-01 03:44:50'),(18,'Bolivia','Sucre / La Paz','América del Sur','Boliviano','BOB','Español','.bo','https://flagsapi.com/BO/flat/64.png',18,'BO','BOL','+591',1,'2025-11-01 03:44:50','2025-11-01 03:44:50'),(19,'Uruguay','Montevideo','América del Sur','Peso Uruguayo','UYU','Español','.uy','https://flagsapi.com/UY/flat/64.png',19,'UY','URY','+598',1,'2025-11-01 03:44:50','2025-11-01 03:44:50'),(20,'Paraguay','Asunción','América del Sur','Guaraní','PYG','Español / Guaraní','.py','https://flagsapi.com/PY/flat/64.png',20,'PY','PRY','+595',1,'2025-11-01 03:44:50','2025-11-01 03:44:50');
/*!40000 ALTER TABLE `paises` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permisos`
--

DROP TABLE IF EXISTS `permisos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `permisos` (
  `id_permiso` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `codigo` varchar(100) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `modulo` varchar(50) NOT NULL,
  `tipo` enum('lectura','escritura','eliminacion','administracion') NOT NULL,
  `es_critico` tinyint(1) NOT NULL DEFAULT 0,
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_permiso`),
  UNIQUE KEY `idx_permiso_codigo` (`codigo`),
  KEY `idx_permiso_modulo` (`modulo`),
  KEY `idx_permiso_tipo` (`tipo`),
  KEY `idx_permiso_estado` (`estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Permisos del sistema';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permisos`
--

LOCK TABLES `permisos` WRITE;
/*!40000 ALTER TABLE `permisos` DISABLE KEYS */;
/*!40000 ALTER TABLE `permisos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permisos_centro_paciente`
--

DROP TABLE IF EXISTS `permisos_centro_paciente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `permisos_centro_paciente` (
  `id_permiso` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente` int(10) unsigned NOT NULL,
  `id_centro` int(10) unsigned NOT NULL,
  `nivel_acceso` enum('completo','lectura','restringido','emergencia') NOT NULL DEFAULT 'lectura',
  `puede_modificar` tinyint(1) NOT NULL DEFAULT 0,
  `puede_ver_historial` tinyint(1) NOT NULL DEFAULT 1,
  `puede_ver_examenes` tinyint(1) NOT NULL DEFAULT 1,
  `puede_ver_recetas` tinyint(1) NOT NULL DEFAULT 1,
  `puede_ver_diagnosticos` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_inicio_permiso` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_fin_permiso` timestamp NULL DEFAULT NULL,
  `concedido_por` int(10) unsigned DEFAULT NULL,
  `razon_permiso` text DEFAULT NULL,
  `estado` enum('activo','revocado','expirado') NOT NULL DEFAULT 'activo',
  PRIMARY KEY (`id_permiso`),
  UNIQUE KEY `idx_unico_centro_paciente` (`id_paciente`,`id_centro`),
  KEY `idx_permiso_centro` (`id_centro`,`estado`),
  CONSTRAINT `permisos_centro_paciente_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE,
  CONSTRAINT `permisos_centro_paciente_ibfk_2` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Permisos granulares por centro';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permisos_centro_paciente`
--

LOCK TABLES `permisos_centro_paciente` WRITE;
/*!40000 ALTER TABLE `permisos_centro_paciente` DISABLE KEYS */;
/*!40000 ALTER TABLE `permisos_centro_paciente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `planes_autocuidado`
--

DROP TABLE IF EXISTS `planes_autocuidado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `planes_autocuidado` (
  `id_plan` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `id_paciente` int(10) unsigned NOT NULL,
  `id_medico` int(10) unsigned NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text NOT NULL,
  `objetivos` text NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `estado` enum('activo','completado','cancelado','suspendido') NOT NULL DEFAULT 'activo',
  `nivel_complejidad` enum('basico','intermedio','avanzado') NOT NULL DEFAULT 'basico',
  `recursos_asignados` text DEFAULT NULL,
  `indicaciones_especiales` text DEFAULT NULL,
  `notas_seguimiento` text DEFAULT NULL,
  `progreso_porcentaje` decimal(5,2) DEFAULT NULL,
  `fecha_ultimo_seguimiento` date DEFAULT NULL,
  `id_historial` int(10) unsigned DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_plan`),
  KEY `fk_plan_centro_idx` (`id_centro`),
  KEY `fk_plan_paciente_idx` (`id_paciente`),
  KEY `fk_plan_medico_idx` (`id_medico`),
  KEY `fk_plan_historial_idx` (`id_historial`),
  KEY `fk_plan_creador_idx` (`creado_por`),
  KEY `idx_plan_fechas` (`fecha_inicio`,`fecha_fin`),
  KEY `idx_plan_estado` (`estado`),
  KEY `idx_plan_complejidad` (`nivel_complejidad`),
  KEY `idx_plan_seguimiento` (`fecha_ultimo_seguimiento`),
  CONSTRAINT `fk_plan_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_plan_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_plan_historial` FOREIGN KEY (`id_historial`) REFERENCES `historial_clinico` (`id_historial`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_plan_medico` FOREIGN KEY (`id_medico`) REFERENCES `medicos` (`id_medico`) ON UPDATE CASCADE,
  CONSTRAINT `fk_plan_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Planes personalizados de autocuidado';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `planes_autocuidado`
--

LOCK TABLES `planes_autocuidado` WRITE;
/*!40000 ALTER TABLE `planes_autocuidado` DISABLE KEYS */;
/*!40000 ALTER TABLE `planes_autocuidado` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `planes_ges`
--

DROP TABLE IF EXISTS `planes_ges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `planes_ges` (
  `id_plan_ges` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `codigo_ges` varchar(20) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `descripcion` text NOT NULL,
  `decreto` varchar(50) DEFAULT NULL,
  `fecha_inicio_vigencia` date NOT NULL,
  `fecha_fin_vigencia` date DEFAULT NULL,
  `patologias_relacionadas` text DEFAULT NULL,
  `codigos_cie10` text DEFAULT NULL,
  `criterios_inclusion` text DEFAULT NULL,
  `criterios_confirmacion` text DEFAULT NULL,
  `garantias` text DEFAULT NULL,
  `prestaciones_garantizadas` text DEFAULT NULL,
  `tiempos_maximos` text DEFAULT NULL,
  `protocolos_url` varchar(255) DEFAULT NULL,
  `formularios_url` varchar(255) DEFAULT NULL,
  `estado` enum('vigente','no_vigente','modificado') NOT NULL DEFAULT 'vigente',
  `observaciones` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_plan_ges`),
  UNIQUE KEY `idx_planes_codigo` (`codigo_ges`),
  KEY `idx_planes_fechas` (`fecha_inicio_vigencia`,`fecha_fin_vigencia`),
  KEY `idx_planes_estado` (`estado`),
  FULLTEXT KEY `idx_planes_busqueda` (`nombre`,`descripcion`,`patologias_relacionadas`,`codigos_cie10`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Planes de Garantías Explícitas en Salud';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `planes_ges`
--

LOCK TABLES `planes_ges` WRITE;
/*!40000 ALTER TABLE `planes_ges` DISABLE KEYS */;
/*!40000 ALTER TABLE `planes_ges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plantillas_documentos`
--

DROP TABLE IF EXISTS `plantillas_documentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `plantillas_documentos` (
  `id_plantilla` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `tipo_documento` enum('certificado','receta','informe','consentimiento','derivacion','otro') NOT NULL,
  `contenido_html` text NOT NULL,
  `variables` text DEFAULT NULL,
  `encabezado_html` text DEFAULT NULL,
  `pie_html` text DEFAULT NULL,
  `css` text DEFAULT NULL,
  `orientacion` enum('vertical','horizontal') NOT NULL DEFAULT 'vertical',
  `tamano_papel` varchar(10) NOT NULL DEFAULT 'LETTER',
  `margenes` varchar(50) DEFAULT '2cm',
  `version` varchar(10) NOT NULL DEFAULT '1.0',
  `especialidades` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_plantilla`),
  KEY `fk_plantdoc_centro_idx` (`id_centro`),
  KEY `fk_plantdoc_creador_idx` (`creado_por`),
  KEY `idx_plantdoc_tipo` (`tipo_documento`),
  KEY `idx_plantdoc_activo` (`activo`),
  CONSTRAINT `fk_plantdoc_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_plantdoc_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Plantillas para documentos médicos';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plantillas_documentos`
--

LOCK TABLES `plantillas_documentos` WRITE;
/*!40000 ALTER TABLE `plantillas_documentos` DISABLE KEYS */;
/*!40000 ALTER TABLE `plantillas_documentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plantillas_mensajes`
--

DROP TABLE IF EXISTS `plantillas_mensajes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `plantillas_mensajes` (
  `id_plantilla` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `tipo` enum('email','sms','whatsapp','notificacion','chatbot') NOT NULL,
  `asunto` varchar(100) DEFAULT NULL,
  `contenido` text NOT NULL,
  `variables` varchar(255) DEFAULT NULL,
  `categoria` varchar(50) NOT NULL,
  `es_html` tinyint(1) NOT NULL DEFAULT 0,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `descripcion` text DEFAULT NULL,
  `etiquetas` varchar(255) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_plantilla`),
  KEY `fk_plantilla_centro_idx` (`id_centro`),
  KEY `fk_plantilla_creador_idx` (`creado_por`),
  KEY `idx_plantilla_tipo` (`tipo`),
  KEY `idx_plantilla_categoria` (`categoria`),
  KEY `idx_plantilla_activo` (`activo`),
  CONSTRAINT `fk_plantilla_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_plantilla_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Plantillas para comunicación automatizada';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plantillas_mensajes`
--

LOCK TABLES `plantillas_mensajes` WRITE;
/*!40000 ALTER TABLE `plantillas_mensajes` DISABLE KEYS */;
/*!40000 ALTER TABLE `plantillas_mensajes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `politicas_seguridad`
--

DROP TABLE IF EXISTS `politicas_seguridad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `politicas_seguridad` (
  `id_politica` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned DEFAULT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `configuracion_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`configuracion_json`)),
  `nivel_aplicacion` enum('sistema','centro','grupo','usuario') NOT NULL DEFAULT 'sistema',
  `aplicable_a` varchar(100) DEFAULT NULL,
  `version` varchar(20) NOT NULL DEFAULT '1.0',
  `fecha_efectiva` date NOT NULL,
  `fecha_expiracion` date DEFAULT NULL,
  `estado` enum('activa','inactiva','borrador','obsoleta') NOT NULL DEFAULT 'activa',
  `obligatoria` tinyint(1) NOT NULL DEFAULT 1,
  `heredable` tinyint(1) NOT NULL DEFAULT 1,
  `anulable` tinyint(1) NOT NULL DEFAULT 0,
  `prioridad` int(10) unsigned NOT NULL DEFAULT 100,
  `ultima_revision` date DEFAULT NULL,
  `proxima_revision` date DEFAULT NULL,
  `responsable_id` int(10) unsigned DEFAULT NULL,
  `aprobador_id` int(10) unsigned DEFAULT NULL,
  `fecha_aprobacion` date DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_politica`),
  KEY `fk_politica_centro_idx` (`id_centro`),
  KEY `fk_politica_responsable_idx` (`responsable_id`),
  KEY `fk_politica_aprobador_idx` (`aprobador_id`),
  KEY `fk_politica_creador_idx` (`creado_por`),
  KEY `idx_politica_tipo` (`tipo`),
  KEY `idx_politica_nivel` (`nivel_aplicacion`),
  KEY `idx_politica_aplicable` (`aplicable_a`),
  KEY `idx_politica_version` (`version`),
  KEY `idx_politica_fechas` (`fecha_efectiva`,`fecha_expiracion`),
  KEY `idx_politica_estado` (`estado`),
  KEY `idx_politica_obligatoria` (`obligatoria`),
  KEY `idx_politica_prioridad` (`prioridad`),
  KEY `idx_politica_revisiones` (`ultima_revision`,`proxima_revision`),
  CONSTRAINT `fk_politica_aprobador` FOREIGN KEY (`aprobador_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_politica_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_politica_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_politica_responsable` FOREIGN KEY (`responsable_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Políticas de seguridad';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `politicas_seguridad`
--

LOCK TABLES `politicas_seguridad` WRITE;
/*!40000 ALTER TABLE `politicas_seguridad` DISABLE KEYS */;
/*!40000 ALTER TABLE `politicas_seguridad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `preferencias_pacientes`
--

DROP TABLE IF EXISTS `preferencias_pacientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `preferencias_pacientes` (
  `id_preferencia` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente` int(10) unsigned NOT NULL,
  `preferencia_recordatorio` enum('email','sms','whatsapp','llamada','ninguno') NOT NULL DEFAULT 'email',
  `horas_anticipacion_recordatorio` int(10) unsigned NOT NULL DEFAULT 24,
  `preferencia_genero_medico` enum('masculino','femenino','indiferente') NOT NULL DEFAULT 'indiferente',
  `preferencia_idioma` varchar(50) NOT NULL DEFAULT 'Español',
  `necesidades_especiales` text DEFAULT NULL,
  `notificaciones_resultados` tinyint(1) NOT NULL DEFAULT 1,
  `notificaciones_campanas` tinyint(1) NOT NULL DEFAULT 0,
  `notificaciones_educativas` tinyint(1) NOT NULL DEFAULT 0,
  `preferencia_horario_contacto` varchar(100) DEFAULT NULL,
  `medico_preferido_id` int(10) unsigned DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `modificado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_preferencia`),
  UNIQUE KEY `idx_preferencia_paciente` (`id_paciente`),
  KEY `fk_preferencia_modificador_idx` (`modificado_por`),
  KEY `fk_preferencia_medico_idx` (`medico_preferido_id`),
  CONSTRAINT `fk_preferencia_medico` FOREIGN KEY (`medico_preferido_id`) REFERENCES `medicos` (`id_medico`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_preferencia_modificador` FOREIGN KEY (`modificado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_preferencia_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Preferencias personalizadas de pacientes';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `preferencias_pacientes`
--

LOCK TABLES `preferencias_pacientes` WRITE;
/*!40000 ALTER TABLE `preferencias_pacientes` DISABLE KEYS */;
/*!40000 ALTER TABLE `preferencias_pacientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `preferencias_usuarios`
--

DROP TABLE IF EXISTS `preferencias_usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `preferencias_usuarios` (
  `id_preferencia` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_usuario` int(10) unsigned NOT NULL,
  `tema_color` enum('light','dark','blue','purple','green') DEFAULT 'dark',
  `modo_compacto` tinyint(1) DEFAULT 0,
  `animaciones_habilitadas` tinyint(1) DEFAULT 1,
  `vista_agenda_default` enum('dia','semana','mes','lista') DEFAULT 'dia',
  `mostrar_estadisticas` tinyint(1) DEFAULT 1,
  `mostrar_filtros_avanzados` tinyint(1) DEFAULT 0,
  `hora_inicio_jornada` time DEFAULT '08:00:00',
  `hora_fin_jornada` time DEFAULT '18:00:00',
  `duracion_cita_default` int(11) DEFAULT 30,
  `notificaciones_email` tinyint(1) DEFAULT 1,
  `notificaciones_push` tinyint(1) DEFAULT 1,
  `notificaciones_sms` tinyint(1) DEFAULT 0,
  `recordatorio_citas_minutos` int(11) DEFAULT 60,
  `idioma` varchar(5) DEFAULT 'es',
  `zona_horaria` varchar(50) DEFAULT 'America/Santiago',
  `formato_fecha` varchar(20) DEFAULT 'DD/MM/YYYY',
  `formato_hora` varchar(20) DEFAULT '24h',
  `mostrar_foto_perfil` tinyint(1) DEFAULT 1,
  `compartir_disponibilidad` tinyint(1) DEFAULT 1,
  `permitir_reserva_online` tinyint(1) DEFAULT 1,
  `auto_confirmar_citas` tinyint(1) DEFAULT 0,
  `enviar_recordatorios_automaticos` tinyint(1) DEFAULT 1,
  `bloquear_citas_mismo_horario` tinyint(1) DEFAULT 1,
  `permitir_overbooking` tinyint(1) DEFAULT 0,
  `configuracion_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`configuracion_json`)),
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_preferencia`),
  UNIQUE KEY `unique_user_preferences` (`id_usuario`),
  KEY `idx_usuario` (`id_usuario`),
  KEY `idx_tema` (`tema_color`),
  CONSTRAINT `fk_preferencias_usuarios` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `preferencias_usuarios`
--

LOCK TABLES `preferencias_usuarios` WRITE;
/*!40000 ALTER TABLE `preferencias_usuarios` DISABLE KEYS */;
INSERT INTO `preferencias_usuarios` VALUES (1,1,'light',0,1,'dia',1,0,'08:00:00','18:00:00',30,1,1,0,60,'es','America/Santiago','DD/MM/YYYY','24h',1,1,1,0,1,1,0,NULL,'2025-11-03 15:18:37','2025-11-03 15:18:37'),(2,2,'light',0,1,'dia',1,0,'08:00:00','18:00:00',30,1,1,0,60,'es','America/Santiago','DD/MM/YYYY','24h',1,1,1,0,1,1,0,NULL,'2025-11-03 15:18:37','2025-11-03 15:18:37'),(3,3,'light',0,1,'dia',1,0,'08:00:00','18:00:00',30,1,1,0,60,'es','America/Santiago','DD/MM/YYYY','24h',1,1,1,0,1,1,0,NULL,'2025-11-03 15:18:37','2025-11-03 15:18:37'),(4,4,'light',0,1,'dia',1,0,'08:00:00','18:00:00',30,1,1,0,60,'es','America/Santiago','DD/MM/YYYY','24h',1,1,1,0,1,1,0,NULL,'2025-11-03 15:18:37','2025-11-03 15:18:37'),(5,5,'light',0,1,'dia',1,0,'08:00:00','18:00:00',30,1,1,0,60,'es','America/Santiago','DD/MM/YYYY','24h',1,1,1,0,1,1,0,NULL,'2025-11-03 15:18:37','2025-11-05 22:29:49'),(6,6,'light',0,1,'dia',1,0,'08:00:00','18:00:00',30,1,1,0,60,'es','America/Santiago','DD/MM/YYYY','24h',1,1,1,0,1,1,0,NULL,'2025-11-03 15:18:37','2025-11-03 15:18:37'),(7,12,'light',0,1,'dia',1,0,'08:00:00','18:00:00',30,1,1,0,60,'es','America/Santiago','DD/MM/YYYY','24h',1,1,1,0,1,1,0,NULL,'2025-11-03 15:18:37','2025-11-03 15:18:37'),(8,13,'light',0,1,'dia',1,0,'08:00:00','18:00:00',30,1,1,0,60,'es','America/Santiago','DD/MM/YYYY','24h',1,1,1,0,1,1,0,NULL,'2025-11-03 15:18:37','2025-11-03 15:18:37'),(9,14,'light',0,1,'dia',1,0,'08:00:00','18:00:00',30,1,1,0,60,'es','America/Santiago','DD/MM/YYYY','24h',1,1,1,0,1,1,0,NULL,'2025-11-03 15:18:37','2025-11-03 15:18:37'),(10,15,'light',0,1,'dia',1,0,'08:00:00','18:00:00',30,1,1,0,60,'es','America/Santiago','DD/MM/YYYY','24h',1,1,1,0,1,1,0,NULL,'2025-11-03 15:18:37','2025-11-03 15:18:37'),(11,16,'light',0,1,'dia',1,0,'08:00:00','18:00:00',30,1,1,0,60,'es','America/Santiago','DD/MM/YYYY','24h',1,1,1,0,1,1,0,NULL,'2025-11-03 15:18:37','2025-11-03 15:18:37'),(12,17,'light',0,1,'dia',1,0,'08:00:00','18:00:00',30,1,1,0,60,'es','America/Santiago','DD/MM/YYYY','24h',1,1,1,0,1,1,0,NULL,'2025-11-03 15:18:37','2025-11-03 15:18:37'),(13,24,'light',0,1,'dia',1,0,'08:00:00','18:00:00',30,1,1,0,60,'es','America/Santiago','DD/MM/YYYY','24h',1,1,1,0,1,1,0,NULL,'2025-11-03 15:18:37','2025-11-03 15:18:37'),(14,25,'light',0,1,'dia',1,0,'08:00:00','18:00:00',30,1,1,0,60,'es','America/Santiago','DD/MM/YYYY','24h',1,1,1,0,1,1,0,NULL,'2025-11-03 15:18:37','2025-11-03 15:18:37');
/*!40000 ALTER TABLE `preferencias_usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `presentaciones_medicamentos`
--

DROP TABLE IF EXISTS `presentaciones_medicamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `presentaciones_medicamentos` (
  `id_presentacion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_medicamento` int(10) unsigned NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `cantidad` int(10) unsigned NOT NULL,
  `unidad` varchar(20) NOT NULL,
  `forma` varchar(50) NOT NULL,
  `envase` varchar(50) DEFAULT NULL,
  `codigo_presentacion` varchar(20) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `es_presentacion_principal` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_presentacion`),
  KEY `fk_presentacion_medicamento_idx` (`id_medicamento`),
  KEY `idx_presentacion_activo` (`activo`),
  KEY `idx_presentacion_principal` (`es_presentacion_principal`),
  CONSTRAINT `fk_presentacion_medicamento` FOREIGN KEY (`id_medicamento`) REFERENCES `medicamentos` (`id_medicamento`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Presentaciones disponibles de medicamentos';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `presentaciones_medicamentos`
--

LOCK TABLES `presentaciones_medicamentos` WRITE;
/*!40000 ALTER TABLE `presentaciones_medicamentos` DISABLE KEYS */;
/*!40000 ALTER TABLE `presentaciones_medicamentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `presupuestos`
--

DROP TABLE IF EXISTS `presupuestos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `presupuestos` (
  `id_presupuesto` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `id_sucursal` int(10) unsigned DEFAULT NULL,
  `id_departamento` int(10) unsigned DEFAULT NULL,
  `nombre` varchar(100) NOT NULL,
  `tipo` enum('anual','mensual','trimestral','semestral','proyecto') NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `monto_asignado` decimal(15,2) NOT NULL,
  `monto_ejecutado` decimal(15,2) NOT NULL DEFAULT 0.00,
  `porcentaje_ejecucion` decimal(5,2) DEFAULT NULL,
  `moneda` varchar(3) NOT NULL DEFAULT 'CLP',
  `estado` enum('planificacion','aprobado','en_ejecucion','cerrado','anulado') NOT NULL DEFAULT 'planificacion',
  `categoria` varchar(50) DEFAULT NULL,
  `detalle_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`detalle_json`)),
  `responsable_id` int(10) unsigned DEFAULT NULL,
  `aprobador_id` int(10) unsigned DEFAULT NULL,
  `fecha_aprobacion` date DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `url_documento` varchar(255) DEFAULT NULL,
  `version` int(10) unsigned NOT NULL DEFAULT 1,
  `bloqueado` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_presupuesto`),
  KEY `fk_presupuesto_centro_idx` (`id_centro`),
  KEY `fk_presupuesto_sucursal_idx` (`id_sucursal`),
  KEY `fk_presupuesto_departamento_idx` (`id_departamento`),
  KEY `fk_presupuesto_responsable_idx` (`responsable_id`),
  KEY `fk_presupuesto_aprobador_idx` (`aprobador_id`),
  KEY `fk_presupuesto_creador_idx` (`creado_por`),
  KEY `idx_presupuesto_tipo` (`tipo`),
  KEY `idx_presupuesto_fechas` (`fecha_inicio`,`fecha_fin`),
  KEY `idx_presupuesto_estado` (`estado`),
  KEY `idx_presupuesto_categoria` (`categoria`),
  KEY `idx_presupuesto_version` (`version`),
  KEY `idx_presupuesto_bloqueado` (`bloqueado`),
  CONSTRAINT `fk_presupuesto_aprobador` FOREIGN KEY (`aprobador_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_presupuesto_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_presupuesto_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_presupuesto_departamento` FOREIGN KEY (`id_departamento`) REFERENCES `departamentos` (`id_departamento`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_presupuesto_responsable` FOREIGN KEY (`responsable_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_presupuesto_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursales` (`id_sucursal`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Presupuestos por centro/área';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `presupuestos`
--

LOCK TABLES `presupuestos` WRITE;
/*!40000 ALTER TABLE `presupuestos` DISABLE KEYS */;
/*!40000 ALTER TABLE `presupuestos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `previsiones_salud`
--

DROP TABLE IF EXISTS `previsiones_salud`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `previsiones_salud` (
  `id_prevision` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `codigo` varchar(100) NOT NULL,
  `tipo` enum('Pública','Privada','Fuerzas Armadas','Organización Internacional','No afiliado','N/A') NOT NULL,
  `cobertura` varchar(100) DEFAULT 'Nacional',
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_prevision`),
  UNIQUE KEY `codigo` (`codigo`),
  UNIQUE KEY `codigo_2` (`codigo`),
  UNIQUE KEY `codigo_3` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `previsiones_salud`
--

LOCK TABLES `previsiones_salud` WRITE;
/*!40000 ALTER TABLE `previsiones_salud` DISABLE KEYS */;
INSERT INTO `previsiones_salud` VALUES (1,'FONASA','FON','Pública','Nacional',1,'2025-10-31 19:45:37','2025-10-31 19:45:37'),(2,'ISAPRE Colmena','COLM','Privada','Nacional',1,'2025-10-31 19:45:37','2025-10-31 19:45:37'),(3,'ISAPRE Cruz Blanca','CBLA','Privada','Nacional',1,'2025-10-31 19:45:37','2025-10-31 19:45:37'),(4,'ISAPRE Consalud','CONS','Privada','Nacional',1,'2025-10-31 19:45:37','2025-10-31 19:45:37'),(5,'ISAPRE Banmédica','BANM','Privada','Nacional',1,'2025-10-31 19:45:37','2025-10-31 19:45:37'),(6,'ISAPRE Vida Tres','VIDA3','Privada','Nacional',1,'2025-10-31 19:45:37','2025-10-31 19:45:37'),(7,'ISAPRE Nueva Masvida','MASV','Privada','Nacional',1,'2025-10-31 19:45:37','2025-10-31 19:45:37'),(8,'CAPREDENA','CAPR','Fuerzas Armadas','Nacional',1,'2025-10-31 19:45:37','2025-10-31 19:45:37'),(9,'DIPRECA','DIPR','Fuerzas Armadas','Nacional',1,'2025-10-31 19:45:37','2025-10-31 19:45:37'),(10,'Sin previsión','SINP','No afiliado','Nacional',1,'2025-10-31 19:45:37','2025-10-31 19:45:37'),(11,'Seguro privado internacional','INTPRI','Privada','Internacional',1,'2025-10-31 19:45:37','2025-10-31 19:45:37'),(12,'Seguro estatal extranjero','INTEST','Pública','Internacional',1,'2025-10-31 19:45:37','2025-10-31 19:45:37'),(13,'Cobertura OMS / ONU','ONU','Organización Internacional','Global',1,'2025-10-31 19:45:37','2025-10-31 19:45:37'),(14,'Seguro Médico de Viaje','TRAVEL','Privada','Temporal',1,'2025-10-31 19:45:37','2025-10-31 19:45:37'),(15,'Sin cobertura médica conocida','NONE','N/A','N/A',1,'2025-10-31 19:45:37','2025-10-31 19:45:37');
/*!40000 ALTER TABLE `previsiones_salud` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `procedimientos`
--

DROP TABLE IF EXISTS `procedimientos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `procedimientos` (
  `id_procedimiento` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente` int(10) unsigned NOT NULL,
  `id_historial` int(10) unsigned DEFAULT NULL,
  `id_medico` int(10) unsigned NOT NULL,
  `id_centro` int(10) unsigned NOT NULL,
  `id_sucursal` int(10) unsigned DEFAULT NULL,
  `nombre_procedimiento` varchar(200) NOT NULL,
  `codigo_fonasa` varchar(20) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_procedimiento` datetime NOT NULL,
  `duracion_minutos` int(10) unsigned DEFAULT NULL,
  `tipo_procedimiento` varchar(100) NOT NULL,
  `estado` enum('programado','realizado','cancelado','reprogramado') NOT NULL DEFAULT 'programado',
  `resultado` text DEFAULT NULL,
  `complicaciones` text DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `equipo_utilizado` text DEFAULT NULL,
  `requiere_seguimiento` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_seguimiento` date DEFAULT NULL,
  `consentimiento_firmado` tinyint(1) NOT NULL DEFAULT 0,
  `id_consentimiento` int(10) unsigned DEFAULT NULL,
  `documentos_adjuntos` text DEFAULT NULL,
  `costo` decimal(10,2) DEFAULT NULL,
  `facturado` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  `modificado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_procedimiento`),
  KEY `fk_procedimiento_paciente_idx` (`id_paciente`),
  KEY `fk_procedimiento_historial_idx` (`id_historial`),
  KEY `fk_procedimiento_medico_idx` (`id_medico`),
  KEY `fk_procedimiento_centro_idx` (`id_centro`),
  KEY `fk_procedimiento_sucursal_idx` (`id_sucursal`),
  KEY `fk_procedimiento_consentimiento_idx` (`id_consentimiento`),
  KEY `fk_procedimiento_creador_idx` (`creado_por`),
  KEY `fk_procedimiento_modificador_idx` (`modificado_por`),
  KEY `idx_procedimiento_fecha` (`fecha_procedimiento`),
  KEY `idx_procedimiento_tipo` (`tipo_procedimiento`),
  KEY `idx_procedimiento_estado` (`estado`),
  KEY `idx_procedimiento_seguimiento` (`requiere_seguimiento`),
  KEY `idx_procedimiento_codigo` (`codigo_fonasa`),
  CONSTRAINT `fk_procedimiento_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON UPDATE CASCADE,
  CONSTRAINT `fk_procedimiento_consentimiento` FOREIGN KEY (`id_consentimiento`) REFERENCES `consentimientos` (`id_consentimiento`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_procedimiento_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_procedimiento_historial` FOREIGN KEY (`id_historial`) REFERENCES `historial_clinico` (`id_historial`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_procedimiento_medico` FOREIGN KEY (`id_medico`) REFERENCES `medicos` (`id_medico`) ON UPDATE CASCADE,
  CONSTRAINT `fk_procedimiento_modificador` FOREIGN KEY (`modificado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_procedimiento_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_procedimiento_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursales` (`id_sucursal`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Procedimientos médicos realizados a pacientes';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `procedimientos`
--

LOCK TABLES `procedimientos` WRITE;
/*!40000 ALTER TABLE `procedimientos` DISABLE KEYS */;
/*!40000 ALTER TABLE `procedimientos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `programas_especiales`
--

DROP TABLE IF EXISTS `programas_especiales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `programas_especiales` (
  `id_programa` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text NOT NULL,
  `objetivo` text NOT NULL,
  `publico_objetivo` text DEFAULT NULL,
  `criterios_inclusion` text DEFAULT NULL,
  `criterios_exclusion` text DEFAULT NULL,
  `duracion_semanas` int(10) unsigned DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `es_permanente` tinyint(1) NOT NULL DEFAULT 0,
  `capacidad_maxima` int(10) unsigned DEFAULT NULL,
  `capacidad_actual` int(10) unsigned NOT NULL DEFAULT 0,
  `coordinador_id` int(10) unsigned DEFAULT NULL,
  `equipo_trabajo_ids` varchar(255) DEFAULT NULL,
  `estado` enum('planificacion','activo','pausado','finalizado','cancelado') NOT NULL DEFAULT 'planificacion',
  `costo_programa` decimal(10,2) DEFAULT NULL,
  `financiamiento` varchar(100) DEFAULT NULL,
  `recursos_requeridos` text DEFAULT NULL,
  `protocolos_url` varchar(255) DEFAULT NULL,
  `frecuencia_seguimiento` varchar(50) DEFAULT NULL,
  `especialidades_relacionadas` varchar(255) DEFAULT NULL,
  `patologias_relacionadas` varchar(255) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_programa`),
  KEY `fk_programa_centro_idx` (`id_centro`),
  KEY `fk_programa_coordinador_idx` (`coordinador_id`),
  KEY `fk_programa_creador_idx` (`creado_por`),
  KEY `idx_programa_fechas` (`fecha_inicio`,`fecha_fin`),
  KEY `idx_programa_estado` (`estado`),
  KEY `idx_programa_permanente` (`es_permanente`),
  FULLTEXT KEY `idx_programa_busqueda` (`nombre`,`descripcion`,`objetivo`,`publico_objetivo`),
  CONSTRAINT `fk_programa_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_programa_coordinador` FOREIGN KEY (`coordinador_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_programa_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Programas de seguimiento especial';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `programas_especiales`
--

LOCK TABLES `programas_especiales` WRITE;
/*!40000 ALTER TABLE `programas_especiales` DISABLE KEYS */;
/*!40000 ALTER TABLE `programas_especiales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promociones`
--

DROP TABLE IF EXISTS `promociones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `promociones` (
  `id_promocion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `id_campana` int(10) unsigned DEFAULT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text NOT NULL,
  `codigo_promocion` varchar(50) DEFAULT NULL,
  `tipo` enum('descuento','paquete','2x1','regalo','especial') NOT NULL,
  `valor_descuento` decimal(10,2) DEFAULT NULL,
  `porcentaje_descuento` decimal(5,2) DEFAULT NULL,
  `fecha_inicio` datetime NOT NULL,
  `fecha_fin` datetime DEFAULT NULL,
  `limite_usos` int(10) unsigned DEFAULT NULL,
  `usos_actuales` int(10) unsigned NOT NULL DEFAULT 0,
  `servicios_aplicables` varchar(255) DEFAULT NULL,
  `exclusiones` text DEFAULT NULL,
  `condiciones` text DEFAULT NULL,
  `url_imagen` varchar(255) DEFAULT NULL,
  `estado` enum('activa','inactiva','programada','vencida','agotada') NOT NULL DEFAULT 'activa',
  `aplicable_web` tinyint(1) NOT NULL DEFAULT 1,
  `aplicable_presencial` tinyint(1) NOT NULL DEFAULT 1,
  `requiere_autenticacion` tinyint(1) NOT NULL DEFAULT 0,
  `categoria` varchar(50) DEFAULT NULL,
  `prioridad` int(10) unsigned DEFAULT NULL,
  `destacada` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_promocion`),
  KEY `fk_promocion_centro_idx` (`id_centro`),
  KEY `fk_promocion_campana_idx` (`id_campana`),
  KEY `fk_promocion_creador_idx` (`creado_por`),
  KEY `idx_promocion_codigo` (`codigo_promocion`),
  KEY `idx_promocion_tipo` (`tipo`),
  KEY `idx_promocion_fechas` (`fecha_inicio`,`fecha_fin`),
  KEY `idx_promocion_estado` (`estado`),
  KEY `idx_promocion_aplicable` (`aplicable_web`,`aplicable_presencial`),
  KEY `idx_promocion_prioridad` (`prioridad`),
  KEY `idx_promocion_destacada` (`destacada`),
  CONSTRAINT `fk_promocion_campana` FOREIGN KEY (`id_campana`) REFERENCES `campanas_marketing` (`id_campana`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_promocion_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_promocion_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Promociones y descuentos';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promociones`
--

LOCK TABLES `promociones` WRITE;
/*!40000 ALTER TABLE `promociones` DISABLE KEYS */;
/*!40000 ALTER TABLE `promociones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proveedores_externos`
--

DROP TABLE IF EXISTS `proveedores_externos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `proveedores_externos` (
  `id_proveedor` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `rut` varchar(12) NOT NULL,
  `tipo_proveedor` varchar(50) NOT NULL,
  `servicios` text NOT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT NULL,
  `region` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `sitio_web` varchar(255) DEFAULT NULL,
  `contacto_nombre` varchar(100) DEFAULT NULL,
  `contacto_cargo` varchar(100) DEFAULT NULL,
  `contacto_telefono` varchar(20) DEFAULT NULL,
  `contacto_email` varchar(100) DEFAULT NULL,
  `horarios_atencion` varchar(255) DEFAULT NULL,
  `condiciones_servicio` text DEFAULT NULL,
  `condiciones_pago` varchar(100) DEFAULT NULL,
  `dias_credito` int(10) unsigned DEFAULT NULL,
  `descuento` decimal(5,2) DEFAULT NULL,
  `estado` enum('activo','inactivo','suspendido','evaluacion') NOT NULL DEFAULT 'activo',
  `fecha_inicio_relacion` date DEFAULT NULL,
  `fecha_fin_relacion` date DEFAULT NULL,
  `evaluacion` decimal(3,1) DEFAULT NULL,
  `notas_internas` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_proveedor`),
  KEY `fk_proveext_centro_idx` (`id_centro`),
  KEY `fk_proveext_creador_idx` (`creado_por`),
  KEY `idx_proveext_rut` (`rut`),
  KEY `idx_proveext_tipo` (`tipo_proveedor`),
  KEY `idx_proveext_ubicacion` (`ciudad`,`region`),
  KEY `idx_proveext_estado` (`estado`),
  KEY `idx_proveext_fechas` (`fecha_inicio_relacion`,`fecha_fin_relacion`),
  KEY `idx_proveext_evaluacion` (`evaluacion`),
  FULLTEXT KEY `idx_proveext_busqueda` (`nombre`,`servicios`,`condiciones_servicio`),
  CONSTRAINT `fk_proveext_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_proveext_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Proveedores de servicios externos';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedores_externos`
--

LOCK TABLES `proveedores_externos` WRITE;
/*!40000 ALTER TABLE `proveedores_externos` DISABLE KEYS */;
/*!40000 ALTER TABLE `proveedores_externos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `qr_sesiones`
--

DROP TABLE IF EXISTS `qr_sesiones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `qr_sesiones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `token` varchar(32) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL,
  `fecha_expiracion` datetime NOT NULL,
  `fecha_autorizacion` datetime DEFAULT NULL,
  `ip_creacion` varchar(45) DEFAULT NULL,
  `ip_autorizacion` varchar(45) DEFAULT NULL,
  `dispositivo_info` text DEFAULT NULL,
  `estado` enum('pendiente','escaneado','autorizado','rechazado','expirado') NOT NULL DEFAULT 'pendiente',
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `usuario_id` (`usuario_id`),
  KEY `estado` (`estado`),
  KEY `fecha_expiracion` (`fecha_expiracion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `qr_sesiones`
--

LOCK TABLES `qr_sesiones` WRITE;
/*!40000 ALTER TABLE `qr_sesiones` DISABLE KEYS */;
/*!40000 ALTER TABLE `qr_sesiones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `receta_consecutivos`
--

DROP TABLE IF EXISTS `receta_consecutivos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `receta_consecutivos` (
  `id_consecutivo` int(11) NOT NULL AUTO_INCREMENT,
  `id_centro` int(11) NOT NULL,
  `tipo_receta` varchar(50) NOT NULL,
  `anio` smallint(6) NOT NULL,
  `last_val` int(11) NOT NULL DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_consecutivo`),
  UNIQUE KEY `ux_centro_tipo_anio` (`id_centro`,`tipo_receta`,`anio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `receta_consecutivos`
--

LOCK TABLES `receta_consecutivos` WRITE;
/*!40000 ALTER TABLE `receta_consecutivos` DISABLE KEYS */;
/*!40000 ALTER TABLE `receta_consecutivos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `receta_medicamentos`
--

DROP TABLE IF EXISTS `receta_medicamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `receta_medicamentos` (
  `id_receta_medicamento` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_receta` int(10) unsigned NOT NULL,
  `id_medicamento` int(10) unsigned DEFAULT NULL,
  `nombre_medicamento` varchar(100) NOT NULL,
  `dosis` varchar(50) NOT NULL,
  `frecuencia` varchar(100) NOT NULL,
  `duracion` varchar(50) DEFAULT NULL,
  `cantidad` int(10) unsigned NOT NULL,
  `unidad` varchar(20) NOT NULL,
  `via_administracion` varchar(50) NOT NULL,
  `instrucciones` text DEFAULT NULL,
  `es_controlado` tinyint(1) NOT NULL DEFAULT 0,
  `codigo_medicamento` varchar(20) DEFAULT NULL,
  `dispensado` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_dispensacion` datetime DEFAULT NULL,
  `dispensado_por` int(10) unsigned DEFAULT NULL,
  `observaciones_dispensacion` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_receta_medicamento`),
  KEY `fk_recmedicamento_receta_idx` (`id_receta`),
  KEY `fk_recmedicamento_medicamento_idx` (`id_medicamento`),
  KEY `fk_recmedicamento_dispensador_idx` (`dispensado_por`),
  KEY `idx_recmedicamento_controlado` (`es_controlado`),
  KEY `idx_recmedicamento_dispensado` (`dispensado`),
  CONSTRAINT `fk_recmedicamento_dispensador` FOREIGN KEY (`dispensado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_recmedicamento_medicamento` FOREIGN KEY (`id_medicamento`) REFERENCES `medicamentos` (`id_medicamento`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_recmedicamento_receta` FOREIGN KEY (`id_receta`) REFERENCES `recetas_medicas` (`id_receta`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Detalle de medicamentos en recetas';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `receta_medicamentos`
--

LOCK TABLES `receta_medicamentos` WRITE;
/*!40000 ALTER TABLE `receta_medicamentos` DISABLE KEYS */;
INSERT INTO `receta_medicamentos` VALUES (1,1,11,'Enalapril 10mg','10mg','Cada 12 horas','6 meses',180,'comprimidos','oral','Tomar con abundante agua. Preferentemente a la misma hora.',0,'ENA-10',1,'2024-01-15 11:00:00',1,NULL,'2025-11-04 00:44:04'),(2,1,31,'Ácido Acetilsalicílico 100mg','100mg','Una vez al día','6 meses',180,'comprimidos','oral','Tomar después del desayuno.',0,'AAS-100',1,'2024-01-15 11:00:00',1,NULL,'2025-11-04 00:44:04'),(3,2,16,'Metformina 850mg','850mg','Cada 12 horas','6 meses',180,'comprimidos','oral','Tomar con las comidas principales para reducir efectos gastrointestinales.',0,'MET-850',1,'2024-01-20 10:30:00',1,NULL,'2025-11-04 00:44:12'),(4,2,17,'Glibenclamida 5mg','5mg','Una vez al día','6 meses',180,'comprimidos','oral','Tomar 30 minutos antes del desayuno.',0,'GLI-5',1,'2024-01-20 10:30:00',1,NULL,'2025-11-04 00:44:12'),(5,3,6,'Amoxicilina 500mg','500mg','Cada 8 horas','7 días',21,'cápsulas','oral','Completar tratamiento aunque mejoren los síntomas.',0,'AMO-500',1,'2024-02-05 14:00:00',1,NULL,'2025-11-04 00:44:31'),(6,3,1,'Paracetamol 500mg','500mg','Cada 6-8 horas si hay fiebre','7 días',28,'comprimidos','oral','No exceder 4 gramos al día.',0,'PAR-500',1,'2024-02-05 14:00:00',1,NULL,'2025-11-04 00:44:31'),(7,4,2,'Ibuprofeno 400mg','400mg','Al inicio del dolor','3 meses',30,'comprimidos','oral','Tomar con alimentos. No exceder 1200mg al día.',0,'IBU-400',1,'2024-02-12 16:00:00',1,NULL,'2025-11-04 00:44:31'),(8,4,40,'Sumatriptán 50mg','50mg','Al inicio de la crisis','3 meses',12,'comprimidos','oral','Tomar al primer signo de migraña. Puede repetir dosis en 2 horas si es necesario.',0,'SUM-50',1,'2024-02-12 16:00:00',1,NULL,'2025-11-04 00:44:31'),(9,5,12,'Losartán 50mg','50mg','Una vez al día','6 meses',180,'comprimidos','oral','Tomar preferentemente por la mañana.',0,'LOS-50',1,'2024-02-18 09:00:00',1,NULL,'2025-11-04 00:44:31'),(10,6,12,'Losartán 50mg','50mg','Una vez al día','6 meses',180,'comprimidos','oral','Tomar por la mañana.',0,'LOS-50',1,'2024-03-01 11:30:00',1,NULL,'2025-11-04 00:44:31'),(11,6,33,'Atorvastatina 20mg','20mg','Una vez al día','6 meses',180,'comprimidos','oral','Tomar por la noche. Evitar consumo de pomelo.',0,'ATO-20',1,'2024-03-01 11:30:00',1,NULL,'2025-11-04 00:44:31'),(12,7,20,'Omeprazol 20mg','20mg','Una vez al día','2 meses',60,'cápsulas','oral','Tomar 30 minutos antes del desayuno.',0,'OME-20',1,'2024-03-10 15:00:00',1,NULL,'2025-11-04 00:44:31'),(13,8,23,'Salbutamol Inhalador 100mcg','2 puff','Cada 6 horas o según necesidad','6 meses',2,'inhaladores','inhalatoria','Agitar antes de usar. Enjuagar boca después de usar.',0,'SAL-INH',1,'2024-03-15 10:00:00',1,NULL,'2025-11-04 00:44:31'),(14,8,24,'Beclometasona Inhalador 250mcg','2 puff','Cada 12 horas','6 meses',2,'inhaladores','inhalatoria','Uso preventivo. Enjuagar boca después de cada aplicación.',0,'BEC-INH',1,'2024-03-15 10:00:00',1,NULL,'2025-11-04 00:44:31'),(15,9,35,'Alprazolam 0.5mg','0.5mg','Cada 8-12 horas','3 meses',90,'comprimidos','oral','MEDICAMENTO CONTROLADO. No conducir ni operar maquinaria. No consumir alcohol.',1,'ALP-0.5',1,'2024-03-20 14:30:00',1,NULL,'2025-11-04 00:44:31'),(16,10,39,'Tramadol 50mg','50mg','Cada 8 horas','1 mes',90,'cápsulas','oral','MEDICAMENTO CONTROLADO. Puede causar somnolencia. No conducir.',1,'TRA-50',1,'2024-04-01 16:00:00',1,NULL,'2025-11-04 00:44:31'),(17,11,38,'Sertralina 50mg','50mg','Una vez al día','6 meses',180,'comprimidos','oral','Tomar por la mañana. Efecto terapéutico en 2-4 semanas.',0,'SER-50',1,'2024-04-10 11:00:00',1,NULL,'2025-11-04 00:44:31'),(18,12,13,'Amlodipino 5mg','5mg','Una vez al día','6 meses',180,'comprimidos','oral','Tomar preferentemente por la mañana.',0,'AML-5',1,'2024-04-20 10:00:00',1,NULL,'2025-11-04 00:44:31'),(19,13,9,'Ciprofloxacino 500mg','500mg','Cada 12 horas','7 días',14,'comprimidos','oral','Tomar con abundante agua. Evitar lácteos 2 horas antes y después.',0,'CIP-500',1,'2024-05-05 09:30:00',1,NULL,'2025-11-04 00:44:31'),(20,14,48,'Orlistat 120mg','120mg','Con cada comida principal','6 meses',540,'cápsulas','oral','Tomar con comidas que contengan grasa. Complementar con dieta baja en grasas.',0,'ORL-120',1,'2024-05-15 14:00:00',1,NULL,'2025-11-04 00:44:31'),(21,15,27,'Loratadina 10mg','10mg','Una vez al día','3 meses',90,'comprimidos','oral','Tomar preferentemente por la noche.',0,'LOR-10',1,'2024-06-01 10:30:00',1,NULL,'2025-11-04 00:44:31'),(22,16,11,'Enalapril 10mg','10mg','Cada 12 horas','6 meses',180,'comprimidos','oral','Tomar con abundante agua. Preferentemente a la misma hora.',0,'ENA-10',0,NULL,NULL,NULL,'2025-11-04 00:44:31'),(23,16,31,'Ácido Acetilsalicílico 100mg','100mg','Una vez al día','6 meses',180,'comprimidos','oral','Tomar después del desayuno.',0,'AAS-100',0,NULL,NULL,NULL,'2025-11-04 00:44:31'),(24,17,16,'Metformina 850mg','850mg','Cada 12 horas','6 meses',180,'comprimidos','oral','Tomar con las comidas principales.',0,'MET-850',0,NULL,NULL,NULL,'2025-11-04 00:44:42'),(25,17,17,'Glibenclamida 5mg','5mg','Una vez al día','6 meses',180,'comprimidos','oral','Tomar 30 minutos antes del desayuno.',0,'GLI-5',0,NULL,NULL,NULL,'2025-11-04 00:44:42'),(26,23,18,'Levotiroxina 100mcg','100mcg','Una vez al día','6 meses',180,'comprimidos','oral','Tomar en ayunas, 30 minutos antes del desayuno.',0,'LEV-100',0,NULL,NULL,NULL,'2025-11-04 00:49:45'),(27,24,NULL,'paracetamal, y loratadina','500','2','7',1,'caja','oral','jbvhcnvjcvbj nbsdvhjvhdvnj ds',0,NULL,0,NULL,NULL,NULL,'2025-11-07 01:20:12'),(28,25,NULL,'para cetamal','456','23','45',1,'caja','oral','4trggvghgg',0,NULL,0,NULL,NULL,NULL,'2025-11-07 01:25:39');
/*!40000 ALTER TABLE `receta_medicamentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recetas_medicas`
--

DROP TABLE IF EXISTS `recetas_medicas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `recetas_medicas` (
  `id_receta` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `id_paciente` int(10) unsigned NOT NULL,
  `id_medico` int(10) unsigned NOT NULL,
  `id_plantilla` int(10) unsigned DEFAULT NULL,
  `tipo_receta` enum('simple','magistral','controlada','cheque') NOT NULL,
  `fecha_emision` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_vencimiento` date DEFAULT NULL,
  `estado` enum('emitida','dispensada','anulada','vencida') NOT NULL DEFAULT 'emitida',
  `numero_receta` varchar(64) DEFAULT NULL,
  `url_documento` varchar(255) DEFAULT NULL,
  `codigo_verificacion` varchar(50) DEFAULT NULL,
  `id_historial` int(10) unsigned DEFAULT NULL,
  `diagnostico` varchar(255) DEFAULT NULL,
  `codigo_cie10` varchar(10) DEFAULT NULL,
  `es_cronica` tinyint(1) NOT NULL DEFAULT 0,
  `observaciones` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_receta`),
  UNIQUE KEY `ux_centro_numero` (`id_centro`,`numero_receta`),
  KEY `fk_receta_centro_idx` (`id_centro`),
  KEY `fk_receta_paciente_idx` (`id_paciente`),
  KEY `fk_receta_medico_idx` (`id_medico`),
  KEY `fk_receta_plantilla_idx` (`id_plantilla`),
  KEY `fk_receta_historial_idx` (`id_historial`),
  KEY `idx_receta_tipo` (`tipo_receta`),
  KEY `idx_receta_fechas` (`fecha_emision`,`fecha_vencimiento`),
  KEY `idx_receta_estado` (`estado`),
  KEY `idx_receta_numero` (`numero_receta`),
  KEY `idx_receta_verificacion` (`codigo_verificacion`),
  KEY `idx_receta_cronica` (`es_cronica`),
  CONSTRAINT `fk_receta_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_receta_historial` FOREIGN KEY (`id_historial`) REFERENCES `historial_clinico` (`id_historial`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_receta_medico` FOREIGN KEY (`id_medico`) REFERENCES `medicos` (`id_medico`) ON UPDATE CASCADE,
  CONSTRAINT `fk_receta_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_receta_plantilla` FOREIGN KEY (`id_plantilla`) REFERENCES `plantillas_documentos` (`id_plantilla`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Recetas médicas emitidas';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recetas_medicas`
--

LOCK TABLES `recetas_medicas` WRITE;
/*!40000 ALTER TABLE `recetas_medicas` DISABLE KEYS */;
INSERT INTO `recetas_medicas` VALUES (1,1,2,1,NULL,'','2025-11-01 22:39:00',NULL,'emitida','1',NULL,NULL,NULL,NULL,NULL,0,NULL,'2025-11-01 19:39:15','2025-11-02 04:03:15','2025-11-01 19:39:15','2025-11-02 04:03:15'),(2,1,2,1,NULL,'','2025-11-01 19:43:37',NULL,'emitida',NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'2025-11-01 19:43:37','2025-11-01 19:43:37','2025-11-01 19:43:37','2025-11-01 19:43:37'),(4,1,2,1,NULL,'simple','2025-11-01 22:43:00',NULL,'emitida',NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'2025-11-01 19:43:47','2025-11-02 04:42:43','2025-11-01 19:43:47','2025-11-02 04:42:43'),(6,1,1,1,NULL,'simple','2024-01-15 03:00:00','2024-07-15','dispensada','REC-2024-001-0001',NULL,'VER-2024-001-ABC123',NULL,'Hipertensión arterial esencial','I10',1,'Tratamiento crónico para hipertensión. Control mensual de presión arterial.','2025-11-04 00:43:53','2025-11-04 00:43:53','2025-11-04 00:43:53','2025-11-04 00:43:53'),(7,1,2,1,NULL,'simple','2024-01-20 03:00:00','2024-07-20','dispensada','REC-2024-001-0002',NULL,'VER-2024-002-DEF456',NULL,'Diabetes mellitus tipo 2','E11.9',1,'Tratamiento crónico para diabetes. Control mensual de glucemia.','2025-11-04 00:43:53','2025-11-04 00:43:53','2025-11-04 00:43:53','2025-11-04 00:43:53'),(8,1,3,2,NULL,'simple','2024-02-05 03:00:00','2024-03-05','dispensada','REC-2024-001-0003',NULL,'VER-2024-003-GHI789',NULL,'Infección aguda de las vías respiratorias superiores','J06.9',0,'Completar tratamiento antibiótico. Reposo relativo.','2025-11-04 00:43:53','2025-11-04 00:43:53','2025-11-04 00:43:53','2025-11-04 00:43:53'),(9,1,4,1,NULL,'simple','2024-02-12 03:00:00','2024-05-12','dispensada','REC-2024-001-0004',NULL,'VER-2024-004-JKL012',NULL,'Migraña sin aura','G43.0',0,'Tomar medicación al inicio de síntomas. Evitar desencadenantes.','2025-11-04 00:43:53','2025-11-04 00:43:53','2025-11-04 00:43:53','2025-11-04 00:43:53'),(10,1,5,2,NULL,'simple','2024-02-18 03:00:00','2024-08-18','dispensada','REC-2024-002-0001',NULL,'VER-2024-005-MNO345',NULL,'Hipertensión arterial esencial','I10',1,'Tratamiento crónico. Control mensual de presión arterial y función renal.','2025-11-04 00:43:53','2025-11-04 00:43:53','2025-11-04 00:43:53','2025-11-04 00:43:53'),(11,1,6,1,NULL,'simple','2024-03-01 03:00:00','2024-09-01','dispensada','REC-2024-001-0005',NULL,'VER-2024-006-PQR678',NULL,'Hipertensión arterial con dislipidemia','I10',1,'Tratamiento combinado. Control de presión arterial y perfil lipídico trimestral.','2025-11-04 00:43:53','2025-11-04 00:43:53','2025-11-04 00:43:53','2025-11-04 00:43:53'),(12,1,7,2,NULL,'simple','2024-03-10 03:00:00','2024-05-10','dispensada','REC-2024-002-0002',NULL,'VER-2024-007-STU901',NULL,'Gastritis crónica','K29.5',0,'Tomar antes del desayuno. Evitar alimentos irritantes y alcohol.','2025-11-04 00:43:53','2025-11-04 00:43:53','2025-11-04 00:43:53','2025-11-04 00:43:53'),(13,1,8,1,NULL,'simple','2024-03-15 03:00:00','2024-09-15','dispensada','REC-2024-001-0006',NULL,'VER-2024-008-VWX234',NULL,'Asma bronquial','J45.9',1,'Uso de inhalador de rescate según necesidad. Control mensual de función pulmonar.','2025-11-04 00:43:53','2025-11-04 00:43:53','2025-11-04 00:43:53','2025-11-04 00:43:53'),(14,1,9,1,NULL,'controlada','2024-03-20 03:00:00','2024-06-20','dispensada','REC-2024-001-0007',NULL,'VER-2024-009-YZA567',NULL,'Trastorno de ansiedad generalizada','F41.1',0,'Medicamento controlado. Seguimiento psicológico semanal. No suspender abruptamente.','2025-11-04 00:43:53','2025-11-04 00:43:53','2025-11-04 00:43:53','2025-11-04 00:43:53'),(15,1,10,2,NULL,'controlada','2024-04-01 03:00:00','2024-05-01','dispensada','REC-2024-002-0003',NULL,'VER-2024-010-BCD890',NULL,'Dolor crónico de espalda baja','M54.5',0,'Medicamento controlado. Uso bajo supervisión médica. Terapia física complementaria.','2025-11-04 00:43:53','2025-11-04 00:43:53','2025-11-04 00:43:53','2025-11-04 00:43:53'),(16,1,11,1,NULL,'simple','2024-04-10 04:00:00','2024-10-10','dispensada','REC-2024-001-0008',NULL,'VER-2024-011-EFG123',NULL,'Trastorno depresivo recurrente','F33.1',1,'Tratamiento antidepresivo. Seguimiento psiquiátrico mensual.','2025-11-04 00:43:53','2025-11-04 00:43:53','2025-11-04 00:43:53','2025-11-04 00:43:53'),(17,1,12,2,NULL,'simple','2024-04-20 04:00:00','2024-10-20','dispensada','REC-2024-002-0004',NULL,'VER-2024-012-HIJ456',NULL,'Hipertensión arterial esencial','I10',1,'Tratamiento crónico. Control mensual de presión arterial.','2025-11-04 00:43:53','2025-11-04 00:43:53','2025-11-04 00:43:53','2025-11-04 00:43:53'),(18,1,13,1,NULL,'simple','2024-05-05 04:00:00','2024-05-15','dispensada','REC-2024-001-0009',NULL,'VER-2024-013-KLM789',NULL,'Infección de vías urinarias','N39.0',0,'Completar tratamiento antibiótico. Aumentar ingesta de líquidos.','2025-11-04 00:43:53','2025-11-04 00:43:53','2025-11-04 00:43:53','2025-11-04 00:43:53'),(19,1,14,2,NULL,'simple','2024-05-15 04:00:00','2024-11-15','dispensada','REC-2024-002-0005',NULL,'VER-2024-014-NOP012',NULL,'Obesidad','E66.9',1,'Tratamiento complementario a dieta y ejercicio. Control nutricional mensual.','2025-11-04 00:43:53','2025-11-04 00:43:53','2025-11-04 00:43:53','2025-11-04 00:43:53'),(20,1,15,1,NULL,'simple','2024-06-01 04:00:00','2024-09-01','dispensada','REC-2024-001-0010',NULL,'VER-2024-015-QRS345',NULL,'Rinitis alérgica','J30.4',0,'Tratamiento sintomático. Evitar alérgenos identificados.','2025-11-04 00:43:53','2025-11-04 00:43:53','2025-11-04 00:43:53','2025-11-04 00:43:53'),(21,1,1,1,NULL,'simple','2024-11-01 03:00:00','2025-05-01','emitida','REC-2024-001-0011',NULL,'VER-2024-016-TUV678',NULL,'Hipertensión arterial esencial','I10',1,'Renovación de tratamiento crónico.','2025-11-04 00:43:53','2025-11-04 00:43:53','2025-11-04 00:43:53','2025-11-04 00:43:53'),(22,1,2,1,NULL,'simple','2024-11-02 03:00:00','2025-05-02','emitida','REC-2024-001-0012',NULL,'VER-2024-017-WXY901',NULL,'Diabetes mellitus tipo 2','E11.9',1,'Renovación de tratamiento crónico. Ajuste de dosis según control glucémico.','2025-11-04 00:43:53','2025-11-04 00:43:53','2025-11-04 00:43:53','2025-11-04 00:43:53'),(23,1,3,9,NULL,'simple','2024-11-03 03:00:00','2025-05-03','emitida','REC-2024-005-0001',NULL,'VER-2024-018-ABC999',NULL,'Hipotiroidismo','E03.9',0,'Control endocrinológico trimestral.','2025-11-04 00:49:45','2025-11-04 00:49:45','2025-11-04 00:49:45','2025-11-04 00:49:45'),(24,1,22,9,NULL,'simple','2025-11-06 03:00:00','2025-12-06','emitida','REC-1-202511-0987EF08',NULL,'CC4DC2B84E9C2B0B',NULL,NULL,NULL,0,NULL,'2025-11-07 01:20:12','2025-11-07 01:20:12','2025-11-07 01:20:12','2025-11-07 01:20:12'),(25,1,22,9,NULL,'simple','2025-11-06 03:00:00','2025-12-06','emitida','REC-1-202511-A67260B7',NULL,'4542982FD2D82F38',NULL,NULL,NULL,0,NULL,'2025-11-07 01:25:39','2025-11-07 01:25:39','2025-11-07 01:25:39','2025-11-07 01:25:39');
/*!40000 ALTER TABLE `recetas_medicas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recordatorios`
--

DROP TABLE IF EXISTS `recordatorios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `recordatorios` (
  `id_recordatorio` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_cita` int(10) unsigned NOT NULL,
  `tipo` enum('email','sms','whatsapp','llamada','app_notificacion') NOT NULL,
  `estado` enum('pendiente','enviado','fallido','cancelado') NOT NULL DEFAULT 'pendiente',
  `fecha_programada` datetime NOT NULL,
  `fecha_envio` datetime DEFAULT NULL,
  `destinatario` varchar(255) NOT NULL,
  `mensaje` text DEFAULT NULL,
  `plantilla_usada` varchar(100) DEFAULT NULL,
  `resultado_envio` varchar(255) DEFAULT NULL,
  `intentos` int(10) unsigned NOT NULL DEFAULT 0,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_recordatorio`),
  KEY `fk_recordatorio_cita_idx` (`id_cita`),
  KEY `fk_recordatorio_creador_idx` (`creado_por`),
  KEY `idx_recordatorio_tipo` (`tipo`),
  KEY `idx_recordatorio_estado` (`estado`),
  KEY `idx_recordatorio_fecha_prog` (`fecha_programada`),
  CONSTRAINT `fk_recordatorio_cita` FOREIGN KEY (`id_cita`) REFERENCES `citas` (`id_cita`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_recordatorio_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Recordatorios de citas programadas';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recordatorios`
--

LOCK TABLES `recordatorios` WRITE;
/*!40000 ALTER TABLE `recordatorios` DISABLE KEYS */;
/*!40000 ALTER TABLE `recordatorios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recursos_educativos`
--

DROP TABLE IF EXISTS `recursos_educativos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `recursos_educativos` (
  `id_recurso` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `titulo` varchar(100) NOT NULL,
  `descripcion` text NOT NULL,
  `contenido` text DEFAULT NULL,
  `tipo_recurso` enum('articulo','video','infografia','folleto','guia','presentacion','podcast','cuestionario') NOT NULL,
  `url_recurso` varchar(255) DEFAULT NULL,
  `url_imagen` varchar(255) DEFAULT NULL,
  `id_categoria` int(10) unsigned DEFAULT NULL,
  `etiquetas` varchar(255) DEFAULT NULL,
  `idioma` varchar(10) NOT NULL DEFAULT 'es',
  `nivel_complejidad` enum('basico','intermedio','avanzado') NOT NULL DEFAULT 'basico',
  `publico_objetivo` varchar(100) DEFAULT NULL,
  `tiempo_estimado_minutos` int(10) unsigned DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `es_publico` tinyint(1) NOT NULL DEFAULT 1,
  `requiere_login` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_publicacion` date DEFAULT NULL,
  `fecha_actualizacion` date DEFAULT NULL,
  `veces_visto` int(10) unsigned NOT NULL DEFAULT 0,
  `puntuacion_promedio` decimal(3,2) DEFAULT NULL,
  `autor` varchar(100) DEFAULT NULL,
  `notas_internas` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_recurso`),
  KEY `fk_recurso_centro_idx` (`id_centro`),
  KEY `fk_recurso_categoria_idx` (`id_categoria`),
  KEY `fk_recurso_creador_idx` (`creado_por`),
  KEY `idx_recurso_tipo` (`tipo_recurso`),
  KEY `idx_recurso_nivel` (`nivel_complejidad`),
  KEY `idx_recurso_activo` (`activo`),
  KEY `idx_recurso_publico` (`es_publico`),
  KEY `idx_recurso_fechas` (`fecha_publicacion`,`fecha_actualizacion`),
  FULLTEXT KEY `idx_recurso_busqueda` (`titulo`,`descripcion`,`etiquetas`,`contenido`),
  CONSTRAINT `fk_recurso_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_recurso_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Recursos para pacientes';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recursos_educativos`
--

LOCK TABLES `recursos_educativos` WRITE;
/*!40000 ALTER TABLE `recursos_educativos` DISABLE KEYS */;
/*!40000 ALTER TABLE `recursos_educativos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `red_derivaciones`
--

DROP TABLE IF EXISTS `red_derivaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `red_derivaciones` (
  `id_red` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `id_centro_destino` int(10) unsigned DEFAULT NULL,
  `nombre_destino` varchar(200) DEFAULT NULL,
  `tipo_destino` enum('centro_medico','hospital','clinica','laboratorio','especialista','otro') NOT NULL,
  `especialidad` varchar(100) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT NULL,
  `region` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `contacto_nombre` varchar(100) DEFAULT NULL,
  `contacto_cargo` varchar(100) DEFAULT NULL,
  `horario_atencion` varchar(255) DEFAULT NULL,
  `convenio_activo` tinyint(1) NOT NULL DEFAULT 0,
  `detalles_convenio` text DEFAULT NULL,
  `servicios_disponibles` text DEFAULT NULL,
  `tiempo_espera_promedio` varchar(50) DEFAULT NULL,
  `calificacion` int(10) unsigned DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `estado` enum('activo','inactivo','suspendido') NOT NULL DEFAULT 'activo',
  `fecha_inicio_relacion` date DEFAULT NULL,
  `url_protocolos` varchar(255) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_red`),
  KEY `fk_red_centro_idx` (`id_centro`),
  KEY `fk_red_destino_idx` (`id_centro_destino`),
  KEY `fk_red_creador_idx` (`creado_por`),
  KEY `idx_red_tipo` (`tipo_destino`),
  KEY `idx_red_especialidad` (`especialidad`),
  KEY `idx_red_ubicacion` (`ciudad`,`region`),
  KEY `idx_red_convenio` (`convenio_activo`),
  KEY `idx_red_estado` (`estado`),
  FULLTEXT KEY `idx_red_busqueda` (`nombre_destino`,`servicios_disponibles`,`notas`),
  CONSTRAINT `fk_red_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_red_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_red_destino` FOREIGN KEY (`id_centro_destino`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Red de derivaciones entre especialistas';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `red_derivaciones`
--

LOCK TABLES `red_derivaciones` WRITE;
/*!40000 ALTER TABLE `red_derivaciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `red_derivaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `referencia_contrarreferencia`
--

DROP TABLE IF EXISTS `referencia_contrarreferencia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `referencia_contrarreferencia` (
  `id_referencia` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `id_paciente` int(10) unsigned NOT NULL,
  `tipo` enum('referencia','contrarreferencia') NOT NULL,
  `id_referencia_origen` int(10) unsigned DEFAULT NULL,
  `id_medico_origen` int(10) unsigned NOT NULL,
  `id_centro_origen` int(10) unsigned NOT NULL,
  `id_medico_destino` int(10) unsigned DEFAULT NULL,
  `id_centro_destino` int(10) unsigned DEFAULT NULL,
  `id_especialidad_destino` int(10) unsigned DEFAULT NULL,
  `fecha_emision` datetime NOT NULL,
  `motivo` text NOT NULL,
  `diagnostico` varchar(255) NOT NULL,
  `codigo_cie10` varchar(10) DEFAULT NULL,
  `historia_clinica` text DEFAULT NULL,
  `hallazgos_relevantes` text DEFAULT NULL,
  `tratamiento_realizado` text DEFAULT NULL,
  `tratamiento_actual` text DEFAULT NULL,
  `recomendaciones` text DEFAULT NULL,
  `examenes_realizados` text DEFAULT NULL,
  `examenes_pendientes` text DEFAULT NULL,
  `prioridad` enum('normal','preferente','urgente') NOT NULL DEFAULT 'normal',
  `estado` enum('emitida','recibida','aceptada','rechazada','completada','cancelada') NOT NULL DEFAULT 'emitida',
  `fecha_recepcion` datetime DEFAULT NULL,
  `fecha_respuesta` datetime DEFAULT NULL,
  `motivo_rechazo` text DEFAULT NULL,
  `observaciones_destino` text DEFAULT NULL,
  `documentos_url` varchar(255) DEFAULT NULL,
  `id_historial` int(10) unsigned DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_referencia`),
  KEY `fk_referencia_centro_idx` (`id_centro`),
  KEY `fk_referencia_paciente_idx` (`id_paciente`),
  KEY `fk_referencia_origen_idx` (`id_referencia_origen`),
  KEY `fk_referencia_medico_origen_idx` (`id_medico_origen`),
  KEY `fk_referencia_centro_origen_idx` (`id_centro_origen`),
  KEY `fk_referencia_medico_destino_idx` (`id_medico_destino`),
  KEY `fk_referencia_centro_destino_idx` (`id_centro_destino`),
  KEY `fk_referencia_especialidad_idx` (`id_especialidad_destino`),
  KEY `fk_referencia_historial_idx` (`id_historial`),
  KEY `fk_referencia_creador_idx` (`creado_por`),
  KEY `idx_referencia_tipo` (`tipo`),
  KEY `idx_referencia_fechas` (`fecha_emision`,`fecha_recepcion`,`fecha_respuesta`),
  KEY `idx_referencia_prioridad` (`prioridad`),
  KEY `idx_referencia_estado` (`estado`),
  KEY `idx_referencia_diagnostico` (`codigo_cie10`),
  CONSTRAINT `fk_referencia_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_referencia_centro_destino` FOREIGN KEY (`id_centro_destino`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_referencia_centro_origen` FOREIGN KEY (`id_centro_origen`) REFERENCES `centros_medicos` (`id_centro`) ON UPDATE CASCADE,
  CONSTRAINT `fk_referencia_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_referencia_especialidad` FOREIGN KEY (`id_especialidad_destino`) REFERENCES `especialidades` (`id_especialidad`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_referencia_historial` FOREIGN KEY (`id_historial`) REFERENCES `historial_clinico` (`id_historial`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_referencia_medico_destino` FOREIGN KEY (`id_medico_destino`) REFERENCES `medicos` (`id_medico`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_referencia_medico_origen` FOREIGN KEY (`id_medico_origen`) REFERENCES `medicos` (`id_medico`) ON UPDATE CASCADE,
  CONSTRAINT `fk_referencia_origen` FOREIGN KEY (`id_referencia_origen`) REFERENCES `referencia_contrarreferencia` (`id_referencia`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_referencia_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Referencias y contrarreferencias';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `referencia_contrarreferencia`
--

LOCK TABLES `referencia_contrarreferencia` WRITE;
/*!40000 ALTER TABLE `referencia_contrarreferencia` DISABLE KEYS */;
/*!40000 ALTER TABLE `referencia_contrarreferencia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `regiones`
--

DROP TABLE IF EXISTS `regiones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `regiones` (
  `id_region` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_pais` int(10) unsigned NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `codigo` varchar(10) DEFAULT NULL,
  `abreviatura` varchar(10) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_region`),
  KEY `idx_regiones_pais` (`id_pais`),
  KEY `idx_regiones_codigo` (`codigo`),
  KEY `idx_regiones_activo` (`activo`),
  CONSTRAINT `fk_regiones_pais` FOREIGN KEY (`id_pais`) REFERENCES `paises` (`id_pais`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `regiones`
--

LOCK TABLES `regiones` WRITE;
/*!40000 ALTER TABLE `regiones` DISABLE KEYS */;
INSERT INTO `regiones` VALUES (1,1,'Tarapacá','01','TA',1,'2025-10-31 19:34:45','2025-10-31 19:34:45'),(2,1,'Antofagasta','02','AN',1,'2025-10-31 19:34:45','2025-10-31 19:34:45'),(3,1,'Atacama','03','AT',1,'2025-10-31 19:34:45','2025-10-31 19:34:45'),(4,1,'Coquimbo','04','CO',1,'2025-10-31 19:34:45','2025-10-31 19:34:45'),(5,1,'Valparaíso','05','VA',1,'2025-10-31 19:34:45','2025-10-31 19:34:45'),(6,1,'Libertador General Bernardo O\'Higgins','06','OH',1,'2025-10-31 19:34:45','2025-10-31 19:34:45'),(7,1,'Maule','07','MA',1,'2025-10-31 19:34:45','2025-10-31 19:34:45'),(8,1,'Biobío','08','BI',1,'2025-10-31 19:34:45','2025-10-31 19:34:45'),(9,1,'La Araucanía','09','AR',1,'2025-10-31 19:34:45','2025-10-31 19:34:45'),(10,1,'Los Lagos','10','LL',1,'2025-10-31 19:34:45','2025-10-31 19:34:45'),(11,1,'Aysén del General Carlos Ibáñez del Campo','11','AY',1,'2025-10-31 19:34:45','2025-10-31 19:34:45'),(12,1,'Magallanes y de la Antártica Chilena','12','MG',1,'2025-10-31 19:34:45','2025-10-31 19:34:45'),(13,1,'Metropolitana de Santiago','13','RM',1,'2025-10-31 19:34:45','2025-10-31 19:34:45'),(14,1,'Los Ríos','14','LR',1,'2025-10-31 19:34:45','2025-10-31 19:34:45'),(15,1,'Arica y Parinacota','15','AP',1,'2025-10-31 19:34:45','2025-10-31 19:34:45'),(16,1,'Ñuble','16','NB',1,'2025-10-31 19:34:45','2025-10-31 19:34:45');
/*!40000 ALTER TABLE `regiones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registros_nacionales`
--

DROP TABLE IF EXISTS `registros_nacionales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `registros_nacionales` (
  `id_registro` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `tipo_registro` varchar(100) NOT NULL,
  `entidad_destino` varchar(100) NOT NULL,
  `fecha_reporte` date NOT NULL,
  `periodo_inicio` date DEFAULT NULL,
  `periodo_fin` date DEFAULT NULL,
  `datos_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`datos_json`)),
  `archivo_url` varchar(255) DEFAULT NULL,
  `estado` enum('pendiente','enviado','confirmado','error','reenviado') NOT NULL DEFAULT 'pendiente',
  `mensaje_estado` text DEFAULT NULL,
  `codigo_confirmacion` varchar(100) DEFAULT NULL,
  `responsable_id` int(10) unsigned DEFAULT NULL,
  `fecha_envio` datetime DEFAULT NULL,
  `fecha_confirmacion` datetime DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_registro`),
  KEY `fk_registro_centro_idx` (`id_centro`),
  KEY `fk_registro_responsable_idx` (`responsable_id`),
  KEY `idx_registro_tipo` (`tipo_registro`),
  KEY `idx_registro_entidad` (`entidad_destino`),
  KEY `idx_registro_fecha` (`fecha_reporte`),
  KEY `idx_registro_periodo` (`periodo_inicio`,`periodo_fin`),
  KEY `idx_registro_estado` (`estado`),
  CONSTRAINT `fk_registro_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_registro_responsable` FOREIGN KEY (`responsable_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Reportes a registros nacionales';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registros_nacionales`
--

LOCK TABLES `registros_nacionales` WRITE;
/*!40000 ALTER TABLE `registros_nacionales` DISABLE KEYS */;
/*!40000 ALTER TABLE `registros_nacionales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reportes_financieros`
--

DROP TABLE IF EXISTS `reportes_financieros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reportes_financieros` (
  `id_reporte` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `tipo_reporte` varchar(50) NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `periodo_inicio` date NOT NULL,
  `periodo_fin` date NOT NULL,
  `fecha_generacion` datetime NOT NULL,
  `estado` enum('generado','en_revision','aprobado','rechazado','anulado') NOT NULL DEFAULT 'generado',
  `resultado_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`resultado_json`)),
  `url_documento` varchar(255) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `parametros_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`parametros_json`)),
  `incluye_sucursales` tinyint(1) NOT NULL DEFAULT 1,
  `id_aprobador` int(10) unsigned DEFAULT NULL,
  `fecha_aprobacion` datetime DEFAULT NULL,
  `publico` tinyint(1) NOT NULL DEFAULT 0,
  `nivel_acceso` varchar(50) NOT NULL DEFAULT 'direccion',
  `programado` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_reporte`),
  KEY `fk_repfin_centro_idx` (`id_centro`),
  KEY `fk_repfin_aprobador_idx` (`id_aprobador`),
  KEY `fk_repfin_creador_idx` (`creado_por`),
  KEY `idx_repfin_tipo` (`tipo_reporte`),
  KEY `idx_repfin_periodos` (`periodo_inicio`,`periodo_fin`),
  KEY `idx_repfin_generacion` (`fecha_generacion`),
  KEY `idx_repfin_estado` (`estado`),
  KEY `idx_repfin_acceso` (`publico`,`nivel_acceso`),
  KEY `idx_repfin_programado` (`programado`),
  CONSTRAINT `fk_repfin_aprobador` FOREIGN KEY (`id_aprobador`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_repfin_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_repfin_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Reportes financieros';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reportes_financieros`
--

LOCK TABLES `reportes_financieros` WRITE;
/*!40000 ALTER TABLE `reportes_financieros` DISABLE KEYS */;
/*!40000 ALTER TABLE `reportes_financieros` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resenas`
--

DROP TABLE IF EXISTS `resenas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `resenas` (
  `id_resena` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `id_paciente` int(10) unsigned NOT NULL,
  `calificacion` tinyint(3) unsigned NOT NULL COMMENT '1-5 estrellas',
  `comentario` text DEFAULT NULL,
  `fecha_resena` timestamp NOT NULL DEFAULT current_timestamp(),
  `estado` enum('pendiente','aprobada','rechazada') NOT NULL DEFAULT 'pendiente',
  `respuesta_centro` text DEFAULT NULL,
  `fecha_respuesta` datetime DEFAULT NULL,
  PRIMARY KEY (`id_resena`),
  KEY `idx_resena_centro` (`id_centro`),
  KEY `idx_resena_paciente` (`id_paciente`),
  KEY `idx_resena_calificacion` (`calificacion`),
  CONSTRAINT `fk_resena_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_resena_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_calificacion` CHECK (`calificacion` >= 1 and `calificacion` <= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Valoraciones y reseñas de pacientes sobre centros médicos';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resenas`
--

LOCK TABLES `resenas` WRITE;
/*!40000 ALTER TABLE `resenas` DISABLE KEYS */;
/*!40000 ALTER TABLE `resenas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resultados_examenes`
--

DROP TABLE IF EXISTS `resultados_examenes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `resultados_examenes` (
  `id_resultado` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_examen` int(10) unsigned NOT NULL,
  `id_paciente` int(10) unsigned NOT NULL,
  `fecha_resultado` datetime NOT NULL,
  `profesional_id` int(10) unsigned DEFAULT NULL,
  `titulo` varchar(100) NOT NULL,
  `formato` enum('texto','valor_numerico','positivo_negativo','imagen','archivo','estructura','json') NOT NULL,
  `resultado_texto` text DEFAULT NULL,
  `resultado_numerico` decimal(15,4) DEFAULT NULL,
  `unidad_medida` varchar(20) DEFAULT NULL,
  `resultado_positivo` tinyint(1) DEFAULT NULL,
  `url_resultado` varchar(255) DEFAULT NULL,
  `resultado_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`resultado_json`)),
  `interpretacion` text DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `estado` enum('preliminar','final','corregido','anulado') NOT NULL DEFAULT 'preliminar',
  `es_critico` tinyint(1) NOT NULL DEFAULT 0,
  `notificado_medico` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_notificacion_medico` datetime DEFAULT NULL,
  `validado` tinyint(1) NOT NULL DEFAULT 0,
  `validado_por` int(10) unsigned DEFAULT NULL,
  `fecha_validacion` datetime DEFAULT NULL,
  `requiere_seguimiento` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `registrado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_resultado`),
  KEY `fk_resultado_examen_idx` (`id_examen`),
  KEY `fk_resultado_paciente_idx` (`id_paciente`),
  KEY `fk_resultado_profesional_idx` (`profesional_id`),
  KEY `fk_resultado_validador_idx` (`validado_por`),
  KEY `fk_resultado_registrador_idx` (`registrado_por`),
  KEY `idx_resultado_fecha` (`fecha_resultado`),
  KEY `idx_resultado_formato` (`formato`),
  KEY `idx_resultado_estado` (`estado`),
  KEY `idx_resultado_critico` (`es_critico`),
  KEY `idx_resultado_notificado` (`notificado_medico`),
  KEY `idx_resultado_validado` (`validado`),
  KEY `idx_resultado_seguimiento` (`requiere_seguimiento`),
  CONSTRAINT `fk_resultado_examen` FOREIGN KEY (`id_examen`) REFERENCES `examenes_medicos` (`id_examen`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_resultado_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_resultado_profesional` FOREIGN KEY (`profesional_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_resultado_registrador` FOREIGN KEY (`registrado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_resultado_validador` FOREIGN KEY (`validado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Resultados de exámenes';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resultados_examenes`
--

LOCK TABLES `resultados_examenes` WRITE;
/*!40000 ALTER TABLE `resultados_examenes` DISABLE KEYS */;
/*!40000 ALTER TABLE `resultados_examenes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `roles` (
  `id_rol` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) DEFAULT NULL,
  `nombre` varchar(50) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `permisos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`permisos`)),
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `orden` int(10) unsigned NOT NULL DEFAULT 100,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `nivel_jerarquia` int(10) unsigned NOT NULL DEFAULT 0,
  `es_predefinido` tinyint(1) NOT NULL DEFAULT 0,
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `idx_rol_nombre` (`nombre`),
  KEY `idx_rol_jerarquia` (`nivel_jerarquia`),
  KEY `idx_rol_estado` (`estado`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Roles de usuario en el sistema';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'SUPERADMINISTRADOR','SuperAdministrador','Acceso total al sistema','[\"usuarios.editar\"]',1,10001,'2025-11-02 18:59:42','2025-11-02 19:44:35',100,1,'activo','2025-10-27 02:19:46','2025-11-02 19:44:35'),(2,'TÉCNICO','Técnico','Gestión técnica y soporte TI',NULL,1,100,'2025-11-02 18:59:42','2025-11-02 18:59:42',80,1,'activo','2025-10-27 02:19:46','2025-11-02 18:55:49'),(3,'ADMINISTRATIVO','Administrativo','Gestión administrativa de centros','[\"usuarios.ver\",\"usuarios.editar\",\"roles.ver\",\"recetas.ver\"]',1,100,'2025-11-02 18:59:42','2025-11-02 19:01:48',60,1,'activo','2025-10-27 02:19:46','2025-11-02 19:01:48'),(4,'SECRETARIA','Secretaria','Gestión de agendas y comunicación',NULL,1,100,'2025-11-02 18:59:42','2025-11-02 18:59:42',40,1,'activo','2025-10-27 02:19:46','2025-11-02 18:55:49'),(5,'MÉDICO','Médico','Atención médica y gestión de fichas',NULL,1,100,'2025-11-02 18:59:42','2025-11-02 18:59:42',40,1,'activo','2025-10-27 02:19:46','2025-11-02 18:55:49'),(6,'PACIENTE','Paciente','Acceso al portal de pacientes, SI.',NULL,1,100,'2025-11-02 18:59:42','2025-11-02 19:19:06',20,1,'activo','2025-10-27 02:19:46','2025-11-02 19:19:06');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles_permisos`
--

DROP TABLE IF EXISTS `roles_permisos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `roles_permisos` (
  `id_rol` int(10) unsigned NOT NULL,
  `id_permiso` int(10) unsigned NOT NULL,
  `fecha_asignacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_rol`,`id_permiso`),
  KEY `fk_rolpermiso_permiso_idx` (`id_permiso`),
  KEY `fk_rolpermiso_rol_idx` (`id_rol`),
  CONSTRAINT `fk_rolpermiso_permiso` FOREIGN KEY (`id_permiso`) REFERENCES `permisos` (`id_permiso`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_rolpermiso_rol` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Asignación de permisos a roles';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles_permisos`
--

LOCK TABLES `roles_permisos` WRITE;
/*!40000 ALTER TABLE `roles_permisos` DISABLE KEYS */;
/*!40000 ALTER TABLE `roles_permisos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salas`
--

DROP TABLE IF EXISTS `salas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `salas` (
  `id_sala` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `id_sucursal` int(10) unsigned DEFAULT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `tipo` enum('consulta','procedimiento','cirugia','telemedicina','reuniones','otro') NOT NULL,
  `capacidad` int(10) unsigned DEFAULT NULL,
  `piso` varchar(10) DEFAULT NULL,
  `numero` varchar(10) DEFAULT NULL,
  `equipamiento` text DEFAULT NULL,
  `estado` enum('activa','inactiva','mantenimiento','ocupada') NOT NULL DEFAULT 'activa',
  `motivo_inactividad` varchar(255) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_sala`),
  KEY `fk_sala_centro_idx` (`id_centro`),
  KEY `fk_sala_sucursal_idx` (`id_sucursal`),
  KEY `fk_sala_creador_idx` (`creado_por`),
  KEY `idx_sala_tipo` (`tipo`),
  KEY `idx_sala_estado` (`estado`),
  CONSTRAINT `fk_sala_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_sala_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_sala_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursales` (`id_sucursal`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Salas de atención disponibles';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salas`
--

LOCK TABLES `salas` WRITE;
/*!40000 ALTER TABLE `salas` DISABLE KEYS */;
INSERT INTO `salas` VALUES (1,1,NULL,'Consulta 1',NULL,'consulta',1,NULL,NULL,NULL,'activa',NULL,'2025-10-29 00:33:12','2025-10-29 00:33:12',1);
/*!40000 ALTER TABLE `salas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `secretarias`
--

DROP TABLE IF EXISTS `secretarias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `secretarias` (
  `id_secretaria` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_usuario` int(10) unsigned NOT NULL,
  `id_centro` int(10) unsigned NOT NULL,
  `id_sucursal` int(10) unsigned DEFAULT NULL,
  `id_departamento` int(10) unsigned DEFAULT NULL,
  `estado` enum('activo','inactivo','suspendido','vacaciones') NOT NULL DEFAULT 'activo',
  `jornada` enum('completa','media','parcial') NOT NULL DEFAULT 'completa',
  `extension_telefonica` varchar(10) DEFAULT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_termino` date DEFAULT NULL,
  `supervisor_id` int(10) unsigned DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_secretaria`),
  UNIQUE KEY `idx_secretaria_usuario` (`id_usuario`),
  KEY `fk_secretaria_centro_idx` (`id_centro`),
  KEY `fk_secretaria_sucursal_idx` (`id_sucursal`),
  KEY `fk_secretaria_departamento_idx` (`id_departamento`),
  KEY `fk_secretaria_supervisor_idx` (`supervisor_id`),
  KEY `idx_secretaria_estado` (`estado`),
  CONSTRAINT `fk_secretaria_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_secretaria_departamento` FOREIGN KEY (`id_departamento`) REFERENCES `departamentos` (`id_departamento`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_secretaria_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursales` (`id_sucursal`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_secretaria_supervisor` FOREIGN KEY (`supervisor_id`) REFERENCES `administrativos` (`id_administrativo`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_secretaria_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Personal de secretaría';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `secretarias`
--

LOCK TABLES `secretarias` WRITE;
/*!40000 ALTER TABLE `secretarias` DISABLE KEYS */;
INSERT INTO `secretarias` VALUES (1,5,1,NULL,NULL,'activo','completa',NULL,'2023-05-10',NULL,NULL,'2025-10-27 02:20:37','2025-10-27 02:20:37');
/*!40000 ALTER TABLE `secretarias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `secretarias_medicos`
--

DROP TABLE IF EXISTS `secretarias_medicos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `secretarias_medicos` (
  `id_secretaria` int(10) unsigned NOT NULL,
  `id_medico` int(10) unsigned NOT NULL,
  `es_principal` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_asignacion` date NOT NULL,
  `fecha_desasignacion` date DEFAULT NULL,
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo',
  `permisos_especiales` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_secretaria`,`id_medico`),
  KEY `fk_secmed_medico_idx` (`id_medico`),
  KEY `idx_secmed_estado` (`estado`),
  KEY `idx_secmed_principal` (`es_principal`),
  CONSTRAINT `fk_secmed_medico` FOREIGN KEY (`id_medico`) REFERENCES `medicos` (`id_medico`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_secmed_secretaria` FOREIGN KEY (`id_secretaria`) REFERENCES `secretarias` (`id_secretaria`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Asignación de secretarias a médicos';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `secretarias_medicos`
--

LOCK TABLES `secretarias_medicos` WRITE;
/*!40000 ALTER TABLE `secretarias_medicos` DISABLE KEYS */;
/*!40000 ALTER TABLE `secretarias_medicos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `segmentacion_pacientes`
--

DROP TABLE IF EXISTS `segmentacion_pacientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `segmentacion_pacientes` (
  `id_segmentacion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente` int(10) unsigned NOT NULL,
  `categoria` varchar(50) NOT NULL,
  `subcategoria` varchar(50) DEFAULT NULL,
  `valor` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `prioridad` int(10) unsigned DEFAULT NULL,
  `automatica` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_asignacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_fin` date DEFAULT NULL,
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `asignado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_segmentacion`),
  KEY `fk_segmentacion_paciente_idx` (`id_paciente`),
  KEY `fk_segmentacion_asignador_idx` (`asignado_por`),
  KEY `idx_segmentacion_categoria` (`categoria`,`subcategoria`),
  KEY `idx_segmentacion_valor` (`valor`),
  KEY `idx_segmentacion_prioridad` (`prioridad`),
  CONSTRAINT `fk_segmentacion_asignador` FOREIGN KEY (`asignado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_segmentacion_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Categorización y segmentación de pacientes';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `segmentacion_pacientes`
--

LOCK TABLES `segmentacion_pacientes` WRITE;
/*!40000 ALTER TABLE `segmentacion_pacientes` DISABLE KEYS */;
/*!40000 ALTER TABLE `segmentacion_pacientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seguimiento_campanas`
--

DROP TABLE IF EXISTS `seguimiento_campanas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `seguimiento_campanas` (
  `id_seguimiento` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_campana` int(10) unsigned NOT NULL,
  `id_centro` int(10) unsigned NOT NULL,
  `fecha_medicion` date NOT NULL,
  `tipo_metrica` varchar(50) NOT NULL,
  `valor` decimal(15,2) NOT NULL,
  `objetivo` decimal(15,2) DEFAULT NULL,
  `porcentaje_cumplimiento` decimal(5,2) DEFAULT NULL,
  `fuente_datos` varchar(100) DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `acumulado` tinyint(1) NOT NULL DEFAULT 0,
  `detalles_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`detalles_json`)),
  `responsable_id` int(10) unsigned DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_seguimiento`),
  KEY `fk_seguicamp_campana_idx` (`id_campana`),
  KEY `fk_seguicamp_centro_idx` (`id_centro`),
  KEY `fk_seguicamp_responsable_idx` (`responsable_id`),
  KEY `fk_seguicamp_creador_idx` (`creado_por`),
  KEY `idx_seguicamp_fecha` (`fecha_medicion`),
  KEY `idx_seguicamp_tipo` (`tipo_metrica`),
  KEY `idx_seguicamp_acumulado` (`acumulado`),
  CONSTRAINT `fk_seguicamp_campana` FOREIGN KEY (`id_campana`) REFERENCES `campanas_marketing` (`id_campana`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_seguicamp_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_seguicamp_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_seguicamp_responsable` FOREIGN KEY (`responsable_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Métricas de campañas de marketing';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seguimiento_campanas`
--

LOCK TABLES `seguimiento_campanas` WRITE;
/*!40000 ALTER TABLE `seguimiento_campanas` DISABLE KEYS */;
/*!40000 ALTER TABLE `seguimiento_campanas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seguimiento_educativo`
--

DROP TABLE IF EXISTS `seguimiento_educativo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `seguimiento_educativo` (
  `id_seguimiento` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente` int(10) unsigned NOT NULL,
  `id_recurso` int(10) unsigned DEFAULT NULL,
  `id_plan` int(10) unsigned DEFAULT NULL,
  `id_comunidad` int(10) unsigned DEFAULT NULL,
  `tipo_actividad` varchar(50) NOT NULL,
  `fecha_actividad` datetime NOT NULL,
  `duracion_minutos` int(10) unsigned DEFAULT NULL,
  `estado` enum('pendiente','en_progreso','completado','cancelado') NOT NULL DEFAULT 'pendiente',
  `porcentaje_completado` decimal(5,2) DEFAULT NULL,
  `evaluacion` enum('no_realizada','reprobada','aprobada','sobresaliente') DEFAULT NULL,
  `puntuacion` int(10) unsigned DEFAULT NULL,
  `comentarios_paciente` text DEFAULT NULL,
  `comentarios_profesional` text DEFAULT NULL,
  `profesional_id` int(10) unsigned DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_seguimiento`),
  KEY `fk_seguiedu_paciente_idx` (`id_paciente`),
  KEY `fk_seguiedu_recurso_idx` (`id_recurso`),
  KEY `fk_seguiedu_plan_idx` (`id_plan`),
  KEY `fk_seguiedu_comunidad_idx` (`id_comunidad`),
  KEY `fk_seguiedu_profesional_idx` (`profesional_id`),
  KEY `fk_seguiedu_creador_idx` (`creado_por`),
  KEY `idx_seguiedu_tipo` (`tipo_actividad`),
  KEY `idx_seguiedu_fecha` (`fecha_actividad`),
  KEY `idx_seguiedu_estado` (`estado`),
  KEY `idx_seguiedu_evaluacion` (`evaluacion`),
  CONSTRAINT `fk_seguiedu_comunidad` FOREIGN KEY (`id_comunidad`) REFERENCES `comunidades_pacientes` (`id_comunidad`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_seguiedu_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_seguiedu_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_seguiedu_plan` FOREIGN KEY (`id_plan`) REFERENCES `planes_autocuidado` (`id_plan`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_seguiedu_profesional` FOREIGN KEY (`profesional_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_seguiedu_recurso` FOREIGN KEY (`id_recurso`) REFERENCES `recursos_educativos` (`id_recurso`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Seguimiento de educación de pacientes';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seguimiento_educativo`
--

LOCK TABLES `seguimiento_educativo` WRITE;
/*!40000 ALTER TABLE `seguimiento_educativo` DISABLE KEYS */;
/*!40000 ALTER TABLE `seguimiento_educativo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seguimiento_programas`
--

DROP TABLE IF EXISTS `seguimiento_programas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `seguimiento_programas` (
  `id_seguimiento` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente_programa` int(10) unsigned NOT NULL,
  `id_paciente` int(10) unsigned NOT NULL,
  `id_programa` int(10) unsigned NOT NULL,
  `id_profesional` int(10) unsigned NOT NULL,
  `fecha_seguimiento` date NOT NULL,
  `tipo_seguimiento` enum('consulta','llamada','visita','telemedicina','evaluacion','control') NOT NULL,
  `estado_actual` varchar(100) NOT NULL,
  `cumplimiento_plan` enum('completo','parcial','bajo','sin_cumplimiento') NOT NULL,
  `detalle_cumplimiento` text DEFAULT NULL,
  `hallazgos` text DEFAULT NULL,
  `cambios_tratamiento` text DEFAULT NULL,
  `recomendaciones` text DEFAULT NULL,
  `respuesta_paciente` text DEFAULT NULL,
  `modificaciones_plan` text DEFAULT NULL,
  `alertas` text DEFAULT NULL,
  `requiere_derivacion` tinyint(1) NOT NULL DEFAULT 0,
  `derivado_a` varchar(100) DEFAULT NULL,
  `proxima_fecha_seguimiento` date DEFAULT NULL,
  `indicadores_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`indicadores_json`)),
  `notas_privadas` text DEFAULT NULL,
  `duracion_minutos` int(10) unsigned DEFAULT NULL,
  `id_cita` int(10) unsigned DEFAULT NULL,
  `id_historial` int(10) unsigned DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_seguimiento`),
  KEY `fk_seguiprog_pacprog_idx` (`id_paciente_programa`),
  KEY `fk_seguiprog_paciente_idx` (`id_paciente`),
  KEY `fk_seguiprog_programa_idx` (`id_programa`),
  KEY `fk_seguiprog_profesional_idx` (`id_profesional`),
  KEY `fk_seguiprog_cita_idx` (`id_cita`),
  KEY `fk_seguiprog_historial_idx` (`id_historial`),
  KEY `idx_seguiprog_fecha` (`fecha_seguimiento`),
  KEY `idx_seguiprog_tipo` (`tipo_seguimiento`),
  KEY `idx_seguiprog_cumplimiento` (`cumplimiento_plan`),
  KEY `idx_seguiprog_derivacion` (`requiere_derivacion`),
  KEY `idx_seguiprog_proxima` (`proxima_fecha_seguimiento`),
  CONSTRAINT `fk_seguiprog_cita` FOREIGN KEY (`id_cita`) REFERENCES `citas` (`id_cita`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_seguiprog_historial` FOREIGN KEY (`id_historial`) REFERENCES `historial_clinico` (`id_historial`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_seguiprog_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_seguiprog_pacprog` FOREIGN KEY (`id_paciente_programa`) REFERENCES `pacientes_programas` (`id_paciente_programa`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_seguiprog_profesional` FOREIGN KEY (`id_profesional`) REFERENCES `usuarios` (`id_usuario`) ON UPDATE CASCADE,
  CONSTRAINT `fk_seguiprog_programa` FOREIGN KEY (`id_programa`) REFERENCES `programas_especiales` (`id_programa`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Seguimiento de programas especiales';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seguimiento_programas`
--

LOCK TABLES `seguimiento_programas` WRITE;
/*!40000 ALTER TABLE `seguimiento_programas` DISABLE KEYS */;
/*!40000 ALTER TABLE `seguimiento_programas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seguros_medicos`
--

DROP TABLE IF EXISTS `seguros_medicos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `seguros_medicos` (
  `id_seguro` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente` int(10) unsigned NOT NULL,
  `tipo_seguro` enum('FONASA','ISAPRE','PARTICULAR','OTRO') NOT NULL,
  `nombre_aseguradora` varchar(100) DEFAULT NULL,
  `numero_poliza` varchar(50) DEFAULT NULL,
  `tipo_plan` varchar(100) DEFAULT NULL,
  `grupo_fonasa` varchar(2) DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `cobertura_ambulatoria` decimal(5,2) DEFAULT NULL,
  `cobertura_hospitalaria` decimal(5,2) DEFAULT NULL,
  `cobertura_medicamentos` decimal(5,2) DEFAULT NULL,
  `cobertura_examenes` decimal(5,2) DEFAULT NULL,
  `tiene_beneficiarios` tinyint(1) DEFAULT 0,
  `es_seguro_principal` tinyint(1) NOT NULL DEFAULT 1,
  `estado` enum('activo','inactivo','vencido','pendiente_validacion') NOT NULL DEFAULT 'activo',
  `certificado_url` varchar(255) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `registrado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_seguro`),
  KEY `fk_seguro_paciente_idx` (`id_paciente`),
  KEY `fk_seguro_registrador_idx` (`registrado_por`),
  KEY `idx_seguro_tipo` (`tipo_seguro`),
  KEY `idx_seguro_estado` (`estado`),
  KEY `idx_seguro_principal` (`es_seguro_principal`),
  CONSTRAINT `fk_seguro_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_seguro_registrador` FOREIGN KEY (`registrado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Información de seguros de salud de pacientes';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seguros_medicos`
--

LOCK TABLES `seguros_medicos` WRITE;
/*!40000 ALTER TABLE `seguros_medicos` DISABLE KEYS */;
/*!40000 ALTER TABLE `seguros_medicos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `servicios_ambulancia`
--

DROP TABLE IF EXISTS `servicios_ambulancia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `servicios_ambulancia` (
  `id_servicio` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `id_paciente` int(10) unsigned NOT NULL,
  `fecha_solicitud` datetime NOT NULL,
  `fecha_programada` datetime DEFAULT NULL,
  `tipo_servicio` enum('urgencia','traslado_programado','alta_medica','transferencia','domicilio') NOT NULL,
  `prioridad` enum('normal','urgente','critica') NOT NULL DEFAULT 'normal',
  `estado` enum('solicitado','asignado','en_curso','completado','cancelado') NOT NULL DEFAULT 'solicitado',
  `direccion_origen` varchar(255) NOT NULL,
  `direccion_destino` varchar(255) NOT NULL,
  `proveedor` varchar(100) DEFAULT NULL,
  `contacto_proveedor` varchar(100) DEFAULT NULL,
  `movil_asignado` varchar(50) DEFAULT NULL,
  `personal_asignado` varchar(255) DEFAULT NULL,
  `tiempo_estimado_minutos` int(10) unsigned DEFAULT NULL,
  `distancia_estimada_km` decimal(8,2) DEFAULT NULL,
  `indicaciones_especiales` text DEFAULT NULL,
  `equipamiento_especial` text DEFAULT NULL,
  `acompanante` tinyint(1) NOT NULL DEFAULT 0,
  `nombre_acompanante` varchar(100) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `medico_solicitante_id` int(10) unsigned DEFAULT NULL,
  `solicitado_por` int(10) unsigned NOT NULL,
  `costo` decimal(10,2) DEFAULT NULL,
  `metodo_pago` varchar(50) DEFAULT NULL,
  `notas_facturacion` text DEFAULT NULL,
  `fecha_real_inicio` datetime DEFAULT NULL,
  `fecha_real_fin` datetime DEFAULT NULL,
  `motivo_cancelacion` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_servicio`),
  KEY `fk_ambulancia_centro_idx` (`id_centro`),
  KEY `fk_ambulancia_paciente_idx` (`id_paciente`),
  KEY `fk_ambulancia_medico_idx` (`medico_solicitante_id`),
  KEY `fk_ambulancia_solicitante_idx` (`solicitado_por`),
  KEY `idx_ambulancia_fechas` (`fecha_solicitud`,`fecha_programada`),
  KEY `idx_ambulancia_tipo` (`tipo_servicio`),
  KEY `idx_ambulancia_prioridad` (`prioridad`),
  KEY `idx_ambulancia_estado` (`estado`),
  KEY `idx_ambulancia_proveedor` (`proveedor`),
  KEY `idx_ambulancia_reales` (`fecha_real_inicio`,`fecha_real_fin`),
  CONSTRAINT `fk_ambulancia_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ambulancia_medico` FOREIGN KEY (`medico_solicitante_id`) REFERENCES `medicos` (`id_medico`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_ambulancia_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ambulancia_solicitante` FOREIGN KEY (`solicitado_por`) REFERENCES `usuarios` (`id_usuario`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Servicios de ambulancia';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servicios_ambulancia`
--

LOCK TABLES `servicios_ambulancia` WRITE;
/*!40000 ALTER TABLE `servicios_ambulancia` DISABLE KEYS */;
/*!40000 ALTER TABLE `servicios_ambulancia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `servicios_centros`
--

DROP TABLE IF EXISTS `servicios_centros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `servicios_centros` (
  `id_servicio` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `nombre_servicio` varchar(150) NOT NULL,
  `descripcion_servicio` text DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `prioridad` int(10) unsigned DEFAULT 0,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_servicio`),
  KEY `id_centro` (`id_centro`),
  CONSTRAINT `servicios_centros_ibfk_1` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servicios_centros`
--

LOCK TABLES `servicios_centros` WRITE;
/*!40000 ALTER TABLE `servicios_centros` DISABLE KEYS */;
INSERT INTO `servicios_centros` VALUES (1,2,'Consulta General','Atención médica integral de primera línea.',1,1,'2025-10-28 20:59:34'),(2,2,'Pediatría','Cuidado médico especializado para niños.',1,2,'2025-10-28 20:59:34'),(3,2,'Odontología','Servicios dentales avanzados.',1,3,'2025-10-28 20:59:34'),(4,1,'Urgencias 24/7','Atención de urgencias las 24 horas',1,1,'2025-11-04 00:22:40'),(5,1,'Hospitalización','Camas de hospitalización general',1,2,'2025-11-04 00:22:40'),(6,1,'Pabellón Quirúrgico','Cirugías programadas y de urgencia',1,3,'2025-11-04 00:22:40'),(7,1,'Laboratorio Clínico','Exámenes de sangre, orina y otros',1,4,'2025-11-04 00:22:40'),(8,1,'Imagenología','Rayos X, Ecografía, TAC, Resonancia',1,5,'2025-11-04 00:22:40'),(9,1,'Farmacia','Dispensación de medicamentos',1,6,'2025-11-04 00:22:40'),(10,1,'Maternidad','Atención de partos y puerperio',1,7,'2025-11-04 00:22:40'),(11,1,'UCI','Unidad de Cuidados Intensivos',1,8,'2025-11-04 00:22:40'),(12,2,'Consultas Médicas','Atención ambulatoria especializada',1,1,'2025-11-04 00:22:40'),(13,2,'Cirugía Menor','Procedimientos quirúrgicos ambulatorios',1,2,'2025-11-04 00:22:40'),(14,2,'Laboratorio','Toma de muestras y exámenes básicos',1,3,'2025-11-04 00:22:40'),(15,2,'Ecografía','Ecografías obstétricas y abdominales',1,4,'2025-11-04 00:22:40'),(16,2,'Vacunatorio','Vacunas para todas las edades',1,5,'2025-11-04 00:22:40'),(17,3,'Medicina General','Consultas médicas generales',1,1,'2025-11-04 00:22:40'),(18,3,'Pediatría','Control niño sano y consultas pediátricas',1,2,'2025-11-04 00:22:40'),(19,3,'Ginecología','Salud de la mujer',1,3,'2025-11-04 00:22:40'),(20,3,'Odontología','Atención dental básica',1,4,'2025-11-04 00:22:40'),(21,3,'SOME','Servicio de Orientación Médica Estadística',1,5,'2025-11-04 00:22:40'),(22,3,'Farmacia','Entrega de medicamentos FONASA',1,6,'2025-11-04 00:22:40');
/*!40000 ALTER TABLE `servicios_centros` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sesiones_telemedicina`
--

DROP TABLE IF EXISTS `sesiones_telemedicina`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sesiones_telemedicina` (
  `id_sesion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_cita` int(10) unsigned DEFAULT NULL,
  `id_paciente` int(10) unsigned NOT NULL,
  `id_medico` int(10) unsigned NOT NULL,
  `token_acceso` varchar(255) NOT NULL,
  `url_sesion` varchar(500) DEFAULT NULL,
  `estado` enum('programada','en_espera','en_curso','finalizada','cancelada','no_asistio','problema_tecnico') NOT NULL DEFAULT 'programada',
  `fecha_hora_inicio_programada` datetime NOT NULL,
  `fecha_hora_fin_programada` datetime NOT NULL,
  `fecha_hora_inicio_real` datetime DEFAULT NULL,
  `fecha_hora_fin_real` datetime DEFAULT NULL,
  `duracion_segundos` int(10) unsigned DEFAULT NULL,
  `proveedor_servicio` varchar(100) DEFAULT 'AnySSA Video Conference',
  `id_sala_virtual` varchar(255) DEFAULT NULL,
  `calidad_conexion` enum('excelente','buena','regular','mala','muy_mala') DEFAULT NULL,
  `dispositivo_paciente` varchar(100) DEFAULT NULL,
  `navegador_paciente` varchar(100) DEFAULT NULL,
  `ip_paciente` varchar(45) DEFAULT NULL,
  `dispositivo_medico` varchar(100) DEFAULT NULL,
  `navegador_medico` varchar(100) DEFAULT NULL,
  `ip_medico` varchar(45) DEFAULT NULL,
  `grabacion_autorizada` tinyint(1) NOT NULL DEFAULT 0,
  `url_grabacion` varchar(500) DEFAULT NULL,
  `transcripcion_disponible` tinyint(1) NOT NULL DEFAULT 0,
  `url_transcripcion` varchar(500) DEFAULT NULL,
  `notas_sesion` text DEFAULT NULL,
  `motivo_cancelacion` text DEFAULT NULL,
  `problemas_tecnicos` text DEFAULT NULL,
  `calificacion_paciente` int(10) unsigned DEFAULT NULL COMMENT '1-5 estrellas',
  `comentario_paciente` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_sesion`),
  UNIQUE KEY `idx_sesion_token` (`token_acceso`),
  KEY `fk_sesion_cita_idx` (`id_cita`),
  KEY `fk_sesion_paciente_idx` (`id_paciente`),
  KEY `fk_sesion_medico_idx` (`id_medico`),
  KEY `idx_sesion_estado` (`estado`),
  KEY `idx_sesion_fechas` (`fecha_hora_inicio_programada`,`fecha_hora_fin_programada`),
  CONSTRAINT `fk_sesiones_telemedicina_cita` FOREIGN KEY (`id_cita`) REFERENCES `citas` (`id_cita`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_sesiones_telemedicina_medico` FOREIGN KEY (`id_medico`) REFERENCES `medicos` (`id_medico`) ON UPDATE CASCADE,
  CONSTRAINT `fk_sesiones_telemedicina_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Sesiones de telemedicina';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sesiones_telemedicina`
--

LOCK TABLES `sesiones_telemedicina` WRITE;
/*!40000 ALTER TABLE `sesiones_telemedicina` DISABLE KEYS */;
/*!40000 ALTER TABLE `sesiones_telemedicina` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sesiones_usuario`
--

DROP TABLE IF EXISTS `sesiones_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sesiones_usuario` (
  `id_sesion` varchar(100) NOT NULL,
  `id_usuario` int(10) unsigned NOT NULL,
  `fecha_inicio` datetime NOT NULL,
  `fecha_ultima_actividad` datetime NOT NULL,
  `fecha_cierre` datetime DEFAULT NULL,
  `ip_origen` varchar(45) NOT NULL,
  `user_agent` varchar(255) NOT NULL,
  `dispositivo` varchar(100) DEFAULT NULL,
  `navegador` varchar(100) DEFAULT NULL,
  `sistema_operativo` varchar(100) DEFAULT NULL,
  `ubicacion` varchar(255) DEFAULT NULL,
  `estado` enum('activa','cerrada','expirada','forzada','bloqueada') NOT NULL DEFAULT 'activa',
  `motivo_cierre` varchar(100) DEFAULT NULL,
  `cerrado_por` int(10) unsigned DEFAULT NULL,
  `token_jwt` text DEFAULT NULL,
  `token_refresh` varchar(255) DEFAULT NULL,
  `fecha_expiracion_token` datetime DEFAULT NULL,
  `duracion_segundos` int(10) unsigned DEFAULT NULL,
  `device_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_sesion`),
  KEY `fk_sesion_usuario_idx` (`id_usuario`),
  KEY `fk_sesion_cerrador_idx` (`cerrado_por`),
  KEY `idx_sesion_fechas` (`fecha_inicio`,`fecha_ultima_actividad`,`fecha_cierre`),
  KEY `idx_sesion_estado` (`estado`),
  KEY `idx_sesion_ip` (`ip_origen`),
  KEY `idx_sesion_expiracion` (`fecha_expiracion_token`),
  KEY `idx_sesion_device` (`device_id`),
  CONSTRAINT `fk_sesion_cerrador` FOREIGN KEY (`cerrado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_sesion_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro de sesiones activas';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sesiones_usuario`
--

LOCK TABLES `sesiones_usuario` WRITE;
/*!40000 ALTER TABLE `sesiones_usuario` DISABLE KEYS */;
/*!40000 ALTER TABLE `sesiones_usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sesiones_usuarios`
--

DROP TABLE IF EXISTS `sesiones_usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sesiones_usuarios` (
  `id_sesion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_usuario` int(10) unsigned NOT NULL,
  `token` varchar(255) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_expiracion` timestamp NULL DEFAULT NULL,
  `ultima_actividad` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_sesion`),
  UNIQUE KEY `token` (`token`),
  UNIQUE KEY `uniq_token` (`token`),
  KEY `idx_sesion_token` (`token`),
  KEY `idx_sesion_usuario` (`id_usuario`),
  KEY `idx_sesion_activa` (`activa`),
  KEY `idx_sesion_expiracion` (`fecha_expiracion`),
  CONSTRAINT `sesiones_usuarios_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Sesiones activas de usuarios';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sesiones_usuarios`
--

LOCK TABLES `sesiones_usuarios` WRITE;
/*!40000 ALTER TABLE `sesiones_usuarios` DISABLE KEYS */;
INSERT INTO `sesiones_usuarios` VALUES (1,1,'tokenprueba123','127.0.0.1','manual_setup',1,'2025-11-03 01:06:43','2025-11-04 01:06:43','2025-11-03 01:06:43'),(2,1,'516c9e6b03247482b90b469c104c9f782de7002b5ffe2833b95bc3785848f9eb','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',1,'2025-11-03 01:46:57','2025-11-03 09:46:57','2025-11-03 01:46:57'),(3,1,'8b6487b07be71134b624d2772f025e8bfedf57833d21e22a710d08b5d4e38fca','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',1,'2025-11-03 01:47:23','2025-11-03 09:47:23','2025-11-03 01:47:23'),(4,5,'abc123testtoken',NULL,NULL,1,'2025-11-04 15:06:15','2025-11-04 18:12:23','2025-11-04 15:12:23'),(5,5,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJzZWNyZXRhcmlhQG1lZGlzdWl0ZS5jbCIsInJvbCI6IlNlY3JldGFyaWEiLCJpYXQiOjE3NjIyNjk5MzMsImV4cCI6MTc2MjI5ODczM30.JPVgyAsw37_FYD7wRARAJ7ukOodQff_rvA3tGDhK_8s',NULL,NULL,1,'2025-11-04 15:25:33','2025-11-04 23:25:33','2025-11-04 15:33:51'),(6,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJzYWludGFtb3VyZHVsaWFuaXNlQGdtYWlsLmNvbSIsInJvbCI6IkFkbWluaXN0cmF0aXZvIiwiaWF0IjoxNzYyMjcwNDU0LCJleHAiOjE3NjIyOTkyNTR9.sCW08RAqb_l0wBJD1jvj95_rn2kNHOrLUUBgeS6_3rg',NULL,NULL,1,'2025-11-04 15:34:14','2025-11-04 23:34:14','2025-11-04 15:34:40'),(7,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJzYWludGFtb3VyZHVsaWFuaXNlQGdtYWlsLmNvbSIsInJvbCI6IkFkbWluaXN0cmF0aXZvIiwiaWF0IjoxNzYyMjcwNzIzLCJleHAiOjE3NjIyOTk1MjN9.upGlr-yPL_CyN9zsya3lasyNYKXUQMt4Zvyuqi-doCU',NULL,NULL,1,'2025-11-04 15:38:43','2025-11-04 23:38:43','2025-11-04 15:47:37'),(8,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJzYWludGFtb3VyZHVsaWFuaXNlQGdtYWlsLmNvbSIsInJvbCI6Ik3DqWRpY28iLCJpYXQiOjE3NjIyNzEyODUsImV4cCI6MTc2MjMwMDA4NX0.tsC45uKo-yvFTlp4IeMsyM1soxYhoyztVxYVALJ1hig',NULL,NULL,0,'2025-11-04 15:48:05','2025-11-04 15:55:57','2025-11-04 15:55:57'),(9,5,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJzZWNyZXRhcmlhQG1lZGlzdWl0ZS5jbCIsInJvbCI6Ik3DqWRpY28iLCJpYXQiOjE3NjIyNzE3ODMsImV4cCI6MTc2MjMwMDU4M30.1GEcNJu4otPXC22xD8ba3xa2Eq2-D4DFVfckP55-DK8',NULL,NULL,1,'2025-11-04 15:56:23','2025-11-04 23:56:23','2025-11-04 16:42:41'),(10,5,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJzZWNyZXRhcmlhQG1lZGlzdWl0ZS5jbCIsInJvbCI6Ik3DqWRpY28iLCJpYXQiOjE3NjIyNzQ2ODYsImV4cCI6MTc2MjMwMzQ4Nn0.TvwYsbUtC7f4o10ihv5gqt8v3rA408K6pnKy_k9FDc4',NULL,NULL,1,'2025-11-04 16:44:46','2025-11-05 00:44:46','2025-11-04 17:12:06'),(11,5,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJzZWNyZXRhcmlhQG1lZGlzdWl0ZS5jbCIsInJvbCI6Ik3DqWRpY28iLCJpYXQiOjE3NjIyNzYzNTMsImV4cCI6MTc2MjMwNTE1M30.gTzA1JnQfIJdmb_XxZ_VtQWvZt4__Hrgrn4SmGrm27g',NULL,NULL,1,'2025-11-04 17:12:33','2025-11-05 01:12:33','2025-11-04 17:12:33'),(12,5,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJzZWNyZXRhcmlhQG1lZGlzdWl0ZS5jbCIsInJvbCI6Ik3DqWRpY28iLCJpYXQiOjE3NjIyNzYzNzQsImV4cCI6MTc2MjMwNTE3NH0.wPqD-qJFJ794GwV19iJ4LS9nTKV-f6QvxUQXAe1iZcM',NULL,NULL,1,'2025-11-04 17:12:54','2025-11-05 01:12:54','2025-11-05 00:16:55'),(13,5,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJzZWNyZXRhcmlhQG1lZGlzdWl0ZS5jbCIsInJvbCI6Ik3DqWRpY28iLCJpYXQiOjE3NjIzMDE5MDQsImV4cCI6MTc2MjMzMDcwNH0.X6qXiVhoMRnSNbQ-KfsYCq4_yisNIK_Dzjrllm1XpYY',NULL,NULL,1,'2025-11-05 00:18:24','2025-11-05 08:18:24','2025-11-05 00:28:57'),(14,1,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJicmVub3JkcGV0ZXJseTIwMThAZ21haWwuY29tIiwicm9sIjoiTcOpZGljbyIsImlhdCI6MTc2MjMwMjIxNCwiZXhwIjoxNzYyMzMxMDE0fQ.4Jo5lVWNSvA1vzyFz6w1djXvFiJClUJ-E1JQ-MSSovM',NULL,NULL,1,'2025-11-05 00:23:34','2025-11-05 08:23:34','2025-11-05 00:23:34'),(15,1,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJicmVub3JkcGV0ZXJseTIwMThAZ21haWwuY29tIiwicm9sIjoiTcOpZGljbyIsImlhdCI6MTc2MjMwMjIzMSwiZXhwIjoxNzYyMzMxMDMxfQ.t_CL86ZsU4wB22eFTek5GDLlfIZYKgVDdvTKTSGzeuc',NULL,NULL,1,'2025-11-05 00:23:51','2025-11-05 08:23:51','2025-11-05 00:32:01'),(16,5,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJzZWNyZXRhcmlhQG1lZGlzdWl0ZS5jbCIsInJvbCI6Ik3DqWRpY28iLCJpYXQiOjE3NjIzMDI1NzQsImV4cCI6MTc2MjMzMTM3NH0.LWF5otSI1ZdIG8frOu47jFe1Q2Irgl4BrmL1RlXZmbU',NULL,NULL,1,'2025-11-05 00:29:34','2025-11-05 08:29:34','2025-11-05 03:04:14'),(17,5,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJzZWNyZXRhcmlhQG1lZGlzdWl0ZS5jbCIsInJvbCI6Ik3DqWRpY28iLCJpYXQiOjE3NjIzNTAwNzQsImV4cCI6MTc2MjM3ODg3NH0.f0A_Vyc6iDbEicm_3DQ_TBlto1_c3SELgVG8I41XsKA',NULL,NULL,1,'2025-11-05 13:41:14','2025-11-05 21:41:14','2025-11-05 16:24:09'),(18,5,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJzZWNyZXRhcmlhQG1lZGlzdWl0ZS5jbCIsInJvbCI6Ik3DqWRpY28iLCJpYXQiOjE3NjIzODE0MjQsImV4cCI6MTc2MjQxMDIyNH0.uoB0v3VN4YCo40y1BADeyvMhf7HPmZC0AYIa_OtxwHA',NULL,NULL,1,'2025-11-05 22:23:44','2025-11-06 06:23:44','2025-11-06 00:46:52'),(19,1,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJicmVub3JkcGV0ZXJseTIwMThAZ21haWwuY29tIiwicm9sIjoiTcOpZGljbyIsImlhdCI6MTc2MjM4OTU0OSwiZXhwIjoxNzYyNDE4MzQ5fQ.BG_JMdXYDPan9BO3HMb5eqo-D5ovL6-wgpImewG4QOo',NULL,NULL,1,'2025-11-06 00:39:09','2025-11-06 08:39:09','2025-11-06 00:39:35'),(20,1,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJicmVub3JkcGV0ZXJseTIwMThAZ21haWwuY29tIiwicm9sIjoiTcOpZGljbyIsImlhdCI6MTc2MjM4OTk2NywiZXhwIjoxNzYyNDE4NzY3fQ.kcE-UmEsJGC8gwAyC4kIHjO00idX73-ZHQEgP4Oc1vE',NULL,NULL,1,'2025-11-06 00:46:07','2025-11-06 08:46:07','2025-11-06 00:46:19'),(21,5,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJzZWNyZXRhcmlhQG1lZGlzdWl0ZS5jbCIsInJvbCI6Ik3DqWRpY28iLCJpYXQiOjE3NjIzOTAzNjMsImV4cCI6MTc2MjQxOTE2M30.cQ7k5g-tlF6ukiV5GKHn5viBDNo8pDEDIa9saSSA858',NULL,NULL,1,'2025-11-06 00:52:43','2025-11-06 08:52:43','2025-11-06 03:47:00'),(22,5,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJzZWNyZXRhcmlhQG1lZGlzdWl0ZS5jbCIsInJvbCI6Ik3DqWRpY28iLCJpYXQiOjE3NjI0MjczOTEsImV4cCI6MTc2MjQ1NjE5MX0.RX3brjE22xeACg2cPpZek6eHM28O6i9NRGAa5tbEi2I',NULL,NULL,1,'2025-11-06 11:09:51','2025-11-06 19:09:51','2025-11-06 18:44:44'),(23,5,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJzZWNyZXRhcmlhQG1lZGlzdWl0ZS5jbCIsInJvbCI6Ik3DqWRpY28iLCJpYXQiOjE3NjI0NjM1MzUsImV4cCI6MTc2MjQ5MjMzNX0.5xDtuTaoicCiaN8M28s_0wnutOOAG-dIrq_zxhqFVL4',NULL,NULL,1,'2025-11-06 21:12:15','2025-11-07 05:12:15','2025-11-07 00:30:48'),(24,5,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJzZWNyZXRhcmlhQG1lZGlzdWl0ZS5jbCIsInJvbCI6Ik3DqWRpY28iLCJpYXQiOjE3NjI0NzU1NzYsImV4cCI6MTc2MjUwNDM3Nn0.TJqqEaqyeXyiQT4jxkFL322J_pGqf5QgiRW4gw1r-8I',NULL,NULL,1,'2025-11-07 00:32:56','2025-11-07 08:32:56','2025-11-07 04:07:30'),(25,5,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJzZWNyZXRhcmlhQG1lZGlzdWl0ZS5jbCIsInJvbCI6Ik3DqWRpY28iLCJpYXQiOjE3NjI0ODg1NDMsImV4cCI6MTc2MjUxNzM0M30.MFUEwmAKIITPQaznrWmdu3IILMIp6QNwqlCCOi7DVLM',NULL,NULL,1,'2025-11-07 04:09:03','2025-11-07 12:09:03','2025-11-07 04:10:32');
/*!40000 ALTER TABLE `sesiones_usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `signos_vitales`
--

DROP TABLE IF EXISTS `signos_vitales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `signos_vitales` (
  `id_signo_vital` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente` int(10) unsigned NOT NULL,
  `id_historial` int(10) unsigned DEFAULT NULL,
  `fecha_medicion` datetime NOT NULL,
  `presion_sistolica` int(10) unsigned DEFAULT NULL,
  `presion_diastolica` int(10) unsigned DEFAULT NULL,
  `pulso` int(10) unsigned DEFAULT NULL,
  `frecuencia_respiratoria` int(10) unsigned DEFAULT NULL,
  `temperatura` decimal(3,1) DEFAULT NULL,
  `saturacion_oxigeno` int(10) unsigned DEFAULT NULL,
  `peso` decimal(5,2) DEFAULT NULL,
  `talla` decimal(5,2) DEFAULT NULL,
  `imc` decimal(5,2) DEFAULT NULL,
  `circunferencia_cintura` decimal(5,2) DEFAULT NULL,
  `dolor_eva` int(10) unsigned DEFAULT NULL,
  `glucemia` int(10) unsigned DEFAULT NULL,
  `estado_conciencia` varchar(50) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `registrado_por` int(10) unsigned NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `modificado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_signo_vital`),
  KEY `fk_signo_paciente_idx` (`id_paciente`),
  KEY `fk_signo_historial_idx` (`id_historial`),
  KEY `fk_signo_registrador_idx` (`registrado_por`),
  KEY `fk_signo_modificador_idx` (`modificado_por`),
  KEY `idx_signo_fecha` (`fecha_medicion`),
  CONSTRAINT `fk_signo_historial` FOREIGN KEY (`id_historial`) REFERENCES `historial_clinico` (`id_historial`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_signo_modificador` FOREIGN KEY (`modificado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_signo_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_signo_registrador` FOREIGN KEY (`registrado_por`) REFERENCES `usuarios` (`id_usuario`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro de signos vitales';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `signos_vitales`
--

LOCK TABLES `signos_vitales` WRITE;
/*!40000 ALTER TABLE `signos_vitales` DISABLE KEYS */;
INSERT INTO `signos_vitales` VALUES (1,22,NULL,'2025-11-06 22:21:18',70,120,123,NULL,33.0,45,434.00,56.00,999.99,NULL,NULL,NULL,NULL,NULL,5,'2025-11-07 01:21:18','2025-11-07 01:21:18',NULL);
/*!40000 ALTER TABLE `signos_vitales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sincronizaciones`
--

DROP TABLE IF EXISTS `sincronizaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sincronizaciones` (
  `id_sincronizacion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `id_integracion` int(10) unsigned NOT NULL,
  `tipo_sincronizacion` varchar(50) NOT NULL,
  `fecha_inicio` datetime NOT NULL,
  `fecha_fin` datetime DEFAULT NULL,
  `estado` enum('pendiente','en_proceso','completada','error','cancelada') NOT NULL DEFAULT 'pendiente',
  `resultado` varchar(255) DEFAULT NULL,
  `registros_procesados` int(10) unsigned NOT NULL DEFAULT 0,
  `registros_exitosos` int(10) unsigned NOT NULL DEFAULT 0,
  `registros_error` int(10) unsigned NOT NULL DEFAULT 0,
  `duracion_segundos` int(10) unsigned DEFAULT NULL,
  `log_detallado` text DEFAULT NULL,
  `errores_detalle` text DEFAULT NULL,
  `archivo_log_url` varchar(255) DEFAULT NULL,
  `iniciado_por` int(10) unsigned DEFAULT NULL,
  `es_automatica` tinyint(1) NOT NULL DEFAULT 0,
  `evento_origen` varchar(100) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_sincronizacion`),
  KEY `fk_sinc_centro_idx` (`id_centro`),
  KEY `fk_sinc_integracion_idx` (`id_integracion`),
  KEY `fk_sinc_iniciador_idx` (`iniciado_por`),
  KEY `idx_sinc_tipo` (`tipo_sincronizacion`),
  KEY `idx_sinc_fechas` (`fecha_inicio`,`fecha_fin`),
  KEY `idx_sinc_estado` (`estado`),
  KEY `idx_sinc_automatica` (`es_automatica`),
  KEY `idx_sinc_evento` (`evento_origen`),
  CONSTRAINT `fk_sinc_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_sinc_iniciador` FOREIGN KEY (`iniciado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_sinc_integracion` FOREIGN KEY (`id_integracion`) REFERENCES `integraciones_externas` (`id_integracion`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro de sincronizaciones';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sincronizaciones`
--

LOCK TABLES `sincronizaciones` WRITE;
/*!40000 ALTER TABLE `sincronizaciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `sincronizaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sucursales`
--

DROP TABLE IF EXISTS `sucursales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sucursales` (
  `id_sucursal` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `direccion` varchar(200) NOT NULL,
  `ciudad` varchar(100) NOT NULL,
  `region` varchar(100) NOT NULL,
  `codigo_postal` varchar(10) DEFAULT NULL,
  `telefono` varchar(20) NOT NULL,
  `email_contacto` varchar(100) NOT NULL,
  `responsable` varchar(100) NOT NULL,
  `horario_apertura` time NOT NULL,
  `horario_cierre` time NOT NULL,
  `dias_atencion` varchar(50) NOT NULL DEFAULT 'Lunes-Viernes',
  `capacidad_pacientes_dia` int(10) unsigned DEFAULT NULL,
  `estado` enum('activo','inactivo','en_construccion','cerrado_temporalmente') NOT NULL DEFAULT 'activo',
  `fecha_inicio_operacion` date NOT NULL,
  `superficie_m2` decimal(10,2) DEFAULT NULL,
  `cantidad_consultorios` int(10) unsigned DEFAULT NULL,
  `cantidad_salas_espera` int(10) unsigned DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_sucursal`),
  KEY `fk_sucursal_centro_idx` (`id_centro`),
  KEY `idx_sucursal_region_ciudad` (`region`,`ciudad`),
  KEY `idx_sucursal_estado` (`estado`),
  CONSTRAINT `fk_sucursal_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Sucursales de cada centro médico';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sucursales`
--

LOCK TABLES `sucursales` WRITE;
/*!40000 ALTER TABLE `sucursales` DISABLE KEYS */;
INSERT INTO `sucursales` VALUES (1,1,'Sucursal Central Curicó','Av. España 456','Curicó','Región del Maule',NULL,'+56 75 2233445','central@medisuite.cl','Dr. Carlos Soto','08:00:00','17:00:00','Lunes-Viernes',NULL,'activo','2024-01-10',NULL,NULL,NULL,'2025-10-27 02:19:39','2025-10-27 02:19:39');
/*!40000 ALTER TABLE `sucursales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tecnicos`
--

DROP TABLE IF EXISTS `tecnicos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tecnicos` (
  `id_tecnico` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_usuario` int(10) unsigned NOT NULL,
  `id_centro` int(10) unsigned NOT NULL,
  `id_sucursal` int(10) unsigned DEFAULT NULL,
  `area_tecnica` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `nivel_acceso` enum('basico','intermedio','avanzado','administrador') NOT NULL DEFAULT 'basico',
  `extension_telefonica` varchar(10) DEFAULT NULL,
  `estado` enum('activo','inactivo','suspendido') NOT NULL DEFAULT 'activo',
  `supervisor_id` int(10) unsigned DEFAULT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_termino` date DEFAULT NULL,
  `especialidad_tecnica` varchar(100) DEFAULT NULL,
  `certificaciones` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_tecnico`),
  UNIQUE KEY `idx_tecnico_usuario` (`id_usuario`),
  KEY `fk_tecnico_centro_idx` (`id_centro`),
  KEY `fk_tecnico_sucursal_idx` (`id_sucursal`),
  KEY `fk_tecnico_supervisor_idx` (`supervisor_id`),
  KEY `idx_tecnico_estado` (`estado`),
  KEY `idx_tecnico_area` (`area_tecnica`),
  CONSTRAINT `fk_tecnico_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_tecnico_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursales` (`id_sucursal`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_tecnico_supervisor` FOREIGN KEY (`supervisor_id`) REFERENCES `administrativos` (`id_administrativo`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_tecnico_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Personal técnico de cada centro';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tecnicos`
--

LOCK TABLES `tecnicos` WRITE;
/*!40000 ALTER TABLE `tecnicos` DISABLE KEYS */;
INSERT INTO `tecnicos` VALUES (1,2,1,NULL,'Soporte Informático',NULL,'basico',NULL,'activo',NULL,'2023-04-15',NULL,NULL,NULL,'2025-10-27 02:20:37','2025-10-27 02:20:37');
/*!40000 ALTER TABLE `tecnicos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `telemedicina_configuraciones`
--

DROP TABLE IF EXISTS `telemedicina_configuraciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `telemedicina_configuraciones` (
  `id_configuracion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `id_medico` int(10) unsigned DEFAULT NULL,
  `prefijo_sala` varchar(50) NOT NULL DEFAULT 'med',
  `zona_horaria` varchar(100) NOT NULL DEFAULT 'America/Santiago',
  `nivel_seguridad` enum('normal','alto','maximo') NOT NULL DEFAULT 'alto',
  `calidad_video_default` varchar(20) DEFAULT 'HD',
  `grabacion_automatica` tinyint(1) DEFAULT 0,
  `duracion_sesion_default` int(11) DEFAULT 30 COMMENT 'Minutos',
  `tiempo_buffer_entre_sesiones` int(10) unsigned NOT NULL DEFAULT 10,
  `proveedor_servicio` varchar(100) NOT NULL,
  `proveedor_servicio_backup` varchar(100) DEFAULT NULL,
  `api_key` varchar(255) DEFAULT NULL,
  `api_secret` varchar(255) DEFAULT NULL,
  `cuenta_id` varchar(100) DEFAULT NULL,
  `configuracion_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`configuracion_json`)),
  `consulta_telemedicina_habilitada` tinyint(1) NOT NULL DEFAULT 1,
  `requerir_consentimiento` tinyint(1) NOT NULL DEFAULT 1,
  `id_plantilla_consentimiento` int(10) unsigned DEFAULT NULL,
  `forzar_2fa_acceso` tinyint(1) NOT NULL DEFAULT 0,
  `politica_encriptacion` enum('auto','e2ee','hipaa') NOT NULL DEFAULT 'auto',
  `auditoria_detallada` tinyint(1) NOT NULL DEFAULT 1,
  `tiempo_espera_minutos` int(10) unsigned NOT NULL DEFAULT 15,
  `sala_espera_virtual` tinyint(1) NOT NULL DEFAULT 1,
  `sala_espera_media_url` varchar(255) DEFAULT NULL,
  `mensaje_sala_espera` varchar(255) DEFAULT NULL,
  `permitir_autotest_dispositivo` tinyint(1) NOT NULL DEFAULT 1,
  `recordatorio_minutos_antes` int(10) unsigned NOT NULL DEFAULT 10,
  `enviar_recordatorios` tinyint(1) NOT NULL DEFAULT 1,
  `reintentos_notificacion` tinyint(3) unsigned NOT NULL DEFAULT 3,
  `prioridad_notificacion` enum('email','sms','ambos') NOT NULL DEFAULT 'email',
  `minutos_recordatorio` int(10) unsigned NOT NULL DEFAULT 30,
  `notificar_por_email` tinyint(1) NOT NULL DEFAULT 1,
  `notificar_por_sms` tinyint(1) NOT NULL DEFAULT 0,
  `webhook_eventos` varchar(255) DEFAULT NULL,
  `webhook_eventos_secundario` varchar(255) DEFAULT NULL,
  `publicar_en_portal_paciente` tinyint(1) NOT NULL DEFAULT 1,
  `branding_logo_url` varchar(255) DEFAULT NULL,
  `branding_color_primario` varchar(20) DEFAULT NULL,
  `idioma_interfaz` varchar(10) NOT NULL DEFAULT 'es',
  `idioma_paciente_preferido` varchar(10) DEFAULT NULL,
  `max_participantes` int(10) unsigned NOT NULL DEFAULT 2,
  `compartir_pantalla_habilitado` tinyint(1) NOT NULL DEFAULT 1,
  `chat_habilitado` tinyint(1) NOT NULL DEFAULT 1,
  `permitir_chat_seguro` tinyint(1) NOT NULL DEFAULT 1,
  `permitir_telefono_respaldo` tinyint(1) NOT NULL DEFAULT 1,
  `telefono_respaldo_numero` varchar(30) DEFAULT NULL,
  `permite_grabacion` tinyint(1) NOT NULL DEFAULT 0,
  `retencion_grabaciones_dias` int(10) unsigned NOT NULL DEFAULT 90,
  `visibilidad_grabacion` enum('solo_medico','medico_paciente','equipo_clinico') NOT NULL DEFAULT 'solo_medico',
  `transcripcion_automatica` tinyint(1) NOT NULL DEFAULT 0,
  `guardar_transcripcion` tinyint(1) NOT NULL DEFAULT 0,
  `generar_resumen_ia` tinyint(1) NOT NULL DEFAULT 0,
  `idioma_resumen_ia` varchar(10) DEFAULT NULL,
  `proveedor_ia` varchar(50) DEFAULT NULL,
  `precio_consulta_telemedicina` decimal(10,2) NOT NULL DEFAULT 0.00,
  `horario_atencion` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`horario_atencion`)),
  `dias_disponibles` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`dias_disponibles`)),
  `configuracion_avanzada` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`configuracion_avanzada`)),
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `modo_mantenimiento` tinyint(1) NOT NULL DEFAULT 0,
  `motivo_mantenimiento` varchar(255) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id_configuracion`),
  KEY `fk_teleconfig_centro_idx` (`id_centro`),
  KEY `fk_teleconfig_medico_idx` (`id_medico`),
  KEY `fk_teleconfig_creador_idx` (`creado_por`),
  KEY `idx_teleconfig_proveedor` (`proveedor_servicio`),
  KEY `idx_teleconfig_activo` (`activo`),
  CONSTRAINT `fk_teleconfig_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_teleconfig_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON UPDATE CASCADE,
  CONSTRAINT `fk_teleconfig_medico` FOREIGN KEY (`id_medico`) REFERENCES `medicos` (`id_medico`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Configuraciones específicas de telemedicina';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `telemedicina_configuraciones`
--

LOCK TABLES `telemedicina_configuraciones` WRITE;
/*!40000 ALTER TABLE `telemedicina_configuraciones` DISABLE KEYS */;
INSERT INTO `telemedicina_configuraciones` VALUES (1,0,9,'med','America/Santiago','alto','HD',0,30,10,'',NULL,NULL,NULL,NULL,NULL,1,1,NULL,0,'auto',1,15,1,NULL,NULL,1,10,1,3,'email',30,1,0,NULL,NULL,1,NULL,NULL,'es',NULL,2,1,1,1,1,NULL,0,90,'solo_medico',0,0,0,NULL,NULL,0.00,NULL,NULL,NULL,1,0,NULL,'2025-11-04 14:48:43','2025-11-04 14:48:43',0),(2,1,9,'med','America/Santiago','alto','HD',0,30,10,'agora',NULL,NULL,NULL,NULL,'{\"prefijo_sala\":\"med\",\"zona_horaria\":\"America/Santiago\",\"nivel_seguridad\":\"alto\",\"calidad_video\":\"HD\",\"webhook_eventos\":\"\",\"webhook_eventos_secundario\":\"\",\"idioma_interfaz\":\"es\",\"idioma_paciente_preferido\":null,\"horario_atencion\":{},\"dias_disponibles\":{},\"configuracion_avanzada\":{}}',1,1,NULL,0,'auto',1,15,1,NULL,NULL,1,30,1,3,'email',30,1,0,NULL,NULL,1,NULL,NULL,'es',NULL,2,1,1,1,1,NULL,0,90,'solo_medico',0,0,0,NULL,NULL,0.00,'{}','{}','{}',1,0,NULL,'2025-11-04 14:49:35','2025-11-06 22:16:07',5);
/*!40000 ALTER TABLE `telemedicina_configuraciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `telemedicina_dispositivos`
--

DROP TABLE IF EXISTS `telemedicina_dispositivos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `telemedicina_dispositivos` (
  `id_dispositivo` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `id_sucursal` int(10) unsigned DEFAULT NULL,
  `id_sesion` int(10) unsigned DEFAULT NULL,
  `id_usuario` int(10) unsigned DEFAULT NULL,
  `tipo_dispositivo` varchar(50) DEFAULT NULL COMMENT 'desktop, mobile, tablet',
  `navegador` varchar(100) DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `estado_conexion` enum('conectado','desconectado','reconectando') DEFAULT 'desconectado',
  `nombre` varchar(100) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `marca` varchar(50) DEFAULT NULL,
  `modelo` varchar(50) DEFAULT NULL,
  `numero_serie` varchar(50) DEFAULT NULL,
  `fecha_adquisicion` date DEFAULT NULL,
  `ip` varchar(45) DEFAULT NULL,
  `mac_address` varchar(17) DEFAULT NULL,
  `sistema_operativo` varchar(50) DEFAULT NULL,
  `version_sistema` varchar(20) DEFAULT NULL,
  `ubicacion` varchar(100) DEFAULT NULL,
  `proposito` text DEFAULT NULL,
  `estado` enum('activo','inactivo','mantenimiento','averiado') NOT NULL DEFAULT 'activo',
  `responsable_id` int(10) unsigned DEFAULT NULL,
  `fecha_ultimo_mantenimiento` date DEFAULT NULL,
  `fecha_proximo_mantenimiento` date DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `fecha_conexion` timestamp NULL DEFAULT NULL,
  `fecha_desconexion` timestamp NULL DEFAULT NULL,
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_dispositivo`),
  KEY `fk_dispositivo_centro_idx` (`id_centro`),
  KEY `fk_dispositivo_sucursal_idx` (`id_sucursal`),
  KEY `fk_dispositivo_responsable_idx` (`responsable_id`),
  KEY `fk_dispositivo_creador_idx` (`creado_por`),
  KEY `idx_dispositivo_tipo` (`tipo`),
  KEY `idx_dispositivo_estado` (`estado`),
  KEY `idx_dispositivo_mantenimiento` (`fecha_proximo_mantenimiento`),
  KEY `idx_sesion_estado` (`id_sesion`,`estado_conexion`),
  KEY `fk_tele_disp_usuario` (`id_usuario`),
  CONSTRAINT `fk_dispositivo_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_dispositivo_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_dispositivo_responsable` FOREIGN KEY (`responsable_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_dispositivo_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursales` (`id_sucursal`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_tele_disp_sesion` FOREIGN KEY (`id_sesion`) REFERENCES `telemedicina_sesiones` (`id_sesion`) ON DELETE CASCADE,
  CONSTRAINT `fk_tele_disp_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Dispositivos compatibles para telemedicina';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `telemedicina_dispositivos`
--

LOCK TABLES `telemedicina_dispositivos` WRITE;
/*!40000 ALTER TABLE `telemedicina_dispositivos` DISABLE KEYS */;
/*!40000 ALTER TABLE `telemedicina_dispositivos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `telemedicina_enlaces`
--

DROP TABLE IF EXISTS `telemedicina_enlaces`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `telemedicina_enlaces` (
  `id_enlace` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_sesion` int(10) unsigned NOT NULL,
  `id_usuario` int(10) unsigned NOT NULL,
  `tipo_usuario` enum('medico','paciente') NOT NULL,
  `tipo_enlace` enum('paciente','medico','invitado','especialista') NOT NULL,
  `token` varchar(255) NOT NULL,
  `token_acceso` varchar(255) NOT NULL,
  `url_acceso` varchar(255) NOT NULL,
  `fecha_generacion` datetime NOT NULL,
  `fecha_expiracion` datetime NOT NULL,
  `acceso_unico` tinyint(1) NOT NULL DEFAULT 0,
  `utilizado` tinyint(1) NOT NULL DEFAULT 0,
  `usado` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_uso` datetime DEFAULT NULL,
  `ip_uso` varchar(45) DEFAULT NULL,
  `ip_acceso` varchar(50) DEFAULT NULL,
  `agente_usuario_uso` varchar(255) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `estado` enum('activo','expirado','utilizado','revocado') NOT NULL DEFAULT 'activo',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_enlace`),
  UNIQUE KEY `idx_enlace_token_unique` (`token_acceso`),
  KEY `fk_enlace_sesion_idx` (`id_sesion`),
  KEY `fk_enlace_creador_idx` (`creado_por`),
  KEY `idx_enlace_tipo` (`tipo_enlace`),
  KEY `idx_enlace_expiracion` (`fecha_expiracion`),
  KEY `idx_enlace_estado` (`estado`),
  KEY `idx_token` (`token_acceso`),
  KEY `idx_sesion` (`id_sesion`),
  KEY `idx_enlaces_sesion` (`id_sesion`),
  KEY `idx_enlaces_usuario` (`id_usuario`,`tipo_usuario`),
  KEY `idx_enlaces_expiracion` (`fecha_expiracion`),
  KEY `idx_enlaces_usado` (`usado`),
  CONSTRAINT `fk_enlace_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_enlace_sesion` FOREIGN KEY (`id_sesion`) REFERENCES `telemedicina_sesiones` (`id_sesion`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_telemedicina_enlaces_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Enlaces para sesiones de telemedicina';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `telemedicina_enlaces`
--

LOCK TABLES `telemedicina_enlaces` WRITE;
/*!40000 ALTER TABLE `telemedicina_enlaces` DISABLE KEYS */;
INSERT INTO `telemedicina_enlaces` VALUES (1,3,5,'medico','paciente','','sala_1762271941174_840b47f4763fe9aece194c0f969bf688','','2025-11-04 12:59:01','2025-11-05 12:59:01',0,0,0,NULL,NULL,NULL,NULL,NULL,'activo','2025-11-04 15:59:01',NULL),(22,3,5,'medico','paciente','','sala_1762276545984_584b23a848583b08650e6b01178d53fa','','2025-11-04 14:15:46','2025-11-05 14:15:46',0,0,0,NULL,NULL,NULL,NULL,NULL,'activo','2025-11-04 17:15:46',NULL),(23,3,5,'medico','paciente','','sala_1762276545979_00c0590f114538fdab5fb817f4051d23','','2025-11-04 14:15:46','2025-11-05 14:15:46',0,0,0,NULL,NULL,NULL,NULL,NULL,'activo','2025-11-04 17:15:46',NULL),(24,3,5,'medico','paciente','','sala_1762276545990_6d0905f758d389c32122e6615ed78a52','','2025-11-04 14:15:46','2025-11-05 14:15:46',0,0,0,NULL,NULL,NULL,NULL,NULL,'activo','2025-11-04 17:15:46',NULL),(25,3,5,'medico','paciente','','sala_1762276545988_8c4f4947e34b306423d4969c41858df8','','2025-11-04 14:15:46','2025-11-05 14:15:46',0,0,0,NULL,NULL,NULL,NULL,NULL,'activo','2025-11-04 17:15:46',NULL),(26,3,5,'medico','paciente','','sala_1762276545994_b5ee60cfca663af6f40b65ac322f4313','','2025-11-04 14:15:46','2025-11-05 14:15:46',0,0,0,NULL,NULL,NULL,NULL,NULL,'activo','2025-11-04 17:15:46',NULL),(27,3,5,'medico','paciente','','sala_1762276546141_c881e284065f08431b8de8a11f52c644','','2025-11-04 14:15:46','2025-11-05 14:15:46',0,0,0,NULL,NULL,NULL,NULL,NULL,'activo','2025-11-04 17:15:46',NULL),(28,3,5,'medico','paciente','','sala_1762276546627_0ef73051475377988343d25fe35761dd','','2025-11-04 14:15:46','2025-11-05 14:15:46',0,0,0,NULL,NULL,NULL,NULL,NULL,'activo','2025-11-04 17:15:46',NULL),(29,3,5,'medico','paciente','','sala_1762276546756_7a735e01e223a068f6f5a4b577237845','','2025-11-04 14:15:46','2025-11-05 14:15:46',0,0,0,NULL,NULL,NULL,NULL,NULL,'activo','2025-11-04 17:15:46',NULL),(30,3,5,'medico','paciente','','sala_1762276546758_be059b9726607fef77d17a9dcb53fb07','','2025-11-04 14:15:46','2025-11-05 14:15:46',0,0,0,NULL,NULL,NULL,NULL,NULL,'activo','2025-11-04 17:15:46',NULL),(31,3,5,'medico','paciente','','sala_1762276546760_2e401e5506cbcd87b0fe7b142885f927','','2025-11-04 14:15:46','2025-11-05 14:15:46',0,0,0,NULL,NULL,NULL,NULL,NULL,'activo','2025-11-04 17:15:46',NULL),(32,3,5,'medico','paciente','','sala_1762276546762_83a3dc8138cd333d4bf0718116a93cb9','','2025-11-04 14:15:46','2025-11-05 14:15:46',0,0,0,NULL,NULL,NULL,NULL,NULL,'activo','2025-11-04 17:15:46',NULL),(33,3,5,'medico','paciente','','sala_1762276546946_480e249e13521813d81af2553e5dee8c','','2025-11-04 14:15:46','2025-11-05 14:15:46',0,0,0,NULL,NULL,NULL,NULL,NULL,'activo','2025-11-04 17:15:46',NULL),(34,3,5,'medico','paciente','','sala_1762276547058_b1fa60778d9327475079bffe3b680ea5','','2025-11-04 14:15:47','2025-11-05 14:15:47',0,0,0,NULL,NULL,NULL,NULL,NULL,'activo','2025-11-04 17:15:47',NULL),(35,3,5,'medico','paciente','','sala_1762276559804_8c6b5a3246fb701fa2ac7c22467413e0','','2025-11-04 14:15:59','2025-11-05 14:15:59',0,0,0,NULL,NULL,NULL,NULL,NULL,'activo','2025-11-04 17:15:59',NULL),(36,3,5,'medico','paciente','','sala_1762276597879_c6b584723583780774f6d5208dbe2a86','','2025-11-04 14:16:37','2025-11-05 14:16:37',0,0,0,NULL,NULL,NULL,NULL,NULL,'activo','2025-11-04 17:16:37',NULL),(37,3,5,'medico','paciente','','sala_1762276643245_24842327bc2c315b32e20bee7cfde466','','2025-11-04 14:17:23','2025-11-05 14:17:23',0,0,0,NULL,NULL,NULL,NULL,NULL,'activo','2025-11-04 17:17:23',NULL),(38,3,5,'medico','paciente','','sala_1762276783553_1963570f9316e9d035ef73eb5459b144','','2025-11-04 14:19:43','2025-11-05 14:19:43',0,0,0,NULL,NULL,NULL,NULL,NULL,'activo','2025-11-04 17:19:43',NULL),(39,3,5,'medico','paciente','','sala_1762276956368_bbec60d44060fad09cb7f2dc7946412f','','2025-11-04 14:22:36','2025-11-05 14:22:36',0,0,0,NULL,NULL,NULL,NULL,NULL,'activo','2025-11-04 17:22:36',NULL),(40,3,5,'medico','paciente','','sala_1762282940061_21db689d6b571f6d7d26f4610b70c1c4','','2025-11-04 16:02:20','2025-11-05 16:02:20',0,0,0,NULL,NULL,NULL,NULL,NULL,'activo','2025-11-04 19:02:20',NULL),(41,3,5,'medico','paciente','','sala_1762293612408_8b63830a1929040258fa8564554c487b','','2025-11-04 19:00:12','2025-11-05 19:00:12',0,0,0,NULL,NULL,NULL,NULL,NULL,'activo','2025-11-04 22:00:12',NULL),(42,3,5,'medico','paciente','','sala_1762294785415_7b1684f621b44cbc04c30b5f3d7967a8','','2025-11-04 19:19:45','2025-11-05 19:19:45',0,0,0,NULL,NULL,NULL,NULL,NULL,'activo','2025-11-04 22:19:45',NULL),(43,4,5,'medico','paciente','','sala_1762295988605_6d57deb092ae5121fa4dcdb7fbe32f9c','','2025-11-04 19:39:48','2025-11-05 19:39:48',0,0,0,NULL,NULL,NULL,NULL,NULL,'activo','2025-11-04 22:39:48',NULL),(44,7,5,'medico','paciente','','sala_1762302795563_df4a484dad34fec06c49442526761007','','2025-11-04 21:33:15','2025-11-05 21:33:15',0,0,0,NULL,NULL,NULL,NULL,NULL,'activo','2025-11-05 00:33:15',NULL),(45,7,5,'medico','paciente','','sala_1762303762752_5a4d984b9b40d002fedddf60dc419189','','2025-11-04 21:49:22','2025-11-05 21:49:22',0,0,0,NULL,NULL,NULL,NULL,NULL,'activo','2025-11-05 00:49:22',NULL),(46,8,5,'medico','paciente','','sala_1762304279690_6d337f8578feda64b6142461814a5b40','','2025-11-04 21:57:59','2025-11-05 21:57:59',0,0,0,NULL,NULL,NULL,NULL,NULL,'activo','2025-11-05 00:57:59',NULL),(47,8,5,'medico','paciente','','sala_1762350188475_dccba4e2507f1854f21e22a2e8342149','','2025-11-05 10:43:08','2025-11-06 10:43:08',0,0,0,NULL,NULL,NULL,NULL,NULL,'activo','2025-11-05 13:43:08',NULL),(48,7,5,'medico','paciente','','sala_1762350925791_dbff10bc26fae868519450e550d87b1c','','2025-11-05 10:55:25','2025-11-06 10:55:25',0,0,0,NULL,NULL,NULL,NULL,NULL,'activo','2025-11-05 13:55:25',NULL),(49,8,5,'medico','paciente','','sala_1762354227577_a7fd4baaeece63cbc83e50b2f7b5fda5','','2025-11-05 11:50:27','2025-11-06 11:50:27',0,0,0,NULL,NULL,NULL,NULL,NULL,'activo','2025-11-05 14:50:27',NULL),(50,7,5,'medico','paciente','','sala_1762356824511_150563a697ee255bf55c2b5afd9ea390','','2025-11-05 12:33:44','2025-11-06 12:33:44',0,0,0,NULL,NULL,NULL,NULL,NULL,'activo','2025-11-05 15:33:44',NULL),(51,8,5,'medico','paciente','','sala_1762384556463_90a56f8bfc7076af259b1931e89375dc','','2025-11-05 20:15:56','2025-11-06 20:15:56',0,0,0,NULL,NULL,NULL,NULL,NULL,'activo','2025-11-05 23:15:56',NULL),(65,17,26,'paciente','paciente','652a016d652ec1d2c2c8d458e3321759a47fa367','652a016d652ec1d2c2c8d458e3321759a47fa367','http://localhost:3000/telemedicina/sala/652a016d652ec1d2c2c8d458e3321759a47fa367','2025-11-06 22:08:22','2025-11-07 00:08:22',1,0,0,NULL,NULL,NULL,NULL,NULL,'activo','2025-11-07 01:08:22',5),(66,17,5,'medico','medico','877233658e51c32ee0d36034749a77685b3fe18b','877233658e51c32ee0d36034749a77685b3fe18b','http://localhost:3000/telemedicina/sala/877233658e51c32ee0d36034749a77685b3fe18b','2025-11-06 22:08:22','2025-11-07 00:08:22',1,0,0,NULL,NULL,NULL,NULL,NULL,'activo','2025-11-07 01:08:22',5),(67,17,5,'medico','paciente','','sala_1762478170895_680997cc06ce497261faac07ff37ed78','','2025-11-06 22:16:10','2025-11-07 22:16:10',0,0,0,NULL,NULL,NULL,NULL,NULL,'activo','2025-11-07 01:16:10',NULL);
/*!40000 ALTER TABLE `telemedicina_enlaces` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `telemedicina_grabaciones`
--

DROP TABLE IF EXISTS `telemedicina_grabaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `telemedicina_grabaciones` (
  `id_grabacion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_sesion` int(10) unsigned NOT NULL,
  `url_grabacion` varchar(255) NOT NULL,
  `fecha_inicio_grabacion` datetime NOT NULL,
  `fecha_fin_grabacion` datetime NOT NULL,
  `duracion_segundos` int(10) unsigned NOT NULL,
  `tamano_bytes` bigint(20) unsigned DEFAULT NULL,
  `formato` varchar(20) DEFAULT NULL,
  `estado` enum('procesando','disponible','error','eliminada') NOT NULL DEFAULT 'procesando',
  `consentimiento_paciente` tinyint(1) NOT NULL DEFAULT 0,
  `id_consentimiento` int(10) unsigned DEFAULT NULL,
  `periodo_retencion_dias` int(10) unsigned NOT NULL DEFAULT 90,
  `fecha_eliminacion_programada` date DEFAULT NULL,
  `motivo_grabacion` text DEFAULT NULL,
  `acceso_paciente` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_grabacion`),
  KEY `fk_grabacion_sesion_idx` (`id_sesion`),
  KEY `fk_grabacion_consentimiento_idx` (`id_consentimiento`),
  KEY `fk_grabacion_creador_idx` (`creado_por`),
  KEY `idx_grabacion_estado` (`estado`),
  KEY `idx_grabacion_consentimiento` (`consentimiento_paciente`),
  KEY `idx_grabacion_eliminacion` (`fecha_eliminacion_programada`),
  CONSTRAINT `fk_grabacion_consentimiento` FOREIGN KEY (`id_consentimiento`) REFERENCES `consentimientos` (`id_consentimiento`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_grabacion_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_grabacion_sesion` FOREIGN KEY (`id_sesion`) REFERENCES `telemedicina_sesiones` (`id_sesion`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Grabaciones de sesiones de telemedicina';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `telemedicina_grabaciones`
--

LOCK TABLES `telemedicina_grabaciones` WRITE;
/*!40000 ALTER TABLE `telemedicina_grabaciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `telemedicina_grabaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `telemedicina_proveedores`
--

DROP TABLE IF EXISTS `telemedicina_proveedores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `telemedicina_proveedores` (
  `id_proveedor` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `codigo` varchar(100) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `api_base_url` varchar(255) DEFAULT NULL,
  `panel_url` varchar(255) DEFAULT NULL,
  `requiere_api_key` tinyint(1) NOT NULL DEFAULT 0,
  `doc_url` varchar(255) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `caracteristicas` text DEFAULT NULL,
  `es_default` tinyint(1) NOT NULL DEFAULT 0,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado_por` int(10) unsigned DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_proveedor`),
  UNIQUE KEY `uk_teleprov_codigo` (`codigo`),
  KEY `idx_teleprov_activo` (`activo`),
  KEY `idx_teleprov_default` (`es_default`),
  KEY `fk_teleprov_creado_por_idx` (`creado_por`),
  CONSTRAINT `fk_teleprov_creado_por` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Catálogo de proveedores de telemedicina para la plataforma';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `telemedicina_proveedores`
--

LOCK TABLES `telemedicina_proveedores` WRITE;
/*!40000 ALTER TABLE `telemedicina_proveedores` DISABLE KEYS */;
INSERT INTO `telemedicina_proveedores` VALUES (1,'anyssa_video','Anyssa Video Conference','Proveedor nativo optimizado para la plataforma',NULL,NULL,0,NULL,'from-indigo-500 to-blue-600','[\"Por defecto\",\"Baja latencia\",\"Nativo\"]',1,1,1,'2025-11-06 21:59:20','2025-11-06 21:59:20'),(2,'jitsi','Jitsi Meet','Open source seguro',NULL,NULL,0,NULL,'from-blue-500 to-cyan-600','[\"Seguro\",\"Gratuito\",\"HIPAA\"]',0,1,1,'2025-11-06 21:59:20','2025-11-06 21:59:20'),(3,'daily','Daily.co','Alto rendimiento WebRTC',NULL,NULL,0,NULL,'from-purple-500 to-fuchsia-600','[\"WebRTC\",\"Baja latencia\",\"API\"]',0,1,1,'2025-11-06 21:59:20','2025-11-06 21:59:20'),(4,'agora','Agora.io','Calidad premium global',NULL,NULL,0,NULL,'from-emerald-500 to-teal-600','[\"4K\",\"Global\",\"IA\"]',0,1,1,'2025-11-06 21:59:20','2025-11-06 21:59:20');
/*!40000 ALTER TABLE `telemedicina_proveedores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `telemedicina_salas_virtuales`
--

DROP TABLE IF EXISTS `telemedicina_salas_virtuales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `telemedicina_salas_virtuales` (
  `id_sala_virtual` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `id_medico` int(10) unsigned DEFAULT NULL,
  `nombre` varchar(100) NOT NULL,
  `codigo_acceso` varchar(20) NOT NULL,
  `url_sala` varchar(255) NOT NULL,
  `tipo` enum('consulta','procedimiento','reunion','capacitacion') NOT NULL,
  `capacidad_maxima` int(10) unsigned NOT NULL DEFAULT 5,
  `proveedor_servicio` varchar(100) NOT NULL,
  `configuracion_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`configuracion_json`)),
  `sala_persistente` tinyint(1) NOT NULL DEFAULT 0,
  `sala_privada` tinyint(1) NOT NULL DEFAULT 1,
  `requiere_autenticacion` tinyint(1) NOT NULL DEFAULT 1,
  `estado` enum('activa','inactiva','en_uso','mantenimiento') NOT NULL DEFAULT 'activa',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id_sala_virtual`),
  UNIQUE KEY `idx_sala_virtual_codigo` (`codigo_acceso`),
  KEY `fk_salavirtual_centro_idx` (`id_centro`),
  KEY `fk_salavirtual_medico_idx` (`id_medico`),
  KEY `fk_salavirtual_creador_idx` (`creado_por`),
  KEY `idx_salavirtual_tipo` (`tipo`),
  KEY `idx_salavirtual_estado` (`estado`),
  KEY `idx_salavirtual_proveedor` (`proveedor_servicio`),
  CONSTRAINT `fk_salavirtual_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_salavirtual_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON UPDATE CASCADE,
  CONSTRAINT `fk_salavirtual_medico` FOREIGN KEY (`id_medico`) REFERENCES `medicos` (`id_medico`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Salas virtuales disponibles para telemedicina';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `telemedicina_salas_virtuales`
--

LOCK TABLES `telemedicina_salas_virtuales` WRITE;
/*!40000 ALTER TABLE `telemedicina_salas_virtuales` DISABLE KEYS */;
/*!40000 ALTER TABLE `telemedicina_salas_virtuales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `telemedicina_sesiones`
--

DROP TABLE IF EXISTS `telemedicina_sesiones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `telemedicina_sesiones` (
  `id_sesion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_cita` int(10) unsigned DEFAULT NULL,
  `id_paciente` int(10) unsigned NOT NULL,
  `id_medico` int(10) unsigned NOT NULL,
  `token_acceso` varchar(255) NOT NULL,
  `url_sesion` varchar(255) NOT NULL,
  `estado` enum('programada','en_espera','en_curso','finalizada','cancelada','no_asistio','problema_tecnico') NOT NULL DEFAULT 'programada',
  `fecha_hora_inicio_programada` datetime NOT NULL,
  `fecha_hora_fin_programada` datetime NOT NULL,
  `fecha_hora_inicio_real` datetime DEFAULT NULL,
  `fecha_hora_fin_real` datetime DEFAULT NULL,
  `duracion_segundos` int(10) unsigned DEFAULT NULL,
  `proveedor_servicio` varchar(100) NOT NULL,
  `id_sala_virtual` varchar(100) DEFAULT NULL,
  `calidad_conexion` enum('excelente','buena','regular','mala','muy_mala') DEFAULT NULL,
  `dispositivo_paciente` varchar(255) DEFAULT NULL,
  `navegador_paciente` varchar(255) DEFAULT NULL,
  `ip_paciente` varchar(45) DEFAULT NULL,
  `notas_tecnicas` text DEFAULT NULL,
  `grabacion_autorizada` tinyint(1) NOT NULL DEFAULT 0,
  `telefono_paciente` varchar(50) DEFAULT NULL,
  `email_paciente` varchar(150) DEFAULT NULL,
  `ubicacion_paciente` varchar(255) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `url_grabacion` varchar(255) DEFAULT NULL,
  `evaluacion_paciente` int(10) unsigned DEFAULT NULL,
  `evaluacion_medico` int(10) unsigned DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_sesion`),
  UNIQUE KEY `idx_sesion_token` (`token_acceso`),
  KEY `fk_sesion_cita_idx` (`id_cita`),
  KEY `fk_sesion_paciente_idx` (`id_paciente`),
  KEY `fk_sesion_medico_idx` (`id_medico`),
  KEY `idx_sesion_estado` (`estado`),
  KEY `idx_sesion_inicio_prog` (`fecha_hora_inicio_programada`),
  KEY `idx_sesion_fin_prog` (`fecha_hora_fin_programada`),
  KEY `idx_tmsesion_idcita` (`id_cita`),
  CONSTRAINT `fk_sesion_medico` FOREIGN KEY (`id_medico`) REFERENCES `medicos` (`id_medico`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_sesion_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_tmsesion_idcita_v1` FOREIGN KEY (`id_cita`) REFERENCES `citas` (`id_cita`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Sesiones de telemedicina';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `telemedicina_sesiones`
--

LOCK TABLES `telemedicina_sesiones` WRITE;
/*!40000 ALTER TABLE `telemedicina_sesiones` DISABLE KEYS */;
INSERT INTO `telemedicina_sesiones` VALUES (1,NULL,1,1,'','','en_curso','2025-11-01 13:00:00','2025-11-15 13:30:00','2025-11-04 21:53:36',NULL,0,'Zoom',NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-01 21:44:44','2025-11-05 00:53:36'),(2,NULL,2,1,'st86v5dnszwxnbfa24lh','/telemedicina/join/st86v5dnszwxnbfa24lh','programada','2025-11-01 18:56:00','2025-11-01 22:00:00',NULL,NULL,NULL,'Zoom',NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-01 21:57:11','2025-11-01 21:57:11'),(3,6,19,9,'sala_1762294785415_7b1684f621b44cbc04c30b5f3d7967a8','/medico/telemedicina/sala/video?token=sala_1762294785415_7b1684f621b44cbc04c30b5f3d7967a8&sesion=3','en_espera','2025-11-04 12:01:43','2025-11-04 12:31:43',NULL,NULL,NULL,'AnySSA Video Conference',NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-04 14:51:43','2025-11-04 22:19:45'),(4,7,20,9,'sala_1762295988605_6d57deb092ae5121fa4dcdb7fbe32f9c','/medico/telemedicina/sala/video?token=sala_1762295988605_6d57deb092ae5121fa4dcdb7fbe32f9c&sesion=4','en_espera','2025-11-04 12:51:44','2025-11-04 13:21:44',NULL,NULL,NULL,'AnySSA Video Conference',NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-04 14:51:44','2025-11-04 22:39:48'),(5,8,21,9,'token_043c1296f731d21134d05669fc75aa0b','/medico/telemedicina/sala?sesion=8','finalizada','2025-11-06 12:51:00','2025-11-06 13:21:00','2025-11-04 09:51:44','2025-11-04 10:21:44',1800,'AnySSA Video Conference',NULL,'excelente',NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-04 14:51:44','2025-11-05 00:55:42'),(6,9,22,9,'token_ada7251c41db19c925303628e6639c0e','/medico/telemedicina/sala?sesion=9','programada','2025-11-04 13:51:44','2025-11-04 14:21:44',NULL,NULL,NULL,'AnySSA Video Conference',NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-04 14:51:44','2025-11-04 14:51:44'),(7,10,23,9,'sala_1762356824511_150563a697ee255bf55c2b5afd9ea390','/medico/telemedicina/sala/video?token=sala_1762356824511_150563a697ee255bf55c2b5afd9ea390&sesion=7','finalizada','2025-11-05 17:51:00','2025-11-05 18:21:00',NULL,'2025-11-05 13:01:58',0,'AnySSA Video Conference',NULL,NULL,NULL,NULL,NULL,'\n[2025-11-05T16:01:58.637Z] Motivo fin: Consulta completada',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-04 14:51:44','2025-11-05 16:01:58'),(8,11,19,9,'sala_1762384556463_90a56f8bfc7076af259b1931e89375dc','/medico/telemedicina/sala/video?token=sala_1762384556463_90a56f8bfc7076af259b1931e89375dc&sesion=8','en_curso','2025-11-05 17:54:00','2025-11-07 15:21:00','2025-11-04 21:53:57','2025-11-03 12:19:44',0,'AnySSA Video Conference',NULL,'buena',NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-04 14:51:44','2025-11-05 23:15:56'),(9,12,20,9,'token_82e28bca28acaa1b35f8fbcbff904fc0','/medico/telemedicina/sala?sesion=12','finalizada','2025-11-06 03:51:00','2025-11-07 21:21:00','2025-11-03 11:51:44','2025-11-03 12:16:44',1500,'AnySSA Video Conference',NULL,'excelente',NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-04 14:51:44','2025-11-05 00:56:41'),(17,32,22,9,'sala_1762478170895_680997cc06ce497261faac07ff37ed78','/medico/telemedicina/sala/video?token=sala_1762478170895_680997cc06ce497261faac07ff37ed78&sesion=17','finalizada','2025-11-07 09:00:00','2025-11-07 09:30:00',NULL,'2025-11-06 22:26:11',0,'anyssa_video',NULL,NULL,NULL,NULL,NULL,'dolor de cabeza\n[2025-11-07T01:26:11.138Z] Motivo fin: Consulta completada - Notas: k-bdgfsuycgmnbdsxyhjcbsdghjcb, dfhxgcv bewbsgdbngysuhjdc nhsd cbncv d b vtxgav dcbvseh maw,AÑLBSHE\n}5LJ5496+469431\n659\n+2}125+}\n8JHCSTCGSDZC',0,'+56934567890','pedro.sanchez@email.com','ciudad',NULL,NULL,NULL,NULL,'2025-11-07 01:08:22','2025-11-07 01:26:11');
/*!40000 ALTER TABLE `telemedicina_sesiones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipos_cita`
--

DROP TABLE IF EXISTS `tipos_cita`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tipos_cita` (
  `id_tipo_cita` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `duracion_predeterminada` int(10) unsigned NOT NULL,
  `color` varchar(7) NOT NULL DEFAULT '#3498db',
  `precio_sugerido` decimal(10,2) DEFAULT NULL,
  `requiere_preparacion` tinyint(1) NOT NULL DEFAULT 0,
  `instrucciones_preparacion` text DEFAULT NULL,
  `especialidades_relacionadas` varchar(255) DEFAULT NULL,
  `visible_web` tinyint(1) NOT NULL DEFAULT 1,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id_tipo_cita`),
  KEY `fk_tipocita_centro_idx` (`id_centro`),
  KEY `fk_tipocita_creador_idx` (`creado_por`),
  KEY `idx_tipocita_activo` (`activo`),
  KEY `idx_tipocita_visible` (`visible_web`),
  CONSTRAINT `fk_tipocita_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_tipocita_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tipos de citas disponibles';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipos_cita`
--

LOCK TABLES `tipos_cita` WRITE;
/*!40000 ALTER TABLE `tipos_cita` DISABLE KEYS */;
/*!40000 ALTER TABLE `tipos_cita` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipos_examenes`
--

DROP TABLE IF EXISTS `tipos_examenes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tipos_examenes` (
  `id_tipo_examen` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `codigo` varchar(20) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `categoria` varchar(50) NOT NULL,
  `subcategoria` varchar(50) DEFAULT NULL,
  `especialidad_relacionada` varchar(100) DEFAULT NULL,
  `requiere_ayuno` tinyint(1) NOT NULL DEFAULT 0,
  `requiere_preparacion` tinyint(1) NOT NULL DEFAULT 0,
  `instrucciones_preparacion` text DEFAULT NULL,
  `tiempo_resultado_horas` int(10) unsigned DEFAULT NULL,
  `codigo_fonasa` varchar(20) DEFAULT NULL,
  `valor_fonasa` decimal(10,2) DEFAULT NULL,
  `complejidad` enum('baja','media','alta','critica') NOT NULL DEFAULT 'media',
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_tipo_examen`),
  UNIQUE KEY `idx_tipoexamen_codigo` (`codigo`),
  KEY `idx_tipoexamen_categoria` (`categoria`,`subcategoria`),
  KEY `idx_tipoexamen_especialidad` (`especialidad_relacionada`),
  KEY `idx_tipoexamen_preparacion` (`requiere_preparacion`),
  KEY `idx_tipoexamen_complejidad` (`complejidad`),
  KEY `idx_tipoexamen_activo` (`activo`),
  KEY `fk_tipoexamen_creador_idx` (`creado_por`),
  CONSTRAINT `fk_tipoexamen_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Catálogo de exámenes disponibles';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipos_examenes`
--

LOCK TABLES `tipos_examenes` WRITE;
/*!40000 ALTER TABLE `tipos_examenes` DISABLE KEYS */;
INSERT INTO `tipos_examenes` VALUES (1,'302047','Glicemia basal','Determinación de glucosa en sangre','Laboratorio Clínico','Bioquímica','Medicina Interna / Endocrinología',1,1,'Ayuno 8–12 h. Sólo agua.',24,'302047',NULL,'baja',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(2,'302034','Perfil lipídico','Colesterol total + HDL + LDL + Triglicéridos','Laboratorio Clínico','Bioquímica','Medicina Interna / Cardiología',1,1,'Ayuno 12 h. Evitar alcohol 48 h.',48,'302034',NULL,'media',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(3,'302067','Colesterol total','Colesterol sérico total','Laboratorio Clínico','Bioquímica','Medicina Interna / Cardiología',1,1,'Ayuno 12 h recomendado.',24,'302067',NULL,'baja',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(4,'302064','Triglicéridos','Triglicéridos séricos','Laboratorio Clínico','Bioquímica','Medicina Interna / Cardiología',1,1,'Ayuno 12 h. Evitar alcohol 48 h.',24,'302064',NULL,'baja',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(5,'302068','Colesterol HDL','Lipoproteína de alta densidad','Laboratorio Clínico','Bioquímica','Medicina Interna / Cardiología',1,1,'Ayuno 12 h recomendado.',24,'302068',NULL,'baja',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(6,'302023','Creatinina','Función renal (creatinina sérica)','Laboratorio Clínico','Bioquímica','Nefrología / Medicina Interna',0,0,NULL,24,'302023',NULL,'baja',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(7,'302057','Nitrógeno ureico (BUN)','Nitrógeno ureico en suero','Laboratorio Clínico','Bioquímica','Nefrología / Medicina Interna',0,0,NULL,24,'302057',NULL,'baja',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(8,'302005','Ácido úrico','Ácido úrico sérico','Laboratorio Clínico','Bioquímica','Reumatología / Medicina Interna',0,0,NULL,24,'302005',NULL,'baja',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(9,'302013','Bilirrubina total y directa','Bilirrubina total y conjugada','Laboratorio Clínico','Bioquímica','Gastroenterología / Medicina Interna',0,0,NULL,24,'302013',NULL,'baja',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(10,'302040','Fosfatasa alcalina','Isoenzima hepato-ósea','Laboratorio Clínico','Bioquímica','Gastroenterología / Endocrinología',0,0,NULL,24,'302040',NULL,'baja',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(11,'302045','Gamma GT (GGT)','Gamma glutamil transferasa','Laboratorio Clínico','Bioquímica','Gastroenterología',0,0,NULL,24,'302045',NULL,'baja',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(12,'302029','GOT/AST','Aspartato aminotransferasa','Laboratorio Clínico','Bioquímica','Gastroenterología',0,0,NULL,24,'302029',NULL,'baja',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(13,'302028','GPT/ALT','Alanina aminotransferasa','Laboratorio Clínico','Bioquímica','Gastroenterología',0,0,NULL,24,'302028',NULL,'baja',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(14,'302030','LDH','Lactato deshidrogenasa','Laboratorio Clínico','Bioquímica','Medicina Interna',0,0,NULL,24,'302030',NULL,'baja',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(15,'302015','Calcio','Calcemia','Laboratorio Clínico','Bioquímica','Endocrinología',0,0,NULL,24,'302015',NULL,'baja',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(16,'302042','Fósforo','Fosfatemia','Laboratorio Clínico','Bioquímica','Endocrinología / Nefrología',0,0,NULL,24,'302042',NULL,'baja',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(17,'302056','Magnesio','Magnesemia','Laboratorio Clínico','Bioquímica','Medicina Interna',0,0,NULL,24,'302056',NULL,'baja',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(18,'302025','CK-MB','Creatinfosfoquinasa fracción MB','Laboratorio Clínico','Bioquímica','Cardiología',0,0,NULL,24,'302025',NULL,'media',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(19,'302026','CK total','Creatinfosfoquinasa total','Laboratorio Clínico','Bioquímica','Medicina Interna',0,0,NULL,24,'302026',NULL,'baja',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(20,'302100','Proteínas totales','Proteínas totales en suero','Laboratorio Clínico','Bioquímica','Medicina Interna',0,0,NULL,24,'302100',NULL,'baja',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(21,'302101','Albúmina','Albúmina sérica','Laboratorio Clínico','Bioquímica','Medicina Interna / Nefrología',0,0,NULL,24,'302101',NULL,'baja',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(22,'302048','Curva de tolerancia a la glucosa','Basal + sobrecarga (OGTT)','Laboratorio Clínico','Bioquímica','Endocrinología',1,1,'Ayuno 8–12 h. Indicar dosis y tiempo de muestras.',48,'302048',NULL,'media',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(23,'301045','Hemograma','Hemograma completo','Laboratorio Clínico','Hematología','Hematología / Medicina Interna',0,0,NULL,24,'301045',NULL,'baja',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(24,'301059','Tiempo de protrombina (INR)','Coagulación: TP/INR','Laboratorio Clínico','Coagulación','Hematología',0,0,NULL,24,'301059',NULL,'baja',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(25,'301041','Hemoglobina glicosilada (HbA1c)','Control glicémico a 3 meses','Laboratorio Clínico','Hematología','Endocrinología',0,0,NULL,48,'301041',NULL,'baja',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(26,'303024','TSH','Hormona estimulante tiroidea','Laboratorio Clínico','Endocrinología','Endocrinología',0,0,NULL,48,'303024',NULL,'media',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(27,'303026','T4 libre','Tiroxina libre','Laboratorio Clínico','Endocrinología','Endocrinología',0,0,NULL,48,'303026',NULL,'media',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(28,'303027','T4 total','Tiroxina total','Laboratorio Clínico','Endocrinología','Endocrinología',0,0,NULL,48,'303027',NULL,'media',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(29,'303028','T3 total','Triyodotironina total','Laboratorio Clínico','Endocrinología','Endocrinología',0,0,NULL,48,'303028',NULL,'media',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(30,'303057','T3 libre','Triyodotironina libre','Laboratorio Clínico','Endocrinología','Endocrinología',0,0,NULL,72,'303057',NULL,'media',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(31,'303025','Tiroglobulina','Marcador tiroideo','Laboratorio Clínico','Endocrinología','Endocrinología',0,0,NULL,72,'303025',NULL,'media',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(32,'303017','Insulina basal','Insulina en ayunas','Laboratorio Clínico','Endocrinología','Endocrinología',1,1,'Ayuno 8–12 h.',48,'303017',NULL,'media',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(33,'303006','Cortisol (AM/PM)','Ritmo circadiano de cortisol','Laboratorio Clínico','Endocrinología','Endocrinología',0,1,'Muestra AM 08:00–10:00 o PM según indicación.',48,'303006',NULL,'media',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(34,'303001','ACTH','Adenocorticotropina plasmática','Laboratorio Clínico','Endocrinología','Endocrinología',0,1,'Extraer en tubo frío, transporte inmediato.',72,'303001',NULL,'alta',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(35,'303022','Testosterona total','Andrógenos totales','Laboratorio Clínico','Endocrinología','Endocrinología / Urología',0,0,NULL,72,'303022',NULL,'media',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(36,'303023','Testosterona libre','Fracción libre calculada o medida','Laboratorio Clínico','Endocrinología','Endocrinología / Urología',0,0,NULL,72,'303023',NULL,'media',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(37,'303019','Progesterona','Hormona ovárica','Laboratorio Clínico','Endocrinología','Ginecología / Endocrinología',0,0,NULL,72,'303019',NULL,'media',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(38,'303020','Prolactina','Hormona hipofisaria','Laboratorio Clínico','Endocrinología','Endocrinología',0,0,NULL,48,'303020',NULL,'media',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(39,'303018','PTH','Parathormona','Laboratorio Clínico','Endocrinología','Endocrinología',0,0,NULL,72,'303018',NULL,'media',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(40,'303014','β-HCG en sangre','Gonadotrofina coriónica (sérica)','Laboratorio Clínico','Endocrinología','Ginecología / Obstetricia',0,0,NULL,24,'303014',NULL,'baja',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(41,'309014','Test de embarazo en orina','Inmunocromatografía en orina','Laboratorio Clínico','Endocrinología','Ginecología / Obstetricia',0,1,'Recolectar primera orina de la mañana o chorro medio.',2,'309014',NULL,'baja',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(42,'305030','Proteína C Reactiva (PCR)','Reactante de fase aguda','Laboratorio Clínico','Inmunología','Medicina Interna / Reumatología',0,0,NULL,24,'305030',NULL,'baja',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(43,'305008','Antiestreptolisina O (ASO)','Títulos anti-estreptococo β-hemolítico','Laboratorio Clínico','Inmunología','Reumatología / Pediatría',0,0,NULL,48,'305008',NULL,'media',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(44,'305019','Factor reumatoideo (FR)','FR por látex o nefelometría','Laboratorio Clínico','Inmunología','Reumatología',0,0,NULL,48,'305019',NULL,'media',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(45,'305028','IgE total','Inmunoglobulina E total','Laboratorio Clínico','Inmunología','Alergología',0,0,NULL,72,'305028',NULL,'media',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(46,'306169','Anticuerpos VIH (ELISA)','Tamizaje infección VIH','Laboratorio Clínico','Inmunología','Infectología',0,0,NULL,72,'306169',NULL,'media',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(47,'306042','VDRL','Tamizaje sífilis','Laboratorio Clínico','Inmunología','Infectología',0,0,NULL,24,'306042',NULL,'media',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(48,'306038','RPR','Tamizaje sífilis (no treponémica)','Laboratorio Clínico','Inmunología','Infectología',0,0,NULL,24,'306038',NULL,'media',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(49,'306079','HBsAg (Hepatitis B)','Antígeno de superficie de VHB','Laboratorio Clínico','Inmunología','Infectología / Gastroenterología',0,0,NULL,72,'306079',NULL,'media',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(50,'306081','Anticuerpos Hepatitis C','Anti-HCV','Laboratorio Clínico','Inmunología','Infectología / Gastroenterología',0,0,NULL,72,'306081',NULL,'media',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(51,'309022','Orina completa','Examen de orina con sedimento','Laboratorio Clínico','Orina','Medicina Interna / Nefrología',0,1,'Muestra de primera orina de la mañana o chorro medio en frasco estéril.',24,'309022',NULL,'baja',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(52,'309024','Sedimento urinario','Recuento y morfología','Laboratorio Clínico','Orina','Nefrología',0,1,'Muestra de orina reciente, chorro medio.',24,'309024',NULL,'baja',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(53,'309013','Microalbuminuria (muestra aislada)','Relación albumina/creatinina disponible','Laboratorio Clínico','Orina','Nefrología',0,1,'Primera orina de la mañana o muestra aislada indicada.',48,'309013',NULL,'media',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(54,'309016','Glucosuria','Glucosa en orina (cualitativa/cuantitativa)','Laboratorio Clínico','Orina','Nefrología / Endocrinología',0,1,'Muestra de orina reciente, chorro medio.',24,'309016',NULL,'baja',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL),(55,'306011','Urocultivo + ATB','Cultivo de orina con antibiograma','Laboratorio Clínico','Microbiología','Infectología',0,1,'Aseo genital previo; recolectar chorro medio en frasco estéril.',72,'306011',NULL,'media',1,'2025-11-01 19:15:01','2025-11-01 19:15:01',NULL);
/*!40000 ALTER TABLE `tipos_examenes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipos_receta`
--

DROP TABLE IF EXISTS `tipos_receta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tipos_receta` (
  `id_tipo_receta` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `codigo` varchar(20) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `controlado` tinyint(1) NOT NULL DEFAULT 0,
  `validez_dias` int(11) DEFAULT NULL,
  `requiere_rut` tinyint(1) NOT NULL DEFAULT 0,
  `exige_firma` tinyint(1) NOT NULL DEFAULT 0,
  `control_categoria` enum('general','antimicrobianos','psicotropicos','estupefacientes','magistral') NOT NULL DEFAULT 'general',
  `requiere_retencion` tinyint(1) NOT NULL DEFAULT 0,
  `requiere_duplicado` tinyint(1) NOT NULL DEFAULT 0,
  `requiere_firma_digital` tinyint(1) NOT NULL DEFAULT 0,
  `vigencia_dias` int(10) unsigned DEFAULT NULL,
  `max_repeticiones` int(10) unsigned NOT NULL DEFAULT 0,
  `permite_parcial` tinyint(1) NOT NULL DEFAULT 1,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `orden` int(10) unsigned NOT NULL DEFAULT 100,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_tipo_receta`),
  UNIQUE KEY `ux_tipos_receta_codigo` (`codigo`),
  KEY `idx_tipos_receta_activo` (`activo`),
  KEY `idx_tipos_receta_orden` (`orden`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tipos de receta (Chile)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipos_receta`
--

LOCK TABLES `tipos_receta` WRITE;
/*!40000 ALTER TABLE `tipos_receta` DISABLE KEYS */;
INSERT INTO `tipos_receta` VALUES (1,'SIMPLE','Receta simple','Medicamentos de uso general no sujetos a control.',0,NULL,0,0,'general',0,0,0,180,3,1,1,100,'2025-11-01 18:58:01','2025-11-01 18:58:01'),(2,'ANTIMIC','Receta retenida (Antimicrobianos)','Antibióticos/antimicrobianos. Farmacia retiene receta.',0,NULL,0,0,'antimicrobianos',1,0,0,30,0,0,1,200,'2025-11-01 18:58:01','2025-11-01 18:58:01'),(5,'MAG','Receta magistral','Preparaciones magistrales en farmacia.',1,365,1,1,'magistral',0,0,0,180,0,1,1,400,'2025-11-01 18:58:01','2025-11-02 04:08:41'),(6,'RME','Receta médica electrónica (RME)','Emisión en formato electrónico con firma digital.',0,NULL,0,0,'general',0,0,1,180,3,1,1,500,'2025-11-01 18:58:01','2025-11-01 18:58:01'),(8,'CHEQEST','Receta cheque (Estupefacientes)','Estupefacientes. Talonario con copias.',0,NULL,1,0,'estupefacientes',1,1,0,30,0,0,1,310,'2025-11-02 03:54:33','2025-11-02 04:14:34');
/*!40000 ALTER TABLE `tipos_receta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transacciones`
--

DROP TABLE IF EXISTS `transacciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `transacciones` (
  `id_transaccion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `id_factura` int(10) unsigned DEFAULT NULL,
  `id_paciente` int(10) unsigned DEFAULT NULL,
  `id_metodo_pago` int(10) unsigned DEFAULT NULL,
  `fecha_transaccion` datetime NOT NULL,
  `monto` decimal(12,2) NOT NULL,
  `moneda` varchar(3) NOT NULL DEFAULT 'CLP',
  `tipo_transaccion` enum('pago','reembolso','anulacion','cargo','abono') NOT NULL,
  `estado` enum('pendiente','aprobada','rechazada','anulada','procesando','error') NOT NULL,
  `codigo_autorizacion` varchar(50) DEFAULT NULL,
  `numero_referencia` varchar(50) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `codigo_error` varchar(50) DEFAULT NULL,
  `mensaje_error` text DEFAULT NULL,
  `datos_transaccion_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`datos_transaccion_json`)),
  `gateway_transaccion` varchar(100) DEFAULT NULL,
  `id_transaccion_gateway` varchar(100) DEFAULT NULL,
  `ip_cliente` varchar(45) DEFAULT NULL,
  `id_usuario_procesador` int(10) unsigned DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `url_comprobante` varchar(255) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_transaccion`),
  KEY `idx_trans_centro` (`id_centro`),
  KEY `idx_trans_factura` (`id_factura`),
  KEY `idx_trans_paciente` (`id_paciente`),
  KEY `idx_trans_metodo` (`id_metodo_pago`),
  KEY `idx_trans_procesador` (`id_usuario_procesador`),
  KEY `idx_trans_fecha` (`fecha_transaccion`),
  KEY `idx_trans_tipo` (`tipo_transaccion`),
  KEY `idx_trans_estado` (`estado`),
  KEY `idx_trans_codigo` (`codigo_autorizacion`),
  KEY `idx_trans_referencia` (`numero_referencia`),
  KEY `idx_trans_gateway` (`id_transaccion_gateway`),
  CONSTRAINT `fk_transacciones_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_transacciones_factura` FOREIGN KEY (`id_factura`) REFERENCES `facturacion` (`id_factura`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_transacciones_metodo_pago` FOREIGN KEY (`id_metodo_pago`) REFERENCES `metodos_pago` (`id_metodo_pago`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_transacciones_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_transacciones_usuario_procesador` FOREIGN KEY (`id_usuario_procesador`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro de transacciones financieras';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transacciones`
--

LOCK TABLES `transacciones` WRITE;
/*!40000 ALTER TABLE `transacciones` DISABLE KEYS */;
INSERT INTO `transacciones` VALUES (1,1,5,1,NULL,'2025-10-30 17:08:40',0.00,'CLP','anulacion','aprobada',NULL,NULL,'sssssssssssss',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-30 20:08:40','2025-10-30 20:08:40'),(2,1,5,1,2,'2025-10-30 23:23:00',64260.00,'CLP','pago','aprobada',NULL,NULL,'Pago de factura',NULL,NULL,NULL,NULL,NULL,'::1',NULL,NULL,NULL,'2025-10-30 20:23:36','2025-10-30 20:23:36'),(3,1,5,1,2,'2025-10-30 23:42:00',60000.00,'CLP','pago','aprobada',NULL,'alekuyya','Pago de factura',NULL,NULL,NULL,NULL,NULL,'::1',NULL,NULL,NULL,'2025-10-30 20:42:22','2025-10-30 20:42:22');
/*!40000 ALTER TABLE `transacciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuarios` (
  `id_usuario` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido_paterno` varchar(100) NOT NULL,
  `apellido_materno` varchar(100) DEFAULT NULL,
  `rut` varchar(12) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `celular` varchar(20) DEFAULT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT NULL,
  `region` varchar(100) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `genero` enum('masculino','femenino') DEFAULT NULL,
  `id_centro_principal` int(10) unsigned DEFAULT NULL,
  `id_sucursal_principal` int(10) unsigned DEFAULT NULL,
  `ultimo_login` datetime DEFAULT NULL,
  `intentos_fallidos` tinyint(3) unsigned NOT NULL DEFAULT 0,
  `bloqueado_hasta` datetime DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry` datetime DEFAULT NULL,
  `estado` enum('activo','inactivo','bloqueado','pendiente_activacion') NOT NULL DEFAULT 'pendiente_activacion',
  `requiere_cambio_password` tinyint(1) NOT NULL DEFAULT 1,
  `autenticacion_doble_factor` tinyint(1) NOT NULL DEFAULT 0,
  `secret_2fa` varchar(100) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `ultimo_acceso` datetime DEFAULT NULL,
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` int(10) unsigned DEFAULT NULL,
  `foto_perfil_url` varchar(255) DEFAULT NULL,
  `apellido` varchar(200) GENERATED ALWAYS AS (concat_ws(' ',`apellido_paterno`,`apellido_materno`)) STORED,
  `es_premium` tinyint(1) DEFAULT 0,
  `fecha_inicio_premium` date DEFAULT NULL,
  `fecha_expiracion_premium` date DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `idx_usuario_username` (`username`),
  UNIQUE KEY `idx_usuario_email` (`email`),
  UNIQUE KEY `idx_usuario_rut` (`rut`),
  KEY `idx_usuario_centro` (`id_centro_principal`),
  KEY `idx_usuario_sucursal` (`id_sucursal_principal`),
  KEY `idx_usuario_estado` (`estado`),
  KEY `idx_usuario_nombre_completo` (`nombre`,`apellido_paterno`,`apellido_materno`),
  KEY `idx_usuario_premium` (`es_premium`,`fecha_expiracion_premium`),
  CONSTRAINT `fk_usuario_centro` FOREIGN KEY (`id_centro_principal`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_usuario_sucursal` FOREIGN KEY (`id_sucursal_principal`) REFERENCES `sucursales` (`id_sucursal`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Usuarios del sistema';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'peterly','12345678','brenordpeterly2018@gmail.com','Peterly','Brenord',NULL,'26.235.507-1','+56 9 949306385','949306385','Valles de Don Felipe, pje 7 , #167 Curico','Curicó','Región del Maule','1997-03-24','masculino',1,NULL,NULL,0,NULL,'5037e06ae69ae17cc03efb17cd39a2c16a80504d584953a79a5e14108e5543fc','2025-10-29 12:55:19','activo',1,1,NULL,'2025-10-27 02:19:55',NULL,'2025-11-03 00:42:42',NULL,NULL,'Brenord',0,NULL,NULL),(2,'tecnico1','12345678','tecnico@medisuite.cl','Danilo','Rojas',NULL,'18.543.999-5','+56 9 2222 2222',NULL,NULL,'Curicó','Región del Maule',NULL,NULL,1,NULL,NULL,0,NULL,NULL,NULL,'activo',0,0,NULL,'2025-10-27 02:19:55',NULL,'2025-10-27 02:19:55',NULL,NULL,'Rojas',0,NULL,NULL),(3,'administrativo1','12345678','administra@medisuite.cl','Mauricio','Campos',NULL,'19.777.888-2','+56 9 3333 3333',NULL,NULL,'Curicó','Región del Maule',NULL,NULL,1,NULL,NULL,0,NULL,NULL,NULL,'activo',0,0,NULL,'2025-10-27 02:19:55',NULL,'2025-10-27 02:19:55',NULL,NULL,'Campos',0,NULL,NULL),(4,'medico1','12345678','saintamourdulianise@gmail.com','Dulianise','Saint Amour','BRENORD','26399128-1','+56 9 49306385',NULL,NULL,'Curicó','Región del Maule',NULL,'masculino',1,NULL,NULL,0,NULL,NULL,NULL,'activo',0,0,NULL,'2025-10-27 02:19:55',NULL,'2025-11-04 15:36:28',NULL,NULL,'Saint Amour BRENORD',0,NULL,NULL),(5,'secretaria1','12345678','secretaria@medisuite.cl','Macarena','Espinoza',NULL,'10.005.725-5','+56 9 5555 5555',NULL,NULL,'Curicó','Región del Maule','2025-10-29','femenino',1,NULL,NULL,0,NULL,NULL,NULL,'activo',0,0,NULL,'2025-10-27 02:19:55',NULL,'2025-11-03 11:23:58',NULL,NULL,'Espinoza',0,NULL,NULL),(6,'paciente1','12345678','paciente@medisuite.cl','Ana','Torres',NULL,'22.111.333-6','+56 9 6666 6666',NULL,NULL,'Curicó','Región del Maule',NULL,NULL,1,NULL,NULL,0,NULL,NULL,NULL,'activo',0,0,NULL,'2025-10-27 02:19:55',NULL,'2025-10-27 02:19:55',NULL,NULL,'Torres',0,NULL,NULL),(12,'dr.gonzalez','$2b$10$abcdefghijklmnopqrstuvwxyz123456','gonzalez@medisuite.cl','Juan','González','Pérez','12.345.678-9','+56912345678','+56912345678',NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,0,NULL,NULL,NULL,'activo',1,0,NULL,'2025-10-27 15:43:54',NULL,'2025-10-27 15:43:54',NULL,NULL,'González Pérez',0,NULL,NULL),(13,'dra.martinez','$2b$10$abcdefghijklmnopqrstuvwxyz123456','martinez@medisuite.cl','María','Martínez','López','23.456.789-0','+56922345678','+56922345678',NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,0,NULL,NULL,NULL,'activo',1,0,NULL,'2025-10-27 15:43:54',NULL,'2025-10-27 15:43:54',NULL,NULL,'Martínez López',0,NULL,NULL),(14,'admin.centro','$2b$10$abcdefghijklmnopqrstuvwxyz123456','admin1@medisuite.cl','Carlos','Rodríguez','Silva','34.567.890-1','+56932345678','+56932345678',NULL,NULL,NULL,NULL,NULL,2,NULL,NULL,0,NULL,NULL,NULL,'activo',1,0,NULL,'2025-10-27 15:43:54',NULL,'2025-10-27 15:43:54',NULL,NULL,'Rodríguez Silva',0,NULL,NULL),(15,'sec.recepcion','$2b$10$abcdefghijklmnopqrstuvwxyz123456','recepcion@medisuite.cl','Ana','Fernández','Torres','45.678.901-2','+56942345678','+56942345678',NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,0,NULL,NULL,NULL,'activo',1,0,NULL,'2025-10-27 15:43:54',NULL,'2025-10-27 15:43:54',NULL,NULL,'Fernández Torres',0,NULL,NULL),(16,'dr.lopez','$2b$10$abcdefghijklmnopqrstuvwxyz123456','lopez@medisuite.cl','Pedro','López','Ramírez','56.789.012-3','+56952345678','+56952345678',NULL,NULL,NULL,NULL,NULL,3,NULL,NULL,0,NULL,NULL,NULL,'activo',1,0,NULL,'2025-10-27 15:43:54',NULL,'2025-10-27 15:43:54',NULL,NULL,'López Ramírez',0,NULL,NULL),(17,'duli','$2b$10$VmezTE0jDcruVSzZrx1gt.FSllR85kBo/om9wzX4JNbSBe28Sl7c6','peterly.infoges@gmail.com','DULIANISE',' SAINT AMOUR','BRENORD','26.399.128-1','+56949306385','984150439','Valles de Don Felipe, pje 7 , #167 Curico','curico','Región del Maule','2004-03-26','femenino',1,NULL,NULL,0,NULL,'1095b37f9d88a3b839809fa896fa1ca1a684df11980b357fab813134fe5d6526','2025-10-29 13:34:48','activo',1,1,'517588d30bf2b0eaafe7c1fa63eb750a00350743','2025-10-28 15:19:15',NULL,'2025-11-03 23:45:39',NULL,NULL,' SAINT AMOUR BRENORD',0,NULL,NULL),(24,'anagarcia','ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f','ana.garcia@centro.com','Ana','García','López','77.111.222-3','+56911111111',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,'activo',0,0,NULL,'2025-11-03 00:43:10',NULL,'2025-11-03 00:43:10',NULL,NULL,'García López',0,NULL,NULL),(25,'brunoperez','ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f','bruno.perez@centro.com','Bruno','Pérez','Ramírez','88.444.555-6','+56922222222',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,'activo',0,0,NULL,'2025-11-03 00:43:10',NULL,'2025-11-03 00:43:10',NULL,NULL,'Pérez Ramírez',0,NULL,NULL),(26,'maria.gonzalez','$2b$10$abcdefghijklmnopqrstuvwxyz123456','maria.gonzalez@email.com','María','González','Pérez','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,'activo',1,0,NULL,'2025-11-04 14:50:25',NULL,'2025-11-04 14:50:25',NULL,NULL,'González Pérez',0,NULL,NULL);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios_roles`
--

DROP TABLE IF EXISTS `usuarios_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuarios_roles` (
  `id_usuario` int(10) unsigned NOT NULL,
  `id_rol` int(10) unsigned NOT NULL,
  `id_centro` int(10) unsigned DEFAULT NULL,
  `id_sucursal` int(10) unsigned DEFAULT NULL,
  `fecha_asignacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `asignado_por` int(10) unsigned NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_usuario`,`id_rol`),
  KEY `fk_usurol_rol_idx` (`id_rol`),
  KEY `fk_usurol_centro_idx` (`id_centro`),
  KEY `fk_usurol_sucursal_idx` (`id_sucursal`),
  KEY `fk_usurol_asignador_idx` (`asignado_por`),
  CONSTRAINT `fk_usurol_asignador` FOREIGN KEY (`asignado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_usurol_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_usurol_rol` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_usurol_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursales` (`id_sucursal`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_usurol_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Asignación de roles a usuarios';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios_roles`
--

LOCK TABLES `usuarios_roles` WRITE;
/*!40000 ALTER TABLE `usuarios_roles` DISABLE KEYS */;
INSERT INTO `usuarios_roles` VALUES (1,1,1,NULL,'2025-10-27 02:20:37',1,1),(1,2,1,NULL,'2025-10-30 18:55:13',1,1),(1,3,1,NULL,'2025-10-30 18:55:13',1,1),(1,4,1,NULL,'2025-10-30 18:55:13',1,1),(1,5,1,NULL,'2025-11-03 00:42:42',1,1),(1,6,1,NULL,'2025-10-30 18:55:13',1,1),(2,2,1,NULL,'2025-10-27 02:20:37',1,1),(2,5,1,NULL,'2025-11-04 00:24:04',1,1),(3,2,1,NULL,'2025-11-04 00:24:04',1,1),(3,3,1,NULL,'2025-10-27 02:20:37',1,1),(4,3,1,NULL,'2025-11-04 00:24:04',1,0),(4,5,1,NULL,'2025-11-04 15:36:28',1,1),(5,4,1,NULL,'2025-10-27 02:20:37',1,0),(5,5,1,NULL,'2025-11-03 02:07:54',1,1),(6,6,1,NULL,'2025-10-27 02:20:37',1,1),(17,1,1,1,'2025-10-28 15:19:15',1,0),(17,2,1,1,'2025-10-28 15:19:15',1,0),(17,3,1,1,'2025-10-28 15:19:15',1,0),(17,4,1,1,'2025-10-28 15:19:15',1,0),(17,5,1,NULL,'2025-11-03 00:54:30',1,1),(17,6,1,1,'2025-10-28 15:19:15',1,0);
/*!40000 ALTER TABLE `usuarios_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios_suspensiones`
--

DROP TABLE IF EXISTS `usuarios_suspensiones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuarios_suspensiones` (
  `id_suspension` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de la suspensión',
  `id_usuario` int(10) unsigned NOT NULL COMMENT 'Usuario afectado por la suspensión',
  `motivo` text NOT NULL COMMENT 'Motivo o causa de la suspensión',
  `detalles` text DEFAULT NULL COMMENT 'Detalles adicionales o evidencia del caso',
  `suspendido_por` int(10) unsigned DEFAULT NULL COMMENT 'Usuario administrador que realizó la suspensión',
  `tipo_suspension` enum('manual','automatica','sistema') NOT NULL DEFAULT 'manual' COMMENT 'Origen de la suspensión',
  `fecha_suspension` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'Fecha y hora de la suspensión',
  `fecha_expiracion` datetime DEFAULT NULL COMMENT 'Fecha opcional para levantar la suspensión automáticamente',
  `levantada_por` int(10) unsigned DEFAULT NULL COMMENT 'Usuario que reactivó la cuenta, si aplica',
  `fecha_levantamiento` datetime DEFAULT NULL COMMENT 'Fecha de reactivación o fin de la suspensión',
  `estado` enum('activa','levantada','expirada') NOT NULL DEFAULT 'activa' COMMENT 'Estado actual de la suspensión',
  `ip_origen` varchar(45) DEFAULT NULL COMMENT 'IP del administrador que ejecutó la acción',
  `user_agent` varchar(255) DEFAULT NULL COMMENT 'Agente del navegador o sistema usado',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Fecha de creación del registro',
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Última modificación del registro',
  PRIMARY KEY (`id_suspension`),
  KEY `fk_suspension_admin` (`suspendido_por`),
  KEY `fk_suspension_levantada` (`levantada_por`),
  KEY `idx_suspension_usuario` (`id_usuario`),
  KEY `idx_suspension_estado` (`estado`),
  KEY `idx_suspension_tipo` (`tipo_suspension`),
  KEY `idx_suspension_fecha` (`fecha_suspension`),
  CONSTRAINT `fk_suspension_admin` FOREIGN KEY (`suspendido_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_suspension_levantada` FOREIGN KEY (`levantada_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_suspension_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Historial detallado de suspensiones y bloqueos de usuarios';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios_suspensiones`
--

LOCK TABLES `usuarios_suspensiones` WRITE;
/*!40000 ALTER TABLE `usuarios_suspensiones` DISABLE KEYS */;
/*!40000 ALTER TABLE `usuarios_suspensiones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary table structure for view `v_auditorias_resumen`
--

DROP TABLE IF EXISTS `v_auditorias_resumen`;
/*!50001 DROP VIEW IF EXISTS `v_auditorias_resumen`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `v_auditorias_resumen` AS SELECT
 1 AS `id_auditoria`,
  1 AS `modulo`,
  1 AS `accion`,
  1 AS `resultado`,
  1 AS `nivel_criticidad`,
  1 AS `fecha_hora`,
  1 AS `id_usuario`,
  1 AS `id_centro`,
  1 AS `entorno`,
  1 AS `ip_origen`,
  1 AS `afecta_datos_sensibles`,
  1 AS `requiere_revision`,
  1 AS `revisado`,
  1 AS `sincronizado_cloud` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_pacientes_con_prevision`
--

DROP TABLE IF EXISTS `v_pacientes_con_prevision`;
/*!50001 DROP VIEW IF EXISTS `v_pacientes_con_prevision`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `v_pacientes_con_prevision` AS SELECT
 1 AS `id_paciente`,
  1 AS `nombre_completo`,
  1 AS `rut`,
  1 AS `nombre_prevision`,
  1 AS `tipo_prevision`,
  1 AS `cobertura`,
  1 AS `prevision_activa` */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `vacunas`
--

DROP TABLE IF EXISTS `vacunas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vacunas` (
  `id_vacuna` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente` int(10) unsigned NOT NULL,
  `nombre_vacuna` varchar(100) NOT NULL,
  `fecha_aplicacion` date NOT NULL,
  `dosis` varchar(50) DEFAULT NULL COMMENT '1ra dosis, 2da dosis, refuerzo, etc.',
  `lote` varchar(50) DEFAULT NULL,
  `laboratorio` varchar(100) DEFAULT NULL,
  `via_administracion` varchar(50) DEFAULT NULL,
  `lugar_aplicacion` varchar(100) DEFAULT NULL,
  `proxima_dosis` date DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `reacciones_adversas` text DEFAULT NULL,
  `id_centro` int(10) unsigned DEFAULT NULL,
  `aplicada_por` int(10) unsigned DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_vacuna`),
  KEY `fk_vacuna_paciente_idx` (`id_paciente`),
  KEY `fk_vacuna_centro_idx` (`id_centro`),
  KEY `fk_vacuna_aplicador_idx` (`aplicada_por`),
  KEY `idx_vacuna_fecha` (`fecha_aplicacion`),
  KEY `idx_vacuna_nombre` (`nombre_vacuna`),
  CONSTRAINT `fk_vacuna_aplicador` FOREIGN KEY (`aplicada_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_vacuna_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_vacuna_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro de vacunas aplicadas a pacientes';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vacunas`
--

LOCK TABLES `vacunas` WRITE;
/*!40000 ALTER TABLE `vacunas` DISABLE KEYS */;
/*!40000 ALTER TABLE `vacunas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vademecum`
--

DROP TABLE IF EXISTS `vademecum`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vademecum` (
  `id_vademecum` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_medicamento` int(10) unsigned NOT NULL,
  `accion_terapeutica` text NOT NULL,
  `farmacocinetica` text DEFAULT NULL,
  `farmacodinamia` text DEFAULT NULL,
  `indicaciones` text NOT NULL,
  `contraindicaciones` text NOT NULL,
  `advertencias` text DEFAULT NULL,
  `precauciones` text DEFAULT NULL,
  `efectos_adversos` text DEFAULT NULL,
  `interacciones` text DEFAULT NULL,
  `sobredosis` text DEFAULT NULL,
  `conservacion` varchar(255) DEFAULT NULL,
  `clasificacion_embarazo` varchar(50) DEFAULT NULL,
  `bibliografia` text DEFAULT NULL,
  `fecha_actualizacion` date NOT NULL,
  `version` int(10) unsigned NOT NULL DEFAULT 1,
  `fuente` varchar(255) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `actualizado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_vademecum`),
  KEY `fk_vademecum_medicamento_idx` (`id_medicamento`),
  KEY `fk_vademecum_actualizador_idx` (`actualizado_por`),
  KEY `idx_vademecum_fecha` (`fecha_actualizacion`),
  KEY `idx_vademecum_version` (`version`),
  CONSTRAINT `fk_vademecum_actualizador` FOREIGN KEY (`actualizado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_vademecum_medicamento` FOREIGN KEY (`id_medicamento`) REFERENCES `medicamentos` (`id_medicamento`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Información farmacológica completa';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vademecum`
--

LOCK TABLES `vademecum` WRITE;
/*!40000 ALTER TABLE `vademecum` DISABLE KEYS */;
/*!40000 ALTER TABLE `vademecum` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `validaciones_cobertura`
--

DROP TABLE IF EXISTS `validaciones_cobertura`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `validaciones_cobertura` (
  `id_validacion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `id_paciente` int(10) unsigned NOT NULL,
  `id_cita` int(10) unsigned DEFAULT NULL,
  `id_procedimiento` int(10) unsigned DEFAULT NULL,
  `tipo_validacion` enum('consulta','procedimiento','examen','hospitalizacion') NOT NULL,
  `entidad_financiadora` varchar(100) NOT NULL,
  `codigo_prestacion` varchar(50) NOT NULL,
  `nombre_prestacion` varchar(100) NOT NULL,
  `fecha_solicitud` datetime NOT NULL,
  `fecha_validacion` datetime DEFAULT NULL,
  `resultado` enum('aprobado','rechazado','pendiente','error') NOT NULL DEFAULT 'pendiente',
  `porcentaje_cobertura` decimal(5,2) DEFAULT NULL,
  `monto_cobertura` decimal(10,2) DEFAULT NULL,
  `copago_paciente` decimal(10,2) DEFAULT NULL,
  `codigo_autorizacion` varchar(50) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `datos_respuesta_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`datos_respuesta_json`)),
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `solicitado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_validacion`),
  KEY `fk_validacion_centro_idx` (`id_centro`),
  KEY `fk_validacion_paciente_idx` (`id_paciente`),
  KEY `fk_validacion_cita_idx` (`id_cita`),
  KEY `fk_validacion_procedimiento_idx` (`id_procedimiento`),
  KEY `fk_validacion_solicitante_idx` (`solicitado_por`),
  KEY `idx_validacion_tipo` (`tipo_validacion`),
  KEY `idx_validacion_entidad` (`entidad_financiadora`),
  KEY `idx_validacion_codigo` (`codigo_prestacion`),
  KEY `idx_validacion_fechas` (`fecha_solicitud`,`fecha_validacion`),
  KEY `idx_validacion_resultado` (`resultado`),
  KEY `idx_validacion_autorizacion` (`codigo_autorizacion`),
  CONSTRAINT `fk_validacion_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_validacion_cita` FOREIGN KEY (`id_cita`) REFERENCES `citas` (`id_cita`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_validacion_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_validacion_procedimiento` FOREIGN KEY (`id_procedimiento`) REFERENCES `procedimientos` (`id_procedimiento`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_validacion_solicitante` FOREIGN KEY (`solicitado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Validaciones de cobertura con aseguradoras';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `validaciones_cobertura`
--

LOCK TABLES `validaciones_cobertura` WRITE;
/*!40000 ALTER TABLE `validaciones_cobertura` DISABLE KEYS */;
/*!40000 ALTER TABLE `validaciones_cobertura` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `valoraciones_medicas`
--

DROP TABLE IF EXISTS `valoraciones_medicas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `valoraciones_medicas` (
  `id_valoracion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_medico` int(10) unsigned NOT NULL,
  `id_paciente` int(10) unsigned DEFAULT NULL,
  `id_cita` int(10) unsigned DEFAULT NULL,
  `calificacion` tinyint(3) unsigned NOT NULL COMMENT '1 a 5',
  `comentario` text DEFAULT NULL,
  `anonimo` tinyint(1) NOT NULL DEFAULT 0,
  `estado` enum('visible','oculta','reportada') NOT NULL DEFAULT 'visible',
  `fecha_valoracion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_valoracion`),
  KEY `fk_val_medico_idx` (`id_medico`),
  KEY `fk_val_paciente_idx` (`id_paciente`),
  KEY `fk_val_cita_idx` (`id_cita`),
  KEY `idx_val_estado` (`estado`),
  KEY `idx_val_calificacion` (`calificacion`),
  CONSTRAINT `fk_val_cita` FOREIGN KEY (`id_cita`) REFERENCES `citas` (`id_cita`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_val_medico` FOREIGN KEY (`id_medico`) REFERENCES `medicos` (`id_medico`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_val_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Valoraciones que dejan los pacientes sobre el médico (rating 1-5)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `valoraciones_medicas`
--

LOCK TABLES `valoraciones_medicas` WRITE;
/*!40000 ALTER TABLE `valoraciones_medicas` DISABLE KEYS */;
/*!40000 ALTER TABLE `valoraciones_medicas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `valores_referencia`
--

DROP TABLE IF EXISTS `valores_referencia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `valores_referencia` (
  `id_valor_referencia` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_tipo_examen` int(10) unsigned NOT NULL,
  `parametro` varchar(100) NOT NULL,
  `sexo` enum('todos','masculino','femenino') NOT NULL DEFAULT 'todos',
  `edad_minima` decimal(5,2) DEFAULT NULL,
  `edad_maxima` decimal(5,2) DEFAULT NULL,
  `unidad_edad` varchar(20) DEFAULT 'años',
  `valor_minimo` decimal(15,4) DEFAULT NULL,
  `valor_maximo` decimal(15,4) DEFAULT NULL,
  `valor_texto` varchar(255) DEFAULT NULL,
  `unidad_medida` varchar(20) DEFAULT NULL,
  `interpretacion` text DEFAULT NULL,
  `nivel_alerta_bajo` decimal(15,4) DEFAULT NULL,
  `nivel_alerta_alto` decimal(15,4) DEFAULT NULL,
  `nivel_critico_bajo` decimal(15,4) DEFAULT NULL,
  `nivel_critico_alto` decimal(15,4) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_actualizacion` date NOT NULL,
  `fuente` varchar(255) DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_valor_referencia`),
  KEY `fk_valref_tipo_idx` (`id_tipo_examen`),
  KEY `fk_valref_creador_idx` (`creado_por`),
  KEY `idx_valref_parametro` (`parametro`),
  KEY `idx_valref_sexo` (`sexo`),
  KEY `idx_valref_edades` (`edad_minima`,`edad_maxima`),
  KEY `idx_valref_activo` (`activo`),
  CONSTRAINT `fk_valref_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_valref_tipo` FOREIGN KEY (`id_tipo_examen`) REFERENCES `tipos_examenes` (`id_tipo_examen`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Valores de referencia por examen';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `valores_referencia`
--

LOCK TABLES `valores_referencia` WRITE;
/*!40000 ALTER TABLE `valores_referencia` DISABLE KEYS */;
/*!40000 ALTER TABLE `valores_referencia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `webhooks`
--

DROP TABLE IF EXISTS `webhooks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `webhooks` (
  `id_webhook` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_centro` int(10) unsigned NOT NULL,
  `id_api` int(10) unsigned DEFAULT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `url_destino` varchar(255) NOT NULL,
  `eventos` varchar(255) NOT NULL,
  `formato_payload` enum('json','xml','form','custom') NOT NULL DEFAULT 'json',
  `cabeceras_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`cabeceras_json`)),
  `formato_respuesta` varchar(20) DEFAULT NULL,
  `estado` enum('activo','inactivo','pausado','error') NOT NULL DEFAULT 'activo',
  `metodo_http` enum('POST','PUT','PATCH','GET') NOT NULL DEFAULT 'POST',
  `secreto` varchar(255) DEFAULT NULL,
  `es_seguro` tinyint(1) NOT NULL DEFAULT 1,
  `reintentar` tinyint(1) NOT NULL DEFAULT 1,
  `max_intentos` int(10) unsigned NOT NULL DEFAULT 3,
  `ultimo_intento` datetime DEFAULT NULL,
  `proxima_ejecucion` datetime DEFAULT NULL,
  `ultimo_resultado` varchar(255) DEFAULT NULL,
  `timeout_segundos` int(10) unsigned NOT NULL DEFAULT 30,
  `condiciones_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`condiciones_json`)),
  `filtro_contenido` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_webhook`),
  KEY `fk_webhook_centro_idx` (`id_centro`),
  KEY `fk_webhook_api_idx` (`id_api`),
  KEY `fk_webhook_creador_idx` (`creado_por`),
  KEY `idx_webhook_estado` (`estado`),
  KEY `idx_webhook_seguro` (`es_seguro`),
  KEY `idx_webhook_formato` (`formato_payload`),
  KEY `idx_webhook_metodo` (`metodo_http`),
  KEY `idx_webhook_intentos` (`ultimo_intento`,`proxima_ejecucion`),
  CONSTRAINT `fk_webhook_api` FOREIGN KEY (`id_api`) REFERENCES `apis_configuracion` (`id_api`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_webhook_centro` FOREIGN KEY (`id_centro`) REFERENCES `centros_medicos` (`id_centro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_webhook_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Configuración de webhooks';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `webhooks`
--

LOCK TABLES `webhooks` WRITE;
/*!40000 ALTER TABLE `webhooks` DISABLE KEYS */;
/*!40000 ALTER TABLE `webhooks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `v_auditorias_resumen`
--

/*!50001 DROP VIEW IF EXISTS `v_auditorias_resumen`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_auditorias_resumen` AS select `auditorias`.`id_auditoria` AS `id_auditoria`,`auditorias`.`modulo` AS `modulo`,`auditorias`.`accion` AS `accion`,`auditorias`.`resultado` AS `resultado`,`auditorias`.`nivel_criticidad` AS `nivel_criticidad`,`auditorias`.`fecha_hora` AS `fecha_hora`,`auditorias`.`id_usuario` AS `id_usuario`,`auditorias`.`id_centro` AS `id_centro`,`auditorias`.`entorno` AS `entorno`,`auditorias`.`ip_origen` AS `ip_origen`,`auditorias`.`afecta_datos_sensibles` AS `afecta_datos_sensibles`,`auditorias`.`requiere_revision` AS `requiere_revision`,`auditorias`.`revisado` AS `revisado`,`auditorias`.`sincronizado_cloud` AS `sincronizado_cloud` from `auditorias` order by `auditorias`.`fecha_hora` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_pacientes_con_prevision`
--

/*!50001 DROP VIEW IF EXISTS `v_pacientes_con_prevision`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_pacientes_con_prevision` AS select `p`.`id_paciente` AS `id_paciente`,concat(`p`.`nombre`,' ',`p`.`apellido_paterno`,' ',ifnull(`p`.`apellido_materno`,'')) AS `nombre_completo`,`p`.`rut` AS `rut`,`ps`.`nombre` AS `nombre_prevision`,`ps`.`tipo` AS `tipo_prevision`,`ps`.`cobertura` AS `cobertura`,`ps`.`activo` AS `prevision_activa` from (`pacientes` `p` left join `previsiones_salud` `ps` on(`p`.`prevision_salud` = `ps`.`codigo`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-07  9:18:58
