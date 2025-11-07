// frontend/src/app/(dashboard)/admin/facturacion/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar, Search, Filter, Download, Printer, FileText, Eye, Edit2, Trash2,
  X, Plus, DollarSign, TrendingUp, AlertCircle, CheckCircle2, Clock,
  CreditCard, XCircle, Sun, Moon, BarChart3, User,
  ChevronDown, ChevronUp, RefreshCw   // 🔄 Import faltante
} from "lucide-react";

/* ==================== TIPOS ==================== */
type Theme = "light" | "dark";
type Estado = "emitida" | "pagada" | "anulada" | "vencida" | "parcial" | "en_revision";
type TipoDocumento = "factura" | "boleta" | "presupuesto" | "nota_credito" | "nota_debito";
type Moneda = "CLP" | "USD" | "EUR";

interface Factura {
  id_factura: number;
  id_centro: number;
  id_paciente: number;
  numero_factura: string | null;
  tipo_documento: TipoDocumento;
  fecha_emision: string;
  fecha_vencimiento: string | null;
  estado: Estado;
  subtotal: number;
  impuestos: number;
  descuentos: number;
  total: number;
  pagado: number;
  saldo: number;
  metodo_pago: string | null;
  fecha_pago: string | null;
  referencia_pago: string | null;
  moneda: Moneda;
  notas: string | null;
  id_convenio: number | null;
  id_aseguradora: number | null;
  cobertura_seguro: number | null; // % (0-100)
  emitida_electronica: number; // 0/1
  url_documento: string | null;
  enviada_paciente: number; // 0/1
  fecha_envio: string | null;
  creado_por: number | null;
  fecha_creacion: string;
  fecha_modificacion: string;

  // Join opcionales
  paciente_rut?: string;
  paciente_nombre?: string;
  paciente_email?: string;
  paciente_telefono?: string;
  centro_nombre?: string;
  creador_nombre?: string;
}

interface FacturaDetalle {
  id_detalle: number;
  id_factura: number;
  tipo_item: string;
  codigo_item: string | null;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;   // cantidad * precio_unitario
  descuento: number;  // valor absoluto
  impuesto: number;   // valor absoluto
  total: number;      // subtotal - descuento + impuesto
  id_cita: number | null;
  id_procedimiento: number | null;
  id_examen: number | null;
  id_producto: number | null;
  notas: string | null;
  fecha_servicio: string | null;
}

interface Transaccion {
  id_transaccion: number;
  id_centro: number;
  id_factura: number | null;
  id_paciente: number | null;
  id_metodo_pago: number | null;
  fecha_transaccion: string;
  monto: number;
  moneda: Moneda;
  tipo_transaccion: "pago" | "reembolso" | "anulacion" | "cargo" | "abono";
  estado: "pendiente" | "aprobada" | "rechazada" | "anulada" | "procesando" | "error";
  codigo_autorizacion: string | null;
  numero_referencia: string | null;
  descripcion: string | null;
  metodo_pago_nombre?: string;
}

interface Estadisticas {
  total_facturas: number;
  total_facturado: number;
  total_pagado: number;
  total_pendiente: number;
  facturas_emitidas: number;
  facturas_pagadas: number;
  facturas_vencidas: number;
  facturas_anuladas: number;
  tasa_cobro: number;
  promedio_dias_pago: number;
}

interface Opciones {
  centros: Array<{ value: number; label: string }>;
  pacientes: Array<{ value: number; label: string; rut: string; email: string }>;
  metodosPago: Array<{ value: number; label: string; tipo: string }>;
  convenios: Array<{ value: number; label: string }>;
  estados: Array<{ value: Estado; label: string }>;
  tiposDocumento: Array<{ value: TipoDocumento; label: string }>;
  monedas: Array<{ value: Moneda; label: string; simbolo: string }>;
}

