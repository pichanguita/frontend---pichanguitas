import { useState, useCallback } from 'react'
import Swal from 'sweetalert2'
import {
  geocodeReverse,
  searchAddress,
  getCurrentLocation,
} from '../utils/adminRegistrationHelpers'

/**
 * Hook para manejar la selección de ubicación en el mapa
 */
const useLocationPicker = (onLocationUpdate) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)

  /**
   * Manejar selección de ubicación en el mapa
   */
  const handleLocationSelect = useCallback(
    async (coordinates, currentAddress) => {
      const [lat, lng] = coordinates

      // Actualizar coordenadas inmediatamente
      onLocationUpdate(coordinates)

      // Intentar obtener dirección mediante geocodificación inversa
      const address = await geocodeReverse(lat, lng)

      if (address) {
        // Si no hay dirección actual o el usuario confirma, actualizar
        if (
          !currentAddress ||
          window.confirm('¿Deseas actualizar la dirección con la ubicación seleccionada?')
        ) {
          onLocationUpdate(coordinates, address)
        }
      }
    },
    [onLocationUpdate]
  )

  /**
   * Buscar dirección
   */
  const handleSearchAddress = async () => {
    if (!searchQuery.trim()) {
      return
    }

    setIsSearching(true)
    setShowSearchResults(true)

    const results = await searchAddress(searchQuery)
    setSearchResults(results)
    setIsSearching(false)
  }

  /**
   * Seleccionar resultado de búsqueda
   */
  const handleSelectSearchResult = (result) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    const address = result.display_name.split(',')[0]

    // Actualizar coordenadas y dirección
    onLocationUpdate([lat, lng], address)

    // Cerrar resultados
    setShowSearchResults(false)
    setSearchQuery('')
    setSearchResults([])
  }

  /**
   * Obtener ubicación actual del usuario
   */
  const handleGetCurrentLocation = async () => {
    setIsLoadingLocation(true)

    try {
      const { latitude, longitude } = await getCurrentLocation()
      await handleLocationSelect([latitude, longitude], null)

      Swal.fire({
        icon: 'success',
        title: 'Ubicación obtenida',
        text: 'Se ha establecido tu ubicación actual',
        timer: 2000,
        showConfirmButton: false,
      })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error de geolocalización',
        text: error.message,
        confirmButtonColor: '#ef4444',
      })
    } finally {
      setIsLoadingLocation(false)
    }
  }

  /**
   * Cerrar resultados de búsqueda
   */
  const closeSearchResults = () => {
    setShowSearchResults(false)
    setSearchResults([])
  }

  return {
    // Estados
    searchQuery,
    isSearching,
    searchResults,
    showSearchResults,
    isLoadingLocation,

    // Setters
    setSearchQuery,

    // Handlers
    handleLocationSelect,
    handleSearchAddress,
    handleSelectSearchResult,
    handleGetCurrentLocation,
    closeSearchResults,
  }
}

export default useLocationPicker
