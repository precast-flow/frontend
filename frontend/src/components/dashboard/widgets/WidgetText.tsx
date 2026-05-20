import { useEffect, useState } from 'react'
import { useDashboard } from '../../../context/DashboardContext'
import { useI18n } from '../../../i18n/I18nProvider'
import type { WidgetInstance } from '../types'

type Props = { widget: WidgetInstance }

export type TextAlign = 'left' | 'center' | 'right'
export type TextSize = 'sm' | 'md' | 'lg' | 'xl'
export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold'
export type TextVAlign = 'start' | 'center' | 'end'

const SIZE_CLASS: Record<TextSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg md:text-xl',
  xl: 'text-xl md:text-2xl',
}

const WEIGHT_CLASS: Record<TextWeight, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
}

const COLOR_CLASS: Record<string, string> = {
  default: 'text-[var(--glass-text-primary)]',
  muted: 'text-[var(--glass-text-muted)]',
  sky: 'text-sky-700 dark:text-cyan-300',
  emerald: 'text-emerald-700 dark:text-emerald-300',
  amber: 'text-amber-800 dark:text-amber-200',
  rose: 'text-rose-700 dark:text-rose-300',
  violet: 'text-violet-700 dark:text-violet-300',
}

const ALIGN_CLASS: Record<TextAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

const JUSTIFY_CLASS: Record<TextAlign, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
}

const V_ALIGN_CLASS: Record<TextVAlign, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
}

export function textStyleClasses(settings: WidgetInstance['settings']) {
  const size = (settings.textSize ?? 'md') as TextSize
  const weight = (settings.textWeight ?? 'semibold') as TextWeight
  const colorKey = settings.textColor ?? 'default'
  const align = (settings.textAlign ?? 'left') as TextAlign
  return [
    SIZE_CLASS[size] ?? SIZE_CLASS.md,
    WEIGHT_CLASS[weight] ?? WEIGHT_CLASS.semibold,
    COLOR_CLASS[colorKey] ?? COLOR_CLASS.default,
    ALIGN_CLASS[align] ?? ALIGN_CLASS.left,
  ].join(' ')
}

function textContainerClasses(settings: WidgetInstance['settings']) {
  const align = (settings.textAlign ?? 'left') as TextAlign
  const vAlign = (settings.textVAlign ?? 'center') as TextVAlign
  return [
    'flex h-full w-full min-h-0 p-1',
    JUSTIFY_CLASS[align],
    V_ALIGN_CLASS[vAlign],
  ].join(' ')
}

export function WidgetText({ widget }: Props) {
  const { t } = useI18n()
  const { editMode, updateWidgetSettings } = useDashboard()
  const content = widget.settings.textContent ?? widget.settings.note ?? ''
  const [local, setLocal] = useState(content)

  useEffect(() => {
    setLocal(content)
  }, [content])

  const typography = textStyleClasses(widget.settings)
  const container = textContainerClasses(widget.settings)

  if (editMode) {
    return (
      <div className={container}>
        <textarea
          className={`${typography} max-h-full w-full max-w-full resize-none rounded-lg border-0 bg-transparent outline-none placeholder:text-[var(--glass-text-muted)]`}
          placeholder={t('dashboard.text.placeholder')}
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          onBlur={() => updateWidgetSettings(widget.id, { textContent: local, note: local })}
        />
      </div>
    )
  }

  return (
    <div className={container}>
      <div className={`${typography} max-w-full whitespace-pre-wrap`}>
        {content.trim() || (
          <span className="text-sm font-normal text-[var(--glass-text-muted)]">
            {t('dashboard.text.empty')}
          </span>
        )}
      </div>
    </div>
  )
}
