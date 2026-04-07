import React from 'react'

/**
 * SportCardSkeleton - Skeleton loader para una card de deporte individual
 */
const SportCardSkeleton = () => {
  return (
    <div className="relative flex items-center gap-3 p-4 sm:p-5 border-2 border-secondary-200 rounded-xl bg-white min-h-[64px] animate-pulse">
      {/* Checkbox skeleton */}
      <div className="w-7 h-7 bg-secondary-200 rounded-md flex-shrink-0"></div>

      {/* Icon skeleton */}
      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-secondary-200 rounded-full flex-shrink-0"></div>

      {/* Text skeleton */}
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
      </div>
    </div>
  )
}

/**
 * SportsSkeletonLoader - Skeleton loader para la grid completa de deportes
 * Muestra placeholders animados mientras se cargan los deportes
 *
 * @param {number} count - Número de skeletons a mostrar (default: 8)
 * @param {boolean} showHeader - Si mostrar el header con título (default: true)
 */
const SportsSkeletonLoader = ({ count = 8, showHeader = true }) => {
  return (
    <div className="space-y-4">
      {showHeader && (
        <>
          {/* Header skeleton */}
          <div className="space-y-2 animate-pulse">
            <div className="h-5 bg-secondary-200 rounded w-64 max-w-full"></div>
            <div className="h-3 bg-secondary-200 rounded w-96 max-w-full"></div>
          </div>
        </>
      )}

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr">
        {Array.from({ length: count }).map((_, index) => (
          <SportCardSkeleton key={index} />
        ))}
      </div>

      {/* Loading indicator */}
      <div className="flex items-center justify-center py-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-3 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="h-4 bg-secondary-200 rounded w-48"></div>
        </div>
      </div>
    </div>
  )
}

export default SportsSkeletonLoader
