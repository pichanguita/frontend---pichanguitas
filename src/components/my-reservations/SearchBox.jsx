import React from 'react'
import { Phone, Search } from 'lucide-react'

const SearchBox = ({ phoneNumber, onPhoneChange, onSearch }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <label className="block text-sm font-medium text-secondary-700 mb-2">
        Ingresa tu número de teléfono
      </label>
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => onPhoneChange(e.target.value.replace(/\D/g, '').slice(0, 9))}
            placeholder="999888777"
            className="w-full pl-10 pr-4 py-3 border-2 border-secondary-200 rounded-lg focus:border-primary-500 focus:outline-none text-lg"
            maxLength="9"
            onKeyPress={(e) => e.key === 'Enter' && onSearch()}
          />
        </div>
        <button
          onClick={onSearch}
          className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <Search className="w-5 h-5" />
          <span>Buscar</span>
        </button>
      </div>
    </div>
  )
}

export default SearchBox
