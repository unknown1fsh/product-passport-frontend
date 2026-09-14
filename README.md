# Ürün Pasaportu · Frontend

React + TypeScript + Material UI ile Türkçe ürün yönetim arayüzü. Backend ayrı projedir.
Bu başlangıç tesliminde giriş/oturum, kategori CRUD ve pasaport liste/detay ekranları hazırdır.

## 1. Çalıştırın

Node.js 24 kullanın. PowerShell'de:

```powershell
cd C:\tein_repos\product-passport-frontend
npm.cmd ci
Copy-Item .env.example .env
npm.cmd run dev
```

Tarayıcı: **http://localhost:5173**. Backend: **http://localhost:8080**.
Backend projesinde `.env` ayarlarını tamamlayıp `docker compose up --build --wait` çalıştırın.
API adresi farklıysa frontend `.env` içindeki `VITE_API_BASE_URL` değerini değiştirip Vite'ı yeniden başlatın.
Ön yüze verilen VITE değişkenleri herkese açıktır; parola/anahtar koymayın.
Backend `AUTH_ALLOWED_ORIGINS` içinde tam olarak `http://localhost:5173` bulunmalı.
`localhost` ile `127.0.0.1` adreslerini karıştırmayın; 5173 doluysa sunucu farklı porta sessizce geçmez.

## 2. Hesap hazırlayın

Yerel/dev backend yapılandırmasında geçici giriş için kullanıcı adı `admin`, parola
`123456` kullanılabilir. Bu kolay giriş yalnızca dev/test profilinde etkindir; production
ortamında gerçek ADMIN e-postası ve güçlü parolası gerekir. Kalıcı login çözümü sonraki
çalışma kapsamındadır.

Ekip sorumlusundan ADMIN, MANUFACTURER ve USER test hesapları isteyin.
Kayıt backend'de her zaman USER oluşturur; MANUFACTURER rolünü ADMIN atar.
İlk ADMIN kurulumu backend README'sindeki bootstrap komutuyla yapılır. Bu frontend mevcut hesapları değiştirmez.

- ADMIN: kategorileri yönetir, pasaportları inceler.
- MANUFACTURER / USER: hazır kategori ve pasaport ekranlarını okur.
- Stajyerlerin yazacağı üretici işlemlerinde sahipliği backend kontrol eder.

Kayıt, parola kurtarma ve kullanıcı yönetim ekranları bu ilk teslimde yoktur.

## 3. Projeyi tanıyın

```text
src/
  app/                   Tema, yönlendirme ve ana yerleşim
  features/
    auth/                Giriş, Context ve oturum koordinasyonu
    categories/          Tamamlanmış örnek CRUD modülü
    passports/           Hazır liste ve detay
  shared/
    api/                 HTTP, hata ve iş API istemcisi
    hooks/               Veri yükleme ve URL sayfalaması
    ui/                  Ortak geri bildirim ve sayfalama
    types.ts             Backend yanıt tipleri
e2e/                     Tarayıcı testleri
docs/                    Öğrenme rehberi ve stajyer planları
scripts/                 Plan üretimi ve izole test Compose'u
```

Önce [başlangıç rehberini](docs/BASLANGIC_REHBERI.md) okuyun. Kategori modülü yeni ekranların örneğidir.
[API sözleşmesi](docs/API_CONTRACT.md) backend sözleşmesinin bu teslimdeki kopyasıdır;
backend değişirse ekipçe güncelleyin. Swagger: `http://localhost:8080/swagger-ui.html`.

## 4. Kontroller

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test
npm.cmd run build
npm.cmd run docs:check
```

Tarayıcı testleri varsayılan olarak taklit API ile ekranları sınar:

```powershell
npx.cmd playwright install chromium
npm.cmd run test:e2e
```

İndirme mümkün değilse kurulu Chrome'u kullanabilirsiniz:
`$env:PLAYWRIGHT_CHANNEL = 'chrome'`.
Gerçek backend senaryosu için [test rehberini](docs/TEST_REHBERI.md) izleyin.
Varsayılan koşuda bu senaryo atlanır; tam kabul koşusu `E2E_REAL=1` ile yapılır.
Son teslimin doğrulama sonuçları [doğrulama kaydındadır](docs/DOGRULAMA.md).

## 5. Stajyer planı

Esat: pasaport · Zeynep: garanti · Umut: marka/tedarikçi · Ecren: model · Hazal: servis.

- [Excel iş planı](docs/STAJYER_IS_PLANI.xlsx)
- [Markdown iş planı](docs/STAJYER_IS_PLANI.md)
- [Düz metin iş planı](docs/STAJYER_IS_PLANI.txt)

50 görev / 10 iş günü / kişi başına 44 saat uygulama. Kalan süre öğrenme ve incelemedir.
Kaynak `docs/plan-source.json`; güncellemelerden sonra:

```powershell
npm.cmd run docs:generate
npm.cmd run docs:check
```

Üretim komutu mevcut Excel/MD/TXT'yi yeniler. Excel'de elle değişiklik yaparsanız yeniden üretmeden önce kaynağa aktarın.
Frontend klasörü ayrı git repository olarak bağlı değildir; bu nedenle bu teslim için
frontend push/PR işlemi yapılmamıştır.

## Dağıtım notu

`npm run build` çıktısı `dist/` klasöründedir. Statik sunucu SPA adreslerini `index.html` dosyasına yönlendirmeli.
Üretimde frontend/backend aynı site altında HTTPS kullanmalı; backend güvenli cookie ve kalıcı RSA ayarlarıyla çalışmalıdır.
Geliştirme sunucusu ve test Compose'u üretim dağıtımı değildir.
