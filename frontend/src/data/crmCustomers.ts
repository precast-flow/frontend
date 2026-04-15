export type CrmCustomerStatus = 'aktif' | 'beklemede' | 'pasif' | 'potansiyel'

export type CrmProjectRow = { id: string; name: string; phase: string }
export type CrmQuoteRow = { id: string; no: string; date: string; amount: string; status: string }
export type CrmDocRow = { id: string; name: string; size: string; date: string }

/** Müşteri detay — İletişim sekmesi (mock) */
export type CrmIletisimKisi = {
  id: string
  adSoyad: string
  gorev: string
  cep: string
  email: string
  /** Birincil ilgili kişi */
  birincil?: boolean
}

export type CrmIletisim = {
  sabitHat: string
  infoEmail: string
  web?: string
  faks?: string
  /** Şehir dışında kısa adres notu */
  adresNotu?: string
  kisiler: CrmIletisimKisi[]
}

export type CrmCustomer = {
  id: string
  /** Ünvan */
  name: string
  code: string
  sector: string
  lastActivity: string
  status: CrmCustomerStatus
  openQuotes: number
  taxId: string
  createdAt: string
  owner: string
  city: string
  notes: string
  /** İlgili kişi */
  contactPerson: string
  /** Son teklif tarihi (liste kolonu) */
  lastQuoteDate: string
  /** İletişim sekmesi */
  iletisim: CrmIletisim
  /** P1 — etiketler */
  tags: string[]
  /** P1 — hangi fabrika bağlamında görünür (üst seçici ile filtre) */
  factories: string[]
  projeler: CrmProjectRow[]
  teklifler: CrmQuoteRow[]
  dokumanlar: CrmDocRow[]
}

