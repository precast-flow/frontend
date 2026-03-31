import { useEffect, useId, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Factory,
  KeyRound,
  Mail,
  ShieldOff,
  User,
  UserPlus,
} from 'lucide-react'
import { useFactoryContext } from '../../context/FactoryContext'
import { MOCK_ROLES } from '../../data/mockRbac'
import { directReportsCount, isValidReportsTo } from '../../data/orgHierarchy'
import {
  MOCK_MANAGED_USERS,
  roleLabel,
  userNameById,
  type MockManagedUser,
} from '../../data/mockUsers'

const inset =
  'w-full rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100'
const tabBtn = (on: boolean) =>
  [
    'rounded-xl px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:ring-offset-gray-900',
    on
      ? 'bg-gray-800 text-white shadow-neo-out-sm dark:bg-gray-200 dark:text-gray-900'
      : 'bg-gray-100 text-gray-700 shadow-neo-in hover:text-gray-900 dark:bg-gray-900 dark:text-gray-200 dark:hover:text-white',
  ].join(' ')
const btnNeo =
  'rounded-xl bg-gray-100 px-3 py-2 text-sm font-medium text-gray-800 shadow-neo-out-sm transition hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 active:shadow-neo-press disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-100 dark:hover:text-white dark:ring-offset-gray-900'
const btnDanger =
  'rounded-xl border border-red-200/90 bg-red-50 px-3 py-2 text-sm font-medium text-red-800 shadow-neo-out-sm transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-200 dark:hover:bg-red-950/80'

function cloneUsers(): MockManagedUser[] {
  return MOCK_MANAGED_USERS.map((u) => ({
    ...u,
    roleIds: [...u.roleIds],
    factoryCodes: [...u.factoryCodes],
    sessions: u.sessions.map((s) => ({ ...s })),
  }))
}

