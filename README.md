# Precast Flow Frontend

Bu repository, `frontend` klasoru altindaki React + TypeScript + Vite tabanli uygulamayi icerir.

## Proje Yapisi

- `frontend/`: Ana uygulama kodu
- `frontend/src/`: Uygulama kaynak dosyalari
- `frontend/public/`: Statik dosyalar
- `frontend/promts/`: Prompt ve dokumantasyon notlari

## Gereksinimler

- Node.js 20+ (onerilir)
- npm 10+ (veya uyumlu bir npm surumu)

## Kurulum

```bash
cd frontend
npm install
```

## Gelistirme

```bash
cd frontend
npm run dev
```

## Build

```bash
cd frontend
npm run build
```

## Canli Demo

- Demo URL: `https://your-demo-url.example.com`
- Demo ortami bilgisi: Vercel / Netlify / kendi sunucun

## Ekran Goruntuleri

Ana dashboard gorunumu:

![Precast Flow Dashboard](./frontend/public/screenshots/dashboard.png)

> Not: Eger bu dosya henuz yoksa `frontend/public/screenshots/dashboard.png` yoluna bir ekran goruntusu ekleyebilirsin.

## Contributing

Katkilar memnuniyetle karsilanir. Degisiklik onermeden once asagidaki adimlari takip et:

```bash
# 1) Fork veya branch olustur
git checkout -b feature/kisa-aciklama

# 2) Degisiklikleri yap ve test et
cd frontend
npm install
npm run dev
npm run build

# 3) Commit ve push
git add .
git commit -m "feat: kisa aciklama"
git push origin feature/kisa-aciklama
```

Pull Request acarken:
- Yapilan degisikligin amacini kisa ve net anlat
- UI degisikligi varsa ekran goruntusu ekle
- Gerekliyse test/plansal etkileri belirt

## Onemli Notlar

- Klasik gereksiz dosyalar (`node_modules`, `dist`, log dosyalari, editor cache vb.) kokteki `.gitignore` ile dislanmistir.
- `LICENSE` dosyasi MIT olarak eklenmistir.

## Lisans

Bu proje [MIT](./LICENSE) lisansi altinda dagitilmaktadir.
