import React from 'react'
import { AnimatedTab } from './AnimatedTab'
import { ReservationsTab, FieldsTab, RefundsTab } from './tabs'
import PaymentManagementModule from '../PaymentManagementModule'
import GamificationAdmin from '../GamificationAdmin'
import ReviewsManagementModule from '../ReviewsManagementModule'
import PendingReservationsModule from '../PendingReservationsModule'
import PendingFieldsModule from '../PendingFieldsModule'
import MyClientsModule from '../MyClientsModule'
import PromotionsModule from '../PromotionsModule'
import WhatsAppConfigModule from '../WhatsAppConfigModule'
import FieldPaymentMethodsConfig from '../FieldPaymentMethodsConfig'
import AlertsModule from '../AlertsModule'
import UsersManagementModule from '../UsersManagementModule'
import SuperAdminDashboard from '../SuperAdminDashboard'
import SportsManagementModule from '../SportsManagementModule'
import SiteConfig from '../SiteConfig'
import PaymentConfigModule from '../PaymentConfigModule'
import PaymentControlModule from '../PaymentControlModule'
import MetricsDashboard from '../MetricsDashboard'
import AdminPaymentStatus from '../AdminPaymentStatus'
import MyMonthlyPaymentsModule from '../MyMonthlyPaymentsModule'
import RegistrationRequestsModule from '../RegistrationRequestsModule'
import SuperAdminPaymentsView from '../superadmin/SuperAdminPaymentsView'
import MyProfileView from '../MyProfileView'
import RegisteredClientsModule from '../RegisteredClientsModule'
import { ADMIN_TABS } from '../../constants'

