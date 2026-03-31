import { Box, Package, Truck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useFactoryContext } from '../context/FactoryContext'
import {
  dashboardKpiAggregate,
  dashboardKpiSingle,
  dashboardTodos,
  type DashboardTodo,
} from '../data/dashboardMock'
import { glassPrimitiveClasses } from '../styles/themes/glassTokens'
import { GlassTable } from '../templates/glassmorphism/GlassTable'
import { DashboardCharts, OperationSnapshotCard } from './dashboard/DashboardCharts'

type Props = {
  onNavigate: (moduleId: string) => void
}

type RoleFilter = 'all' | DashboardTodo['roleTag']

const kpis = [
  {
    key: 'projects',
    label: 'Aktif proje',
    hint: 'Onaylı ve üretimde',
    kpiKey: 'projects' as const,
    targetId: 'project',
  },
  {
    key: 'produced',
    label: 'Bugün üretim adedi',
    hint: 'MES onaylı adet',
    kpiKey: 'produced' as const,
    targetId: 'mes',
  },
  {
    key: 'yard',
    label: "Yard'da bekleyen",
    hint: 'Sevkiyat öncesi',
    kpiKey: 'yard' as const,
    targetId: 'yard',
  },
  {
    key: 'dispatch',
    label: 'Bugün sevkiyat',
    hint: 'Planlanan yüklemeler',
    kpiKey: 'dispatch' as const,
    targetId: 'dispatch',
  },
  {
    key: 'approvals',
    label: 'Onay bekleyen',
    hint: 'Akış kuyruğu',
    kpiKey: 'approvals' as const,
    targetId: 'approval-flow',
  },
] as const

const roleFilterOptions: { id: RoleFilter; label: string }[] = [
  { id: 'all', label: 'Tüm roller (mock)' },
  { id: 'satis', label: 'Satış' },
  { id: 'lojistik', label: 'Lojistik' },
  { id: 'uretim', label: 'Üretim' },
  { id: 'yonetim', label: 'Yönetim' },
]

