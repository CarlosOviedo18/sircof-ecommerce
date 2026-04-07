import { useState, useEffect, useCallback } from 'react'
import { API_CONFIG, buildFullUrl } from '../../config/api'

const POLL_INTERVAL = 30000 


export const useAdminNotifications = () => {
  const [notifications, setNotifications] = useState({
    pendingOrders: 0,
    unreadContacts: 0
  })

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const res = await fetch(buildFullUrl(API_CONFIG.ENDPOINTS.ADMIN_NOTIFICATIONS), {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) return

      const data = await res.json()
      if (data.success) {
        setNotifications(data.notifications)
      }
    } catch {
     
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  return { notifications, refetch: fetchNotifications }
}
