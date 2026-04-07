import React from 'react'

const TabNavigation = ({ activeTab, setActiveTab, tabs }) => {
  return (
    <div className="flex flex-wrap border-b border-secondary-200">
      {tabs.map((tab) => {
        const Icon = tab.icon
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-3 font-medium transition-colors duration-200 whitespace-nowrap text-sm ${
              activeTab === tab.id
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-secondary-600 hover:text-primary-600 hover:bg-secondary-50'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default TabNavigation
