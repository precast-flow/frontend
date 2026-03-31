/**
 * qual-02 — Numune listesi mock (10 satır).
 */

export type SampleSource = 'batch_pour' | 'field'

export type SampleStatus =
  | 'draft'
  | 'in_lab'
  | 'tests_pending'
  | 'passed'
  | 'failed'
  | 'cancelled'

export type QualitySampleRow = {
  id: string
  /** Görünen numune kimliği */
  sampleCode: string
  /** ISO tarih (gün) */
  takenAt: string
  factoryCode: string
  project: string
  orderNo: string
  source: SampleSource
  recipeCode: string
  status: SampleStatus
  responsible: string
  notes?: string
}

/** Detay — Genel sekmesi için ek alanlar */
export type QualitySampleDetail = QualitySampleRow & {
  concreteClass: string
  truckPlate?: string
  pourBatchId?: string
}

export const MOCK_QUALITY_SAMPLES: QualitySampleDetail[] = [
  {
    id: 's1',
    sampleCode: 'NUM-2025-0142',
    takenAt: '2025-03-18',
    factoryCode: 'IST-HAD',
    project: 'Metro L4',
    orderNo: 'MES-24088',
    source: 'batch_pour',
    recipeCode: 'C35/45-XF2',
    status: 'tests_pending',
    responsible: 'Ayşe Yılmaz',
    concreteClass: 'C35/45',
    truckPlate: '34 ABC 102',
    pourBatchId: 'BP-2025-0318-01',
    notes: 'Santral dökümü — slump hedef 140±30 mm.',
  },
  {
    id: 's2',
    sampleCode: 'NUM-2025-0141',
    takenAt: '2025-03-18',
    factoryCode: 'KOC-01',
    project: 'OSB Köprü',
    orderNo: 'MES-24071',
    source: 'field',
    recipeCode: 'C40/50-CEM',
    status: 'in_lab',
    responsible: 'Burak Demir',
    concreteClass: 'C40/50',
    notes: 'Saha numunesi — vibrasyon sonrası alındı.',
  },
  {
    id: 's3',
    sampleCode: 'NUM-2025-0140',
    takenAt: '2025-03-17',
    factoryCode: 'IST-HAD',
    project: 'Konut A',
    orderNo: 'MES-24055',
    source: 'batch_pour',
    recipeCode: 'C30/37-S4',
    status: 'passed',
    responsible: 'Ayşe Yılmaz',
    concreteClass: 'C30/37',
    pourBatchId: 'BP-2025-0317-04',
  },
  {
    id: 's4',
    sampleCode: 'NUM-2025-0139',
    takenAt: '2025-03-17',
    factoryCode: 'ANK-01',
    project: 'Depo D1',
    orderNo: 'MES-24040',
    source: 'batch_pour',
    recipeCode: 'C25/30-STD',
    status: 'failed',
    responsible: 'Can Arslan',
    concreteClass: 'C25/30',
    notes: 'Basınç alt sınırın altında — tekrar numune açıldı.',
  },
  {
    id: 's5',
    sampleCode: 'NUM-2025-0138',
    takenAt: '2025-03-16',
    factoryCode: 'KOC-01',
    project: 'OSB Köprü',
    orderNo: 'MES-24033',
    source: 'field',
    recipeCode: 'C40/50-CEM',
    status: 'draft',
    responsible: 'Burak Demir',
    concreteClass: 'C40/50',
  },
  {
    id: 's6',
    sampleCode: 'NUM-2025-0137',
    takenAt: '2025-03-16',
    factoryCode: 'IST-HAD',
    project: 'Metro L4',
    orderNo: 'MES-24022',
    source: 'batch_pour',
    recipeCode: 'C35/45-XF2',
    status: 'cancelled',
    responsible: 'Mehmet Öz',
    concreteClass: 'C35/45',
    notes: 'Etiket hatası — iptal, yeni numune alındı.',
  },
  {
    id: 's7',
    sampleCode: 'NUM-2025-0136',
    takenAt: '2025-03-15',
    factoryCode: 'ANK-01',
    project: 'YHT istasyonu',
    orderNo: 'MES-24010',
    source: 'batch_pour',
    recipeCode: 'C45/55-HPC',
    status: 'tests_pending',
    responsible: 'Can Arslan',
    concreteClass: 'C45/55',
    pourBatchId: 'BP-2025-0315-02',
  },
  {
    id: 's8',
    sampleCode: 'NUM-2025-0135',
    takenAt: '2025-03-15',
    factoryCode: 'IST-HAD',
    project: 'Konut A',
    orderNo: 'MES-23998',
    source: 'field',
    recipeCode: 'C30/37-S4',
    status: 'in_lab',
    responsible: 'Ayşe Yılmaz',
    concreteClass: 'C30/37',
  },
  {
    id: 's9',
    sampleCode: 'NUM-2025-0134',
    takenAt: '2025-03-14',
    factoryCode: 'KOC-01',
    project: 'Liman revizyon',
    orderNo: 'MES-23980',
    source: 'batch_pour',
    recipeCode: 'C32/40-MAR',
    status: 'passed',
    responsible: 'Elif Korkmaz',
    concreteClass: 'C32/40',
    pourBatchId: 'BP-2025-0314-09',
  },
  {
    id: 's10',
    sampleCode: 'NUM-2025-0133',
    takenAt: '2025-03-14',
    factoryCode: 'ANK-01',
    project: 'Depo D1',
    orderNo: 'MES-23975',
    source: 'batch_pour',
    recipeCode: 'C25/30-STD',
    status: 'tests_pending',
    responsible: 'Can Arslan',
    concreteClass: 'C25/30',
  },
]

