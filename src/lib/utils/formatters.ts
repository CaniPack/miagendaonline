// ============================================================================
// FORMATTERS - Utilidades de formateo compartidas
// ============================================================================

/**
 * Formatea montos en pesos chilenos
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formatea fechas en formato legible en español
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit", 
    year: "numeric",
  });
};

/**
 * Formatea fechas en formato largo en español
 */
export const formatDateLong = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

/**
 * Formatea hora desde string de fecha
 */
export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

/**
 * Formatea duración en minutos a formato legible
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
};

/**
 * Formatea porcentajes
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Formatea números grandes con separadores
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("es-CL").format(num);
};

/**
 * Formatea teléfonos chilenos
 */
export const formatPhone = (phone: string): string => {
  // Remueve espacios y caracteres especiales
  const cleaned = phone.replace(/\D/g, "");
  
  // Si tiene código de país (+56), lo formatea correctamente
  if (cleaned.startsWith("56") && cleaned.length === 11) {
    const areaCode = cleaned.substring(2, 3);
    const number = cleaned.substring(3);
    return `+56 ${areaCode} ${number}`;
  }
  
  // Si es número local de 9 dígitos
  if (cleaned.length === 9) {
    return `+56 9 ${cleaned}`;
  }
  
  // Si es número local de 8 dígitos (fijo)
  if (cleaned.length === 8) {
    return `+56 ${cleaned.substring(0, 1)} ${cleaned.substring(1)}`;
  }
  
  // Retorna tal como está si no coincide con formatos conocidos
  return phone;
};

/**
 * Trunca texto con puntos suspensivos
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
};

/**
 * Capitaliza primera letra de cada palabra
 */
export const capitalizeWords = (text: string): string => {
  return text.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
};

/**
 * Formatea tiempo relativo (hace X tiempo)
 */
export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  const intervals = [
    { label: 'año', seconds: 31536000 },
    { label: 'mes', seconds: 2592000 },
    { label: 'semana', seconds: 604800 },
    { label: 'día', seconds: 86400 },
    { label: 'hora', seconds: 3600 },
    { label: 'minuto', seconds: 60 },
  ];
  
  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      const plural = count > 1 ? 's' : '';
      return `hace ${count} ${interval.label}${plural}`;
    }
  }
  
  return 'hace un momento';
}; 