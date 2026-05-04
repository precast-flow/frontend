import { useId, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Info, Lock, Search, Shield, Trash2, Users } from 'lucide-react'
import {
  MOCK_ROLE_TEMPLATES,
  PERMISSION_MODULE_LABELS,
  PERMISSION_TO_APPROVAL_HINT,
  isPermissionLockedForRole,
  type PermissionModuleKey,
} from '../../data/mockRbac'
import { useI18n } from '../../i18n/I18nProvider'
import { PmStyleDialog } from '../shared/PmStyleDialog'
import { FilterToolbarSearch } from '../shared/FilterToolbarSearch'
import {
  eiSplitHeaderButtonPassive,
  ElementIdentityFilterSheetHeader,
  ElementIdentityPieceCodesLikeSplit,
} from '../elementIdentity/ElementIdentityPieceCodesLikeSplit'
import '../muhendislikOkan/engineeringOkanLiquid.css'
import type { RolesPermissionsState } from './useRolesPermissionsState'

const inputCls =
  'mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-900 outline-none ring-sky-300/50 focus:ring-2 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100'

function tabPill(active: boolean) {
  return [
    'shrink-0 rounded-full border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50',
    active
      ? 'border-sky-300/70 bg-sky-100/70 text-slate-900 dark:border-sky-500/50 dark:bg-sky-900/35 dark:text-slate-50'
      : 'border-slate-200/70 bg-white/55 text-slate-600 hover:text-slate-900 dark:border-slate-700/60 dark:bg-slate-900/35 dark:text-slate-300 dark:hover:text-slate-100',
  ].join(' ')
}

