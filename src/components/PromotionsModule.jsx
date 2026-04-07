import React from 'react'
import { AnimatePresence } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import { usePromotions } from '../hooks/usePromotions'
import PromotionsHeader from './promotions/PromotionsHeader'
import PromotionsStats from './promotions/PromotionsStats'
import ClientsTable from './promotions/ClientsTable'
import RulesList from './promotions/RulesList'
import RuleFormModal from './promotions/RuleFormModal'

const PromotionsModule = () => {
  const {
    promotionRules,
    clientStats,
    activeTab,
    showNewRuleModal,
    editingRule,
    appliesTo,
    selectedFields,
    selectedSports,
    userFields,
    isSuperAdmin,
    fieldsWithRules,
    ruleConflicts,
    setActiveTab,
    setShowNewRuleModal,
    setAppliesTo,
    setSelectedFields,
    setSelectedSports,
    handleSaveRule,
    handleDeleteRule,
    toggleRuleStatus,
    handleEditRule,
    handleCloseModal,
    handleOpenNewRuleModal,
  } = usePromotions()

  return (
    <div className="space-y-6">
      {/* Header */}
      <PromotionsHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewRule={handleOpenNewRuleModal}
      />

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <PromotionsStats clientStats={clientStats} promotionRules={promotionRules} />
        )}

        {activeTab === 'clients' && <ClientsTable clientStats={clientStats} />}

        {activeTab === 'rules' && (
          <RulesList
            promotionRules={promotionRules}
            onToggleStatus={toggleRuleStatus}
            onEditRule={handleEditRule}
            onDeleteRule={handleDeleteRule}
            onCreateNewRule={handleOpenNewRuleModal}
          />
        )}
      </AnimatePresence>

      {/* Modal para nueva/editar regla */}
      <RuleFormModal
        isOpen={showNewRuleModal}
        editingRule={editingRule}
        appliesTo={appliesTo}
        selectedFields={selectedFields}
        selectedSports={selectedSports}
        userFields={userFields}
        isSuperAdmin={isSuperAdmin}
        fieldsWithRules={fieldsWithRules}
        ruleConflicts={ruleConflicts}
        onClose={handleCloseModal}
        onSave={handleSaveRule}
        onAppliesToChange={setAppliesTo}
        onFieldsChange={setSelectedFields}
        onSportsChange={setSelectedSports}
      />

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Cómo funcionan las promociones</h4>
            <p className="text-sm text-blue-700">
              Las promociones se calculan automáticamente basándose en el historial de reservas de
              cada cliente. Cuando un cliente acumula las horas requeridas según las reglas activas,
              obtiene horas gratis que puede canjear en futuras reservas.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PromotionsModule
