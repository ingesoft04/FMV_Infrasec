function isStrongPassword(value) {
  return typeof value === 'string' && value.length >= 10
    && /[a-z]/.test(value) && /[A-Z]/.test(value)
    && /\d/.test(value) && /[^A-Za-z0-9]/.test(value);
}

const passwordRequirement = 'mínimo 10 caracteres e incluir mayúscula, minúscula, número y símbolo';

module.exports = { isStrongPassword, passwordRequirement };
