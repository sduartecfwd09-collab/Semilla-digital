export const validateEmail = (email: string) => {
  const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!emailRegex.test(email.toLowerCase())) return { valid: false, message: 'Formato de correo electrónico no válido.' };

  const domain = email.split('@')[1].toLowerCase();
  const commonTypos: { [key: string]: string } = {
    'gamil.com': 'gmail.com',
    'hotmal.com': 'hotmail.com',
    'outluk.com': 'outlook.com',
    'gnail.com': 'gmail.com'
  };

  if (commonTypos[domain]) {
    return { valid: false, message: `¿Quisiste decir @${commonTypos[domain]}? Por favor corregí el dominio.` };
  }

  return { valid: true };
};
