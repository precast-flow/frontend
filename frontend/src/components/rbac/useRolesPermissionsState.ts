import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ALL_PERMISSIONS,
  MOCK_ROLE_USERS,
  MOCK_ROLES,
  MOCK_ROLE_PERMISSIONS,
  PERMISSION_MODULE_ORDER,
  ROLE_TEMPLATE_GRANTS,
  getLockedPermissionIdsForRole,
  isPermissionLockedForRole,
  type MockRole,
  type PermissionModuleKey,
} from '../../data/mockRbac'

function cloneMockRolePermissions(): Record<string, Set<string>> {
  const out: Record<string, Set<string>> = {}
  for (const [k, v] of Object.entries(MOCK_ROLE_PERMISSIONS)) {
    out[k] = new Set(v)
  }
  return out
}

export function useRolesPermissionsState() {
  const [roles, setRoles] = useState<MockRole[]>(() => MOCK_ROLES.map((r) => ({ ...r })))
  const [, setRolePermissions] = useState<Record<string, Set<string>>>(cloneMockRolePermissions)
  const [roleId, setRoleId] = useState(() => roles[0]?.id ?? 'admin')
  const [tab, setTab] = useState<'general' | 'permissions' | 'users'>('general')
  const [permSet, setPermSet] = useState<Set<string>>(() => new Set(MOCK_ROLE_PERMISSIONS['admin'] ?? []))
  const [query, setQuery] = useState('')
  const [moduleFilter, setModuleFilter] = useState<PermissionModuleKey | 'all'>('all')
  const [showAllRows, setShowAllRows] = useState(false)
  const [templateId, setTemplateId] = useState('')
  const [newRoleLabel, setNewRoleLabel] = useState('')
  const [newRoleDesc, setNewRoleDesc] = useState('')

  const role = roles.find((r) => r.id === roleId) ?? roles[0]

  useEffect(() => {
    setRolePermissions((rp) => {
      const base = new Set(rp[roleId] ?? [])
      const r = roles.find((x) => x.id === roleId)
      if (r) {
        getLockedPermissionIdsForRole(r).forEach((id) => base.add(id))
      }
      setPermSet(new Set(base))
      return { ...rp, [roleId]: new Set(base) }
    })
    setShowAllRows(false)
  }, [roleId, roles])

  const filteredPerms = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = ALL_PERMISSIONS
    if (moduleFilter !== 'all') {
      list = list.filter((p) => p.module === moduleFilter)
    }
    if (!q) return list
    return list.filter((p) => p.id.toLowerCase().includes(q) || p.label.toLowerCase().includes(q))
  }, [query, moduleFilter])

  const visibleRows = showAllRows ? filteredPerms : filteredPerms.slice(0, 8)
  const remaining = Math.max(0, filteredPerms.length - visibleRows.length)

  const commitPermSet = useCallback(
    (updater: (prev: Set<string>) => Set<string>) => {
      setPermSet((prev) => {
        const raw = updater(prev)
        const next = new Set(raw)
        const r = roles.find((x) => x.id === roleId)
        if (r) {
          getLockedPermissionIdsForRole(r).forEach((id) => next.add(id))
        }
        setRolePermissions((rp) => ({ ...rp, [roleId]: new Set(next) }))
        return next
      })
    },
    [roleId, roles],
  )

  const togglePerm = useCallback(
    (id: string, checked: boolean) => {
      const r = roles.find((x) => x.id === roleId)
      if (!r || isPermissionLockedForRole(r, id)) return
      commitPermSet((prev) => {
        const next = new Set(prev)
        if (checked) next.add(id)
        else next.delete(id)
        return next
      })
    },
    [commitPermSet, roleId, roles],
  )

  const selectAllInModule = useCallback(
    (mod: PermissionModuleKey) => {
      const ids = ALL_PERMISSIONS.filter((p) => p.module === mod).map((p) => p.id)
      commitPermSet((prev) => {
        const next = new Set(prev)
        for (const id of ids) next.add(id)
        return next
      })
    },
    [commitPermSet],
  )

  const applyTemplate = useCallback(() => {
    const r = roles.find((x) => x.id === roleId)
    if (!templateId || !r) return
    const ids = ROLE_TEMPLATE_GRANTS[templateId] ?? []
    commitPermSet((prev) => {
      const next = new Set(prev)
      for (const id of ids) next.add(id)
      return next
    })
  }, [commitPermSet, roleId, roles, templateId])

  const addRole = useCallback(() => {
    const label = newRoleLabel.trim()
    if (!label) return
    const id = `role-${Date.now()}`
    const nextRole: MockRole = {
      id,
      label,
      isSystem: false,
      userCount: 0,
      description: newRoleDesc.trim() || 'Özel rol (mock).',
    }
    setRoles((r) => [...r, nextRole])
    setRolePermissions((rp) => ({ ...rp, [id]: new Set<string>() }))
    setRoleId(id)
    setNewRoleLabel('')
    setNewRoleDesc('')
    setTab('permissions')
  }, [newRoleDesc, newRoleLabel])

  /** Silme onayı çağıran tarafta (confirm / diyalog) verildikten sonra çağrılır. */
  const removeCurrentRole = useCallback(() => {
    const r = roles.find((x) => x.id === roleId)
    if (!r || r.isSystem) return
    setRoles((list) => {
      const filtered = list.filter((x) => x.id !== r.id)
      const fallback = filtered[0]?.id ?? 'admin'
      setRoleId(fallback)
      return filtered
    })
    setRolePermissions((rp) => {
      const { [r.id]: _, ...rest } = rp
      return rest
    })
  }, [roleId, roles])

  const dependencyWarning =
    permSet.has('teklif.onayla') && !permSet.has('teklif.goruntule')

  return {
    roles,
    roleId,
    setRoleId,
    role,
    tab,
    setTab,
    permSet,
    query,
    setQuery,
    moduleFilter,
    setModuleFilter,
    showAllRows,
    setShowAllRows,
    templateId,
    setTemplateId,
    newRoleLabel,
    setNewRoleLabel,
    newRoleDesc,
    setNewRoleDesc,
    filteredPerms,
    visibleRows,
    remaining,
    commitPermSet,
    togglePerm,
    selectAllInModule,
    applyTemplate,
    addRole,
    removeCurrentRole,
    dependencyWarning,
    MOCK_ROLE_USERS,
    PERMISSION_MODULE_ORDER,
  }
}

export type RolesPermissionsState = ReturnType<typeof useRolesPermissionsState>
