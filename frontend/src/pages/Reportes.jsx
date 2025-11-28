// src/pages/Reportes.jsx
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  getUtilizacionMensual,
  getReservasPorCliente,
  getCanchasMasUsadas,
  getReservasPorCancha,
} from "../services/reporteService";
import "../styles/pages.css";
import { generarReportePDF } from "../utils/pdfReportGenerator";
import { usuarioService } from "../services/usuarioService.js";
import { canchaService } from "../services/canchaService.js";
import { set } from "date-fns";

export default function ReportesPage() {
  const [utilizacion, setUtilizacion] = useState([]);
  const [reservasCliente, setReservasCliente] = useState([]);
  const [clienteInfo, setClienteInfo] = useState({});
  const [canchaInfo, setCanchaInfo] = useState({});
  const [canchasMasUsadas, setCanchasMasUsadas] = useState([]);
  const [reservasCancha, setReservasCancha] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modoReservasCliente, setModoReservasCliente] = useState("monto");

  // 🔹 Parámetros
  const [idCliente, setIdCliente] = useState(1);
  const [idCancha, setIdCancha] = useState(1);
  const [fechaInicio, setFechaInicio] = useState("2025-11-01");
  const [fechaFin, setFechaFin] = useState("2025-11-30");
  const [topN, setTopN] = useState(5);
  const [año, setAño] = useState(2025);

  const [clientes, setClientes] = useState([]);
  const [canchas, setCanchas] = useState([]);

  const COLORS = [
    "#0d1b2a",
    "#142b46",
    "#1e3a8a",
    "#2c5282",
    "#35658f",
    "#457b9d",
    "#5a8eb1",
    "#7baac4",
    "#98c1d9",
    "#b2d0e0",
    "#cddde7",
    "#E2E8F0",
  ];

  async function fetchClientes() {
    try {
      const data = await usuarioService.obtenerUsuarios();
      setClientes(data || []);
    } catch (err) {
      console.error("❌ Error al cargar los clientes:", err);
      setClientes([]);
    } finally {
      setLoading(false);
    }
  }
  async function fetchCanchas() {
    try {
      const data = await canchaService.obtenerCanchas();
      setCanchas(data || []);
    } catch (err) {
      console.error("❌ Error al cargar las canchas:", err);
      setCanchas([]);
    } finally {
      setLoading(false);
    }
  }
  // === Handlers para selects ===
  function handleClienteChange(e) {
    const val = e.target.value;
    const parsed = Number(val);
    const id = Number.isNaN(parsed) ? 0 : parsed;
    setIdCliente(id);
    const clienteObj = clientes.find((c) => c.id_usuario === id) || {};
    setClienteInfo(clienteObj);
  }

  function handleCanchaChange(e) {
    const val = e.target.value;
    const parsed = Number(val);
    const id = Number.isNaN(parsed) ? 0 : parsed;
    setIdCancha(id);
    const canchaObj = canchas.find((c) => c.id_cancha === id) || {};
    setCanchaInfo(canchaObj);
  }
  // === Funciones por reporte ===
  async function cargarReservasCliente() {
    if (!idCliente || idCliente < 1) return alert("ID de cliente inválido");
    if (!fechaInicio || !fechaFin) return alert("Seleccioná fechas válidas");
    if (new Date(fechaInicio) > new Date(fechaFin))
      return alert("La fecha inicial no puede ser posterior a la final");

    setLoading(true);
    try {
      const dataCliente = await getReservasPorCliente(
        idCliente,
        fechaInicio,
        fechaFin
      );
      const reservasData = dataCliente?.reservas || [];
      setClienteInfo(dataCliente?.cliente || {});

      const clientesMap = {};
      reservasData.forEach((r) => {
        if (!clientesMap[r.cancha])
          clientesMap[r.cancha] = { monto: 0, cantidad: 0 };
        clientesMap[r.cancha].monto += r.precio_total || 0;
        clientesMap[r.cancha].cantidad += 1;
      });

      const chartReservas = Object.entries(clientesMap).map(
        ([cancha, data]) => ({
          cancha,
          monto: data.monto,
          cantidad: data.cantidad,
        })
      );
      setReservasCliente(chartReservas);
    } catch (err) {
      console.error("❌ Error al cargar reservas por cliente:", err);
      setReservasCliente([]);
      setClienteInfo({});
    } finally {
      setLoading(false);
    }
  }

  async function cargarReservasCancha() {
    if (!idCancha || idCancha < 1) return alert("ID de cancha inválido");
    if (!fechaInicio || !fechaFin) return alert("Seleccioná fechas válidas");
    if (new Date(fechaInicio) > new Date(fechaFin))
      return alert("La fecha inicial no puede ser posterior a la final");

    setLoading(true);
    try {
      const periodo = await getReservasPorCancha(
        idCancha,
        fechaInicio,
        fechaFin
      );
      const reservas = periodo?.reservas || [];

      const fechaInicioObj = new Date(periodo?.desde || fechaInicio);
      const fechaFinObj = new Date(periodo?.hasta || fechaFin);
      const diffDias = (fechaFinObj - fechaInicioObj) / (1000 * 60 * 60 * 24);

      let saltoDias = 1;
      if (diffDias > 60) saltoDias = 30;
      else if (diffDias > 30) saltoDias = 15;
      else if (diffDias > 5) saltoDias = 5;

      const intervalos = [];
      let cursor = new Date(fechaInicioObj);
      while (cursor <= fechaFinObj) {
        const siguiente = new Date(cursor);
        siguiente.setDate(cursor.getDate() + saltoDias);
        intervalos.push({
          inicio: new Date(cursor),
          fin: siguiente < fechaFinObj ? new Date(siguiente) : fechaFinObj,
        });
        cursor = siguiente;
      }

      // Función para formatear fecha como DD/MM
      function formatDate(d) {
        return `${String(d.getDate()).padStart(2, "0")}/${String(
          d.getMonth() + 1
        ).padStart(2, "0")}`;
      }

      const counts = intervalos.map(({ inicio, fin }) => {
        const count = reservas.filter((r) => {
          const fechaReserva = new Date(r.fecha_turno);
          return fechaReserva >= inicio && fechaReserva < fin;
        }).length;

        let etiqueta = "";
        if (saltoDias >= 30) {
          etiqueta = inicio.toLocaleString("default", { month: "short" });
        } else {
          etiqueta = `${formatDate(inicio)}–${formatDate(fin)}`;
        }

        return { periodo: etiqueta, reservas: count };
      });

      setReservasCancha(counts);
    } catch (err) {
      console.error("❌ Error al cargar reservas por cancha:", err);
      setReservasCancha([]);
    } finally {
      setLoading(false);
    }
  }

  async function cargarCanchasMasUsadas() {
    if (!topN || topN < 1) return alert("Top N inválido");
    if (!fechaInicio || !fechaFin) return alert("Seleccioná fechas válidas");
    if (new Date(fechaInicio) > new Date(fechaFin))
      return alert("La fecha inicial no puede ser posterior a la final");

    setLoading(true);
    try {
      const masUsadas = await getCanchasMasUsadas(topN, fechaInicio, fechaFin);
      setCanchasMasUsadas(masUsadas?.ranking || []);
    } catch (err) {
      console.error("❌ Error al cargar canchas más usadas:", err);
      setCanchasMasUsadas([]);
    } finally {
      setLoading(false);
    }
  }

  async function cargarUtilizacion() {
    if (!año || año < 2000 || año > 2100) return alert("Año inválido");
    setLoading(true);
    try {
      const util = await getUtilizacionMensual(año);
      const chartUtil = Object.entries(util || {}).map(([cancha, meses]) => ({
        cancha,
        ...Object.fromEntries((meses || []).map((v, i) => [`Mes ${i + 1}`, v])),
      }));
      setUtilizacion(chartUtil);
    } catch (err) {
      console.error("❌ Error al cargar utilización mensual:", err);
      setUtilizacion([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarReservasCliente();
    cargarReservasCancha();
    cargarCanchasMasUsadas();
    cargarUtilizacion();
    fetchClientes();
    fetchCanchas();
  }, []);

  if (loading) return <p>Cargando reportes...</p>;

  return (
    <div className="container reportes-page">
      <h2>Reportes y Estadísticas</h2>
      <p>Evaluá el rendimiento del sistema con parámetros configurables.</p>

      <div className="reportes-grid">
        {/* === 1️⃣ Reservas por cliente === */}
        <div className="report-line">
          <div className="report-info">
            <div className="parametros d-flex flex-column me-2">
              <h4>
                Reservas del Cliente: {clienteInfo.nombre || `#${idCliente}`}
              </h4>
              <div className="mb-2 w-100 d-flex align-items-center">
                <label className="form-label fw-semibold w-25">Cliente: </label>
                <select value={idCliente} onChange={handleClienteChange}>
                  <option value={0}>Seleccionar cliente...</option>
                  {clientes.map((c) => (
                    <option key={c.id_usuario} value={c.id_usuario}>
                      {c.nombre} {c.apellido}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-2 w-100">
                <label
                  htmlFor="fechaInicio"
                  className="form-label fw-semibold w-25"
                >
                  Desde:
                </label>
                <input
                  id="fechaInicio"
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>
              <div className="mb-2 w-100">
                <label
                  htmlFor="fechaFin"
                  className="form-label fw-semibold w-25"
                >
                  Hasta:
                </label>
                <input
                  id="fechaFin"
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>
              <div className="mb-3 w-100" style={{ backgroundColor: "white" }}>
                <button
                  className="btn me-2 mb-2"
                  style={{ backgroundColor: "#1e3a8a", color: "white" }}
                  onClick={cargarReservasCliente}
                >
                  Actualizar
                </button>
                <button
                  className="btn me-2 mb-2"
                  style={{ backgroundColor: "#1e3a8a", color: "white" }}
                  onClick={() =>
                    generarReportePDF(
                      `Reporte de Reservas del Cliente #${idCliente}`,
                      reservasCliente,
                      {
                        autor: "Área Administrativa",
                        empresa: "CONTROL RISK S.R.L.",
                        campos: ["cancha", "monto", "cantidad"],
                      }
                    )
                  }
                >
                  Ver Reporte
                </button>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={modoReservasCliente === "cantidad"}
                  onChange={(e) =>
                    setModoReservasCliente(
                      e.target.checked ? "cantidad" : "monto"
                    )
                  }
                />
                <span className="slider"></span>
                <span className="label-text">
                  {modoReservasCliente === "monto"
                    ? "Monto total"
                    : "Cantidad de reservas"}
                </span>
              </label>
            </div>
          </div>
          <div className="report-chart">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={reservasCliente || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cancha" />
                <YAxis />
                <Tooltip
                  formatter={(v) =>
                    modoReservasCliente === "monto"
                      ? `$${v.toLocaleString()}`
                      : v
                  }
                />
                <Bar
                  key={modoReservasCliente}
                  dataKey={
                    modoReservasCliente === "monto" ? "monto" : "cantidad"
                  }
                  fill={COLORS[1]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* === 2️⃣ Reservas por cancha === */}
        <div className="report-line">
          <div className="report-info">
            <div className="parametros">
              <h4>Reservas por cancha (período)</h4>

              <div className="mb-2 w-100">
                <label className="form-label fw-semibold w-25">Cancha:</label>
                <select value={idCancha} onChange={handleCanchaChange}>
                  <option value="0">Seleccionar cancha...</option>
                  {canchas.map((ca) => (
                    <option key={ca.id_cancha} value={ca.id_cancha}>
                      {ca.nombre} - {ca.tipo}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-2 w-100">
                <label className="form-label fw-semibold w-25">Desde:</label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>
              <div className="mb-2 w-100">
                <label className="form-label fw-semibold w-25">Desde:</label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>
              <div className="mb-2 w-100">
                <button
                  className="btn me-2 mb-2"
                  style={{ backgroundColor: "#1e3a8a", color: "white" }}
                  onClick={cargarReservasCancha}
                >
                  Actualizar
                </button>
                <button
                  className="btn me-2 mb-2"
                  style={{ backgroundColor: "#1e3a8a", color: "white" }}
                  onClick={() =>
                    generarReportePDF(
                      `Reservas de la Cancha #${idCancha}`,
                      reservasCancha,
                      {
                        autor: "Área Administrativa",
                        empresa: "CONTROL RISK S.R.L.",
                        campos: ["periodo", "reservas"],
                      }
                    )
                  }
                >
                  Ver Reporte
                </button>
              </div>
            </div>
          </div>
          <div className="report-chart">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={reservasCancha || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="reservas"
                  stroke="#1f7a8c"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* === 3️⃣ Canchas más utilizadas === */}
        <div className="report-line">
          <div className="report-info">
            <div className="parametros">
              <h4>Canchas más utilizadas</h4>

              <div className="mb-2 w-100">
                <label className="form-label fw-semibold w-25">Top N:</label>
                <input
                  type="number"
                  value={topN}
                  min="1"
                  onChange={(e) => setTopN(Number(e.target.value))}
                />
              </div>
              <div className="mb-2 w-100">
                <label className="form-label fw-semibold w-25">Desde:</label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>
              <div className="mb-2 w-100">
                <label className="form-label fw-semibold w-25">Hasta:</label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>
              <div className="mb-2 w-100">
                <button
                  className="btn me-2 mb-2"
                  style={{ backgroundColor: "#1e3a8a", color: "white" }}
                  onClick={cargarCanchasMasUsadas}
                >
                  Actualizar
                </button>
                <button
                  className="btn me-2 mb-2"
                  style={{ backgroundColor: "#1e3a8a", color: "white" }}
                  onClick={() =>
                    generarReportePDF(
                      `Canchas más utilizadas - Top ${topN}`,
                      canchasMasUsadas,
                      {
                        autor: "Área Administrativa",
                        empresa: "CONTROL RISK S.R.L.",
                        campos: ["cancha", "reservas", "porcentaje"],
                      }
                    )
                  }
                >
                  Ver Reporte
                </button>
              </div>
            </div>
          </div>
          <div className="report-chart">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                <Pie
                  data={canchasMasUsadas || []}
                  dataKey="porcentaje"
                  nameKey="cancha"
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  label={({ name, value }) => `${name} (${value}%)`}
                  labelLine={false}
                >
                  {(canchasMasUsadas || []).map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  layout="horizontal"
                  wrapperStyle={{ marginTop: 10, fontSize: 13 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* === 4️⃣ Utilización mensual === */}
        <div className="report-line">
          <div className="report-info">
            <div className="parametros">
              <h4>Utilización mensual de canchas</h4>

              <div className="mb-2 w-100">
                <label className="form-label fw-semibold w-25">Año: </label>
                <input
                  type="number"
                  value={año}
                  onChange={(e) => setAño(Number(e.target.value))}
                />
              </div>
              <div className="mb-3 w-100">
                <button
                  className="btn me-2 mb-2"
                  style={{ backgroundColor: "#1e3a8a", color: "white" }}
                  onClick={cargarUtilizacion}
                >
                  Actualizar
                </button>
                <button
                  className="btn me-2 mb-2"
                  style={{ backgroundColor: "#1e3a8a", color: "white" }}
                  onClick={() =>
                    generarReportePDF(
                      `Utilización mensual de canchas (${año})`,
                      utilizacion,
                      {
                        autor: "Área Administrativa",
                        empresa: "CONTROL RISK S.R.L.",
                        campos: Object.keys(utilizacion[0] || {}),
                      }
                    )
                  }
                >
                  Ver Reporte
                </button>
              </div>
            </div>
          </div>

          <div className="report-chart">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={utilizacion || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cancha" />
                <YAxis />
                <Tooltip />
                {(COLORS || []).map((color, i) => (
                  <Bar
                    key={i}
                    dataKey={`Mes ${i + 1}`}
                    stackId="a"
                    fill={color}
                  />
                ))}
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
