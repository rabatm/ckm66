import { useState, useEffect } from 'react'
import { fetchMessages } from '../services/messaging.service'

export function useUnreadMessages() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const countUnread = async () => {
    try {
      setIsLoading(true)
      const messages = await fetchMessages()
      const count = messages.filter(m => !m.is_read).length
      setUnreadCount(count)
    } catch (error) {
      console.error('Error counting unread messages:', error)
      setUnreadCount(0)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    countUnread()
    // Refresh every 10 seconds
    const interval = setInterval(countUnread, 10000)
    return () => clearInterval(interval)
  }, [])

  return { unreadCount, isLoading, refetch: countUnread }
}
