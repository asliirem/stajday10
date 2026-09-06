/**
 * erpService.js
 *
 * KodexB2B / KodexFDS üzerinden oluşturulan bir siparişi, doğrulama
 * adımından geçirdikten sonra Logo ERP sistemine REST API üzerinden
 * JSON formatında gönderen servis.
 *
 * Not: Bu demo çalışmasında gerçek bir Logo ERP bağlantısı yoktur.
 * `mockErpEndpoint` fonksiyonu, gerçek API'nin davranışını (başarılı
 * yanıt / hata senaryosu) taklit eder. Gerçek kullanımda bu kısım
 * `fetch` veya `axios` ile ERP'nin sağladığı endpoint'e değiştirilir.
 */

const { validateOrder } = require("./validateOrder");

// Gerçek ortamda bu değerler .env üzerinden okunmalıdır.
const ERP_CONFIG = {
  baseUrl: "https://erp.ornek-firma.local/api/v1/orders",
  timeoutMs: 5000,
};

/**
 * Gerçek ERP servisini taklit eder.
 * - Vergi no ile başında "0" olan siparişleri "müşteri bulunamadı" hatasıyla reddeder (örnek senaryo).
 * - Aksi halde başarılı kabul edip bir ERP sipariş referansı döner.
 */
function mockErpEndpoint(payload) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (payload.customer.taxId.startsWith("0")) {
        reject({
          status: 422,
          message: "Müşteri ERP sisteminde bulunamadı (taxId eşleşmedi).",
        });
        return;
      }
      resolve({
        status: 200,
        erpOrderRef: `LOGO-${Date.now()}`,
        receivedAt: new Date().toISOString(),
      });
    }, 200);
  });
}

/**
 * Siparişi doğrular, ERP'nin beklediği JSON formatına dönüştürür ve
 * gönderir. Sonuç olarak başarı/hata bilgisi döner; hata durumunda
 * gönderim yapılmaz.
 */
async function sendOrderToErp(order) {
  const validation = validateOrder(order);

  if (!validation.valid) {
    return {
      success: false,
      stage: "validation",
      errors: validation.errors,
    };
  }

  const payload = {
    orderNo: order.orderNo,
    source: order.source, // "KodexB2B" | "KodexFDS"
    customer: order.customer,
    items: order.items.map((item) => ({
      productCode: item.productCode,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    createdAt: order.createdAt || new Date().toISOString(),
  };

  try {
    const response = await mockErpEndpoint(payload);
    // Gerçek entegrasyonda burada fetch(ERP_CONFIG.baseUrl, {...}) kullanılır.
    return {
      success: true,
      stage: "erp",
      erpOrderRef: response.erpOrderRef,
      receivedAt: response.receivedAt,
    };
  } catch (err) {
    // Hata kayıtları burada loglanır (örn. bir hata tablosuna veya log dosyasına).
    return {
      success: false,
      stage: "erp",
      errors: [err.message || "ERP sistemine gönderim sırasında bilinmeyen hata."],
    };
  }
}

module.exports = { sendOrderToErp, ERP_CONFIG };
