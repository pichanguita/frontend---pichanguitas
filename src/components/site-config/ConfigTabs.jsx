import React from 'react'
import { motion } from 'framer-motion'
import { Video, Image as ImageIcon, MessageCircle, Phone } from 'lucide-react'

const ConfigTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'videos', label: 'Videos Tutoriales', Icon: Video },
    { id: 'images', label: 'Imágenes', Icon: ImageIcon },
    { id: 'social', label: 'Redes Sociales', Icon: MessageCircle },
    { id: 'contact', label: 'Contacto', Icon: Phone },
  ]

  return (
    <div className="flex space-x-4 mb-6 border-b border-secondary-200">
      {tabs.map(({ id, label, Icon }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={`pb-3 px-4 font-medium transition-colors relative ${
            activeTab === id ? 'text-primary-600' : 'text-secondary-600 hover:text-secondary-900'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </div>
          {activeTab === id && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
            />
          )}
        </button>
      ))}
    </div>
  )
}

export default ConfigTabs
