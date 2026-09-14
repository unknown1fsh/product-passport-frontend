# Ürün Pasaportu — 10 İş Günlük Stajyer Planı

- Plan omurga tesliminden sonra başlar; Gün 1–10 kullanılır.
- Günlük 4–5 saat uygulama; kalan süre öğrenme ve inceleme.
- Auth/API/kategori omurgası hazırdır; ortak arayüz değişiklikleri ekipçe değerlendirilir.
- Her kişi kendi modülünün ekran, API, test ve belgesinden sorumludur.
- Backend hazırdır; test verisi için başka frontend ekranının bitmesi beklenmez.

## Hazır verilen omurga

- Giriş/çıkış ve koordineli oturum yenileme
- Türkçe mobil yerleşim ve yönlendirme
- Kategori CRUD; ortak tablo/form/hata örnekleri
- Pasaport liste ve detay
- Birim ve tarayıcı test altyapısı

## Esat

### ESA-01 — Gün 1: Kurulum ve hazır pasaport akışını incele

- **Sorumlu:** Esat
- **Modül:** Pasaport
- **Gün:** 1
- **Tahmini saat:** 4
- **Öncelik:** Yüksek
- **Bağımlılık:** Yok
- **Teslim çıktısı:** Kurulum notu ve alan eşlemesi
- **Kabul ölçütü:** Liste/detay çalışır; publicId, productModelId ve categoryId ayrımı açıklanır.
- **Durum:** Başlamadı

### ESA-02 — Gün 2: Form tiplerini ve API fonksiyonlarını yaz

- **Sorumlu:** Esat
- **Modül:** Pasaport
- **Gün:** 2
- **Tahmini saat:** 4.5
- **Öncelik:** Yüksek
- **Bağımlılık:** ESA-01
- **Teslim çıktısı:** Oluşturma/güncelleme servisleri
- **Kabul ölçütü:** POST/PUT sözleşmesi eşleşir; sayısal ID kullanılmaz.
- **Durum:** Başlamadı

### ESA-03 — Gün 3: Oluşturma formu ve kategori seçimi

- **Sorumlu:** Esat
- **Modül:** Pasaport
- **Gün:** 3
- **Tahmini saat:** 4.5
- **Öncelik:** Yüksek
- **Bağımlılık:** ESA-02
- **Teslim çıktısı:** Seri no, kategori, tarih, fatura alanları
- **Kabul ölçütü:** Kategori seçimi sayfalıdır; ilk 20 kayıt tüm liste sanılmaz.
- **Durum:** Başlamadı

### ESA-04 — Gün 4: Model seçimini forma bağla

- **Sorumlu:** Esat
- **Modül:** Pasaport
- **Gün:** 4
- **Tahmini saat:** 4.5
- **Öncelik:** Yüksek
- **Bağımlılık:** ESA-03, ECR-04
- **Teslim çıktısı:** Çalışan pasaport oluşturma
- **Kabul ölçütü:** ECR-04 bileşeni kullanılır; model UUID'si gönderilir.
- **Durum:** Başlamadı

### ESA-05 — Gün 5: Düzenleme formunu tamamla

- **Sorumlu:** Esat
- **Modül:** Pasaport
- **Gün:** 5
- **Tahmini saat:** 4.5
- **Öncelik:** Yüksek
- **Bağımlılık:** ESA-04
- **Teslim çıktısı:** Detaydan dolan güncelleme
- **Kabul ölçütü:** Mevcut model/kategori, tarih ve fatura korunur; gerekli alanlar gönderilir.
- **Durum:** Başlamadı

### ESA-06 — Gün 6: Silme ve detay bölüm arayüzünü hazırla

- **Sorumlu:** Esat
- **Modül:** Pasaport
- **Gün:** 6
- **Tahmini saat:** 4.5
- **Öncelik:** Yüksek
- **Bağımlılık:** ESA-05
- **Teslim çıktısı:** ADMIN silme; alt bölüm bağlantı noktası
- **Kabul ölçütü:** USER yazamaz; MANUFACTURER silemez; 409 görünür. Alt bölümlere passportId verilir.
- **Durum:** Başlamadı

### ESA-07 — Gün 7: Form, tarih ve rol testlerini yaz

- **Sorumlu:** Esat
- **Modül:** Pasaport
- **Gün:** 7
- **Tahmini saat:** 4.5
- **Öncelik:** Normal
- **Bağımlılık:** ESA-06
- **Teslim çıktısı:** RTL testleri
- **Kabul ölçütü:** 400/403/409, gelecek tarih ve çift submit testleri geçer.
- **Durum:** Başlamadı

