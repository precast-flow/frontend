import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  notificationFeedItems as INITIAL_NOTIFICATIONS,
  type NotificationFeedItem,
} from '../data/dashboardMock'

type NotificationFeedContextValue = {
  items: NotificationFeedItem[]
  prependNotification: (item: NotificationFeedItem) => void
}

const NotificationFeedContext = createContext<NotificationFeedContextValue | null>(null)

export function NotificationFeedProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<NotificationFeedItem[]>(() => [...INITIAL_NOTIFICATIONS])

  const prependNotification = useCallback((item: NotificationFeedItem) => {
    setItems((prev) => [item, ...prev])
  }, [])

  const value = useMemo(() => ({ items, prependNotification }), [items, prependNotification])

  return (
    <NotificationFeedContext.Provider value={value}>{children}</NotificationFeedContext.Provider>
  )
}

export function useNotificationFeed(): NotificationFeedContextValue {
  const ctx = useContext(NotificationFeedContext)
  if (!ctx) {
    throw new Error('useNotificationFeed must be used within NotificationFeedProvider')
  }
  return ctx
}
