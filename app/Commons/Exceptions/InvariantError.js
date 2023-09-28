const ClientError = require('./ClientError')

class InvariantError extends ClientError {
  constructor(message) {
    super(message, 500)
    this.name = 'InvariantError'
  }
}

module.exports = InvariantError