### ESA-08 — Gün 8: Garanti ve servis bölümlerini entegre et

- **Sorumlu:** Esat
- **Modül:** Pasaport
- **Gün:** 8
- **Tahmini saat:** 4.5
- **Öncelik:** Normal
- **Bağımlılık:** ESA-07, ZEY-07, HAZ-07
- **Teslim çıktısı:** Birleşik pasaport detayı
- **Kabul ölçütü:** ZEY-07 ve HAZ-07 çalışır; bir bölüm hatası diğerini kapatmaz.
- **Durum:** Başlamadı

### ESA-09 — Gün 9: Hazal ile mobil ve çapraz inceleme

- **Sorumlu:** Esat
- **Modül:** Pasaport
- **Gün:** 9
- **Tahmini saat:** 4.5
- **Öncelik:** Normal
- **Bağımlılık:** ESA-08
- **Teslim çıktısı:** Düzeltmeler ve inceleme notu
- **Kabul ölçütü:** 390px form çalışır; geçersiz UUID ve 404 anlaşılır.
- **Durum:** Başlamadı

### ESA-10 — Gün 10: Uçtan uca gösterim ve devir

- **Sorumlu:** Esat
- **Modül:** Pasaport
- **Gün:** 10
- **Tahmini saat:** 4
- **Öncelik:** Normal
- **Bağımlılık:** ESA-09
- **Teslim çıktısı:** Kullanım notu ve test raporu
- **Kabul ölçütü:** Model→pasaport→garanti/servis gösterilir; eksikler açıkça belirtilir.
- **Durum:** Başlamadı

## Zeynep

### ZEY-01 — Gün 1: Kurulum ve garanti sözleşmesini incele

- **Sorumlu:** Zeynep
- **Modül:** Garanti
- **Gün:** 1
- **Tahmini saat:** 4
- **Öncelik:** Yüksek
- **Bağımlılık:** Yok
- **Teslim çıktısı:** Endpoint/alan notu
- **Kabul ölçütü:** Genel liste olmadığı ve productPassportPublicId gerekliliği açıklanır.
- **Durum:** Başlamadı

### ZEY-02 — Gün 2: Ürüne göre garanti listesini yaz

- **Sorumlu:** Zeynep
- **Modül:** Garanti
- **Gün:** 2
- **Tahmini saat:** 4.5
- **Öncelik:** Yüksek
- **Bağımlılık:** ZEY-01
- **Teslim çıktısı:** Sayfalı garanti bölümü
- **Kabul ölçütü:** passportId prop alır; tarih sıralaması çalışır.
- **Durum:** Başlamadı

### ZEY-03 — Gün 3: Garanti oluşturma formunu yaz

- **Sorumlu:** Zeynep
- **Modül:** Garanti
- **Gün:** 3
- **Tahmini saat:** 4.5
- **Öncelik:** Yüksek
- **Bağımlılık:** ZEY-02
- **Teslim çıktısı:** Başlangıç/bitiş alanları
- **Kabul ölçütü:** Eşit tarih kabul; bitiş başlangıçtan önce olamaz.
- **Durum:** Başlamadı

### ZEY-04 — Gün 4: Oluşturmayı API'ye bağla

- **Sorumlu:** Zeynep
- **Modül:** Garanti
- **Gün:** 4
- **Tahmini saat:** 4.5
- **Öncelik:** Yüksek
- **Bağımlılık:** ZEY-03
- **Teslim çıktısı:** Pasaporta garanti ekleme
- **Kabul ölçütü:** Doğru UUID alanı; başarıda garanti listesi yenilenir.
- **Durum:** Başlamadı

### ZEY-05 — Gün 5: Düzenlemeyi tamamla

- **Sorumlu:** Zeynep
- **Modül:** Garanti
- **Gün:** 5
- **Tahmini saat:** 4.5
- **Öncelik:** Yüksek
- **Bağımlılık:** ZEY-04
- **Teslim çıktısı:** Dolu düzenleme formu
- **Kabul ölçütü:** PUT /warranties/edit/{id}; pasaport bağlantısı değişmez.
- **Durum:** Başlamadı

### ZEY-06 — Gün 6: Silme, rol ve sahiplik hataları

