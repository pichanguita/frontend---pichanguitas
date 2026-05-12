import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { API_CONFIG, getToken } from '../config/api.config'
import {
  fetchDepartments,
  fetchProvincesByDepartment,
  fetchDistrictsByProvince,
} from '../services/locations/locationsService'
import { formatPhone } from '../components/NewFieldModal/utils/fieldValidators'
import useFieldStore from '../store/modules/fieldStore'

// Mapeo inverso de amenity a service (para precargar servicios desde amenities)
const AMENITY_TO_SERVICE_MAP = {
  Bar: 'hasBar',
  'Venta de bebidas': 'hasDrinks',
  'Venta de snacks': 'hasSnacks',
  Estacionamiento: 'hasParking',
  Vestuarios: 'hasChangingRooms',
  Duchas: 'hasShowers',
  WiFi: 'hasWifi',
  Seguridad: 'hasSecurity',
  'Primeros auxilios': 'hasFirstAid',
}

// Mapeo inverso: de service a amenity (para enviar al backend)
const SERVICE_TO_AMENITY_MAP = {
  hasBar: 'Bar',
  hasDrinks: 'Venta de bebidas',
  hasSnacks: 'Venta de snacks',
  hasParking: 'Estacionamiento',
  hasChangingRooms: 'Vestuarios',
  hasShowers: 'Duchas',
  hasWifi: 'WiFi',
  hasSecurity: 'Seguridad',
  hasFirstAid: 'Primeros auxilios',
}

// Convierte objeto de services a array de amenities (para enviar al backend)
const servicesToAmenities = (services = {}) => {
  const amenities = []
  Object.entries(services).forEach(([key, value]) => {
    if (value && SERVICE_TO_AMENITY_MAP[key]) {
      amenities.push(SERVICE_TO_AMENITY_MAP[key])
    }
  })
  return amenities
}

// Convierte array de amenities a objeto de services
const amenitiestoServices = (amenities = []) => {
  const services = {
    hasBar: false,
    hasDrinks: false,
    hasSnacks: false,
    hasParking: false,
    hasChangingRooms: false,
    hasShowers: false,
    hasWifi: false,
    hasSecurity: false,
    hasFirstAid: false,
  }

  if (Array.isArray(amenities)) {
    amenities.forEach((amenity) => {
      const serviceKey = AMENITY_TO_SERVICE_MAP[amenity]
      if (serviceKey) {
        services[serviceKey] = true
      }
    })
  }

  return services
}

// Extrae el valor numérico puro de un string que puede contener sufijos de unidad (ej: "100m" → "100")
const stripDimensionUnit = (value) => {
  if (value == null) return ''
  const str = value.toString().replace(/\s*(m²|m)\s*$/i, '').trim()
  return str === '' ? '' : str
}

