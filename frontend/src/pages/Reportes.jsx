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

export default function ReportesPage() {
  const [utilizacion, setUtilizacion] = useState([]);
  const [reservasCliente, setReservasCliente] = useState([]);
  const [canchasMasUsadas, setCanchasMasUsadas] = useState([]);
  const [reservasCancha, setReservasCancha] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modoReservasCliente, setModoReservasCliente] = useState("monto");


  const COLORS = ["#134611", "#3E8914", "#A8C686", "#DCE2AA", "#B7CE63"];

  useEffect(() => {
    async function cargarDatos() {
      try {
          // === Reporte 1: Reservas por cliente ===
          const dataCliente = await getReservasPorCliente(1);

// 🔹 Detecta si es array directo o si viene dentro de .reservas
          const reservasData = Array.isArray(dataCliente)
              ? dataCliente
              : dataCliente.reservas || [];

          if (reservasData.length === 0) {
              console.warn("⚠️ No hay reservas para este cliente");
          } else {
              console.log("📦 Reservas recibidas:", reservasData.length);

              // Agrupar por cancha
              const clientesMap = {};
              reservasData.forEach((r) => {
                  if (!clientesMap[r.cancha]) {
                      clientesMap[r.cancha] = {monto: 0, cantidad: 0};
                  }
                  clientesMap[r.cancha].monto += r.precio_total || 0;
                  clientesMap[r.cancha].cantidad += 1;
              });

              // Transformar en array para el gráfico
              const chartReservas = Object.entries(clientesMap).map(([cancha, data]) => ({
                  cancha,
                  monto: data.monto,
                  cantidad: data.cantidad,
              }));

              console.log("✅ chartReservas generado:", chartReservas);
              setReservasCliente(chartReservas);
          }


          // 🔹 Reporte 2: reservas por cancha en período
          const periodo = await getReservasPorCancha(1, "2025-11-01", "2025-11-30");
          console.log("📊 periodo recibido:", periodo);

// Convierte strings a fechas reales
          const fechaInicio = new Date(periodo.desde);
          const fechaFin = new Date(periodo.hasta);
          const diffDias = (fechaFin - fechaInicio) / (1000 * 60 * 60 * 24);

// Determinar tamaño del subperíodo
          let saltoDias = 1;
          if (diffDias > 60) saltoDias = 30;
          else if (diffDias > 30) saltoDias = 15;
          else if (diffDias > 5) saltoDias = 5;

// Generar intervalos
          const intervalos = [];
          let cursor = new Date(fechaInicio);
          while (cursor <= fechaFin) {
              const siguiente = new Date(cursor);
              siguiente.setDate(cursor.getDate() + saltoDias);
              intervalos.push({
                  inicio: new Date(cursor),
                  fin: siguiente < fechaFin ? new Date(siguiente) : fechaFin,
              });
              cursor = siguiente;
          }

// Contar reservas por subperíodo
          const counts = intervalos.map(({inicio, fin}) => {
              const count = periodo.reservas.filter((r) => {
                  const fechaReserva = new Date(r.fecha_turno);
                  return fechaReserva >= inicio && fechaReserva < fin;
              }).length;

              // Etiqueta del eje X
              let etiqueta = "";
              if (saltoDias >= 30) {
                  etiqueta = inicio.toLocaleString("default", {month: "short"}); // Ej: "Nov"
              } else if (saltoDias === 15) {
                  etiqueta = `${inicio.getDate()}–${Math.min(fin.getDate(), fechaFin.getDate())}`;
              } else {
                  etiqueta = inicio.toISOString().slice(5, 10); // Ej: "11-10"
              }

              return {periodo: etiqueta, reservas: count};
          });

          setReservasCancha(counts);

        // 🔹 Reporte 3: canchas más utilizadas
        const masUsadas = await getCanchasMasUsadas(5);
        setCanchasMasUsadas(masUsadas.ranking);

        // 🔹 Reporte 4: utilización mensual
        const util = await getUtilizacionMensual(2025);
        const chartUtil = Object.entries(util).map(([cancha, meses]) => ({
          cancha,
          ...Object.fromEntries(meses.map((v, i) => [`Mes ${i + 1}`, v])),
        }));
        setUtilizacion(chartUtil);
      } catch (err) {
        console.error("❌ Error al cargar reportes:", err);
      } finally {
        setLoading(false);
      }
    }
    cargarDatos();
  }, []);

  if (loading) return <p>Cargando reportes...</p>;

  return (
    <div className="container reportes-page">
      <h2> Reportes y Estadísticas</h2>
      <p>Evaluá el rendimiento del sistema para la toma de decisiones estratégicas.</p>
      <div className="reportes-grid">
      {/* === 1️⃣ Reservas por cliente === */}
          <div className="report-line">
              <div className="report-info">
                  <h3>Reservas por cliente</h3>
                  <p>Compará el monto total o la cantidad de reservas de cada cliente.</p>
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


              {/* Gráfico */}
              <div className="report-chart">
                  <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={reservasCliente}>
                          <CartesianGrid strokeDasharray="3 3"/>
                          <XAxis dataKey="cancha"/>
                          <YAxis/>
                          <Tooltip
                              formatter={(v) =>
                                  modoReservasCliente === "monto" ? `$${v.toLocaleString()}` : v
                              }
                          />
                          <Bar
                              key={modoReservasCliente} // 🔹 Fuerza el re-render al cambiar modo
                              dataKey={modoReservasCliente === "monto" ? "monto" : "cantidad"}
                              fill="#3E8914"
                          />

                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* === 2️⃣ Reservas por cancha en un período === */}
          <div className="report-line">
              <div className="report-info">
                  <h3>Reservas por cancha (período)</h3>
                  <p>Evolución de reservas de la cancha 1 entre el 1 y 30 de noviembre de 2025.</p>
              </div>
              <div className="report-chart">
                  <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={reservasCancha}>
                          <CartesianGrid strokeDasharray="3 3"/>
                          <XAxis dataKey="periodo"/>
                          <YAxis allowDecimals={false}/>
                          <Tooltip/>
                          <Line type="monotone" dataKey="reservas" stroke="#1f7a8c" strokeWidth={2}/>
                      </LineChart>
                  </ResponsiveContainer>

              </div>
          </div>

          {/* === 3️⃣ Canchas más utilizadas === */}
          <div className="report-line">
              <div className="report-info">
                  <h3>Canchas más utilizadas</h3>
                  <p>Porcentaje de participación de cada cancha en el total de reservas.</p>
              </div>
              <div className="report-chart">
                  <ResponsiveContainer width="100%" height={300}>
                      <PieChart margin={{top: 20, right: 20, bottom: 40, left: 20}}>
                          <Pie
                              data={canchasMasUsadas}
                              dataKey="porcentaje"
                              nameKey="cancha"
                              cx="50%"
                              cy="45%"          // 🔹 Baja un poco el pastel para dejar lugar arriba
                              innerRadius={50}  // 🔹 Agrega espacio interno (donut)
                              outerRadius={90}  // 🔹 Evita que toque los bordes
                              paddingAngle={3}  // 🔹 Espacio entre sectores
                              label={({name, value}) => `${name} (${value}%)`} // 🔹 Etiquetas limpias
                              labelLine={false} // 🔹 Sin líneas de unión
                          >
                              {canchasMasUsadas.map((_, index) => (
                                  <Cell
                                      key={`cell-${index}`}
                                      fill={COLORS[index % COLORS.length]}
                                  />
                              ))}
                          </Pie>
                          <Tooltip/>
                          <Legend
                              verticalAlign="bottom"
                              align="center"
                              layout="horizontal"
                              wrapperStyle={{
                                  marginTop: 10,
                                  fontSize: 13,
                              }}
                          />
                      </PieChart>
                  </ResponsiveContainer>
              </div>
          </div>


          {/* === 4️⃣ Utilización mensual de canchas === */}
          <div className="report-line">
              <div className="report-info">
                  <h3>Utilización mensual de canchas</h3>
                  <p>Cantidad de reservas registradas por mes durante el año 2025.</p>
              </div>
              <div className="report-chart">
                  <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={utilizacion}>
                          <CartesianGrid strokeDasharray="3 3"/>
                          <XAxis dataKey="cancha"/>
                          <YAxis/>
                          <Tooltip/>
                          {Array.from({length: 12}, (_, i) => (
                              <Bar key={i} dataKey={`Mes ${i + 1}`} stackId="a" fill={COLORS[i % COLORS.length]}/>
                          ))}
                          <Legend/>
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>
      </div>
    </div>
  );
}
