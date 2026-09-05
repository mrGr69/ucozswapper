import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ucozServerEntry = path.join(__dirname, "../../node_modules/ucoz-mcp/dist/index.js");

function requireUcozConfig(required) {
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length) throw new Error(`Не настроены переменные uCoz: ${missing.join(", ")}.`);
}

function ensurePoweredBy(html) {
  if (html.includes("$POWERED_BY$")) return html;
  if (html.includes("</body>")) return html.replace("</body>", "</body>\n$POWERED_BY$");
  return `${html}\n$POWERED_BY$`;
}

function readToolText(result) {
  return (result?.content || [])
    .filter((item) => item?.type === "text")
    .map((item) => item.text)
    .join("\n")
    .trim();
}

function parseToolPayload(result) {
  if (result?.structuredContent) return result.structuredContent;
  const text = readToolText(result);
  try {
    return JSON.parse(text);
  } catch {
    return { text };
  }
}

function normalizeSiteUrl() {
  return process.env.UCOZ_SITE_URL.replace(/\/$/, "");
}

function assertToolSuccess(result, fallbackMessage) {
  const text = readToolText(result);
  if (result?.isError || /^\s*❌/u.test(text) || /"error"\s*:/i.test(text)) {
    throw new Error(text || fallbackMessage);
  }
  return result;
}

async function callUcozTool(name, args) {
  const client = new Client({ name: "ucoz-market-page-ai", version: "0.2.0" });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [ucozServerEntry],
    env: { ...process.env }
  });

  try {
    await client.connect(transport);
    const result = await client.callTool({ name, arguments: args });
    if (result?.isError) throw new Error(readToolText(result) || `uCoz MCP tool ${name} завершился с ошибкой.`);
    return result;
  } finally {
    await client.close().catch(() => {});
  }
}

export async function checkUcozConnection() {
  requireUcozConfig(["UCOZ_API_TOKEN", "UCOZ_SITE_URL"]);
  const result = await callUcozTool("templates_tool", {
    action: "page_list",
    page_page: 1,
    page_per_page: 5
  });
  return parseToolPayload(result);
}

export async function checkUcozFtpConnection() {
  const required = ["UCOZ_FTP_HOST", "UCOZ_FTP_USER", "UCOZ_FTP_PASS"];
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length) throw new Error(`Не настроены переменные FTP uCoz: ${missing.join(", ")}.`);
  const result = await callUcozTool("ftp_tool", { action: "list", path: "/" });
  return parseToolPayload(result);
}

export async function publishLandingToUcoz({ product, content, html }) {
  const publishMode = process.env.UCOZ_PUBLISH_MODE || "ftp";
  requireUcozConfig(publishMode === "pages"
    ? ["UCOZ_API_TOKEN", "UCOZ_SITE_URL"]
    : ["UCOZ_SITE_URL", "UCOZ_FTP_HOST", "UCOZ_FTP_USER", "UCOZ_FTP_PASS"]);
  const operationId = crypto
    .createHash("sha256")
    .update(`${product.productId}:${Date.now()}:${crypto.randomUUID()}`)
    .digest("hex")
    .slice(0, 20);
  const baseSlug = content.seo.slug.replace(/^-+|-+$/g, "").slice(0, 58) || `product-${product.productId}`;
  const slug = `${baseSlug}-${operationId.slice(0, 8)}`;

  if (publishMode !== "pages") {
    const remotePath = `/ai-${slug}.html`;
    const result = assertToolSuccess(await callUcozTool("ftp_tool", {
      action: "write",
      filepath: remotePath,
      content: html
    }), "uCoz FTP не смог записать лендинг.");
    const publishedUrl = `${normalizeSiteUrl()}${remotePath}`;

    const verification = await fetch(publishedUrl, { signal: AbortSignal.timeout(20_000) });
    if (!verification.ok) {
      throw new Error(`Лендинг записан по FTP, но публичный URL вернул HTTP ${verification.status}.`);
    }

    return {
      published: true,
      operationId,
      pageId: null,
      slug,
      url: publishedUrl,
      mode: "ftp",
      provider: "ucoz-mcp/ftp",
      transportResult: readToolText(result)
    };
  }

  const result = assertToolSuccess(await callUcozTool("templates_tool", {
    action: "page_add",
    page_name: content.seo.title,
    page_message: content.seo.title,
    page_tmpl: ensurePoweredBy(html),
    page_owntmpl: 1,
    page_ownurl: slug,
    page_parent_id: 0,
    page_pending: 0,
    page_access_all: 1,
    page_meta_title: content.seo.title,
    page_meta_description: content.seo.description,
    page_meta_keywords: [product.platform, product.title, product.productId].filter(Boolean).join(", ")
  }), "uCoz Pages API не смог создать страницу.");

  const payload = parseToolPayload(result);
  const toolText = readToolText(result);
  const urlMatch = toolText.match(/https?:\/\/[^\s"'<>]+/i);
  const publishedUrl = payload?.url || payload?.data?.url || urlMatch?.[0] || `${normalizeSiteUrl()}/${slug}`;
  const pageId = payload?.id || payload?.page_id || payload?.data?.id || null;

  return {
    published: true,
    operationId,
    pageId,
    slug,
    url: publishedUrl,
    mode: "mcp",
    provider: "ucoz-mcp"
  };
}
