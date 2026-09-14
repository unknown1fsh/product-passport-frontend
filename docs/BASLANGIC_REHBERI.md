# İlk gün: çalışan ekrandan yeni modüle

## İlk 60 dakika

1. README ile frontend ve backend'i çalıştırın.
2. ADMIN hesabıyla giriş yapın. Network sekmesinde csrf, login ve kategori isteklerini bulun.
3. Kategori oluşturun; düzenleyin ve silin. Aynı kodla yeniden kayıt deneyerek 409 mesajını görün.
4. USER ile giriş yapın: yazma düğmeleri görünmez.
5. Pasaport listesinde bir kaydı açın. UUID ile detay bağlantısını ve tarih/fatura alanlarını inceleyin.

Gerçek geliştirme verilerini sırf örnek yapmak için silmeyin. Ayrı test hesabı/verisi kullanın.

## Kategori örneğini okuyun

Akış: **CategoryPage → CategoryForm → categoryApi → api → backend → liste yenileme**.

- Sayfa URL'den page/size/sortBy/sortDir okur. Liste isteğinde ortak `useResource` kullanılır.
- Form kendi geçici alanlarını tutar. Gönderirken zorunlu alanlar kontrol edilir.
- `categoryApi` yalnızca kategori endpointlerini ve DTO gövdelerini bilir.
- Ortak `api` Bearer başlığı ekler; başarıdaki data alanını açar.
- Hata `ApiError` olarak gelir. Form açık kalır ve hata görünür.
- Başarıda diyalog kapanır; liste yeniden alınır. Silmede 204 gövdesi ayrıştırılmaz.

`CategoryForm.test.tsx` dosyasında başarılı kayıt, değişmez kod ve çakışma örnekleri vardır.
Testi kopyalarken yalnızca fonksiyonun çağrıldığını değil, kullanıcıya görünen davranışı da doğrulayın.

## Yeni modül eklemek

1. Size ait `features/<modul>` klasörünü açın; API sözleşmesinden tipleri yazın.
2. Modülün `api.ts` dosyasında ortak istemciyi kullanın. Bileşen içinde dağınık fetch çağrıları yazmayın.
3. Önce listeyi; ardından oluşturma, düzenleme ve silmeyi tamamlayın.
4. Çalışan ekranın route ve menü bağlantısını ekleyin. Boş buton veya çalışmayan sahte ekran teslim etmeyin.
5. Form hataları, boş liste, yükleniyor, tekrar deneme ve başarı geri bildirimini ekleyin.
6. Testleri ve kullanım notunu yazın. Son olarak typecheck/lint/test/build çalıştırın.

Örnek iş isteği:

```typescript
import { api } from '../../shared/api/client';
import type { PageResponse } from '../../shared/types';

type Brand = { publicId: string; name: string; active: boolean };
const result = await api<PageResponse<Brand>>('/product-brands?page=0&size=20');
const brands = result.content;
```

`api()` zaten data sarmalamasını açar: ikinci kez `result.data` okumayın.
Login/refresh ve `auth/me` ham yanıt döndürür; auth ile iş endpointlerini aynı tip sanmayın.
DELETE sonrası result beklemeyin. Tüm ilişkiler UUID'dir; backend sayısal ID'sini göndermeyin.

## Ekipler arası ortak arayüzler

- Ecren'in ModelSelect bileşeni: `value: string | null`, `onChange: (publicId: string | null) => void`, isteğe bağlı `disabled`.
  UUID string tutulur; liste sayfasında görünmeyen mevcut model de detaydan çözülür.
- Esat'ın pasaport detayı, garanti ve servis bölümlerine `passportId: string` verir.
- Zeynep/Hazal bölümleri kendi liste/form/hata durumlarını yönetir; başka bölümün state'ini değiştirmez.
- Kategori/model/marka seçiminde ilk sayfayı bütün katalog sanmayın. Sayfalı seçim veya arama kullanın.
- Ortak auth/API dosyası değişikliği gerektiğinde önce ekipçe konuşun; modül içine ikinci bir refresh mekanizması eklemeyin.

## Oturum neden biraz farklı?

Access token yalnızca bellektedir. Sayfa yenilenince cookie ile oturum yenilenir.
Backend her refresh sonrasında cookie'yi değiştirir; eski refresh tokenı tekrar kullanmak oturumu kapatabilir.

`session.ts` tek sekmede ortak Promise, sekmeler arasında Web Locks kullanır.
Login/logout da aynı kilitle çalışır. BroadcastChannel aynı origin'deki sekmeleri günceller.
403, ağ hatası veya başarısız refresh için otomatik tekrar yapılmaz.
Koordinasyon desteklenmeyen tarayıcıda tekrar giriş istenir.
Tokenları localStorage/sessionStorage'a, loga veya URL'ye yazmayın.

## Yetki ve hata kontrolü

| Durum | Kontrol |
| --- | --- |
| 400 | Alan sınırları, UUID, tarih ve sıralama alanı |
| 401 | Oturum; ortak istemcinin tek yenileme hakkı |
| 403 | Rol veya sahiplik; CSRF auth isteklerinde gerekli |
| 404 | Silinmiş/yok kayıt; açık detayda anlaşılır mesaj |
| 409 | Benzersizlik veya bağlı kayıt; kullanıcı verisini kaybetmeden göster |
| 429 | Sık istek; otomatik tekrar fırtınası oluşturma |
| Ağ hatası | Backend/port/origin kontrolü; elle tekrar deneme |

USER kullanıcı yönetimi dışında okur. Kategori/tedarikçi yazma ADMIN; marka/model/pasaport silme ADMIN.
MANUFACTURER kendi marka/model/pasaportunu yazar ve kendi garanti/servisini silebilir.
Sahip UUID'si DTO'da yoktur; istemcide sahiplik tahmini yapmayın. Backend 403 dönebilir.

## Teslim kontrolü

- Başarılı akışın yanında boş/yükleniyor/hata durumları var.
- Formda kayıt sürerken düğme kapalı; silme için onay gerekiyor.
- Filtre değiştiğinde page=0; sayfa bilgisi URL'de.
- Mobil görünüm ve klavye kullanımı kontrol edildi.
- Testler gerçek kullanıcı davranışını sınar; üretim derlemesi geçer.
- Kendi görev ID'lerinizi, çalıştırdığınız komutları ve sonuçları teslim notuna yazın.