export type MockSampleTest = {
  id: string
  nameKey: string
  resultKey: string
  state: 'pending' | 'ok' | 'fail'
}

export function getMockTestsForSample(sampleId: string): MockSampleTest[] {
  const base: MockSampleTest[] = [
    { id: 't1', nameKey: 'qualitySamples.test.slump', resultKey: 'qualitySamples.test.res.slump', state: 'ok' },
    { id: 't2', nameKey: 'qualitySamples.test.air', resultKey: 'qualitySamples.test.res.air', state: 'pending' },
    {
      id: 't3',
      nameKey: 'qualitySamples.test.compress28',
      resultKey: 'qualitySamples.test.res.compress28',
      state: 'pending',
    },
  ]
  if (sampleId === 's4') {
    return [
      { ...base[0], state: 'ok' },
      { ...base[1], state: 'ok' },
      { ...base[2], state: 'fail', resultKey: 'qualitySamples.test.res.compress28Fail' },
    ]
  }
  return base
}

export type MockAttachment = { id: string; nameKey: string; metaKey: string }

export function getMockAttachments(sampleId: string): MockAttachment[] {
  return [
    { id: 'a1', nameKey: 'qualitySamples.attach.photo', metaKey: 'qualitySamples.attach.meta1' },
    { id: 'a2', nameKey: 'qualitySamples.attach.pdf', metaKey: 'qualitySamples.attach.meta2' },
    ...(sampleId === 's2'
      ? [{ id: 'a3', nameKey: 'qualitySamples.attach.field', metaKey: 'qualitySamples.attach.meta3' }]
      : []),
  ]
}

export type MockReportHistory = { id: string; at: string; labelKey: string; stateKey: string }

export function getMockReportHistory(sampleId: string): MockReportHistory[] {
  return [
    {
      id: 'r1',
      at: '2025-03-19 09:12',
      labelKey: 'qualitySamples.report.v1',
      stateKey: 'qualitySamples.report.stateDraft',
    },
    {
      id: 'r2',
      at: '2025-03-17 16:40',
      labelKey: 'qualitySamples.report.v0',
      stateKey: 'qualitySamples.report.stateSuperseded',
    },
    ...(sampleId === 's3'
      ? [
          {
            id: 'r3',
            at: '2025-03-18 11:05',
            labelKey: 'qualitySamples.report.signed',
            stateKey: 'qualitySamples.report.stateSent',
          },
        ]
      : []),
  ]
}
