/**
 * index.js
 *
 * Örnek sipariş kayıtları üzerinden veri doğrulama ve Logo ERP'ye
 * gönderim sürecini gösteren demo çalıştırıcı.
 *
 * Çalıştırmak için: node index.js
 */

const { sendOrderToErp } = require("./erpService");

const orders = [
  // 1) Geçerli sipariş -> doğrulamadan geçer, ERP'ye gönderilir
  {
    orderNo: "SP-10231",
    source: "KodexFDS",
    customer: { name: "Aydın Gıda Ltd. Şti.", taxId: "8451029384" },
    items: [
      { productCode: "URN-1024", quantity: 10, unitPrice: 145.5 },
      { productCode: "URN-2031", quantity: 4, unitPrice: 320 },
    ],
  },
  // 2) Zorunlu alan eksik -> doğrulama hatası, ERP'ye hiç gönderilmez
  {
    orderNo: "SP-10232",
    source: "KodexB2B",
    customer: { name: "Merkez Market A.Ş." }, // taxId eksik
    items: [{ productCode: "urn-99", quantity: 0, unitPrice: 50 }],
  },
  // 3) Doğrulamadan geçer ama ERP tarafında müşteri bulunamaz senaryosu
  {
    orderNo: "SP-10233",
    source: "KodexFDS",
    customer: { name: "Yeni Bayi Ltd.", taxId: "0123456789" },
    items: [{ productCode: "URN-3050", quantity: 2, unitPrice: 780 }],
  },
];

async function run() {
  for (const order of orders) {
    const result = await sendOrderToErp(order);
    console.log(`\nSipariş: ${order.orderNo}`);
    if (result.success) {
      console.log(`  Durum: BAŞARILI (${result.stage})`);
      console.log(`  ERP Referansı: ${result.erpOrderRef}`);
    } else {
      console.log(`  Durum: HATA (${result.stage})`);
      result.errors.forEach((e) => console.log(`   - ${e}`));
    }
  }
}

run();
