const express = require('express');
const asyncHandler = require('../../core/asyncHandler');

module.exports = (controller, authenticate) => {
  const router = express.Router();
  router.get('/productos', asyncHandler(controller.products));
  router.get('/consultores', asyncHandler(controller.consultants));
  router.get('/metodos-pago', asyncHandler(controller.paymentMethods));
  router.get('/asesorias/disponibilidad', authenticate, asyncHandler(controller.availability));
  router.get('/asesorias', authenticate, asyncHandler(controller.listAppointments));
  router.post('/asesorias', authenticate, asyncHandler(controller.createAppointment));
  router.patch('/asesorias/:id/cancelar', authenticate, asyncHandler(controller.cancel));
  router.patch('/asesorias/:id/reprogramar', authenticate, asyncHandler(controller.reschedule));
  router.get('/asesorias/:id/calendario.ics', authenticate, asyncHandler(controller.calendar));
  router.get('/cotizaciones', authenticate, asyncHandler(controller.quotes));
  router.patch('/cotizaciones/:id/respuesta', authenticate, asyncHandler(controller.answerQuote));
  router.get('/cotizaciones/:id/pdf', authenticate, asyncHandler(controller.quotePdf));
  router.get('/pagos', authenticate, asyncHandler(controller.payments));
  router.post('/pagos', authenticate, asyncHandler(controller.createPayment));
  return router;
};
