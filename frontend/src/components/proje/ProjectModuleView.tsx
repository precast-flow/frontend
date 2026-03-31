import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ChevronDown,
  FileText,
  LayoutGrid,
  List,
  Table2,
  Upload,
  UserPlus,
} from 'lucide-react'
import {
  macroSteps,
  projects,
  statusLabel,
  type Project,
  type ProjectElement,
} from '../../data/projectsMock'
import {
  getFilesForProject,
  getMessagesForProject,
  getTimelineForProject,
  lastActivityLine,
  MESSAGE_STAGE_LABELS,
  MENTION_USERS,
  PROJECT_SUMMARY_BLURBS,
  type MessageStageTag,
  type ProjectDrawingFile,
  type ProjectThreadMessage,
} from '../../data/projectPageBie02Mock'
import { useFactoryContext } from '../../context/FactoryContext'
import { ProjectMesModal } from './ProjectMesModal'
import { ProjectRevisionDrawer } from './ProjectRevisionDrawer'

const tabs = [
  { id: 'ozet', label: 'Özet' },
  { id: 'zaman', label: 'Zaman çizelgesi / Günlük' },
  { id: 'mesajlar', label: 'Mesajlar' },
  { id: 'dosyalar', label: 'Dosyalar / Çizimler' },
  { id: 'elemanlar', label: 'Eleman listesi' },
  { id: 'riskler', label: 'Riskler' },
] as const

type TabId = (typeof tabs)[number]['id']

type Props = {
  onNavigate: (moduleId: string) => void
}

