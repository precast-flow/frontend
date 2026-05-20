import type { ReactNode } from 'react'

/** Proje / Görev / Müşteri / Kalite yönetimi modüllerinde ortak dış kabuk (başlık/breadcrumb MainCanvas’ta). */
export const managementModuleOuterClass =
  'project-mgmt-glass-light flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl'

export function managementModuleContentClass(gl: boolean): string {
  return [
    'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden',
    gl
      ? 'gap-2 rounded-3xl bg-transparent p-1 md:p-1.5'
      : 'rounded-2xl border border-white/20 bg-white/10 p-2.5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5',
  ].join(' ')
}

/** Liste + ayırıcı + detay satırı. */
export function managementModuleSplitRowClass(gl: boolean): string {
  return [
    'relative flex h-full min-h-0 min-w-0 flex-1 overflow-hidden',
    gl ? 'gap-3 rounded-3xl lg:gap-4' : 'gap-0',
  ].join(' ')
}

/** Split panel iç gövdesi — viewport yüksekliğini doldurur. */
export const splitPanePanelMinHeightClass =
  'min-h-0 flex flex-1 flex-col overflow-hidden'

/** Sol liste paneli (%40). */
export function managementModuleListPanelClass(gl: boolean): string {
  return [
    'okan-project-split-list okan-split-list-active-lift flex h-full min-h-0 flex-1 shrink-0 flex-col overflow-hidden',
    gl ? 'glass-card glass-card--static project-mgmt-split-panel min-h-0' : 'p-3',
  ].join(' ')
}

/** Sağ detay paneli (%60). */
export function managementModuleDetailPanelClass(gl: boolean): string {
  return gl
    ? 'okan-project-split-aside glass-card glass-card--static project-mgmt-split-panel flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden'
    : 'okan-project-split-aside flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-3 lg:pl-2'
}

/** Liste paneli üst başlık / araç çubuğu satırı. */
export const managementModuleListToolbarClass =
  'mb-2 flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-x-2'

export const managementModuleListTitleClass =
  'min-w-0 shrink-0 text-sm font-semibold text-black dark:text-white sm:text-base'

type ManagementModuleShellProps = {
  neutralShell?: boolean
  /** Modül üstü modal vb. */
  topSlot?: ReactNode
  gl: boolean
  children: ReactNode
}

export function ManagementModuleShell({
  neutralShell,
  topSlot,
  gl,
  children,
}: ManagementModuleShellProps) {
  return (
    <div
      className={managementModuleOuterClass}
      data-neutral-shell={neutralShell ? 'true' : undefined}
    >
      {topSlot}
      <div className={['min-h-0 flex-1', managementModuleContentClass(gl)].join(' ')}>{children}</div>
    </div>
  )
}
