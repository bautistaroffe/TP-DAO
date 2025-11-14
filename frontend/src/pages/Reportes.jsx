// src/pages/Reportes.jsx
import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  getUtilizacionMensual,
  getReservasPorCliente,
  getCanchasMasUsadas,
  getReservasPorCancha,
} from "../services/reporteService";
import "../styles/pages.css";
import { generarReportePDF } from "../utils/pdfReportGenerator";

export default function ReportesPage() {
  const [utilizacion, setUtilizacion] = useState([]);
  const [reservasCliente, setReservasCliente] = useState([]);
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

const COLORS = [
  "#0d1b2a", // Enero - charcoal (muy oscuro)
  "#142b46", // Febrero - azul carbón
  "#1e3a8a", // Marzo - marian blue
  "#2c5282", // Abril - azul acero
  "#35658f", // Mayo - azul frío
  "#457b9d", // Junio - cerulean
  "#5a8eb1", // Julio - azul intermedio
  "#7baac4", // Agosto - azul grisáceo medio
  "#98c1d9", // Septiembre - powder blue
  "#b2d0e0", // Octubre - celeste pálido
  "#cddde7", // Noviembre - azul muy claro
  "#E2E8F0"  // Diciembre - alice blue
];



  // === Funciones por reporte ===
  async function cargarReservasCliente() {
    if (!idCliente || idCliente < 1) return alert("ID de cliente inválido");
    setLoading(true);
    try {
      const dataCliente = await getReservasPorCliente(idCliente);
      const reservasData = Array.isArray(dataCliente)
        ? dataCliente
        : dataCliente.reservas || [];

      const clientesMap = {};
      reservasData.forEach((r) => {
        if (!clientesMap[r.cancha]) clientesMap[r.cancha] = { monto: 0, cantidad: 0 };
        clientesMap[r.cancha].monto += r.precio_total || 0;
        clientesMap[r.cancha].cantidad += 1;
      });

      const chartReservas = Object.entries(clientesMap).map(([cancha, data]) => ({
        cancha,
        monto: data.monto,
        cantidad: data.cantidad,
      }));
      setReservasCliente(chartReservas);
    } catch (err) {
      console.error("❌ Error al cargar reservas por cliente:", err);
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
      const periodo = await getReservasPorCancha(idCancha, fechaInicio, fechaFin);
      const fechaInicioObj = new Date(periodo.desde);
      const fechaFinObj = new Date(periodo.hasta);
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

      const counts = intervalos.map(({ inicio, fin }) => {
        const count = periodo.reservas.filter((r) => {
          const fechaReserva = new Date(r.fecha_turno);
          return fechaReserva >= inicio && fechaReserva < fin;
        }).length;
        let etiqueta = "";
        if (saltoDias >= 30)
          etiqueta = inicio.toLocaleString("default", { month: "short" });
        else if (saltoDias === 15)
          etiqueta = `${inicio.getDate()}–${Math.min(fin.getDate(), fechaFinObj.getDate())}`;
        else etiqueta = inicio.toISOString().slice(5, 10);
        return { periodo: etiqueta, reservas: count };
      });
      setReservasCancha(counts);
    } catch (err) {
      console.error("❌ Error al cargar reservas por cancha:", err);
    } finally {
      setLoading(false);
    }
  }

  async function cargarCanchasMasUsadas() {
    if (!topN || topN < 1) return alert("Top N inválido");
    setLoading(true);
    try {
      const masUsadas = await getCanchasMasUsadas(topN);
      setCanchasMasUsadas(masUsadas.ranking);
    } catch (err) {
      console.error("❌ Error al cargar canchas más usadas:", err);
    } finally {
      setLoading(false);
    }
  }

  async function cargarUtilizacion() {
    if (!año || año < 2000 || año > 2100) return alert("Año inválido");
    setLoading(true);
    try {
      const util = await getUtilizacionMensual(año);
      const chartUtil = Object.entries(util).map(([cancha, meses]) => ({
        cancha,
        ...Object.fromEntries(meses.map((v, i) => [`Mes ${i + 1}`, v])),
      }));
      setUtilizacion(chartUtil);
    } catch (err) {
      console.error("❌ Error al cargar utilización mensual:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarReservasCliente();
    cargarReservasCancha();
    cargarCanchasMasUsadas();
    cargarUtilizacion();
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
            <h3>Reservas por cliente</h3>
            <div className="parametros">
              <label>
                ID Cliente:
                <input
                  type="number"
                  value={idCliente}
                  min="1"
                  onChange={(e) => setIdCliente(Number(e.target.value))}
                />
              </label>
              <button onClick={cargarReservasCliente}>Actualizar</button>

                <button
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
          </div>

          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={modoReservasCliente === "cantidad"}
              onChange={(e) =>
                setModoReservasCliente(e.target.checked ? "cantidad" : "monto")
              }
            />
            <span className="slider"></span>
            <span className="label-text">
              {modoReservasCliente === "monto"
                ? "Monto total"
                : "Cantidad de reservas"}
            </span>
          </label>

          <div className="report-chart">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={reservasCliente}>
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
            <h3>Reservas por cancha (período)</h3>
            <div className="parametros">
              <label>
                ID Cancha:
                <input
                  type="number"
                  value={idCancha}
                  min="1"
                  onChange={(e) => {
                      const val = e.target.value;
                      setIdCancha(val ? Number(val) : "");
                  }}
                />
              </label>
              <label>
                Desde:
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </label>
              <label>
                Hasta:
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </label>
              <button onClick={cargarReservasCancha}>Actualizar</button>

                <button
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

          <div className="report-chart">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={reservasCancha}>
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
            <h3>Canchas más utilizadas</h3>
            <div className="parametros">
              <label>
                Top N:
                <input
                  type="number"
                  value={topN}
                  min="1"
                  onChange={(e) => setTopN(Number(e.target.value))}
                />
              </label>
              <button onClick={cargarCanchasMasUsadas}>Actualizar</button>

                <button
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

          <div className="report-chart">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                <Pie
                  data={canchasMasUsadas}
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
                  {canchasMasUsadas.map((_, index) => (
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
            <h3>Utilización mensual de canchas</h3>
            <div className="parametros">
              <label>
                Año:
                <input
                  type="number"
                  value={año}
                  onChange={(e) => setAño(Number(e.target.value))}
                />
              </label>
              <button onClick={cargarUtilizacion}>Actualizar</button>

                <button
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

          <div className="report-chart">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={utilizacion}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cancha" />
                <YAxis />
                <Tooltip />
                  {COLORS.map((color, i) => (
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
