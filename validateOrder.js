/**
 * validateOrder.js
 *
 * Logo ERP'ye veri gönderilmeden önce yapılması gereken kontrolleri
 * içerir: zorunlu alanların doldurulmuş olması, müşteri bilgisinin
 * eksiksiz olması, ürün kodlarının geçerli olması ve miktar
 * bilgilerinin doğru girilmiş olması.
 *
 * Günlükte anlatılan "veri doğrulama" adımının basit bir örneğidir.
 */

const VALID_PRODUCT_CODE = /^[A-Z]{2,4}-\d{3,6}$/; // örn: URN-1024

function validateOrder(order) {
  const errors = [];

  // Zorunlu alanlar
  if (!order.orderNo) errors.push("Sipariş numarası boş bırakılamaz.");
  if (!order.customer || !order.customer.name) {
    errors.push("Müşteri bilgisi eksik.");
  }
  if (!order.customer || !order.customer.taxId) {
    errors.push("Müşteri vergi/TC kimlik numarası eksik.");
  }
  if (!Array.isArray(order.items) || order.items.length === 0) {
    errors.push("Sipariş içerisinde en az bir ürün bulunmalıdır.");
  }

  // Ürün bazlı kontroller
  if (Array.isArray(order.items)) {
    order.items.forEach((item, index) => {
      if (!item.productCode || !VALID_PRODUCT_CODE.test(item.productCode)) {
        errors.push(`Satır ${index + 1}: ürün kodu geçersiz (${item.productCode || "boş"}).`);
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Satır ${index + 1}: miktar 0'dan büyük olmalıdır.`);
      }
      if (item.unitPrice == null || item.unitPrice < 0) {
        errors.push(`Satır ${index + 1}: birim fiyat geçersiz.`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = { validateOrder };
