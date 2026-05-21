import {
  Beer,
  Car,
  Cookie,
  DoorOpen,
  Droplets,
  GlassWater,
  HeartPulse,
  Shield,
  Sparkles,
  Wifi,
} from 'lucide-react'

/**
 * Registro de íconos disponibles para amenidades.
 *
 * El backend devuelve `icon_name` (string) por cada amenidad del catálogo
 * (amenities_catalog.icon_name). Este archivo es el único punto del frontend
 * que asocia esos nombres a componentes Lucide.
 *
 * Si un nombre no está registrado, se usa `Sparkles` como fallback visual
 * para que la amenidad siga siendo perceptible al cliente.
 */
const ICONS = {
  Beer,
  Car,
  Cookie,
  DoorOpen,
  Droplets,
  GlassWater,
  HeartPulse,
  Shield,
  Wifi,
}

/**
 * Resuelve un icon_name del catálogo a un componente Lucide.
 * @param {string} iconName
 * @returns {React.ComponentType}
 */
export const getAmenityIconComponent = (iconName) => ICONS[iconName] || Sparkles
