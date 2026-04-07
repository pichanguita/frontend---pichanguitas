import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DollarSign, Calendar, CreditCard } from 'lucide-react'
import { FieldIncomeView } from './payments'
import MonthlyPaymentsView from './dashboard/views/MonthlyPaymentsView'
import PaymentManagementModule from '../PaymentManagementModule'

/**
 * Constantes para los subtabs de pagos
 */
const PAYMENT_TABS = {
  INCOME: 'income',
  RESERVATIONS: 'reservations',
  MONTHLY: 'monthly',
}

/**
 * Configuración de los subtabs
 */
const TAB_CONFIG = [
  {
    id: PAYMENT_TABS.INCOME,
    label: 'Ingresos',
    fullLabel: 'Ingresos por Cancha',
    icon: DollarSign,
    description: 'Ver ingresos generados por cada cancha',
  },
  {
    id: PAYMENT_TABS.RESERVATIONS,
    label: 'Reservas',
    fullLabel: 'Completar Reservas',
    icon: CreditCard,
    description: 'Registrar pagos y completar reservas',
  },
  {
    id: PAYMENT_TABS.MONTHLY,
    label: 'Mensualidades',
    fullLabel: 'Mensualidades',
    icon: Calendar,
    description: 'Gestionar cobros mensuales a administradores',
  },
]

/**
 * Vista de Pagos para SuperAdmin
 * Contenedor con subtabs para gestionar:
 * - Ingresos por cancha
 * - Completar reservas y registrar pagos
 * - Mensualidades de administradores
 */
const SuperAdminPaymentsView = () => {
  const [activeTab, setActiveTab] = useState(PAYMENT_TABS.INCOME)

  // Obtener la configuración del tab activo
  const activeTabConfig = TAB_CONFIG.find((tab) => tab.id === activeTab)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-secondary-900">Gestión de Pagos</h2>
        <p className="text-secondary-600 mt-1">Administra ingresos, reservas y mensualidades</p>
      </div>

      {/* SubTabs Navigation */}
      <div className="bg-white rounded-xl shadow-custom p-1.5">
        <div className="flex flex-col sm:flex-row gap-1.5">
          {TAB_CONFIG.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative flex-1 flex items-center justify-center gap-2
                  px-4 py-3 rounded-lg font-medium transition-all duration-200
                  ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                  }
                `}
                title={tab.description}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-secondary-500'}`} />
                <span className="hidden sm:inline">{tab.fullLabel}</span>
                <span className="sm:hidden">{tab.label}</span>

                {/* Indicador activo */}
                {isActive && (
                  <motion.div
                    layoutId="activePaymentTab"
                    className="absolute inset-0 bg-primary-600 rounded-lg -z-10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Descripción del tab activo (solo en mobile) */}
      <div className="sm:hidden bg-primary-50 rounded-lg p-3">
        <p className="text-sm text-primary-700">{activeTabConfig?.description}</p>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === PAYMENT_TABS.INCOME && <FieldIncomeView />}
          {activeTab === PAYMENT_TABS.RESERVATIONS && <PaymentManagementModule />}
          {activeTab === PAYMENT_TABS.MONTHLY && <MonthlyPaymentsView />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default SuperAdminPaymentsView
