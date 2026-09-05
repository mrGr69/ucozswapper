import { Check, ExternalLink, Sparkles } from "lucide-react";

function SectionTitle({ children }) {
  return <h3 className="text-xl font-black tracking-[-.035em] text-slate-950">{children}</h3>;
}

export default function LandingPreview({ product, content, aiMode, aiModel, warnings, publication, publishMessage }) {
  const image = content.hero?.image || product.images?.[0];

  return (
    <section className="mt-6 overflow-hidden rounded-[32px] border border-white/90 bg-white/48 shadow-[0_24px_70px_rgba(79,70,229,.10)] backdrop-blur-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/80 bg-white/38 px-5 py-4 sm:px-7">
        <div>
          <p className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[.14em] text-violet-600"><Sparkles size={13} /> AI landing preview</p>
          <p className="mt-1 text-sm font-semibold text-slate-500">{aiMode === "nexus" ? `Nexus Hub · ${aiModel || "Gemini"}` : "Mock fallback"}</p>
        </div>
        {publication?.url && (
          <a href={publication.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-violet-700 focus:outline-hidden focus:ring-4 focus:ring-violet-200">
            Открыть на uCoz <ExternalLink size={15} />
          </a>
        )}
      </div>

      <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[.86fr_1.14fr]">
        <div className="space-y-4">
          {image && <img src={image} alt={product.title} className="h-80 w-full rounded-[28px] border border-white/90 bg-white/72 object-contain p-5 shadow-sm" />}
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-white/90 bg-white/65 px-3 py-1.5 text-xs font-extrabold text-slate-600">{product.platform}</span>
            <span className="rounded-full border border-white/90 bg-white/65 px-3 py-1.5 text-xs font-extrabold text-slate-600">ID {product.productId}</span>
            <span className="rounded-full border border-violet-200 bg-violet-50/80 px-3 py-1.5 text-xs font-extrabold text-violet-700">{product.priceWithoutWallet || product.price || "Цена уточняется"}</span>
          </div>
        </div>

        <div className="space-y-7 rounded-[28px] border border-white/90 bg-white/68 p-5 shadow-[0_14px_40px_rgba(79,70,229,.06)] sm:p-7">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[.12em] text-violet-500">Hero content</p>
            <h2 className="mt-2 text-3xl font-black leading-tight tracking-[-.045em] text-slate-950 sm:text-4xl">{content.hero?.headline}</h2>
            <p className="mt-3 leading-7 text-slate-600">{content.hero?.subheadline}</p>
            <a href={content.cta?.url || product.productUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-violet-600/15 transition hover:-translate-y-0.5 hover:bg-violet-700">
              {content.cta?.text || "Купить на WB"} <ExternalLink size={15} />
            </a>
          </div>

          <div>
            <SectionTitle>Преимущества</SectionTitle>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {(content.benefits || []).map((item) => (
                <li key={item} className="flex gap-2.5 rounded-2xl border border-violet-100/80 bg-violet-50/45 p-3 text-sm font-semibold leading-6 text-slate-700">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700"><Check size={12} strokeWidth={3} /></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {content.specifications?.length > 0 && (
            <div>
              <SectionTitle>Характеристики</SectionTitle>
              <div className="mt-3 divide-y divide-violet-100/70 overflow-hidden rounded-2xl border border-violet-100/80 bg-white/55">
                {content.specifications.map(({ label, value }) => (
                  <div key={`${label}-${value}`} className="grid gap-1 px-4 py-3 text-sm sm:grid-cols-[.8fr_1.2fr]">
                    <span className="font-bold text-slate-400">{label}</span>
                    <span className="font-medium text-slate-700">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.description && <div><SectionTitle>Описание</SectionTitle><p className="mt-3 whitespace-pre-line leading-7 text-slate-600">{product.description}</p></div>}

          {content.faq?.length > 0 && (
            <div>
              <SectionTitle>FAQ</SectionTitle>
              <div className="mt-3 space-y-2">
                {content.faq.map(({ question, answer }) => (
                  <details key={question} className="group rounded-2xl border border-white/90 bg-white/65 p-4 text-sm open:border-violet-200 open:bg-violet-50/40">
                    <summary className="cursor-pointer list-none font-extrabold text-slate-900 marker:hidden">{question}</summary>
                    <p className="mt-2 leading-6 text-slate-600">{answer}</p>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {(warnings?.length > 0 || publishMessage) && (
        <div className="border-t border-white/80 bg-white/35 px-5 py-4 text-xs font-semibold leading-5 text-slate-600 sm:px-7">
          {publishMessage && <p className="mb-2 font-extrabold text-violet-700">{publishMessage}</p>}
          {warnings?.map((warning) => <p key={warning}>⚠ {warning}</p>)}
        </div>
      )}
    </section>
  );
}
