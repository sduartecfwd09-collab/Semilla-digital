export const validateEmail = (email: string): { valid: boolean; message?: string } => {
  const trimmedEmail = email.trim();
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!trimmedEmail) return { valid: false, message: 'El correo es obligatorio.' };
  if (!re.test(trimmedEmail)) return { valid: false, message: 'El formato del correo no es válido.' };
  return { valid: true };
};

// Longitud mínima de contraseña exigida por TODO el frontend.
// Cambiar acá impacta registro, edición de perfil y cambio de contraseña.
export const MIN_PASSWORD_LENGTH = 8;

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (!password) return { valid: false, message: 'La contraseña es obligatoria.' };
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { valid: false, message: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.` };
  }
  return { valid: true };
};
