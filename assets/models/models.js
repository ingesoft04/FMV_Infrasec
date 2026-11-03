const FMV_MODELOS = Object.freeze([
  {
    id: 'psicologia-espacio-sereno', nombre: 'Espacio Sereno', categoria: 'Psicología', slug: 'psicologia',
    descripcion: 'Una presencia digital cálida y profesional para presentar servicios, orientar pacientes y facilitar solicitudes de cita.',
    imagen: '/assets/models/previews/psicologia.svg',
    funciones: ['Servicios y enfoque terapéutico', 'Perfil profesional', 'Solicitud de cita', 'Preguntas frecuentes'],
    precio: 'Según alcance', tiempoEntrega: 'Desde 7 días', enlaceDemostracion: '/modelos/psicologia', destacado: true,
    mensajeWhatsApp: 'Hola, estoy interesado en el modelo Espacio Sereno de la categoría Psicología. Quiero recibir más información.'
  },
  {
    id: 'joyeria-aurea', nombre: 'Áurea', categoria: 'Joyería', slug: 'joyeria',
    descripcion: 'Catálogo elegante para destacar colecciones, materiales y piezas especiales con una experiencia visual refinada.',
    imagen: '/assets/models/previews/joyeria.svg',
    funciones: ['Colecciones destacadas', 'Ficha de producto', 'Consulta personalizada', 'Diseño adaptable'],
    precio: 'Según alcance', tiempoEntrega: 'Desde 8 días', enlaceDemostracion: '/modelos/joyeria', destacado: true,
    mensajeWhatsApp: 'Hola, estoy interesado en el modelo Áurea de la categoría Joyería. Quiero recibir más información.'
  },
  {
    id: 'restaurante-savia', nombre: 'Savia Cocina', categoria: 'Restaurante', slug: 'restaurante',
    descripcion: 'Una carta digital apetecible para contar la propuesta gastronómica, mostrar el menú y recibir reservas.',
    imagen: '/assets/models/previews/restaurante.svg',
    funciones: ['Menú visual', 'Reservas', 'Horarios y ubicación', 'Especialidades'],
    precio: 'Según alcance', tiempoEntrega: 'Desde 7 días', enlaceDemostracion: '/modelos/restaurante', destacado: true,
    mensajeWhatsApp: 'Hola, estoy interesado en el modelo Savia Cocina de la categoría Restaurante. Quiero recibir más información.'
  },
  {
    id: 'serviteca-ruta-pro', nombre: 'Ruta Pro', categoria: 'Serviteca', slug: 'serviteca',
    descripcion: 'Una vitrina clara y directa para servicios automotrices, promociones, sedes y solicitudes de diagnóstico.',
    imagen: '/assets/models/previews/serviteca.svg',
    funciones: ['Servicios automotrices', 'Cotización rápida', 'Promociones', 'Ubicación y contacto'],
    precio: 'Según alcance', tiempoEntrega: 'Desde 7 días', enlaceDemostracion: '/modelos/serviteca', destacado: true,
    mensajeWhatsApp: 'Hola, estoy interesado en el modelo Ruta Pro de la categoría Serviteca. Quiero recibir más información.'
  },
  {
    id: 'maquillaje-lumina', nombre: 'Lúmina Studio', categoria: 'Maquillaje', slug: 'maquillaje',
    descripcion: 'Portafolio editorial para presentar estilos, servicios y disponibilidad con una estética limpia y contemporánea.',
    imagen: '/assets/models/previews/maquillaje.svg',
    funciones: ['Portafolio de estilos', 'Paquetes de servicio', 'Agenda', 'Presentación profesional'],
    precio: 'Según alcance', tiempoEntrega: 'Desde 7 días', enlaceDemostracion: '/modelos/maquillaje', destacado: false,
    mensajeWhatsApp: 'Hola, estoy interesado en el modelo Lúmina Studio de la categoría Maquillaje. Quiero recibir más información.'
  }
]);

if (typeof window !== 'undefined') window.FMV_MODELOS = FMV_MODELOS;
if (typeof module !== 'undefined') module.exports = FMV_MODELOS;
