import React from 'react'
import { Clock, Wrench, DollarSign, Ban, Settings } from 'lucide-react'
import useBookingStore from '../store/bookingStore'
import useFieldConfig from '../hooks/useFieldConfig'
import {
  daysOfWeek,
  fieldTypes,
  getFieldTypeInfo,
} from '../utils/field-config/fieldConfigConstants'
import ConfigModal from './field-config/ConfigModal'
import TabNavigation from './field-config/TabNavigation'
import ScheduleTab from './field-config/tabs/ScheduleTab'
import MaintenanceTab from './field-config/tabs/MaintenanceTab'
import PricingTab from './field-config/tabs/PricingTab'
import CancellationTab from './field-config/tabs/CancellationTab'
import GeneralTab from './field-config/tabs/GeneralTab'

const FieldConfigModal = ({ isOpen, onClose, onSave, field }) => {
  const { timeRanges } = useBookingStore()

  const {
    config,
    activeTab,
    setActiveTab,
    isLoading,
    handleScheduleChange,
    handleAddMaintenance,
    handleUpdateMaintenance,
    handleRemoveMaintenance,
    handleAddSpecialPrice,
    handleUpdateSpecialPrice,
    handleRemoveSpecialPrice,
    handleToggleAmenity,
    handleAddRule,
    handleRemoveRule,
    handleAddCustomImage,
    handleUploadCustomImage,
    handleRemoveCustomImage,
    handleCancellationChange,
    handleGeneralChange,
    handleFieldTypeChange,
    handleSave,
  } = useFieldConfig(field, isOpen, onClose, onSave)

  if (!isOpen || !field) return null

  const tabs = [
    { id: 'schedule', label: 'Horarios', icon: Clock },
    { id: 'maintenance', label: 'Mantenimiento', icon: Wrench },
    { id: 'pricing', label: 'Precios Especiales', icon: DollarSign },
    { id: 'cancellation', label: 'Cancelaciones', icon: Ban },
    { id: 'general', label: 'General', icon: Settings },
  ]

  return (
    <ConfigModal
      isOpen={isOpen}
      onClose={onClose}
      title="Configuración Avanzada"
      subtitle={`Configure todos los aspectos de ${field.name}`}
      onSave={handleSave}
      isLoading={isLoading}
      tabs={<TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />}
    >
      <div className="overflow-x-hidden">
        {activeTab === 'schedule' && (
          <ScheduleTab
            schedule={config.schedule}
            onScheduleChange={handleScheduleChange}
            daysOfWeek={daysOfWeek}
          />
        )}

        {activeTab === 'maintenance' && (
          <MaintenanceTab
            maintenanceSchedule={config.maintenanceSchedule}
            onAdd={handleAddMaintenance}
            onUpdate={handleUpdateMaintenance}
            onRemove={handleRemoveMaintenance}
          />
        )}

        {activeTab === 'pricing' && (
          <PricingTab
            specialPricing={config.specialPricing}
            timeRanges={timeRanges}
            daysOfWeek={daysOfWeek}
            onAdd={handleAddSpecialPrice}
            onUpdate={handleUpdateSpecialPrice}
            onRemove={handleRemoveSpecialPrice}
          />
        )}

        {activeTab === 'cancellation' && (
          <CancellationTab
            cancellationPolicy={config.cancellationPolicy}
            onChange={handleCancellationChange}
          />
        )}

        {activeTab === 'general' && (
          <GeneralTab
            config={config}
            fieldTypes={fieldTypes}
            getFieldTypeInfo={getFieldTypeInfo}
            onGeneralChange={handleGeneralChange}
            onFieldTypeChange={handleFieldTypeChange}
            onToggleAmenity={handleToggleAmenity}
            onAddRule={handleAddRule}
            onRemoveRule={handleRemoveRule}
            onAddCustomImage={handleAddCustomImage}
            onUploadCustomImage={handleUploadCustomImage}
            onRemoveCustomImage={handleRemoveCustomImage}
          />
        )}
      </div>
    </ConfigModal>
  )
}

export default FieldConfigModal
