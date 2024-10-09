const REGEX = require('./regex.js');

function validate(uuid) {
  return typeof uuid === 'string' && REGEX.test(uuid);
}

module.exports = validate;
