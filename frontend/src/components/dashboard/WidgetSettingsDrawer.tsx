import { useEffect } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { useDashboard } from '../../context/DashboardContext'
import { CHART_TYPES } from './dashboardData'
import { DashboardSideDrawer } from './dashboardSideDrawer'
import { PRODUCTION_BANDS, todayIsoDate } from '../../data/moldStatusBoardMock'
import {
  SettingsAlignButtons,
  SettingsCheckbox,
  SettingsField,
  SettingsInput,
  SettingsSection,
  SettingsSelect,
  SettingsTextarea,
  SettingsToggle,
} from './widgetSettingsUi'
import { WidgetWeatherSettingsFields } from './widgets/WidgetWeatherSettingsFields'
import type { ChartType, DataSourceKey, ListDataSourceKey, NotificationFilter, WidgetInstance } from './types'

const DATA_SOURCES: DataSourceKey[] = [
  'monthlyProduction',
  'quoteStages',
  'lineUtilization',
  'dispatch',
  'productionSummary',
  'quality',
  'reporting',
  'generalPlanning',
]

const LIST_SOURCES: ListDataSourceKey[] = [
  'customers',
  'quotes',
  'projects',
  'workOrders',
  'dailyReports',
  'ncrs',
]

const KPI_KEYS = ['projects', 'produced', 'yard', 'dispatch', 'approvals'] as const

const LIMIT_WIDGETS = new Set([
  'notifications',
  'actions',
  'list',
  'activity',
  'topn',
])

function widgetTypeLabel(type: WidgetInstance['type'], t: (k: string) => string): string {
  return t(`dashboard.widget.${type}`)
}