const TabsContent = ({ activeTab, user, isSuperAdmin, hasPermission, handlers, data }) => {
  const {
    onOpenBookingModal,
    onDateClick,
    onOpenNewFieldModal,
    onViewField,
    onEditField,
    onConfigField,
    onDeleteField,
    getFieldOwner,
  } = handlers

  const { pendingRefunds, fields, sportTypes, users, markRefundAsProcessed, addActivityLog } = data

  return (
    <>
      {/* Reservations Tab */}
      {activeTab === ADMIN_TABS.RESERVATIONS && (
        <ReservationsTab onOpenBookingModal={onOpenBookingModal} onDateClick={onDateClick} />
      )}

      {/* Payments Tab */}
      {activeTab === ADMIN_TABS.PAYMENTS && (
        <AnimatedTab>
          {isSuperAdmin ? <SuperAdminPaymentsView /> : <PaymentManagementModule />}
        </AnimatedTab>
      )}

      {/* Refunds Tab */}
      {activeTab === ADMIN_TABS.REFUNDS && (
        <RefundsTab
          pendingRefunds={pendingRefunds}
          fields={fields}
          user={user}
          onMarkAsProcessed={markRefundAsProcessed}
          onActivityLog={addActivityLog}
        />
      )}

      {/* Gamification Tab */}
      {activeTab === ADMIN_TABS.GAMIFICATION && (
        <AnimatedTab>
          <GamificationAdmin />
        </AnimatedTab>
      )}

      {/* Reviews Tab */}
      {activeTab === ADMIN_TABS.REVIEWS && (
        <AnimatedTab>
          <ReviewsManagementModule />
        </AnimatedTab>
      )}

      {/* Pending Reservations Tab */}
      {activeTab === ADMIN_TABS.PENDING_RESERVATIONS && (
        <AnimatedTab>
          <PendingReservationsModule />
        </AnimatedTab>
      )}

      {/* Fields Tab */}
      {activeTab === ADMIN_TABS.FIELDS && (
        <FieldsTab
          onOpenNewFieldModal={onOpenNewFieldModal}
          onViewField={onViewField}
          onEditField={onEditField}
          onConfigField={onConfigField}
          onDeleteField={onDeleteField}
          getFieldOwner={getFieldOwner}
          sportTypes={sportTypes}
          users={users}
        />
      )}

      {/* Pending Fields Tab (Super Admin Only) */}
      {activeTab === ADMIN_TABS.PENDING_FIELDS && isSuperAdmin && (
        <AnimatedTab>
          <PendingFieldsModule />
        </AnimatedTab>
      )}

      {/* My Clients Tab (Regular Admin Only) */}
      {activeTab === ADMIN_TABS.CLIENTS && user?.role === 'admin' && (
        <AnimatedTab>
          <MyClientsModule />
        </AnimatedTab>
      )}

      {/* Promotions Tab (Regular Admin Only) */}
      {activeTab === ADMIN_TABS.PROMOTIONS && user?.role === 'admin' && (
        <AnimatedTab>
          <PromotionsModule />
        </AnimatedTab>
      )}

      {/* WhatsApp Config Tab (Regular Admin Only) */}
      {activeTab === ADMIN_TABS.WHATSAPP && user?.role === 'admin' && (
        <AnimatedTab>
          <WhatsAppConfigModule />
        </AnimatedTab>
      )}

      {/* Field Payment Methods Tab (Super Admin and Regular Admin) */}
      {activeTab === ADMIN_TABS.FIELD_PAYMENT_METHODS && (
        <AnimatedTab>
          <FieldPaymentMethodsConfig />
        </AnimatedTab>
      )}

      {/* Alerts Tab */}
      {activeTab === ADMIN_TABS.ALERTS && (
        <AnimatedTab>
          <AlertsModule />
        </AnimatedTab>
      )}

      {/* Users Tab - Unified Module */}
      {activeTab === ADMIN_TABS.USERS && hasPermission('administrator.users.view') && (
        <AnimatedTab>
          <UsersManagementModule />
        </AnimatedTab>
      )}

      {/* Dashboard Tab (Super Admin Only) */}
      {activeTab === ADMIN_TABS.DASHBOARD && isSuperAdmin && (
        <AnimatedTab>
          <SuperAdminDashboard />
        </AnimatedTab>
      )}

      {/* Sports Management Tab (Super Admin Only) */}
      {activeTab === ADMIN_TABS.SPORTS && isSuperAdmin && (
        <AnimatedTab>
          <SportsManagementModule />
        </AnimatedTab>
      )}

      {/* Site Configuration Tab (Super Admin Only) */}
      {activeTab === ADMIN_TABS.SITE_CONFIG && isSuperAdmin && (
        <AnimatedTab>
          <SiteConfig />
        </AnimatedTab>
      )}

      {/* Payment Configuration Tab (Super Admin Only) */}
      {activeTab === ADMIN_TABS.PAYMENT_CONFIG && isSuperAdmin && (
        <AnimatedTab>
          <PaymentConfigModule />
        </AnimatedTab>
      )}

      {/* Payment Control Tab (Super Admin Only) */}
      {activeTab === ADMIN_TABS.PAYMENT_CONTROL && isSuperAdmin && (
        <AnimatedTab>
          <PaymentControlModule />
        </AnimatedTab>
      )}

      {/* Resumen Tab (Regular Admin) */}
      {activeTab === ADMIN_TABS.RESUMEN && !isSuperAdmin && (
        <AnimatedTab>
          {/* Estado de Pago Mensual - Widget prominente para el admin */}
          <AdminPaymentStatus />

          {/* Métricas del negocio */}
          <MetricsDashboard />
        </AnimatedTab>
      )}

      {/* My Monthly Payments Tab (Regular Admin Only) */}
      {activeTab === ADMIN_TABS.MY_MONTHLY_PAYMENTS && !isSuperAdmin && (
        <AnimatedTab>
          <MyMonthlyPaymentsModule />
        </AnimatedTab>
      )}

      {/* Registration Requests Tab (Super Admin Only) */}
      {activeTab === ADMIN_TABS.REGISTRATIONS && isSuperAdmin && (
        <AnimatedTab>
          <RegistrationRequestsModule />
        </AnimatedTab>
      )}

      {/* My Profile Tab (All Users) */}
      {activeTab === ADMIN_TABS.MY_PROFILE && (
        <AnimatedTab>
          <MyProfileView />
        </AnimatedTab>
      )}

      {/* Registered Clients Tab (Super Admin Only) */}
      {activeTab === ADMIN_TABS.REGISTERED_CLIENTS && isSuperAdmin && (
        <AnimatedTab>
          <RegisteredClientsModule />
        </AnimatedTab>
      )}
    </>
  )
}

export default TabsContent
