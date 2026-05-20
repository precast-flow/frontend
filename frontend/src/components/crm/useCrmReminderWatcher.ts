import { useEffect } from 'react'
import { useNotificationFeed } from '../../context/NotificationFeedContext'
import { processDueCrmReminders } from '../../data/crmReminders'

/** Hatırlatma tarihi geldiğinde bildirim merkezine otomatik kayıt ekler (mock). */
export function useCrmReminderWatcher(active = true): void {
  const { prependNotification } = useNotificationFeed()

  useEffect(() => {
    if (!active) return
    processDueCrmReminders(prependNotification)
    const interval = window.setInterval(() => {
      processDueCrmReminders(prependNotification)
    }, 60_000)
    return () => window.clearInterval(interval)
  }, [active, prependNotification])
}
