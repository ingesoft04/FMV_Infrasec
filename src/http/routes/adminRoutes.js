const express = require('express');
const asyncHandler = require('../../core/asyncHandler');

module.exports = (controller, authenticate, adminOnly) => {
  const router = express.Router();
  router.use(authenticate, adminOnly);
  router.get('/resumen', asyncHandler(controller.summary));
  router.get('/crm', asyncHandler(controller.crm));
  router.get('/asesorias', asyncHandler(controller.appointments));
  router.patch('/asesorias/:id/crm', asyncHandler(controller.updateOpportunity));
  router.patch('/asesorias/:id/estado', asyncHandler(controller.updateAppointment));
  router.post('/cotizaciones', asyncHandler(controller.createQuote));
  router.patch('/pagos/:id', asyncHandler(controller.updatePayment));
  router.patch('/productos/:id/precio', asyncHandler(controller.updateProductPrice));
  router.post('/notificar/:id', asyncHandler(controller.notify));
  return router;
};
