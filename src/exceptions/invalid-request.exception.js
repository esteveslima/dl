module.exports = class InvalidRequestException extends Error {
  message = '';

  constructor(reason) {
    super();
    this.message = `Invalid request, ${reason}!`;
  }
};
