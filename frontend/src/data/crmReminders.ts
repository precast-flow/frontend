import type { NotificationFeedItem } from './dashboardMock'

const STORAGE_KEY = 'crm:pending-reminders:v1'

export type CrmPendingReminder = {
  id: string
  customerId: string
  customerName: string
  note: string
  /** ISO date YYYY-MM-DD */
  dueDate: string
  notified?: boolean
}

export function loadCrmReminders(): CrmPendingReminder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CrmPendingReminder[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveCrmReminders(reminders: CrmPendingReminder[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders))
}

export function upsertCrmReminder(reminder: CrmPendingReminder): void {
  const list = loadCrmReminders().filter((r) => r.customerId !== reminder.customerId)
  list.push(reminder)
  saveCrmReminders(list)
}

export function removeCrmReminder(customerId: string): void {
  saveCrmReminders(loadCrmReminders().filter((r) => r.customerId !== customerId))
}

function todayIsoDate(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Vadesi gelen hatırlatmalar için bildirim üretir; bir kez tetiklenir. */
export function processDueCrmReminders(
  prependNotification: (item: NotificationFeedItem) => void,
): void {
  const today = todayIsoDate()
  const reminders = loadCrmReminders()
  let changed = false

  for (const reminder of reminders) {
    if (reminder.notified || reminder.dueDate > today) continue
    prependNotification({
      id: `crm-rem-${reminder.id}-${today}`,
      title: 'CRM hatırlatması',
      detail: `${reminder.customerName} · ${reminder.note || 'Takip zamanı geldi'}`,
      time: 'şimdi',
      moduleId: 'crm',
    })
    reminder.notified = true
    changed = true
  }

  if (changed) saveCrmReminders(reminders)
}
