import type { StandardSeriesTemplate } from '../elementIdentity/types'

/** İlk boş depoda doldurulacak örnek seri şablonları */
export function defaultStandardSeriesTemplates(firmId: string): StandardSeriesTemplate[] {
  const now = new Date().toISOString()
  return [
    {
      id: 'sst-seed-mh',
      firmId,
      code: 'MH-010',
      name: 'Menhol gövdesi seri',
      active: true,
      description: 'Kanalizasyon / yağmur suyu prefabrik menhol gövdesi — seri üretim.',
      elementTypeId: 'inf-manhole',
      typologyId: 'beam-rect',
      updatedAt: now,
    },
    {
      id: 'sst-seed-pk',
      firmId,
      code: 'PK-200',
      name: 'Parke / döşeme slab',
      active: true,
      description: 'Peyzaj döşeme ünitesi.',
      elementTypeId: 'land-paver',
      typologyId: 'beam-rect',
      updatedAt: now,
    },
    {
      id: 'sst-seed-gb5010',
      firmId,
      code: 'GB-5010',
      name: 'Gürültü bariyeri assembly 5010',
      active: true,
      description: 'Otoyol gürültü bariyeri seri seti — montaj bileşenleri özeti.',
      elementTypeId: 'env-noise-wall',
      typologyId: 'beam-rect',
      assemblyComponents: [
        { id: 'ac-gb-1', label: 'Ana panel 5000×2400', quantity: 1, unit: 'adet' },
        { id: 'ac-gb-2', label: 'Denge ağırlığı', quantity: 2, unit: 'adet' },
        { id: 'ac-gb-3', label: 'Bağlantı ankraj seti', quantity: 4, unit: 'set' },
      ],
      updatedAt: now,
    },
  ]
}
