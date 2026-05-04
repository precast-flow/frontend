import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Factory, LayoutGrid, Lock, Mail, Shield, UserCircle } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'
import type { AppShellOutletContext } from '../../appShellOutletContext'
import {
  eiSplitHeaderButtonPassive,
  ElementIdentityFilterSheetHeader,
  ElementIdentityPieceCodesLikeSplit,
} from '../elementIdentity/ElementIdentityPieceCodesLikeSplit'
import { FilterToolbarSearch } from '../shared/FilterToolbarSearch'
import '../muhendislikOkan/engineeringOkanLiquid.css'
import type { ProfilePageState, ProfileSectionId } from './useProfilePageState'

const inputCls =
  'mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-900 outline-none ring-sky-300/50 focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100'

const SECTIONS: { id: ProfileSectionId; labelKey: string; icon: typeof UserCircle }[] = [
  { id: 'overview', labelKey: 'profileModule.secOverview', icon: LayoutGrid },
  { id: 'factories', labelKey: 'profileModule.secFactories', icon: Factory },
  { id: 'personal', labelKey: 'profileModule.secPersonal', icon: UserCircle },
  { id: 'work', labelKey: 'profileModule.secWork', icon: Briefcase },
  { id: 'security', labelKey: 'profileModule.secSecurity', icon: Lock },
]

function initials(first: string, last: string) {
  const a = first.trim().charAt(0)
  const b = last.trim().charAt(0)
  const s = (a + b).toUpperCase()
  return s || '—'
}

type Props = ProfilePageState & Pick<AppShellOutletContext, 'onNavigate'>

