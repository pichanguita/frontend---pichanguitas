/**
 * Constantes para generación de reportes
 */

// Colores para tablas PDF
export const PDF_COLORS = {
  PRIMARY: [59, 130, 246],
  SUCCESS: [34, 197, 94],
  INFO: [99, 102, 241],
  WARNING: [168, 85, 247],
  EMERALD: [16, 185, 129],
  ALTERNATE_ROW: [248, 250, 252],
  ALTERNATE_PRIMARY: [240, 253, 244],
  ALTERNATE_INFO: [250, 245, 255],
  ALTERNATE_EMERALD: [240, 253, 250],
  ALTERNATE_BLUE: [239, 246, 255],
  TEXT: 255,
}

// Estilos de tablas
export const TABLE_STYLES = {
  fontSize: 10,
  cellPadding: 5,
}

export const TABLE_STYLES_COMPACT = {
  fontSize: 9,
  cellPadding: 4,
}

// Márgenes
export const PDF_MARGINS = {
  left: 20,
  right: 20,
}

// Posiciones
export const PDF_POSITIONS = {
  TITLE_Y: 25,
  DATE_Y: 35,
  PERIOD_Y: 42,
  LINE_Y: 48,
  FIRST_SECTION_Y: 60,
  FOOTER_Y: 285,
  FOOTER_X_RIGHT: 190,
}

// Tamaños de fuente
export const FONT_SIZES = {
  TITLE: 20,
  SUBTITLE: 14,
  NORMAL: 12,
  TABLE_HEADER: 11,
  SMALL: 8,
}

// Textos por defecto
export const DEFAULT_TEXTS = {
  SYSTEM_NAME: 'Sistema de Gestión de Canchas - Apurímac',
  PAGE_PREFIX: 'Página',
  PAGE_SEPARATOR: 'de',
}