export function ProjectModuleView({ onNavigate }: Props) {
  const navigate = useNavigate()
  const { contextTitle, isFactoryInScope } = useFactoryContext()
  const [searchParams] = useSearchParams()
  const projectFromUrlApplied = useRef(false)
  const [projectId, setProjectId] = useState(projects[0]!.id)
  const [tab, setTab] = useState<TabId>('ozet')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [mesOpen, setMesOpen] = useState(false)
  const [revisionOpen, setRevisionOpen] = useState(false)

  const project = useMemo(
    () => projects.find((p) => p.id === projectId) ?? projects[0]!,
    [projectId],
  )

  useEffect(() => {
    setSelected(new Set())
  }, [projectId])

  useEffect(() => {
    const pid = searchParams.get('project')
    if (!pid || projectFromUrlApplied.current) return
    if (projects.some((p) => p.id === pid)) {
      setProjectId(pid)
      projectFromUrlApplied.current = true
    }
  }, [searchParams])

  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam && tabs.some((x) => x.id === tabParam)) {
      setTab(tabParam as TabId)
    }
  }, [searchParams])

  const toggleRow = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = (list: ProjectElement[]) => {
    if (selected.size === list.length) setSelected(new Set())
    else setSelected(new Set(list.map((e) => e.id)))
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <ProjectMesModal
        open={mesOpen}
        onClose={() => setMesOpen(false)}
        onConfirm={() => onNavigate('mes')}
        projectName={project.name}
      />
      <ProjectRevisionDrawer
        open={revisionOpen}
        projectCode={project.code}
        projectName={project.name}
        onClose={() => setRevisionOpen(false)}
      />

      <div className="flex flex-col gap-2 text-xs text-gray-600 dark:text-gray-400">
        <p>
          <strong className="text-gray-800 dark:text-gray-200">bie-02:</strong> Tek proje sayfası — özet, günlük, mesaj
          thread’i, dosyalar (mock).
        </p>
        <p>
          Fabrika bağlamı: <span className="font-medium text-gray-800 dark:text-gray-200">{contextTitle}</span> — proje
          fabrika kodu salt okunur (mock).
        </p>
        <p
          className="rounded-xl bg-gray-50 px-3 py-2 text-gray-700 shadow-neo-in dark:bg-gray-950/80 dark:text-gray-200"
          title="Son aktivite özeti (bie-02 P1)"
        >
          <span className="font-semibold text-gray-800 dark:text-gray-100">Son aktivite:</span>{' '}
          {lastActivityLine(project.id)}
        </p>
      </div>

      {/* Header — P0 */}
      <header className="rounded-2xl bg-gray-100 p-4 shadow-neo-out-sm md:p-5 dark:bg-gray-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <label className="sr-only" htmlFor="project-picker">
                Proje seç
              </label>
              <div className="relative">
                <select
                  id="project-picker"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="appearance-none rounded-xl border-0 bg-gray-100 py-2 pl-3 pr-10 text-sm font-semibold text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-900 dark:text-gray-50"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} — {p.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-500 dark:text-gray-400"
                  aria-hidden
                />
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-gray-200/90 px-2 py-0.5 font-mono text-xs font-semibold text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                {project.code}
              </span>
              <span className="rounded-full bg-gray-200/90 px-2.5 py-0.5 text-xs font-semibold text-gray-800 ring-1 ring-gray-300/80 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-600/80">
                {statusLabel(project.status)}
              </span>
              <span
                className="rounded-full bg-gray-800 px-2.5 py-0.5 text-xs font-semibold text-white shadow-neo-out-sm dark:bg-gray-200 dark:text-gray-900"
                title="Ana aşama (makro adım)"
              >
                Ana aşama: {macroSteps[project.currentStepIndex]}
              </span>
            </div>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-gray-900 dark:text-gray-50 md:text-2xl">
              {project.name}
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Müşteri: {project.customer}</p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-300">
              <span>
                Termin:{' '}
                <strong className="font-medium text-gray-900 dark:text-gray-50">{project.deadline}</strong>
              </span>
              <span className="text-gray-400 dark:text-gray-500" aria-hidden>
                ·
              </span>
              <span title="Salt okunur — tekliften veya ana veriden gelir (mock)">
                Fabrika:{' '}
                <strong className="font-mono font-medium text-gray-900 dark:text-gray-50">
                  {project.factoryCode}
                </strong>
                {isFactoryInScope(project.factoryCode) ? (
                  <span className="ml-1 text-xs text-emerald-700 dark:text-emerald-400">(üst çubukla uyumlu)</span>
                ) : (
                  <span className="ml-1 text-xs text-amber-800 dark:text-amber-300">(farklı fabrika)</span>
                )}
              </span>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Sorumlular
              </span>
              <div className="flex -space-x-2">
                {project.owners.map((ini) => (
                  <span
                    key={ini}
                    className="flex size-9 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-800 ring-2 ring-gray-100 shadow-neo-out-sm dark:bg-gray-700 dark:text-gray-100 dark:ring-gray-900"
                    title={ini}
                  >
                    {ini}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 lg:flex-col lg:items-stretch">
            <button
              type="button"
              onClick={() => setRevisionOpen(true)}
              className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-neo-out-sm transition active:shadow-neo-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:bg-gray-900 dark:text-gray-100 dark:ring-offset-gray-900"
            >
              Revizyon talebi
            </button>
            <button
              type="button"
              onClick={() => navigate(`/teklif?project=${project.id}`)}
              className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-neo-out-sm transition active:shadow-neo-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:bg-gray-900 dark:text-gray-100 dark:ring-offset-gray-900"
            >
              Teklif oluştur (bie-03)
            </button>
            <button
              type="button"
              onClick={() => setMesOpen(true)}
              className="rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white dark:ring-offset-gray-900"
            >
              Üretim emrine aktar
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-neo-out-sm transition active:shadow-neo-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:bg-gray-900 dark:text-gray-100 dark:ring-offset-gray-900"
            >
              <UserPlus className="size-4" aria-hidden />
              Paydaş ekle
            </button>
          </div>
        </div>
      </header>

      <div
        className="flex gap-1 overflow-x-auto rounded-full bg-gray-100 p-1 shadow-neo-in [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Proje sekmeleri"
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 snap-start rounded-full px-3 py-2 text-xs font-semibold whitespace-nowrap transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 md:text-sm ${
              tab === t.id
                ? 'bg-gray-100 text-gray-900 shadow-neo-out-sm dark:bg-gray-900 dark:text-gray-50'
                : 'text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1">
        {tab === 'ozet' ? <TabOzet project={project} onNavigate={onNavigate} /> : null}
        {tab === 'zaman' ? <TabZaman projectId={project.id} /> : null}
        {tab === 'mesajlar' ? <TabMesajlar projectId={project.id} /> : null}
        {tab === 'dosyalar' ? <TabDosyalar projectId={project.id} /> : null}
        {tab === 'elemanlar' ? (
          <TabElemanlar
            project={project}
            selected={selected}
            toggleRow={toggleRow}
            toggleAll={toggleAll}
            onOpenMes={() => setMesOpen(true)}
          />
        ) : null}
        {tab === 'riskler' ? <TabRiskler project={project} /> : null}
      </div>
    </div>
  )
}

function TabOzet({
  project,
  onNavigate,
}: {
  project: Project
  onNavigate: (moduleId: string) => void
}) {
  const blurb = PROJECT_SUMMARY_BLURBS[project.id] ?? 'Özet metni bu proje için tanımlı değil (mock).'
  return (
    <section className="space-y-5" aria-labelledby="ozet-h">
      <h3 id="ozet-h" className="sr-only">
        Özet — ilerleme
      </h3>
      <div className="rounded-2xl bg-gray-50 p-4 text-sm leading-relaxed text-gray-800 shadow-neo-in dark:bg-gray-950/80 dark:text-gray-200">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Kısa özet (bie-02)
        </p>
        <p className="mt-2">{blurb}</p>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex-wrap md:overflow-visible">
        {macroSteps.map((label, i) => {
          const allDone = project.status === 'tamamlandi'
          const done = allDone || i < project.currentStepIndex
          const current = !allDone && i === project.currentStepIndex
          return (
            <div
              key={label}
              className={`min-w-[6.5rem] flex-1 snap-start rounded-2xl px-3 py-3 text-center md:min-w-0 ${
                current
                  ? 'bg-gray-100 shadow-neo-out-sm ring-1 ring-gray-300/80 dark:bg-gray-900 dark:ring-gray-600/80'
                  : done
                    ? 'bg-gray-100 shadow-neo-out-sm dark:bg-gray-900'
                    : 'bg-gray-100/90 shadow-neo-in dark:bg-gray-950/80'
              }`}
            >
              <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">Adım {i + 1}</p>
              <p className="mt-1 text-xs font-bold text-gray-900 dark:text-gray-50 md:text-sm">{label}</p>
              {current ? (
                <p className="mt-1 text-[10px] font-medium text-gray-600 dark:text-gray-300">Devam ediyor</p>
              ) : null}
              {done ? (
                <p className="mt-1 text-[10px] font-medium text-gray-600 dark:text-gray-300">Tamam</p>
              ) : null}
            </div>
          )
        })}
      </div>

      {project.linkedQuote ? (
        <div className="rounded-xl bg-gray-50 p-4 shadow-neo-in dark:bg-gray-950/80">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
            Bağlantılı teklif (mock)
          </h4>
          <p className="mt-2 font-mono text-sm font-semibold text-gray-900 dark:text-gray-50">
            {project.linkedQuote.number}
          </p>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">
            Tutar: <span className="font-semibold">{project.linkedQuote.totalLabel}</span>
          </p>
          <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">{project.linkedQuote.hint}</p>
          <button
            type="button"
            onClick={() => onNavigate('quote')}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-neo-out-sm transition hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-900 dark:text-gray-100 dark:hover:text-white"
          >
            <FileText className="size-4" aria-hidden />
            Teklif modülüne git
          </button>
        </div>
      ) : (
        <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600 shadow-neo-in dark:bg-gray-950/80 dark:text-gray-400">
          Bu proje için bağlı teklif yok (mock).
        </p>
      )}
    </section>
  )
}

function TabZaman({ projectId }: { projectId: string }) {
  const events = getTimelineForProject(projectId)
  return (
    <div className="space-y-4">
      <section
        className="rounded-2xl bg-gray-100 p-4 shadow-neo-in dark:bg-gray-900"
        aria-label="Olay günlüğü — tekliften şantiyeye"
      >
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Günlük / zaman çizelgesi (bie-02)</h3>
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
          Tarih-saat, aktör ve kısa açıklama — mock olay akışı.
        </p>
        <ol className="mt-4 space-y-4 border-l-2 border-gray-300 pl-4 dark:border-gray-600">
          {events.map((ev) => (
            <li key={ev.id} className="relative">
              <span className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-gray-500 ring-4 ring-gray-100 dark:bg-gray-400 dark:ring-gray-900" />
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">{ev.at}</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                {ev.actor}{' '}
                <span className="text-xs font-normal text-gray-500 dark:text-gray-400">({ev.actorRole})</span>
              </p>
              <p className="mt-0.5 text-sm text-gray-700 dark:text-gray-300">{ev.description}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}

function TabMesajlar({ projectId }: { projectId: string }) {
  const [stageFilter, setStageFilter] = useState<MessageStageTag | 'all'>('all')
  const [draft, setDraft] = useState('')
  const [feedback, setFeedback] = useState('')
  const [feedbackSaved, setFeedbackSaved] = useState(false)
  const [messages, setMessages] = useState<ProjectThreadMessage[]>(() => getMessagesForProject(projectId))

  useEffect(() => {
    setMessages(getMessagesForProject(projectId))
    setDraft('')
    setFeedback('')
    setFeedbackSaved(false)
  }, [projectId])

  const filtered =
    stageFilter === 'all' ? messages : messages.filter((m) => m.stage === stageFilter)

  const sendMessage = () => {
    const t = draft.trim()
    if (!t) return
    setMessages((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        at: new Date().toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }),
        author: 'Siz (mock)',
        body: t,
        stage: 'proje_ofisi',
      },
    ])
    setDraft('')
  }

  const saveFeedback = () => {
    setFeedbackSaved(true)
    window.setTimeout(() => setFeedbackSaved(false), 3200)
  }

  const insertMention = (label: string) => {
    setDraft((d) => `${d}${d && !d.endsWith(' ') ? ' ' : ''}@${label.split('·')[0]?.trim() ?? label} `)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Proje içi thread — aşama etiketi ile filtre (klasör hissi).
        </p>
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-200">
          Aşama
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value as MessageStageTag | 'all')}
            className="rounded-xl border-0 bg-gray-100 px-3 py-2 text-sm text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100"
          >
            <option value="all">Tümü</option>
            {(Object.keys(MESSAGE_STAGE_LABELS) as MessageStageTag[]).map((k) => (
              <option key={k} value={k}>
                {MESSAGE_STAGE_LABELS[k]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul className="space-y-3" aria-label="Mesaj listesi">
        {filtered.map((m) => (
          <li
            key={m.id}
            className="rounded-2xl bg-gray-100 p-4 shadow-neo-out-sm dark:bg-gray-900/90"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                {MESSAGE_STAGE_LABELS[m.stage]}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{m.at}</span>
            </div>
            <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-50">{m.author}</p>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">{m.body}</p>
          </li>
        ))}
      </ul>

      <section className="rounded-2xl bg-gray-50 p-4 shadow-neo-in dark:bg-gray-950/80">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
          Yeni mesaj (mock)
        </h4>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-gray-500 dark:text-gray-400">@mention (P2):</span>
          <select
            className="max-w-[220px] rounded-lg border-0 bg-gray-100 px-2 py-1.5 text-xs text-gray-800 shadow-neo-in dark:bg-gray-900 dark:text-gray-100"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) insertMention(e.target.value)
              e.target.value = ''
            }}
          >
            <option value="">Kullanıcı seç…</option>
            {MENTION_USERS.map((u) => (
              <option key={u.id} value={u.label}>
                {u.label}
              </option>
            ))}
          </select>
        </div>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          placeholder="Proje ofisi veya paydaş notu…"
          className="mt-2 w-full resize-y rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm text-gray-900 shadow-neo-in placeholder:text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-900 dark:text-gray-100"
        />
        <button
          type="button"
          onClick={sendMessage}
          className="mt-3 rounded-xl bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-neo-out-sm hover:bg-gray-900 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white"
        >
          Gönder
        </button>
      </section>

      <section className="rounded-2xl border border-gray-200/80 bg-gray-50 p-4 dark:border-gray-700/80 dark:bg-gray-950/60">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Proje ofisi — geri bildirim</h4>
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
          Tek paragraf yanıt; kayıt sunucuya gitmez (mock).
        </p>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={3}
          placeholder="Müşteri / ofis geri bildirimi…"
          className="mt-3 w-full resize-y rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm text-gray-900 shadow-neo-in dark:bg-gray-900 dark:text-gray-100"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={saveFeedback}
            className="rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm dark:bg-gray-200 dark:text-gray-900"
          >
            Yanıtla ve kaydet
          </button>
          {feedbackSaved ? (
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400" role="status">
              Taslak kaydedildi (mock).
            </span>
          ) : null}
        </div>
      </section>
    </div>
  )
}

type FileViewMode = 'grid' | 'list' | 'table'

function TabDosyalar({ projectId }: { projectId: string }) {
  const [view, setView] = useState<FileViewMode>('list')
  const [files, setFiles] = useState<ProjectDrawingFile[]>(() => getFilesForProject(projectId))

  useEffect(() => {
    setFiles(getFilesForProject(projectId))
  }, [projectId])

  const mockUpload = () => {
    setFiles((prev) => [
      ...prev,
      {
        id: `up-${Date.now()}`,
        name: `yukleme_${prev.length + 1}.pdf`,
        rev: 'Yeni',
        uploadedAt: new Date().toLocaleDateString('tr-TR'),
        sizeLabel: '0,5 MB',
        ext: 'pdf',
      },
    ])
  }

  const viewBtn = (mode: FileViewMode, Icon: typeof LayoutGrid, label: string) => (
    <button
      key={mode}
      type="button"
      title={label}
      onClick={() => setView(mode)}
      className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 ${
        view === mode
          ? 'bg-gray-800 text-white shadow-neo-out-sm dark:bg-gray-200 dark:text-gray-900'
          : 'bg-gray-100 text-gray-700 shadow-neo-in hover:text-gray-900 dark:bg-gray-900 dark:text-gray-200'
      }`}
    >
      <Icon className="size-4" aria-hidden />
      {label}
    </button>
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Çizim ve dokümanlar — revizyon no mock; görünüm seçici (00c uyumlu P1).
        </p>
        <div className="flex flex-wrap gap-2">
          {viewBtn('grid', LayoutGrid, 'Izgara')}
          {viewBtn('list', List, 'Liste')}
          {viewBtn('table', Table2, 'Tablo')}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={mockUpload}
          className="inline-flex items-center gap-2 rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm dark:bg-gray-200 dark:text-gray-900"
        >
          <Upload className="size-4" aria-hidden />
          Çizim yükle (mock)
        </button>
      </div>

      {view === 'table' ? (
        <div className="overflow-x-auto rounded-2xl bg-gray-100 p-2 shadow-neo-in dark:bg-gray-900">
          <table className="w-full min-w-[480px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200/90 text-xs font-semibold text-gray-600 dark:border-gray-700 dark:text-gray-400">
                <th className="px-3 py-2">Dosya</th>
                <th className="px-3 py-2">Rev.</th>
                <th className="px-3 py-2">Yüklenme</th>
                <th className="px-3 py-2">Boyut</th>
              </tr>
            </thead>
            <tbody>
              {files.map((f) => (
                <tr key={f.id} className="border-b border-gray-200/60 dark:border-gray-800/80">
                  <td className="px-3 py-2 font-mono text-xs text-gray-900 dark:text-gray-50">{f.name}</td>
                  <td className="px-3 py-2">{f.rev}</td>
                  <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{f.uploadedAt}</td>
                  <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{f.sizeLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {view === 'list' ? (
        <ul className="space-y-2">
          {files.map((f) => (
            <li
              key={f.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-gray-100 px-4 py-3 shadow-neo-out-sm dark:bg-gray-900"
            >
              <span className="font-mono text-sm font-medium text-gray-900 dark:text-gray-50">{f.name}</span>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                rev {f.rev} · {f.uploadedAt} · {f.sizeLabel}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {view === 'grid' ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((f) => (
            <li
              key={f.id}
              className="flex flex-col rounded-2xl bg-gray-100 p-4 shadow-neo-out-sm dark:bg-gray-900"
            >
              <span className="text-[10px] font-semibold uppercase text-gray-500 dark:text-gray-400">{f.ext}</span>
              <span className="mt-2 line-clamp-2 font-mono text-xs font-medium text-gray-900 dark:text-gray-50">
                {f.name}
              </span>
              <span className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                Rev. {f.rev} · {f.sizeLabel}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function TabElemanlar({
  project,
  selected,
  toggleRow,
  toggleAll,
  onOpenMes,
}: {
  project: Project
  selected: Set<string>
  toggleRow: (id: string) => void
  toggleAll: (list: ProjectElement[]) => void
  onOpenMes: () => void
}) {
  const n = selected.size
  const showBulk = n >= 1

  return (
    <div className="flex flex-col gap-3">
      {showBulk ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-gray-100 px-3 py-2.5 shadow-neo-out-sm dark:bg-gray-900">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">{n} eleman seçili</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => toggleAll(project.elements)}
              className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-neo-in hover:text-gray-900 dark:bg-gray-950 dark:text-gray-200 dark:hover:text-white"
            >
              Seçimi temizle
            </button>
            <button
              type="button"
              className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-800 shadow-neo-out-sm dark:bg-gray-800 dark:text-gray-100"
            >
              CSV dışa aktar
            </button>
            <button
              type="button"
              onClick={onOpenMes}
              className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-semibold text-white shadow-neo-out-sm dark:bg-gray-200 dark:text-gray-900"
            >
              Seçilenleri MES’e aktar
            </button>
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl bg-gray-100 p-3 shadow-neo-in dark:bg-gray-900">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Ara</span>
            <input
              type="search"
              placeholder="Kod, tip…"
              className="mt-1 w-full rounded-xl border-0 bg-gray-100 px-3 py-2 text-sm text-gray-800 shadow-neo-in placeholder:text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500"
            />
          </label>
          <label className="sm:w-40">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Durum</span>
            <select className="mt-1 w-full rounded-xl border-0 bg-gray-100 px-3 py-2 text-sm text-gray-800 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100">
              <option>Tümü</option>
              <option>Üretimde</option>
              <option>Beklemede</option>
            </select>
          </label>
          <button
            type="button"
            className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-800 shadow-neo-out-sm dark:bg-gray-800 dark:text-gray-100"
          >
            Uygula
          </button>
        </div>
      </div>

      {project.elements.length >= 10 ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Bu projede <span className="font-mono font-medium">{project.code}</span> için 10 satır mock (mvp-07).
        </p>
      ) : null}

      <div className="rounded-2xl bg-gray-100 p-2 shadow-neo-out-sm dark:bg-gray-900">
        <div className="overflow-x-auto rounded-xl border border-gray-200/60 bg-gray-50 dark:border-gray-700/60 dark:bg-gray-950/40">
          <table className="w-full min-w-[520px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200/90 bg-gray-100 text-xs font-semibold text-gray-600 dark:border-gray-700/90 dark:bg-gray-900/90 dark:text-gray-300">
                <th className="w-10 px-2 py-2">
                  <input
                    type="checkbox"
                    checked={project.elements.length > 0 && selected.size === project.elements.length}
                    onChange={() => toggleAll(project.elements)}
                    aria-label="Tümünü seç"
                    className="size-4 rounded border-gray-400 accent-gray-800 dark:accent-gray-200"
                  />
                </th>
                <th className="px-3 py-2.5">Eleman kodu</th>
                <th className="px-3 py-2.5">Tip</th>
                <th className="px-3 py-2.5">Durum</th>
                <th className="px-3 py-2.5">Revizyon</th>
              </tr>
            </thead>
            <tbody>
              {project.elements.map((row, i) => (
                <tr
                  key={row.id}
                  className={`border-b border-gray-200/70 dark:border-gray-700/70 ${i % 2 === 1 ? 'bg-gray-50 dark:bg-gray-950/50' : ''} hover:bg-gray-100 dark:hover:bg-gray-900/70`}
                >
                  <td className="px-2 py-2">
                    <input
                      type="checkbox"
                      checked={selected.has(row.id)}
                      onChange={() => toggleRow(row.id)}
                      aria-label={`Seç ${row.code}`}
                      className="size-4 rounded border-gray-400 accent-gray-800 dark:accent-gray-200"
                    />
                  </td>
                  <td className="px-3 py-2 font-mono text-xs font-medium text-gray-900 dark:text-gray-50">{row.code}</td>
                  <td className="px-3 py-2 text-gray-800 dark:text-gray-100">{row.type}</td>
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-200">{row.status}</td>
                  <td className="px-3 py-2 font-mono text-xs text-gray-600 dark:text-gray-300">{row.rev}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function TabRiskler({ project }: { project: Project }) {
  if (project.risks.length === 0) {
    return (
      <p className="rounded-xl bg-gray-100 p-4 text-sm text-gray-600 shadow-neo-in dark:bg-gray-900 dark:text-gray-300">
        Bu proje için kayıtlı risk yok.
      </p>
    )
  }
  return (
    <div>
      <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">P2 — Risk kartları (örnek)</p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {project.risks.map((r) => (
          <li key={r.id} className="rounded-xl bg-gray-100 p-4 shadow-neo-out-sm dark:bg-gray-900">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">{r.title}</p>
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">
              Etki:{' '}
              <span className="font-medium text-gray-800 dark:text-gray-100">
                {r.impact === 'yuksek' ? 'Yüksek' : r.impact === 'orta' ? 'Orta' : 'Düşük'}
              </span>
              {' · '}
              Sorumlu: {r.owner}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