- **Sorumlu:** Zeynep
- **Modül:** Garanti
- **Gün:** 6
- **Tahmini saat:** 4.5
- **Öncelik:** Yüksek
- **Bağımlılık:** ZEY-05
- **Teslim çıktısı:** Onaylı silme
- **Kabul ölçütü:** DELETE /warranties/remove/{id}; 204 ayrıştırılmaz; başka üreticide 403 gösterilir.
- **Durum:** Başlamadı

### ZEY-07 — Gün 7: Esat'a garanti bölümünü teslim et

- **Sorumlu:** Zeynep
- **Modül:** Garanti
- **Gün:** 7
- **Tahmini saat:** 4.5
- **Öncelik:** Normal
- **Bağımlılık:** ZEY-06, ESA-06
- **Teslim çıktısı:** Detaya takılabilir bölüm
- **Kabul ölçütü:** ESA-06 arayüzüne uyar; silinmiş üst kayıtta 404 gösterilir.
- **Durum:** Başlamadı

### ZEY-08 — Gün 8: Tarih ve API testlerini yaz

- **Sorumlu:** Zeynep
- **Modül:** Garanti
- **Gün:** 8
- **Tahmini saat:** 4.5
- **Öncelik:** Normal
- **Bağımlılık:** ZEY-07
- **Teslim çıktısı:** Test paketi
- **Kabul ölçütü:** Eşit/ters tarih, boş alan, 403/404 testleri geçer.
- **Durum:** Başlamadı

### ZEY-09 — Gün 9: Umut ile çapraz ve mobil inceleme

- **Sorumlu:** Zeynep
- **Modül:** Garanti
- **Gün:** 9
- **Tahmini saat:** 4.5
- **Öncelik:** Normal
- **Bağımlılık:** ZEY-08
- **Teslim çıktısı:** İnceleme notları
- **Kabul ölçütü:** Tarih alanları ve liste küçük ekranda çalışır; bekleme görünür.
- **Durum:** Başlamadı

### ZEY-10 — Gün 10: Gösterim ve belge teslimi

- **Sorumlu:** Zeynep
- **Modül:** Garanti
- **Gün:** 10
- **Tahmini saat:** 4
- **Öncelik:** Normal
- **Bağımlılık:** ZEY-09
- **Teslim çıktısı:** Garanti kullanım rehberi
- **Kabul ölçütü:** Oluştur/düzenle/sil gösterilir; kabul sonuçları kaydedilir.
- **Durum:** Başlamadı

## Umut

### UMU-01 — Gün 1: Kurulum ve iki modülü karşılaştır

- **Sorumlu:** Umut
- **Modül:** Marka ve tedarikçi
- **Gün:** 1
- **Tahmini saat:** 4
- **Öncelik:** Yüksek
- **Bağımlılık:** Yok
- **Teslim çıktısı:** Alan/rol farkları notu
- **Kabul ölçütü:** Marka sahipliği ve tedarikçi ADMIN sınırı açıklanır.
- **Durum:** Başlamadı

### UMU-02 — Gün 2: Marka listesi ve filtrelerini yaz

- **Sorumlu:** Umut
- **Modül:** Marka ve tedarikçi
- **Gün:** 2
- **Tahmini saat:** 4.5
- **Öncelik:** Yüksek
- **Bağımlılık:** UMU-01
- **Teslim çıktısı:** Arama/aktiflik/sayfalama
- **Kabul ölçütü:** search ve active URL'dedir; filtre değişince page sıfırlanır.
- **Durum:** Başlamadı

### UMU-03 — Gün 3: Marka oluşturma/düzenleme

- **Sorumlu:** Umut
- **Modül:** Marka ve tedarikçi
- **Gün:** 3
- **Tahmini saat:** 4.5
- **Öncelik:** Yüksek
- **Bağımlılık:** UMU-02
- **Teslim çıktısı:** Marka formu ve API
- **Kabul ölçütü:** Ad kırpılır; 409 görünür; üretici kendi kaydını yönetir.
- **Durum:** Başlamadı

### UMU-04 — Gün 4: Marka silme ve tedarikçi listesi

- **Sorumlu:** Umut
- **Modül:** Marka ve tedarikçi
- **Gün:** 4
- **Tahmini saat:** 4.5
- **Öncelik:** Yüksek
- **Bağımlılık:** UMU-03
- **Teslim çıktısı:** ADMIN silme; sayfalı tedarikçi
- **Kabul ölçütü:** Bağlı modelde 409; name/active filtreleri doğru.
- **Durum:** Başlamadı

