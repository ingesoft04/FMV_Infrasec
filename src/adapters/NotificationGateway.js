class NotificationGateway {
  constructor({ sendEmail, sendWhatsApp }) {
    this.sendEmail = sendEmail;
    this.sendWhatsApp = sendWhatsApp;
  }

  email(message) {
    return this.sendEmail(message);
  }

  whatsapp(message) {
    return this.sendWhatsApp(message);
  }
}

module.exports = NotificationGateway;
