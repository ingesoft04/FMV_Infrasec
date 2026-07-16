const express = require('express');
const asyncHandler = require('../../core/asyncHandler');

module.exports = (controller) => {
  const router = express.Router();
  router.post('/registro', asyncHandler(controller.register));
  router.post('/verificar-email', asyncHandler(controller.verify));
  router.post('/recuperar', asyncHandler(controller.recover));
  router.post('/restablecer', asyncHandler(controller.reset));
  router.post('/login', asyncHandler(controller.login));
  return router;
};
