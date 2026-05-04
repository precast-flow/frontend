import { ApprovalFlowDesignerEditorSection, ApprovalFlowDesignerTemplateAside } from './ApprovalFlowDesignerSections'
import type { ApprovalFlowDesignerState } from './useApprovalFlowDesignerState'

/** Eski neo iki sütun düzen — karşılaştırma için `?legacy=1`. */
export function ApprovalFlowDesignerLegacy(props: ApprovalFlowDesignerState) {
  const onDeleteTemplate = (id: string) => {
    const tpl = props.templates.find((t) => t.id === id)
    if (!tpl) return
    const ok = window.confirm(`“${tpl.name}” şablonu silinsin mi? (prototip — geri al yok)`)
    if (!ok) return
    props.removeTemplate(id)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <div className="grid flex-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <div className="flex flex-col gap-5">
          <ApprovalFlowDesignerEditorSection variant="neo" {...props} />
        </div>
        <aside className="flex flex-col gap-4">
          <ApprovalFlowDesignerTemplateAside variant="neo" {...props} onDeleteTemplate={onDeleteTemplate} showPreview />
        </aside>
      </div>
    </div>
  )
}
