module.exports = class ResourceNotFoundException extends Error {
  message = '';

  constructor(resourceName) {
    super();
    this.message = `${resourceName} not found!`;
  }
};