### UMU-05 — Gün 5: Tedarikçi oluşturma formu

- **Sorumlu:** Umut
- **Modül:** Marka ve tedarikçi
- **Gün:** 5
- **Tahmini saat:** 4.5
- **Öncelik:** Yüksek
- **Bağımlılık:** UMU-04
- **Teslim çıktısı:** Kod/ad/iletişim alanları
- **Kabul ölçütü:** ADMIN yazabilir; e-posta ve uzunluk sınırları uygulanır.
- **Durum:** Başlamadı

### UMU-06 — Gün 6: Tedarikçi düzenleme ve silme

- **Sorumlu:** Umut
- **Modül:** Marka ve tedarikçi
- **Gün:** 6
- **Tahmini saat:** 4.5
- **Öncelik:** Yüksek
- **Bağımlılık:** UMU-05
- **Teslim çıktısı:** Tam tedarikçi CRUD
- **Kabul ölçütü:** Kod değişmez; active zorunlu; 204 sonrası liste yenilenir.
- **Durum:** Başlamadı

### UMU-07 — Gün 7: İki modülün hata durumları

- **Sorumlu:** Umut
- **Modül:** Marka ve tedarikçi
- **Gün:** 7
- **Tahmini saat:** 4.5
- **Öncelik:** Normal
- **Bağımlılık:** UMU-06
- **Teslim çıktısı:** Ortak Feedback kullanan ekranlar
- **Kabul ölçütü:** 400/403/409, boş liste ve ağ hatası için tekrar deneme çalışır.
- **Durum:** Başlamadı

### UMU-08 — Gün 8: Katalog testlerini tamamla

- **Sorumlu:** Umut
- **Modül:** Marka ve tedarikçi
- **Gün:** 8
- **Tahmini saat:** 4.5
- **Öncelik:** Normal
- **Bağımlılık:** UMU-07
- **Teslim çıktısı:** İki modülün testleri
- **Kabul ölçütü:** Filtre sıfırlama, değişmez kod, rol ve benzersizlik testleri geçer.
- **Durum:** Başlamadı

### UMU-09 — Gün 9: Zeynep ile çapraz inceleme

- **Sorumlu:** Umut
- **Modül:** Marka ve tedarikçi
- **Gün:** 9
- **Tahmini saat:** 4.5
- **Öncelik:** Normal
- **Bağımlılık:** UMU-08
- **Teslim çıktısı:** Mobil ve erişilebilirlik düzeltmeleri
- **Kabul ölçütü:** Tablo/aksiyonlar klavyeyle kullanılır; silme onayı anlaşılır.
- **Durum:** Başlamadı

### UMU-10 — Gün 10: İki modülü göster ve devret

- **Sorumlu:** Umut
- **Modül:** Marka ve tedarikçi
- **Gün:** 10
- **Tahmini saat:** 4
- **Öncelik:** Normal
- **Bağımlılık:** UMU-09
- **Teslim çıktısı:** Kullanım/test notları
- **Kabul ölçütü:** Marka→model ilişkisi ve tedarikçi CRUD gerçek API ile gösterilir.
- **Durum:** Başlamadı

## Ecren

### ECR-01 — Gün 1: Kurulum ve marka-model ilişkisi

- **Sorumlu:** Ecren
- **Modül:** Model
- **Gün:** 1
- **Tahmini saat:** 4
- **Öncelik:** Yüksek
- **Bağımlılık:** Yok
- **Teslim çıktısı:** Alan/rol eşleme notu
- **Kabul ölçütü:** brandPublicId/model publicId ayrımı açıklanır; test markası seçilir.
- **Durum:** Başlamadı

### ECR-02 — Gün 2: Model listesi ve marka filtresi

- **Sorumlu:** Ecren
- **Modül:** Model
- **Gün:** 2
- **Tahmini saat:** 4.5
- **Öncelik:** Yüksek
- **Bağımlılık:** ECR-01
- **Teslim çıktısı:** Sayfalı aramalı liste
- **Kabul ölçütü:** search/brandPublicId URL'dedir; filtre değişince page sıfırlanır.
- **Durum:** Başlamadı

### ECR-03 — Gün 3: Model oluşturma ve marka seçimi

- **Sorumlu:** Ecren
- **Modül:** Model
- **Gün:** 3
- **Tahmini saat:** 4.5
- **Öncelik:** Yüksek
- **Bağımlılık:** ECR-02
- **Teslim çıktısı:** Markaya bağlı model formu
- **Kabul ölçütü:** Marka seçimi sayfalıdır; başka üretici markasında 403 görünür.
- **Durum:** Başlamadı

