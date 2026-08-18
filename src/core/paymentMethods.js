const METHODS = Object.freeze([
  { id: 'pse', nombre: 'PSE', descripcion: 'Débito desde una cuenta bancaria.' },
  { id: 'tarjeta', nombre: 'Tarjeta débito o crédito', descripcion: 'Se procesa con una pasarela; FMV no almacena número ni CVV.' },
  { id: 'transferencia', nombre: 'Transferencia bancaria', descripcion: 'Validación manual con la referencia de la transferencia.' },
  { id: 'nequi', nombre: 'Nequi', descripcion: 'Pago desde la aplicación Nequi.' },
  { id: 'daviplata', nombre: 'Daviplata', descripcion: 'Pago desde la aplicación Daviplata.' },
  { id: 'efectivo', nombre: 'Efectivo', descripcion: 'Disponible únicamente mediante coordinación previa.' }
]);

const IDS = new Set(METHODS.map(({ id }) => id));

module.exports = {
  list: () => METHODS.map((method) => ({ ...method })),
  isSupported: (method) => IDS.has(method)
};
