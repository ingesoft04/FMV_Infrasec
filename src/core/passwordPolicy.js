function isStrongPassword(value) {
  return typeof value === 'string' && value.length >= 12
    && /[a-z]/.test(value) && /[A-Z]/.test(value)
    && /\d/.test(value) && /[^A-Za-z0-9]/.test(value);
}

const passwordRequirement = 'mínimo 12 caracteres e incluir mayúscula, minúscula, número y símbolo';

module.exports = { isStrongPassword, passwordRequirement };
