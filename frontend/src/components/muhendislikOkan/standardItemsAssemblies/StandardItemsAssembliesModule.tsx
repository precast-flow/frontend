import { useCallback, useState } from 'react'
import { useI18n } from '../../../i18n/I18nProvider'
import { StandardItemsDetailView } from './StandardItemsDetailView'
import { formShapeFromInitial, type FormShape, StandardItemsFormView } from './StandardItemsFormView'
import { StandardItemsListView } from './StandardItemsListView'
import type { StandardAssembly } from './standardItemsAssembliesMock'
import { initialStandardAssemblies, newId } from './standardItemsAssembliesMock'

type Screen = 'list' | 'form' | 'detail'

function cloneAssembly(a: StandardAssembly): StandardAssembly {
  return {
    ...a,
    components: a.components.map((c) => ({ ...c })),
  }
}

function assemblyToForm(a: StandardAssembly): FormShape {
  return {
    location: a.location,
    itemCode: a.itemCode,
    description: a.description,
    unitCode: a.unitCode,
    active: a.active,
  }
}

type Props = {
  onCloseModule: () => void
}

export function StandardItemsAssembliesModule({ onCloseModule }: Props) {
  const { t } = useI18n()
  const [items, setItems] = useState<StandardAssembly[]>(() => initialStandardAssemblies.map(cloneAssembly))
  const [screen, setScreen] = useState<Screen>('list')
  const [formMode, setFormMode] = useState<'new' | 'edit'>('new')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formInitial, setFormInitial] = useState<FormShape>(() => formShapeFromInitial())
  const [detailId, setDetailId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2600)
  }, [])

  const goList = useCallback(() => {
    setScreen('list')
    setEditingId(null)
    setDetailId(null)
  }, [])

  const commitForm = (v: FormShape): string => {
    if (formMode === 'edit' && editingId) {
      setItems((prev) =>
        prev.map((x) =>
          x.id === editingId
            ? {
                ...x,
                location: v.location,
                itemCode: v.itemCode.trim(),
                description: v.description.trim(),
                unitCode: v.unitCode,
                active: v.active,
              }
            : x,
        ),
      )
      return editingId
    }
    const nid = newId('sia')
    const created: StandardAssembly = {
      id: nid,
      location: v.location,
      itemCode: v.itemCode.trim(),
      description: v.description.trim(),
      unitCode: v.unitCode,
      active: v.active,
      components: [],
    }
    setItems((prev) => [...prev, created])
    return nid
  }

  const handleAddNew = () => {
    setFormMode('new')
    setEditingId(null)
    setFormInitial(formShapeFromInitial({ active: true }))
    setScreen('form')
  }

  const handleEdit = (id: string) => {
    const row = items.find((x) => x.id === id)
    if (!row) return
    setFormMode('edit')
    setEditingId(id)
    setFormInitial(assemblyToForm(row))
    setScreen('form')
  }

  const handleView = (id: string) => {
    setDetailId(id)
    setScreen('detail')
  }

  const handleCopy = (id: string) => {
    const row = items.find((x) => x.id === id)
    if (!row) return
    setFormMode('new')
    setEditingId(null)
    setFormInitial(
      formShapeFromInitial({
        ...assemblyToForm(row),
        itemCode: `${row.itemCode}-COPY`,
      }),
    )
    setScreen('form')
  }

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id))
    showToast(t('sia.toast.deleted'))
  }

  const handleFormSave = (v: FormShape) => {
    const id = commitForm(v)
    if (formMode === 'new') {
      setFormMode('edit')
      setEditingId(id)
    }
    setFormInitial(v)
    showToast(t('sia.toast.saved'))
  }

  const handleFormSaveClose = (v: FormShape) => {
    commitForm(v)
    showToast(t('sia.toast.saved'))
    goList()
  }

  const detailAssembly = detailId ? items.find((x) => x.id === detailId) : null

  const handleDetailSave = (next: StandardAssembly) => {
    setItems((prev) => prev.map((x) => (x.id === next.id ? cloneAssembly(next) : x)))
    showToast(t('sia.toast.saved'))
  }

  return (
    <div className="flex min-h-0 min-h-[28rem] flex-1 flex-col overflow-hidden">
      <div className="okan-liquid-panel relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl p-3 shadow-[var(--okan-panel-shadow)] sm:p-4">
        {toast ? (
          <div
            role="status"
            className="pointer-events-none fixed bottom-6 left-1/2 z-[120] -translate-x-1/2 rounded-full border border-[var(--okan-panel-border)] bg-[var(--okan-panel-bg)] px-4 py-2 text-sm font-medium text-[var(--okan-text)] shadow-[var(--okan-panel-shadow)] backdrop-blur-md dark:border-[var(--okan-panel-border)]"
          >
            {toast}
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col">
          {screen === 'list' ? (
            <StandardItemsListView
              rows={items}
              onAddNew={handleAddNew}
              onClose={onCloseModule}
              onEdit={handleEdit}
              onView={handleView}
              onCopy={handleCopy}
              onDelete={handleDelete}
            />
          ) : null}

          {screen === 'form' ? (
            <StandardItemsFormView
              mode={formMode}
              initial={formInitial}
              itemCodeLabel={editingId ? items.find((x) => x.id === editingId)?.itemCode : undefined}
              onSave={handleFormSave}
              onSaveAndClose={handleFormSaveClose}
              onRequestClose={goList}
            />
          ) : null}

          {screen === 'detail' && detailAssembly ? (
            <StandardItemsDetailView assembly={detailAssembly} onSave={handleDetailSave} onClose={goList} />
          ) : null}
        </div>
      </div>
    </div>
  )
}
