/** Sevkiyat araç tipi — özet görünümde renk ayrımı. */
export type DispatchVehicleType = 'tir' | 'kamyon' | 'lowbed'

export type DispatchVehicleTone = {
  card: string
  icon: string
  title: string
  button: string
  rowAccent: string
}

export const DISPATCH_VEHICLE_TONES: Record<DispatchVehicleType, DispatchVehicleTone> = {
  tir: {
    card: 'border-sky-300/80 border-l-4 border-l-sky-500 bg-sky-50/90 dark:border-sky-600/55 dark:border-l-sky-400 dark:bg-sky-950/50',
    icon: 'text-sky-700 dark:text-sky-300',
    title: 'text-sky-950 dark:text-sky-50',
    button:
      'border-sky-400/60 bg-white/90 text-sky-800 hover:bg-sky-100 dark:border-sky-500/50 dark:bg-sky-900/60 dark:text-sky-100 dark:hover:bg-sky-900',
    rowAccent: 'border-l-[3px] border-l-sky-500',
  },
  kamyon: {
    card: 'border-amber-300/80 border-l-4 border-l-amber-500 bg-amber-50/90 dark:border-amber-600/55 dark:border-l-amber-400 dark:bg-amber-950/45',
    icon: 'text-amber-800 dark:text-amber-300',
    title: 'text-amber-950 dark:text-amber-50',
    button:
      'border-amber-400/60 bg-white/90 text-amber-900 hover:bg-amber-100 dark:border-amber-500/50 dark:bg-amber-900/50 dark:text-amber-100 dark:hover:bg-amber-900',
    rowAccent: 'border-l-[3px] border-l-amber-500',
  },
  lowbed: {
    card: 'border-violet-300/80 border-l-4 border-l-violet-500 bg-violet-50/90 dark:border-violet-600/55 dark:border-l-violet-400 dark:bg-violet-950/45',
    icon: 'text-violet-800 dark:text-violet-300',
    title: 'text-violet-950 dark:text-violet-50',
    button:
      'border-violet-400/60 bg-white/90 text-violet-900 hover:bg-violet-100 dark:border-violet-500/50 dark:bg-violet-900/50 dark:text-violet-100 dark:hover:bg-violet-900',
    rowAccent: 'border-l-[3px] border-l-violet-500',
  },
}

export function dispatchVehicleTypeFromName(name: string): DispatchVehicleType {
  const n = name.toLowerCase()
  if (n.includes('lowbed')) return 'lowbed'
  if (n.includes('kamyon')) return 'kamyon'
  return 'tir'
}