export function RolesAndPermissionsModuleView(props: RolesPermissionsState) {
  const { t } = useI18n()
  const baseId = useId()
  const rightRef = useRef<HTMLDivElement | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [roleListQuery, setRoleListQuery] = useState('')

  const scrollPanelTop = () => {
    requestAnimationFrame(() => rightRef.current?.scrollTo({ top: 0, behavior: 'auto' }))
  }

  const {
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
    togglePerm,
    selectAllInModule,
    applyTemplate,
    addRole,
    removeCurrentRole,
    dependencyWarning,
    MOCK_ROLE_USERS,
    PERMISSION_MODULE_ORDER,
  } = props

  const confirmDelete = () => {
    removeCurrentRole()
    setDeleteOpen(false)
  }

  const visibleRoles = useMemo(() => {
    const q = roleListQuery.trim().toLowerCase()
    if (!q) return roles
    return roles.filter((r) => r.label.toLowerCase().includes(q))
  }, [roles, roleListQuery])

  return (
    <>
      <ElementIdentityPieceCodesLikeSplit
        persistKey="roles-permissions"
        listTitle={t('rolesPermissions.listTitle')}
        filterToolbarSearch={
          <FilterToolbarSearch
            id="roles-list-inline-search"
            value={roleListQuery}
            onValueChange={setRoleListQuery}
            placeholder={t('rolesPermissions.roleListSearchPh')}
            ariaLabel={t('rolesPermissions.roleListSearchAria')}
          />
        }
        headerActions={
          <Link
            to="/roller-izinler?legacy=1"
            className={`${eiSplitHeaderButtonPassive} no-underline`}
          >
            {t('rolesPermissions.legacyLink')}
          </Link>
        }
        isFilterOpen={filterOpen}
        onFilterOpenChange={setFilterOpen}
        filterAside={
          <div>
            <ElementIdentityFilterSheetHeader
              title={t('rolesPermissions.filtersTitle')}
              subtitle={t('rolesPermissions.filtersSubtitle')}
              onClose={() => setFilterOpen(false)}
            />
            <div className="grid gap-2.5">
              <label>
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  {t('rolesPermissions.roleListSearch')}
                </span>
                <input
                  type="search"
                  value={roleListQuery}
                  onChange={(e) => setRoleListQuery(e.target.value)}
                  placeholder={t('rolesPermissions.roleListSearchPh')}
                  autoComplete="off"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                />
              </label>
              <label>
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  {t('rolesPermissions.filterModule')}
                </span>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                  value={moduleFilter}
                  onChange={(e) => {
                    setModuleFilter(e.target.value as PermissionModuleKey | 'all')
                    setShowAllRows(false)
                  }}
                >
                  <option value="all">{t('rolesPermissions.filterAllModules')}</option>
                  {PERMISSION_MODULE_ORDER.map((m) => (
                    <option key={m} value={m}>
                      {PERMISSION_MODULE_LABELS[m]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  {t('rolesPermissions.filterSearch')}
                </span>
                <span className="relative mt-1 block">
                  <Search
                    className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-500 dark:text-slate-400"
                    aria-hidden
                  />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value)
                      setShowAllRows(false)
                    }}
                    placeholder={t('rolesPermissions.filterSearchPh')}
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-8 pr-2 text-xs outline-none ring-sky-300/50 focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                  />
                </span>
              </label>
            </div>
            <div className="mt-3 flex justify-end border-t border-slate-200/60 pt-2 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => {
                  setRoleListQuery('')
                  setModuleFilter('all')
                  setQuery('')
                  setShowAllRows(false)
                }}
                className="rounded-md border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200"
              >
                {t('elementIdentity.reset')}
              </button>
            </div>
          </div>
        }
        listBody={
          <>
            {visibleRoles.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  title={r.isSystem ? t('rolesPermissions.systemRoleTitle') : undefined}
                  onClick={() => {
                    setRoleId(r.id)
                    setTab('general')
                    scrollPanelTop()
                  }}
                  className={`flex w-full flex-col gap-0.5 rounded-lg border px-2.5 py-2 text-left text-xs transition ${
                    r.id === roleId
                      ? 'border-sky-400/60 bg-sky-500/10 dark:border-sky-500/40 dark:bg-sky-500/15'
                      : 'border-slate-200/50 bg-white/40 hover:bg-white/70 dark:border-slate-700/50 dark:bg-slate-900/30 dark:hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-semibold text-slate-900 dark:text-slate-50">{r.label}</span>
                    {r.isSystem ? (
                      <Shield className="size-3.5 shrink-0 text-slate-500 dark:text-slate-400" strokeWidth={1.75} aria-hidden />
                    ) : null}
                  </div>
                  <span className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                    {r.userCount ?? 0} {t('rolesPermissions.listUserCountSuffix')}
                  </span>
                </button>
              </li>
            ))}
            <li className="mt-2 border-t border-slate-200/60 pt-3 dark:border-slate-700/60">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {t('rolesPermissions.newRoleSection')}
              </p>
              <label className="block">
                <span className="sr-only">{t('rolesPermissions.newRoleNamePh')}</span>
                <input
                  type="text"
                  value={newRoleLabel}
                  onChange={(e) => setNewRoleLabel(e.target.value)}
                  placeholder={t('rolesPermissions.newRoleNamePh')}
                  className={inputCls}
                />
              </label>
              <label className="mt-2 block">
                <span className="sr-only">{t('rolesPermissions.newRoleDescPh')}</span>
                <input
                  type="text"
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  placeholder={t('rolesPermissions.newRoleDescPh')}
                  className={inputCls}
                />
              </label>
              <button
                type="button"
                onClick={addRole}
                disabled={!newRoleLabel.trim()}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-900 px-2 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              >
                {t('rolesPermissions.createRole')}
              </button>
            </li>
          </>
        }
        footer={
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-slate-600 dark:text-slate-300">
            <p>
              <span className="tabular-nums font-semibold text-slate-800 dark:text-slate-100">{roles.length}</span>{' '}
              {t('rolesPermissions.footerRoles')}
            </p>
          </div>
        }
        rightPanelRef={rightRef}
        rightAside={
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <p className="mb-2 shrink-0 px-0.5 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 sm:px-1">
              {t('rolesPermissions.intro')}
            </p>
            {role ? (
              <div className="flex h-full min-h-0 flex-col">
                <header className="shrink-0 border-b border-slate-200/25 pb-3 text-center dark:border-white/10">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t('rolesPermissions.selectedRole')}
                  </p>
                  <h3 className="mt-1 font-mono text-xl font-semibold text-slate-900 dark:text-slate-50">{role.label}</h3>
                  {role.isSystem ? (
                    <p className="mt-2 flex items-center justify-center gap-2 text-center text-xs text-slate-600 dark:text-slate-400">
                      <Lock className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
                      {t('rolesPermissions.systemRoleNote')}
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">{t('rolesPermissions.customRoleNote')}</p>
                  )}
                  {!role.isSystem ? (
                    <div className="mt-3 flex justify-center">
                      <button
                        type="button"
                        onClick={() => setDeleteOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300/70 bg-rose-50/90 px-2 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-100 dark:border-rose-600/60 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-950/60"
                      >
                        <Trash2 className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
                        {t('rolesPermissions.deleteRole')}
                      </button>
                    </div>
                  ) : null}
                </header>

                <div className="sticky top-0 z-10 flex w-full shrink-0 justify-center pt-3">
                  <div className="flex max-w-full gap-1 overflow-x-auto" role="tablist">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={tab === 'general'}
                      onClick={() => {
                        setTab('general')
                        scrollPanelTop()
                      }}
                      className={tabPill(tab === 'general')}
                    >
                      {t('rolesPermissions.tabGeneral')}
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={tab === 'permissions'}
                      onClick={() => {
                        setTab('permissions')
                        scrollPanelTop()
                      }}
                      className={tabPill(tab === 'permissions')}
                    >
                      {t('rolesPermissions.tabPermissions')}
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={tab === 'users'}
                      onClick={() => {
                        setTab('users')
                        scrollPanelTop()
                      }}
                      className={tabPill(tab === 'users')}
                    >
                      <span className="inline-flex items-center gap-1">
                        <Users className="size-3.5 shrink-0" aria-hidden />
                        {t('rolesPermissions.tabUsers')}
                      </span>
                    </button>
                  </div>
                </div>

                <div
                  role="tabpanel"
                  className="okan-project-tab-panel mt-3 min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-0.5 text-left sm:px-1"
                >
                  {tab === 'general' ? (
                    <div className="space-y-4 text-sm">
                      <p className="leading-relaxed text-slate-700 dark:text-slate-300">{role.description}</p>
                      <div
                        className="flex gap-2 rounded-xl border border-slate-200/80 bg-white/60 p-3 text-sm text-slate-700 shadow-sm dark:border-slate-600/60 dark:bg-slate-900/40 dark:text-slate-200"
                        role="note"
                      >
                        <Info className="mt-0.5 size-4 shrink-0 text-slate-500 dark:text-slate-400" />
                        <p>
                          <strong className="font-semibold text-slate-900 dark:text-slate-50">
                            {t('rolesPermissions.generalApprovalStrong')}
                          </strong>{' '}
                          {t('rolesPermissions.generalApprovalRest')}
                        </p>
                      </div>
                      <div className="overflow-x-auto rounded-xl border border-slate-200/70 bg-white/50 dark:border-slate-600/50 dark:bg-slate-900/40">
                        <table className="min-w-[520px] w-full text-left text-sm">
                          <thead>
                            <tr className="border-b border-slate-200/90 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-400">
                              <th className="px-3 py-2 font-semibold">{t('rolesPermissions.rbacCol')}</th>
                              <th className="px-3 py-2 font-semibold">{t('rolesPermissions.approvalCol')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {PERMISSION_TO_APPROVAL_HINT.map((row) => (
                              <tr
                                key={row.permissionId}
                                className="border-b border-slate-200/60 last:border-0 dark:border-slate-700/60"
                              >
                                <td className="px-3 py-2 font-mono text-xs text-slate-800 dark:text-slate-200">
                                  {row.permissionId}
                                </td>
                                <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{row.hint}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : null}

                  {tab === 'permissions' ? (
                    <div className="space-y-4 text-sm">
                      <p className="rounded-lg border border-sky-200/60 bg-sky-50/50 px-2.5 py-2 text-xs text-sky-950 dark:border-sky-800/40 dark:bg-sky-950/30 dark:text-sky-100">
                        {t('rolesPermissions.permissionsFilterHint')}
                      </p>
                      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
                        <label className="min-w-[160px] flex-1">
                          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                            {t('rolesPermissions.permModuleFilter')}
                          </span>
                          <select
                            className={inputCls}
                            value={moduleFilter}
                            onChange={(e) => {
                              setModuleFilter(e.target.value as PermissionModuleKey | 'all')
                              setShowAllRows(false)
                            }}
                            aria-label={t('rolesPermissions.permModuleAria')}
                          >
                            <option value="all">{t('rolesPermissions.filterAllModules')}</option>
                            {PERMISSION_MODULE_ORDER.map((m) => (
                              <option key={m} value={m}>
                                {PERMISSION_MODULE_LABELS[m]}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="min-w-[180px] flex-1">
                          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                            {t('rolesPermissions.permSearch')}
                          </span>
                          <span className="relative mt-1 block">
                            <Search
                              className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-500 dark:text-slate-400"
                              aria-hidden
                            />
                            <input
                              id={`${baseId}-perm-search`}
                              type="search"
                              value={query}
                              onChange={(e) => {
                                setQuery(e.target.value)
                                setShowAllRows(false)
                              }}
                              placeholder={t('rolesPermissions.filterSearchPh')}
                              className={`${inputCls} pl-9`}
                            />
                          </span>
                        </label>
                        <div className="flex flex-wrap items-end gap-2">
                          <label className="min-w-[11rem]">
                            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                              {t('rolesPermissions.templateImport')}
                            </span>
                            <select className={inputCls} value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
                              <option value="">{t('rolesPermissions.templatePick')}</option>
                              {MOCK_ROLE_TEMPLATES.map((tm) => (
                                <option key={tm.id} value={tm.id}>
                                  {tm.label}
                                </option>
                              ))}
                            </select>
                          </label>
                          <button
                            type="button"
                            onClick={applyTemplate}
                            disabled={!templateId}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                          >
                            {t('rolesPermissions.apply')}
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          {t('rolesPermissions.selectAllModule')}
                        </span>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {PERMISSION_MODULE_ORDER.map((mod) => (
                            <button
                              key={mod}
                              type="button"
                              onClick={() => selectAllInModule(mod)}
                              className="rounded-full border border-slate-200/80 bg-white/70 px-2.5 py-1 text-[11px] font-medium text-slate-800 shadow-sm hover:bg-white dark:border-slate-600/60 dark:bg-slate-900/50 dark:text-slate-200 dark:hover:bg-slate-900/70"
                            >
                              + {PERMISSION_MODULE_LABELS[mod]}
                            </button>
                          ))}
                        </div>
                      </div>

                      {role.id === 'admin' ? (
                        <p className="flex items-start gap-2 rounded-lg border border-slate-200/80 bg-slate-100/80 px-2.5 py-2 text-xs text-slate-700 dark:border-slate-600/60 dark:bg-slate-900/50 dark:text-slate-300">
                          <Lock className="mt-0.5 size-3.5 shrink-0" strokeWidth={2} aria-hidden />
                          {t('rolesPermissions.adminLockedNote')}
                        </p>
                      ) : role.lockedPermissionIds?.length ? (
                        <p className="rounded-lg border border-amber-200/80 bg-amber-50/90 px-2.5 py-2 text-xs text-amber-950 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-100">
                          {t('rolesPermissions.roleLockedNote')}
                        </p>
                      ) : null}

                      {dependencyWarning ? (
                        <div
                          className="rounded-xl border border-amber-300/90 bg-amber-50 px-3 py-2.5 text-xs text-amber-950 shadow-sm dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-100"
                          role="status"
                        >
                          <strong className="font-semibold">{t('rolesPermissions.depWarningTitle')}</strong>{' '}
                          {t('rolesPermissions.depWarningBody')}
                        </div>
                      ) : null}

                      <div className="overflow-x-auto rounded-xl border border-slate-200/70 bg-white/50 dark:border-slate-600/50 dark:bg-slate-900/40">
                        <table className="min-w-[520px] w-full text-left text-sm">
                          <thead>
                            <tr className="border-b border-slate-200/90 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-400">
                              <th className="w-10 px-2 py-2 font-semibold">{t('rolesPermissions.colCheck')}</th>
                              <th className="px-2 py-2 font-semibold">{t('rolesPermissions.colPerm')}</th>
                              <th className="px-2 py-2 font-semibold">{t('rolesPermissions.colModule')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {visibleRows.map((p) => {
                              const locked = isPermissionLockedForRole(role, p.id)
                              return (
                                <tr
                                  key={p.id}
                                  className={[
                                    'border-b border-slate-200/60 last:border-0 dark:border-slate-700/60',
                                    locked ? 'bg-slate-100/50 dark:bg-slate-900/60' : '',
                                  ].join(' ')}
                                >
                                  <td className="px-2 py-2 align-top">
                                    <input
                                      type="checkbox"
                                      className="size-4 rounded accent-sky-600 disabled:cursor-not-allowed dark:accent-sky-400"
                                      checked={permSet.has(p.id)}
                                      disabled={locked}
                                      onChange={(e) => togglePerm(p.id, e.target.checked)}
                                      aria-labelledby={`${baseId}-perm-${p.id}`}
                                    />
                                  </td>
                                  <td className="px-2 py-2">
                                    <span
                                      id={`${baseId}-perm-${p.id}`}
                                      className="font-mono text-xs text-slate-900 dark:text-slate-100"
                                    >
                                      {p.id}
                                    </span>
                                    <span className="mt-0.5 block text-[11px] text-slate-600 dark:text-slate-400">{p.label}</span>
                                    {locked ? (
                                      <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 dark:text-slate-400">
                                        <Lock className="size-3" strokeWidth={2} aria-hidden />
                                        {t('rolesPermissions.lockedLabel')}
                                      </span>
                                    ) : null}
                                  </td>
                                  <td className="px-2 py-2 text-slate-700 dark:text-slate-300">
                                    {PERMISSION_MODULE_LABELS[p.module]}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>

                      {!showAllRows && remaining > 0 ? (
                        <button
                          type="button"
                          onClick={() => setShowAllRows(true)}
                          className="text-xs font-semibold text-sky-800 underline decoration-sky-400/60 underline-offset-2 hover:text-sky-900 dark:text-sky-200 dark:hover:text-sky-100"
                        >
                          {t('rolesPermissions.showAll').replace('{{count}}', String(remaining))}
                        </button>
                      ) : showAllRows && filteredPerms.length > 8 ? (
                        <button
                          type="button"
                          onClick={() => setShowAllRows(false)}
                          className="text-xs font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
                        >
                          {t('rolesPermissions.collapseEight')}
                        </button>
                      ) : null}

                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('rolesPermissions.footnoteModuleFilter')}</p>
                    </div>
                  ) : null}

                  {tab === 'users' ? (
                    <div>
                      <div className="mb-3 flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <Users className="size-4 text-slate-600 dark:text-slate-400" strokeWidth={1.75} />
                        <span>
                          {t('rolesPermissions.userCountMock')}{' '}
                          <strong className="font-semibold text-slate-900 dark:text-slate-50">{role.userCount ?? 0}</strong>
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {(MOCK_ROLE_USERS[roleId] ?? []).map((u) => (
                          <li
                            key={u.email}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200/70 bg-white/50 px-3 py-2.5 dark:border-slate-600/50 dark:bg-slate-900/40"
                          >
                            <span className="font-medium text-slate-900 dark:text-slate-50">{u.name}</span>
                            <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400">{u.email}</span>
                          </li>
                        ))}
                        {(MOCK_ROLE_USERS[roleId] ?? []).length === 0 ? (
                          <li className="rounded-lg border border-dashed border-slate-300/60 px-3 py-3 text-sm text-slate-600 dark:border-slate-600 dark:text-slate-400">
                            {t('rolesPermissions.noSampleUsers')}
                          </li>
                        ) : null}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('rolesPermissions.selectHint')}</p>
            )}
          </div>
        }
      />

      {deleteOpen && role && !role.isSystem ? (
        <PmStyleDialog
          title={t('rolesPermissions.dialogDeleteTitle')}
          subtitle={t('rolesPermissions.dialogDeleteSubtitle')}
          closeLabel={t('rolesPermissions.cancel')}
          onClose={() => setDeleteOpen(false)}
          footer={
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 dark:border-slate-600 dark:text-slate-200"
              >
                {t('rolesPermissions.cancel')}
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-lg border border-rose-300 bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700 dark:border-rose-700 dark:bg-rose-700 dark:hover:bg-rose-600"
              >
                {t('rolesPermissions.confirm')}
              </button>
            </div>
          }
        >
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {t('rolesPermissions.dialogDeleteBody').replace('{{label}}', role.label)}
          </p>
        </PmStyleDialog>
      ) : null}
    </>
  )
}
