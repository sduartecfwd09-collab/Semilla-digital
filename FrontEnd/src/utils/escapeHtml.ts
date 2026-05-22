/**
 * Escapa caracteres HTML peligrosos para evitar inyección XSS cuando se interpola
 * texto controlado por el usuario (o por el backend) dentro de plantillas HTML
 * que luego se renderizan vía SweetAlert2 (`html: ...`) o `dangerouslySetInnerHTML`.
 *
 * Devuelve string seguro para incluir como texto dentro de un nodo HTML.
 */
export const escapeHtml = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};
