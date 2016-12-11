const consts = require('../const');

module.exports = {
  // Name of document collection.
  DOCUMENT_COLLECTION_NAME: 'notes',
  // Name of the login cookie.
  LOGIN_TOKEN_NAME: 'login',
  // Days before login token expires.
  LOGIN_TOKEN_EXPIRE_DAYS: 14,
  // Byte size of the login token.
  LOGIN_TOKEN_BYTE_SIZE: 20,
  // Default password hash algorithm
  PASSWORD_HASH_PARAMETERS: [
    consts.PASSWORD_HASH_ALGORITHM_PBKDF2,
    consts.PASSWORD_HASH_ALGORITHM_PBKDF2_DIGEST_METHOD,
    consts.PASSWORD_HASH_ALGORITHM_PBKDF2_ITERATIONS,
    consts.PASSWORD_HASH_ALGORITHM_PBKDF2_KEY_BYTE_SIZE,
    consts.PASSWORD_HASH_ALGORITHM_PBKDF2_SALT_BYTE_SIZE
  ].join(consts.PASSWORD_HASH_ALGORITHM_PARAMETER_SEPARATOR),
  DOCUMENT_DEFAULT_TITLE: 'Untitled',
  DOCUMENT_DEFAULT_CONTENT: '',
  DOCUMENT_DEFAULT_MIME: 'text/plain'
};
