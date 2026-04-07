import React from 'react'
import { DAY_NAMES } from '../../../utils/fields-showcase/constants'

const ModalSchedule = ({ schedule }) => {
  return (
    <div className="mb-6">
      <h4 className="font-bold text-secondary-900 mb-3">Horarios de atención:</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {Object.entries(schedule).map(([day, daySchedule]) => (
          <div key={day} className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span className="font-medium">{DAY_NAMES[day]}:</span>
            <span className={daySchedule.isOpen ? 'text-green-600' : 'text-red-600'}>
              {daySchedule.isOpen
                ? `${daySchedule.openTime} - ${daySchedule.closeTime}`
                : 'Cerrado'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ModalSchedule
