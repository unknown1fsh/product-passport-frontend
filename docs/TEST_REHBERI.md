# Testleri çalıştırma

## Hızlı kontroller

```powershell
npm.cmd ci
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test
npm.cmd run build
npm.cmd run docs:check
```

Birim testleri gerçek backend'e bağlanmaz. Playwright ekran testleri kontrollü HTTP yanıtlarıyla
CRUD, 403/404/409, eşzamanlı 401, refresh hatası, iki sekme, mobil menü ve token depolamama senaryolarını sınar.

```powershell
npx.cmd playwright install chromium
npm.cmd run test:e2e
```

İndirme erişimi yoksa kurulu Chrome için `$env:PLAYWRIGHT_CHANNEL='chrome'` kullanın.
Bu seçim proje ayarıdır; testler headless çalışır, kullanıcıya tarayıcı penceresi açılmaz.

## Gerçek backend: izole PostgreSQL

Bu proje `scripts/compose.e2e.yml` ile **ayrı** veritabanı ve API açar.
DB portu host'a açılmaz, API yalnızca localhost:18081 adresindedir.
Test parolaları yalnızca bu atılabilir test ortamına aittir.
Mevcut geliştirme veritabanını TEST API olarak göstermeyin.

Önce mevcut backend Dockerfile'ından test imajı derleyin:

```powershell
docker build -t passport-backend-check-app:latest ../product-passport-backend
docker compose -p passport-frontend-e2e -f scripts/compose.e2e.yml up -d --wait --wait-timeout 180
```

Bootstrap ayrı veritabanında `admin@frontend.test` / `Frontend123!` hesabını oluşturur.
Tekrar kurulumda yeni DB gerekir; aynı bootstrap mevcut ADMIN varsa bilerek durur.
Yalnızca bu izole Compose projesini `down` ile kaldırıp yeniden `up` yapın;
veritabanı bu test dosyasında kalıcı volume kullanmaz.

5173 portunda açık Vite varsa durdurun: test sunucusu E2E_API_URL ile yeniden başlamalı.

```powershell
$env:E2E_API_URL='http://localhost:18081/api/v1'
$env:E2E_REAL='1'
# Chromium indirmesi yerine kurulu Chrome kullanılacaksa:
$env:PLAYWRIGHT_CHANNEL='chrome'
npm.cmd run test:e2e
```

Gerçek senaryo; API ile izole kategori/marka/model/pasaport oluşturur, USER yazma yasağını doğrular;
tarayıcıda giriş, kategori CRUD, bağlı kayıtta 409, pasaport detay, iki sekmede yenileme ve çıkışı çalıştırır.
Eşzamanlı 401 kontrolünde ilk iki iş yanıtı test tarafından 401 yapılır; refresh ve sonraki istekler gerçek backend'e gider.
Test verileri yalnızca ayrı veritabanında kalır; geliştirme verileri temizlenmez.

İşiniz bittiğinde:

```powershell
docker compose -p passport-frontend-e2e -f scripts/compose.e2e.yml down
Remove-Item Env:E2E_API_URL,Env:E2E_REAL,Env:PLAYWRIGHT_CHANNEL -ErrorAction SilentlyContinue
```

## Sonuçları yorumlama

`playwright-report` HTML raporu, hata durumunda `test-results` trace içerir.
Gerçek test ortamı açılmadan varsayılan koşuda bir senaryo atlanır; bu tam kabul sonucu değildir.
Tam kabulde E2E_REAL=1 ile atlama olmamalıdır. Başarısız veya çalıştırılamayan kontrol başarılı işaretlenmez.

Excel kontrolü dosyayı yeniden açar; dört sayfayı, 50 görevi, hücreleri, durum doğrulamalarını,
filtre/sabit başlıkları ve bağımlılıkların döngüsüz olmasını kontrol eder.
