const STORAGE_KEY = "ucoz-market-page-account-v1";

function createUserId() {
  const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `local_${id}`;
}

function persist(account) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
  return account;
}

export function loadOrCreateLocalAccount() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (stored?.userId && Array.isArray(stored.publications)) return stored;
  } catch {
    // Corrupted browser data is replaced with a clean local account.
  }

  return persist({
    userId: createUserId(),
    createdAt: new Date().toISOString(),
    publications: []
  });
}

export function recordSuccessfulPublication(account, publication, product) {
  if (!publication?.published || !publication?.url || !publication?.operationId) return account;

  const record = {
    operationId: publication.operationId,
    createdAt: new Date().toISOString(),
    title: product.title,
    previewImage: product.images?.[0] || null,
    productUrl: product.productUrl,
    publishedUrl: publication.url,
    productId: product.productId,
    model: publication.model || null
  };

  return persist({
    ...account,
    publications: [record, ...account.publications.filter((item) => item.operationId !== record.operationId)].slice(0, 50)
  });
}
