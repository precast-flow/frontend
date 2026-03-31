# Dashboard — Prompt 03 çıktısı (Genel Bakış)

Görsel dil: `prompts/00b-NEOMORPHISM-TAILWIND.md` (gri–beyaz; ikincil metin minimum `gray-600`).

---

## 1) Bölüm düzeni + grid

| Kırılım | Düzen |
|---------|--------|
| **KPI** | `grid-cols-1` → `sm:grid-cols-2` → `lg:grid-cols-3` → `xl:grid-cols-5`; kartlar `min-h-[148px]` ile eşit yükseklik hissi |
| **Özet grafikler** | `DashboardCharts`: üst `xl:grid-cols-12` — aylık üretim çizgisi + alan (8) · teklif donut (4); alt satır `lg:grid-cols-2` — hat doluluk çubukları · haftalık sevkiyat plan/gerçek. Veri: `dashboardMock.ts`. |
| **Alt bant** | `lg:grid-cols-12`: uyarılar `col-span-5`, operasyon özeti `col-span-4`, hızlı aksiyonlar `col-span-3` |
| Mobil | KPI ve alt bölümler tek sütun, sırayla |

---

## 2) KPI kartları — içerik, yüzey, Tailwind (1 satır)

| KPI | İçerik | Hedef modül (tıklanınca) | Tailwind özeti |
|-----|--------|---------------------------|----------------|
| Aktif projeler | 12 · Onaylı ve üretimde | Proje Yönetimi (`project`) | `rounded-2xl bg-gray-100 p-4 min-h-[148px] shadow-neo-out-sm hover:shadow-neo-out` |
| Bugün üretilen eleman | 48 · MES onaylı adet | Üretim MES (`mes`) | *(aynı)* |
| Yard'da bekleyen | 7 · Sevkiyat öncesi | Yard (`yard`) | *(aynı)* |
| Bugünkü sevkiyat | 5 · Planlanan yüklemeler | Sevkiyat (`dispatch`) | *(aynı)* |
| Açık kalite bekleyen | 3 · İnceleme / NCR | Kalite (`quality`) | *(aynı)* |

Hepsi **[protrude]**; gölge yoğunluğu tek tip (`shadow-neo-out-sm`, hover’da `shadow-neo-out`).

---

## 3) Kritik uyarılar

- **Yüzey:** dış kab **[inset]** (`shadow-neo-in`), liste içi satırlar nötr; **tehlike yalnızca `text-red-700` / `text-red-800` + ikon**.
- **Tailwind özeti:** `rounded-2xl bg-gray-100 p-1 shadow-neo-in` + iç liste `divide-y divide-gray-200/70 rounded-xl bg-gray-50/50`.

---

## 4) KPI → menü hedefi (özet)

| KPI | `activeId` |
|-----|------------|
| Aktif projeler | `project` |
| Bugün üretilen eleman | `mes` |
| Yard'da bekleyen | `yard` |
| Bugünkü sevkiyat | `dispatch` |
| Açık kalite bekleyen | `quality` |

Uyarı satırı tıklanınca: kalite / sevkiyat / yard (örnek senaryo).

---

## 5) UX soruları

1. KPI sayıları “canlı” mı yoksa gün sonu kesin rakam mı gösterilmeli?
2. Kritik uyarılar tek listede mi kalmalı, modül bazlı sekmelere mi ayrılmalı?
3. Mini üretim grafiği haftalık mı günlük mü; fabrika bazlı filtre kabukta mı dashboard’da mı?
4. Hızlı aksiyonlar kullanıcı rolüne göre mi sıralanmalı (RBAC)?
5. KPI tıklanınca doğrudan modül mü, yoksa ilgili filtreli liste (deep link) mi açılmalı?

---

## Uygulama

- `app/src/components/DashboardView.tsx`
- Varsayılan rota: `pinnedNavItem` (`dashboard`) — `data/navigation.ts`, `AppShell.tsx`