export function DashboardView({ onNavigate }: Props) {
  const { selectedCodes } = useFactoryContext()
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')

  const kpiValues = selectedCodes.length > 1 ? dashboardKpiAggregate : dashboardKpiSingle

  const filteredTodos = useMemo(() => {
    if (roleFilter === 'all') return dashboardTodos
    return dashboardTodos.filter((t) => t.roleTag === roleFilter)
  }, [roleFilter])

  return (
    <div className="gm-glass-arch-dashboard flex flex-col gap-6">
      <p className="gm-glass-dashboard-intro text-xs text-gray-600 dark:text-gray-300">
        <strong className="text-gray-800 dark:text-gray-100">mvp-14:</strong> KPI + üst çubukta bildirim zili (5+ öğe);
        <strong className="text-gray-900 dark:text-gray-50"> Tüm fabrikalar</strong> anahtarı toplu sayıları gösterir (P2).
      </p>

      {selectedCodes.length > 1 ? (
        <p
          className="rounded-2xl border border-gray-200/90 bg-gray-50 px-4 py-3 text-sm text-gray-700 shadow-neo-in dark:border-gray-600 dark:bg-gray-950/80 dark:text-gray-200"
          role="status"
        >
          <strong className="font-semibold">Tüm fabrikalar (P2):</strong> Aşağıdaki KPI sayıları üç fabrikadan toplanmış
          mock toplamlardır. Tek fabrika seçimine dönünce yerel değerler gösterilir.
        </p>
      ) : null}

      <section aria-labelledby="kpi-heading">
        <h2 id="kpi-heading" className="sr-only">
          Özet göstergeler
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {kpis.map((k) => (
            <button
              key={k.key}
              type="button"
              onClick={() => onNavigate(k.targetId)}
              className="gm-glass-dashboard-kpi flex min-h-[148px] flex-col rounded-2xl bg-gray-100 p-4 text-left shadow-neo-out-sm transition hover:shadow-neo-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 active:shadow-neo-press dark:bg-gray-800/90 dark:ring-offset-gray-900"
            >
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{k.label}</span>
              <span className="mt-3 text-3xl font-bold tabular-nums tracking-tight text-gray-900 dark:text-gray-50">
                {kpiValues[k.kpiKey]}
              </span>
              <span className="mt-auto pt-2 text-xs font-medium text-gray-600 dark:text-gray-400">{k.hint}</span>
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="charts-heading">
        <h2
          id="charts-heading"
          className="gm-glass-dashboard-section-title mb-3 text-sm font-semibold text-gray-900 dark:text-gray-50"
        >
          Özet grafikler
        </h2>
        <DashboardCharts />
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
        <section className="lg:col-span-7" aria-labelledby="todos-heading">
          <h2 id="todos-heading" className="sr-only">
            Yapılacaklar (P1)
          </h2>
          <GlassTable title="Yapılacaklar (P1)">
            <div className="gm-glass-dashboard-todos-filter border-b border-[var(--glass-border-muted)] px-4 py-3 md:px-5">
              <label className="block text-xs font-semibold text-[var(--glass-text-muted)]">
                Rol filtresi (mock)
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
                  className={`${glassPrimitiveClasses.control} mt-1 w-full max-w-xs text-sm font-medium`}
                >
                  {roleFilterOptions.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <table className="gm-glass-dashboard-todos-table min-w-full border-collapse text-left text-sm text-[var(--glass-text-primary)]">
              <thead className="bg-white/5 text-[var(--glass-text-muted)] dark:bg-black/20">
                <tr>
                  <th className="px-4 py-3 font-semibold md:px-5">Görev</th>
                  <th className="px-4 py-3 font-semibold md:px-5">Rol</th>
                </tr>
              </thead>
              <tbody>
                {filteredTodos.length ? (
                  filteredTodos.map((t) => (
                    <tr
                      key={t.id}
                      role="button"
                      tabIndex={0}
                      className="cursor-pointer border-t border-[var(--glass-border-muted)] transition hover:bg-white/5 dark:hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-300"
                      onClick={() => onNavigate(t.moduleId)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          onNavigate(t.moduleId)
                        }
                      }}
                    >
                      <td className="px-4 py-3 md:px-5">
                        <span className="block font-semibold text-[var(--glass-text-primary)]">{t.label}</span>
                      </td>
                      <td className="px-4 py-3 md:px-5">
                        <span className="inline-block rounded-full border border-[var(--glass-border-soft)] bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--glass-text-muted)]">
                          {t.roleTag}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-4 py-6 text-center text-sm text-[var(--glass-text-muted)] md:px-5"
                    >
                      Bu role ait yapılacak yok (mock).
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </GlassTable>
        </section>

        <section className="lg:col-span-5" aria-labelledby="snapshot-heading">
          <h2
            id="snapshot-heading"
            className="gm-glass-dashboard-section-title mb-3 text-sm font-semibold text-gray-900 dark:text-gray-50"
          >
            Operasyon özeti
          </h2>
          <OperationSnapshotCard />
        </section>
      </div>

      <section aria-labelledby="quick-heading">
        <h2
          id="quick-heading"
          className="gm-glass-dashboard-section-title mb-3 text-sm font-semibold text-gray-900 dark:text-gray-50"
        >
          Hızlı aksiyonlar
        </h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={() => onNavigate('quote')}
            className={`${glassPrimitiveClasses.btnPrimary} w-full px-4 py-3 sm:min-w-[10rem]`}
          >
            Yeni teklif
          </button>
          <button
            type="button"
            onClick={() => onNavigate('dispatch')}
            className={`${glassPrimitiveClasses.btnSecondary} flex w-full items-center justify-center gap-2 px-4 py-3 sm:min-w-[10rem]`}
          >
            <Truck className="size-4 shrink-0" strokeWidth={2} aria-hidden />
            Sevkiyat planı
          </button>
          <button
            type="button"
            onClick={() => onNavigate('yard')}
            className={`${glassPrimitiveClasses.btnSecondary} flex w-full items-center justify-center gap-2 px-4 py-3 sm:min-w-[10rem]`}
          >
            <Package className="size-4 shrink-0" strokeWidth={2} aria-hidden />
            Yard durumu
          </button>
          <button
            type="button"
            onClick={() => onNavigate('parametric-3d')}
            className={`${glassPrimitiveClasses.btnSecondary} flex w-full items-center justify-center gap-2 px-4 py-3 sm:min-w-[10rem]`}
          >
            <Box className="size-4 shrink-0" strokeWidth={2} aria-hidden />
            Parametrik 3B
          </button>
        </div>
      </section>
    </div>
  )
}