export function WidgetSettingsDrawer() {
  const { t } = useI18n()
  const {
    activeDashboard,
    settingsWidgetId,
    setSettingsWidgetId,
    updateWidgetSettings,
    beginSettingsSession,
  } = useDashboard()

  const widget = activeDashboard?.widgets.find((w) => w.id === settingsWidgetId)
  const close = () => setSettingsWidgetId(null)

  useEffect(() => {
    if (widget) beginSettingsSession()
  }, [widget?.id, beginSettingsSession])

  if (!widget) return null

  const patch = (p: Parameters<typeof updateWidgetSettings>[1]) =>
    updateWidgetSettings(widget.id, p, { skipHistory: true })

  const isText = widget.type === 'text' || widget.type === 'markdown'
  const showLimit = LIMIT_WIDGETS.has(widget.type)

  return (
    <DashboardSideDrawer
      open={Boolean(settingsWidgetId)}
      onClose={close}
      title={t('dashboard.settings.title')}
      titleId="widget-settings-title"
      closeLabel={t('dashboard.catalog.close')}
      maxWidthClass="max-w-sm"
    >
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-y-auto p-4">
        <p className="text-xs text-[var(--glass-text-muted)]">
          {t('dashboard.settings.widgetType', { type: widgetTypeLabel(widget.type, t) })}
        </p>

        {isText ? (
          <SettingsSection title={t('dashboard.settings.sectionText')}>
            <SettingsField label={t('dashboard.text.content')}>
              <SettingsTextarea
                value={widget.settings.textContent ?? widget.settings.note ?? ''}
                onChange={(e) => patch({ textContent: e.target.value, note: e.target.value })}
              />
            </SettingsField>
            <SettingsField label={t('dashboard.text.align')}>
              <SettingsAlignButtons
                value={widget.settings.textAlign ?? 'left'}
                onChange={(textAlign) => patch({ textAlign })}
                labels={{
                  left: t('dashboard.text.alignLeft'),
                  center: t('dashboard.text.alignCenter'),
                  right: t('dashboard.text.alignRight'),
                }}
              />
            </SettingsField>
            <SettingsField label={t('dashboard.text.vAlign')}>
              <SettingsSelect
                value={widget.settings.textVAlign ?? 'center'}
                onChange={(e) =>
                  patch({ textVAlign: e.target.value as 'start' | 'center' | 'end' })
                }
              >
                <option value="start">{t('dashboard.text.vAlignStart')}</option>
                <option value="center">{t('dashboard.text.vAlignCenter')}</option>
                <option value="end">{t('dashboard.text.vAlignEnd')}</option>
              </SettingsSelect>
            </SettingsField>
            <SettingsField label={t('dashboard.text.size')}>
              <SettingsSelect
                value={widget.settings.textSize ?? 'md'}
                onChange={(e) =>
                  patch({ textSize: e.target.value as 'sm' | 'md' | 'lg' | 'xl' })
                }
              >
                <option value="sm">{t('dashboard.text.sizeSm')}</option>
                <option value="md">{t('dashboard.text.sizeMd')}</option>
                <option value="lg">{t('dashboard.text.sizeLg')}</option>
                <option value="xl">{t('dashboard.text.sizeXl')}</option>
              </SettingsSelect>
            </SettingsField>
            <SettingsField label={t('dashboard.text.color')}>
              <SettingsSelect
                value={widget.settings.textColor ?? 'default'}
                onChange={(e) =>
                  patch({
                    textColor: e.target.value as NonNullable<
                      typeof widget.settings.textColor
                    >,
                  })
                }
              >
                <option value="default">{t('dashboard.text.colorDefault')}</option>
                <option value="muted">{t('dashboard.text.colorMuted')}</option>
                <option value="sky">{t('dashboard.text.colorSky')}</option>
                <option value="emerald">{t('dashboard.text.colorEmerald')}</option>
                <option value="amber">{t('dashboard.text.colorAmber')}</option>
                <option value="rose">{t('dashboard.text.colorRose')}</option>
                <option value="violet">{t('dashboard.text.colorViolet')}</option>
              </SettingsSelect>
            </SettingsField>
            <SettingsField label={t('dashboard.text.weight')}>
              <SettingsSelect
                value={widget.settings.textWeight ?? 'semibold'}
                onChange={(e) =>
                  patch({
                    textWeight: e.target.value as NonNullable<
                      typeof widget.settings.textWeight
                    >,
                  })
                }
              >
                <option value="normal">{t('dashboard.text.weightNormal')}</option>
                <option value="medium">{t('dashboard.text.weightMedium')}</option>
                <option value="semibold">{t('dashboard.text.weightSemibold')}</option>
                <option value="bold">{t('dashboard.text.weightBold')}</option>
              </SettingsSelect>
            </SettingsField>
          </SettingsSection>
        ) : (
          <SettingsSection title={t('dashboard.settings.sectionAppearance')}>
            <SettingsToggle
              label={t('dashboard.settings.showHeader')}
              description={t('dashboard.settings.showHeaderHint')}
              checked={widget.settings.showHeader === true}
              onChange={(showHeader) => patch({ showHeader })}
            />
            {widget.settings.showHeader ? (
              <SettingsField
                label={t('dashboard.settings.headerTitle')}
                hint={t('dashboard.settings.headerTitlePlaceholder')}
              >
                <SettingsInput
                  value={widget.settings.title ?? ''}
                  onChange={(e) => patch({ title: e.target.value })}
                  placeholder={widgetTypeLabel(widget.type, t)}
                />
              </SettingsField>
            ) : null}
          </SettingsSection>
        )}

        {widget.type === 'chart' ? (
          <SettingsSection title={t('dashboard.settings.sectionData')}>
            <SettingsField label={t('dashboard.settings.chartType')}>
              <SettingsSelect
                value={widget.settings.chartType ?? 'line'}
                onChange={(e) => patch({ chartType: e.target.value as ChartType })}
              >
                {CHART_TYPES.map((ct) => (
                  <option key={ct} value={ct}>
                    {t(`dashboard.chartType.${ct}`)}
                  </option>
                ))}
              </SettingsSelect>
            </SettingsField>
            <SettingsField label={t('dashboard.settings.dataSource')}>
              <SettingsSelect
                value={widget.settings.dataSource ?? 'monthlyProduction'}
                onChange={(e) => patch({ dataSource: e.target.value as DataSourceKey })}
              >
                {DATA_SOURCES.map((ds) => (
                  <option key={ds} value={ds}>
                    {t(`dashboard.dataSource.${ds}`)}
                  </option>
                ))}
              </SettingsSelect>
            </SettingsField>
          </SettingsSection>
        ) : null}

        {widget.type === 'funnel' ? (
          <SettingsSection title={t('dashboard.settings.sectionData')}>
            <SettingsField label={t('dashboard.settings.dataSource')}>
              <SettingsSelect
                value={widget.settings.dataSource ?? 'quoteStages'}
                onChange={(e) => patch({ dataSource: e.target.value as DataSourceKey })}
              >
                {DATA_SOURCES.map((ds) => (
                  <option key={ds} value={ds}>
                    {t(`dashboard.dataSource.${ds}`)}
                  </option>
                ))}
              </SettingsSelect>
            </SettingsField>
          </SettingsSection>
        ) : null}

        {widget.type === 'list' || widget.type === 'topn' ? (
          <SettingsSection title={t('dashboard.settings.sectionData')}>
            <SettingsField label={t('dashboard.settings.listSource')}>
              <SettingsSelect
                value={
                  widget.type === 'topn'
                    ? (widget.settings.topnSource ?? 'workOrders')
                    : (widget.settings.listSource ?? 'projects')
                }
                onChange={(e) => {
                  const v = e.target.value as ListDataSourceKey
                  if (widget.type === 'topn') patch({ topnSource: v })
                  else patch({ listSource: v })
                }}
              >
                {LIST_SOURCES.map((ls) => (
                  <option key={ls} value={ls}>
                    {t(`dashboard.listSource.${ls}`)}
                  </option>
                ))}
              </SettingsSelect>
            </SettingsField>
          </SettingsSection>
        ) : null}

        {widget.type === 'notifications' ? (
          <SettingsSection title={t('dashboard.settings.sectionData')}>
            <SettingsField label={t('dashboard.settings.filter')}>
              <SettingsSelect
                value={widget.settings.notificationFilter ?? 'all'}
                onChange={(e) =>
                  patch({ notificationFilter: e.target.value as NotificationFilter })
                }
              >
                <option value="all">{t('dashboard.settings.filterAll')}</option>
                <option value="unread">{t('dashboard.settings.filterUnread')}</option>
                <option value="high">{t('dashboard.settings.filterHigh')}</option>
              </SettingsSelect>
            </SettingsField>
          </SettingsSection>
        ) : null}

        {widget.type === 'kpi' ? (
          <SettingsSection title={t('dashboard.settings.sectionData')}>
            <SettingsField label={t('dashboard.settings.kpiMetric')}>
              <SettingsSelect
                value={widget.settings.kpiKey ?? 'projects'}
                onChange={(e) => patch({ kpiKey: e.target.value })}
              >
                {KPI_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {t(`dashboard.kpi.${k}`)}
                  </option>
                ))}
              </SettingsSelect>
            </SettingsField>
            <SettingsToggle
              label={t('dashboard.settings.showTrend')}
              checked={widget.settings.showKpiTrend !== false}
              onChange={(showKpiTrend) => patch({ showKpiTrend })}
            />
          </SettingsSection>
        ) : null}

        {widget.type === 'gauge' ? (
          <SettingsSection title={t('dashboard.settings.sectionData')}>
            <SettingsField label={t('dashboard.settings.gaugeValue')}>
              <SettingsInput
                type="number"
                value={widget.settings.gaugeValue ?? 72}
                onChange={(e) => patch({ gaugeValue: Number(e.target.value) })}
              />
            </SettingsField>
            <SettingsField label={t('dashboard.settings.gaugeMax')}>
              <SettingsInput
                type="number"
                value={widget.settings.gaugeMax ?? 100}
                onChange={(e) => patch({ gaugeMax: Number(e.target.value) })}
              />
            </SettingsField>
          </SettingsSection>
        ) : null}

        {widget.type === 'moldStatus' ? (
          <SettingsSection title={t('dashboard.settings.sectionData')}>
            <SettingsField label={t('dashboard.moldStatus.settingsDate')}>
              <SettingsInput
                type="date"
                value={widget.settings.moldViewDate ?? todayIsoDate()}
                onChange={(e) => patch({ moldViewDate: e.target.value })}
              />
            </SettingsField>
            <SettingsField label={t('dashboard.moldStatus.settingsBand')}>
              <SettingsSelect
                value={widget.settings.moldBandFilter ?? 'all'}
                onChange={(e) => patch({ moldBandFilter: e.target.value })}
              >
                <option value="all">{t('dashboard.moldStatus.allBands')}</option>
                {PRODUCTION_BANDS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </SettingsSelect>
            </SettingsField>
            <SettingsCheckbox
              label={t('dashboard.moldStatus.settingsShowEmpty')}
              checked={widget.settings.showEmptyMolds !== false}
              onChange={(showEmptyMolds) => patch({ showEmptyMolds })}
            />
          </SettingsSection>
        ) : null}

        {widget.type === 'currency' ? (
          <SettingsSection title={t('dashboard.settings.sectionData')}>
            <SettingsField
              label={t('dashboard.currency.settingsSymbols')}
              hint={t('dashboard.currency.settingsHint')}
            >
              <SettingsInput
                className="font-mono text-xs"
                value={widget.settings.currencySymbols ?? 'USD,EUR,GBP'}
                placeholder="USD,EUR,GBP"
                onChange={(e) => patch({ currencySymbols: e.target.value })}
              />
            </SettingsField>
          </SettingsSection>
        ) : null}

        {widget.type === 'weather' ? (
          <SettingsSection title={t('dashboard.settings.sectionData')}>
            <WidgetWeatherSettingsFields settings={widget.settings} onPatch={patch} />
          </SettingsSection>
        ) : null}

        {showLimit ? (
          <SettingsSection title={t('dashboard.settings.sectionDisplay')}>
            <SettingsField label={t('dashboard.settings.limit')} hint={t('dashboard.settings.limitHint')}>
              <SettingsInput
                type="number"
                min={1}
                max={50}
                value={widget.settings.limit ?? 8}
                onChange={(e) => patch({ limit: Number(e.target.value) || 8 })}
              />
            </SettingsField>
          </SettingsSection>
        ) : null}

        <p className="pb-1 text-[10px] text-[var(--glass-text-muted)]">{t('dashboard.settings.undoHint')}</p>
      </div>
    </DashboardSideDrawer>
  )
}