export function UserManagementView() {
  const { factories } = useFactoryContext()
  const baseId = useId()
  const [users, setUsers] = useState(cloneUsers)
  const [selectedId, setSelectedId] = useState(users[0]?.id ?? '')
  const [filterRole, setFilterRole] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [filterFactory, setFilterFactory] = useState<string>('')
  const [detailTab, setDetailTab] = useState<'profile' | 'roles' | 'factories' | 'sessions'>('profile')
  const [toast, setToast] = useState<string | null>(null)
  const [deactivateOpen, setDeactivateOpen] = useState(false)

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (filterRole && !u.roleIds.includes(filterRole)) return false
      if (filterStatus === 'active' && !u.active) return false
      if (filterStatus === 'inactive' && u.active) return false
      if (filterFactory && !u.factoryCodes.includes(filterFactory)) return false
      return true
    })
  }, [users, filterRole, filterStatus, filterFactory])

  const selected = users.find((u) => u.id === selectedId)

  useEffect(() => {
    if (selected) return
    const first = filtered[0]?.id ?? users[0]?.id
    if (first) setSelectedId(first)
  }, [filtered, selected, users])

  const updateUser = (id: string, patch: Partial<MockManagedUser> | ((u: MockManagedUser) => MockManagedUser)) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u
        return typeof patch === 'function' ? patch(u) : { ...u, ...patch }
      }),
    )
  }

  const toggleRole = (userId: string, roleId: string) => {
    updateUser(userId, (u) => {
      if (!u.active) return u
      const has = u.roleIds.includes(roleId)
      const roleIds = has ? u.roleIds.filter((x) => x !== roleId) : [...u.roleIds, roleId]
      return { ...u, roleIds: roleIds.length ? roleIds : u.roleIds }
    })
  }

  const toggleFactory = (userId: string, code: string) => {
    updateUser(userId, (u) => {
      if (!u.active) return u
      const has = u.factoryCodes.includes(code)
      let factoryCodes = has ? u.factoryCodes.filter((c) => c !== code) : [...u.factoryCodes, code]
      if (!factoryCodes.length) factoryCodes = [code]
      let defaultFactoryCode = u.defaultFactoryCode
      if (!factoryCodes.includes(defaultFactoryCode)) defaultFactoryCode = factoryCodes[0] ?? defaultFactoryCode
      return { ...u, factoryCodes, defaultFactoryCode }
    })
  }

  const confirmDeactivate = () => {
    if (!selected || !selected.active) return
    updateUser(selected.id, { active: false })
    setDeactivateOpen(false)
    setToast('Kullanıcı pasifleştirildi (mock). Oturumlar sunucuda sonlandırılır.')
    window.setTimeout(() => setToast(null), 4200)
  }

  const mockPasswordReset = () => {
    setToast('Şifre sıfırlama e-postası kuyruğa alındı (mock toast).')
    window.setTimeout(() => setToast(null), 3800)
  }

  const addMockUser = () => {
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
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Liste–detay (mock). Pasif kullanıcı yazma ve onay aksiyonlarını kullanamaz; davet ve oturumlar prototip
          durumudur.
        </p>
        <button type="button" className={`${btnNeo} inline-flex items-center gap-1.5`} onClick={addMockUser}>
          <UserPlus className="size-4" strokeWidth={1.75} aria-hidden />
          Yeni kullanıcı (mock)
        </button>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,420px)] xl:grid-cols-[minmax(0,1fr)_440px]">
        <section className="flex min-h-0 min-w-0 flex-col rounded-2xl bg-gray-50 p-4 shadow-neo-out-sm dark:bg-gray-950/80">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Kullanıcılar</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <label className="min-w-[8rem] flex-1">
              <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">Rol</span>
              <select
                className={`${inset} mt-1`}
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="">Tümü</option>
                {MOCK_ROLES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="min-w-[8rem] flex-1">
              <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">Durum</span>
              <select
                className={`${inset} mt-1`}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              >
                <option value="all">Tümü</option>
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </label>
            <label className="min-w-[10rem] flex-1">
              <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">Fabrika</span>
              <select
                className={`${inset} mt-1`}
                value={filterFactory}
                onChange={(e) => setFilterFactory(e.target.value)}
              >
                <option value="">Tümü</option>
                {factories.map((f) => (
                  <option key={f.code} value={f.code}>
                    {f.code}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 min-h-0 flex-1 overflow-auto rounded-xl bg-gray-100 shadow-neo-in dark:bg-gray-900/80">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="sticky top-0 z-10 bg-gray-100/95 text-xs uppercase tracking-wide text-gray-500 backdrop-blur dark:bg-gray-900/95 dark:text-gray-400">
                <tr>
                  <th className="px-3 py-2.5 font-semibold">Ad</th>
                  <th className="px-3 py-2.5 font-semibold">E-posta</th>
                  <th className="px-3 py-2.5 font-semibold">Durum</th>
                  <th className="px-3 py-2.5 font-semibold">Roller</th>
                  <th className="px-3 py-2.5 font-semibold">Son giriş</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr
                    key={u.id}
                    className={[
                      'cursor-pointer border-b border-gray-200/80 transition dark:border-gray-700/80',
                      u.id === selectedId ? 'bg-gray-50 dark:bg-gray-800/80' : 'hover:bg-gray-50/90 dark:hover:bg-gray-800/40',
                    ].join(' ')}
                    onClick={() => setSelectedId(u.id)}
                  >
                    <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-gray-50">{u.name}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-gray-600 dark:text-gray-400">{u.email}</td>
                    <td className="px-3 py-2.5">
                      <span
                        className={[
                          'rounded-full px-2 py-0.5 text-xs font-semibold',
                          u.active
                            ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200'
                            : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
                        ].join(' ')}
                      >
                        {u.active ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {u.roleIds.map((rid) => (
                          <span
                            key={rid}
                            className="rounded-full bg-gray-200/90 px-2 py-0.5 text-[11px] font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-100"
                          >
                            {roleLabel(rid)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400">
                      {u.lastLogin}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 ? (
              <p className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">Sonuç yok.</p>
            ) : null}
          </div>
        </section>

        <section className="flex min-h-0 flex-col rounded-2xl bg-gray-50 p-4 shadow-neo-out-sm dark:bg-gray-950/80">
          {selected ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-gray-200/90 pb-3 dark:border-gray-700/90">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">{selected.name}</h3>
                  <p className="font-mono text-xs text-gray-600 dark:text-gray-400">{selected.email}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {selected.inviteStatus === 'sent' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200">
                        <Mail className="size-3" aria-hidden />
                        Davet gönderildi (P1 mock)
                      </span>
                    ) : selected.inviteStatus === 'pending' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
                        Davet beklemede
                      </span>
                    ) : null}
                    {!selected.active ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                        <ShieldOff className="size-3" aria-hidden />
                        Pasif
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className={btnNeo} onClick={mockPasswordReset} disabled={!selected.active}>
                    <span className="inline-flex items-center gap-1.5">
                      <KeyRound className="size-4" strokeWidth={1.75} aria-hidden />
                      Şifre sıfırla
                    </span>
                  </button>
                  <button
                    type="button"
                    className={btnDanger}
                    disabled={!selected.active}
                    onClick={() => setDeactivateOpen(true)}
                  >
                    Pasifleştir
                  </button>
                </div>
              </div>

              {!selected.active ? (
                <div className="mt-3 flex gap-2 rounded-xl border border-amber-200/90 bg-amber-50 px-3 py-2 text-xs text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-100">
                  <AlertTriangle className="size-3.5 shrink-0" aria-hidden />
                  <p>
                    <strong className="font-semibold">Menü görünümü (mock):</strong> Pasif kullanıcı uygulamada
                    yazma/aksiyon gerektiren modülleri (MES, teklif onayı, sevkiyat kaydı vb.) göremez veya salt
                    okunur ekranla sınırlanır; oturum açmışsa oturumu sonlandırılır.
                  </p>
                </div>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-1 rounded-2xl bg-gray-100 p-1 shadow-neo-in dark:bg-gray-900/80">
                <button type="button" className={tabBtn(detailTab === 'profile')} onClick={() => setDetailTab('profile')}>
                  <span className="inline-flex items-center gap-1">
                    <User className="size-3.5" aria-hidden />
                    Profil
                  </span>
                </button>
                <button type="button" className={tabBtn(detailTab === 'roles')} onClick={() => setDetailTab('roles')}>
                  Roller
                </button>
                <button
                  type="button"
                  className={tabBtn(detailTab === 'factories')}
                  onClick={() => setDetailTab('factories')}
                >
                  <span className="inline-flex items-center gap-1">
                    <Factory className="size-3.5" aria-hidden />
                    Fabrika erişimi
                  </span>
                </button>
                <button
                  type="button"
                  className={tabBtn(detailTab === 'sessions')}
                  onClick={() => setDetailTab('sessions')}
                >
                  Oturumlar (P2)
                </button>
              </div>

              <div className="mt-4 min-h-0 flex-1 overflow-y-auto">
                {detailTab === 'profile' ? (
                  <div className="space-y-3 text-sm">
                    <label className="block">
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Ad soyad</span>
                      <input
                        className={`${inset} mt-1`}
                        disabled={!selected.active}
                        value={selected.name}
                        onChange={(e) => updateUser(selected.id, { name: e.target.value })}
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">E-posta</span>
                      <input
                        className={`${inset} mt-1`}
                        disabled={!selected.active}
                        type="email"
                        value={selected.email}
                        onChange={(e) => updateUser(selected.id, { email: e.target.value })}
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Unvan</span>
                      <input
                        className={`${inset} mt-1`}
                        disabled={!selected.active}
                        value={selected.title}
                        onChange={(e) => updateUser(selected.id, { title: e.target.value })}
                      />
                    </label>

                    <div className="rounded-xl border border-gray-200/90 bg-gray-100/80 p-3 shadow-neo-in dark:border-gray-700 dark:bg-gray-900/80">
                      <p className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
                        mvp-17 — Rapor gönderimi (<code className="font-mono">reports_to</code>)
                      </p>
                      <label className="mt-2 block">
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                          Bağlı olduğu yönetici
                        </span>
                        <select
                          className={`${inset} mt-1`}
                          disabled={!selected.active}
                          value={selected.reportsToId ?? ''}
                          onChange={(e) => {
                            const v = e.target.value === '' ? null : e.target.value
                            if (!isValidReportsTo(selected.id, v, users)) return
                            updateUser(selected.id, { reportsToId: v })
                          }}
                        >
                          <option value="">— Üst yok (kök) —</option>
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
                      <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                        {selected.reportsToId ? (
                          <>
                            Bu kullanıcı <strong className="text-gray-900 dark:text-gray-100">{userNameById(selected.reportsToId, users)}</strong> kullanıcısına bağlıdır <span className="text-gray-500">(ast)</span>.
                          </>
                        ) : (
                          <>Organizasyon kökü — üst rapor atanmamış.</>
                        )}
                      </p>
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Döngü engeli: kendinizi veya astınızı üst olarak seçemezsiniz (geçersiz seçenekler devre dışı).
                      </p>
                      <label className="mt-3 block">
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                          Benim durumum (isteğe bağlı)
                        </span>
                        <input
                          className={`${inset} mt-1`}
                          disabled={!selected.active}
                          value={selected.workStatusLine ?? ''}
                          placeholder="Örn. Ofiste · Uzaktan · İzinli"
                          onChange={(e) => updateUser(selected.id, { workStatusLine: e.target.value })}
                        />
                      </label>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-gray-200/90 px-2.5 py-1 text-[11px] font-semibold text-gray-800 dark:bg-gray-700 dark:text-gray-100">
                          P1 — Doğrudan ast: {directReportsCount(selected.id, users)} kişi
                        </span>
                      </div>
                      {directReportsCount(selected.id, users) > 0 ? (
                        <pre
                          className="mt-2 overflow-x-auto rounded-lg bg-gray-50 p-2 font-mono text-[10px] leading-relaxed text-gray-700 dark:bg-gray-950/80 dark:text-gray-300"
                          aria-label="Mini org önizleme"
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
                      <label
                        className="mt-3 block cursor-not-allowed opacity-60"
                        title="Çoklu üst / matris organizasyon — ileride"
                      >
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                          P2 — Matris üst (placeholder)
                        </span>
                        <select className={`${inset} mt-1`} disabled value="">
                          <option value="">İleride — şimdilik kapalı</option>
                        </select>
                      </label>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Kayıt sunucuya gitmez — yalnızca prototip durumu.
                    </p>
                  </div>
                ) : null}

                {detailTab === 'roles' ? (
                  <ul className="space-y-2">
                    {MOCK_ROLES.map((r) => (
                      <li key={r.id}>
                        <label
                          className={[
                            'flex cursor-pointer items-center gap-3 rounded-xl bg-gray-100 px-3 py-2.5 shadow-neo-in dark:bg-gray-900/80',
                            !selected.active ? 'cursor-not-allowed opacity-60' : '',
                          ].join(' ')}
                        >
                          <input
                            type="checkbox"
                            className="size-4 rounded accent-gray-800 disabled:opacity-50 dark:accent-gray-200"
                            checked={selected.roleIds.includes(r.id)}
                            disabled={!selected.active}
                            onChange={() => toggleRole(selected.id, r.id)}
                            id={`${baseId}-role-${r.id}`}
                          />
                          <span className="text-sm text-gray-900 dark:text-gray-50">{r.label}</span>
                          {r.isSystem ? (
                            <span className="ml-auto text-[10px] font-medium uppercase text-gray-500 dark:text-gray-400">
                              sistem
                            </span>
                          ) : null}
                        </label>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {detailTab === 'factories' ? (
                  <div className="space-y-4">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Erişim verilen fabrikalar (çoklu). Varsayılan, üst çubuktaki başlangıç bağlamı için (P1).
                    </p>
                    <ul className="space-y-2">
                      {factories.map((f) => (
                        <li key={f.code}>
                          <label
                            className={[
                              'flex cursor-pointer items-center gap-3 rounded-xl bg-gray-100 px-3 py-2.5 shadow-neo-in dark:bg-gray-900/80',
                              !selected.active ? 'cursor-not-allowed opacity-60' : '',
                            ].join(' ')}
                          >
                            <input
                              type="checkbox"
                              className="size-4 rounded accent-gray-800 disabled:opacity-50 dark:accent-gray-200"
                              checked={selected.factoryCodes.includes(f.code)}
                              disabled={!selected.active}
                              onChange={() => toggleFactory(selected.id, f.code)}
                            />
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-50">
                              {f.code} — {f.name}
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                    <label className="block">
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                        Varsayılan fabrika (P1)
                      </span>
                      <select
                        className={`${inset} mt-1`}
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
                ) : null}

                {detailTab === 'sessions' ? (
                  <div>
                    <p className="mb-3 text-xs text-gray-600 dark:text-gray-400">
                      Salt okunur oturum özeti (P2 mock).
                    </p>
                    {selected.sessions.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">Kayıtlı oturum yok.</p>
                    ) : (
                      <ul className="space-y-2">
                        {selected.sessions.map((s) => (
                          <li
                            key={s.id}
                            className="rounded-xl bg-gray-100 px-3 py-2.5 text-sm shadow-neo-in dark:bg-gray-900/80"
                          >
                            <p className="font-medium text-gray-900 dark:text-gray-50">{s.device}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {s.location} · Son aktivite: {s.lastActivity}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : null}
              </div>

              <div className="mt-auto border-t border-gray-200/90 pt-3 dark:border-gray-700/90">
                <button
                  type="button"
                  className="w-full rounded-xl bg-gray-800 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white dark:ring-offset-gray-900"
                  disabled={!selected.active}
                  onClick={() => setToast('Değişiklikler kaydedildi (mock).')}
                >
                  Kaydet (prototip)
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">Kullanıcı seçin.</p>
          )}
        </section>
      </div>

      {toast ? (
        <div
          className="fixed bottom-6 left-1/2 z-[80] max-w-md -translate-x-1/2 rounded-2xl border border-gray-200/90 bg-gray-100 px-4 py-3 text-sm font-medium text-gray-900 shadow-neo-out dark:border-gray-600 dark:bg-gray-900 dark:text-gray-50"
          role="status"
        >
          {toast}
        </div>
      ) : null}

      {deactivateOpen && selected ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[90] bg-gray-900/30 backdrop-blur-[1px] dark:bg-black/50"
            aria-label="İptal"
            onClick={() => setDeactivateOpen(false)}
          />
          <div
            className="fixed left-1/2 top-1/2 z-[100] w-[min(100%,22rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-gray-100 p-5 shadow-neo-out dark:bg-gray-900"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${baseId}-deact-title`}
          >
            <h4 id={`${baseId}-deact-title`} className="text-base font-semibold text-gray-900 dark:text-gray-50">
              Pasifleştir?
            </h4>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              <strong className="text-gray-900 dark:text-gray-100">{selected.name}</strong> kullanıcısı pasif
              olacak; aktif oturumlar sonlandırılır (mock metin).
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className={btnNeo} onClick={() => setDeactivateOpen(false)}>
                Vazgeç
              </button>
              <button type="button" className={btnDanger} onClick={confirmDeactivate}>
                Onayla
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
