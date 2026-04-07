import React from 'react'
import { Map, MapPin } from 'lucide-react'

const ModalLocation = ({ field }) => {
  const handleGetDirections = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude
          const userLon = position.coords.longitude
          const fieldLat = field.coordinates[0]
          const fieldLon = field.coordinates[1]

          window.open(
            `https://www.google.com/maps/dir/${userLat},${userLon}/${fieldLat},${fieldLon}`,
            '_blank'
          )
        },
        () => {
          window.open(
            `https://www.google.com/maps/dir//${field.coordinates[0]},${field.coordinates[1]}`,
            '_blank'
          )
        }
      )
    } else {
      window.open(
        `https://www.google.com/maps/dir//${field.coordinates[0]},${field.coordinates[1]}`,
        '_blank'
      )
    }
  }

  return (
    <div className="mb-6">
      <h4 className="font-bold text-secondary-900 mb-3 flex items-center">
        <Map className="w-5 h-5 mr-2 text-primary-600" />
        Ubicación en el mapa
      </h4>

      {/* Coordenadas */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="font-medium text-blue-900">Coordenadas:</span>
          <span className="text-blue-700 font-mono">
            {field.coordinates[0]}, {field.coordinates[1]}
          </span>
        </div>
        <div className="mt-2 text-sm text-blue-600">
          Latitud: {field.coordinates[0]} | Longitud: {field.coordinates[1]}
        </div>
      </div>

      {/* Mapa embebido */}
      <div className="rounded-lg overflow-hidden border-2 border-gray-200">
        <iframe
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${field.coordinates[1] - 0.005},${field.coordinates[0] - 0.005},${field.coordinates[1] + 0.005},${field.coordinates[0] + 0.005}&layer=mapnik&marker=${field.coordinates[0]},${field.coordinates[1]}`}
          width="100%"
          height="300"
          frameBorder="0"
          scrolling="no"
          className="w-full"
          title={`Mapa de ${field.name}`}
        ></iframe>
      </div>

      {/* Enlaces para abrir en mapas externos */}
      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={`https://www.google.com/maps?q=${field.coordinates[0]},${field.coordinates[1]}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
        >
          <MapPin className="w-4 h-4 mr-1" />
          Abrir en Google Maps
        </a>

        <a
          href={`https://www.openstreetmap.org/?mlat=${field.coordinates[0]}&mlon=${field.coordinates[1]}&zoom=16`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Map className="w-4 h-4 mr-1" />
          Abrir en OpenStreetMap
        </a>

        <button
          onClick={handleGetDirections}
          className="inline-flex items-center px-3 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
        >
          <MapPin className="w-4 h-4 mr-1" />
          Cómo llegar
        </button>
      </div>
    </div>
  )
}

export default ModalLocation
