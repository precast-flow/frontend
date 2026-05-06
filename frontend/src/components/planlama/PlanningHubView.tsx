import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { moduleIdToPath, navGroups } from '../../data/navigation'
import { useI18n } from '../../i18n/I18nProvider'
import { NavItemIcon } from '../sidebarNavIcons'

const DESC_KEY_BY_MODULE: Record<string, string> = {
  'unit-work-queue': 'main.desc.unitWorkQueue',
  crm: 'main.desc.crm',
  project: 'main.desc.project',
  'planning-design': 'main.desc.planningDesign',
}

export function PlanningHubView() {
  const { t } = useI18n()

  const cards = useMemo(() => {
    const group = navGroups.find((g) => g.id === 'planning')
    return group?.items.filter((i) => i.id !== 'planning-hub') ?? []
  }, [])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      <p className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        {t('main.desc.planningHub')}
      </p>

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((item) => {
          const to = moduleIdToPath(item.id)
          const descKey = DESC_KEY_BY_MODULE[item.id]
          return (
            <li key={item.id}>
              <Link
                to={to}
                className="group relative flex h-full min-h-[8.5rem] flex-col gap-3 rounded-2xl border border-white/25 bg-gradient-to-br from-white/15 to-white/5 p-4 shadow-sm backdrop-blur-xl transition hover:border-sky-400/35 hover:from-white/25 hover:shadow-md dark:border-white/10 dark:from-white/10 dark:to-slate-900/40 dark:hover:border-sky-400/25"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-700 ring-1 ring-sky-500/20 dark:bg-sky-400/10 dark:text-sky-200 dark:ring-sky-400/20">
                    <NavItemIcon id={item.id} className="size-5" />
                  </span>
                  <ArrowUpRight
                    className="size-4 shrink-0 text-slate-400 opacity-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 dark:text-slate-500"
                    strokeWidth={2}
                    aria-hidden
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                    {t(item.labelKey)}
                  </h2>
                  {descKey ? (
                    <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                      {t(descKey)}
                    </p>
                  ) : null}
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