/* ==================== COMPONENTE ==================== */
export default function FacturacionPage() {
  /* ---------- Helpers numéricos seguros ---------- */
  const toNumber = (value: any, def = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : def;
  };
  const safeInt = (v: any) => Math.round(toNumber(v, 0));
  const safeFix = (v: any, d = 0) => toNumber(v, 0).toFixed(d);

  /* ---------- Tema ---------- */
  const [theme, setTheme] = useState<Theme>("light");
  useEffect(() => {
    const t = (localStorage.getItem("theme-facturacion") as Theme) ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(t);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme-facturacion", theme);
  }, [theme]);
  const toggleTheme = () => setTheme(t => (t === "light" ? "dark" : "light"));

  /* ---------- Estado base ---------- */
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<Estadisticas>({
    total_facturas: 0, total_facturado: 0, total_pagado: 0, total_pendiente: 0,
    facturas_emitidas: 0, facturas_pagadas: 0, facturas_vencidas: 0, facturas_anuladas: 0,
    tasa_cobro: 0, promedio_dias_pago: 0
  });

  const defaultOpciones: Opciones = {
    centros: [],
    pacientes: [],
    metodosPago: [
      { value: 1, label: "Efectivo", tipo: "presencial" },
      { value: 2, label: "Transferencia", tipo: "bancaria" },
      { value: 3, label: "Tarjeta", tipo: "pos" },
      { value: 4, label: "WebPay", tipo: "online" },
    ],
    convenios: [],
    estados: [
      { value: "emitida", label: "Emitida" },
      { value: "pagada", label: "Pagada" },
      { value: "parcial", label: "Pago parcial" },
      { value: "vencida", label: "Vencida" },
      { value: "en_revision", label: "En revisión" },
      { value: "anulada", label: "Anulada" },
    ],
    tiposDocumento: [
      { value: "factura", label: "Factura" },
      { value: "boleta", label: "Boleta" },
      { value: "presupuesto", label: "Presupuesto" },
      { value: "nota_credito", label: "Nota de crédito" },
      { value: "nota_debito", label: "Nota de débito" },
    ],
    monedas: [
      { value: "CLP", label: "Peso chileno (CLP)", simbolo: "$" },
      { value: "USD", label: "Dólar (USD)", simbolo: "US$" },
      { value: "EUR", label: "Euro (EUR)", simbolo: "€" },
    ],
  };

  const usuario = { rol: "SuperAdmin" };


  const [opciones, setOpciones] = useState<Opciones>(defaultOpciones);

  /* ---------- Filtros ---------- */
  const [fCentro, setFCentro] = useState<number | "">("");
  const [fPaciente, setFPaciente] = useState<number | "">("");
  const [fEstado, setFEstado] = useState<Estado | "">("");
  const [fTipoDocumento, setFTipoDocumento] = useState<TipoDocumento | "">("");
  const [fMetodoPago, setFMetodoPago] = useState<number | "">("");
  const [fDesde, setFDesde] = useState("");
  const [fHasta, setFHasta] = useState("");
  const [fSearch, setFSearch] = useState("");
  const [fMoneda, setFMoneda] = useState<Moneda | "">("");
  const [fEmitidaElectronica, setFEmitidaElectronica] = useState<"" | "0" | "1">("");
  const [fEnviadaPaciente, setFEnviadaPaciente] = useState<"" | "0" | "1">("");
  const [fMontoMin, setFMontoMin] = useState("");
  const [fMontoMax, setFMontoMax] = useState("");
  const [fVencidas, setFVencidas] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  /* ---------- Modales ---------- */
  const [showDashboard, setShowDashboard] = useState(true);
  const [vista, setVista] = useState<"tabla" | "tarjetas">("tabla");

  const [showModalCrear, setShowModalCrear] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [showModalDetalle, setShowModalDetalle] = useState(false);
  const [showModalPago, setShowModalPago] = useState(false);
  const [showModalAnular, setShowModalAnular] = useState(false);

  const [facturaDetalle, setFacturaDetalle] = useState<Factura | null>(null);
  const [detallesFactura, setDetallesFactura] = useState<FacturaDetalle[]>([]);
  const [transaccionesFactura, setTransaccionesFactura] = useState<Transaccion[]>([]);

  const [facturaEditar, setFacturaEditar] = useState<Factura | null>(null);
  const [editDetalles, setEditDetalles] = useState<FacturaDetalle[]>([]);

  const [facturaPago, setFacturaPago] = useState<Factura | null>(null);
  const [pagoMonto, setPagoMonto] = useState<string>("");
  const [pagoMetodo, setPagoMetodo] = useState<number | "">("");
  const [pagoFecha, setPagoFecha] = useState<string>("");
  const [pagoReferencia, setPagoReferencia] = useState<string>("");

  const [facturaAnular, setFacturaAnular] = useState<Factura | null>(null);
  const [anularMotivo, setAnularMotivo] = useState<string>("");

  /* ---------- Crear: formulario ---------- */
  const [crearForm, setCrearForm] = useState<Partial<Factura>>({
    id_centro: 0,
    id_paciente: 0,
    tipo_documento: "factura",
    moneda: "CLP",
    fecha_emision: new Date().toISOString().slice(0, 10),
    fecha_vencimiento: null,
    emitida_electronica: 1,
    enviada_paciente: 0,
    id_convenio: null,
    id_aseguradora: null,
    cobertura_seguro: 0,
    notas: "",
  } as Partial<Factura>);

  const [crearDetalles, setCrearDetalles] = useState<FacturaDetalle[]>([
    {
      id_detalle: 0, id_factura: 0, tipo_item: "servicio", codigo_item: null,
      descripcion: "", cantidad: 1, precio_unitario: 0, subtotal: 0, descuento: 0, impuesto: 0, total: 0,
      id_cita: null, id_procedimiento: null, id_examen: null, id_producto: null, notas: null, fecha_servicio: null
    }
  ]);

  /* ==================== Data Fetch ==================== */
  const fetchOpciones = async () => {
    try {
      const res = await fetch("/api/admin/facturacion/opciones");
      if (!res.ok) throw new Error("Opciones no disponibles");
      const data = await res.json();

      // Merge inteligente con defaults (evita undefined)
      setOpciones({
        centros: data?.centros ?? defaultOpciones.centros,
        pacientes: data?.pacientes ?? defaultOpciones.pacientes,
        metodosPago: data?.metodosPago ?? defaultOpciones.metodosPago,
        convenios: data?.convenios ?? defaultOpciones.convenios,
        estados: data?.estados ?? defaultOpciones.estados,
        tiposDocumento: data?.tiposDocumento ?? defaultOpciones.tiposDocumento,
        monedas: data?.monedas ?? defaultOpciones.monedas,
      });
    } catch (e) {
      console.warn("Usando opciones por defecto (fallback).", e);
      setOpciones(defaultOpciones);
    }
  };

  const fetchFacturas = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("pagina", String(pagina));
      params.append("pageSize", String(pageSize));
      if (fCentro) params.append("id_centro", String(fCentro));
      if (fPaciente) params.append("id_paciente", String(fPaciente));
      if (fEstado) params.append("estado", String(fEstado));
      if (fTipoDocumento) params.append("tipo_documento", String(fTipoDocumento));
      if (fMetodoPago) params.append("id_metodo_pago", String(fMetodoPago));
      if (fDesde) params.append("desde", fDesde);
      if (fHasta) params.append("hasta", fHasta);
      if (fSearch) params.append("search", fSearch);
      if (fMoneda) params.append("moneda", fMoneda);
      if (fEmitidaElectronica) params.append("emitida_electronica", fEmitidaElectronica);
      if (fEnviadaPaciente) params.append("enviada_paciente", fEnviadaPaciente);
      if (fMontoMin) params.append("monto_min", fMontoMin);
      if (fMontoMax) params.append("monto_max", fMontoMax);
      if (fVencidas) params.append("vencidas", "1");

      const res = await fetch(`/api/admin/facturacion?${params.toString()}`);
      const data = await res.json();

      if (data?.success) {
        setFacturas(data.facturas || []);
        setTotal(data.total || 0);
        setPagina(data.pagina || 1);
        const s = data.stats || {};
        setStats({
          total_facturas: toNumber(s.total_facturas),
          total_facturado: toNumber(s.total_facturado),
          total_pagado: toNumber(s.total_pagado),
          total_pendiente: toNumber(s.total_pendiente),
          facturas_emitidas: toNumber(s.facturas_emitidas),
          facturas_pagadas: toNumber(s.facturas_pagadas),
          facturas_vencidas: toNumber(s.facturas_vencidas),
          facturas_anuladas: toNumber(s.facturas_anuladas),
          tasa_cobro: toNumber(s.tasa_cobro),
          promedio_dias_pago: toNumber(s.promedio_dias_pago),
        });
      } else {
        setFacturas([]);
        setTotal(0);
      }
    } catch (e) {
      console.error("Error facturas:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchFacturaCompleta = async (id: number) => {
    const res = await fetch(`/api/admin/facturacion/${id}`);
    const data = await res.json();
    if (data?.success) {
      return {
        factura: data.factura as Factura,
        detalles: (data.detalles || []) as FacturaDetalle[],
        transacciones: (data.transacciones || []) as Transaccion[],
      };
    }
    throw new Error(data?.error || "No se pudo cargar la factura");
  };

  useEffect(() => {
    fetchOpciones();
  }, []);
  useEffect(() => {
    fetchFacturas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagina, fCentro, fPaciente, fEstado, fTipoDocumento, fMetodoPago, fDesde, fHasta, fSearch, fMoneda, fEmitidaElectronica, fEnviadaPaciente, fMontoMin, fMontoMax, fVencidas]);

  /* ==================== Utils UI ==================== */
  const clearFilters = () => {
    setFCentro(""); setFPaciente(""); setFEstado(""); setFTipoDocumento(""); setFMetodoPago("");
    setFDesde(""); setFHasta(""); setFSearch(""); setFMoneda("");
    setFEmitidaElectronica(""); setFEnviadaPaciente("");
    setFMontoMin(""); setFMontoMax(""); setFVencidas(false); setPagina(1);
  };

  const exportCSV = () => {
  // separador para Excel en español
  const SEP = ";";

  // escapador seguro para CSV
  const esc = (v: any) => {
    if (v === null || v === undefined) return "";
    const s = String(v).replace(/(\r\n|\n|\r)/g, " ");
    return `"${s.replace(/"/g, '""')}"`;
  };

  // monto con formato que entiende Excel en es-CL
  const fmtMontoExcel = (n: any, moneda: Moneda = "CLP") => {
    const dec = moneda === "CLP" ? 0 : 2;
    const s = Number(n ?? 0).toFixed(dec);
    // Para Excel en español, la coma es decimal:
    return s.replace(".", ",");
  };

  const headers = ["Número","Tipo","Fecha","Paciente","Total","Pagado","Saldo","Estado"];

  const rows = facturas.map(f => [
    // evita el “—” tipográfico; usa cadena vacía o guion normal
    f.numero_factura || "",
    f.tipo_documento,
    new Date((f.fecha_emision ?? "") + "T00:00:00").toLocaleDateString("es-CL"),
    f.paciente_nombre || "",
    fmtMontoExcel(f.total,  (f.moneda as Moneda) || "CLP"),
    fmtMontoExcel(f.pagado, (f.moneda as Moneda) || "CLP"),
    fmtMontoExcel(f.saldo,  (f.moneda as Moneda) || "CLP"),
    f.estado,
  ]);

  const body =
    [headers.map(esc).join(SEP)]
      .concat(rows.map(r => r.map(esc).join(SEP)))
      .join("\r\n");

  // BOM UTF-8 para que Excel respete tildes y caracteres especiales
  const blob = new Blob(["\uFEFF", body], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `facturas_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};


  const formatMonto = (monto: number, moneda: Moneda = "CLP") => {
    const simbolos: Record<Moneda,string> = { CLP: "$", USD: "US$", EUR: "€" };
    return `${simbolos[moneda]}${safeInt(monto).toLocaleString()}`;
  };

  const getBadgeColor = (estado: Estado) => {
    switch (estado) {
      case "pagada": return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700";
      case "emitida": return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700";
      case "vencida": return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700";
      case "parcial": return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700";
      case "anulada": return "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600";
      case "en_revision": return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700";
      default: return "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600";
    }
  };

  const StatCard = ({
    icon: Icon, label, value, color, subtitle,
  }: { icon: any; label: string; value: string | number; color: "blue"|"green"|"purple"|"orange"|"red"; subtitle?: string; }) => {
    const colors = {
      blue: "from-blue-500 to-cyan-500",
      green: "from-green-500 to-emerald-500",
      purple: "from-purple-500 to-pink-500",
      orange: "from-orange-500 to-red-500",
      red: "from-red-500 to-rose-500",
    };
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
            {!!subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color]}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    );
  };

  /* ==================== Cálculo de totales (crear/editar) ==================== */
  const IVA_PORCENTAJE_DEFAULT = 19; // Chile
  const recomputeDetalle = (d: FacturaDetalle, ivaPorc = IVA_PORCENTAJE_DEFAULT) => {
    const cantidad = Math.max(0, toNumber(d.cantidad, 0));
    const precio  = Math.max(0, toNumber(d.precio_unitario, 0));
    const subtotal = cantidad * precio;
    const descuento = Math.max(0, toNumber(d.descuento, 0)); // valor absoluto
    const base = Math.max(0, subtotal - descuento);
    const impuesto = Math.round((base * ivaPorc) / 100);
    const total = Math.max(0, base + impuesto);
    return { ...d, cantidad, precio_unitario: precio, subtotal, descuento, impuesto, total };
  };

  const aggregateTotales = (detalles: FacturaDetalle[], coberturaSeguroPct = 0) => {
    const subtotal = detalles.reduce((acc, d) => acc + toNumber(d.subtotal, 0), 0);
    const descuentos = detalles.reduce((acc, d) => acc + toNumber(d.descuento, 0), 0);
    const impuestos = detalles.reduce((acc, d) => acc + toNumber(d.impuesto, 0), 0);
    const bruto = subtotal - descuentos + impuestos;
    const cobertura = Math.round((bruto * Math.max(0, Math.min(100, coberturaSeguroPct))) / 100);
    const total = Math.max(0, bruto - cobertura);
    return { subtotal, descuentos, impuestos, total, cobertura };
  };

  /* ==================== Acciones fila ==================== */
  const onCreate = () => {
    setCrearForm(f => ({
      ...f,
      fecha_emision: new Date().toISOString().slice(0, 10),
      fecha_vencimiento: f?.fecha_vencimiento || null,
    }));
    setCrearDetalles(d => d.length ? d : [recomputeDetalle({
      id_detalle: 0, id_factura: 0, tipo_item: "servicio", codigo_item: null,
      descripcion: "", cantidad: 1, precio_unitario: 0, subtotal: 0, descuento: 0, impuesto: 0, total: 0,
      id_cita: null, id_procedimiento: null, id_examen: null, id_producto: null, notas: null, fecha_servicio: null
    })]);
    setShowModalCrear(true);
  };

  const onEdit = async (factura: Factura) => {
    try {
      const data = await fetchFacturaCompleta(factura.id_factura);
      setFacturaEditar(data.factura);
      setEditDetalles(data.detalles.map(d => recomputeDetalle(d)));
      setShowModalEditar(true);
    } catch (e: any) {
      alert("No se pudo cargar la factura para edición: " + e?.message);
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta factura permanentemente?")) return;
    try {
      const res = await fetch(`/api/admin/facturacion/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data?.success) {
        fetchFacturas();
      } else alert(data?.error || "Error al eliminar");
    } catch (e) {
      alert("Error al eliminar");
      console.error(e);
    }
  };

  const onVerDetalle = async (factura: Factura) => {
    try {
      const data = await fetchFacturaCompleta(factura.id_factura);
      setFacturaDetalle(data.factura);
      setDetallesFactura(data.detalles);
      setTransaccionesFactura(data.transacciones);
      setShowModalDetalle(true);
    } catch (e: any) {
      alert("No se pudo cargar el detalle: " + e?.message);
    }
  };

  const onRegistrarPago = (factura: Factura) => {
    setFacturaPago(factura);
    setPagoMonto(String(Math.max(0, factura.saldo)));
    setPagoMetodo("");
    setPagoFecha(new Date().toISOString().slice(0, 16)); // datetime-local
    setPagoReferencia("");
    setShowModalPago(true);
  };

  const onAnular = (factura: Factura) => {
    setFacturaAnular(factura);
    setAnularMotivo("");
    setShowModalAnular(true);
  };

  /* ==================== Submit Crear ==================== */
  const crearTotales = useMemo(() => {
    return aggregateTotales(
      crearDetalles,
      toNumber(crearForm.cobertura_seguro || 0, 0)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crearDetalles, crearForm.cobertura_seguro]);

  const handleCrearDetalleChange = (idx: number, patch: Partial<FacturaDetalle>) => {
    setCrearDetalles(prev => {
      const arr = [...prev];
      arr[idx] = recomputeDetalle({ ...arr[idx], ...patch });
      return arr;
    });
  };
  const addCrearDetalle = () => {
    setCrearDetalles(prev => [...prev, recomputeDetalle({
      id_detalle: 0, id_factura: 0, tipo_item: "servicio", codigo_item: null,
      descripcion: "", cantidad: 1, precio_unitario: 0, subtotal: 0, descuento: 0, impuesto: 0, total: 0,
      id_cita: null, id_procedimiento: null, id_examen: null, id_producto: null, notas: null, fecha_servicio: null
    })]);
  };
  const removeCrearDetalle = (idx: number) => {
    setCrearDetalles(prev => prev.filter((_, i) => i !== idx));
  };

  const submitCrear = async () => {
    try {
      if (!crearForm.id_centro || !crearForm.id_paciente) {
        alert("Selecciona centro y paciente.");
        return;
      }
      if (!crearDetalles.length || !crearDetalles.every(d => d.descripcion && d.cantidad > 0)) {
        alert("Agrega al menos un ítem con descripción y cantidad > 0.");
        return;
      }
      const payload = {
        factura: {
          id_centro: crearForm.id_centro,
          id_paciente: crearForm.id_paciente,
          tipo_documento: crearForm.tipo_documento || "factura",
          fecha_emision: crearForm.fecha_emision,
          fecha_vencimiento: crearForm.fecha_vencimiento,
          estado: "emitida" as Estado,
          moneda: crearForm.moneda || "CLP",
          subtotal: crearTotales.subtotal,
          impuestos: crearTotales.impuestos,
          descuentos: crearTotales.descuentos,
          total: crearTotales.total,
          emitida_electronica: crearForm.emitida_electronica ? 1 : 0,
          enviada_paciente: crearForm.enviada_paciente ? 1 : 0,
          id_convenio: crearForm.id_convenio || null,
          id_aseguradora: crearForm.id_aseguradora || null,
          cobertura_seguro: toNumber(crearForm.cobertura_seguro || 0, 0),
          notas: crearForm.notas || null,
        },
        detalles: crearDetalles.map(d => ({
          tipo_item: d.tipo_item,
          codigo_item: d.codigo_item,
          descripcion: d.descripcion,
          cantidad: d.cantidad,
          precio_unitario: d.precio_unitario,
          subtotal: d.subtotal,
          descuento: d.descuento,
          impuesto: d.impuesto,
          total: d.total,
          id_cita: d.id_cita, id_procedimiento: d.id_procedimiento, id_examen: d.id_examen, id_producto: d.id_producto,
          notas: d.notas, fecha_servicio: d.fecha_servicio
        }))
      };

      const res = await fetch("/api/admin/facturacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data?.success) {
        setShowModalCrear(false);
        setCrearDetalles(prev => prev.length ? [prev[0]] : []);
        fetchFacturas();
      } else {
        alert(data?.error || "No se pudo crear la factura");
      }
    } catch (e) {
      console.error(e);
      alert("Error al crear la factura");
    }
  };

  /* ==================== Submit Editar ==================== */
  const editarTotales = useMemo(() => {
    if (!facturaEditar) return { subtotal: 0, descuentos: 0, impuestos: 0, total: 0, cobertura: 0 };
    return aggregateTotales(editDetalles, toNumber(facturaEditar.cobertura_seguro || 0, 0));
  }, [editDetalles, facturaEditar]);

  const handleEditDetalleChange = (idx: number, patch: Partial<FacturaDetalle>) => {
    setEditDetalles(prev => {
      const arr = [...prev];
      arr[idx] = recomputeDetalle({ ...arr[idx], ...patch });
      return arr;
    });
  };
  const addEditDetalle = () => {
    setEditDetalles(prev => [...prev, recomputeDetalle({
      id_detalle: 0, id_factura: facturaEditar?.id_factura || 0, tipo_item: "servicio", codigo_item: null,
      descripcion: "", cantidad: 1, precio_unitario: 0, subtotal: 0, descuento: 0, impuesto: 0, total: 0,
      id_cita: null, id_procedimiento: null, id_examen: null, id_producto: null, notas: null, fecha_servicio: null
    })]);
  };
  const removeEditDetalle = (idx: number) => {
    setEditDetalles(prev => prev.filter((_, i) => i !== idx));
  };

  const submitEditar = async () => {
    if (!facturaEditar) return;
    try {
      if (!editDetalles.length || !editDetalles.every(d => d.descripcion && d.cantidad > 0)) {
        alert("Agrega al menos un ítem con descripción y cantidad > 0.");
        return;
      }
      const payload = {
        factura: {
          ...facturaEditar,
          subtotal: editarTotales.subtotal,
          impuestos: editarTotales.impuestos,
          descuentos: editarTotales.descuentos,
          total: editarTotales.total,
        },
        detalles: editDetalles.map(d => ({
          id_detalle: d.id_detalle || null,
          tipo_item: d.tipo_item,
          codigo_item: d.codigo_item,
          descripcion: d.descripcion,
          cantidad: d.cantidad,
          precio_unitario: d.precio_unitario,
          subtotal: d.subtotal,
          descuento: d.descuento,
          impuesto: d.impuesto,
          total: d.total,
          id_cita: d.id_cita, id_procedimiento: d.id_procedimiento, id_examen: d.id_examen, id_producto: d.id_producto,
          notas: d.notas, fecha_servicio: d.fecha_servicio
        }))
      };

      const res = await fetch(`/api/admin/facturacion/${facturaEditar.id_factura}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data?.success) {
        setShowModalEditar(false);
        setFacturaEditar(null);
        setEditDetalles([]);
        fetchFacturas();
      } else alert(data?.error || "No se pudo editar la factura");
    } catch (e) {
      console.error(e);
      alert("Error al editar la factura");
    }
  };
/* ==================== Submit Pagar & Anular ==================== */
const submitPago = async () => {
  if (!facturaPago) return;

  try {
    const monto = Number(pagoMonto);
    if (isNaN(monto) || monto <= 0) {
      alert("Monto inválido. Ingrese un valor numérico mayor que cero.");
      return;
    }

    if (!pagoMetodo) {
      alert("Selecciona un método de pago válido.");
      return;
    }

    // Convertir fecha al formato MySQL compatible (YYYY-MM-DD HH:MM:SS)
    const fecha = pagoFecha
      ? new Date(pagoFecha)
      : new Date();
    const fechaMySQL = fecha.toISOString().slice(0, 19).replace("T", " ");

    const payload = {
      monto,
      id_metodo_pago: Number(pagoMetodo),
      fecha_transaccion: fechaMySQL,
      numero_referencia: pagoReferencia?.trim() || null,
      moneda: facturaPago.moneda || "CLP",
    };

    const res = await fetch(`/api/admin/facturacion/${facturaPago.id_factura}/pagar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok && data?.success) {
      setShowModalPago(false);
      setFacturaPago(null);
      fetchFacturas();
    } else {
      console.error("Error en registro de pago:", data);
      alert(data?.error || "No se pudo registrar el pago. Verifique los datos.");
    }
  } catch (e: any) {
    console.error("Error inesperado al registrar pago:", e);
    alert("Error al registrar pago. Detalle en consola.");
  }
};


  const submitAnular = async () => {
    if (!facturaAnular) return;
    try {
      if (!anularMotivo || anularMotivo.trim().length < 5) {
        alert("Indica un motivo (mínimo 5 caracteres).");
        return;
      }
      const res = await fetch(`/api/admin/facturacion/${facturaAnular.id_factura}/anular`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motivo: anularMotivo })
      });
      const data = await res.json();
      if (data?.success) {
        setShowModalAnular(false);
        setFacturaAnular(null);
        setAnularMotivo("");
        fetchFacturas();
      } else alert(data?.error || "No se pudo anular");
    } catch (e) {
      console.error(e);
      alert("Error al anular");
    }
  };

  /* ==================== RENDER ==================== */
  return (
    <div className={`min-h-screen p-6 transition-colors duration-200 ${
      theme === "dark" ? "bg-gray-900" : "bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50"
    }`}>
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* HEADER */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              💰 Gestión de Facturación
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Sistema integral de facturación y cobros</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme}
              className="p-3 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
              title="Cambiar tema">
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-yellow-400" />}
            </button>
            <button onClick={() => setShowDashboard(s=>!s)}
              className={`p-3 rounded-xl border transition-all shadow-sm ${
                showDashboard
                  ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`} title="Dashboard">
              <BarChart3 className="w-5 h-5" />
            </button>
            <button onClick={onCreate}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all font-semibold">
              <Plus className="w-5 h-5" /> Nueva Factura
            </button>
          </div>
        </header>

        {/* === BOTONES SUPERADMIN === */}
{usuario?.rol === "SuperAdmin" && (
  <div className="flex gap-2">
    <button
      onClick={async () => {
        if (!confirm("¿Reactivar TODAS las facturas anuladas y en revisión?")) return;
        try {
          const res = await fetch("/api/admin/facturacion/reactivar-todas", { method: "POST" });
          const data = await res.json();
          if (data?.success) {
            alert(`✅ ${data.reactivadas} facturas reactivadas correctamente`);
            fetchFacturas();
          } else alert(data?.error || "Error al reactivar facturas");
        } catch (e) {
          console.error(e);
          alert("Error al reactivar facturas");
        }
      }}
      className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all"
    >
      <CheckCircle2 className="w-5 h-5" /> Reactivar todas
    </button>

    <button
      onClick={async () => {
        if (!confirm("¿Desactivar TODAS las facturas (modo auditoría)?")) return;
        try {
          const res = await fetch("/api/admin/facturacion/desactivar-todas", { method: "POST" });
          const data = await res.json();
          if (data?.success) {
            alert(`🧊 ${data.desactivadas} facturas marcadas como inactivas`);
            fetchFacturas();
          } else alert(data?.error || "Error al desactivar facturas");
        } catch (e) {
          console.error(e);
          alert("Error al desactivar facturas");
        }
      }}
      className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-gray-600 to-gray-800 text-white shadow-lg hover:from-gray-700 hover:to-gray-900 transition-all"
    >
      <XCircle className="w-5 h-5" /> Desactivar todas
    </button>
  </div>
)}


        {/* DASHBOARD */}
        {showDashboard && (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
            <StatCard icon={FileText} label="Total Facturas" value={safeInt(stats.total_facturas)} color="blue" />
            <StatCard icon={DollarSign} label="Total Facturado" value={formatMonto(stats.total_facturado)} color="green" subtitle={`${formatMonto(stats.total_pagado)} cobrado`} />
            <StatCard icon={TrendingUp} label="Tasa de Cobro" value={`${safeFix(stats.tasa_cobro,1)}%`} color="purple" subtitle={`${formatMonto(stats.total_pendiente)} pendiente`} />
            <StatCard icon={Clock} label="Días prom. pago" value={`${safeInt(stats.promedio_dias_pago)} días`} color="orange" subtitle={`${safeInt(stats.facturas_vencidas)} vencidas`} />
          </section>
        )}

        {/* BÚSQUEDA & FILTROS */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="flex-1 min-w-[300px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text" placeholder="Buscar por número, paciente, RUT..."
                value={fSearch} onChange={e=>setFSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all"
              />
            </div>

            <button onClick={() => setShowFilters(s=>!s)}
              className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl border font-medium transition-all ${
                showFilters
                  ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400"
                  : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
              }`}>
              <Filter className="w-5 h-5" />
              Filtros
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <button onClick={exportCSV}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all font-medium">
              <Download className="w-5 h-5" /> CSV
            </button>

            <button onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all font-medium">
              <Printer className="w-5 h-5" /> Imprimir
            </button>

            <div className="flex rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden">
              <button onClick={()=>setVista("tabla")}
                className={`px-4 py-3 transition-all ${vista==="tabla" ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400":"bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600"}`} title="Vista tabla">
                <FileText className="w-5 h-5" />
              </button>
              <button onClick={()=>setVista("tarjetas")}
                className={`px-4 py-3 border-l border-gray-200 dark:border-gray-600 transition-all ${vista==="tarjetas" ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400":"bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600"}`} title="Vista tarjetas">
                <Calendar className="w-5 h-5" />
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-in slide-in-from-top duration-200">
              {/* Centro */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Centro</label>
                <select value={fCentro} onChange={e=>setFCentro(e.target.value? Number(e.target.value):"")}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all">
                  <option value="">Todos los centros</option>
                  {opciones.centros.map(c=> <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              {/* Paciente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Paciente</label>
                <select value={fPaciente} onChange={e=>setFPaciente(e.target.value? Number(e.target.value):"")}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all">
                  <option value="">Todos los pacientes</option>
                  {opciones.pacientes.map(p=> <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estado</label>
                <select value={fEstado} onChange={e=>setFEstado(e.target.value as Estado | "")}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all">
                  <option value="">Todos los estados</option>
                  {opciones.estados.map(e=> <option key={e.value} value={e.value}>{e.label}</option>)}
                </select>
              </div>
              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo</label>
                <select value={fTipoDocumento} onChange={e=>setFTipoDocumento(e.target.value as TipoDocumento | "")}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all">
                  <option value="">Todos los tipos</option>
                  {opciones.tiposDocumento.map(t=> <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              {/* Método de pago */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Método de Pago</label>
                <select value={fMetodoPago} onChange={e=>setFMetodoPago(e.target.value? Number(e.target.value):"")}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all">
                  <option value="">Todos los métodos</option>
                  {opciones.metodosPago.map(m=> <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              {/* Moneda */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Moneda</label>
                <select value={fMoneda} onChange={e=>setFMoneda(e.target.value as Moneda | "")}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all">
                  <option value="">Todas</option>
                  {opciones.monedas.map(m=> <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              {/* Fechas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Desde</label>
                <input type="date" value={fDesde} onChange={e=>setFDesde(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hasta</label>
                <input type="date" value={fHasta} onChange={e=>setFHasta(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all" />
              </div>
              {/* Checks */}
              <div className="col-span-1 md:col-span-3 lg:col-span-4 flex flex-wrap gap-4">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={fVencidas} onChange={e=>setFVencidas(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Solo vencidas</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="emitida" checked={fEmitidaElectronica==="1"} onChange={()=>setFEmitidaElectronica("1")}
                    className="w-4 h-4 border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Electrónicas</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="enviada" checked={fEnviadaPaciente==="1"} onChange={()=>setFEnviadaPaciente("1")}
                    className="w-4 h-4 border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Enviadas</span>
                </label>
                <button onClick={clearFilters}
                  className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all text-sm font-medium">
                  <X className="w-4 h-4" /> Limpiar filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {/* CONTENIDO */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {vista === "tabla" ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Número</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Tipo</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Fecha</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Paciente</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Pagado</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Saldo</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
  {facturas.length === 0 ? (
    <tr>
      <td colSpan={9} className="px-6 py-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          No hay facturas para mostrar
        </p>
      </td>
    </tr>
  ) : (
    facturas.map((factura) => (
      <tr
        key={factura.id_factura}
        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        {/* NÚMERO */}
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="font-medium text-gray-900 dark:text-white">
            {factura.numero_factura || "—"}
          </span>
        </td>

        {/* TIPO */}
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
            {factura.tipo_documento.replace("_", " ")}
          </span>
        </td>

        {/* FECHA */}
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
          {new Date(factura.fecha_emision).toLocaleDateString()}
        </td>

        {/* PACIENTE */}
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {factura.paciente_nombre || "—"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {factura.paciente_rut || "—"}
              </p>
            </div>
          </div>
        </td>

        {/* TOTAL */}
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="font-semibold text-gray-900 dark:text-white">
            {formatMonto(factura.total, factura.moneda)}
          </span>
        </td>

        {/* PAGADO */}
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="text-sm text-green-600 dark:text-green-400">
            {formatMonto(factura.pagado, factura.moneda)}
          </span>
        </td>

        {/* SALDO */}
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="text-sm text-orange-600 dark:text-orange-400">
            {formatMonto(factura.saldo, factura.moneda)}
          </span>
        </td>

        {/* ESTADO */}
        <td className="px-6 py-4 whitespace-nowrap">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getBadgeColor(factura.estado)}`}
          >
            {factura.estado === "pagada" && (
              <CheckCircle2 className="w-3 h-3 mr-1" />
            )}
            {factura.estado === "vencida" && (
              <AlertCircle className="w-3 h-3 mr-1" />
            )}
            {factura.estado === "anulada" && (
              <XCircle className="w-3 h-3 mr-1" />
            )}
            {factura.estado.replace("_", " ")}
          </span>
        </td>

        {/* ACCIONES */}
        <td className="px-6 py-4 whitespace-nowrap text-right">
          <div className="flex items-center justify-end gap-2">
            {/* Ver Detalle */}
            <button
              onClick={() => onVerDetalle(factura)}
              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
              title="Ver detalle"
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* Registrar pago / Editar */}
            {factura.estado !== "anulada" && factura.estado !== "pagada" && (
              <>
                <button
                  onClick={() => onRegistrarPago(factura)}
                  className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-all"
                  title="Registrar pago"
                >
                  <CreditCard className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onEdit(factura)}
                  className="p-2 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition-all"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Anular */}
            {factura.estado !== "anulada" && (
              <button
                onClick={() => onAnular(factura)}
                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                title="Anular"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}

            {/* 🔁 Reactivar (solo si está anulada) */}
            {factura.estado === "anulada" && (
              <button
                onClick={async () => {
                  if (
                    !confirm(
                      `¿Reactivar la factura #${factura.numero_factura || factura.id_factura}?`
                    )
                  )
                    return;
                  try {
                    const res = await fetch(
                      `/api/admin/facturacion/${factura.id_factura}/reactivar`,
                      { method: "POST" }
                    );
                    const data = await res.json();
                    if (data?.success) {
                      alert("✅ Factura reactivada correctamente");
                      fetchFacturas();
                    } else {
                      alert(data?.error || "No se pudo reactivar la factura");
                    }
                  } catch (err) {
                    console.error(err);
                    alert("Error al intentar reactivar la factura");
                  }
                }}
                className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-all"
                title="Reactivar factura"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}

            {/* 🔄 Marcar como no pagada (solo si está pagada) */}
            {factura.estado === "pagada" && (
              <button
                onClick={async () => {
                  if (
                    !confirm(
                      `¿Marcar la factura #${factura.numero_factura || factura.id_factura} como NO PAGADA?`
                    )
                  )
                    return;
                  try {
                    const res = await fetch(
                      `/api/admin/facturacion/${factura.id_factura}/marcar-no-pagada`,
                      { method: "POST" }
                    );
                    const data = await res.json();
                    if (data?.success) {
                      alert("⚠️ Factura marcada como no pagada correctamente");
                      fetchFacturas();
                    } else {
                      alert(data?.error || "No se pudo revertir el pago");
                    }
                  } catch (err) {
                    console.error(err);
                    alert("Error al intentar revertir el pago");
                  }
                }}
                className="p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-all"
                title="Marcar como no pagada"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}

            {/* Eliminar */}
            <button
              onClick={() => onDelete(factura.id_factura)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    ))
  )}
</tbody>


                  </table>
                </div>

                {/* Paginación */}
                {total > pageSize && (
                  <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Mostrando {(pagina-1)*pageSize+1} a {Math.min(pagina*pageSize, total)} de {total} facturas
                    </p>
                    <div className="flex gap-2">
                      <button onClick={()=>setPagina(p=>Math.max(1,p-1))} disabled={pagina===1}
                        className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all">Anterior</button>
                      <button onClick={()=>setPagina(p=>p+1)} disabled={pagina*pageSize>=total}
                        className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all">Siguiente</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Tarjetas */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {facturas.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">No hay facturas para mostrar</p>
                  </div>
                ) : (
                  facturas.map(factura => (
                    <div key={factura.id_factura} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">{factura.tipo_documento.replace("_"," ")}</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{factura.numero_factura || "Sin número"}</p>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getBadgeColor(factura.estado)}`}>{factura.estado}</span>
                      </div>
                      <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{factura.paciente_nombre}</p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 ml-6">{factura.paciente_rut}</p>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Total:</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatMonto(factura.total, factura.moneda)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Pagado:</span>
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">{formatMonto(factura.pagado, factura.moneda)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Saldo:</span>
                          <span className="text-sm font-medium text-orange-600 dark:text-orange-400">{formatMonto(factura.saldo, factura.moneda)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(factura.fecha_emision).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button onClick={()=>onVerDetalle(factura)} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all text-sm font-medium">
                          <Eye className="w-4 h-4" /> Ver
                        </button>
                        {factura.estado !== "anulada" && factura.estado !== "pagada" && (
                          <button onClick={()=>onRegistrarPago(factura)} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 transition-all text-sm font-medium">
                            <CreditCard className="w-4 h-4" /> Pagar
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ==================== MODAL CREAR ==================== */}
      {showModalCrear && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Nueva Factura</h3>
              <button onClick={()=>setShowModalCrear(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-6">
              {/* Encabezado */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">Centro *</label>
                  <select
                    value={crearForm.id_centro || 0}
                    onChange={e=>setCrearForm(f=>({...f, id_centro:Number(e.target.value)}))}
                    className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700"
                  >
                    <option value={0}>Selecciona centro</option>
                    {opciones.centros.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">Paciente *</label>
                  <select
                    value={crearForm.id_paciente || 0}
                    onChange={e=>setCrearForm(f=>({...f, id_paciente:Number(e.target.value)}))}
                    className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700"
                  >
                    <option value={0}>Selecciona paciente</option>
                    {opciones.pacientes.map(p=><option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">Tipo doc.</label>
                  <select value={crearForm.tipo_documento || "factura"}
                    onChange={e=>setCrearForm(f=>({...f, tipo_documento: e.target.value as TipoDocumento}))}
                    className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700">
                    {opciones.tiposDocumento.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">Moneda</label>
                  <select value={crearForm.moneda || "CLP"}
                    onChange={e=>setCrearForm(f=>({...f, moneda: e.target.value as Moneda}))}
                    className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700">
                    {opciones.monedas.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">F. Emisión</label>
                  <input type="date" value={crearForm.fecha_emision || ""} onChange={e=>setCrearForm(f=>({...f, fecha_emision:e.target.value}))}
                    className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700"/>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">F. Vencimiento</label>
                  <input type="date" value={crearForm.fecha_vencimiento || ""} onChange={e=>setCrearForm(f=>({...f, fecha_vencimiento:e.target.value || null}))}
                    className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700"/>
                </div>
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center gap-2 mt-6">
                    <input type="checkbox" checked={!!crearForm.emitida_electronica} onChange={e=>setCrearForm(f=>({...f, emitida_electronica: e.target.checked ? 1 : 0}))}/>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Electrónica</span>
                  </label>
                  <label className="inline-flex items-center gap-2 mt-6">
                    <input type="checkbox" checked={!!crearForm.enviada_paciente} onChange={e=>setCrearForm(f=>({...f, enviada_paciente: e.target.checked ? 1 : 0}))}/>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Enviar a paciente</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">Convenio</label>
                  <select value={crearForm.id_convenio || ""} onChange={e=>setCrearForm(f=>({...f, id_convenio: e.target.value? Number(e.target.value): null}))}
                    className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700">
                    <option value="">Sin convenio</option>
                    {opciones.convenios.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">% Cobertura Seguro</label>
                  <input type="number" min={0} max={100} value={crearForm.cobertura_seguro ?? 0}
                    onChange={e=>setCrearForm(f=>({...f, cobertura_seguro: Math.min(100, Math.max(0, Number(e.target.value||0)))}))}
                    className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700"/>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">Notas</label>
                  <textarea value={crearForm.notas || ""} onChange={e=>setCrearForm(f=>({...f, notas:e.target.value}))}
                    className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700" rows={2}/>
                </div>
              </div>

              {/* Ítems */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Ítems</h4>
                  <button onClick={addCrearDetalle} className="px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Agregar ítem</button>
                </div>
                <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  <table className="w-full min-w-[900px]">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold">Descripción</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold">Cant.</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold">Precio</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold">Desc.</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold">Impuesto</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold">Total</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {crearDetalles.map((d, idx)=>(
                        <tr key={idx}>
                          <td className="px-3 py-2">
                            <input value={d.descripcion} onChange={e=>handleCrearDetalleChange(idx,{descripcion:e.target.value})}
                              placeholder="Descripción del servicio/producto"
                              className="w-full px-2 py-2 rounded border dark:border-gray-600 bg-white dark:bg-gray-700"/>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <input type="number" min={0} value={d.cantidad} onChange={e=>handleCrearDetalleChange(idx,{cantidad:Number(e.target.value||0)})}
                              className="w-24 px-2 py-2 rounded border dark:border-gray-600 bg-white dark:bg-gray-700 text-right"/>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <input type="number" min={0} value={d.precio_unitario} onChange={e=>handleCrearDetalleChange(idx,{precio_unitario:Number(e.target.value||0)})}
                              className="w-28 px-2 py-2 rounded border dark:border-gray-600 bg-white dark:bg-gray-700 text-right"/>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <input type="number" min={0} value={d.descuento} onChange={e=>handleCrearDetalleChange(idx,{descuento:Number(e.target.value||0)})}
                              className="w-24 px-2 py-2 rounded border dark:border-gray-600 bg-white dark:bg-gray-700 text-right"/>
                          </td>
                          <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{formatMonto(d.impuesto, crearForm.moneda || "CLP")}</td>
                          <td className="px-3 py-2 text-right font-semibold">{formatMonto(d.total, crearForm.moneda || "CLP")}</td>
                          <td className="px-3 py-2 text-right">
                            <button onClick={()=>removeCrearDetalle(idx)} className="px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300">Quitar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totales */}
                <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/40">
                    <p className="text-xs text-gray-500">Subtotal</p>
                    <p className="text-lg font-bold">{formatMonto(crearTotales.subtotal, crearForm.moneda || "CLP")}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/40">
                    <p className="text-xs text-gray-500">Descuentos</p>
                    <p className="text-lg font-bold">{formatMonto(crearTotales.descuentos, crearForm.moneda || "CLP")}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/40">
                    <p className="text-xs text-gray-500">Impuestos</p>
                    <p className="text-lg font-bold">{formatMonto(crearTotales.impuestos, crearForm.moneda || "CLP")}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/40">
                    <p className="text-xs text-gray-500">Total (menos cobertura)</p>
                    <p className="text-lg font-bold">{formatMonto(crearTotales.total, crearForm.moneda || "CLP")}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={()=>setShowModalCrear(false)} className="px-4 py-2 rounded-lg border dark:border-gray-600">Cancelar</button>
                <button onClick={submitCrear} className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Crear factura</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL EDITAR ==================== */}
      {showModalEditar && facturaEditar && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Editar Factura #{facturaEditar.numero_factura || facturaEditar.id_factura}</h3>
              <button onClick={()=>{ setShowModalEditar(false); setFacturaEditar(null); setEditDetalles([]); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-6">
              {/* Encabezado editable (algunos campos) */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">Estado</label>
                  <select value={facturaEditar.estado} onChange={e=>setFacturaEditar(f=>f?{...f, estado: e.target.value as Estado}:f)}
                    className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700">
                    {opciones.estados.map(e=><option key={e.value} value={e.value}>{e.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">% Cobertura</label>
                  <input type="number" min={0} max={100} value={facturaEditar.cobertura_seguro ?? 0}
                    onChange={e=>setFacturaEditar(f=>f?{...f, cobertura_seguro: Math.min(100, Math.max(0, Number(e.target.value||0)))}:f)}
                    className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700"/>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">Notas</label>
                  <input value={facturaEditar.notas || ""} onChange={e=>setFacturaEditar(f=>f?{...f, notas:e.target.value}:f)}
                    className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700"/>
                </div>
              </div>

              {/* Ítems */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Ítems</h4>
                  <button onClick={addEditDetalle} className="px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Agregar ítem</button>
                </div>
                <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  <table className="w-full min-w-[900px]">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold">Descripción</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold">Cant.</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold">Precio</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold">Desc.</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold">Impuesto</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold">Total</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {editDetalles.map((d, idx)=>(
                        <tr key={idx}>
                          <td className="px-3 py-2">
                            <input value={d.descripcion} onChange={e=>handleEditDetalleChange(idx,{descripcion:e.target.value})}
                              className="w-full px-2 py-2 rounded border dark:border-gray-600 bg-white dark:bg-gray-700"/>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <input type="number" min={0} value={d.cantidad} onChange={e=>handleEditDetalleChange(idx,{cantidad:Number(e.target.value||0)})}
                              className="w-24 px-2 py-2 rounded border dark:border-gray-600 bg-white dark:bg-gray-700 text-right"/>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <input type="number" min={0} value={d.precio_unitario} onChange={e=>handleEditDetalleChange(idx,{precio_unitario:Number(e.target.value||0)})}
                              className="w-28 px-2 py-2 rounded border dark:border-gray-600 bg-white dark:bg-gray-700 text-right"/>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <input type="number" min={0} value={d.descuento} onChange={e=>handleEditDetalleChange(idx,{descuento:Number(e.target.value||0)})}
                              className="w-24 px-2 py-2 rounded border dark:border-gray-600 bg-white dark:bg-gray-700 text-right"/>
                          </td>
                          <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{formatMonto(d.impuesto, facturaEditar.moneda)}</td>
                          <td className="px-3 py-2 text-right font-semibold">{formatMonto(d.total, facturaEditar.moneda)}</td>
                          <td className="px-3 py-2 text-right">
                            <button onClick={()=>removeEditDetalle(idx)} className="px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300">Quitar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totales */}
                <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/40">
                    <p className="text-xs text-gray-500">Subtotal</p>
                    <p className="text-lg font-bold">{formatMonto(editarTotales.subtotal, facturaEditar.moneda)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/40">
                    <p className="text-xs text-gray-500">Descuentos</p>
                    <p className="text-lg font-bold">{formatMonto(editarTotales.descuentos, facturaEditar.moneda)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/40">
                    <p className="text-xs text-gray-500">Impuestos</p>
                    <p className="text-lg font-bold">{formatMonto(editarTotales.impuestos, facturaEditar.moneda)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/40">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-lg font-bold">{formatMonto(editarTotales.total, facturaEditar.moneda)}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={()=>{ setShowModalEditar(false); setFacturaEditar(null); setEditDetalles([]); }} className="px-4 py-2 rounded-lg border dark:border-gray-600">Cancelar</button>
                <button onClick={submitEditar} className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Guardar cambios</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL DETALLE ==================== */}
      {showModalDetalle && facturaDetalle && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Factura #{facturaDetalle.numero_factura || facturaDetalle.id_factura}</h3>
              <button onClick={()=>{ setShowModalDetalle(false); setFacturaDetalle(null); setDetallesFactura([]); setTransaccionesFactura([]); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Paciente</p>
                  <p className="font-medium text-gray-900 dark:text-white">{facturaDetalle.paciente_nombre}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{facturaDetalle.paciente_rut}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Estado</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getBadgeColor(facturaDetalle.estado)}`}>{facturaDetalle.estado}</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Fecha Emisión</p>
                  <p className="font-medium text-gray-900 dark:text-white">{new Date(facturaDetalle.fecha_emision).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{formatMonto(facturaDetalle.total, facturaDetalle.moneda)}</p>
                </div>
              </div>

              {/* Detalles */}
              {detallesFactura.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Detalles</h4>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-semibold">Descripción</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold">Cantidad</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold">Precio Unit.</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {detallesFactura.map(det=>(
                          <tr key={det.id_detalle}>
                            <td className="px-4 py-2 text-sm">{det.descripcion}</td>
                            <td className="px-4 py-2 text-sm text-right">{det.cantidad}</td>
                            <td className="px-4 py-2 text-sm text-right">{formatMonto(det.precio_unitario, facturaDetalle.moneda)}</td>
                            <td className="px-4 py-2 text-sm text-right font-medium">{formatMonto(det.total, facturaDetalle.moneda)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Transacciones */}
              {transaccionesFactura.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Historial de Pagos</h4>
                  <div className="space-y-2">
                    {transaccionesFactura.map(t=>(
                      <div key={t.id_transaccion} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{t.tipo_transaccion}</p>
                          <p className="text-xs text-gray-500">{new Date(t.fecha_transaccion).toLocaleString()} - {t.metodo_pago_nombre || "—"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-green-600 dark:text-green-400">{formatMonto(t.monto, t.moneda)}</p>
                          <p className="text-xs text-gray-500">{t.estado}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL PAGO ==================== */}
      {showModalPago && facturaPago && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Registrar Pago</h3>
              <button onClick={()=>{ setShowModalPago(false); setFacturaPago(null); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">Monto</label>
                <input type="number" min={0} value={pagoMonto} onChange={e=>setPagoMonto(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700"/>
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">Método</label>
                <select value={pagoMetodo} onChange={e=>setPagoMetodo(e.target.value? Number(e.target.value):"")}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700">
                  <option value="">Selecciona método</option>
                  {opciones.metodosPago.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">Fecha</label>
                <input type="datetime-local" value={pagoFecha} onChange={e=>setPagoFecha(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700"/>
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">Referencia</label>
                <input value={pagoReferencia} onChange={e=>setPagoReferencia(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700"/>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={()=>{ setShowModalPago(false); setFacturaPago(null); }} className="px-4 py-2 rounded-lg border dark:border-gray-600">Cancelar</button>
                <button onClick={submitPago} className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Guardar pago</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL ANULAR ==================== */}
      {showModalAnular && facturaAnular && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Anular Factura</h3>
              <button onClick={()=>{ setShowModalAnular(false); setFacturaAnular(null); setAnularMotivo(""); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">Factura #{facturaAnular.numero_factura || facturaAnular.id_factura}</p>
              <div>
                <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">Motivo</label>
                <textarea value={anularMotivo} onChange={e=>setAnularMotivo(e.target.value)} rows={3}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700"/>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={()=>{ setShowModalAnular(false); setFacturaAnular(null); setAnularMotivo(""); }} className="px-4 py-2 rounded-lg border dark:border-gray-600">Cancelar</button>
                <button onClick={submitAnular} className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Anular</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
