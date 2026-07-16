const config = require('./config');
const { pool } = require('./db');
const createCommunicationSenders = require('./communications');
const { cotizacionPdf, eventoIcs } = require('./documents');
const NotificationGateway = require('./adapters/NotificationGateway');
const DocumentGateway = require('./adapters/DocumentGateway');
const UserRepository = require('./repositories/UserRepository');
const TokenRepository = require('./repositories/TokenRepository');
const CatalogRepository = require('./repositories/CatalogRepository');
const AppointmentRepository = require('./repositories/AppointmentRepository');
const QuoteRepository = require('./repositories/QuoteRepository');
const PaymentRepository = require('./repositories/PaymentRepository');
const AdminRepository = require('./repositories/AdminRepository');
const CommunicationRepository = require('./repositories/CommunicationRepository');
const AuthService = require('./services/AuthService');
const AppointmentService = require('./services/AppointmentService');
const SalesService = require('./services/SalesService');
const AdminService = require('./services/AdminService');
const AuthController = require('./http/controllers/AuthController');
const CommercialController = require('./http/controllers/CommercialController');
const AdminController = require('./http/controllers/AdminController');

function buildContainer() {
  const repositories = {
    users: new UserRepository(pool),
    tokens: new TokenRepository(pool),
    catalog: new CatalogRepository(pool),
    appointments: new AppointmentRepository(pool),
    quotes: new QuoteRepository(pool),
    payments: new PaymentRepository(pool),
    admin: new AdminRepository(pool),
    communications: new CommunicationRepository(pool)
  };
  const { enviarCorreo, enviarWhatsApp } = createCommunicationSenders(repositories.communications);
  const adapters = {
    notifications: new NotificationGateway({ sendEmail: enviarCorreo, sendWhatsApp: enviarWhatsApp }),
    documents: new DocumentGateway({ renderQuote: cotizacionPdf, renderCalendar: eventoIcs })
  };
  const services = {
    auth: new AuthService({ users: repositories.users, tokens: repositories.tokens, notifications: adapters.notifications, config }),
    appointments: new AppointmentService({ appointments: repositories.appointments, catalog: repositories.catalog, users: repositories.users, notifications: adapters.notifications, documents: adapters.documents }),
    sales: new SalesService({ quotes: repositories.quotes, payments: repositories.payments, appointments: repositories.appointments, documents: adapters.documents, config })
  };
  services.admin = new AdminService({ admin: repositories.admin, appointments: repositories.appointments, quotes: repositories.quotes, users: repositories.users, notifications: adapters.notifications, config });
  const controllers = {
    auth: new AuthController(services.auth),
    commercial: new CommercialController({ catalog: repositories.catalog, appointments: services.appointments, sales: services.sales }),
    admin: new AdminController(services.admin)
  };
  return { config, db: pool, repositories, adapters, services, controllers };
}

module.exports = buildContainer;
