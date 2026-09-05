import assert from "node:assert/strict";
import { publishLandingWithUserUapi } from "../src/handlers/ucozpublisher.js";

const originalFetch = globalThis.fetch;
const requests = [];

globalThis.fetch = async (url, options = {}) => {
  requests.push({ url: String(url), body: String(options.body || "") });
  if (requests.length === 1) {
    return new Response(JSON.stringify({
      error: {
        msg: "Individual URL setting is disabled",
        code: "SEO_OWNURL_DISABLED"
      }
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  return new Response(JSON.stringify({
    success: {
      id: 42,
      url: "https://shop.ucoz.net/index/generated/0-42",
      edit: 0
    }
  }), { status: 200, headers: { "Content-Type": "application/json" } });
};

try {
  const result = await publishLandingWithUserUapi({
    product: { productId: "123", platform: "WB", title: "Тест" },
    content: {
      seo: {
        slug: "test-product",
        title: "Тестовый товар",
        description: "Описание",
        keywords: ["тест"]
      }
    },
    html: "<!doctype html><html><body>Test</body></html>",
    siteUrl: "https://shop.ucoz.net",
    apiKey: "sk_live_test_key"
  });

  assert.equal(requests.length, 2);
  assert.match(requests[0].body, /ownurl=test-product-/);
  assert.doesNotMatch(requests[1].body, /ownurl=/);
  assert.equal(result.customUrlDisabled, true);
  assert.equal(result.pageId, 42);
  assert.equal(result.url, "https://shop.ucoz.net/index/generated/0-42");
  console.log("uAPI ownurl fallback: OK");
} finally {
  globalThis.fetch = originalFetch;
}
