import type { MockManagedUser } from './mockUsers'

/** Rapor hattına göre bir kullanıcının astları (doğrudan + dolaylı). */
export function getDescendantIds(managerId: string, users: MockManagedUser[]): Set<string> {
  const set = new Set<string>()
  const stack = [managerId]
  while (stack.length) {
    const id = stack.pop()!
    for (const u of users) {
      if (u.reportsToId === id && !set.has(u.id)) {
        set.add(u.id)
        stack.push(u.id)
      }
    }
  }
  return set
}

export function directReportsCount(managerId: string, users: MockManagedUser[]): number {
  return users.filter((u) => u.reportsToId === managerId).length
}

/** Üst seçiminde döngü: kendisi veya kendi astı üst olamaz. */
export function isValidReportsTo(
  userId: string,
  proposedManagerId: string | null,
  users: MockManagedUser[],
): boolean {
  if (proposedManagerId === null) return true
  if (proposedManagerId === userId) return false
  const descendants = getDescendantIds(userId, users)
  return !descendants.has(proposedManagerId)
}
