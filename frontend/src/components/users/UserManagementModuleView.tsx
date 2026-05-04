import { useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Factory,
  KeyRound,
  Mail,
  ShieldOff,
  User,
  UserPlus,
} from 'lucide-react'
import { MOCK_ROLES } from '../../data/mockRbac'
import { directReportsCount, isValidReportsTo } from '../../data/orgHierarchy'
import { roleLabel, userNameById } from '../../data/mockUsers'
import { useI18n } from '../../i18n/I18nProvider'
import { PmStyleDialog } from '../shared/PmStyleDialog'
import { FilterToolbarSearch } from '../shared/FilterToolbarSearch'
import {
  eiSplitHeaderButtonPassive,
  ElementIdentityFilterSheetHeader,
  ElementIdentityPieceCodesLikeSplit,
} from '../elementIdentity/ElementIdentityPieceCodesLikeSplit'
import '../muhendislikOkan/engineeringOkanLiquid.css'
import type { UserManagementState } from './useUserManagementState'

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

export function UserManagementModuleView(props: UserManagementState) {
  const { t, locale } = useI18n()
  const baseId = useId()
  const rightRef = useRef<HTMLDivElement | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)

  const scrollPanelTop = () => {
    requestAnimationFrame(() => rightRef.current?.scrollTo({ top: 0, behavior: 'auto' }))
  }

  const {
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
    deactivateOpen,
    setDeactivateOpen,
    updateUser,
    toggleRole,
    toggleFactory,
    confirmDeactivate,
    mockPasswordReset,
    mockSave,
    addMockUser,
  } = props

  return (
    <>
      <ElementIdentityPieceCodesLikeSplit
        persistKey="user-management"
        listTitle={t('userManagement.listTitle')}
        filterToolbarSearch={
          <FilterToolbarSearch
            id="user-management-list-search"
            value={searchQuery}
            onValueChange={setSearchQuery}
            placeholder={t('userManagement.filterSearchPh')}
            ariaLabel={t('userManagement.filterSearch')}
          />
        }
        headerActions={
          <>
            <button type="button" onClick={addMockUser} className={eiSplitHeaderButtonPassive}>
              <UserPlus className="size-3.5 shrink-0" aria-hidden />
              {t('userManagement.newUser')}
            </button>
            <Link
              to="/kullanicilar?legacy=1"
              className={`${eiSplitHeaderButtonPassive} no-underline`}
            >
              {t('userManagement.legacyLink')}
            </Link>
          </>
        }
        isFilterOpen={filterOpen}
        onFilterOpenChange={setFilterOpen}
        filterAside={
          <div>
            <ElementIdentityFilterSheetHeader
              title={t('userManagement.filtersTitle')}
              subtitle={t('userManagement.filtersSubtitle')}
              onClose={() => setFilterOpen(false)}
            />
            <div className="grid gap-2.5">
              <label>
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  {t('userManagement.filterSearch')}
                </span>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('userManagement.filterSearchPh')}
                  autoComplete="off"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                />
              </label>
              <label>
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  {t('userManagement.filterRole')}
                </span>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                >
                  <option value="">{t('userManagement.filterAll')}</option>
                  {MOCK_ROLES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  {t('userManagement.filterStatus')}
                </span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                >
                  <option value="all">{t('userManagement.filterAll')}</option>
                  <option value="active">{t('userManagement.statusActive')}</option>
                  <option value="inactive">{t('userManagement.statusInactive')}</option>
                </select>
              </label>
              <label>
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  {t('userManagement.filterFactory')}
                </span>
                <select
                  value={filterFactory}
                  onChange={(e) => setFilterFactory(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                >
                  <option value="">{t('userManagement.filterAll')}</option>
                  {factories.map((f) => (
                    <option key={f.code} value={f.code}>
                      {f.code}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-3 flex justify-end border-t border-slate-200/60 pt-2 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setFilterRole('')
                  setFilterStatus('all')
                  setFilterFactory('')
                }}
                className="rounded-md border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200"
              >
                {t('elementIdentity.reset')}
              </button>
            </div>
          </div>
        }
        listBody={
          filtered.length === 0 ? (
            <li className="rounded-lg border border-dashed border-slate-300/60 bg-white/30 px-3 py-8 text-center text-xs text-slate-500 dark:border-slate-600 dark:bg-slate-900/20">
              {t('userManagement.emptyList')}
            </li>
          ) : (
            filtered.map((u) => (
              <li key={u.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(u.id)
                    scrollPanelTop()
                  }}
                  className={`flex w-full flex-col gap-1 rounded-lg border px-2.5 py-2 text-left text-xs transition ${
                    selectedId === u.id
                      ? 'border-sky-400/60 bg-sky-500/10 dark:border-sky-500/40 dark:bg-sky-500/15'
                      : 'border-slate-200/50 bg-white/40 hover:bg-white/70 dark:border-slate-700/50 dark:bg-slate-900/30 dark:hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-semibold text-slate-900 dark:text-slate-50">{u.name}</span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        u.active
                          ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200'
                          : 'bg-slate-400/20 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {u.active ? t('userManagement.statusActive') : t('userManagement.statusInactive')}
                    </span>
                  </div>
                  <span className="truncate font-mono text-[11px] text-slate-600 dark:text-slate-400">{u.email}</span>
                  <div className="flex flex-wrap gap-1">
                    {u.roleIds.slice(0, 3).map((rid) => (
                      <span
                        key={rid}
                        className="rounded-full bg-slate-200/80 px-1.5 py-0.5 text-[10px] font-medium text-slate-800 dark:bg-slate-700 dark:text-slate-100"
                      >
                        {roleLabel(rid)}
                      </span>
                    ))}
                    {u.roleIds.length > 3 ? (
                      <span className="text-[10px] text-slate-500">+{u.roleIds.length - 3}</span>
                    ) : null}
                  </div>
                  <span className="text-[10px] text-slate-500">{u.lastLogin}</span>
                </button>
              </li>
            ))
          )
        }
        footer={
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-slate-600 dark:text-slate-300">
            <p>
              <span className="tabular-nums font-semibold text-slate-800 dark:text-slate-100">{filtered.length}</span>{' '}
              {t('userManagement.footerCount')}
            </p>
          </div>
        }
        rightPanelRef={rightRef}
        rightAside={
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <p className="mb-2 shrink-0 px-0.5 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 sm:px-1">
              {t('userManagement.intro')}
            </p>
            {selected ? (
              <div className="flex h-full min-h-0 flex-col">
                <header className="shrink-0 border-b border-slate-200/25 pb-3 text-center dark:border-white/10">
                  <h3 className="font-mono text-xl font-semibold text-slate-900 dark:text-slate-50">{selected.name}</h3>
                  <p className="mt-1 font-mono text-xs text-slate-600 dark:text-slate-400">{selected.email}</p>
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                    {selected.inviteStatus === 'sent' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-900 dark:text-emerald-200">
                        <Mail className="size-3" aria-hidden />
                        {t('userManagement.badgeInviteSent')}
                      </span>
                    ) : selected.inviteStatus === 'pending' ? (
                      <span className="inline-flex rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-900 dark:text-amber-200">
                        {t('userManagement.badgeInvitePending')}
                      </span>
                    ) : null}
                    {!selected.active ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-400/20 px-2 py-0.5 text-[11px] font-medium text-slate-800 dark:text-slate-200">
                        <ShieldOff className="size-3" aria-hidden />
                        {t('userManagement.badgeInactive')}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    <button
                      type="button"
                      disabled={!selected.active}
                      onClick={() => mockPasswordReset(t('userManagement.toastPassword'))}
                      className={eiSplitHeaderButtonPassive}
                    >
                      <KeyRound className="size-3.5 shrink-0" aria-hidden />
                      {t('userManagement.passwordReset')}
                    </button>
                    <button
                      type="button"
                      disabled={!selected.active}
                      onClick={() => setDeactivateOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300/70 bg-rose-50/90 px-2 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-100 disabled:opacity-40 dark:border-rose-600/60 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-950/60"
                    >
                      {t('userManagement.deactivate')}
                    </button>
                  </div>
                </header>

                {!selected.active ? (
                  <div className="mt-3 flex shrink-0 gap-2 rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-xs text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/35 dark:text-amber-100">
                    <AlertTriangle className="size-3.5 shrink-0" aria-hidden />
                    <p>
                      <strong className="font-semibold">{t('userManagement.inactiveWarningTitle')}</strong>{' '}
                      {t('userManagement.inactiveWarningBody')}
                    </p>
                  </div>
                ) : null}

                <div className="sticky top-0 z-10 flex w-full shrink-0 justify-center pt-3">
                  <div className="flex max-w-full gap-1 overflow-x-auto" role="tablist">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={detailTab === 'profile'}
                      onClick={() => {
                        setDetailTab('profile')
                        scrollPanelTop()
                      }}
                      className={tabPill(detailTab === 'profile')}
                    >
                      <span className="inline-flex items-center gap-1">
                        <User className="size-3.5" aria-hidden />
                        {t('userManagement.tabProfile')}
                      </span>
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={detailTab === 'roles'}
                      onClick={() => {
                        setDetailTab('roles')
                        scrollPanelTop()
                      }}
                      className={tabPill(detailTab === 'roles')}
                    >
                      {t('userManagement.tabRoles')}
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={detailTab === 'factories'}
                      onClick={() => {
                        setDetailTab('factories')
                        scrollPanelTop()
                      }}
                      className={tabPill(detailTab === 'factories')}
                    >
                      <span className="inline-flex items-center gap-1">
                        <Factory className="size-3.5" aria-hidden />
                        {t('userManagement.tabFactories')}
                      </span>
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={detailTab === 'sessions'}
                      onClick={() => {
                        setDetailTab('sessions')
                        scrollPanelTop()
                      }}
                      className={tabPill(detailTab === 'sessions')}
                    >
                      {t('userManagement.tabSessions')}
                    </button>
                  </div>
                </div>

                <div
                  role="tabpanel"
                  className="okan-project-tab-panel mt-3 min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-0.5 text-left sm:px-1"
                >
                  {detailTab === 'profile' && (
                    <div className="space-y-3 text-sm">
                      <label className="block">
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                          {t('userManagement.fieldFullName')}
                        </span>
                        <input
                          className={inputCls}
                          disabled={!selected.active}
                          value={selected.name}
                          onChange={(e) => updateUser(selected.id, { name: e.target.value })}
                        />
                      </label>
                      <label className="block">
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                          {t('userManagement.fieldEmail')}
                        </span>
                        <input
                          className={inputCls}
                          disabled={!selected.active}
                          type="email"
                          value={selected.email}
                          onChange={(e) => updateUser(selected.id, { email: e.target.value })}
                        />
                      </label>
                      <label className="block">
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                          {t('userManagement.fieldTitle')}
                        </span>
                        <input
                          className={inputCls}
                          disabled={!selected.active}
                          value={selected.title}
                          onChange={(e) => updateUser(selected.id, { title: e.target.value })}
                        />
                      </label>

                      <div className="rounded-xl border border-slate-200/70 bg-white/50 p-3 dark:border-slate-600/50 dark:bg-slate-900/40">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          {t('userManagement.orgSectionTitle')}
                        </p>
                        <label className="mt-2 block">
                          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                            {t('userManagement.orgManager')}
                          </span>
                          <select
                            className={inputCls}
                            disabled={!selected.active}
                            value={selected.reportsToId ?? ''}
                            onChange={(e) => {
                              const v = e.target.value === '' ? null : e.target.value
                              if (!isValidReportsTo(selected.id, v, users)) return
                              updateUser(selected.id, { reportsToId: v })
                            }}
                          >
                            <option value="">{t('userManagement.orgRootOption')}</option>
                            {users
                              .filter((u) => u.id !== selected.id)
                              .map((u) => (
                                <option
                                  key={u.id}
                                  value={u.id}
                                  disabled={!isValidReportsTo(selected.id, u.id, users)}
                                >
                                  {u.name}
                                </option>
                              ))}
                          </select>
                        </label>
                        <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                          {selected.reportsToId ? (
                            <>
                              {t('userManagement.orgReportsTo').replace(
                                '{{name}}',
                                userNameById(selected.reportsToId, users),
                              )}
                            </>
                          ) : (
                            t('userManagement.orgRoot')
                          )}
                        </p>
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{t('userManagement.orgCycleHint')}</p>
                        <label className="mt-3 block">
                          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                            {t('userManagement.workStatus')}
                          </span>
                          <input
                            className={inputCls}
                            disabled={!selected.active}
                            value={selected.workStatusLine ?? ''}
                            placeholder={t('userManagement.workStatusPh')}
                            onChange={(e) => updateUser(selected.id, { workStatusLine: e.target.value })}
                          />
                        </label>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-slate-200/90 px-2.5 py-1 text-[11px] font-semibold text-slate-800 dark:bg-slate-700 dark:text-slate-100">
                            {t('userManagement.directReports').replace(
                              '{{count}}',
                              String(directReportsCount(selected.id, users)),
                            )}
                          </span>
                        </div>
                        {directReportsCount(selected.id, users) > 0 ? (
                          <pre
                            className="mt-2 overflow-x-auto rounded-lg border border-slate-200/60 bg-slate-50/80 p-2 font-mono text-[10px] leading-relaxed text-slate-700 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-300"
                            aria-label={locale === 'en' ? 'Mini org preview' : 'Mini org önizleme'}
                          >
                            {userNameById(selected.id, users)}
                            {'\n'}
                            {users
                              .filter((u) => u.reportsToId === selected.id)
                              .map((ch, i, arr) => {
                                const branch = i === arr.length - 1 ? '└' : '├'
                                return `${branch}── ${ch.name}\n`
                              })
                              .join('')}
                          </pre>
                        ) : null}
                        <label className="mt-3 block cursor-not-allowed opacity-60" title="P2">
                          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            {t('userManagement.matrixLabel')}
                          </span>
                          <select className={inputCls} disabled value="">
                            <option value="">{t('userManagement.matrixDisabled')}</option>
                          </select>
                        </label>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t('userManagement.prototypeNote')}</p>
                    </div>
                  )}

                  {detailTab === 'roles' && (
                    <ul className="space-y-2">
                      {MOCK_ROLES.map((r) => (
                        <li key={r.id}>
                          <label
                            className={[
                              'flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200/60 bg-white/60 px-3 py-2.5 dark:border-slate-600/50 dark:bg-slate-900/40',
                              !selected.active ? 'cursor-not-allowed opacity-60' : '',
                            ].join(' ')}
                          >
                            <input
                              type="checkbox"
                              className="size-4 rounded border-slate-300 accent-sky-600 disabled:opacity-50 dark:border-slate-600"
                              checked={selected.roleIds.includes(r.id)}
                              disabled={!selected.active}
                              onChange={() => toggleRole(selected.id, r.id)}
                              id={`${baseId}-role-${r.id}`}
                            />
                            <span className="text-sm text-slate-900 dark:text-slate-50">{r.label}</span>
                            {r.isSystem ? (
                              <span className="ml-auto text-[10px] font-medium uppercase text-slate-500 dark:text-slate-400">
                                {t('userManagement.roleSystem')}
                              </span>
                            ) : null}
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}

                  {detailTab === 'factories' && (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-600 dark:text-slate-400">{t('userManagement.factoriesHint')}</p>
                      <ul className="space-y-2">
                        {factories.map((f) => (
                          <li key={f.code}>
                            <label
                              className={[
                                'flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200/60 bg-white/60 px-3 py-2.5 dark:border-slate-600/50 dark:bg-slate-900/40',
                                !selected.active ? 'cursor-not-allowed opacity-60' : '',
                              ].join(' ')}
                            >
                              <input
                                type="checkbox"
                                className="size-4 rounded border-slate-300 accent-sky-600 disabled:opacity-50 dark:border-slate-600"
                                checked={selected.factoryCodes.includes(f.code)}
                                disabled={!selected.active}
                                onChange={() => toggleFactory(selected.id, f.code)}
                              />
                              <span className="text-sm font-medium text-slate-900 dark:text-slate-50">
                                {f.code} — {f.name}
                              </span>
                            </label>
                          </li>
                        ))}
                      </ul>
                      <label className="block">
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                          {t('userManagement.defaultFactory')}
                        </span>
                        <select
                          className={inputCls}
                          disabled={!selected.active}
                          value={selected.defaultFactoryCode}
                          onChange={(e) => updateUser(selected.id, { defaultFactoryCode: e.target.value })}
                        >
                          {selected.factoryCodes.map((c) => {
                            const f = factories.find((x) => x.code === c)
                            return (
                              <option key={c} value={c}>
                                {f ? `${f.code} · ${f.city}` : c}
                              </option>
                            )
                          })}
                        </select>
                      </label>
                    </div>
                  )}

                  {detailTab === 'sessions' && (
                    <div>
                      <p className="mb-3 text-xs text-slate-600 dark:text-slate-400">{t('userManagement.sessionsHint')}</p>
                      {selected.sessions.length === 0 ? (
                        <p className="text-sm text-slate-500 dark:text-slate-400">{t('userManagement.sessionsEmpty')}</p>
                      ) : (
                        <ul className="space-y-2">
                          {selected.sessions.map((s) => (
                            <li
                              key={s.id}
                              className="rounded-xl border border-slate-200/60 bg-white/60 px-3 py-2.5 text-sm dark:border-slate-600/50 dark:bg-slate-900/40"
                            >
                              <p className="font-medium text-slate-900 dark:text-slate-50">{s.device}</p>
                              <p className="text-xs text-slate-600 dark:text-slate-400">
                                {s.location} · {t('userManagement.sessionLast')}: {s.lastActivity}
                              </p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-auto shrink-0 border-t border-slate-200/60 pt-3 dark:border-slate-700/60">
                  <button
                    type="button"
                    disabled={!selected.active}
                    onClick={() => mockSave(t('userManagement.toastSaved'))}
                    className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                  >
                    {t('userManagement.save')}
                  </button>
                </div>
              </div>
            ) : (
              <p className="px-1 text-center text-xs text-slate-500 dark:text-slate-400">{t('userManagement.selectHint')}</p>
            )}
          </div>
        }
      />

      {toast ? (
        <div
          className="fixed bottom-6 left-1/2 z-[80] max-w-md -translate-x-1/2 rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-3 text-sm font-medium text-slate-900 shadow-lg dark:border-slate-600 dark:bg-slate-900 dark:text-slate-50"
          role="status"
        >
          {toast}
        </div>
      ) : null}

      {deactivateOpen && selected ? (
        <PmStyleDialog
          title={t('userManagement.deactivateTitle')}
          closeLabel={t('userManagement.cancel')}
          onClose={() => setDeactivateOpen(false)}
          maxWidthClass="max-w-md"
          footer={
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeactivateOpen(false)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold dark:border-slate-600"
              >
                {t('userManagement.cancel')}
              </button>
              <button
                type="button"
                className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                onClick={() => confirmDeactivate(t('userManagement.toastDeactivated'))}
              >
                {t('userManagement.confirm')}
              </button>
            </div>
          }
        >
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {t('userManagement.deactivateBody').replace('{{name}}', selected.name)}
          </p>
        </PmStyleDialog>
      ) : null}
    </>
  )
}
