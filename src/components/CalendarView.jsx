import React from 'react'
import { USER_ROLES, ADMIN_TYPES } from '@/constants'
import useAuthStore from '../store/authStore'
import { useCalendar } from '../hooks/useCalendar'
import MonthStats from './calendar/MonthStats'
import CalendarHeader from './calendar/CalendarHeader'
import MonthView from './calendar/MonthView'
import WeekView from './calendar/WeekView'
import DayView from './calendar/DayView'
import CalendarLegend from './calendar/CalendarLegend'
import { VIEW_MODES } from '../utils/calendar/constants'

const CalendarView = ({ onDateClick, fieldFilter = 'all', filteredFieldIds = null }) => {
  const { user } = useAuthStore()
  const {
    currentDate,
    selectedDate,
    viewMode,
    monthStats,
    monthData,
    weekData,
    fields,
    setViewMode,
    navigateMonth,
    goToToday,
    handleDateClick: calendarHandleDateClick,
  } = useCalendar(fieldFilter, filteredFieldIds)

  // Helper functions for field information
  const getFieldName = (fieldId) => {
    const field = fields.find((f) => f.id === fieldId)
    return field ? field.name : 'Campo no encontrado'
  }

  const getFieldLocation = (fieldId) => {
    const field = fields.find((f) => f.id === fieldId)
    return field ? field.location : 'Ubicación no disponible'
  }

  // Handle date click with optional parent callback
  const handleDateClick = (dayData) => {
    if (onDateClick) {
      onDateClick(dayData)
    } else {
      calendarHandleDateClick(dayData)
    }
  }

  // Check if should show stats (super-admin and general admin only)
  const showStats =
    user?.role === USER_ROLES.SUPER_ADMIN ||
    (user?.role === USER_ROLES.ADMIN && user?.adminType === ADMIN_TYPES.GENERAL)

  return (
    <div className="space-y-6">
      {/* Month Statistics - Only for Super-admin and General Admin */}
      {showStats && (
        <MonthStats monthStats={monthStats} currentDate={currentDate} fields={fields} />
      )}

      {/* Calendar Header with Navigation and View Mode */}
      <CalendarHeader
        currentDate={currentDate}
        viewMode={viewMode}
        weekData={weekData}
        navigateMonth={navigateMonth}
        goToToday={goToToday}
        setViewMode={setViewMode}
      />

      {/* Calendar Content */}
      <div className="bg-white rounded-xl shadow-custom overflow-hidden">
        {viewMode === VIEW_MODES.MONTH && (
          <MonthView monthData={monthData} handleDateClick={handleDateClick} />
        )}

        {viewMode === VIEW_MODES.WEEK && (
          <WeekView
            weekData={weekData}
            handleDateClick={handleDateClick}
            getFieldName={getFieldName}
          />
        )}

        {viewMode === VIEW_MODES.DAY && (
          <DayView
            selectedDate={selectedDate}
            getFieldName={getFieldName}
            getFieldLocation={getFieldLocation}
            setViewMode={setViewMode}
          />
        )}
      </div>

      {/* Calendar Legend */}
      <CalendarLegend />
    </div>
  )
}

export default CalendarView
