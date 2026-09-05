import { useState } from "react";
import {
  ArrowRight,
  Check,
  Clock3,
  ExternalLink,
  Link2,
  ShieldCheck,
  Sparkles,
  WandSparkles
} from "lucide-react";
import ProductCardPreview from "./components/ProductCardPreview";
import LandingPreview from "./components/LandingPreview";
import LocalAccount from "./components/LocalAccount";
import ZenRowsErrorModal from "./components/ZenRowsErrorModal";
import { loadOrCreateLocalAccount, recordSuccessfulPublication } from "./lib/localAccount";

function BrandMark() {
  return (
    <a href="#top" className="group inline-flex items-center gap-3 focus:outline-hidden" aria-label="UcozSwapper — на главную">
      <span className="grid size-11 place-items-center rounded-[17px] bg-white/65 text-base font-black text-violet-700 shadow-[0_12px_35px_rgba(79,70,229,.12)] backdrop-blur-xl transition group-hover:-translate-y-0.5 group-hover:shadow-[0_16px_42px_rgba(79,70,229,.18)]">
        US
      </span>
      <span className="min-w-0">
        <span className="block text-[15px] font-extrabold tracking-[-.025em] text-slate-950">UcozSwapper</span>
        <span className="block text-[11px] font-medium text-slate-500">Карточка в лендинг за минуту</span>
      </span>
    </a>
  );
}

function ProcessStep({ number, icon: Icon, title, description }) {
  return (
    <div className="sunny-step-card">
      <div className="flex items-start gap-3.5">
        <span className="relative grid size-11 shrink-0 place-items-center rounded-2xl bg-white/65 text-violet-700 shadow-sm backdrop-blur-xl">
          <Icon size={19} strokeWidth={2.2} />
          <span className="absolute -end-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-slate-950 text-[9px] font-black text-white">{number}</span>
        </span>
        <div>
          <p className="font-extrabold tracking-[-.02em] text-slate-950">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
        </div>
      </div>
    </div>
  );
}

function validateProduct(product) {
  const errors = [];
  if (!product) return ["ZenRows не вернул объект карточки."];
  if (product.sourceMode !== "zenrows") errors.push("Источник данных не подтверждён ZenRows.");
  if (product.sourceStatus !== "fetched") errors.push(`ZenRows вернул статус «${product.sourceStatus || "unknown"}», а не подтверждённую карточку.`);
  if (!product.title || product.title === "Товар с Wildberries") errors.push("Не найдено название товара.");
  if (!product.price) errors.push("Не найдена цена товара.");
  if (!product.description) errors.push("Не найдено описание товара.");
  if (!product.productId || product.productId === "unknown") errors.push("Не найден ID товара.");
  if (!Array.isArray(product.images) || product.images.length === 0) errors.push("Не найдены фотографии товара.");
  return errors;
}

