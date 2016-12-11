const util = require('util');


/**
 * @readonly
 * @enum {string}
 */
const ClientErrorCode = {
  ERROR_BAD_ARGUMENT: 'ERROR_BAD_ARGUMENT',
  ERROR_DUPLICATED_USER: 'ERROR_DUPLICATED_USER',
  ERROR_USER_NOT_FOUND: 'ERROR_USER_NOT_FOUND',
  ERROR_PASSWORD_MISMATCH: 'ERROR_PASSWORD_MISMATCH',
  ERROR_LOGIN_TOKEN_NOT_FOUND: 'ERROR_LOGIN_TOKEN_NOT_FOUND',
  ERROR_LOGIN_TOKEN_USED: 'ERROR_LOGIN_TOKEN_USED',
  ERROR_LOGIN_TOKEN_EXPIRED: 'ERROR_LOGIN_TOKEN_EXPIRED',
  ERROR_DOCUMENT_NOT_FOUND: 'ERROR_DOCUMENT_NOT_FOUND',
  ERROR_DOCUMENT_ACCESS_DENIED: 'ERROR_DOCUMENT_ACCESS_DENIED',
  ERROR_RECAPTCHA_MISMATCH: 'ERROR_RECAPTCHA_MISMATCH',
};

/**
 * Client error.
 *
 * @param {string} errorCode Error code.
 * @param {*?} errorInfo Additional error info..
 * @constructor
 */
function ClientError(errorCode, errorInfo) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = errorCode;
  this.errorCode = errorCode;
  this.errorInfo = errorInfo;
}
util.inherits(ClientError, Error);

module.exports = {
  ClientError,
  ClientErrorCode
};
