const PDFDocument = require('pdfkit');

function moneda(valor, codigo = 'COP') {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: codigo }).format(Number(valor));
}

function cotizacionPdf(res, cotizacion) {
  const doc = new PDFDocument({ size: 'A4', margin: 54, info: { Title: `Cotización ${cotizacion.numero}` } });
  res.type('application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${cotizacion.numero}.pdf"`);
  doc.pipe(res);
  doc.fillColor('#082032').fontSize(24).text('FMV InfraSec');
  doc.fillColor('#18aeb5').fontSize(11).text('Seguridad, infraestructura y software');
  doc.moveDown(2);
  doc.fillColor('#082032').fontSize(20).text(`Cotización ${cotizacion.numero}`);
  doc.fontSize(10).fillColor('#526270').text(`Fecha: ${new Date(cotizacion.creado_en).toLocaleDateString('es-CO')}`);
  doc.text(`Vigencia: ${new Date(cotizacion.vigencia_hasta).toLocaleDateString('es-CO')}`);
  doc.moveDown();
  doc.fontSize(12).fillColor('#082032').text(`Cliente: ${cotizacion.cliente}`);
  doc.text(`Empresa: ${cotizacion.empresa}`);
  doc.text(`Servicio: ${cotizacion.producto}`);
  doc.moveDown();
  doc.fontSize(13).text('Alcance');
  doc.fontSize(10).fillColor('#334955').text(cotizacion.alcance);
  doc.moveDown();
  doc.fontSize(11).fillColor('#082032').text(`Subtotal: ${moneda(cotizacion.subtotal, cotizacion.moneda)}`, { align: 'right' });
  doc.text(`Impuestos: ${moneda(cotizacion.impuestos, cotizacion.moneda)}`, { align: 'right' });
  doc.fontSize(15).fillColor('#18aeb5').text(`Total: ${moneda(cotizacion.total, cotizacion.moneda)}`, { align: 'right' });
  if (cotizacion.condiciones) {
    doc.moveDown(2).fontSize(12).fillColor('#082032').text('Condiciones');
    doc.fontSize(9).fillColor('#526270').text(cotizacion.condiciones);
  }
  doc.moveDown(3).fontSize(9).fillColor('#71838d').text('Documento generado por el portal comercial FMV InfraSec.');
  doc.end();
}

function eventoIcs(asesoria) {
  const date = String(asesoria.fecha).slice(0, 10).replaceAll('-', '');
  const time = String(asesoria.hora).slice(0, 5).replace(':', '') + '00';
  const escape = (value) => String(value || '').replace(/[\\,;]/g, '\\$&').replace(/\n/g, '\\n');
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//FMV InfraSec//Portal Comercial//ES',
    'BEGIN:VEVENT', `UID:${asesoria.id}@fmvinfrasec`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
    `DTSTART:${date}T${time}`, `DURATION:PT${asesoria.duracion_minutos || 45}M`,
    `SUMMARY:${escape(`Asesoría FMV - ${asesoria.producto}`)}`,
    `DESCRIPTION:${escape(asesoria.objetivo)}`, `LOCATION:${escape(asesoria.canal)}`,
    'END:VEVENT', 'END:VCALENDAR'
  ].join('\r\n');
}

module.exports = { cotizacionPdf, eventoIcs };
