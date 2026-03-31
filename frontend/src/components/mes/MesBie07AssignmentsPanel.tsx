import { useMemo, useRef, useState } from 'react'
import { Link2 } from 'lucide-react'
import { useProductionQuality } from '../../context/ProductionQualityContext'
import {
  formatPlannedDate,
  mesLines,
  mesSlots,
  statusLabelProd02,
  type WorkOrder,
} from '../../data/mesMock'
import { projects } from '../../data/projectsMock'
import type { Bie07SpawnMeta, MockUnitWorkRow, UnitWorkAssignmentKind } from '../../data/mockUnitWorkQueue'
import { BIE07_DEMO_ACTIVE_MES_IDS } from '../../data/mockUnitWorkQueue'
import { useI18n } from '../../i18n/I18nProvider'

type Props = {
  workOrder: WorkOrder
  factoryName: (code: string) => string
  onNavigate: (moduleId: string) => void
}

const ARGE_TEMPLATES = [
  { id: 'LAB-STD-01', labelKey: 'mes.bie07.tpl.pressure28' },
  { id: 'LAB-STD-02', labelKey: 'mes.bie07.tpl.slumpAir' },
  { id: 'LAB-STD-03', labelKey: 'mes.bie07.tpl.chloride' },
] as const

function projectNameByCode(code: string): string {
  return projects.find((p) => p.code === code)?.name ?? code
}

