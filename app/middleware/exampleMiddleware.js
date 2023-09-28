const jwt = require('jsonwebtoken');
const AuthError = require('../Commons/Exceptions/AuthError');
const secretKey = require('../config/auth').secret;

/**
 * Memvalidasi token dan mereturn payload jika token valid
 *
 * @param {string} token
 */
function getPayloadFromToken(token) {
  return jwt.verify(token, secretKey, (err, decodedData) => {
    if (err) {
      throw new AuthError('Token tidak valid!');
    } else {
      return decodedData;
    }
  });
}

async function verifyJWT(req, res, next) {
  try {
    const token = req.headers.authorization?.substr(7);
    getPayloadFromToken(token);

    next();
  } catch (error) {
    const statusCode = error.statusCode || 500
    return res.status(statusCode)
      .json({ statusCode, success: false, data: {}, message: error.message })
  }
};

async function isAdmin(req, res, next) {
  try {
    const token = req.headers.authorization?.substr(7);
    const data = getPayloadFromToken(token);
    if (data.role !== 'admin') {
      throw new AuthError('Anda tidak punya akses ke endpoint ini.');
    }

    next();
  } catch (error) {
    const statusCode = error.statusCode || 500
    return res.status(statusCode)
      .json({ statusCode, success: false, data: {}, message: error.message })
  }
};

module.exports = {
  verifyJWT,
  isAdmin
};
