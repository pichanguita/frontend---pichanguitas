import React from 'react'
import Swal from 'sweetalert2'
import NewFieldModal from '../NewFieldModal'
import EditFieldModal from '../EditFieldModal'
import FieldConfigModal from '../FieldConfigModal'
import FieldDetailsModal from '../FieldDetailsModal'
import NewAdminModal from '../NewAdminModal'
import EditUserModal from '../EditUserModal'
import ClientRegistrationModal from '../ClientRegistrationModal'
import DayReservationsModal from '../DayReservationsModal'

const ModalsContainer = ({
  modals,
  selectedField,
  selectedUser,
  selectedDate,
  selectedDayReservations,
  fields,
  handlers,
  closers,
}) => {
  const {
    handleNewField,
    handleUpdateField,
    handleUpdateFieldConfig,
    createAdmin,
    updateUser,
    createReservationWithAPI,
  } = handlers

  const {
    closeNewFieldModal,
    closeEditFieldModal,
    closeConfigFieldModal,
    closeDetailsModal,
    closeNewAdminModal,
    closeEditUserModal,
    closeClientRegistrationModal,
    closeDayReservationsModal,
    closeBookingModal,
  } = closers

  return (
    <>
      {/* New Field Modal */}
      <NewFieldModal
        isOpen={modals.newField}
        onClose={closeNewFieldModal}
        onSave={handleNewField}
      />

      {/* Edit Field Modal */}
      <EditFieldModal
        isOpen={modals.editField}
        onClose={closeEditFieldModal}
        field={selectedField}
        onSave={handleUpdateField}
      />

      {/* Field Config Modal */}
      <FieldConfigModal
        isOpen={modals.configField}
        onClose={closeConfigFieldModal}
        field={selectedField}
        onSave={handleUpdateFieldConfig}
      />

      {/* Field Details Modal */}
      <FieldDetailsModal
        isOpen={modals.details}
        onClose={closeDetailsModal}
        field={selectedField}
      />

      {/* New Admin Modal */}
      <NewAdminModal isOpen={modals.newAdmin} onClose={closeNewAdminModal} onSave={createAdmin} />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={modals.editUser}
        onClose={closeEditUserModal}
        user={selectedUser}
        onSave={updateUser}
      />

      {/* Client Registration Modal (from calendar) */}
      <ClientRegistrationModal
        isOpen={modals.clientRegistration}
        onClose={closeClientRegistrationModal}
        onSave={(clientData) => {
          const clientDataWithDate = {
            ...clientData,
            date: selectedDate?.toISOString().split('T')[0],
          }
          closeClientRegistrationModal()
        }}
        selectedDate={selectedDate}
      />

      {/* Day Reservations Modal */}
      <DayReservationsModal
        isOpen={modals.dayReservations}
        onClose={closeDayReservationsModal}
        date={selectedDate}
        fields={fields}
      />

      {/* Booking Modal (New Reservation) */}
      <ClientRegistrationModal
        isOpen={modals.booking}
        onClose={closeBookingModal}
        onSave={async (clientRegistration) => {
          try {
            // ✅ Mapear paymentStatus del frontend al formato del backend
            const mapPaymentStatus = (frontendStatus) => {
              const statusMap = {
                pending: 'pending',
                paid: 'paid',
                advance: 'partial', // 🔧 Mapear 'advance' a 'partial' para el backend
              }
              return statusMap[frontendStatus] || frontendStatus
            }

            // ✅ Construir datos en formato snake_case para el backend
            const reservationDataForBackend = {
              field_id: parseInt(clientRegistration.fieldId),
              customer_id: clientRegistration.customerId,
              date: clientRegistration.date,
              start_time: clientRegistration.startTime,
              end_time: clientRegistration.endTime,
              hours: clientRegistration.duration,
              subtotal: clientRegistration.originalAmount || clientRegistration.totalAmount, // Precio original sin descuento
              discount: clientRegistration.discountAmount || 0, // Descuento aplicado (specialPricing)
              total_price: clientRegistration.totalAmount, // Precio final con descuento
              advance_payment: clientRegistration.advanceAmount || 0,
              remaining_payment: clientRegistration.remainingAmount || 0,
              payment_method: clientRegistration.paymentMethod || null,
              payment_status: mapPaymentStatus(clientRegistration.paymentStatus),
              phone_number: clientRegistration.phone,
              type: 'admin_booking', // ✅ Indica que es reserva creada por admin/super_admin
            }

            // ✅ Crear reserva usando la API (guarda en backend)
            await createReservationWithAPI(reservationDataForBackend)

            await Swal.fire({
              icon: 'success',
              title: '¡Reserva Creada!',
              text: `La reserva para ${clientRegistration.name} ha sido creada exitosamente`,
              timer: 2000,
              showConfirmButton: false,
            })
          } catch (error) {
            console.error('❌ Error al crear reserva:', error)
            await Swal.fire({
              icon: 'error',
              title: 'Error',
              text: error.message || 'No se pudo crear la reserva. Intenta nuevamente.',
              confirmButtonColor: '#22c55e',
            })
          }
        }}
        selectedDate={selectedDate}
      />
    </>
  )
}

export default ModalsContainer
