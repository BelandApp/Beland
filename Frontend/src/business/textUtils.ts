/**
 * Utilidades para formateo de texto y entrada de usuario
 */

/**
 * Formatea automáticamente la entrada de hora (agrega : después de 2 dígitos)
 */
export const formatTimeInput = (text: string): string => {
  // Solo permitir números y ':'
  const formattedText = text.replace(/[^0-9:]/g, "");

  // Auto-formatear hora (agregar : después de 2 dígitos)
  if (formattedText.length === 2 && !formattedText.includes(":")) {
    return formattedText + ":";
  } else if (formattedText.length <= 5) {
    return formattedText;
  }

  return text; // Devolver el texto original si excede la longitud
};

/**
 * Limpia y formatea el nombre de una persona
 */
export const formatPersonName = (name: string): string => {
  return name.trim();
};

/**
 * Limpia y formatea un email
 */
export const formatEmail = (email: string): string => {
  return email.trim().toLowerCase();
};
