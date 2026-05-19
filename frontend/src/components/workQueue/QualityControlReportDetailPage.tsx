import { ChevronRight } from 'lucide-react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useI18n } from '../../i18n/I18nProvider'
import { useThemeMode } from '../../theme/ThemeProvider'
import { useWorkQueue } from '../../context/WorkQueueContext'
import { moduleIdToPath } from '../../data/navigation'
import type { QualityControlReportDetailLocationState } from '../../data/qualityControlReportPaths'
import { QualityControlReportView } from './QualityControlReportView'
import '../muhendislikOkan/engineeringOkanLiquid.css'
import '../proje/projectManagementGlassLight.css'

export function QualityControlReportDetailPage() {
  const { t } = useI18n()
  const { mode } = useThemeMode()
  const gl = mode === 'light'
  const navigate = useNavigate()
  const location = useLocation()
  const { productionWorkQueueId } = useParams<{ productionWorkQueueId: string }>()
  const { getQualityControlReport } = useWorkQueue()

  const navState = location.state as QualityControlReportDetailLocationState | null
  const report = productionWorkQueueId ? getQualityControlReport(productionWorkQueueId) : undefined
  const returnWorkQueueId = navState?.returnWorkQueueId ?? productionWorkQueueId

  if (!report) {
    return <Navigate to={moduleIdToPath('unit-work-queue')} replace />
  }

  const goBack = () => {
    navigate(moduleIdToPath('unit-work-queue'), {
      state: returnWorkQueueId ? { workQueueId: returnWorkQueueId } : undefined,
    })
  }

  const crumbMuted = gl ? 'text-black/60 dark:text-white/65' : 'text-slate-500 dark:text-slate-400'
  const crumbLink = gl
    ? 'font-medium text-black/75 underline-offset-2 transition hover:text-black hover:underline dark:text-white/75 dark:hover:text-white'
    : 'font-medium text-slate-600 underline-offset-2 transition hover:text-sky-600 hover:underline dark:text-slate-300 dark:hover:text-sky-400'
  const crumbCurrent = gl
    ? 'max-w-[40ch] truncate font-semibold text-black dark:text-white'
    : 'max-w-[40ch] truncate font-semibold text-slate-800 dark:text-slate-100'

  return (
    <div
      className="project-mgmt-glass-light project-mgmt-detail-page--scroll flex w-full min-w-0 flex-col gap-1 rounded-3xl pb-8"
      data-neutral-shell="true"
    >
      <div className="flex flex-col gap-1">
        <div className="px-[0.6875rem] pt-0 pb-0.5">
          <div className="mb-1.5 pb-1.5">
            <h1
              className={`text-xl font-semibold tracking-tight md:text-2xl ${gl ? 'text-black dark:text-white' : 'text-gray-900 dark:text-gray-50'}`}
            >
              {t('unitWorkQueue.qcReport.detailPageTitle', { reportNo: report.reportNo })}
            </h1>
          </div>
          <nav aria-label={t('project.breadcrumbAria')} className="mb-0">
            <ol className={`flex flex-wrap items-center gap-1 text-xs ${crumbMuted}`}>
              <li>
                <Link to="/planlama" className={crumbLink}>
                  {t('nav.sidebar.section.planning')}
                </Link>
              </li>
              <li className="flex items-center gap-1" aria-hidden>
                <ChevronRight className="size-3.5 shrink-0 opacity-70" />
              </li>
              <li>
                <button type="button" onClick={goBack} className={crumbLink}>
                  {t('nav.unitWorkQueue')}
                </button>
              </li>
              <li className="flex items-center gap-1" aria-hidden>
                <ChevronRight className="size-3.5 shrink-0 opacity-70" />
              </li>
              <li className={crumbCurrent} aria-current="page">
                {report.reportNo}
              </li>
            </ol>
          </nav>
        </div>

        <div
          className={
            gl
              ? 'rounded-3xl bg-transparent p-1 md:p-1.5'
              : 'rounded-2xl border border-white/20 bg-white/10 p-2.5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5'
          }
        >
          <div
            className={
              gl
                ? 'glass-card glass-card--static qc-report-detail-card w-full min-w-0'
                : 'w-full min-w-0 px-1 sm:px-2'
            }
          >
            <QualityControlReportView report={report} gl={gl} layout="page" onBack={goBack} />
          </div>
        </div>
      </div>
    </div>
  )
}
