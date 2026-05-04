import { useId } from 'react'
import { Info, Lock, Search, Shield, Trash2, Users } from 'lucide-react'
import {
  MOCK_ROLE_TEMPLATES,
  PERMISSION_MODULE_LABELS,
  PERMISSION_TO_APPROVAL_HINT,
  isPermissionLockedForRole,
  type PermissionModuleKey,
} from '../../data/mockRbac'
import type { RolesPermissionsState } from './useRolesPermissionsState'

const inset =
  'w-full rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm text-gray-900 shadow-neo-in placeholder:text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100'
const tabBtn = (active: boolean) =>
  [
    'rounded-xl px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:ring-offset-gray-900',
    active
      ? 'bg-gray-800 text-white shadow-neo-out-sm dark:bg-gray-200 dark:text-gray-900'
      : 'bg-gray-100 text-gray-700 shadow-neo-out-sm hover:text-gray-900 dark:bg-gray-800 dark:text-gray-200 dark:hover:text-white',
  ].join(' ')

/** Eski neo/gri düzen — karşılaştırma için `?legacy=1`. */
export function RolesAndPermissionsViewLegacy(props: RolesPermissionsState) {
  const baseId = useId()
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

  const deleteRole = () => {
    if (!role || role.isSystem) return
    const ok = window.confirm(`“${role.label}” rolü silinsin mi? (prototip — mock kullanıcı atamaları da temizlenir.)`)
    if (!ok) return
    removeCurrentRole()
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 lg:flex-row">
      <aside className="flex w-full shrink-0 flex-col rounded-2xl bg-gray-50 p-3 shadow-neo-out-sm dark:bg-gray-950/80 lg:w-56 xl:w-64">
        <h2 className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Roller
        </h2>
        <ul className="flex max-h-[40vh] flex-col gap-1 overflow-y-auto lg:max-h-[min(60vh,28rem)]">
          {roles.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                title={r.isSystem ? 'Sistem rolü — silinemez' : undefined}
                onClick={() => {
                  setRoleId(r.id)
                  setTab('general')
                }}
                className={[
                  'flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition',
                  r.id === roleId
                    ? 'bg-gray-800 text-white shadow-neo-out-sm dark:bg-gray-200 dark:text-gray-900'
                    : 'bg-gray-100 text-gray-800 shadow-neo-in hover:text-gray-900 dark:bg-gray-900 dark:text-gray-100 dark:hover:text-white',
                ].join(' ')}
              >
                <span className="truncate">{r.label}</span>
                {r.isSystem ? (
                  <Shield className="size-4 shrink-0 opacity-80" strokeWidth={1.75} aria-hidden />
                ) : null}
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-3 space-y-2 border-t border-gray-200/90 pt-3 dark:border-gray-700/90">
          <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Yeni rol (mock)
          </p>
          <label className="block px-1">
            <span className="sr-only">Rol adı</span>
            <input
              type="text"
              value={newRoleLabel}
              onChange={(e) => setNewRoleLabel(e.target.value)}
              placeholder="Rol adı"
              className={`${inset} text-sm`}
            />
          </label>
          <label className="block px-1">
            <span className="sr-only">Açıklama</span>
            <input
              type="text"
              value={newRoleDesc}
              onChange={(e) => setNewRoleDesc(e.target.value)}
              placeholder="Kısa açıklama (isteğe bağlı)"
              className={`${inset} text-sm`}
            />
          </label>
          <button
            type="button"
            onClick={addRole}
            disabled={!newRoleLabel.trim()}
            className="w-full rounded-xl bg-gray-800 px-3 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm transition hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white"
          >
            Rol oluştur
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col rounded-2xl bg-gray-50 p-5 shadow-neo-out-sm dark:bg-gray-950/80">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-200/90 pb-4 dark:border-gray-700/90">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Seçili rol
            </p>
            <h2 className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-50">{role?.label}</h2>
            {role?.isSystem ? (
              <p className="mt-2 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <Lock className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
                Sistem rolü — silinemez; izinlerde kilitli satırlar değiştirilemez (mock).
              </p>
            ) : (
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                Özel rol — silinebilir; izinler bu oturumda yerel tutulur (prototip).
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!role?.isSystem ? (
              <button
                type="button"
                onClick={deleteRole}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200/90 bg-red-50 px-3 py-2 text-sm font-medium text-red-900 shadow-neo-out-sm transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:border-red-900/80 dark:bg-red-950/50 dark:text-red-100 dark:hover:bg-red-950/80"
              >
                <Trash2 className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
                Rolü sil
              </button>
            ) : null}
            <div className="flex flex-wrap gap-2 rounded-2xl bg-gray-100 p-1 shadow-neo-in dark:bg-gray-900/80">
              <button type="button" className={tabBtn(tab === 'general')} onClick={() => setTab('general')}>
                Genel
              </button>
              <button
                type="button"
                className={tabBtn(tab === 'permissions')}
                onClick={() => setTab('permissions')}
              >
                İzinler
              </button>
              <button type="button" className={tabBtn(tab === 'users')} onClick={() => setTab('users')}>
                Bu role atanmış kullanıcılar
              </button>
            </div>
          </div>
        </div>

        {tab === 'general' ? (
          <div className="mt-5 space-y-5">
            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{role?.description}</p>
            <div
              className="flex gap-2 rounded-2xl border border-gray-200/90 bg-gray-100/80 p-4 text-sm text-gray-700 shadow-neo-in dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-200"
              role="note"
            >
              <Info className="mt-0.5 size-4 shrink-0 text-gray-600 dark:text-gray-400" />
              <p>
                <strong className="font-semibold text-gray-900 dark:text-gray-50">Onay akışı (mvp-02) ile ilişki:</strong>{' '}
                RBAC ekranı <em>hangi butonlara basılabileceğini</em> tanımlar; onay akışı <em>kimin sırayla</em> onayladığını.
                İkisi birlikte çalışır; biri diğerinin yerine geçmez.
              </p>
            </div>
            <div className="overflow-x-auto rounded-2xl bg-gray-100 shadow-neo-in dark:bg-gray-900/80">
              <table className="min-w-[520px] w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200/90 text-xs uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    <th className="px-4 py-3 font-semibold">Atomik izin (RBAC)</th>
                    <th className="px-4 py-3 font-semibold">Onay akışındaki karşılık (mock)</th>
                  </tr>
                </thead>
                <tbody>
                  {PERMISSION_TO_APPROVAL_HINT.map((row) => (
                    <tr
                      key={row.permissionId}
                      className="border-b border-gray-200/80 last:border-0 dark:border-gray-700/80"
                    >
                      <td className="px-4 py-2.5 font-mono text-xs text-gray-800 dark:text-gray-200">
                        {row.permissionId}
                      </td>
                      <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">{row.hint}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {tab === 'permissions' ? (
          <div className="mt-5 space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
              <label className="min-w-[180px] flex-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Modüle göre filtre
                </span>
                <select
                  className={`${inset} mt-1.5`}
                  value={moduleFilter}
                  onChange={(e) => {
                    setModuleFilter(e.target.value as PermissionModuleKey | 'all')
                    setShowAllRows(false)
                  }}
                  aria-label="İzin listesini modüle göre filtrele"
                >
                  <option value="all">Tüm modüller</option>
                  {PERMISSION_MODULE_ORDER.map((m) => (
                    <option key={m} value={m}>
                      {PERMISSION_MODULE_LABELS[m]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="min-w-[200px] flex-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  İzin ara
                </span>
                <span className="relative mt-1.5 block">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-500 dark:text-gray-400"
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
                    placeholder="örn. teklif, uretim, kayit…"
                    className={`${inset} pl-10`}
                  />
                </span>
              </label>
              <div className="flex flex-wrap items-end gap-2">
                <label className="min-w-[12rem]">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                    Rol şablonu içe aktar
                  </span>
                  <select
                    className={`${inset} mt-1.5`}
                    value={templateId}
                    onChange={(e) => setTemplateId(e.target.value)}
                  >
                    <option value="">— Şablon seçin —</option>
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
                  className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-800 shadow-neo-out-sm transition hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-100 dark:hover:text-white"
                >
                  Uygula
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="w-full text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Modülün tüm izinlerini seç (mevcut filtreye bakmaz)
              </span>
              <div className="flex w-full flex-wrap gap-1.5">
                {PERMISSION_MODULE_ORDER.map((mod) => (
                  <button
                    key={mod}
                    type="button"
                    onClick={() => selectAllInModule(mod)}
                    className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-800 shadow-neo-in transition hover:text-gray-900 dark:bg-gray-900 dark:text-gray-200 dark:hover:text-white"
                  >
                    + {PERMISSION_MODULE_LABELS[mod]}
                  </button>
                ))}
              </div>
            </div>

            {role?.id === 'admin' ? (
              <p className="rounded-xl bg-gray-100/90 px-3 py-2 text-xs text-gray-600 shadow-neo-in dark:bg-gray-900/70 dark:text-gray-300">
                <Lock className="mr-1 inline size-3.5 align-text-bottom text-gray-500" strokeWidth={2} aria-hidden />
                Yönetici rolünde tüm izinler kilitli — liste salt okunur (mock).
              </p>
            ) : role?.lockedPermissionIds?.length ? (
              <p className="rounded-xl bg-amber-50/90 px-3 py-2 text-xs text-amber-950 shadow-neo-in dark:bg-amber-950/40 dark:text-amber-100">
                Bu rolde bazı izinler sabit: kapatılamaz (ör. salt okunur görünürlükler).
              </p>
            ) : null}

            {dependencyWarning ? (
              <div
                className="rounded-2xl border border-amber-300/90 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-neo-in dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-100"
                role="status"
              >
                <strong className="font-semibold">P2 — Bağımlılık uyarısı (mock):</strong>{' '}
                <span className="font-mono">teklif.onayla</span> seçildi; genelde{' '}
                <span className="font-mono">teklif.goruntule</span> de verilir. Üretimde otomatik ek önerisi veya
                onay politikası bağlanabilir.
              </div>
            ) : null}

            <div className="overflow-x-auto rounded-2xl bg-gray-100 shadow-neo-in dark:bg-gray-900/80">
              <table className="min-w-[560px] w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200/90 text-xs uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    <th className="w-12 px-3 py-3 font-semibold"> </th>
                    <th className="px-3 py-3 font-semibold">İzin</th>
                    <th className="px-3 py-3 font-semibold">Modül</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((p) => {
                    const locked = role ? isPermissionLockedForRole(role, p.id) : false
                    return (
                      <tr
                        key={p.id}
                        className={[
                          'border-b border-gray-200/80 last:border-0 dark:border-gray-700/80',
                          locked ? 'bg-gray-200/40 dark:bg-gray-900/50' : '',
                        ].join(' ')}
                      >
                        <td className="px-3 py-2.5 align-top">
                          <input
                            type="checkbox"
                            className="size-4 rounded accent-gray-800 disabled:cursor-not-allowed dark:accent-gray-200"
                            checked={permSet.has(p.id)}
                            disabled={locked}
                            onChange={(e) => togglePerm(p.id, e.target.checked)}
                            aria-labelledby={`${baseId}-perm-${p.id}`}
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            id={`${baseId}-perm-${p.id}`}
                            className="font-mono text-xs text-gray-800 dark:text-gray-100"
                          >
                            {p.id}
                          </span>
                          <span className="mt-0.5 block text-xs text-gray-600 dark:text-gray-400">{p.label}</span>
                          {locked ? (
                            <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-gray-600 dark:text-gray-400">
                              <Lock className="size-3" strokeWidth={2} aria-hidden />
                              Sabit (kapatılamaz)
                            </span>
                          ) : null}
                        </td>
                        <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">
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
                className="text-sm font-medium text-gray-800 underline decoration-gray-400 underline-offset-2 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
              >
                Tümünü göster (+{remaining} izin)
              </button>
            ) : showAllRows && filteredPerms.length > 8 ? (
              <button
                type="button"
                onClick={() => setShowAllRows(false)}
                className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                İlk 8 satıra dön
              </button>
            ) : null}

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Modül filtresi yalnızca listeyi daraltır; “+ Modül” toplu seçimi tüm izin kümesine uygulanır. Sistem rolleri
              veya sabit izinler kilitlidir.
            </p>
          </div>
        ) : null}

        {tab === 'users' ? (
          <div className="mt-5">
            <div className="mb-4 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <Users className="size-4 text-gray-600 dark:text-gray-400" strokeWidth={1.75} />
              <span>
                Atanan kullanıcı sayısı (mock):{' '}
                <strong className="font-semibold text-gray-900 dark:text-gray-50">{role?.userCount ?? 0}</strong>
              </span>
            </div>
            <ul className="space-y-2">
              {(MOCK_ROLE_USERS[roleId] ?? []).map((u) => (
                <li
                  key={u.email}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-gray-100 px-4 py-3 shadow-neo-in dark:bg-gray-900/80"
                >
                  <span className="font-medium text-gray-900 dark:text-gray-50">{u.name}</span>
                  <span className="font-mono text-xs text-gray-600 dark:text-gray-400">{u.email}</span>
                </li>
              ))}
              {(MOCK_ROLE_USERS[roleId] ?? []).length === 0 ? (
                <li className="rounded-xl bg-gray-100 px-4 py-3 text-sm text-gray-600 shadow-neo-in dark:bg-gray-900/80 dark:text-gray-400">
                  Bu rol için örnek kullanıcı yok (yeni rol veya mock boş).
                </li>
              ) : null}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  )
}