export const crmCustomers: CrmCustomer[] = [
  {
    id: 'c1',
    name: 'Yapıtaş İnşaat A.Ş.',
    code: 'M-1042',
    sector: 'Konut',
    lastActivity: 'Bugün 09:14',
    status: 'aktif',
    openQuotes: 2,
    taxId: '1234567890',
    createdAt: '12.08.2024',
    owner: 'Ayşe K.',
    city: 'İstanbul',
    notes: 'Prefab köprü projesi ilgisi.',
    contactPerson: 'Ahmet Yurtsever',
    lastQuoteDate: '20.03.2025',
    iletisim: {
      sabitHat: '+90 212 555 01 01',
      infoEmail: 'info@yapitas.example',
      web: 'www.yapitas.example',
      faks: '+90 212 555 01 02',
      adresNotu: 'Hadımköy OSB, No: 12 · İstanbul',
      kisiler: [
        {
          id: 'ik1',
          adSoyad: 'Ahmet Yurtsever',
          gorev: 'Satın alma müdürü',
          cep: '+90 532 100 42 42',
          email: 'a.yurtsever@yapitas.example',
          birincil: true,
        },
        {
          id: 'ik2',
          adSoyad: 'Nilüfer Koç',
          gorev: 'Muhasebe',
          cep: '+90 533 200 33 11',
          email: 'n.koc@yapitas.example',
        },
      ],
    },
    tags: ['VIP', 'Uzun vadeli'],
    factories: ['IST-HAD', 'KOC-01'],
    projeler: [
      { id: 'p1', name: 'Köprü ayakları C blok', phase: 'Üretim' },
      { id: 'p2', name: 'Hadımköy depo genişletme', phase: 'Keşif' },
    ],
    teklifler: [
      { id: 't1', no: 'T-2025-441', date: '20.03.2025', amount: '₺ 2,4M', status: 'Onay bekliyor' },
      { id: 't2', no: 'T-2025-398', date: '02.03.2025', amount: '₺ 890K', status: 'Revizyon' },
      { id: 't3', no: 'T-2024-901', date: '12.11.2024', amount: '₺ 1,1M', status: 'Kapalı' },
    ],
    dokumanlar: [
      { id: 'd1', name: 'Çerçeve_sözleşme.pdf', size: '1,2 MB', date: '10.03.2025' },
      { id: 'd2', name: 'Teknik_ek_R2.dwg', size: '8,4 MB', date: '18.02.2025' },
    ],
  },
  {
    id: 'c2',
    name: 'Metro Beton San.',
    code: 'M-0881',
    sector: 'Altyapı',
    lastActivity: 'Dün 16:40',
    status: 'aktif',
    openQuotes: 0,
    taxId: '9876543210',
    createdAt: '03.02.2023',
    owner: 'Mehmet D.',
    city: 'Ankara',
    notes: '',
    contactPerson: 'Selin Erden',
    lastQuoteDate: '14.02.2025',
    iletisim: {
      sabitHat: '+90 312 444 90 00',
      infoEmail: 'iletisim@metrobeton.example',
      web: 'www.metrobeton.example',
      adresNotu: 'Ostim OSB 1272. Sk. · Ankara',
      kisiler: [
        {
          id: 'ik3',
          adSoyad: 'Selin Erden',
          gorev: 'Proje koordinatörü',
          cep: '+90 505 330 12 12',
          email: 's.erden@metrobeton.example',
          birincil: true,
        },
        {
          id: 'ik4',
          adSoyad: 'Umut Şahin',
          gorev: 'Saha şefi',
          cep: '+90 506 441 09 87',
          email: 'u.sahin@metrobeton.example',
        },
      ],
    },
    tags: ['Kamu'],
    factories: ['ANK-01'],
    projeler: [
      { id: 'p3', name: 'Metro hat lot 4', phase: 'Planlama' },
      { id: 'p4', name: 'Viyadük kirişleri', phase: 'Teklif' },
    ],
    teklifler: [
      { id: 't4', no: 'T-2025-201', date: '14.02.2025', amount: '₺ 3,1M', status: 'Taslak' },
      { id: 't5', no: 'T-2024-778', date: '05.12.2024', amount: '₺ 450K', status: 'Red' },
      { id: 't6', no: 'T-2024-701', date: '22.10.2024', amount: '₺ 2,0M', status: 'Kapalı' },
    ],
    dokumanlar: [{ id: 'd3', name: 'KVKK_izin.pdf', size: '240 KB', date: '03.02.2023' }],
  },
  {
    id: 'c3',
    name: 'Vadi Prefab Ltd.',
    code: 'M-1203',
    sector: 'Endüstriyel',
    lastActivity: '18 Mar',
    status: 'beklemede',
    openQuotes: 1,
    taxId: '5550441233',
    createdAt: '18.11.2025',
    owner: 'Ayşe K.',
    city: 'İzmir',
    notes: 'Teklif revizyonu bekleniyor.',
    contactPerson: 'Oğuz Karaca',
    lastQuoteDate: '18.03.2025',
    iletisim: {
      sabitHat: '+90 232 778 44 10',
      infoEmail: 'fabrika@vadiprefab.example',
      web: 'www.vadiprefab.example',
      adresNotu: 'Çiğli Atatürk OSB · İzmir',
      kisiler: [
        {
          id: 'ik5',
          adSoyad: 'Oğuz Karaca',
          gorev: 'Genel müdür yardımcısı',
          cep: '+90 542 901 22 33',
          email: 'o.karaca@vadiprefab.example',
          birincil: true,
        },
      ],
    },
    tags: ['Hızlı karar'],
    factories: ['IST-HAD'],
    projeler: [
      { id: 'p5', name: 'Fabrika çatı elemanları', phase: 'Üretim' },
      { id: 'p6', name: 'Depo raf kolonları', phase: 'Duraklatıldı' },
    ],
    teklifler: [
      { id: 't7', no: 'T-2025-512', date: '18.03.2025', amount: '₺ 760K', status: 'Revizyon' },
      { id: 't8', no: 'T-2025-480', date: '01.03.2025', amount: '₺ 120K', status: 'Kapalı' },
      { id: 't9', no: 'T-2024-990', date: '20.12.2024', amount: '₺ 2,2M', status: 'Kapalı' },
    ],
    dokumanlar: [
      { id: 'd4', name: 'Kapasite_teyit.xlsx', size: '88 KB', date: '12.03.2025' },
      { id: 'd5', name: 'Foto_saha.zip', size: '42 MB', date: '08.03.2025' },
    ],
  },
  {
    id: 'c4',
    name: 'Kıyı Yapı Kooperatifi',
    code: 'M-0455',
    sector: 'Konut',
    lastActivity: '10 Mar',
    status: 'pasif',
    openQuotes: 0,
    taxId: '3300123456',
    createdAt: '22.01.2022',
    owner: 'Mehmet D.',
    city: 'Antalya',
    notes: 'Son görüşme olumsuz.',
    contactPerson: 'Deniz Aksoy',
    lastQuoteDate: '02.12.2024',
    iletisim: {
      sabitHat: '+90 242 333 11 00',
      infoEmail: 'yonetim@kiyiyapi.example',
      adresNotu: 'Lara, Fener Mah. · Antalya',
      kisiler: [
        {
          id: 'ik6',
          adSoyad: 'Deniz Aksoy',
          gorev: 'Yönetim kurulu üyesi',
          cep: '+90 533 778 90 01',
          email: 'd.aksoy@kiyiyapi.example',
          birincil: true,
        },
      ],
    },
    tags: [],
    factories: ['IST-HAD'],
    projeler: [
      { id: 'p7', name: 'Site A blok', phase: 'İptal' },
      { id: 'p8', name: 'Site B blok', phase: 'İptal' },
    ],
    teklifler: [
      { id: 't10', no: 'T-2024-120', date: '02.12.2024', amount: '₺ 5,0M', status: 'Kapalı' },
      { id: 't11', no: 'T-2023-880', date: '15.06.2023', amount: '₺ 1,8M', status: 'Kapalı' },
      { id: 't12', no: 'T-2023-801', date: '03.01.2023', amount: '₺ 900K', status: 'Kapalı' },
    ],
    dokumanlar: [],
  },
  {
    id: 'c5',
    name: 'Anadolu Enerji A.Ş.',
    code: 'M-1301',
    sector: 'Endüstriyel',
    lastActivity: '—',
    status: 'potansiyel',
    openQuotes: 0,
    taxId: '6611223344',
    createdAt: '15.03.2025',
    owner: 'Zeynep A.',
    city: 'Kocaeli',
    notes: 'İlk görüşme planlanıyor.',
    contactPerson: 'Cem Öztürk',
    lastQuoteDate: '—',
    iletisim: {
      sabitHat: '+90 262 660 12 34',
      infoEmail: 'info@anadoluenerji.example',
      web: 'www.anadoluenerji.example',
      adresNotu: 'Gebze Teknopark · Kocaeli',
      kisiler: [
        {
          id: 'ik7',
          adSoyad: 'Cem Öztürk',
          gorev: 'Yatırımlar müdürü',
          cep: '+90 530 112 45 67',
          email: 'c.ozturk@anadoluenerji.example',
          birincil: true,
        },
        {
          id: 'ik8',
          adSoyad: 'Pelin Arı',
          gorev: 'Satın alma uzmanı',
          cep: '+90 531 998 00 21',
          email: 'p.ari@anadoluenerji.example',
        },
      ],
    },
    tags: ['Yeni', 'Sıcak'],
    factories: ['KOC-01'],
    projeler: [
      { id: 'p9', name: 'Trafo binası (ön değerlendirme)', phase: 'Ön keşif' },
      { id: 'p10', name: 'Kompresör temeli', phase: 'Fikir aşaması' },
    ],
    teklifler: [
      { id: 't13', no: '—', date: '—', amount: '—', status: 'Yok' },
      { id: 't14', no: '—', date: '—', amount: '—', status: 'Yok' },
      { id: 't15', no: '—', date: '—', amount: '—', status: 'Yok' },
    ],
    dokumanlar: [],
  },
  {
    id: 'c6',
    name: 'Ege Köprü İnş.',
    code: 'M-0770',
    sector: 'Altyapı',
    lastActivity: '19 Mar',
    status: 'aktif',
    openQuotes: 1,
    taxId: '4488990011',
    createdAt: '04.05.2024',
    owner: 'Ayşe K.',
    city: 'İzmir',
    notes: 'Kıyı koruma projesi.',
    contactPerson: 'Burcu Işık',
    lastQuoteDate: '19.03.2025',
    iletisim: {
      sabitHat: '+90 232 555 77 88',
      infoEmail: 'santiye@egekopru.example',
      adresNotu: 'Aliağa üretim tesisi · İzmir',
      kisiler: [
        {
          id: 'ik9',
          adSoyad: 'Burcu Işık',
          gorev: 'Teknik ofis şefi',
          cep: '+90 544 200 11 44',
          email: 'b.isik@egekopru.example',
          birincil: true,
        },
        {
          id: 'ik10',
          adSoyad: 'Kaan Yılmaz',
          gorev: 'İş güvenliği',
          cep: '+90 545 300 55 66',
          email: 'k.yilmaz@egekopru.example',
        },
      ],
    },
    tags: ['Teknik zor'],
    factories: ['IST-HAD', 'ANK-01'],
    projeler: [
      { id: 'p11', name: 'Köprü korkuluk modülleri', phase: 'Üretim' },
      { id: 'p12', name: 'Rıhtım paneli', phase: 'Lojistik' },
    ],
    teklifler: [
      { id: 't16', no: 'T-2025-600', date: '19.03.2025', amount: '₺ 4,2M', status: 'Onay bekliyor' },
      { id: 't17', no: 'T-2025-410', date: '28.02.2025', amount: '₺ 1,0M', status: 'Kapalı' },
      { id: 't18', no: 'T-2024-850', date: '10.09.2024', amount: '₺ 600K', status: 'Kapalı' },
    ],
    dokumanlar: [{ id: 'd6', name: 'Saha_ölçü.pdf', size: '3,1 MB', date: '12.03.2025' }],
  },
  {
    id: 'c7',
    name: 'Kentsel Dönüşüm A.Ş.',
    code: 'M-0912',
    sector: 'Konut',
    lastActivity: '20 Mar',
    status: 'aktif',
    openQuotes: 3,
    taxId: '2233445566',
    createdAt: '01.01.2025',
    owner: 'Mehmet D.',
    city: 'İstanbul',
    notes: 'Çok projeli hesap.',
    contactPerson: 'Ebru Tan',
    lastQuoteDate: '21.03.2025',
    iletisim: {
      sabitHat: '+90 216 888 22 11',
      infoEmail: 'merkez@kentseldonusum.example',
      web: 'www.kentseldonusum.example',
      faks: '+90 216 888 22 12',
      adresNotu: 'Ataşehir Finans Merkezi · İstanbul',
      kisiler: [
        {
          id: 'ik11',
          adSoyad: 'Ebru Tan',
          gorev: 'Operasyon direktörü',
          cep: '+90 532 600 77 88',
          email: 'e.tan@kentseldonusum.example',
          birincil: true,
        },
        {
          id: 'ik12',
          adSoyad: 'Serkan Polat',
          gorev: 'Sözleşme ve hukuk',
          cep: '+90 533 400 12 90',
          email: 's.polat@kentseldonusum.example',
        },
      ],
    },
    tags: ['Çok proje', 'VIP'],
    factories: ['IST-HAD'],
    projeler: [
      { id: 'p13', name: 'Blok 1–4 kolonlar', phase: 'Üretim' },
      { id: 'p14', name: 'Sosyal tesis çatı', phase: 'Keşif' },
    ],
    teklifler: [
      { id: 't19', no: 'T-2025-700', date: '21.03.2025', amount: '₺ 8,5M', status: 'Onay bekliyor' },
      { id: 't20', no: 'T-2025-655', date: '15.03.2025', amount: '₺ 3,3M', status: 'Revizyon' },
      { id: 't21', no: 'T-2025-580', date: '01.03.2025', amount: '₺ 1,2M', status: 'Kapalı' },
    ],
    dokumanlar: [
      { id: 'd7', name: 'Hakediş_şablon.xlsx', size: '120 KB', date: '05.03.2025' },
      { id: 'd8', name: 'Sözleşme_taslak.docx', size: '95 KB', date: '01.03.2025' },
    ],
  },
  {
    id: 'c8',
    name: 'Karadeniz Liman İşl.',
    code: 'M-0550',
    sector: 'Altyapı',
    lastActivity: '17 Mar',
    status: 'beklemede',
    openQuotes: 0,
    taxId: '9900112233',
    createdAt: '30.06.2024',
    owner: 'Zeynep A.',
    city: 'Samsun',
    notes: 'Liman revizyonu.',
    contactPerson: 'Hakan Bilgin',
    lastQuoteDate: '10.03.2025',
    iletisim: {
      sabitHat: '+90 362 220 45 60',
      infoEmail: 'liman@karadenizliman.example',
      web: 'www.karadenizliman.example',
      adresNotu: 'Liman içi idari bina · Samsun',
      kisiler: [
        {
          id: 'ik13',
          adSoyad: 'Hakan Bilgin',
          gorev: 'Liman operasyonları',
          cep: '+90 505 777 33 22',
          email: 'h.bilgin@karadenizliman.example',
          birincil: true,
        },
      ],
    },
    tags: ['Uzak saha'],
    factories: ['ANK-01'],
    projeler: [
      { id: 'p15', name: 'Dalga kıran blokları', phase: 'Teklif' },
      { id: 'p16', name: 'Depo perde duvar', phase: 'Planlama' },
    ],
    teklifler: [
      { id: 't22', no: 'T-2025-520', date: '10.03.2025', amount: '₺ 6,0M', status: 'Taslak' },
      { id: 't23', no: 'T-2025-500', date: '25.02.2025', amount: '₺ 2,8M', status: 'Revizyon' },
      { id: 't24', no: 'T-2024-400', date: '12.11.2024', amount: '₺ 900K', status: 'Kapalı' },
    ],
    dokumanlar: [{ id: 'd9', name: 'Liman_ruhsat.pdf', size: '2,0 MB', date: '20.01.2025' }],
  },
]

export function statusLabel(s: CrmCustomerStatus): string {
  switch (s) {
    case 'aktif':
      return 'Aktif'
    case 'beklemede':
      return 'Beklemede'
    case 'pasif':
      return 'Pasif'
    case 'potansiyel':
      return 'Potansiyel'
  }
}
