import { create } from 'zustand'
import {
  fetchDepartmentsWithFields,
  fetchProvincesWithFieldsByDepartment,
  fetchDistrictsWithFieldsByProvince,
} from '../../services/locations/locationsService'

/**
 * Geography Store
 * Maneja ubicaciones geográficas que tienen canchas registradas
 * Usa endpoints optimizados del backend para obtener solo ubicaciones con canchas activas y aprobadas
 */
const useGeographyStore = create((set, get) => ({
  // Estado de ubicaciones seleccionadas
  selectedDepartment: '',
  selectedProvince: '',
  selectedDistrict: '',

  // Datos de ubicaciones con canchas (cargados desde API)
  departmentsWithFields: [],
  provincesWithFields: [],
  districtsWithFields: [],

  // Estado de carga
  isLoadingDepartments: false,
  isLoadingProvinces: false,
  isLoadingDistricts: false,

  /**
   * Cargar departamentos que tienen canchas registradas desde la API
   * @returns {Promise<Array>} Array de departamentos con canchas
   */
  loadDepartmentsWithFields: async () => {
    set({ isLoadingDepartments: true })
    try {
      const departments = await fetchDepartmentsWithFields()
      set({ departmentsWithFields: departments, isLoadingDepartments: false })
      return departments
    } catch (error) {
      console.error('Error cargando departamentos con canchas:', error)
      set({ isLoadingDepartments: false })
      return []
    }
  },

  /**
   * Cargar provincias que tienen canchas registradas desde la API
   * @param {string} departmentName - Nombre del departamento
   * @returns {Promise<Array>} Array de provincias con canchas
   */
  loadProvincesWithFields: async (departmentName) => {
    if (!departmentName) {
      set({ provincesWithFields: [] })
      return []
    }
    set({ isLoadingProvinces: true })
    try {
      const provinces = await fetchProvincesWithFieldsByDepartment(departmentName)
      set({ provincesWithFields: provinces, isLoadingProvinces: false })
      return provinces
    } catch (error) {
      console.error('Error cargando provincias con canchas:', error)
      set({ isLoadingProvinces: false })
      return []
    }
  },

  /**
   * Cargar distritos que tienen canchas registradas desde la API
   * @param {string} provinceName - Nombre de la provincia
   * @returns {Promise<Array>} Array de distritos con canchas
   */
  loadDistrictsWithFields: async (provinceName) => {
    if (!provinceName) {
      set({ districtsWithFields: [] })
      return []
    }
    set({ isLoadingDistricts: true })
    try {
      const districts = await fetchDistrictsWithFieldsByProvince(provinceName)
      set({ districtsWithFields: districts, isLoadingDistricts: false })
      return districts
    } catch (error) {
      console.error('Error cargando distritos con canchas:', error)
      set({ isLoadingDistricts: false })
      return []
    }
  },

  /**
   * Obtiene departamentos con canchas (desde estado local)
   * @returns {Array} Array de departamentos con { id, name }
   */
  getDepartments: () => {
    const { departmentsWithFields } = get()
    return departmentsWithFields.map((dept) => ({
      id: dept.name,
      name: dept.name,
      fieldsCount: parseInt(dept.fields_count) || 0,
    }))
  },

  /**
   * Obtiene provincias con canchas del departamento seleccionado (desde estado local)
   * @returns {Array} Array de provincias con { id, name }
   */
  getProvinces: () => {
    const { provincesWithFields } = get()
    return provincesWithFields.map((prov) => ({
      id: prov.name,
      name: prov.name,
      fieldsCount: parseInt(prov.fields_count) || 0,
    }))
  },

  /**
   * Obtiene distritos con canchas de la provincia seleccionada (desde estado local)
   * @returns {Array} Array de distritos con { id, name }
   */
  getDistricts: () => {
    const { districtsWithFields } = get()
    return districtsWithFields.map((dist) => ({
      id: dist.name,
      name: dist.name,
      fieldsCount: parseInt(dist.fields_count) || 0,
    }))
  },

  /**
   * Establece el departamento seleccionado y resetea provincia/distrito
   * @param {string} departmentId - ID del departamento
   */
  setSelectedDepartment: (departmentId) => {
    set({
      selectedDepartment: departmentId,
      selectedProvince: '',
      selectedDistrict: '',
    })
  },

  /**
   * Establece la provincia seleccionada y resetea distrito
   * @param {string} provinceId - ID de la provincia
   */
  setSelectedProvince: (provinceId) => {
    set({
      selectedProvince: provinceId,
      selectedDistrict: '',
    })
  },

  /**
   * Establece el distrito seleccionado
   * @param {string} districtId - ID del distrito
   */
  setSelectedDistrict: (districtId) => {
    set({ selectedDistrict: districtId })
  },

  /**
   * Resetea toda la selección geográfica
   */
  resetSelection: () => {
    set({
      selectedDepartment: '',
      selectedProvince: '',
      selectedDistrict: '',
    })
  },
}))

export default useGeographyStore
