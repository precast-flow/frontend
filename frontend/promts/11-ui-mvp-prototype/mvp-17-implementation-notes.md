# mvp-17 — Uygulama notları (organizasyon + görev panosu)

Bu dosya `mvp-17-organizasyon-rapor-hatti-ve-gorev-panosu.md` ile uyumlu **çıktı zorunlulukları** için özet + kod referansıdır.

## 1) ASCII / blok wireframe

### Kullanıcı formu (`reports_to` vurgulu)

```
┌ Profil sekmesi ─────────────────────────────────────┐
│ Ad · E-posta · Unvan                                │
│ ┌ mvp-17 — Rapor gönderimi (reports_to) ──────────┐ │
│ │ [Bağlı olduğu yönetici ▼ Tahir Yılmaz]            │ │
│ │ Bu kullanıcı Tahir Yılmaz'a bağlıdır (ast).       │ │
│ │ Benim durumum: [ Ofiste · Uzaktan ]               │ │
│ │ P1 — Doğrudan ast: 3 kişi                         │ │
│ │ Tahir Yılmaz                                      │ │
│ │ ├── Sen Uzman                                     │ │
│ │ ├── Emre Aydın                                    │ │
│ │ └── Ayşe Kaya                                     │ │
│ │ P2 — Matris üst [ disabled ]                     │ │
│ └───────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────┘
```

### Görev panosu — 4 sekme

```
┌ Görev panosu ─────────────────────────────────────────┐
│ [Demo kullanıcı: Tahir ▼]  [✓ organizasyon...izle]     │
│ [ Bana atananlar ] [ Grubuma ] [ Delegasyon ] [ Astlar ]│
├─────────────────────────────────────────────────────────┤
│ Tablo: Görev no | Başlık | Atayan | Durum | Gün | …   │
│ (Astlar sekmesi: salt okunur, yorum alanı disabled)     │
└─────────────────────────────────────────────────────────┘
```

## 2) MOCK tablo (≥6 satır)

Kaynak: `app/src/data/mockTaskBoard.ts` — `MOCK_TASK_BOARD_INITIAL` (6 görev: T-017 … T-022).

| id | başlık (kısa) | atanan | atayan | not |
|----|---------------|--------|--------|-----|
| T-2025-017 | Kiriş kalıp revizyon | Sen | Emre | Senaryo çekirdeği |
| T-2025-018 | İrsaliye kontrolü | Sen | Emre | Açık |
| T-2025-019 | Muhasebe fatura | Mehmet | Ayşe | Grup: Muhasebe |
| T-2025-020 | Delegasyon örneği | Emre | Sen | Delegasyon |
| T-2025-021 | Kalite foto | Selin | Zeynep | Tamamlandı |
| T-2025-022 | Yard taşıma | Can | Emre | Gecikme örneği |

Kullanıcı hiyerarşisi: `app/src/data/mockUsers.ts` — Tahir (kök), Sen/Emre/Ayşe → Tahir; diğerleri → Emre.

## 3) Tailwind (00b uyumu — ana blok başına 1 satır)

| Blok | Örnek sınıf |
|------|-------------|
| Kullanıcı org kutusu | `rounded-xl border border-gray-200/90 bg-gray-100/80 p-3 shadow-neo-in dark:border-gray-700 dark:bg-gray-900/80` |
| Görev tablo kabı | `min-h-0 flex-1 overflow-auto rounded-2xl bg-gray-100 shadow-neo-in dark:bg-gray-900/80` |
| Sekme aktif | `bg-gray-800 text-white shadow-neo-out-sm dark:bg-gray-200 dark:text-gray-900` |
| KPI kartı (geciken astlar) | `rounded-2xl bg-gray-50 p-4 shadow-neo-out dark:bg-gray-900/90` |
| Üst izleme drawer yorum | `resize-none rounded-xl border-0 bg-gray-100 px-3 py-2 shadow-neo-in text-gray-400` (disabled) |

## 4) RBAC

- **Sekme “Astlarımın işleri”:** `organizasyon.ast_gorevleri.izle` yoksa veya rapor zincirinde ast yoksa gizlenir / çizili etiket — UI’da mock checkbox ile kapatılabilir (`TaskBoardView`).
- Üretimde aynı sekme, bu izin **ve** `reports_to` grafiğinde en az bir ast olmadan render edilmez.

## 5) UX soruları (açık)

1. Astların işlerinde üst, “yorum yazmadan @mention” ile sadece atayana ping atabilmeli mi?
2. Çok fabrikalı astlarda üstün görev listesi tek fabrika filtresiyle mi kesilmeli, yoksa “tüm yetkili fabrikalar” birleşik mi?
3. Grup kuyruğu (Muhasebe) ile kişisel atama çakışınca öncelik kuralı ne olmalı?
4. Matris üst (P2) devreye girince `reports_to` tek üst mü kalır, ikincil üst salt bilgi mi?
5. Delegasyon satırlarında atan kişi iptal edebilir mi, yoksa sadece oluşturan mı?
6. Salt okunur üst görünürlüğü denetim günlüğüne yazılmalı mı (compliance)?

## Kod dosyaları

| Dosya | Açıklama |
|-------|----------|
| `app/src/data/orgHierarchy.ts` | Ast kümesi, doğrudan ast sayısı, `reports_to` döngü kontrolü |
| `app/src/data/mockUsers.ts` | `reportsToId`, `workStatusLine`, Tahir/Sen/Emre + hiyerarşi |
| `app/src/data/mockTaskBoard.ts` | Görev mock listesi + grup üyeliği |
| `app/src/components/users/UserManagementView.tsx` | Profilde rapor hattı + mini ağaç + P2 matris placeholder |
| `app/src/components/tasks/TaskBoardView.tsx` | 4 sekme, drawer, KPI, P2 hatırlatma disabled |
| `app/src/components/MainCanvas.tsx` | `task-board` modülü |
| `app/src/data/navigation.ts` | `gorev-panosu` slug |

Navigasyon: **Sistem & Onay → Görev panosu** (`/gorev-panosu`).
