import { useRef, useState } from 'react'
import { ChevronsLeftRight, GripVertical } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { activeModuleIdFromPathname } from '../../../data/navigation'
import { useThemeMode } from '../../../theme/ThemeProvider'
import '../../muhendislikOkan/engineeringOkanLiquid.css'
import '../../proje/projectManagementGlassLight.css'
import {
  ManagementModuleShell,
  managementModuleDetailPanelClass,
  managementModuleListPanelClass,
  managementModuleListTitleClass,
  managementModuleSplitRowClass,
  useSplitPaneDrag,
  useSplitPaneRatio,
} from '../../shared/splitModuleStyles'
import { ElementTypesAdminPanel } from './ElementTypesAdminPanel'
import { TypologiesAdminPanel } from './TypologiesAdminPanel'
import { DimensionsAdminPanel } from './DimensionsAdminPanel'
import { SizeFormatsAdminPanel } from './SizeFormatsAdminPanel'
import { IfcMappingAdminPanel } from './IfcMappingAdminPanel'
import { FirmsAdminPanel } from './FirmsAdminPanel'
import { NamingTemplatesAdminPanel } from './NamingTemplatesAdminPanel'
import { FirmOverridesAdminPanel } from './FirmOverridesAdminPanel'

type SectionKey =
  | 'elementTypes'
  | 'typologies'
  | 'dimensions'
  | 'sizeFormats'
  | 'ifcMapping'
  | 'firms'
  | 'namingTemplates'
  | 'firmOverrides'

type SidebarItem = { id: SectionKey; label: string; icon: string }
type SidebarGroup = { id: 'system' | 'firm'; title: string; items: SidebarItem[] }

const ADMIN_SPLIT_PANE_KEY = 'element-identity-admin'

const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    id: 'system',
    title: 'Sistem Kataloğu',
    items: [
      { id: 'elementTypes', label: 'Eleman Tipleri', icon: '📁' },
      { id: 'typologies', label: 'Tipolojiler', icon: '🗂️' },
      { id: 'dimensions', label: 'Tanımlayıcı Boyutlar', icon: '📏' },
      { id: 'sizeFormats', label: 'Boyut Formatları', icon: '📐' },
      { id: 'ifcMapping', label: 'IFC Eşleme Kuralları', icon: '🔁' },
    ],
  },
  {
    id: 'firm',
    title: 'Firma Katmanı',
    items: [
      { id: 'firms', label: 'Firmalar', icon: '🏢' },
      { id: 'namingTemplates', label: 'İsimlendirme Şablonları', icon: '🧩' },
      { id: 'firmOverrides', label: 'Firma Kod Override', icon: '🛠️' },
    ],
  },
]

export function AdminElementIdentityModuleView() {
  const { mode } = useThemeMode()
  const gl = mode === 'light'
  const location = useLocation()
  const neutralShell = activeModuleIdFromPathname(location.pathname) === 'element-identity-admin'
  const [active, setActive] = useState<SectionKey>('elementTypes')
  const splitRef = useRef<HTMLDivElement | null>(null)
  const {
    isResizing,
    setIsResizing,
    resetRatio,
    leftWidthStyle,
    setRatioFromPointer,
  } = useSplitPaneRatio(ADMIN_SPLIT_PANE_KEY, 32)
  const [isResizerHover, setIsResizerHover] = useState(false)
  useSplitPaneDrag(splitRef, { isResizing, setIsResizing, setRatioFromPointer })

  return (
    <ManagementModuleShell neutralShell={neutralShell} gl={gl}>
      <div
        ref={splitRef}
        data-split-dragging={isResizing ? 'true' : undefined}
        className={managementModuleSplitRowClass(gl)}
      >
        <aside
          className={managementModuleListPanelClass(gl)}
          style={leftWidthStyle}
        >
          <h2 className={managementModuleListTitleClass}>Bölümler</h2>
          <div className="mt-2 min-h-0 flex-1 overflow-y-auto">
            {SIDEBAR_GROUPS.map((group) => (
              <div key={group.id} className="mb-4 flex flex-col gap-1">
                <h3 className="px-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {group.title}
                </h3>
                {group.items.map((item) => {
                  const isActive = active === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActive(item.id)}
                      className={[
                        'flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition',
                        isActive
                          ? 'bg-slate-100 font-semibold text-gray-900 ring-1 ring-inset ring-slate-300/70 dark:bg-slate-800 dark:text-gray-50 dark:ring-slate-600/70'
                          : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100',
                      ].join(' ')}
                    >
                      <span aria-hidden>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </aside>

        <div className="relative z-10 mx-1 hidden w-2 shrink-0 cursor-col-resize lg:flex">
          <button
            type="button"
            aria-label="Paneller arası genişliği ayarla"
            title="Çift tıklayarak varsayılan sütun genişliğine dön"
            onMouseDown={() => setIsResizing(true)}
            onDoubleClick={(e) => {
              e.preventDefault()
              setIsResizing(false)
              resetRatio()
            }}
            onMouseEnter={() => setIsResizerHover(true)}
            onMouseLeave={() => setIsResizerHover(false)}
            className={[
              'group absolute inset-y-3 left-1/2 -translate-x-1/2 rounded-full border transition',
              isResizing || isResizerHover
                ? 'w-6 border-black/35 bg-black/12 dark:border-white/18 dark:bg-black/60'
                : 'w-3 border-black/18 bg-white/70 dark:border-white/12 dark:bg-black/55',
            ].join(' ')}
          >
            <span className="pointer-events-none flex h-full items-center justify-center text-black/55 dark:text-white/70">
              {isResizing || isResizerHover ? (
                <ChevronsLeftRight className="size-3.5" />
              ) : (
                <GripVertical className="size-3.5" />
              )}
            </span>
          </button>
        </div>

        <section className={managementModuleDetailPanelClass(gl)}>
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-1 md:p-2">
            {active === 'elementTypes' && <ElementTypesAdminPanel />}
            {active === 'typologies' && <TypologiesAdminPanel />}
            {active === 'dimensions' && <DimensionsAdminPanel />}
            {active === 'sizeFormats' && <SizeFormatsAdminPanel />}
            {active === 'ifcMapping' && <IfcMappingAdminPanel />}
            {active === 'firms' && <FirmsAdminPanel />}
            {active === 'namingTemplates' && <NamingTemplatesAdminPanel />}
            {active === 'firmOverrides' && <FirmOverridesAdminPanel />}
          </div>
        </section>
      </div>
    </ManagementModuleShell>
  )
}