### ECR-04 — Gün 4: Model seçimini Esat'a teslim et

- **Sorumlu:** Ecren
- **Modül:** Model
- **Gün:** 4
- **Tahmini saat:** 4.5
- **Öncelik:** Yüksek
- **Bağımlılık:** ECR-03
- **Teslim çıktısı:** ModelSelect ve kullanım örneği
- **Kabul ölçütü:** value UUID, onChange(UUID); sayfa dışındaki mevcut seçim etiketi korunur; boş/hata durumları var.
- **Durum:** Başlamadı

### ECR-05 — Gün 5: Model düzenlemeyi tamamla

- **Sorumlu:** Ecren
- **Modül:** Model
- **Gün:** 5
- **Tahmini saat:** 4.5
- **Öncelik:** Yüksek
- **Bağımlılık:** ECR-04
- **Teslim çıktısı:** Mevcut marka ile dolu form
- **Kabul ölçütü:** code/name/brandPublicId/active alanları doğru gönderilir.
- **Durum:** Başlamadı

### ECR-06 — Gün 6: ADMIN silme ve ilişki hataları

- **Sorumlu:** Ecren
- **Modül:** Model
- **Gün:** 6
- **Tahmini saat:** 4.5
- **Öncelik:** Yüksek
- **Bağımlılık:** ECR-05
- **Teslim çıktısı:** Silme onayı
- **Kabul ölçütü:** Pasaport bağlıysa 409; MANUFACTURER silemez.
- **Durum:** Başlamadı

### ECR-07 — Gün 7: Liste/form/seçim testleri

- **Sorumlu:** Ecren
- **Modül:** Model
- **Gün:** 7
- **Tahmini saat:** 4.5
- **Öncelik:** Normal
- **Bağımlılık:** ECR-06
- **Teslim çıktısı:** Model test paketi
- **Kabul ölçütü:** Sayfa dışı seçim, 403 ve 409 testleri geçer.
- **Durum:** Başlamadı

### ECR-08 — Gün 8: Esat ile model-pasaport entegrasyonu

- **Sorumlu:** Ecren
- **Modül:** Model
- **Gün:** 8
- **Tahmini saat:** 4.5
- **Öncelik:** Normal
- **Bağımlılık:** ECR-07, ESA-05
- **Teslim çıktısı:** Birlikte çalışan form
- **Kabul ölçütü:** Model değişimi doğru UUID gönderir; eski seçim etiketi kaybolmaz.
- **Durum:** Başlamadı

### ECR-09 — Gün 9: Hazal ile uçtan uca inceleme

- **Sorumlu:** Ecren
- **Modül:** Model
- **Gün:** 9
- **Tahmini saat:** 4.5
- **Öncelik:** Normal
- **Bağımlılık:** ECR-08
- **Teslim çıktısı:** İnceleme notları
- **Kabul ölçütü:** Marka/model/pasaport sırası ve filtre URL'leri doğrulanır.
- **Durum:** Başlamadı

### ECR-10 — Gün 10: Model modülünü devret

- **Sorumlu:** Ecren
- **Modül:** Model
- **Gün:** 10
- **Tahmini saat:** 4
- **Öncelik:** Normal
- **Bağımlılık:** ECR-09
- **Teslim çıktısı:** Bileşen kullanım rehberi
- **Kabul ölçütü:** Yeni geliştirici ModelSelect'i örneği izleyerek kullanabilir.
- **Durum:** Başlamadı

## Hazal

### HAZ-01 — Gün 1: Kurulum ve servis sözleşmesi

- **Sorumlu:** Hazal
- **Modül:** Servis
- **Gün:** 1
- **Tahmini saat:** 4
- **Öncelik:** Yüksek
- **Bağımlılık:** Yok
- **Teslim çıktısı:** Endpoint/alan notu
- **Kabul ölçütü:** Oluşturmada productId; güncellemede sabit bağlantı açıklanır.
- **Durum:** Başlamadı

### HAZ-02 — Gün 2: Servis geçmişi listesini yaz

- **Sorumlu:** Hazal
- **Modül:** Servis
- **Gün:** 2
- **Tahmini saat:** 4.5
- **Öncelik:** Yüksek
- **Bağımlılık:** HAZ-01
- **Teslim çıktısı:** passportId alan bölüm
- **Kabul ölçütü:** serviceDate desc varsayılanı ve sayfalama çalışır.
- **Durum:** Başlamadı

