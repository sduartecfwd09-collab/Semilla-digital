export const validateEmail = (email: string): { valid: boolean; message?: string } => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return { valid: false, message: 'El correo es obligatorio.' };
  if (!re.test(email)) return { valid: false, message: 'El formato del correo no es válido.' };
  return { valid: true };
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length <= 6) return { valid: false, message: 'La contraseña debe tener más de 6 caracteres.' };
  return { valid: true };
};