export const useEditFieldForm = (isOpen, field, onSave, onClose) => {
  const [formData, setFormData] = useState({
    // Información básica
    name: '',
    departamento: '',
    provincia: '',
    distrito: '',
    districtId: '',
    address: '',
    phone: '',
    latitude: '',
    longitude: '',

    // Precios y configuración
    pricePerHour: '',
    advancePaymentAmount: '',
    requiresAdvancePayment: false,
    status: 'available',
    capacity: '',
    isActive: true,

    // Deportes
    sportTypes: [],
    isMultiSport: false,
    fieldType: '',

    // Dimensiones
    dimensions: {
      length: '',
      width: '',
      area: '',
      surfaceType: 'cesped_sintetico',
    },

    // Servicios
    services: {
      hasBar: false,
      hasDrinks: false,
      hasSnacks: false,
      hasParking: false,
      hasChangingRooms: false,
      hasShowers: false,
      hasWifi: false,
      hasSecurity: false,
      hasFirstAid: false,
    },

    // Equipamiento
    equipment: {
      hasJerseyRental: false,
      jerseyPrice: '',
      hasBallRental: false,
      ballPrice: '',
      hasConeRental: false,
      conePrice: '',
    },

    // Detalles de bar
    barDetails: {
      openDuringGames: false,
    },
  })

  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [activeTab, setActiveTab] = useState('form')
  const [availableProvinces, setAvailableProvinces] = useState([])
  const [availableDistricts, setAvailableDistricts] = useState([])

  // Cargar provincias cuando se seleccione un departamento
  const loadProvincesForDepartment = async (departamentoId) => {
    if (!departamentoId) {
      setAvailableProvinces([])
      setAvailableDistricts([])
      return []
    }

    try {
      const token = getToken()
      const provinces = await fetchProvincesByDepartment(departamentoId, token)
      setAvailableProvinces(provinces)
      setAvailableDistricts([])
      return provinces
    } catch (error) {
      console.error('Error al cargar provincias:', error)
      setAvailableProvinces([])
      return []
    }
  }

  // Cargar distritos cuando se seleccione una provincia
  const loadDistrictsForProvince = async (provinciaId) => {
    if (!provinciaId) {
      setAvailableDistricts([])
      return []
    }

    try {
      const token = getToken()
      const districts = await fetchDistrictsByProvince(provinciaId, token)
      setAvailableDistricts(districts)
      return districts
    } catch (error) {
      console.error('Error al cargar distritos:', error)
      setAvailableDistricts([])
      return []
    }
  }

  // Cargar datos del campo cuando el modal se abra
  useEffect(() => {
    const loadFieldData = async () => {
      if (isOpen && field) {
        let departamentoId = field.departamento || ''
        let provinciaId = field.provincia || ''
        let distritoId = field.distrito || ''

        // Si departamento es texto (nombre), buscar el ID
        if (field.departamento && isNaN(field.departamento)) {
          try {
            const token = getToken()
            const allDepartments = await fetchDepartments(token)
            const foundDept = allDepartments.find((d) => d.name === field.departamento)
            if (foundDept) {
              departamentoId = foundDept.id
            }
          } catch (error) {
            console.error('Error al buscar departamento:', error)
          }
        }

        // Cargar provincias para el departamento
        if (departamentoId) {
          const provinces = await loadProvincesForDepartment(departamentoId)

          // Si provincia es texto (nombre), buscar el ID
          if (field.provincia && isNaN(field.provincia)) {
            const foundProv = provinces.find((p) => p.name === field.provincia)
            if (foundProv) {
              provinciaId = foundProv.id
            }
          }
        }

        // Cargar distritos para la provincia
        if (provinciaId) {
          const districts = await loadDistrictsForProvince(provinciaId)

          // Si distrito es texto (nombre), buscar el ID
          if (field.distrito && isNaN(field.distrito)) {
            const foundDist = districts.find((d) => d.name === field.distrito)
            if (foundDist) {
              distritoId = foundDist.id
            }
          }
        }

        // Formatear teléfono al cargar (quitar código de país y formatear)
        const rawPhone = field.phone || ''
        const phoneDigits = rawPhone.replace(/\D/g, '') // Quitar todo lo que no sea número
        const phoneLast9Digits = phoneDigits.slice(-9) // Tomar los últimos 9 dígitos
        const formattedPhone = formatPhone(phoneLast9Digits)

        // Establecer el formData con todos los valores (usando IDs)
        setFormData({
          // Información básica
          name: field.name || '',
          departamento: departamentoId,
          provincia: provinciaId,
          distrito: distritoId,
          districtId: field.district_id || field.districtId || '',
          address: field.address || '',
          phone: formattedPhone,
          latitude:
            field.latitude?.toString() ||
            (field.coordinates ? field.coordinates[1]?.toString() : '') ||
            '',
          longitude:
            field.longitude?.toString() ||
            (field.coordinates ? field.coordinates[0]?.toString() : '') ||
            '',

          // Precios y configuración
          pricePerHour: field.price_per_hour?.toString() || field.pricePerHour?.toString() || '',
          advancePaymentAmount:
            field.advance_payment_amount?.toString() ||
            field.advancePaymentAmount?.toString() ||
            '',
          requiresAdvancePayment:
            field.requires_advance_payment || field.requiresAdvancePayment || false,
          status: field.status || 'available',
          capacity: field.capacity?.toString() || '',
          isActive: field.is_active ?? field.isActive ?? true,

          // Deportes - Asegurar que sportTypes sean IDs numéricos.
          // Sólo se usa el array `sportTypes` (que el backend ya filtra a activos).
          // Se ignora el campo legacy `sport_type` (singular) porque podría
          // apuntar a un deporte soft-deleted, lo que llevaría a enviar un id
          // inactivo y fallar la validación al guardar.
          sportTypes: (() => {
            const types = field.sportTypes || field.sport_types || []
            if (Array.isArray(types) && types.length > 0) {
              const firstType = types[0]
              if (typeof firstType === 'number') {
                return types
              }
              if (typeof firstType === 'string' && !isNaN(parseInt(firstType))) {
                return types.map((t) => parseInt(t))
              }
            }
            return []
          })(),
          isMultiSport: field.is_multi_sport || field.isMultiSport || false,
          fieldType: field.field_type || field.fieldType || '',

          // Dimensiones (sanitizar sufijos legacy "m" / "m²" para inputs type="number")
          dimensions: {
            length: stripDimensionUnit(field.dimensions?.length),
            width: stripDimensionUnit(field.dimensions?.width),
            area: stripDimensionUnit(field.dimensions?.area),
            surfaceType: field.dimensions?.surfaceType || 'cesped_sintetico',
          },

          // Servicios - Convertir amenities del backend a formato de services
          services: (() => {
            // Priorizar amenities del backend (viene como array de strings)
            const amenities = field.amenities || []
            if (amenities.length > 0) {
              return amenitiestoServices(amenities)
            }
            // Fallback al formato services si existe
            return {
              hasBar: field.services?.hasBar || false,
              hasDrinks: field.services?.hasDrinks || false,
              hasSnacks: field.services?.hasSnacks || false,
              hasParking: field.services?.hasParking || false,
              hasChangingRooms: field.services?.hasChangingRooms || false,
              hasShowers: field.services?.hasShowers || false,
              hasWifi: field.services?.hasWifi || false,
              hasSecurity: field.services?.hasSecurity || false,
              hasFirstAid: field.services?.hasFirstAid || false,
            }
          })(),

          // Equipamiento
          equipment: {
            hasJerseyRental: field.equipment?.hasJerseyRental || false,
            jerseyPrice: field.equipment?.jerseyPrice?.toString() || '',
            hasBallRental: field.equipment?.hasBallRental || false,
            ballPrice: field.equipment?.ballPrice?.toString() || '',
            hasConeRental: field.equipment?.hasConeRental || false,
            conePrice: field.equipment?.conePrice?.toString() || '',
          },

          // Detalles de bar
          barDetails: {
            openDuringGames: field.barDetails?.openDuringGames || false,
          },
        })

        setSelectedLocation(null)
        setActiveTab('form')
        setErrors({})
      }
    }

    loadFieldData()
  }, [isOpen, field])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target

    // Manejar campos anidados (ej: dimensions.length, services.hasBar)
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value,
        },
      }))

      // Auto-calcular área si se modifican largo o ancho
      if (parent === 'dimensions' && (child === 'length' || child === 'width')) {
        const length =
          child === 'length' ? parseFloat(value) : parseFloat(formData.dimensions.length)
        const width = child === 'width' ? parseFloat(value) : parseFloat(formData.dimensions.width)
        if (!isNaN(length) && !isNaN(width) && length > 0 && width > 0) {
          setFormData((prev) => ({
            ...prev,
            dimensions: {
              ...prev.dimensions,
              [child]: value,
              area: (length * width).toFixed(2),
            },
          }))
        }
      }
    } else if (name === 'phone') {
      // Formatear teléfono con espacios cada 3 dígitos (XXX XXX XXX)
      const formatted = formatPhone(value)
      setFormData((prev) => ({
        ...prev,
        [name]: formatted,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }))

      // Si cambia el departamento, cargar provincias
      if (name === 'departamento') {
        loadProvincesForDepartment(value)
        setFormData((prev) => ({
          ...prev,
          provincia: '',
          distrito: '',
          districtId: '',
        }))
      }

      // Si cambia la provincia, cargar distritos
      if (name === 'provincia') {
        loadDistrictsForProvince(value)
        setFormData((prev) => ({
          ...prev,
          distrito: '',
          districtId: '',
        }))
      }

      // Si cambia el distrito, guardar también el districtId
      if (name === 'distrito') {
        setFormData((prev) => ({
          ...prev,
          districtId: value, // El value es el ID numérico del distrito
        }))
      }

      // Sincronizar status e isActive
      if (name === 'status') {
        // Si cambia a 'available', activar automáticamente isActive
        if (value === 'available') {
          setFormData((prev) => ({
            ...prev,
            isActive: true,
          }))
        }
        // Si cambia a 'inactive', desactivar automáticamente isActive
        else if (value === 'inactive') {
          setFormData((prev) => ({
            ...prev,
            isActive: false,
          }))
        }
      }

      // Si desactiva isActive manualmente, cambiar status a 'inactive'
      if (name === 'isActive' && type === 'checkbox' && !checked) {
        setFormData((prev) => ({
          ...prev,
          status: 'inactive',
        }))
      }
    }

    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleLocationSelect = async (locationData) => {
    if (locationData.error) {
      Swal.fire({
        icon: 'error',
        title: 'Ubicación inválida',
        text: locationData.error,
        confirmButtonColor: '#22c55e',
        showCloseButton: true,
        allowEscapeKey: true,
      })
      return
    }

    if (locationData.success) {
      let departamentoId = ''
      let provinciaId = ''
      let distritoId = ''

      // Si hay datos geográficos, intentar buscar los IDs en la BD
      if (locationData.geoData) {
        try {
          const token = getToken()

          // Buscar departamento
          if (locationData.geoData.department) {
            const allDepartments = await fetchDepartments(token)
            const foundDept = allDepartments.find(
              (d) =>
                d.name.toLowerCase().includes(locationData.geoData.department.toLowerCase()) ||
                locationData.geoData.department.toLowerCase().includes(d.name.toLowerCase())
            )
            if (foundDept) {
              departamentoId = foundDept.id

              // Cargar provincias para ese departamento
              const provinces = await loadProvincesForDepartment(departamentoId)

              // Buscar provincia
              if (locationData.geoData.province) {
                if (provinces.length > 0) {
                  const foundProv = provinces.find(
                    (p) =>
                      p.name.toLowerCase().includes(locationData.geoData.province.toLowerCase()) ||
                      locationData.geoData.province.toLowerCase().includes(p.name.toLowerCase())
                  )
                  if (foundProv) {
                    provinciaId = foundProv.id

                    // Cargar distritos para esa provincia
                    const districts = await loadDistrictsForProvince(provinciaId)

                    // Buscar distrito
                    if (locationData.geoData.district) {
                      if (districts.length > 0) {
                        // Intentar búsqueda exacta o parcial
                        let foundDist = districts.find(
                          (d) =>
                            d.name
                              .toLowerCase()
                              .includes(locationData.geoData.district.toLowerCase()) ||
                            locationData.geoData.district
                              .toLowerCase()
                              .includes(d.name.toLowerCase())
                        )

                        // Si no se encuentra, intentar buscar el distrito con el mismo nombre que la provincia
                        if (!foundDist) {
                          foundDist = districts.find(
                            (d) => d.name.toLowerCase() === foundProv.name.toLowerCase()
                          )
                        }

                        if (foundDist) {
                          distritoId = foundDist.id
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error('Error al buscar ubicación geográfica:', error)
        }
      }

      // Actualizar formulario con los datos encontrados
      setFormData((prev) => ({
        ...prev,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        address: locationData.address,
        location: locationData.location,
        departamento: departamentoId,
        provincia: provinciaId,
        distrito: distritoId,
        districtId: distritoId, // Guardar también el ID del distrito
      }))

      // Mostrar mensaje informativo si no se encontró todo
      if (departamentoId && provinciaId && !distritoId && locationData.geoData?.district) {
        Swal.fire({
          icon: 'info',
          title: 'Distrito no encontrado',
          html: `
            <p>Se autocompletaron <strong>Departamento</strong> y <strong>Provincia</strong>, pero el distrito "<strong>${locationData.geoData.district}</strong>" no se encontró en la base de datos.</p>
            <p class="mt-2">Por favor, selecciona manualmente el distrito correcto en el formulario.</p>
          `,
          confirmButtonColor: '#22c55e',
          showCloseButton: true,
          allowEscapeKey: true,
        })
      } else if (departamentoId && !provinciaId && locationData.geoData?.province) {
        Swal.fire({
          icon: 'info',
          title: 'Provincia no encontrada',
          html: `
            <p>Se autocompletó el <strong>Departamento</strong>, pero la provincia "<strong>${locationData.geoData.province}</strong>" no se encontró en la base de datos.</p>
            <p class="mt-2">Por favor, selecciona manualmente la provincia y distrito correctos en el formulario.</p>
          `,
          confirmButtonColor: '#22c55e',
          showCloseButton: true,
          allowEscapeKey: true,
        })
      } else if (departamentoId && provinciaId && distritoId) {
        // Todo se encontró correctamente
        Swal.fire({
          icon: 'success',
          title: 'Ubicación autocompletada',
          text: 'Se han autocompletado todos los campos de ubicación basándose en las coordenadas del mapa.',
          timer: 2000,
          showConfirmButton: false,
        })
      }

      setSelectedLocation(locationData)

      setErrors((prev) => ({
        ...prev,
        latitude: '',
        longitude: '',
        address: '',
        location: '',
        departamento: '',
        provincia: '',
        distrito: '',
      }))

      if (locationData.warning) {
        Swal.fire({
          icon: 'warning',
          title: 'Aviso',
          text: locationData.warning,
          confirmButtonColor: '#22c55e',
          showCloseButton: true,
          allowEscapeKey: true,
        })
      }
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Validaciones básicas
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre de la cancha es requerido'
    }

    if (!formData.departamento) {
      newErrors.departamento = 'El departamento es requerido'
    }

    if (!formData.provincia) {
      newErrors.provincia = 'La provincia es requerida'
    }

    if (!formData.distrito) {
      newErrors.distrito = 'El distrito es requerido'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es requerida'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido'
    } else if (!/^9\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Formato de teléfono inválido (999999999)'
    }

    if (!formData.sportTypes || formData.sportTypes.length === 0) {
      newErrors.sportTypes = 'Selecciona al menos un deporte'
    }

    if (formData.requiresAdvancePayment && !formData.pricePerHour) {
      newErrors.pricePerHour = 'El precio por hora es requerido cuando se requiere pago adelantado'
    } else if (formData.pricePerHour && (formData.pricePerHour < 10 || formData.pricePerHour > 500)) {
      newErrors.pricePerHour = 'El precio debe estar entre S/ 10 y S/ 500'
    }

    if (formData.advancePaymentAmount && formData.pricePerHour) {
      if (parseFloat(formData.advancePaymentAmount) > parseFloat(formData.pricePerHour)) {
        newErrors.advancePaymentAmount = 'El adelanto no puede ser mayor al precio por hora'
      }
    }

    if (!formData.latitude) {
      newErrors.latitude = 'La latitud es requerida'
    } else if (isNaN(formData.latitude)) {
      newErrors.latitude = 'Latitud inválida'
    }

    if (!formData.longitude) {
      newErrors.longitude = 'La longitud es requerida'
    } else if (isNaN(formData.longitude)) {
      newErrors.longitude = 'Longitud inválida'
    }

    // Validaciones de dimensiones
    if (
      formData.dimensions.length &&
      (isNaN(formData.dimensions.length) ||
        formData.dimensions.length < 10 ||
        formData.dimensions.length > 150)
    ) {
      newErrors['dimensions.length'] = 'El largo debe estar entre 10 y 150 metros'
    }

    if (
      formData.dimensions.width &&
      (isNaN(formData.dimensions.width) ||
        formData.dimensions.width < 5 ||
        formData.dimensions.width > 100)
    ) {
      newErrors['dimensions.width'] = 'El ancho debe estar entre 5 y 100 metros'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos Incompletos',
        text: 'Por favor completa todos los campos requeridos',
        confirmButtonColor: '#22c55e',
      })
      return
    }

    // Defensa: descartar IDs que ya no estén en el catálogo activo (por ej.
    // deportes soft-deleted que pudieron quedar en state desde un render
    // anterior). Si tras el filtro queda vacío, abortar con mensaje claro.
    const activeSportTypes = useFieldStore.getState().sportTypes || []
    const activeSportIds = new Set(activeSportTypes.map((s) => parseInt(s.id)))
    const cleanSportTypes = (formData.sportTypes || [])
      .map((id) => parseInt(id))
      .filter((id) => activeSportIds.has(id))

    if (cleanSportTypes.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Selecciona al menos un deporte',
        text: 'Debes seleccionar al menos un deporte disponible para guardar la cancha.',
        confirmButtonColor: '#22c55e',
      })
      return
    }

    setIsLoading(true)

    try {
      // Convertir IDs a nombres para enviar al backend (la tabla fields guarda nombres)
      const token = getToken()
      let departamentoName = formData.departamento
      let provinciaName = formData.provincia
      let distritoName = formData.distrito

      // Si son IDs numéricos, obtener los nombres
      if (!isNaN(formData.departamento)) {
        const allDepartments = await fetchDepartments(token)
        const dept = allDepartments.find((d) => d.id === parseInt(formData.departamento))
        if (dept) departamentoName = dept.name
      }

      if (!isNaN(formData.provincia) && availableProvinces.length > 0) {
        const prov = availableProvinces.find((p) => p.id === parseInt(formData.provincia))
        if (prov) provinciaName = prov.name
      }

      if (!isNaN(formData.distrito) && availableDistricts.length > 0) {
        const dist = availableDistricts.find((d) => d.id === parseInt(formData.distrito))
        if (dist) distritoName = dist.name
      }

      // Preparar datos para la API
      const updateData = {
        name: formData.name.trim(),
        location: formData.address.trim(), // El backend usa "location" para dirección general
        departamento: departamentoName,
        provincia: provinciaName,
        distrito: distritoName,
        district_id: parseInt(formData.districtId) || null,
        address: formData.address.trim(),
        phone: `+51 ${formData.phone.replace(/\s/g, '').trim()}`, // Quitar espacios y agregar código de país
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        price_per_hour: formData.pricePerHour ? parseFloat(formData.pricePerHour) : 0,
        status: formData.status,
        field_type: formData.dimensions.surfaceType || null, // Tipo de superficie (césped sintético, natural, etc.)
        sport_type: cleanSportTypes.length > 0 ? cleanSportTypes[0] : null,
        sport_ids: cleanSportTypes, // Array filtrado de IDs activos
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        requires_advance_payment: formData.requiresAdvancePayment,
        advance_payment_amount: formData.advancePaymentAmount
          ? parseFloat(formData.advancePaymentAmount)
          : 0,
        is_active: formData.isActive,
        is_multi_sport: cleanSportTypes.length > 1,

        // Dimensiones de la cancha
        dimensions: {
          length: formData.dimensions.length || null,
          width: formData.dimensions.width || null,
          area: formData.dimensions.area || null,
          surface_type: formData.dimensions.surfaceType || null,
        },

        // Amenities/Servicios - Convertir de services object a array de strings
        amenities: servicesToAmenities(formData.services),

        // Equipamiento
        equipment: {
          has_jersey_rental: formData.equipment?.hasJerseyRental || false,
          jersey_price: formData.equipment?.jerseyPrice
            ? parseFloat(formData.equipment.jerseyPrice)
            : null,
          has_ball_rental: formData.equipment?.hasBallRental || false,
          ball_rental_price: formData.equipment?.ballPrice
            ? parseFloat(formData.equipment.ballPrice)
            : null,
          has_cone_rental: formData.equipment?.hasConeRental || false,
          cone_price: formData.equipment?.conePrice
            ? parseFloat(formData.equipment.conePrice)
            : null,
        },
      }

      // Llamar a la API PUT para actualizar
      const response = await fetch(API_CONFIG.FIELDS.UPDATE(field.id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar la cancha')
      }

      Swal.fire({
        icon: 'success',
        title: '¡Cancha Actualizada!',
        text: `${formData.name} ha sido actualizada exitosamente`,
        timer: 2500,
        showConfirmButton: false,
        showCloseButton: true,
        allowEscapeKey: true,
      })

      // Llamar callback de éxito si existe
      if (onSave) {
        await onSave(field.id, data.data)
      }

      onClose()
    } catch (error) {
      console.error('Error al actualizar cancha:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error al Actualizar',
        text: error.message || 'No se pudo actualizar la cancha. Intenta nuevamente.',
        confirmButtonColor: '#ef4444',
        showCloseButton: true,
        allowEscapeKey: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSportToggle = (sportId, isChecked) => {
    if (isChecked) {
      setFormData((prev) => ({
        ...prev,
        sportTypes: [...prev.sportTypes, parseInt(sportId)],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        sportTypes: prev.sportTypes.filter((id) => id !== parseInt(sportId)),
      }))
    }

    if (errors.sportTypes) {
      setErrors((prev) => ({ ...prev, sportTypes: '' }))
    }
  }

  const handleMultiSportToggle = () => {
    setFormData((prev) => ({
      ...prev,
      isMultiSport: !prev.isMultiSport,
    }))
  }

  return {
    formData,
    errors,
    isLoading,
    selectedLocation,
    activeTab,
    availableProvinces,
    availableDistricts,
    setActiveTab,
    handleInputChange,
    handleLocationSelect,
    handleSubmit,
    handleSportToggle,
    handleMultiSportToggle,
  }
}