### HAZ-03 — Gün 3: Servis oluşturma formunu yaz

- **Sorumlu:** Hazal
- **Modül:** Servis
- **Gün:** 3
- **Tahmini saat:** 4.5
- **Öncelik:** Yüksek
- **Bağımlılık:** HAZ-02
- **Teslim çıktısı:** Tarih ve açıklama alanları
- **Kabul ölçütü:** Gelecek tarih reddedilir; açıklama zorunlu ve en fazla 1000 karakter.
- **Durum:** Başlamadı

### HAZ-04 — Gün 4: Formu gerçek API'ye bağla

- **Sorumlu:** Hazal
- **Modül:** Servis
- **Gün:** 4
- **Tahmini saat:** 4.5
- **Öncelik:** Yüksek
- **Bağımlılık:** HAZ-03
- **Teslim çıktısı:** Pasaporta servis ekleme
- **Kabul ölçütü:** productId doğru gönderilir; başarıda liste yenilenir.
- **Durum:** Başlamadı

### HAZ-05 — Gün 5: Servis düzenlemeyi tamamla

- **Sorumlu:** Hazal
- **Modül:** Servis
- **Gün:** 5
- **Tahmini saat:** 4.5
- **Öncelik:** Yüksek
- **Bağımlılık:** HAZ-04
- **Teslim çıktısı:** Dolu düzenleme formu
- **Kabul ölçütü:** PUT gövdesinde productId yok; tarih/açıklama korunur.
- **Durum:** Başlamadı

### HAZ-06 — Gün 6: Silme ve sahiplik hataları

- **Sorumlu:** Hazal
- **Modül:** Servis
- **Gün:** 6
- **Tahmini saat:** 4.5
- **Öncelik:** Yüksek
- **Bağımlılık:** HAZ-05
- **Teslim çıktısı:** Onaylı silme
- **Kabul ölçütü:** Üretici kendi kaydını siler; başka üreticide 403, silinmiş üstte 404 gösterilir.
- **Durum:** Başlamadı

### HAZ-07 — Gün 7: Servis bölümünü Esat'a teslim et

- **Sorumlu:** Hazal
- **Modül:** Servis
- **Gün:** 7
- **Tahmini saat:** 4.5
- **Öncelik:** Normal
- **Bağımlılık:** HAZ-06, ESA-06
- **Teslim çıktısı:** Detaya takılabilir servis bölümü
- **Kabul ölçütü:** ESA-06 arayüzüne uyar; tüm CRUD bölüm içinde çalışır.
- **Durum:** Başlamadı

### HAZ-08 — Gün 8: Servis testleri ve ortak E2E

- **Sorumlu:** Hazal
- **Modül:** Servis
- **Gün:** 8
- **Tahmini saat:** 4.5
- **Öncelik:** Normal
- **Bağımlılık:** HAZ-07
- **Teslim çıktısı:** Testler ve akış kontrol listesi
- **Kabul ölçütü:** Gelecek tarih, 1000 sınırı, 403/404 ve alt kayıt akışı kapsanır.
- **Durum:** Başlamadı

### HAZ-09 — Gün 9: Esat ve Ecren ile E2E inceleme

- **Sorumlu:** Hazal
- **Modül:** Servis
- **Gün:** 9
- **Tahmini saat:** 4.5
- **Öncelik:** Normal
- **Bağımlılık:** HAZ-08
- **Teslim çıktısı:** Mobil/entegrasyon hata listesi
- **Kabul ölçütü:** Kategori→marka→model→pasaport→garanti/servis sırası çalışır.
- **Durum:** Başlamadı

### HAZ-10 — Gün 10: Ortak gösterim ve kabul raporu

- **Sorumlu:** Hazal
- **Modül:** Servis
- **Gün:** 10
- **Tahmini saat:** 4
- **Öncelik:** Normal
- **Bağımlılık:** HAZ-09
- **Teslim çıktısı:** Ekip kabul kaydı ve servis rehberi
- **Kabul ölçütü:** Başarılı, başarısız ve çalıştırılamayan kontroller ayrı kaydedilir.
- **Durum:** Başlamadı

## Planı güncelleme

Kaynak: plan-source.json. Durumları kaynakta güncelleyin; npm run docs:generate ve npm run docs:check çalıştırın. Excel elle değişiklikleri yeniden üretimde korunmaz.
