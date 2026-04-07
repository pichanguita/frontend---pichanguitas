import React, { Component } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

/**
 * SportsErrorBoundary - Error Boundary específico para la sección de deportes
 * Captura errores y muestra una UI de fallback específica
 */
class SportsErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error) {
    // Actualizar el estado para que el siguiente render muestre la UI de fallback
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Puedes registrar el error en un servicio de reporte de errores
    console.error('Error en SportsSection:', error, errorInfo)

    this.setState({
      error,
      errorInfo,
    })

    // Llamar al callback opcional si existe
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })

    // Llamar al callback de reset si existe
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // UI de fallback personalizada
      return (
        <div className="p-6 bg-red-50 border-2 border-red-200 rounded-xl">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-900 mb-2">
                Error al cargar deportes disponibles
              </h3>

              <p className="text-sm text-red-700 mb-4 leading-relaxed">
                No se pudieron cargar las opciones de deportes correctamente. Esto puede deberse a
                un error temporal.
              </p>

              {/* Detalles del error en desarrollo */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-4">
                  <summary className="text-xs font-mono text-red-600 cursor-pointer hover:text-red-800 mb-2">
                    Detalles técnicos (solo en desarrollo)
                  </summary>
                  <div className="p-3 bg-red-100 rounded-lg overflow-x-auto">
                    <p className="text-xs font-mono text-red-900 mb-2">
                      <strong>Error:</strong> {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <pre className="text-xs font-mono text-red-800 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              {/* Botones de acción */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  Intentar de nuevo
                </button>

                <button
                  onClick={this.handleReload}
                  className="px-4 py-2 bg-white border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm"
                >
                  Recargar página
                </button>

                {this.props.onContactSupport && (
                  <button
                    onClick={this.props.onContactSupport}
                    className="px-4 py-2 bg-white border-2 border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50 transition-colors font-medium text-sm"
                  >
                    Contactar soporte
                  </button>
                )}
              </div>

              {/* Mensaje de ayuda */}
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-800">
                  💡 <strong>Consejo:</strong> Si el problema persiste, intenta limpiar la caché del
                  navegador o contacta al soporte técnico.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Si no hay error, renderizar los children normalmente
    return this.props.children
  }
}

export default SportsErrorBoundary
