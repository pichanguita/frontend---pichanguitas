import React, { useEffect } from 'react'
import { MapPin, Phone, Mail } from 'lucide-react'
import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaYoutube,
  FaTiktok,
} from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import { HiLink } from 'react-icons/hi'
import useConfigStore from '../store/configStore'

// Map de iconos disponibles - íconos oficiales de redes sociales
const iconMap = {
  Facebook: FaFacebookF,
  facebook: FaFacebookF,
  FaFacebookF: FaFacebookF,
  fb: FaFacebookF,
  Instagram: FaInstagram,
  instagram: FaInstagram,
  Twitter: FaXTwitter,
  twitter: FaXTwitter,
  x: FaXTwitter,
  MessageCircle: FaWhatsapp,
  Whatsapp: FaWhatsapp,
  whatsapp: FaWhatsapp,
  WhatsApp: FaWhatsapp,
  Youtube: FaYoutube,
  youtube: FaYoutube,
  YouTube: FaYoutube,
  Music: FaTiktok,
  TikTok: FaTiktok,
  tiktok: FaTiktok,
  LinkIcon: HiLink,
}

// Función para obtener el ícono correcto basándose en icon o name
const getIcon = (social) => {
  // Primero intentar por el valor de icon
  if (social.icon && iconMap[social.icon]) {
    return iconMap[social.icon]
  }
  // Si no, intentar por el nombre de la red social
  const nameLower = (social.name || '').toLowerCase()
  if (nameLower.includes('facebook')) return FaFacebookF
  if (nameLower.includes('instagram')) return FaInstagram
  if (nameLower.includes('twitter') || nameLower.includes('x')) return FaXTwitter
  if (nameLower.includes('whatsapp')) return FaWhatsapp
  if (nameLower.includes('youtube')) return FaYoutube
  if (nameLower.includes('tiktok')) return FaTiktok
  // Fallback
  return HiLink
}

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const { getEnabledSocialMedia, getContactInfo, fetchContactInfo, fetchEnabledSocialMedia } =
    useConfigStore()
  const socialMedia = getEnabledSocialMedia()
  const contactInfo = getContactInfo()

  // Cargar información de contacto y redes sociales al montar
  useEffect(() => {
    fetchContactInfo()
    fetchEnabledSocialMedia()
  }, [])

  const getHref = (social) => {
    if (social.isPhone) {
      return `https://wa.me/${social.url}`
    }
    return social.url
  }

  return (
    <footer className="text-white" style={{ backgroundColor: '#1a3a3a' }}>
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 sm:py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <img
                src="/LOGO.png"
                alt="Pichanguita Logo"
                className="object-contain w-12 h-12 sm:w-14 sm:h-14"
              />
              <div>
                <h3 className="text-xl font-bold tracking-tight text-white uppercase sm:text-2xl">
                  PICHANGUITAS
                </h3>
                <p
                  className="text-xs tracking-wide uppercase sm:text-sm"
                  style={{ color: '#ffd500' }}
                >
                  Reserva de Cancha
                </p>
              </div>
            </div>
            <p className="max-w-xs text-sm sm:text-base" style={{ color: '#9ca3af' }}>
              La forma más rápida y sencilla de reservar canchas deportivas en Apurímac. Sin
              complicaciones, solo diversión.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-base font-semibold text-white sm:text-lg">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-sm sm:text-base">
              <li>
                <a
                  href="#inicio"
                  className="transition-colors duration-200"
                  style={{ color: '#9ca3af' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ffd500')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
                >
                  Inicio
                </a>
              </li>
              <li>
                <a
                  href="#reservar"
                  className="transition-colors duration-200"
                  style={{ color: '#9ca3af' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ffd500')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
                >
                  Reservar Cancha
                </a>
              </li>
              <li>
                <a
                  href="#canchas"
                  className="transition-colors duration-200"
                  style={{ color: '#9ca3af' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ffd500')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
                >
                  Nuestras Canchas
                </a>
              </li>
              <li>
                <a
                  href="#contacto"
                  className="transition-colors duration-200"
                  style={{ color: '#9ca3af' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ffd500')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
                >
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-base font-semibold text-white sm:text-lg">Contacto</h4>
            <ul className="space-y-3 text-sm sm:text-base">
              {contactInfo.phone && (
                <li className="flex items-center space-x-3">
                  <Phone className="flex-shrink-0 w-5 h-5" style={{ color: '#ffd500' }} />
                  <span style={{ color: '#9ca3af' }}>{contactInfo.phone}</span>
                </li>
              )}
              {contactInfo.email && (
                <li className="flex items-center space-x-3">
                  <Mail className="flex-shrink-0 w-5 h-5" style={{ color: '#ffd500' }} />
                  <span style={{ color: '#9ca3af' }}>{contactInfo.email}</span>
                </li>
              )}
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#ffd500' }} />
                <div style={{ color: '#9ca3af' }}>
                  <p>{contactInfo.location || 'Perú'}</p>
                  {contactInfo.address && <p className="text-xs">{contactInfo.address}</p>}
                </div>
              </li>
            </ul>
          </div>

          {/* Social Media & Hours */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-base font-semibold text-white sm:text-lg">Síguenos</h4>
            {socialMedia.length > 0 ? (
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {socialMedia.map((social) => {
                  const Icon = getIcon(social)
                  return (
                    <a
                      key={social.id}
                      href={getHref(social)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-10 h-10 transition-all duration-200 rounded-lg"
                      style={{ backgroundColor: '#0a2424' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = social.color)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0a2424')}
                      aria-label={social.name}
                      title={social.name}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm" style={{ color: '#9ca3af' }}>
                Configura tus redes sociales desde el panel de administración
              </p>
            )}

            <div className="mt-4 sm:mt-6">
              <h5 className="mb-2 text-sm font-medium text-white sm:text-base">
                Horarios de Atención
              </h5>
              <p className="text-xs sm:text-sm" style={{ color: '#9ca3af' }}>
                {contactInfo.scheduleWeekdays || 'Lunes - Domingo'}
                <br />
                {contactInfo.scheduleHours || '5:00 PM - 12:00 AM'}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="flex flex-col items-center justify-between pt-6 mt-8 border-t sm:pt-8 sm:mt-12 sm:flex-row"
          style={{ borderColor: '#0a2424' }}
        >
          <p className="text-xs text-center sm:text-sm sm:text-left" style={{ color: '#6b7280' }}>
            © {currentYear} PICHANGUITA. Todos los derechos reservados.
          </p>
          {/* Enlaces legales - descomentar cuando existan las páginas
          <div className="flex mt-3 space-x-4 sm:mt-0 sm:space-x-6">
            <a href="/privacidad" className="text-xs transition-colors duration-200 sm:text-sm" style={{ color: '#6b7280' }}>
              Privacidad
            </a>
            <a href="/terminos" className="text-xs transition-colors duration-200 sm:text-sm" style={{ color: '#6b7280' }}>
              Términos
            </a>
            <a href="/soporte" className="text-xs transition-colors duration-200 sm:text-sm" style={{ color: '#6b7280' }}>
              Soporte
            </a>
          </div>
          */}
        </div>
      </div>
    </footer>
  )
}

export default Footer
