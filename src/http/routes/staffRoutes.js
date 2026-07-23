const express = require('express');
const asyncHandler = require('../../core/asyncHandler');

module.exports = (controller, authenticate, staffOnly, saOnly) => {
  const router = express.Router();
  router.use(authenticate, staffOnly);
  router.get('/asesorias', asyncHandler(controller.appointments));
  router.patch('/asesorias/:id/estado', asyncHandler(controller.updateAppointment));
  router.get('/usuarios', saOnly, asyncHandler(controller.users));
  router.post('/usuarios', saOnly, asyncHandler(controller.createUser));
  router.put('/usuarios/:id', saOnly, asyncHandler(controller.updateUser));
  router.patch('/usuarios/:id/estado', saOnly, asyncHandler(controller.setUserState));
  return router;
};

