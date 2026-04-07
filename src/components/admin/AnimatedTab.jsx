import { motion } from 'framer-motion'
import PropTypes from 'prop-types'

/**
 * AnimatedTab - Higher-Order Component para animar la transición de tabs
 *
 * Envuelve cualquier componente con animaciones de entrada consistentes,
 * eliminando la duplicación de código motion.div en cada tab
 *
 * @param {React.ComponentType} Component - Componente a animar
 * @param {Object} animationConfig - Configuración opcional de animación
 * @returns {React.ComponentType} Componente animado
 *
 * @example
 * // Uso básico:
 * export const AnimatedPayments = withAnimatedTab(PaymentManagementModule)
 *
 * // Uso con config personalizada:
 * export const AnimatedReviews = withAnimatedTab(ReviewsManagementModule, {
 *   initial: { opacity: 0, x: -20 },
 *   animate: { opacity: 1, x: 0 }
 * })
 */
export const withAnimatedTab = (Component, animationConfig = {}) => {
  const AnimatedComponent = (props) => {
    const defaultConfig = {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.3 },
    }

    const config = { ...defaultConfig, ...animationConfig }

    return (
      <motion.div initial={config.initial} animate={config.animate} transition={config.transition}>
        <Component {...props} />
      </motion.div>
    )
  }

  // Preservar el nombre del componente para debugging
  AnimatedComponent.displayName = `AnimatedTab(${Component.displayName || Component.name || 'Component'})`

  return AnimatedComponent
}

/**
 * AnimatedTab - Componente wrapper alternativo para uso directo
 *
 * Alternativa al HOC para casos donde prefieres usar como wrapper
 *
 * @example
 * <AnimatedTab>
 *   <PaymentManagementModule />
 * </AnimatedTab>
 */
export const AnimatedTab = ({ children, animationConfig = {} }) => {
  const defaultConfig = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  }

  const config = { ...defaultConfig, ...animationConfig }

  return (
    <motion.div initial={config.initial} animate={config.animate} transition={config.transition}>
      {children}
    </motion.div>
  )
}

AnimatedTab.propTypes = {
  children: PropTypes.node.isRequired,
  animationConfig: PropTypes.shape({
    initial: PropTypes.object,
    animate: PropTypes.object,
    transition: PropTypes.object,
  }),
}
