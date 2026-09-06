# ERP Veri Gönderme Servisi (Demo)

Bu proje, staj günlüğünde (10. gün) anlatılan **Logo ERP veri aktarımı ve
senkronizasyon** sürecinin basit bir örneğidir. KodexB2B veya KodexFDS
üzerinden oluşturulan bir siparişin, ERP'ye gönderilmeden önce nasıl
doğrulandığını ve REST API üzerinden JSON formatında nasıl iletildiğini
gösterir.

Gerçek bir Logo ERP bağlantısı içermez; `erpService.js` içindeki
`mockErpEndpoint` fonksiyonu, gerçek API'nin başarılı ve hatalı yanıt
senaryolarını taklit eder. Amaç, staj sürecinde öğrenilen entegrasyon
mantığını (veri doğrulama → gönderim → onay/hata) göstermektir.

## Süreç

1. **Doğrulama** (`validateOrder.js`): Sipariş ERP'ye gönderilmeden önce
   şu kontroller yapılır:
   - Sipariş numarası ve müşteri bilgisinin eksiksiz olması
   - Müşteri vergi/TC kimlik numarasının bulunması
   - Ürün kodunun geçerli formatta olması
   - Miktar ve birim fiyat bilgilerinin geçerli olması
2. **Gönderim** (`erpService.js`): Doğrulamadan geçen sipariş, ERP'nin
   beklediği JSON formatına dönüştürülüp gönderilir.
3. **Sonuç**: Başarılı gönderimde bir ERP sipariş referansı (`erpOrderRef`)
   döner; hata durumunda (doğrulama veya ERP kaynaklı) hata mesajları
   listelenir ve gönderim yapılmaz.

## Dosya Yapısı

```
erp-veri-gonderme-servisi/
├── validateOrder.js   # Veri doğrulama kontrolleri
├── erpService.js       # ERP'ye gönderim servisi (mock endpoint ile)
├── index.js             # Örnek siparişlerle demo çalıştırıcı
└── README.md
```

## Nasıl Çalıştırılır

Node.js (v14+) yüklü olması yeterlidir, ek bir paket gerekmez.

```bash
node index.js
```

Çalıştırıldığında üç örnek sipariş üzerinden şu senaryolar gösterilir:

- Geçerli bir sipariş → doğrulamadan geçer, ERP'ye başarıyla gönderilir
- Zorunlu alanı eksik bir sipariş → doğrulama aşamasında reddedilir,
  ERP'ye hiç gönderilmez
- Doğrulamadan geçen ama ERP tarafında müşteri eşleşmeyen bir sipariş →
  ERP hatası döner

## Not

Bu, gerçek bir üretim entegrasyonu değil, eğitim/staj amaçlı hazırlanmış
bir demo çalışmasıdır. Gerçek kullanımda `mockErpEndpoint` yerine ERP'nin
sağladığı gerçek REST API endpoint'i (kimlik doğrulama, timeout, retry
mekanizmaları dahil) kullanılmalıdır.
