import React, { useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { FIELD_STATUS, FIELD_APPROVAL_STATUS, FIELD_APPROVAL_STATUS_LABELS } from '@/constants'
import {
  createCustomIcon,
  createDistrictIcon,
  districtCenters,
  formatCurrency,
  getFieldMarkerColor,
} from '@/utils/superadmin/dashboardHelpers'
import DistrictStatsPanel from '../stats/DistrictStatsPanel'
import MapLegend from '../stats/MapLegend'
import useFieldStore from '@/store/modules/fieldStore'
import { AlertTriangle } from 'lucide-react'

const MapView = ({
  filteredFields,
  selectedDistrict,
  mapCenter,
  mapZoom,
  districtStats,
  onDistrictClick,
}) => {
  const { getSportTypeById } = useFieldStore()

  // Helper para obtener nombres de deportes
  const getSportNames = (sportTypes) => {
    if (!sportTypes || sportTypes.length === 0) return 'No especificado'
    return sportTypes
      .map((sportId) => {
        const sportType = getSportTypeById(sportId)
        return sportType?.name || sportId
      })
      .join(', ')
  }

  // Contar canchas sin coordenadas para mostrar advertencia
  const fieldsWithoutCoordinates = useMemo(
    () => filteredFields.filter((f) => !f.coordinates),
    [filteredFields]
  )

  // Obtener label de aprobación para el popup
  const getApprovalLabel = (approvalStatus) => {
    return FIELD_APPROVAL_STATUS_LABELS[approvalStatus] || approvalStatus
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      <div className="lg:col-span-2 bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
          Distribución de Canchas {selectedDistrict !== 'all' && `- ${selectedDistrict}`}
        </h2>

        {fieldsWithoutCoordinates.length > 0 && (
          <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>
              {fieldsWithoutCoordinates.length} cancha{fieldsWithoutCoordinates.length !== 1 ? 's' : ''} sin
              coordenadas (no visible{fieldsWithoutCoordinates.length !== 1 ? 's' : ''} en el mapa):{' '}
              {fieldsWithoutCoordinates.map((f) => f.name).join(', ')}
            </span>
          </div>
        )}

        <div className="h-[400px] sm:h-[500px] md:h-[600px] rounded-lg overflow-hidden border border-gray-200">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
            key={`${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            {filteredFields.map((field) => {
              if (!field.coordinates) return null

              const color = getFieldMarkerColor(field)

              return (
                <Marker
                  key={field.id}
                  position={field.coordinates}
                  icon={createCustomIcon(color, field.status)}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-bold text-gray-900">{field.name}</h3>
                      <p className="text-sm text-gray-600">{field.address}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full ${
                            field.status === FIELD_STATUS.AVAILABLE
                              ? 'bg-green-100 text-green-800'
                              : field.status === FIELD_STATUS.MAINTENANCE
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {field.status === FIELD_STATUS.AVAILABLE
                            ? 'Disponible'
                            : field.status === FIELD_STATUS.MAINTENANCE
                              ? 'Mantenimiento'
                              : field.status}
                        </span>
                        {field.approvalStatus && field.approvalStatus !== FIELD_APPROVAL_STATUS.APPROVED && (
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded-full ${
                              field.approvalStatus === FIELD_APPROVAL_STATUS.PENDING
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {getApprovalLabel(field.approvalStatus)}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-sm">
                        <p>
                          <strong>Precio:</strong> S/{formatCurrency(field.pricePerHour)}/hora
                        </p>
                        <p>
                          <strong>Deportes:</strong> {getSportNames(field.sportTypes)}
                        </p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )
            })}

            {selectedDistrict === 'all' &&
              districtStats.map((stat) => {
                const center = districtCenters[stat.name]
                if (!center) return null

                return (
                  <Marker
                    key={stat.name}
                    position={center}
                    icon={createDistrictIcon(stat.name, stat.totalFields)}
                  />
                )
              })}
          </MapContainer>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <DistrictStatsPanel
          districtStats={districtStats}
          selectedDistrict={selectedDistrict}
          onDistrictClick={onDistrictClick}
        />
        <MapLegend />
      </div>
    </div>
  )
}

export default MapView
