import React from 'react'
import { Car, Wifi, Shield, Droplet, Lightbulb } from 'lucide-react'

/**
 * Mapea una amenidad a su ícono correspondiente
 */
export const getAmenityIcon = (amenity) => {
  const normalizedAmenity = amenity.toLowerCase()

  if (normalizedAmenity.includes('estacionamiento') || normalizedAmenity.includes('parking')) {
    return { Icon: Car, color: 'bg-blue-600', label: 'Estacionamiento' }
  }
  if (normalizedAmenity.includes('wifi')) {
    return { Icon: Wifi, color: 'bg-purple-600', label: 'WiFi' }
  }
  if (normalizedAmenity.includes('vestuario')) {
    return { Icon: Droplet, color: 'bg-cyan-600', label: 'Vestuarios' }
  }
  if (normalizedAmenity.includes('ducha')) {
    return { Icon: Droplet, color: 'bg-teal-600', label: 'Duchas' }
  }
  if (normalizedAmenity.includes('seguridad')) {
    return { Icon: Shield, color: 'bg-red-600', label: 'Seguridad' }
  }
  if (normalizedAmenity.includes('iluminación') || normalizedAmenity.includes('led')) {
    return { Icon: Lightbulb, color: 'bg-yellow-500', label: 'Iluminación' }
  }

  return null
}

/**
 * Obtiene los principales servicios visuales de una cancha
 */
export const getMainAmenities = (field) => {
  if (!field.amenities || !Array.isArray(field.amenities)) return []

  const amenitiesWithIcons = field.amenities
    .map((amenity) => getAmenityIcon(amenity))
    .filter((item) => item !== null)
    .slice(0, 4) // Máximo 4 íconos

  return amenitiesWithIcons
}