export function MesBie07AssignmentsPanel({ workOrder, factoryName, onNavigate }: Props) {
  const { t } = useI18n()
  const { appendUnitWorkFromMes } = useProductionQuality()
  const ieSeq = useRef(131)

  const [requestType, setRequestType] = useState<Bie07SpawnMeta['requestType']>('numune')
  const [targetUnit, setTargetUnit] = useState<'u-kalite' | 'u-arge'>('u-kalite')
  const [templateId, setTemplateId] = useState<string>(ARGE_TEMPLATES[0]!.id)
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<MockUnitWorkRow['priority']>('normal')
  const [dueDate, setDueDate] = useState('2026-03-25')
  const [toast, setToast] = useState<string | null>(null)

  const activeDemoHint = useMemo(
    () => (BIE07_DEMO_ACTIVE_MES_IDS as readonly string[]).includes(workOrder.id),
    [workOrder.id],
  )

  const onRequestTypeChange = (v: Bie07SpawnMeta['requestType']) => {
    setRequestType(v)
    if (v === 'arge_deney') setTargetUnit('u-arge')
    else setTargetUnit('u-kalite')
  }

  const handleSubmit = () => {
    const assignee: 'u-kalite' | 'u-arge' = requestType === 'arge_deney' ? 'u-arge' : targetUnit
    const kind: UnitWorkAssignmentKind = requestType === 'arge_deney' ? 'arge' : 'quality'
    const woNo = `IE-URE-2025-${ieSeq.current}`
    ieSeq.current += 1

    const bie07: Bie07SpawnMeta = {
      parentMesCode: workOrder.code,
      requestType,
      templateId: requestType === 'arge_deney' ? templateId : undefined,
      qualityProgress: assignee === 'u-kalite' ? 'bekliyor' : undefined,
    }

    const summaryParts = [
      `[MES ${workOrder.code}]`,
      t(`mes.bie07.type.${requestType}`),
      `${t('mes.bie07.due')}: ${dueDate}`,
      description.trim() || t('mes.bie07.noDesc'),
    ]
    if (requestType === 'arge_deney') {
      summaryParts.push(`(${templateId})`)
    }

    const row: MockUnitWorkRow = {
      id: `WO-dyn-${Date.now()}`,
      factoryCode: workOrder.factoryCode,
      assigneeUnitId: assignee,
      assignerUnitId: 'u-uretim',
      workOrderNo: woNo,
      projectCode: workOrder.project,
      projectName: projectNameByCode(workOrder.project),
      kind,
      status: 'beklemede',
      priority,
      daysOnDesk: 0,
      lastUpdate: new Date().toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }),
      detailPresentation: 'dialog',
      summaryNote: summaryParts.join(' — '),
      bie07,
    }

    appendUnitWorkFromMes(row)
    setToast(t('mes.bie07.toast', { no: woNo }))
    window.setTimeout(() => setToast(null), 6000)
  }

  return (
    <div className="space-y-4 text-sm">
      <p className="text-xs text-gray-600 dark:text-gray-300">
        <strong className="text-gray-800 dark:text-gray-100">bie-07:</strong> {t('mes.bie07.intro')}
      </p>

      {activeDemoHint ? (
        <p className="rounded-xl bg-gray-50 px-3 py-2 text-[11px] text-gray-600 shadow-neo-in dark:bg-gray-950/80 dark:text-gray-300">
          {t('mes.bie07.activeOrdersHint')}
        </p>
      ) : null}

      <div className="rounded-2xl bg-gray-50 p-4 shadow-neo-in dark:bg-gray-950/70">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {t('mes.bie07.summaryCard')}
        </p>
        <dl className="mt-3 grid gap-2 sm:grid-cols-2">
          <div>
            <dt className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{t('mes.bie07.f.code')}</dt>
            <dd className="font-mono text-base font-bold text-gray-900 dark:text-gray-50">{workOrder.code}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{t('mes.bie07.f.status')}</dt>
            <dd className="font-medium text-gray-900 dark:text-gray-50">{statusLabelProd02(workOrder.status)}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{t('mes.bie07.f.project')}</dt>
            <dd className="text-gray-900 dark:text-gray-50">{workOrder.project}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{t('mes.bie07.f.part')}</dt>
            <dd className="text-gray-900 dark:text-gray-50">{workOrder.element}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{t('mes.bie07.f.planned')}</dt>
            <dd className="font-mono text-gray-800 dark:text-gray-100">{formatPlannedDate(workOrder.plannedDate)}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{t('mes.bie07.f.line')}</dt>
            <dd className="text-gray-800 dark:text-gray-100">
              {mesLines.find((l) => l.id === workOrder.lineId)?.label} · {mesSlots[workOrder.slotIndex] ?? '—'}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{t('mes.bie07.f.shift')}</dt>
            <dd className="text-gray-800 dark:text-gray-100">{workOrder.shiftOwner}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{t('mes.bie07.f.factory')}</dt>
            <dd className="text-gray-800 dark:text-gray-100">{factoryName(workOrder.factoryCode)}</dd>
          </div>
        </dl>
      </div>

      <div className="space-y-3 rounded-2xl bg-gray-50 p-4 shadow-neo-in dark:bg-gray-950/70">
        <label className="block">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{t('mes.bie07.jobType')}</span>
          <select
            value={requestType}
            onChange={(e) => onRequestTypeChange(e.target.value as Bie07SpawnMeta['requestType'])}
            className="mt-1 w-full rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm text-gray-900 shadow-neo-in dark:bg-gray-900 dark:text-gray-100"
          >
            <option value="kalite_kontrol">{t('mes.bie07.type.kalite_kontrol')}</option>
            <option value="numune">{t('mes.bie07.type.numune')}</option>
            <option value="arge_deney">{t('mes.bie07.type.arge_deney')}</option>
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{t('mes.bie07.targetUnit')}</span>
          <select
            value={requestType === 'arge_deney' ? 'u-arge' : targetUnit}
            onChange={(e) => setTargetUnit(e.target.value as 'u-kalite' | 'u-arge')}
            disabled={requestType === 'arge_deney'}
            className="mt-1 w-full rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm text-gray-900 shadow-neo-in disabled:opacity-60 dark:bg-gray-900 dark:text-gray-100"
          >
            <option value="u-kalite">{t('mes.bie07.unit.kalite')}</option>
            <option value="u-arge">{t('mes.bie07.unit.arge')}</option>
          </select>
        </label>

        {requestType === 'arge_deney' ? (
          <label className="block">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{t('mes.bie07.template')}</span>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="mt-1 w-full rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm text-gray-900 shadow-neo-in dark:bg-gray-900 dark:text-gray-100"
            >
              {ARGE_TEMPLATES.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {t(tpl.labelKey)}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">{t('mes.bie07.templateHint')}</p>
          </label>
        ) : null}

        <label className="block">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{t('mes.bie07.description')}</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 w-full resize-none rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm text-gray-900 shadow-neo-in dark:bg-gray-900 dark:text-gray-100"
            placeholder={t('mes.bie07.descriptionPh')}
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{t('mes.bie07.priority')}</span>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as MockUnitWorkRow['priority'])}
              className="mt-1 w-full rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm text-gray-900 shadow-neo-in dark:bg-gray-900 dark:text-gray-100"
            >
              <option value="dusuk">{t('unitWorkQueue.priority.dusuk')}</option>
              <option value="normal">{t('unitWorkQueue.priority.normal')}</option>
              <option value="yuksek">{t('unitWorkQueue.priority.yuksek')}</option>
              <option value="acil">{t('unitWorkQueue.priority.acil')}</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{t('mes.bie07.due')}</span>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 w-full rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm text-gray-900 shadow-neo-in dark:bg-gray-900 dark:text-gray-100"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="w-full rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm hover:bg-gray-900 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white"
        >
          {t('mes.bie07.submit')}
        </button>

        {toast ? (
          <p className="rounded-xl border border-emerald-300/80 bg-emerald-50 px-3 py-2 text-xs text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100">
            {toast}
          </p>
        ) : null}

        <p className="text-[11px] text-gray-500 dark:text-gray-400">{t('mes.bie07.queueHint')}</p>
      </div>

      <button
        type="button"
        onClick={() => onNavigate('planning-design')}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-3 py-2.5 text-xs font-semibold text-gray-700 shadow-neo-in dark:border-gray-600 dark:bg-gray-950/60 dark:text-gray-200"
      >
        <Link2 className="size-3.5 shrink-0" aria-hidden />
        {t('mes.bie07.planningBridge')}
      </button>
    </div>
  )
}
