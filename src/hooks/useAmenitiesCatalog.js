import { useEffect, useState } from 'react'
import { fetchAmenitiesCatalog } from '../services/amenitiesCatalog/amenitiesCatalogService'

/**
 * Cache en memoria del catálogo: una sola request por sesión.
 * El catálogo es semilla y cambia poco; no necesita revalidación.
 */
let cachedCatalog = null
let inflight = null

const loadCatalog = async () => {
  if (cachedCatalog) return cachedCatalog
  if (!inflight) {
    inflight = fetchAmenitiesCatalog()
      .then((data) => {
        cachedCatalog = data
        return data
      })
      .finally(() => {
        inflight = null
      })
  }
  return inflight
}

/**
 * Hook que expone el catálogo de amenidades.
 * @returns {{ catalog: Array, isLoading: boolean, error: Error|null }}
 */
const useAmenitiesCatalog = () => {
  const [catalog, setCatalog] = useState(cachedCatalog || [])
  const [isLoading, setIsLoading] = useState(!cachedCatalog)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (cachedCatalog) return
    let alive = true
    loadCatalog()
      .then((data) => {
        if (alive) setCatalog(data)
      })
      .catch((err) => {
        if (alive) setError(err)
      })
      .finally(() => {
        if (alive) setIsLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  return { catalog, isLoading, error }
}

export default useAmenitiesCatalog
