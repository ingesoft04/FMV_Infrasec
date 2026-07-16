class DocumentGateway {
  constructor({ renderQuote, renderCalendar }) {
    this.renderQuote = renderQuote;
    this.renderCalendar = renderCalendar;
  }

  quote(res, data) {
    return this.renderQuote(res, data);
  }

  calendar(data) {
    return this.renderCalendar(data);
  }
}

module.exports = DocumentGateway;
