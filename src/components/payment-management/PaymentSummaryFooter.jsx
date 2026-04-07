import React from 'react'

/**
 * Componente de resumen de totales al final de la tabla
 */
const PaymentSummaryFooter = ({ filteredReservations, calculateAmounts, activeTab }) => {
  if (filteredReservations.length === 0) {
    return null
  }

  const isCompletedTab = activeTab === 'completed'
  const isAllTab = activeTab === 'all'

  // Calcular el total según el tab activo
  const totals = filteredReservations.reduce(
    (acc, res) => {
      const paymentStatus = res.paymentStatus || res.payment_status
      const amounts = calculateAmounts(res)

      if (isAllTab) {
        // En tab Todos: sumar todo
        acc.total += amounts.total
        acc.advance += amounts.advance
        acc.pending += amounts.pending
      } else if (isCompletedTab) {
        // En tab Completado: sumar lo cobrado (reservas pagadas)
        if (paymentStatus === 'fully_paid' || paymentStatus === 'paid') {
          acc.total += amounts.total
        }
      } else {
        // En otros tabs (pending, overdue): sumar lo pendiente por cobrar
        if (
          paymentStatus !== 'fully_paid' &&
          paymentStatus !== 'paid' &&
          paymentStatus !== 'no_show'
        ) {
          acc.total += amounts.total
          acc.advance += amounts.advance
          acc.pending += amounts.pending
        }
      }
      return acc
    },
    { total: 0, advance: 0, pending: 0 }
  )

  const totalAmount = isCompletedTab ? totals.total : totals.pending

  // Determinar colores y textos según el tab
  const getStyles = () => {
    if (isAllTab) {
      return {
        gradient: 'from-secondary-600 to-secondary-700',
        textColor: 'text-secondary-100',
        title: 'Resumen General',
        label: 'Total general',
      }
    } else if (isCompletedTab) {
      return {
        gradient: 'from-green-600 to-green-700',
        textColor: 'text-green-100',
        title: 'Resumen de Cobros',
        label: 'Total cobrado',
      }
    } else {
      return {
        gradient: 'from-primary-600 to-primary-700',
        textColor: 'text-primary-100',
        title: 'Resumen de Pagos',
        label: 'Total por cobrar',
      }
    }
  }

  const styles = getStyles()

  return (
    <div className={`bg-gradient-to-r ${styles.gradient} text-white rounded-xl p-6`}>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold mb-2">{styles.title}</h3>
          <p className={styles.textColor}>Mostrando {filteredReservations.length} reserva(s)</p>
        </div>
        <div className="text-right">
          {/* Mostrar desglose en tabs pendientes */}
          {!isCompletedTab && totals.advance > 0 && (
            <div className="text-sm mb-2 opacity-90">
              <p>
                Total reservas: S/{' '}
                {totals.total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-green-200">
                Adelantos recibidos: S/{' '}
                {totals.advance.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}
          <p className="text-2xl font-bold">
            S/{' '}
            {totalAmount.toLocaleString('es-PE', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className={styles.textColor}>{styles.label}</p>
        </div>
      </div>
    </div>
  )
}

export default PaymentSummaryFooter
