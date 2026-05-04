import { useCallback, useEffect, useMemo, useState } from 'react'
import { useFactoryContext } from '../../context/FactoryContext'
import {
  MOCK_MANAGED_USERS,
  type MockManagedUser,
} from '../../data/mockUsers'

function cloneUsers(): MockManagedUser[] {
  return MOCK_MANAGED_USERS.map((u) => ({
    ...u,
    roleIds: [...u.roleIds],
    factoryCodes: [...u.factoryCodes],
    sessions: u.sessions.map((s) => ({ ...s })),
  }))
}

export type UserDetailTab = 'profile' | 'roles' | 'factories' | 'sessions'

export function useUserManagementState() {
  const { factories } = useFactoryContext()
  const [users, setUsers] = useState<MockManagedUser[]>(cloneUsers)
  const [selectedId, setSelectedId] = useState<string>(() => users[0]?.id ?? '')
  const [filterRole, setFilterRole] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [filterFactory, setFilterFactory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [detailTab, setDetailTab] = useState<UserDetailTab>('profile')
  const [toast, setToast] = useState<string | null>(null)
  const [deactivateOpen, setDeactivateOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return users.filter((u) => {
      if (filterRole && !u.roleIds.includes(filterRole)) return false
      if (filterStatus === 'active' && !u.active) return false
      if (filterStatus === 'inactive' && u.active) return false
      if (filterFactory && !u.factoryCodes.includes(filterFactory)) return false
      if (q) {
        const hay = `${u.name} ${u.email} ${u.id} ${u.title ?? ''}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [users, filterRole, filterStatus, filterFactory, searchQuery])

  const selected = users.find((u) => u.id === selectedId)

  useEffect(() => {
    if (selected) return
    const first = filtered[0]?.id ?? users[0]?.id
    if (first) setSelectedId(first)
  }, [filtered, selected, users])

  const showToast = useCallback((message: string, durationMs = 4000) => {
    setToast(message)
    window.setTimeout(() => setToast(null), durationMs)
  }, [])

  const updateUser = useCallback(
    (id: string, patch: Partial<MockManagedUser> | ((u: MockManagedUser) => MockManagedUser)) => {
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== id) return u
          return typeof patch === 'function' ? patch(u) : { ...u, ...patch }
        }),
      )
    },
    [],
  )

  const toggleRole = useCallback(
    (userId: string, roleId: string) => {
      updateUser(userId, (u) => {
        if (!u.active) return u
        const has = u.roleIds.includes(roleId)
        const roleIds = has ? u.roleIds.filter((x) => x !== roleId) : [...u.roleIds, roleId]
        return { ...u, roleIds: roleIds.length ? roleIds : u.roleIds }
      })
    },
    [updateUser],
  )

  const toggleFactory = useCallback(
    (userId: string, code: string) => {
      updateUser(userId, (u) => {
        if (!u.active) return u
        const has = u.factoryCodes.includes(code)
        let factoryCodes = has ? u.factoryCodes.filter((c) => c !== code) : [...u.factoryCodes, code]
        if (!factoryCodes.length) factoryCodes = [code]
        let defaultFactoryCode = u.defaultFactoryCode
        if (!factoryCodes.includes(defaultFactoryCode)) defaultFactoryCode = factoryCodes[0] ?? defaultFactoryCode
        return { ...u, factoryCodes, defaultFactoryCode }
      })
    },
    [updateUser],
  )

  const confirmDeactivate = useCallback(
    (successMessage: string) => {
      if (!selected || !selected.active) return
      updateUser(selected.id, { active: false })
      setDeactivateOpen(false)
      showToast(successMessage, 4200)
    },
    [selected, updateUser, showToast],
  )

  const mockPasswordReset = useCallback(
    (message: string) => {
      showToast(message, 3800)
    },
    [showToast],
  )

  const mockSave = useCallback(
    (message: string) => {
      showToast(message, 3800)
    },
    [showToast],
  )

  const addMockUser = useCallback(() => {
    const id = `new-${Date.now()}`
    const row: MockManagedUser = {
      id,
      name: 'Yeni kullanıcı',
      email: `yeni.${id.slice(-4)}@acme.com`,
      title: '—',
      active: true,
      roleIds: ['readonly'],
      factoryCodes: ['IST-HAD'],
      defaultFactoryCode: 'IST-HAD',
      lastLogin: '—',
      inviteStatus: 'pending',
      sessions: [],
      reportsToId: null,
      workStatusLine: '',
    }
    setUsers((prev) => [...prev, row])
    setSelectedId(id)
    setDetailTab('profile')
  }, [])

  const value = {
    factories,
    users,
    filtered,
    selected,
    selectedId,
    setSelectedId,
    filterRole,
    setFilterRole,
    filterStatus,
    setFilterStatus,
    filterFactory,
    setFilterFactory,
    searchQuery,
    setSearchQuery,
    detailTab,
    setDetailTab,
    toast,
    setToast,
    deactivateOpen,
    setDeactivateOpen,
    updateUser,
    toggleRole,
    toggleFactory,
    confirmDeactivate,
    mockPasswordReset,
    mockSave,
    addMockUser,
    showToast,
  }
  return value
}

export type UserManagementState = ReturnType<typeof useUserManagementState>
