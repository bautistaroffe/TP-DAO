// src/utils/pdfReportGenerator.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**

 * @param {string} titulo - Título principal del reporte
 * @param {object[]} datos - Lista de objetos con la información
 * @param {object} opciones - Config opcional (autor, fecha, campos a mostrar)
 */
export function generarReportePDF(titulo, datos = [], opciones = {}) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });
  autoTable(doc, {
      head: [[""]],
      body: [[""]],
  });

  const fecha = new Date().toLocaleDateString();
  const autor = opciones.autor || "Sistema de Gestión";
  const campos = opciones.campos || Object.keys(datos[0] || {});
  const empresa =  "ESTADIA - AREA ADMINISTRATIVA";

  // === ENCABEZADO ===
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(empresa, 105, 20, { align: "center" });

  doc.setFontSize(14);
  doc.text(titulo, 105, 30, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generado el ${fecha}`, 105, 36, { align: "center" });
  doc.text(`Autor: ${autor}`, 105, 41, { align: "center" });

  doc.line(15, 45, 195, 45);

  // === CONTENIDO ===
  if (!datos.length) {
    doc.setFontSize(12);
    doc.text("No se encontraron registros para este reporte.", 20, 60);
  } else {
    const filas = datos.map((item) => campos.map((campo) => item[campo] ?? "-"));

    autoTable(doc, {
      startY: 55,
      head: [campos.map((c) => c.toUpperCase())],
      body: filas,
      styles: {
        fontSize: 9,
        halign: "center",
      },
      headStyles: {
        fillColor: [14, 27, 42], // charcoal
        textColor: [255, 255, 255],
      },
      alternateRowStyles: {
        fillColor: [226, 232, 240], // alice-blue
      },
    });
  }

  // === PIE DE PÁGINA ===
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Página ${i} de ${totalPages}`, 105, 290, { align: "center" });
  }

  // === ABRIR EN NUEVA PESTAÑA ===
  const pdfBlob = doc.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, "_blank");
}
