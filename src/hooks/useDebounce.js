import { useState, useEffect } from 'react'

export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // Configura un timer que actualiza el valor después del delay
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Limpia el timer si el valor o delay cambian antes de que se ejecute
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}
