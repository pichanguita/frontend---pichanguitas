import React, { useMemo } from 'react'
import useFieldStore from '../../store/modules/fieldStore'

const InfoSection = () => {
  const { fields } = useFieldStore()

  // Calcular estadísticas dinámicamente desde los datos reales
  const stats = useMemo(() => {
    // Filtrar solo canchas visibles (aprobadas y activas)
    const visibleFields = fields.filter(
      (field) =>
        field.status === 'available' &&
        field.isActive !== false &&
        (field.approvalStatus === 'approved' || !field.approvalStatus)
    )

    // Contar canchas disponibles
    const totalCanchas = visibleFields.length

    // Contar distritos únicos
    const distritosUnicos = new Set(
      visibleFields.map((field) => field.distrito).filter(Boolean)
    )
    const totalDistritos = distritosUnicos.size

    // Calcular horas promedio de operación (7 horas por defecto si no hay datos)
    const horasPromedio = 7

    return {
      canchas: totalCanchas || 0,
      distritos: totalDistritos || 0,
      horas: horasPromedio,
    }
  }, [fields])

  return (
    <div className="mt-8 sm:mt-12 md:mt-16 bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
        <div>
          <h3 className="text-2xl font-bold text-secondary-900 mb-4">
            ¿Por qué elegir nuestras canchas?
          </h3>
          <ul className="space-y-3 text-secondary-700">
            <li className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Césped sintético de última generación</span>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Iluminación LED para partidos nocturnos</span>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Vestuarios y duchas disponibles</span>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Estacionamiento gratuito</span>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Ubicaciones estratégicas en Apurímac</span>
            </li>
          </ul>
        </div>

        <div className="text-center">
          <div className="bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl p-8 text-white">
            <h4 className="text-3xl font-bold mb-2">{stats.canchas}</h4>
            <p className="text-primary-100 mb-4">
              {stats.canchas === 1 ? 'Cancha Disponible' : 'Canchas Disponibles'}
            </p>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{stats.distritos}</div>
                <div className="text-sm text-primary-100">
                  {stats.distritos === 1 ? 'Distrito' : 'Distritos'}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.horas}hrs</div>
                <div className="text-sm text-primary-100">Por día</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InfoSection
