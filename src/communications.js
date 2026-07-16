const nodemailer = require('nodemailer');
let transporter;

function correoConfigurado() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
}

function obtenerTransporter() {
  if (!transporter && correoConfigurado()) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE) === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
    });
  }
  return transporter;
}

function createCommunicationSenders(repository) {
async function enviarCorreo({ usuarioId, asesoriaId, destino, asunto, texto, html }) {
  if (!correoConfigurado()) {
    await repository.register({ usuarioId, asesoriaId, canal: 'email', destino, asunto, mensaje: texto, estado: 'simulado' });
    return { estado: 'simulado' };
  }
  try {
    const info = await obtenerTransporter().sendMail({
      from: process.env.SMTP_FROM || 'FMV InfraSec <no-reply@localhost>',
      to: destino, subject: asunto, text: texto, html
    });
    await repository.register({ usuarioId, asesoriaId, canal: 'email', destino, asunto, mensaje: texto, estado: 'enviado', proveedorId: info.messageId });
    return { estado: 'enviado', id: info.messageId };
  } catch (error) {
    await repository.register({ usuarioId, asesoriaId, canal: 'email', destino, asunto, mensaje: texto, estado: 'fallido', error: error.message });
    return { estado: 'fallido' };
  }
}

async function enviarWhatsApp({ usuarioId, asesoriaId, destino, mensaje }) {
  const telefono = String(destino || '').replace(/\D/g, '');
  if (!process.env.WHATSAPP_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
    await repository.register({ usuarioId, asesoriaId, canal: 'whatsapp', destino: telefono, mensaje, estado: 'simulado' });
    return { estado: 'simulado', enlace: telefono ? `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}` : null };
  }
  try {
    const response = await fetch(`https://graph.facebook.com/v23.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', to: telefono, type: 'text', text: { body: mensaje } })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'WhatsApp rechazó el mensaje');
    const id = data.messages?.[0]?.id;
    await repository.register({ usuarioId, asesoriaId, canal: 'whatsapp', destino: telefono, mensaje, estado: 'enviado', proveedorId: id });
    return { estado: 'enviado', id };
  } catch (error) {
    await repository.register({ usuarioId, asesoriaId, canal: 'whatsapp', destino: telefono, mensaje, estado: 'fallido', error: error.message });
    return { estado: 'fallido' };
  }
}

return { enviarCorreo, enviarWhatsApp };
}

module.exports = createCommunicationSenders;
