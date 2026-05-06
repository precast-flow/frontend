import { useState } from 'react'
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
  const [active, setActive] = useState<SectionKey>('elementTypes')

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-2 md:p-3 xl:grid xl:grid-cols-[260px_1fr]">
      <aside className="flex min-h-0 flex-col gap-4 overflow-auto rounded-2xl border border-white/20 bg-white/70 p-3 backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/40">
        <header className="flex flex-col gap-1 px-2 pt-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Yönetim
          </p>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
            Eleman Kimlik Yönetimi
          </h2>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            Sistem kataloğu ve firma katmanı verilerini buradan yönetin. Tüm değişiklikler tarayıcıda
            (mock + localStorage) saklanır.
          </p>
        </header>
        {SIDEBAR_GROUPS.map((group) => (
          <div key={group.id} className="flex flex-col gap-1">
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
      </aside>

      <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/70 p-4 backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/40">
        {active === 'elementTypes' && <ElementTypesAdminPanel />}
        {active === 'typologies' && <TypologiesAdminPanel />}
        {active === 'dimensions' && <DimensionsAdminPanel />}
        {active === 'sizeFormats' && <SizeFormatsAdminPanel />}
        {active === 'ifcMapping' && <IfcMappingAdminPanel />}
        {active === 'firms' && <FirmsAdminPanel />}
        {active === 'namingTemplates' && <NamingTemplatesAdminPanel />}
        {active === 'firmOverrides' && <FirmOverridesAdminPanel />}
      </section>
    </div>
  )
}