export function ProfileModuleView(props: Props) {
  const { t } = useI18n()
  const rightRef = useRef<HTMLDivElement | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [listSearch, setListSearch] = useState('')
  const {
    onNavigate,
    section,
    setSection,
    profileFactories,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    phone,
    setPhone,
    title,
    setTitle,
    department,
    setDepartment,
  } = props

  const scrollPanelTop = () => {
    requestAnimationFrame(() => rightRef.current?.scrollTo({ top: 0, behavior: 'auto' }))
  }

  const pickSection = (id: ProfileSectionId) => {
    setSection(id)
    scrollPanelTop()
  }

  const visibleSections = useMemo(() => {
    const q = listSearch.trim().toLocaleLowerCase('tr-TR')
    if (!q) return SECTIONS
    return SECTIONS.filter((s) => t(s.labelKey).toLocaleLowerCase('tr-TR').includes(q))
  }, [listSearch, t])

  return (
    <ElementIdentityPieceCodesLikeSplit
      persistKey="profile-page"
      listTitle={t('profileModule.listTitle')}
      filterToolbarSearch={
        <FilterToolbarSearch
          id="profile-module-list-search"
          value={listSearch}
          onValueChange={setListSearch}
          placeholder={t('profileModule.listSearchPh')}
          ariaLabel={t('profileModule.listSearchAria')}
        />
      }
      headerActions={
        <>
          <button
            type="button"
            onClick={() => onNavigate('settings')}
            className={eiSplitHeaderButtonPassive}
          >
            {t('profile.gotoSettings')}
          </button>
          <Link to="/profile?legacy=1" className={`${eiSplitHeaderButtonPassive} no-underline`}>
            {t('profileModule.legacyLink')}
          </Link>
        </>
      }
      isFilterOpen={filterOpen}
      onFilterOpenChange={setFilterOpen}
      filterAside={
        <div>
          <ElementIdentityFilterSheetHeader
            title={t('profileModule.filtersTitle')}
            subtitle={t('profileModule.filtersSubtitle')}
            onClose={() => setFilterOpen(false)}
          />
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{t('profileModule.filterBody')}</p>
          <label className="mt-3 block">
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">{t('profileModule.listSearchLabel')}</span>
            <input
              type="search"
              value={listSearch}
              onChange={(e) => setListSearch(e.target.value)}
              placeholder={t('profileModule.listSearchPh')}
              autoComplete="off"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
            />
          </label>
        </div>
      }
      listBody={
        <>
          {visibleSections.map((s) => {
            const Icon = s.icon
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => pickSection(s.id)}
                  className={`flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs transition ${
                    section === s.id
                      ? 'border-sky-400/60 bg-sky-500/10 dark:border-sky-500/40 dark:bg-sky-500/15'
                      : 'border-slate-200/50 bg-white/40 hover:bg-white/70 dark:border-slate-700/50 dark:bg-slate-900/30 dark:hover:bg-slate-900/50'
                  }`}
                >
                  <Icon className="size-3.5 shrink-0 text-slate-600 dark:text-slate-400" aria-hidden />
                  <span className="min-w-0 flex-1 font-semibold text-slate-900 dark:text-slate-50">{t(s.labelKey)}</span>
                </button>
              </li>
            )
          })}
        </>
      }
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-slate-600 dark:text-slate-300">
          <p>{t('profileModule.footerSections')}</p>
        </div>
      }
      rightPanelRef={rightRef}
      rightAside={
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <p className="mb-2 shrink-0 px-0.5 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 sm:px-1">
            {t('profileModule.intro')}
          </p>
          <div
            role="tabpanel"
            className="okan-project-tab-panel min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-0.5 text-left sm:px-1"
          >
            {section === 'overview' ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center rounded-xl border border-slate-200/70 bg-white/50 p-5 dark:border-slate-600/50 dark:bg-slate-900/40">
                  <div className="flex size-20 items-center justify-center rounded-full border border-slate-200/80 bg-slate-100 text-xl font-bold text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">
                    {initials(firstName, lastName)}
                  </div>
                  <p className="mt-3 text-center text-base font-semibold text-slate-900 dark:text-slate-50">
                    {firstName} {lastName}
                  </p>
                  <p className="mt-1 text-center text-sm text-slate-600 dark:text-slate-300">{title}</p>
                  <p className="mt-2 text-center text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {department}
                  </p>
                  <div className="mt-4 flex w-full max-w-sm items-center justify-center gap-2 rounded-lg border border-slate-200/70 bg-white/70 px-3 py-2 text-xs text-slate-600 dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-300">
                    <Mail className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
                    <span className="truncate">{email}</span>
                  </div>
                </div>
                <div className="flex gap-2 rounded-xl border border-slate-200/70 bg-sky-50/40 p-3 text-xs text-slate-800 dark:border-slate-600/50 dark:bg-sky-950/25 dark:text-slate-200">
                  <Shield className="mt-0.5 size-4 shrink-0 text-slate-600 dark:text-slate-400" strokeWidth={2} />
                  <p className="leading-relaxed">{t('profile.roleNote')}</p>
                </div>
              </div>
            ) : null}

            {section === 'factories' ? (
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Factory className="mt-0.5 size-4 shrink-0 text-slate-600 dark:text-slate-400" strokeWidth={2} />
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">{t('profile.factoriesTitle')}</h2>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t('profile.factoriesDesc')}</p>
                    <ul className="mt-4 space-y-2">
                      {profileFactories.map((f) => (
                        <li
                          key={f.code}
                          className="flex items-center justify-between gap-3 rounded-lg border border-slate-200/70 bg-white/50 px-3 py-2.5 text-sm text-slate-800 dark:border-slate-600/50 dark:bg-slate-900/40 dark:text-slate-100"
                        >
                          <span>
                            <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{f.code}</span> {f.name}
                          </span>
                          <span className="shrink-0 text-xs font-medium text-slate-500 dark:text-slate-400">{f.city}</span>
                        </li>
                      ))}
                      <li
                        className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-slate-300/80 bg-slate-100/50 px-3 py-2.5 text-sm text-slate-600 dark:border-slate-600 dark:bg-slate-900/30 dark:text-slate-400"
                        title={t('profile.restrictedTitle')}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <Lock className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
                          <span className="truncate">
                            <span className="font-mono text-xs">ANK-01</span> Ankara Fabrika
                          </span>
                        </span>
                        <span className="shrink-0 text-[11px] font-medium">{t('profile.restrictedBadge')}</span>
                      </li>
                    </ul>
                    <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{t('profile.restrictedNote')}</p>
                  </div>
                </div>
              </div>
            ) : null}

            {section === 'personal' ? (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">{t('profile.personalTitle')}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">{t('profile.personalDesc')}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">{t('profile.firstName')}</span>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={inputCls}
                      autoComplete="given-name"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">{t('profile.lastName')}</span>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className={inputCls}
                      autoComplete="family-name"
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">{t('auth.email')}</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputCls}
                      autoComplete="email"
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">{t('profile.phone')}</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={inputCls}
                      autoComplete="tel"
                    />
                  </label>
                </div>
              </div>
            ) : null}

            {section === 'work' ? (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">{t('profile.workTitle')}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">{t('profile.workDesc')}</p>
                <div className="grid gap-3">
                  <label className="block">
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">{t('profile.jobTitle')}</span>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">{t('profile.department')}</span>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className={inputCls}
                    />
                  </label>
                </div>
              </div>
            ) : null}

            {section === 'security' ? (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">{t('profile.securityTitle')}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">{t('profile.securityDesc')}</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                  >
                    {t('profile.changePassword')}
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                  >
                    {t('profile.manageSessions')}
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-auto flex shrink-0 flex-wrap justify-end gap-2 border-t border-slate-200/60 pt-3 dark:border-slate-700/60">
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200"
            >
              {t('profile.cancel')}
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:border-slate-600 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
            >
              {t('profile.save')}
            </button>
          </div>
        </div>
      }
    />
  )
}
