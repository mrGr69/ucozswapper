const product = {
  platform: "WB",
  productId: "phase3-test",
  title: "Умные часы для спорта и путешествий",
  description: "Умные часы с GPS, Bluetooth и защитой от воды для тренировок и ежедневного использования.",
  images: [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1200&q=85"
  ],
  characteristics: [
    { label: "Связь", value: "Bluetooth" },
    { label: "Навигация", value: "GPS" },
    { label: "Защита", value: "Водостойкий корпус" }
  ],
  price: "8 990 ₽",
  priceWithoutWallet: "8 990 ₽",
  productUrl: "https://www.wildberries.ru/catalog/123456/detail.aspx",
  sourceMode: "zenrows",
  sourceStatus: "fetched",
  warnings: []
};

const response = await fetch("http://127.0.0.1:3001/api/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ product })
});
const data = await response.json();
console.log(JSON.stringify({
  status: response.status,
  mode: data.mode,
  design: data.content?.design,
  hasGalleryControls: data.html?.includes("data-gallery-next") || false,
  error: data.error || null
}, null, 2));
if (!response.ok) process.exitCode = 1;
