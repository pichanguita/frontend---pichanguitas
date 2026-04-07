import React from 'react'
import Header from './Header'
import Footer from './Footer'

const Layout = ({ children, onOpenBooking }) => {
  return (
    <div className="min-h-screen flex flex-col bg-secondary-50">
      <Header onOpenBooking={onOpenBooking} />
      {/* Espaciador para compensar el header fijo */}
      <div className="h-[72px] sm:h-[80px]" />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  )
}

export default Layout
