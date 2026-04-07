import { useState } from 'react'

export const useFieldsShowcase = () => {
  const [selectedField, setSelectedField] = useState(null)

  const handleFieldClick = (field) => {
    setSelectedField(field)
  }

  const closeModal = () => {
    setSelectedField(null)
  }

  return {
    selectedField,
    handleFieldClick,
    closeModal,
  }
}
