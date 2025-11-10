export default function ReportesPage() {
  return (
    <div className="container reportes-page">
      <h2>Reportes y Estadísticas</h2>
      <p>Consultá los reportes generados automáticamente desde el sistema.</p>

      <div className="report-cards">
        <div className="report-card">
          <h3>Utilización mensual de canchas</h3>
          <div className="chart-placeholder">📊</div>
        </div>
        <div className="report-card">
          <h3>Reservas por cliente</h3>
          <div className="chart-placeholder">📈</div>
        </div>
        <div className="report-card">
          <h3>Facturación mensual</h3>
          <div className="chart-placeholder">💰</div>
        </div>
      </div>
    </div>
  );
}
