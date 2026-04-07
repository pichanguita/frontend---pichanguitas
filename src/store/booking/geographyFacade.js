/**
 * Módulo Facade: Geografía
 *
 * Delega todas las operaciones geográficas a geographyStore
 * Mantiene estado local sincronizado para reactividad en Zustand
 *
 * ACTUALIZADO: Usa nuevos endpoints que retornan solo ubicaciones con canchas registradas
 */

import useGeographyStore from '../modules/geographyStore'

export const createGeographyFacade = (set, get) => ({
  // Estado local sincronizado (necesario para reactividad en Zustand)
  selectedDepartment: '',
  selectedProvince: '',
  selectedDistrict: '',

  // Estados de carga
  isLoadingDepartments: false,
  isLoadingProvinces: false,
  isLoadingDistricts: false,

  // Datos de ubicaciones con canchas
  departments: [],
  provinces: [],
  districts: [],

  /**
   * Cargar departamentos con canchas desde la API
   * @returns {Promise<Array>} Array de departamentos
   */
  loadDepartments: async () => {
    set({ isLoadingDepartments: true })
    try {
      await useGeographyStore.getState().loadDepartmentsWithFields()
      const departments = useGeographyStore.getState().getDepartments()
      set({ departments, isLoadingDepartments: false })
      return departments
    } catch (error) {
      console.error('Error cargando departamentos:', error)
      set({ isLoadingDepartments: false })
      return []
    }
  },

  /**
   * Cargar provincias con canchas desde la API
   * @param {string} departmentName - Nombre del departamento
   * @returns {Promise<Array>} Array de provincias
   */
  loadProvinces: async (departmentName) => {
    if (!departmentName) {
      set({ provinces: [] })
      return []
    }
    set({ isLoadingProvinces: true })
    try {
      await useGeographyStore.getState().loadProvincesWithFields(departmentName)
      const provinces = useGeographyStore.getState().getProvinces()
      set({ provinces, isLoadingProvinces: false })
      return provinces
    } catch (error) {
      console.error('Error cargando provincias:', error)
      set({ isLoadingProvinces: false })
      return []
    }
  },

  /**
   * Cargar distritos con canchas desde la API
   * @param {string} provinceName - Nombre de la provincia
   * @returns {Promise<Array>} Array de distritos
   */
  loadDistricts: async (provinceName) => {
    if (!provinceName) {
      set({ districts: [] })
      return []
    }
    set({ isLoadingDistricts: true })
    try {
      await useGeographyStore.getState().loadDistrictsWithFields(provinceName)
      const districts = useGeographyStore.getState().getDistricts()
      set({ districts, isLoadingDistricts: false })
      return districts
    } catch (error) {
      console.error('Error cargando distritos:', error)
      set({ isLoadingDistricts: false })
      return []
    }
  },

  // Getters que delegan a geographyStore
  getDepartments: () => {
    return useGeographyStore.getState().getDepartments()
  },

  getProvinces: () => {
    return useGeographyStore.getState().getProvinces()
  },

  getDistricts: () => {
    return useGeographyStore.getState().getDistricts()
  },

  // Setters que actualizan tanto geographyStore como estado local
  setSelectedDepartment: async (departmentId) => {
    useGeographyStore.getState().setSelectedDepartment(departmentId)
    set({
      selectedDepartment: departmentId,
      selectedProvince: '',
      selectedDistrict: '',
      provinces: [],
      districts: [],
      availableFields: [],
    })
    // Cargar provincias del departamento seleccionado
    if (departmentId) {
      await get().loadProvinces(departmentId)
    }
  },

  setSelectedProvince: async (provinceId) => {
    useGeographyStore.getState().setSelectedProvince(provinceId)
    set({
      selectedProvince: provinceId,
      selectedDistrict: '',
      districts: [],
      availableFields: [],
    })
    // Cargar distritos de la provincia seleccionada
    if (provinceId) {
      await get().loadDistricts(provinceId)
    }
  },

  setSelectedDistrict: (districtId) => {
    useGeographyStore.getState().setSelectedDistrict(districtId)
    set({
      selectedDistrict: districtId,
      availableFields: [],
    })
  },
})
