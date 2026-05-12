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

/**
 * Componente que agrupa todos los modales del AdminPanel
 * Extrae la lógica de renderizado de modales para mantener AdminPanel limpio
 */
const AdminModals = ({
  // Estados de apertura/cierre
  modals,
  closeModal,

  // Entidades seleccionadas
  selectedField,
  setSelectedField,
  selectedUser,
  setSelectedUser,
  selectedDate,
  setSelectedDate,
  selectedDayReservations,
  setSelectedDayReservations,

  // Handlers de guardado
  handleNewField,
  handleUpdateField,
  handleUpdateFieldConfig,
  createAdmin,
  updateUser,
  createReservationWithAPI,

  // Datos auxiliares
  fields,
}) => {
  return (
    <>
      {/* Modal: Nueva Cancha */}
      <NewFieldModal
        isOpen={modals.newField}
        onClose={() => closeModal('newField')}
        onSave={handleNewField}
      />

      {/* Modal: Editar Cancha */}
      <EditFieldModal
        isOpen={modals.editField}
        onClose={() => {
          closeModal('editField')
          setSelectedField(null)
        }}
        field={selectedField}
        onSave={handleUpdateField}
      />

      {/* Modal: Configurar Cancha */}
      <FieldConfigModal
        isOpen={modals.configField}
        onClose={() => {
          closeModal('configField')
          setSelectedField(null)
        }}
        field={selectedField}
        onSave={handleUpdateFieldConfig}
      />

      {/* Modal: Detalles de Cancha */}
      <FieldDetailsModal
        isOpen={modals.details}
        onClose={() => {
          closeModal('details')
          setSelectedField(null)
        }}
        field={selectedField}
      />

      {/* Modal: Nuevo Administrador */}
      <NewAdminModal
        isOpen={modals.newAdmin}
        onClose={() => closeModal('newAdmin')}
        onSave={createAdmin}
      />

      {/* Modal: Editar Usuario */}
      <EditUserModal
        isOpen={modals.editUser}
        onClose={() => {
          closeModal('editUser')
          setSelectedUser(null)
        }}
        user={selectedUser}
        onSave={updateUser}
      />

      {/* Modal: Registro de Cliente desde Calendario */}
      <ClientRegistrationModal
        isOpen={modals.clientRegistration}
        onClose={() => {
          closeModal('clientRegistration')
          setSelectedDate(null)
        }}
        onSave={(clientData) => {
          // Agregar la fecha seleccionada a los datos del cliente
          const clientDataWithDate = {
            ...clientData,
            date: selectedDate?.toISOString().split('T')[0],
          }
          // Aquí deberías manejar el guardado del cliente
          closeModal('clientRegistration')
          setSelectedDate(null)
        }}
        selectedDate={selectedDate}
      />

      {/* Modal: Reservas del Día */}
      <DayReservationsModal
        isOpen={modals.dayReservations}
        onClose={() => {
          closeModal('dayReservations')
          setSelectedDate(null)
          setSelectedDayReservations([])
        }}
        date={selectedDate}
        fields={fields}
      />

      {/* Modal: Registro de Cliente / Nueva Reserva desde botón */}
      <ClientRegistrationModal
        isOpen={modals.booking}
        onClose={() => closeModal('booking')}
        title="Nueva Reserva"
        description="Selecciona o registra el cliente y completa los datos de la reserva"
        submitText="Crear Reserva"
        submitLoadingText="Creando..."
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

            // ✅ Cerrar el modal y mostrar éxito
            closeModal('booking')

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

export default AdminModals