export default function App() {
  const [productUrl, setProductUrl] = useState("");
  const [product, setProduct] = useState(null);
  const [landing, setLanding] = useState(null);
  const [publication, setPublication] = useState(null);
  const [account, setAccount] = useState(loadOrCreateLocalAccount);
  const [landingStatus, setLandingStatus] = useState("idle");
  const [publishMessage, setPublishMessage] = useState("");
  const [status, setStatus] = useState("idle");
  const [issues, setIssues] = useState({ errors: [], warnings: [] });

  async function inspectProduct(event) {
    event.preventDefault();
    setProduct(null);
    setLanding(null);
    setPublication(null);
    setPublishMessage("");
    setLandingStatus("idle");
    setIssues({ errors: [], warnings: [] });
    setStatus("loading");

    try {
      const response = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productUrl, marketplace: "wb" })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "ZenRows не смог обработать карточку.");

      const validationErrors = validateProduct(data.product);
      if (validationErrors.length > 0) {
        setIssues({ errors: validationErrors, warnings: data.product?.warnings || [] });
        setStatus("error");
        return;
      }

      setProduct(data.product);
      setStatus("success");
    } catch (error) {
      setIssues({ errors: [error.message], warnings: [] });
      setStatus("error");
    }
  }

  async function generateAndPublish() {
    if (!product) return;
    setLandingStatus("loading");
    setPublication(null);
    setPublishMessage("");
    try {
      const generateResponse = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product })
      });
      const generated = await generateResponse.json();
      if (!generateResponse.ok) throw new Error(generated.error || "Не удалось сгенерировать лендинг.");
      setLanding(generated);
      setLandingStatus("publishing");

      const publishResponse = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, content: generated.content })
      });
      const published = await publishResponse.json();
      if (!publishResponse.ok) throw new Error(published.error || "Не удалось опубликовать лендинг на uCoz.");
      if (!published.published || !published.url) throw new Error("uCoz не подтвердил публичный URL лендинга.");

      const completedPublication = { ...published, model: generated.model };
      setPublication(completedPublication);
      setAccount((current) => recordSuccessfulPublication(current, completedPublication, product));
      setPublishMessage(published.message || "Лендинг опубликован на uCoz.");
      setLandingStatus("success");
    } catch (error) {
      setPublishMessage(error.message);
      setLandingStatus("error");
    }
  }

  const isBusy = status === "loading";
  const isLandingBusy = landingStatus === "loading" || landingStatus === "publishing";

  return (
    <main id="top" className={`ucoz-app relative min-h-screen overflow-hidden pb-48 text-slate-950 sm:pb-40 ${product || isBusy ? "product-active" : ""}`}>
      <div className="sun-orb sun-orb-one" aria-hidden="true" />
      <div className="sun-orb sun-orb-two" aria-hidden="true" />
      <div className="sun-grid" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="py-5 sm:py-7">
          <BrandMark />
        </header>

        {!product && !isBusy && <section className="mx-auto max-w-5xl pb-9 pt-10 text-center sm:pb-12 sm:pt-16">
          <div className="inline-flex items-center gap-x-2 rounded-full bg-white/60 px-3.5 py-2 text-xs font-bold text-violet-700 shadow-sm backdrop-blur-xl">
            <Sparkles size={14} />
            AI-конструктор для продавцов
          </div>
          <h1 className="font-display mx-auto mt-7 max-w-4xl text-4xl leading-[1.02] tracking-[-.035em] text-slate-950 sm:text-6xl lg:text-7xl">
            Получите персональный лендинг за <span className="sunny-gradient-text">1 минуту</span>
          </h1>
          <p className="font-display mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Всего два шага: вы даёте нам карточку Wildberries, а мы возвращаем готовый светлый лендинг с сильным CTA.
          </p>

          <div className="mx-auto mt-9 grid max-w-3xl gap-3 text-left sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <ProcessStep number="1" icon={Link2} title="Вы нам карточку" description="Вставьте публичную ссылку на товар WB." />
            <ArrowRight className="mx-auto hidden text-violet-400 sm:block" size={22} />
            <ProcessStep number="2" icon={WandSparkles} title="Мы вам лендинг" description="AI соберёт страницу и отправит её на uCoz." />
          </div>

          <p className="font-display mx-auto mt-10 max-w-3xl text-sm leading-7 text-slate-500 sm:text-base">
            <strong className="font-extrabold text-slate-900">UcozSwapper</strong> — позволяет за несколько этапов перенести карточку товара с маркетплейса в самостоятельный и полноценный full landing page. Переносите свои карточки товаров просто, быстро и доступно, а остальное мы сделаем за вас!
          </p>
        </section>}

        {isBusy && (
          <section className="product-preview-stage preview-loading grid place-items-center">
            <div className="text-center">
              <span className="mx-auto grid size-12 place-items-center text-violet-600">
                <span className="size-6 animate-spin rounded-full border-[3px] border-violet-200 border-t-violet-600" />
              </span>
              <p className="mt-5 font-extrabold text-slate-900">Собираем карточку</p>
              <p className="mt-1 text-sm text-slate-500">ZenRows получает описание, цену и фотографии…</p>
            </div>
          </section>
        )}

        {product && (
          <section id="product-preview" className="product-preview-stage">
            <div className="product-preview-stack">
              <ProductCardPreview product={product} />
              {landing && <LandingPreview product={product} content={landing.content} aiMode={landing.mode} aiModel={landing.model} warnings={landing.warnings} publication={publication} publishMessage={publishMessage} />}
            </div>
          </section>
        )}
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[65] p-3 sm:p-4">
        <section className="bottom-composer pointer-events-auto mx-auto max-w-5xl rounded-[27px] bg-white/72 p-2.5 shadow-[0_20px_70px_rgba(72,45,118,.19)] backdrop-blur-2xl sm:p-3">
          <form onSubmit={inspectProduct} className="grid gap-2.5 sm:grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_auto_auto]">
            <div className="relative min-w-0">
              <label htmlFor="product-url" className="sr-only">Ссылка на карточку товара Wildberries</label>
              <input
                id="product-url"
                value={productUrl}
                onChange={(event) => setProductUrl(event.target.value)}
                required
                type="url"
                inputMode="url"
                autoComplete="url"
                placeholder="Вставьте ссылку Wildberries…"
                className="block min-h-13 w-full rounded-[19px] bg-white/68 py-3 ps-4 pe-16 text-sm font-semibold text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,.9)] outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-violet-100"
              />
              <span className="wb-pulse absolute end-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-[15px] bg-gradient-to-br from-fuchsia-500 via-violet-600 to-indigo-600 text-xs font-black lowercase text-white shadow-[0_8px_22px_rgba(124,58,237,.25)]" aria-label="Wildberries">wb</span>
            </div>

            <button disabled={isBusy} type="submit" className="inline-flex min-h-13 items-center justify-center gap-x-2 rounded-[19px] bg-violet-600 px-5 text-sm font-extrabold text-white shadow-[0_10px_28px_rgba(124,58,237,.24)] transition hover:-translate-y-0.5 hover:bg-violet-700 focus:outline-hidden focus:ring-4 focus:ring-violet-200 disabled:pointer-events-none disabled:opacity-60">
              {isBusy ? <><span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Анализируем…</> : <>Preview <ArrowRight size={16} /></>}
            </button>

            {product && (
              <button type="button" onClick={generateAndPublish} disabled={isLandingBusy} className="inline-flex min-h-13 items-center justify-center gap-x-2 rounded-[19px] bg-slate-950 px-5 text-sm font-extrabold text-white shadow-[0_10px_28px_rgba(15,23,42,.16)] transition hover:-translate-y-0.5 hover:bg-violet-700 focus:outline-hidden focus:ring-4 focus:ring-violet-200 disabled:pointer-events-none disabled:opacity-60 sm:col-span-2 lg:col-span-1">
                {landingStatus === "loading" ? <><span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Gemini…</> : landingStatus === "publishing" ? <><Clock3 size={16} /> uCoz…</> : <><WandSparkles size={16} /> Создать landing</>}
              </button>
            )}
          </form>

          <div className="mt-2 flex min-h-7 flex-wrap items-center gap-x-4 gap-y-1 px-2 text-[11px] font-semibold text-slate-500">
            <span className="inline-flex items-center gap-1.5"><Check size={12} className="text-emerald-600" /> ZenRows</span>
            <span className="inline-flex items-center gap-1.5"><Sparkles size={12} className="text-violet-600" /> Gemini 3.8 Flash</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck size={12} className="text-sky-600" /> Проверка Product DTO</span>
            {landingStatus === "error" && <span className="font-bold text-rose-600">{publishMessage}</span>}
            {publication?.url && <a href={publication.url} target="_blank" rel="noreferrer" className="ms-auto inline-flex items-center gap-1 font-extrabold text-emerald-700">Лендинг опубликован <ExternalLink size={12} /></a>}
          </div>
        </section>
      </div>

      <LocalAccount account={account} />
      {status === "error" && <ZenRowsErrorModal errors={issues.errors} warnings={issues.warnings} onClose={() => setStatus("idle")} />}
    </main>
  );
}
